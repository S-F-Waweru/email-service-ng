import type { AbstractControl, FormGroup } from '@angular/forms';
import { ApiError } from '../../core/api/api-error';

/**
 * Puts a 400's field messages onto the matching form controls as
 * `{ server: 'message' }`, so they show next to the field.
 * Returns true if at least one field matched.
 */
export function applyServerErrors(form: FormGroup, error: unknown): boolean {
  if (!(error instanceof ApiError) || !error.isValidation) return false;
  let matched = false;
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const control = form.get(field);
    if (!control) continue;
    control.setErrors({ ...control.errors, server: messages[0] });
    control.markAsTouched();
    matched = true;
  }
  return matched;
}

/** The server message for a control, if any. */
export function serverError(control: AbstractControl): string | null {
  const value = control.errors?.['server'];
  return typeof value === 'string' ? value : null;
}
