import { InjectionToken } from '@angular/core';

/**
 * Base URL of the email-service backend.
 * Dev: `/api` is proxied to http://localhost:3000 (proxy.conf.json), so no CORS setup is needed.
 * Prod: serve the app and the API from the same host with `/api` routed to the backend,
 * or provide a full URL here (and add the app's origin to the backend's CORS_ORIGINS).
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
