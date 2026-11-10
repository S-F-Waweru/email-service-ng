import { Validators, type ValidatorFn } from '@angular/forms';

/**
 * Matches the backend's class-validator @IsEmail closely enough to catch the
 * common miss: Angular's Validators.email accepts "admin@example" (no TLD),
 * the backend rejects it.
 */
export const emailValidator: ValidatorFn = Validators.pattern(
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/,
);
