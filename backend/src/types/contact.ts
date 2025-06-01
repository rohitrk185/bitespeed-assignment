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
