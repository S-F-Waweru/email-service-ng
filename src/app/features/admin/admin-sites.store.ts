import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ApiError } from '../../core/api/api-error';
import { AuthStore } from '../../core/auth/auth.store';
import { Notify } from '../../core/notify/notify.service';
import type { AdminSite, CreatedSite, CreateSiteInput, UpdateSiteInput } from './admin.models';

/** Super-admin site management. Provided by AdminSitesPage. */
@Injectable()
export class AdminSitesStore {
  private readonly api = inject(ApiService);
  private readonly notify = inject(Notify);
  private readonly auth = inject(AuthStore);

  private readonly _sites = signal<AdminSite[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiError | null>(null);
  private readonly _busy = signal(false);

  readonly sites = computed(() =>
    [...this._sites()].sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.name.localeCompare(b.name)),
  );
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  /** A create/update/key call is running. */
  readonly busy = this._busy.asReadonly();

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._sites.set(await this.api.get<AdminSite[]>('/admin/sites'));
    } catch (error) {
      this._error.set(ApiError.from(error));
    } finally {
      this._loading.set(false);
    }
  }

  /** Returns the new site and its API key (shown once in the UI). Throws ApiError. */
  async create(input: CreateSiteInput): Promise<CreatedSite> {
    return this.run(async () => {
      const created = await this.api.post<CreatedSite>('/admin/sites', input, { toast: 'Could not create site' });
      this._sites.update((sites) => [...sites, created.site]);
      this.notify.success('Site created', created.site.name);
      await this.refreshCompanies();
      return created;
    });
  }

  async update(id: string, input: UpdateSiteInput): Promise<AdminSite> {
    return this.run(async () => {
      const site = await this.api.patch<AdminSite>(`/admin/sites/${encodeURIComponent(id)}`, input, {
        toast: 'Could not save site',
      });
      this.replace(site);
      this.notify.success('Site saved', site.name);
      if (input.name !== undefined || input.isActive !== undefined) await this.refreshCompanies();
      return site;
    });
  }

  async revealKey(id: string): Promise<string> {
    return this.run(async () => {
      const { apiKey } = await this.api.get<{ apiKey: string }>(`/admin/sites/${encodeURIComponent(id)}/api-key`, {
        toast: 'Could not load the API key',
      });
      return apiKey;
    });
  }

  async rotateKey(id: string): Promise<string> {
    return this.run(async () => {
      const { apiKey } = await this.api.post<{ apiKey: string }>(`/admin/sites/${encodeURIComponent(id)}/rotate-key`, null, {
        toast: 'Could not rotate the API key',
      });
      this.notify.warning('New API key issued', 'The old key no longer works. Update the website now.');
      return apiKey;
    });
  }

  private replace(site: AdminSite): void {
    this._sites.update((sites) => sites.map((s) => (s.id === site.id ? site : s)));
  }

  /** Super-admins see every company in the switcher, so keep it current. */
  private async refreshCompanies(): Promise<void> {
    try {
      await this.auth.refreshProfile();
    } catch {
      // Non-critical: the switcher catches up on next load.
    }
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
