import { computed, inject, Injectable, signal } from '@angular/core';
import type { SiteRef } from '../../core/auth/auth.models';
import { ApiService } from '../../core/api/api.service';
import { ApiError } from '../../core/api/api-error';
import { AuthStore } from '../../core/auth/auth.store';
import { Notify } from '../../core/notify/notify.service';
import type { AdminSite, AdminUser, CreateUserInput, UpdateUserInput } from './admin.models';

/** Super-admin user management. Provided by AdminUsersPage. */
@Injectable()
export class AdminUsersStore {
  private readonly api = inject(ApiService);
  private readonly notify = inject(Notify);
  private readonly auth = inject(AuthStore);

  private readonly _users = signal<AdminUser[]>([]);
  private readonly _sites = signal<SiteRef[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiError | null>(null);
  private readonly _busy = signal(false);
  readonly search = signal('');

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly busy = this._busy.asReadonly();
  /** Every company, for the picker (including inactive ones). */
  readonly sites = this._sites.asReadonly();
  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);

  readonly users = computed(() => {
    const q = this.search().trim().toLowerCase();
    return [...this._users()]
      .filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.fullName.localeCompare(b.fullName));
  });

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      const [users, sites] = await Promise.all([
        this.api.get<AdminUser[]>('/admin/users'),
        this.api.get<AdminSite[]>('/admin/sites'),
      ]);
      this._users.set(users);
      this._sites.set(sites.map((s) => ({ id: s.id, name: s.isActive ? s.name : `${s.name} (inactive)` })));
    } catch (error) {
      this._error.set(ApiError.from(error));
    } finally {
      this._loading.set(false);
    }
  }

  async create(input: CreateUserInput): Promise<AdminUser> {
    return this.run(async () => {
      const user = await this.api.post<AdminUser>('/admin/users', input, { toast: 'Could not create user' });
      this._users.update((users) => [...users, user]);
      this.notify.success('User created', `${user.fullName} can now sign in.`);
      return user;
    });
  }

  async update(id: string, input: UpdateUserInput): Promise<AdminUser> {
    return this.run(async () => {
      const user = await this.api.patch<AdminUser>(`/admin/users/${id}`, input, { toast: 'Could not save user' });
      this._users.update((users) => users.map((u) => (u.id === id ? user : u)));
      this.notify.success('User saved', user.fullName);
      if (id === this.currentUserId()) await this.auth.refreshProfile().catch(() => undefined);
      return user;
    });
  }

  async setPassword(id: string, password: string): Promise<void> {
    return this.run(async () => {
      await this.api.post<void>(`/admin/users/${id}/password`, { password }, { toast: 'Could not reset password' });
      this.notify.success('Password reset', 'Share it with the user securely. Open sessions stay signed in.');
    });
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this._busy.set(true);
    try {
      return await fn();
    } finally {
      this._busy.set(false);
    }
  }
}
