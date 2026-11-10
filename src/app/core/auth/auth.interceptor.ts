import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import { AuthService } from './auth.service';

/** Adds the bearer token to backend calls and signs out on a 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const api = inject(API_BASE_URL);
  if (!req.url.startsWith(api)) return next(req);

  const token = auth.accessToken();
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  const isAuthCall = req.url.startsWith(`${api}/auth/`);

  return next(authed).pipe(
    catchError((error: unknown) => {
      // A 401 on anything but login/me means the token is no longer valid
      // (expired, or the user was deactivated: the backend re-checks every request).
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthCall && token) {
        auth.logout('unauthorized');
      }
      return throwError(() => error);
    }),
  );
};
