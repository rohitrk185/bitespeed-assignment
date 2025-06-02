import { PoolClient } from "pg";
import {
  Contact,
  ContactWithLinkedInfo,
  IdentifyResponsePayload,
} from "../types/contact";

export async function findContactsByEmailOrPhoneWithLinkedInfo(
  client: PoolClient,
  email: string | null | undefined,
  phoneNumber: string | null | undefined
): Promise<ContactWithLinkedInfo[]> {
  if (!email && !phoneNumber) {
    return [];
  }

  // Base query with LEFT JOIN to include linked contact details
  let query = `
    SELECT
      mainContact.id,
      mainContact."phoneNumber",
      mainContact.email,
      mainContact."linkedId",
      mainContact."linkPrecedence",
      mainContact."createdAt",
      mainContact."updatedAt",
      mainContact."deletedAt",
      linkedRefContact.id AS linked_contact_id,
      linkedRefContact."phoneNumber" AS linked_contact_phoneNumber,
      linkedRefContact.email AS linked_contact_email,
      linkedRefContact."linkedId" AS linked_contact_linkedId,
      linkedRefContact."linkPrecedence" AS linked_contact_linkPrecedence,
      linkedRefContact."createdAt" AS linked_contact_createdAt,
      linkedRefContact."updatedAt" AS linked_contact_updatedAt
    FROM 
      "Contact" AS mainContact
    LEFT JOIN 
      "Contact" AS linkedRefContact 
    ON 
      mainContact."linkedId" = linkedRefContact.id AND linkedRefContact."deletedAt" IS NULL
    WHERE 
      mainContact."deletedAt" IS NULL AND (`;

  const params: (string | number)[] = [];

  if (email) {
    params.push(email);
    query += `mainContact."email" = $${params.length}`;
  }

  if (phoneNumber) {
    if (params.length > 0) {
      query += " OR ";
    }
    params.push(phoneNumber);
    query += `mainContact."phoneNumber" = $${params.length}`;
  }

  query += ') ORDER BY mainContact."createdAt" ASC';

  const result = await client.query(query, params);
  return result.rows as ContactWithLinkedInfo[];
}

export async function createContact(
  client: PoolClient,
  email: string | null,
  phoneNumber: string | null,
  linkedId: number | null,
  linkPrecedence: "primary" | "secondary"
): Promise<Contact> {
  const result = await client.query(
    'INSERT INTO "Contact" (email, "phoneNumber", "linkedId", "linkPrecedence", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
    [email, phoneNumber, linkedId, linkPrecedence]
  );
  return result.rows[0];
}

export const createIdentifyContactResponse = (
  primary: Contact,
  secondaries: Contact[]
): IdentifyResponsePayload => {
  const emails = new Set<string>();
  const phoneNumbers = new Set<string>();
  const secondaryContactIds: number[] = [];

  if (primary.email) emails.add(primary.email);
  if (primary.phoneNumber) phoneNumbers.add(primary.phoneNumber);

  for (const contact of secondaries) {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    secondaryContactIds.push(contact.id);
  }

  // Ensure primary's details are first if they exist
  const distinctEmails = [
    ...(primary.email ? [primary.email] : []),
    ...Array.from(emails).filter((e) => e !== primary.email),
  ];
  const distinctPhoneNumbers = [
    ...(primary.phoneNumber ? [primary.phoneNumber] : []),
    ...Array.from(phoneNumbers).filter((p) => p !== primary.phoneNumber),
  ];

  return {
    contact: {
      primaryContactId: primary.id,
      emails: distinctEmails,
      phoneNumbers: distinctPhoneNumbers,
      secondaryContactIds: secondaryContactIds.sort((a, b) => a - b),
    },
  };
};

export async function updateUpdatedAtField(
  client: PoolClient,
  contactId: number
): Promise<void> {
  await client.query('UPDATE "Contact" SET "updatedAt" = NOW() WHERE id = $1', [
    contactId,
  ]);
}

export async function getSecondaryContactsByPrimaryIds(
  client: PoolClient,
  primaryIds: number[]
): Promise<Contact[]> {
  const result = await client.query(
    `SELECT * FROM "Contact" WHERE "linkedId" IN (${primaryIds
      .map((_, i) => `$${i + 1}`)
      .join(",")}) AND "deletedAt" IS NULL`,
    primaryIds
  );
  return result.rows;
}

export async function batchSetSecondaryContacts(
  client: PoolClient,
  contactIds: number[],
  primaryContactId: number
): Promise<void> {
  await client.query(
    `UPDATE "Contact" SET "linkPrecedence" = 'secondary', "linkedId" = $1, "updatedAt" = NOW() WHERE id IN (${contactIds
      .map((_, i) => `$${i + 2}`)
      .join(",")})`,
    [primaryContactId, ...contactIds]
  );
}
