import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  type ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { PageTitleStrategy } from './layout/page-title.strategy';
import { ThemeService } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: TitleStrategy, useExisting: PageTitleStrategy },
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideSpartanHlm(),
    provideAppInitializer(() => {
      // Brand colours, favicon and dark mode before the first render.
      inject(ThemeService);
      // Turn a stored token back into a signed-in user before guards run.
      return inject(AuthService).restore();
    }),
  ],
};
