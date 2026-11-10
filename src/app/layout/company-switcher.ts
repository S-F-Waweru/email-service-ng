import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideCheck, lucideChevronsUpDown, lucideLayers } from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { CompanyContext } from '../core/company/company-context.service';

/** Sidebar header control: pick one company or "All companies". */
@Component({
  selector: 'app-company-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, NgIcon, HlmDropdownMenuImports, HlmSidebarImports],
  providers: [provideIcons({ lucideBuilding2, lucideCheck, lucideChevronsUpDown, lucideLayers })],
  template: `
    <ul hlmSidebarMenu>
      <li hlmSidebarMenuItem>
        @if (company.canSwitch()) {
          <button
            hlmSidebarMenuButton
            size="lg"
            [hlmDropdownMenuTrigger]="menu"
            side="bottom"
            align="start"
            [tooltip]="label()"
          >
            <ng-container *ngTemplateOutlet="current" />
            <ng-icon name="lucideChevronsUpDown" class="ms-auto opacity-60" />
          </button>
        } @else {
          <!-- One company: nothing to switch, so not a button. -->
          <div class="flex h-12 items-center gap-2 overflow-hidden rounded-md p-2 text-xs group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0!">
            <ng-container *ngTemplateOutlet="current" />
          </div>
        }
      </li>
    </ul>

    <ng-template #current>
      <span class="bg-sidebar-primary text-sidebar-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
        <ng-icon [name]="company.selected() ? 'lucideBuilding2' : 'lucideLayers'" />
      </span>
      <span class="grid min-w-0 flex-1 text-start leading-tight">
        <span class="text-sidebar-foreground/60 text-[10px] uppercase tracking-wide">Company</span>
        <span class="truncate font-medium">{{ label() }}</span>
      </span>
    </ng-template>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-60">
        <div hlmDropdownMenuLabel>Show requests for</div>
        <button hlmDropdownMenuItem (triggered)="company.select(null)">
          <ng-icon name="lucideLayers" />
          All companies
          @if (!company.siteId()) {
            <ng-icon name="lucideCheck" class="ms-auto" />
          }
        </button>
        <div hlmDropdownMenuSeparator></div>
        @for (site of company.sites(); track site.id) {
          <button hlmDropdownMenuItem (triggered)="company.select(site.id)">
            <ng-icon name="lucideBuilding2" />
            <span class="truncate">{{ site.name }}</span>
            @if (company.siteId() === site.id) {
              <ng-icon name="lucideCheck" class="ms-auto" />
            }
          </button>
        }
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class CompanySwitcher {
  protected readonly company = inject(CompanyContext);
  protected readonly label = computed(() => this.company.selected()?.name ?? 'All companies');
}
