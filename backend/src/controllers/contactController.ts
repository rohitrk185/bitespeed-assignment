import type { Request, Response, RequestHandler } from "express";
import { executeTransaction } from "../config/db";
import { PoolClient } from "pg";
import {
  createContact,
  createIdentifyContactResponse,
  findContactsByEmailOrPhone,
} from "../helpers/contactHeplers";
import { Contact, IdentifyRequestPayload } from "../types/contact";

export const identifyContact: RequestHandler = async (req, res) => {
  try {
    const { email: requestEmail, phoneNumber: phoneNo } =
      req.body as IdentifyRequestPayload;

    console.log(
      "identifyContact: email:",
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
      let matchingContacts = await findContactsByEmailOrPhone(
        client,
        email,
        phoneNumber
      );

      // Case 1: No matching contacts in DB
      if (matchingContacts.length === 0) {
        const newPrimary = await createContact(
          client,
          email,
          phoneNumber,
          null,
          "primary"
        );
        const response = createIdentifyContactResponse(newPrimary, []);
        return response;
      }

      throw new Error("Unimplemented Error");
    });

    res.status(200).json(result);
    return;
  } catch (error: any) {
    console.error("Error(identifyContact):", error);
    res.status(500).json({ error: error.message });
    return;
  }
};
