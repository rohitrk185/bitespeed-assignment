import type { RequestHandler } from "express";
import { executeTransaction } from "../config/db";
import { PoolClient } from "pg";
import {
  batchSetSecondaryContacts,
  createContact,
  createIdentifyContactResponse,
  findContactsByEmailOrPhoneWithLinkedInfo,
  getSecondaryContactsByPrimaryIds,
  updateUpdatedAtField,
} from "../helpers/contactHeplers";
import {
  Contact,
  ContactLinkPrecedence,
  IdentifyRequestPayload,
} from "../types/contact";

export const identifyContact: RequestHandler = async (req, res) => {
  try {
    const { email: requestEmail, phoneNumber: phoneNo } =
      req.body as IdentifyRequestPayload;

    console.log(
      "\nidentifyContact: email:",
      requestEmail,
      "phoneNumber:",
      phoneNo
    );
    const phoneNumber = phoneNo?.toString() || null;
    const email = requestEmail || null;

    if (!email && !phoneNumber) {
      console.error("Either email or phoneNumber must be provided.");
      res
        .status(400)
        .json({ error: "Either email or phoneNumber must be provided." });
      return;
    }

    const result = await executeTransaction(async (client: PoolClient) => {
      let matchingContacts = await findContactsByEmailOrPhoneWithLinkedInfo(
        client,
        email,
        phoneNumber
      );
      // console.log("got matchingContacts:", matchingContacts);

      // Case 1: No matching contacts in DB
      if (matchingContacts.length === 0) {
        const newPrimary = await createContact(
          client,
          email,
          phoneNumber,
          null,
          "primary"
        );
        // console.log("created newPrimary:", newPrimary);
        const response = createIdentifyContactResponse(newPrimary, []);
        return response;
      }

      // Check if a same exact record exists
      const sameContact = matchingContacts.find(
        (contact) =>
          contact.email === email && contact.phoneNumber === phoneNumber
      );
      // To check for uniqueness.
      // If either of email/phone is false and that field is not null
      // we should create a new contact record
      const isEmailExists = matchingContacts.some(
        (contact) => contact.email === email
      );
      const isPhoneNumberExists = matchingContacts.some(
        (contact) => contact.phoneNumber === phoneNumber
      );

      // Accumulate primary contacts
      // 1) to find the ultimate primary contact
      // 2) to update rest of them to secondary contacts
      const primaryContacts = new Set<Contact>();
      const isPrimaryContactAdded = new Set<number>();
      for (const contact of matchingContacts) {
        if (
          contact.linkPrecedence === "primary" &&
          !isPrimaryContactAdded.has(contact.id)
        ) {
          primaryContacts.add(contact);
          isPrimaryContactAdded.add(contact.id);
        } else if (
          contact.linkedId &&
          !isPrimaryContactAdded.has(contact.linkedId)
        ) {
          const linkedContact: Contact = {
            id: contact.linkedId,
            phoneNumber: contact.linked_contact_phoneNumber,
            email: contact.linked_contact_email,
            linkedId: contact.linked_contact_linkedId,
            linkPrecedence: contact.linked_contact_linkPrecedence,
            createdAt: contact.linked_contact_createdAt,
            updatedAt: contact.linked_contact_updatedAt,
            deletedAt: null,
          };
          primaryContacts.add(linkedContact);
          isPrimaryContactAdded.add(linkedContact.id);
        }
      }
      // console.log("primaryContacts:", primaryContacts);

      // Sorted primary contacts of request
      const primaryContactsArray = Array.from(primaryContacts).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
      // Primary contacts which are not first created
      const newSecondaryContacts: Contact[] = [];
      // get primary contact ids to fetch their secondary contacts
      const primaryContactIds = primaryContactsArray.map((contact, index) => {
        if (index !== 0) {
          newSecondaryContacts.push({
            id: contact.id,
            phoneNumber: contact.phoneNumber,
            email: contact.email,
            linkedId: primaryContactsArray[0].id,
            linkPrecedence: ContactLinkPrecedence.SECONDARY,
            createdAt: contact.createdAt,
            updatedAt: contact.updatedAt,
            deletedAt: null,
          });
        }
        return contact.id;
      });

      // update other primary contacts to secondary
      if (newSecondaryContacts.length > 0) {
        const res = await batchSetSecondaryContacts(
          client,
          newSecondaryContacts.map((contact) => contact.id),
          primaryContactsArray[0].id
        );
        // console.log("batch update set: ", res);
      }

      // if exact record exists, update updatedAt field only
      if (sameContact) {
        await updateUpdatedAtField(client, sameContact.id);
        // console.log("updated sameContact:", sameContact);
        // if request has new info, create a new record
      } else if (
        (!isEmailExists || !isPhoneNumberExists) &&
        email &&
        phoneNumber
      ) {
        const newContact = await createContact(
          client,
          email,
          phoneNumber,
          primaryContactsArray[0].id,
          "secondary"
        );
        // console.log("created new Contact:", newContact);
      }

      // find all secondary records for response
      const secondaryContacts = await getSecondaryContactsByPrimaryIds(
        client,
        primaryContactIds
      );
      // console.log("got secondaryContacts:", secondaryContacts);

      const response = createIdentifyContactResponse(
        primaryContactsArray[0],
        secondaryContacts
      );
      console.log("response:\n", response);
      return response;
    });

    res.status(200).json(result);
    return;
  } catch (error: any) {
    console.error("Error(identifyContact):", error);
    res.status(500).json({ error: error.message });
    return;
  }
};
