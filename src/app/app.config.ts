import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  type ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthStore } from './core/auth/auth.store';
import { GlobalErrorHandler } from './core/errors/global-error-handler';
import { PageTitleStrategy } from './layout/page-title.strategy';
import { ThemeService } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Uncaught errors and rejected promises go to GlobalErrorHandler (toast + console).
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useExisting: PageTitleStrategy },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideSpartanHlm(),
    provideAppInitializer(() => {
      // Brand colours, favicon and dark mode before the first render.
      inject(ThemeService);
      // Turn a stored token back into a signed-in user before guards run.
      return inject(AuthStore).restore();
    }),
  ],
};
