import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideCheck, lucideChevronsUpDown, lucideLayers } from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { CompanyStore } from '../core/company/company.store';

/** Sidebar header control: pick one company or "All companies". */
@Component({
  selector: 'app-company-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, NgIcon, HlmDropdownMenuImports, HlmSidebarImports],
  providers: [provideIcons({ lucideBuilding2, lucideCheck, lucideChevronsUpDown, lucideLayers })],
  templateUrl: './company-switcher.html',
})
export class CompanySwitcher {
  protected readonly company = inject(CompanyStore);
}
