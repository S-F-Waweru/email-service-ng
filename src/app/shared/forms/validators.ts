import { Validators, type ValidatorFn } from '@angular/forms';

/**
 * Matches the backend's class-validator @IsEmail closely enough to catch the
 * common miss: Angular's Validators.email accepts "admin@example" (no TLD),
 * the backend rejects it.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;

export const emailValidator: ValidatorFn = Validators.pattern(EMAIL_PATTERN);

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value);
}
