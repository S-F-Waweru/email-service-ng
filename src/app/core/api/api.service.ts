import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, type Observable } from 'rxjs';
import { Notify } from '../notify/notify.service';
import { API_BASE_URL } from './api.config';
import { ApiError } from './api-error';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface ApiOptions {
  params?: QueryParams;
  /**
   * Error toast. `true` (default): standard title. A string: custom title.
   * `false`: silent; the caller handles it (the error is still thrown).
   */
  toast?: boolean | string;
}

/**
 * The only class that talks HTTP. Stores call it; components call stores.
 * Every failure is thrown as an ApiError, and toasted unless `toast: false`.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly notify = inject(Notify);
  private readonly base = inject(API_BASE_URL);

  get<T>(path: string, options: ApiOptions = {}): Promise<T> {
    return this.send(this.http.get<T>(this.url(path), { params: toParams(options.params) }), options);
  }

  post<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
    return this.send(this.http.post<T>(this.url(path), body ?? null, { params: toParams(options.params) }), options);
  }

  put<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
    return this.send(this.http.put<T>(this.url(path), body ?? null, { params: toParams(options.params) }), options);
  }

  patch<T>(path: string, body?: unknown, options: ApiOptions = {}): Promise<T> {
    return this.send(this.http.patch<T>(this.url(path), body ?? null, { params: toParams(options.params) }), options);
  }

  delete<T = void>(path: string, options: ApiOptions = {}): Promise<T> {
    return this.send(this.http.delete<T>(this.url(path), { params: toParams(options.params) }), options);
  }

  private async send<T>(request: Observable<T>, options: ApiOptions): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch (error) {
      const err = ApiError.from(error);
      if (options.toast !== false) {
        this.notify.error(err, typeof options.toast === 'string' ? options.toast : undefined);
      }
      throw err;
    }
  }

  private url(path: string): string {
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

/** Drops empty values so `?status=` never reaches the backend's validators. */
function toParams(params?: QueryParams): HttpParams | undefined {
  if (!params) return undefined;
  let result = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') result = result.set(key, String(value));
  }
  return result;
}
