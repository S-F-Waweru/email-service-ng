import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { ApiService } from '../../core/api/api.service';
import { ApiError } from '../../core/api/api-error';
import { CompanyStore } from '../../core/company/company.store';
import type { ContactRequest, RequestFilters, RequestPage, RequestStatus } from './requests.models';

const SEARCH_DEBOUNCE_MS = 350;

/**
 * Requests list state. Provided by RequestsPage, so it lives as long as the
 * page. Reloads whenever the company, filters or page change.
 */
@Injectable()
export class RequestsStore {
  private readonly api = inject(ApiService);
  private readonly company = inject(CompanyStore);

  private readonly _filters = signal<RequestFilters>({ status: null, q: '', page: 1, limit: 20 });
  private readonly _page = signal<RequestPage | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<ApiError | null>(null);
  private readonly _selectedId = signal<string | null>(null);
  /** What's typed in the search box; `filters.q` follows it after a pause. */
  readonly searchText = signal('');

  readonly filters = this._filters.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly items = computed(() => this._page()?.items ?? []);
  readonly total = computed(() => this._page()?.total ?? 0);
  readonly isEmpty = computed(() => !this._loading() && !this._error() && this.items().length === 0);
  readonly hasFilters = computed(() => this._filters().status !== null || this._filters().q !== '');
  /** Show the company column only when several companies are listed. */
  readonly showCompany = computed(() => this.company.siteId() === null && this.company.sites().length > 1);
  readonly selected = computed(() => this.items().find((r) => r.id === this._selectedId()) ?? null);

  private searchTimer?: ReturnType<typeof setTimeout>;
  private requestSeq = 0;

  constructor() {
    // Switching company starts again from page 1.
    effect(() => {
      this.company.siteId();
      untracked(() => this._filters.update((f) => (f.page === 1 ? f : { ...f, page: 1 })));
    });

    // Load whenever the company or any filter changes.
    effect(() => {
      const filters = this._filters();
      const siteId = this.company.siteId();
      untracked(() => void this.load(filters, siteId));
    });
  }

  setStatus(status: RequestStatus | null): void {
    this._filters.update((f) => ({ ...f, status, page: 1 }));
  }

  setSearch(text: string): void {
    this.searchText.set(text);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const q = text.trim().slice(0, 100);
      this._filters.update((f) => (f.q === q ? f : { ...f, q, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);
  }

  setPage(page: number): void {
    this._filters.update((f) => (f.page === page ? f : { ...f, page }));
  }

  setLimit(limit: number): void {
    this._filters.update((f) => (f.limit === limit ? f : { ...f, limit, page: 1 }));
  }

  clearFilters(): void {
    clearTimeout(this.searchTimer);
    this.searchText.set('');
    this._filters.update((f) => ({ ...f, status: null, q: '', page: 1 }));
  }

  open(request: ContactRequest): void {
    this._selectedId.set(request.id);
  }

  close(): void {
    this._selectedId.set(null);
  }

  reload(): void {
    void this.load(this._filters(), this.company.siteId());
  }

  private async load(filters: RequestFilters, siteId: string | null): Promise<void> {
    // Only the latest request may update state (typing fast fires several).
    const seq = ++this.requestSeq;
    this._loading.set(true);
    this._error.set(null);
    try {
      const page = await this.api.get<RequestPage>('/requests', {
        params: { siteId, status: filters.status, q: filters.q, page: filters.page, limit: filters.limit },
      });
      if (seq !== this.requestSeq) return;
      // A page past the end (e.g. after filtering): jump to the last page.
      const lastPage = Math.max(1, Math.ceil(page.total / filters.limit));
      if (page.items.length === 0 && filters.page > lastPage) {
        this.setPage(lastPage);
        return;
      }
      this._page.set(page);
    } catch (error) {
      if (seq !== this.requestSeq) return;
      this._error.set(ApiError.from(error)); // toast already shown by ApiService
    } finally {
      if (seq === this.requestSeq) this._loading.set(false);
    }
  }
}
