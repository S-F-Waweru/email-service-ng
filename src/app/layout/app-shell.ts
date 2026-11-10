import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideGlobe, lucideInbox, lucideUsers } from '@ng-icons/lucide';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AuthService } from '../core/auth/auth.service';
import { CompanyContext } from '../core/company/company-context.service';
import { BrandLogo } from '../theme/brand-logo';
import { ThemeToggle } from '../theme/theme-toggle';
import { CompanySwitcher } from './company-switcher';
import { NAV } from './nav';
import { PageTitleStrategy } from './page-title.strategy';
import { UserMenu } from './user-menu';

/** Signed-in layout: collapsible sidebar + top bar + page. */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmSidebarImports,
    HlmSeparator,
    BrandLogo,
    ThemeToggle,
    CompanySwitcher,
    UserMenu,
  ],
  providers: [provideIcons({ lucideInbox, lucideBuilding2, lucideGlobe, lucideUsers })],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar collapsible="icon">
        <div hlmSidebarHeader class="gap-3">
          <a routerLink="/" class="flex h-10 items-center px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <app-brand-logo class="h-7 group-data-[collapsible=icon]:hidden" />
            <app-brand-logo variant="secondary" class="hidden h-7 group-data-[collapsible=icon]:inline-flex" />
          </a>
          <app-company-switcher />
        </div>

        <div hlmSidebarContent>
          @for (group of nav(); track group.label) {
            <div hlmSidebarGroup>
              <div hlmSidebarGroupLabel>{{ group.label }}</div>
              <div hlmSidebarGroupContent>
                <ul hlmSidebarMenu>
                  @for (item of group.items; track item.path) {
                    <li hlmSidebarMenuItem>
                      <a
                        hlmSidebarMenuButton
                        [routerLink]="item.path"
                        routerLinkActive
                        #rla="routerLinkActive"
                        [isActive]="rla.isActive"
                        [tooltip]="item.label"
                      >
                        <ng-icon [name]="item.icon" />
                        <span>{{ item.label }}</span>
                      </a>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }
        </div>

        <div hlmSidebarFooter>
          <app-user-menu />
        </div>
      </hlm-sidebar>

      <main hlmSidebarInset>
        <header class="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
          <button hlmSidebarTrigger class="-ms-1"></button>
          <div hlmSeparator orientation="vertical" class="me-1 h-4"></div>
          <nav aria-label="Breadcrumb" class="flex min-w-0 items-center gap-1.5 text-sm">
            <span class="text-muted-foreground truncate">{{ company.selected()?.name ?? 'All companies' }}</span>
            <span class="text-muted-foreground/50">/</span>
            <span class="truncate font-medium">{{ titles.pageTitle() }}</span>
          </nav>
          <app-theme-toggle class="ms-auto" />
        </header>

        <div class="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AppShell {
  private readonly auth = inject(AuthService);
  protected readonly company = inject(CompanyContext);
  protected readonly titles = inject(PageTitleStrategy);

  protected readonly nav = computed(() =>
    NAV.filter((group) => !group.superAdminOnly || this.auth.isSuperAdmin()),
  );
}
