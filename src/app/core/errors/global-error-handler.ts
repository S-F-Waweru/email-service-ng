import { ErrorHandler, inject, Injectable } from '@angular/core';
import { ApiError } from '../api/api-error';
import { Notify } from '../notify/notify.service';

/**
 * Last line of defence: anything thrown and not caught (including rejected
 * promises) is logged and, unless it was already shown, toasted.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notify = inject(Notify);

  handleError(error: unknown): void {
    const cause = unwrap(error);
    console.error(cause);
    if (cause instanceof ApiError) {
      this.notify.error(cause); // no-op if already shown
      return;
    }
    this.notify.error(new ApiError(-1, 'Something went wrong', ['An unexpected error occurred. Try again or reload the page.']));
  }
}

/** Zone/promise wrappers put the real error in `.rejection`. */
function unwrap(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'rejection' in error
    ? (error as { rejection: unknown }).rejection
    : error;
}
