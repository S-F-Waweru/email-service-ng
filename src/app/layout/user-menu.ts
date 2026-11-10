import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown, lucideLogOut, lucidePalette, lucideShieldCheck } from '@ng-icons/lucide';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { AuthService } from '../core/auth/auth.service';

/** Sidebar footer: who is signed in, and sign out. */
@Component({
  selector: 'app-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, RouterLink, HlmDropdownMenuImports, HlmSidebarImports],
  providers: [provideIcons({ lucideChevronsUpDown, lucideLogOut, lucidePalette, lucideShieldCheck })],
  template: `
    <ul hlmSidebarMenu>
      <li hlmSidebarMenuItem>
        <button hlmSidebarMenuButton size="lg" [hlmDropdownMenuTrigger]="menu" side="top" align="start" [tooltip]="user()?.fullName ?? ''">
          <span class="bg-sidebar-accent text-sidebar-accent-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {{ initials() }}
          </span>
          <span class="grid min-w-0 flex-1 text-start leading-tight">
            <span class="truncate font-medium">{{ user()?.fullName }}</span>
            <span class="text-sidebar-foreground/60 truncate text-[11px]">{{ user()?.email }}</span>
          </span>
          <ng-icon name="lucideChevronsUpDown" class="ms-auto opacity-60" />
        </button>
      </li>
    </ul>

    <ng-template #menu>
      <hlm-dropdown-menu class="w-60">
        <div hlmDropdownMenuLabel class="grid gap-0.5 font-normal">
          <span class="text-foreground font-medium">{{ user()?.fullName }}</span>
          <span class="text-muted-foreground text-xs">{{ user()?.email }}</span>
          @if (auth.isSuperAdmin()) {
            <span class="text-primary mt-1 flex items-center gap-1 text-xs">
              <ng-icon name="lucideShieldCheck" /> Administrator
            </span>
          }
        </div>
        <div hlmDropdownMenuSeparator></div>
        @if (auth.isSuperAdmin()) {
          <a hlmDropdownMenuItem routerLink="/theme">
            <ng-icon name="lucidePalette" />
            Theme lab
          </a>
        }
        <button hlmDropdownMenuItem (triggered)="auth.logout()">
          <ng-icon name="lucideLogOut" />
          Sign out
        </button>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class UserMenu {
  protected readonly auth = inject(AuthService);
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
