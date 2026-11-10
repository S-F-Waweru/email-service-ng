import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { Notify } from '../notify/notify.service';
import { AuthStore } from './auth.store';

/** Signed-in users only; others go to /login and come back afterwards. */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthStore).isLoggedIn()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

/** The login page: already signed-in users skip it. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthStore).isLoggedIn() ? inject(Router).createUrlTree(['/']) : true;

/** /admin pages. The backend enforces this too; this just avoids a dead page. */
export const superAdminGuard: CanActivateFn = () => {
  if (inject(AuthStore).isSuperAdmin()) return true;
  inject(Notify).warning('Administrators only', 'You don’t have access to that page.');
  return inject(Router).createUrlTree(['/']);
};
