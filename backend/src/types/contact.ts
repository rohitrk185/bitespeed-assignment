export enum ContactLinkPrecedence {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: ContactLinkPrecedence;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// New interface for the return type, including fields for the linked contact
export interface ContactWithLinkedInfo extends Contact {
  linked_contact_id: number;
  linked_contact_phoneNumber: string | null;
  linked_contact_email: string | null;
  linked_contact_linkedId: number | null;
  linked_contact_linkPrecedence: ContactLinkPrecedence;
  linked_contact_createdAt: Date;
  linked_contact_updatedAt: Date;
}

export interface IdentifyRequestPayload {
  email?: string;
  phoneNumber?: number;
}

export interface IdentifyResponsePayload {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}
