import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ApiError } from '../../core/api/api-error';
import { CompanyStore } from '../../core/company/company.store';
import { Notify } from '../../core/notify/notify.service';
import { isEmail } from '../../shared/forms/validators';
import { type CcChange, type CompanySite, MAX_CC } from './companies.models';

/**
 * Companies page state: the user's companies and an unsaved CC draft per
 * company. Provided by CompaniesPage.
 */
@Injectable()
export class CompaniesStore {
  private readonly api = inject(ApiService);
  private readonly notify = inject(Notify);
  private readonly company = inject(CompanyStore);

  private readonly _sites = signal<CompanySite[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiError | null>(null);
  /** siteId -> edited CC list. Only present while it differs from saved. */
  private readonly _drafts = signal<Record<string, string[]>>({});
  private readonly _saving = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly saving = this._saving.asReadonly();

  /** Follows the company switcher: one company, or all of them. */
  readonly sites = computed(() => {
    const id = this.company.siteId();
    const all = this._sites();
    return id ? all.filter((s) => s.id === id) : all;
  });

  readonly hiddenCount = computed(() => this._sites().length - this.sites().length);

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._sites.set(await this.api.get<CompanySite[]>('/sites'));
    } catch (error) {
      this._error.set(ApiError.from(error));
    } finally {
      this._loading.set(false);
    }
  }

  ccFor(siteId: string): string[] {
    return this._drafts()[siteId] ?? this.saved(siteId);
  }

  isDirty(siteId: string): boolean {
    return siteId in this._drafts();
  }

  changes(siteId: string): CcChange {
    const before = this.saved(siteId);
    const after = this.ccFor(siteId);
    return {
      added: after.filter((e) => !before.includes(e)),
      removed: before.filter((e) => !after.includes(e)),
    };
  }

  /** Returns an error message, or null if added. */
  addCc(siteId: string, raw: string): string | null {
    const email = raw.trim().toLowerCase();
    const site = this._sites().find((s) => s.id === siteId);
    const current = this.ccFor(siteId);
    if (!email) return null;
    if (!isEmail(email)) return 'Enter a full email address, like name@company.com.';
    if (current.includes(email)) return 'That address is already on the list.';
    if (site && email === site.recipient.toLowerCase()) return 'That is the main recipient; it already gets every email.';
    if (current.length >= MAX_CC) return `You can CC up to ${MAX_CC} addresses.`;
    this.setDraft(siteId, [...current, email]);
    return null;
  }

  removeCc(siteId: string, email: string): void {
    this.setDraft(siteId, this.ccFor(siteId).filter((e) => e !== email));
  }

  discard(siteId: string): void {
    this._drafts.update((drafts) => {
      const next = { ...drafts };
      delete next[siteId];
      return next;
    });
  }

  async save(siteId: string): Promise<boolean> {
    if (!this.isDirty(siteId) || this._saving()) return false;
    this._saving.set(siteId);
    try {
      const updated = await this.api.put<CompanySite>(`/sites/${encodeURIComponent(siteId)}/cc`, {
        cc: this.ccFor(siteId),
      }, { toast: 'Could not save CC list' });
      this._sites.update((sites) => sites.map((s) => (s.id === siteId ? updated : s)));
      this.discard(siteId);
      this.notify.success('CC list saved', `New emails for ${updated.name} will use it.`);
      return true;
    } catch {
      return false; // toast shown by ApiService; the draft is kept so nothing is lost
    } finally {
      this._saving.set(null);
    }
  }

  private saved(siteId: string): string[] {
    return this._sites().find((s) => s.id === siteId)?.cc ?? [];
  }

  /** Stores the draft, or drops it when it matches what's saved again. */
  private setDraft(siteId: string, cc: string[]): void {
    const saved = this.saved(siteId);
    const same = cc.length === saved.length && cc.every((e, i) => e === saved[i]);
    if (same) this.discard(siteId);
    else this._drafts.update((d) => ({ ...d, [siteId]: cc }));
  }
}
