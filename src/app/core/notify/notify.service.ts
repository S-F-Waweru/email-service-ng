import { Injectable } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ApiError } from '../api/api-error';

/** The one place that shows toasts, so wording and durations stay consistent. */
@Injectable({ providedIn: 'root' })
export class Notify {
  success(title: string, description?: string): void {
    toast.success(title, { description });
  }

  info(title: string, description?: string): void {
    toast.info(title, { description });
  }

  warning(title: string, description?: string): void {
    toast.warning(title, { description });
  }

  /** Shows an error once; later calls with the same ApiError are ignored. */
  error(error: unknown, title?: string): void {
    const err = ApiError.from(error);
    if (err.notified) return;
    err.notified = true;
    toast.error(title ?? err.title, {
      description: err.messages.length > 1 ? err.messages.map((m) => `• ${m}`).join('\n') : err.messages[0],
      // Validation lists take longer to read.
      duration: err.messages.length > 1 ? 8000 : 5000,
    });
  }
}
