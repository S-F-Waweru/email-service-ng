import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import type { SiteRef } from '../auth/auth.models';
import { AuthStore } from '../auth/auth.store';

const KEY = 'selected-company';

/**
 * Which company the dashboard shows. `siteId()` null = all of the user's
 * companies. Feature stores pass it to the API as `?siteId=`.
 */
@Injectable({ providedIn: 'root' })
export class CompanyStore {
  private readonly auth = inject(AuthStore);

  readonly sites = computed<SiteRef[]>(() => this.auth.user()?.sites ?? []);

  /** Resets if the remembered company is no longer one of the user's. */
  readonly siteId = linkedSignal<SiteRef[], string | null>({
    source: this.sites,
    computation: (sites, previous) => {
      const wanted = previous ? previous.value : readStored();
      if (sites.length === 1) return sites[0].id;
      return wanted && sites.some((s) => s.id === wanted) ? wanted : null;
    },
  });

  readonly selected = computed(() => this.sites().find((s) => s.id === this.siteId()) ?? null);
  readonly label = computed(() => this.selected()?.name ?? 'All companies');
  readonly canSwitch = computed(() => this.sites().length > 1);

  select(siteId: string | null): void {
    this.siteId.set(siteId);
    try {
      if (siteId) localStorage.setItem(KEY, siteId);
      else localStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }
}

function readStored(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
