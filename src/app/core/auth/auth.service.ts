import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import type { CurrentUser, LoginRequest, LoginResponse } from './auth.models';
import { clearToken, readToken, type StoredToken, writeToken } from './token.storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = inject(API_BASE_URL);

  private readonly token = signal<StoredToken | null>(readToken());
  private readonly _user = signal<CurrentUser | null>(null);
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isSuperAdmin = computed(() => this._user()?.role === 'super_admin');

  accessToken(): string | null {
    return this.token()?.accessToken ?? null;
  }

  /** Runs once at startup: turns a stored token back into a logged-in user. */
  async restore(): Promise<void> {
    const token = this.token();
    if (!token) return;
    try {
      this._user.set(await firstValueFrom(this.http.get<CurrentUser>(`${this.api}/auth/me`)));
      this.scheduleExpiry(token.expiresAt);
    } catch (error) {
      // 401: token revoked/user deactivated. Anything else: server unreachable;
      // either way the guard sends them to the login page.
      if (error instanceof HttpErrorResponse && error.status === 401) this.clear();
    }
  }

  async login(credentials: LoginRequest): Promise<CurrentUser> {
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${this.api}/auth/login`, credentials),
    );
    const token = { accessToken: res.accessToken, expiresAt: Date.now() + res.expiresIn * 1000 };
    writeToken(token);
    this.token.set(token);
    this._user.set(res.user);
    this.scheduleExpiry(token.expiresAt);
    return res.user;
  }

  /** Re-read the profile, e.g. after an admin changed this user's companies. */
  async refreshProfile(): Promise<void> {
    this._user.set(await firstValueFrom(this.http.get<CurrentUser>(`${this.api}/auth/me`)));
  }

  logout(reason?: 'expired' | 'unauthorized'): void {
    const returnUrl = reason ? this.router.url : undefined;
    this.clear();
    if (reason === 'expired') toast.info('Your session expired. Please sign in again.');
    if (reason === 'unauthorized') toast.error('You were signed out. Please sign in again.');
    void this.router.navigate(['/login'], {
      queryParams: returnUrl && !returnUrl.startsWith('/login') ? { returnUrl } : {},
    });
  }

  private clear(): void {
    clearTimeout(this.expiryTimer);
    clearToken();
    this.token.set(null);
    this._user.set(null);
  }

  private scheduleExpiry(expiresAt: number): void {
    clearTimeout(this.expiryTimer);
    // setTimeout overflows above ~24.8 days; tokens are far shorter, but be safe.
    const delay = Math.min(expiresAt - Date.now(), 2 ** 31 - 1);
    this.expiryTimer = setTimeout(() => this.logout('expired'), Math.max(delay, 0));
  }
}
