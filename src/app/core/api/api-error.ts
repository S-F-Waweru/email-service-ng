import { HttpErrorResponse } from '@angular/common/http';

/** The backend's uniform error body (AllExceptionsFilter). */
export interface ApiErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  /** A sentence, or one entry per failed field from ValidationPipe. */
  message: string | string[];
}

/** One readable sentence (or list) for the UI, whatever went wrong. */
export function errorMessages(error: unknown): string[] {
  if (!(error instanceof HttpErrorResponse)) {
    return ['Something went wrong. Please try again.'];
  }
  if (error.status === 0) {
    return ['Cannot reach the server. Check your connection and try again.'];
  }
  if (error.status === 429) {
    return ['Too many requests. Wait a minute and try again.'];
  }
  const body = error.error as Partial<ApiErrorBody> | null;
  const message = body?.message;
  if (Array.isArray(message) && message.length) return message.map(capitalize);
  if (typeof message === 'string' && message) return [capitalize(message)];
  if (error.status >= 500) return ['The server had a problem. Please try again shortly.'];
  return [error.statusText || 'Request failed.'];
}

export function errorMessage(error: unknown): string {
  return errorMessages(error).join(' ');
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
