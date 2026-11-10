import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideRefreshCw } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { CompanyStore } from '../../core/company/company.store';
import { PageHeader } from '../../shared/page-header';
import { CompaniesStore } from './companies.store';
import { CompanyCcCard } from './company-cc-card';

@Component({
  selector: 'app-companies-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton, HlmEmptyImports, HlmSkeleton, PageHeader, CompanyCcCard],
  providers: [CompaniesStore, provideIcons({ lucideBuilding2, lucideRefreshCw })],
  templateUrl: './companies.page.html',
})
export class CompaniesPage implements OnInit {
  protected readonly store = inject(CompaniesStore);
  protected readonly company = inject(CompanyStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
