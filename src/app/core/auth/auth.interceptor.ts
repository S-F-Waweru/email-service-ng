import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AuthStore } from './auth.store';

/**
 * Adds the bearer token to API calls. A 401 on a signed-in call means the
 * session ended (expired, or the user was deactivated: the backend re-checks
 * every request), so sign out. ApiService shows the toast.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const api = inject(API_BASE_URL);
  if (!req.url.startsWith(api)) return next(req);

  const token = auth.accessToken();
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  const isAuthCall = req.url.startsWith(`${api}/auth/`);

  return next(authed).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isAuthCall) {
        auth.logout({ returnTo: true });
      }
      return throwError(() => error);
    }),
  );
};
