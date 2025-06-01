import { PoolClient } from "pg";
import { Contact, IdentifyResponsePayload } from "../types/contact";

export async function findContactsByEmailOrPhone(
  client: PoolClient,
  email: string | null | undefined,
  phoneNumber: string | null | undefined
): Promise<Contact[]> {
  if (!email && !phoneNumber) return [];
  let query = 'SELECT * FROM "Contact" WHERE "deletedAt" IS NULL AND (';
  const params = [];

  if (email) {
    params.push(email);
    query += `"email" = $${params.length}`;
  }
  if (phoneNumber) {
    if (params.length > 0) {
      query += " OR ";
    }
    params.push(phoneNumber);
    query += `"phoneNumber" = $${params.length}`;
  }
  query += ') ORDER BY "createdAt" ASC';

  const result = await client.query(query, params);
  return result.rows;
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
