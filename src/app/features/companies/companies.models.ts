/** GET /sites item (backend CompanySiteView). */
export interface CompanySite {
  id: string;
  name: string;
  /** Main address contact emails go to. Set by an administrator. */
  recipient: string;
  cc: string[];
  isActive: boolean;
}

/** Backend MAX_CC_RECIPIENTS. */
export const MAX_CC = 10;

export interface CcChange {
  added: string[];
  removed: string[];
}
