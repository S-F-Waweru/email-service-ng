import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from './auth.service';

/** Logged-in users only; others go to /login and come back afterwards. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** The login page: already signed-in users skip it. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/']) : true;

/** /admin pages. The backend enforces this too; this just avoids a dead page. */
export const superAdminGuard: CanActivateFn = () => {
  if (inject(AuthService).isSuperAdmin()) return true;
  toast.error('That page is for administrators only.');
  return inject(Router).createUrlTree(['/']);
};
