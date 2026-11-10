import { HttpErrorResponse } from '@angular/common/http';

/** The backend's uniform error body (AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  /** A sentence, or one entry per failed field (ValidationPipe). */
  message: string | string[];
}

const TITLES: Record<number, string> = {
  0: "Can't reach the server",
  400: 'Please check your input',
  401: 'Signed out',
  403: 'Not allowed',
  404: 'Not found',
  409: 'Already exists',
  413: 'Too large',
  429: 'Too many requests',
};

/**
 * Every failed API call is turned into one of these, so components and stores
 * deal with a single shape: a status, a short title and readable messages.
 */
export class ApiError extends Error {
  /** Set once a toast has been shown, so the global handler doesn't show it again. */
  notified = false;

  constructor(
    readonly status: number,
    readonly title: string,
    readonly messages: string[],
    readonly body: Partial<ApiErrorBody> | null = null,
  ) {
    super(messages.join(' '));
    this.name = 'ApiError';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (!(error instanceof HttpErrorResponse)) {
      return new ApiError(-1, 'Something went wrong', [
        error instanceof Error ? error.message : 'Unexpected error.',
      ]);
    }

    const status = error.status;
    const body = isErrorBody(error.error) ? error.error : null;
    const title = TITLES[status] ?? (status >= 500 ? 'Server error' : 'Request failed');

    let messages: string[];
    if (status === 0) {
      messages = ['Check your connection, or that the API is running, and try again.'];
    } else if (status === 429) {
      messages = ['Wait a minute and try again.'];
    } else if (body && Array.isArray(body.message) && body.message.length) {
      messages = body.message.map(sentence);
    } else if (body && typeof body.message === 'string' && body.message) {
      messages = [sentence(body.message)];
    } else if (status >= 500) {
      messages = ['The server had a problem. Please try again shortly.'];
    } else {
      messages = [error.statusText || 'Request failed.'];
    }
    return new ApiError(status, title, messages, body);
  }

  get isValidation(): boolean {
    return this.status === 400;
  }

  /**
   * Validation messages grouped by field. class-validator messages start with
   * the property path: "email must be an email", "cc.0 must be an email".
   */
  get fieldErrors(): Record<string, string[]> {
    const fields: Record<string, string[]> = {};
    if (!this.isValidation) return fields;
    for (const message of this.messages) {
      const match = /^([a-zA-Z][\w]*)(?:\.\d+)*\s/.exec(message);
      if (match) (fields[match[1]] ??= []).push(message);
    }
    return fields;
  }
}

function isErrorBody(value: unknown): value is Partial<ApiErrorBody> {
  return typeof value === 'object' && value !== null && 'message' in value;
}

const sentence = (s: string) => {
  const t = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(t) ? t : `${t}.`;
};
