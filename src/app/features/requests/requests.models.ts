export const REQUEST_STATUSES = ['pending', 'queued', 'sent', 'failed', 'cancelled'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** GET /requests item and GET /requests/:id (backend RequestView). Dates are ISO strings. */
export interface ContactRequest {
  id: string;
  siteId: string;
  siteName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  company: string | null;
  subject: string | null;
  message: string;
  status: RequestStatus;
  createdAt: string;
  delivery: {
    deliveredTo: string | null;
    cc: string[];
    sentAt: string | null;
    attempts: number;
    maxAttempts: number;
    /** Failed but will be retried automatically. */
    willRetry: boolean;
    /** Not sent yet and more attempts may follow: POST /requests/:id/stop is allowed. */
    canStop: boolean;
    lastAttemptAt: string | null;
    lastError: string | null;
  };
}

export interface RequestPage {
  items: ContactRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface RequestFilters {
  status: RequestStatus | null;
  q: string;
  page: number;
  limit: number;
}
