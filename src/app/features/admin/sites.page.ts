import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsis,
  lucideGlobe,
  lucideKeyRound,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideRotateCw,
} from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { PageHeader } from '../../shared/page-header';
import type { AdminSite, CreatedSite } from './admin.models';
import { AdminSitesStore } from './admin-sites.store';
import { ApiKeyDialog } from './api-key-dialog';
import { SiteFormDialog } from './site-form-dialog';

interface ShownKey {
  key: string;
  site: AdminSite;
  reason: 'created' | 'rotated' | 'revealed';
}

@Component({
  selector: 'app-admin-sites-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButton,
    HlmDropdownMenuImports,
    HlmEmptyImports,
    HlmSkeleton,
    HlmSpinner,
    HlmTableImports,
    PageHeader,
    ApiKeyDialog,
    SiteFormDialog,
  ],
  providers: [
    AdminSitesStore,
    provideIcons({ lucideEllipsis, lucideGlobe, lucideKeyRound, lucidePencil, lucidePlus, lucideRefreshCw, lucideRotateCw }),
  ],
  templateUrl: './sites.page.html',
})
export class AdminSitesPage implements OnInit {
  protected readonly store = inject(AdminSitesStore);

  /** Form dialog: 'new', a site to edit, or closed. */
  protected readonly editing = signal<AdminSite | 'new' | null>(null);
  protected readonly shownKey = signal<ShownKey | null>(null);
  protected readonly rotating = signal<AdminSite | null>(null);
  protected readonly skeletonRows = [1, 2, 3];

  ngOnInit(): void {
    void this.store.load();
  }

  protected editSite(): AdminSite | null {
    const value = this.editing();
    return value === 'new' ? null : value;
  }

  protected onCreated(created: CreatedSite): void {
    this.shownKey.set({ key: created.apiKey, site: created.site, reason: 'created' });
  }

  protected async reveal(site: AdminSite): Promise<void> {
    try {
      this.shownKey.set({ key: await this.store.revealKey(site.id), site, reason: 'revealed' });
    } catch {
      // toast shown by ApiService
    }
  }

  protected async confirmRotate(): Promise<void> {
    const site = this.rotating();
    if (!site) return;
    try {
      const key = await this.store.rotateKey(site.id);
      this.rotating.set(null);
      this.shownKey.set({ key, site, reason: 'rotated' });
    } catch {
      // toast shown; keep the dialog open
    }
  }

  protected onRotateState(state: string): void {
    if (state === 'closed') this.rotating.set(null);
  }
}
