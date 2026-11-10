/** GET /sites item (backend CompanySiteView). */
export interface CompanySite {
  id: string;
  name: string;
  /** Main address contact emails go to. Set by an administrator. */
  recipient: string;
  cc: string[];
  isActive: boolean;
  /** Sender shown on contact emails; null = the service's default sender. */
  from: string | null;
  /** Sends through its own mail server, so a sender is required. */
  hasOwnSmtp: boolean;
}

/** PATCH /sites/:id. Only name and sender are editable by company users. */
export interface CompanySettingsInput {
  name?: string;
  /** null clears it back to the default sender. */
  from?: string | null;
}

/** Backend MAX_CC_RECIPIENTS. */
export const MAX_CC = 10;

export interface CcChange {
  added: string[];
  removed: string[];
}
