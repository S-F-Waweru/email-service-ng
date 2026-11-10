import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown, lucideLogOut, lucidePalette, lucideShieldCheck } from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AuthStore } from '../core/auth/auth.store';

/** Sidebar footer: who is signed in, and sign out. */
@Component({
  selector: 'app-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, RouterLink, HlmDropdownMenuImports, HlmSidebarImports],
  providers: [provideIcons({ lucideChevronsUpDown, lucideLogOut, lucidePalette, lucideShieldCheck })],
  templateUrl: './user-menu.html',
})
export class UserMenu {
  protected readonly auth = inject(AuthStore);
  protected readonly user = this.auth.user;
  protected readonly initials = computed(() =>
    (this.user()?.fullName ?? '?')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]!.toUpperCase())
      .join(''),
  );
}
