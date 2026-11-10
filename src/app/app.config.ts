import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Create the theme service at startup so brand colours, logo favicon and
    // dark mode are in place before the first page renders.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
  ],
};
