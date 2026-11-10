import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { ApiError } from '../api/api-error';
import { Notify } from '../notify/notify.service';
import type { CurrentUser, LoginRequest, LoginResponse } from './auth.models';
import { clearToken, readToken, type StoredToken, writeToken } from './token.storage';

/** Who is signed in. State lives here; components read the signals. */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(Notify);

  private readonly token = signal<StoredToken | null>(readToken());
  private readonly _user = signal<CurrentUser | null>(null);
  private readonly _loggingIn = signal(false);
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly user = this._user.asReadonly();
  readonly loggingIn = this._loggingIn.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isSuperAdmin = computed(() => this._user()?.role === 'super_admin');

  accessToken(): string | null {
    return this.token()?.accessToken ?? null;
  }

  /** Startup: turn a stored token back into a signed-in user. Silent on failure. */
  async restore(): Promise<void> {
    const token = this.token();
    if (!token) return;
    try {
      this._user.set(await this.api.get<CurrentUser>('/auth/me', { toast: false }));
      this.scheduleExpiry(token.expiresAt);
    } catch (error) {
      // 401: token no longer valid. Otherwise the API is unreachable; keep the
      // token so a reload works once it's back. Either way the guard shows login.
      if (error instanceof ApiError && error.status === 401) this.clear();
    }
  }

  /** Throws ApiError (already toasted) on failure. */
  async login(credentials: LoginRequest): Promise<CurrentUser> {
    this._loggingIn.set(true);
    try {
      const res = await this.api.post<LoginResponse>('/auth/login', credentials, { toast: 'Sign-in failed' });
      const token = { accessToken: res.accessToken, expiresAt: Date.now() + res.expiresIn * 1000 };
      writeToken(token);
      this.token.set(token);
      this._user.set(res.user);
      this.scheduleExpiry(token.expiresAt);
      return res.user;
    } finally {
      this._loggingIn.set(false);
    }
  }

  /** Re-read the profile, e.g. after an admin changed this user's companies. */
  async refreshProfile(): Promise<void> {
    this._user.set(await this.api.get<CurrentUser>('/auth/me'));
  }

  /**
   * `returnTo`: come back to the current page after signing in again
   * (used when the session ends on its own, not on a deliberate sign-out).
   */
  logout(options: { returnTo?: boolean } = {}): void {
    const current = this.router.url;
    this.clear();
    const returnUrl = options.returnTo && !current.startsWith('/login') ? current : undefined;
    void this.router.navigate(['/login'], { queryParams: returnUrl ? { returnUrl } : {} });
  }

  private clear(): void {
    clearTimeout(this.expiryTimer);
    clearToken();
    this.token.set(null);
    this._user.set(null);
  }

  private scheduleExpiry(expiresAt: number): void {
    clearTimeout(this.expiryTimer);
    const delay = Math.max(Math.min(expiresAt - Date.now(), 2 ** 31 - 1), 0);
    this.expiryTimer = setTimeout(() => {
      this.notify.info('Session expired', 'Please sign in again.');
      this.logout({ returnTo: true });
    }, delay);
  }
}
