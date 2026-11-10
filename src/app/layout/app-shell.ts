import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBuilding2, lucideGlobe, lucideInbox, lucideUsers } from '@ng-icons/lucide';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AuthStore } from '../core/auth/auth.store';
import { CompanyStore } from '../core/company/company.store';
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
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly auth = inject(AuthStore);
  protected readonly company = inject(CompanyStore);
  protected readonly titles = inject(PageTitleStrategy);

  protected readonly nav = computed(() =>
    NAV.filter((group) => !group.superAdminOnly || this.auth.isSuperAdmin()),
  );
}
