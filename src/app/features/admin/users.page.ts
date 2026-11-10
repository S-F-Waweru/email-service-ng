import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, type OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsis,
  lucideKeyRound,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldCheck,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { PageHeader } from '../../shared/page-header';
import type { AdminUser } from './admin.models';
import { AdminUsersStore } from './admin-users.store';
import { ResetPasswordDialog } from './reset-password-dialog';
import { UserFormDialog } from './user-form-dialog';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    NgIcon,
    HlmBadge,
    HlmButton,
    HlmDropdownMenuImports,
    HlmEmptyImports,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmTableImports,
    PageHeader,
    ResetPasswordDialog,
    UserFormDialog,
  ],
  providers: [
    AdminUsersStore,
    provideIcons({
      lucideEllipsis,
      lucideKeyRound,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideShieldCheck,
      lucideUsers,
    }),
  ],
  templateUrl: './users.page.html',
})
export class AdminUsersPage implements OnInit {
  protected readonly store = inject(AdminUsersStore);

  protected readonly editing = signal<AdminUser | 'new' | null>(null);
  protected readonly resetting = signal<AdminUser | null>(null);
  protected readonly skeletonRows = [1, 2, 3];

  ngOnInit(): void {
    void this.store.load();
  }

  protected editUser(): AdminUser | null {
    const value = this.editing();
    return value === 'new' ? null : value;
  }

  protected companies(user: AdminUser): string {
    if (user.role === 'super_admin') return 'All companies';
    if (user.sites.length === 0) return 'None';
    if (user.sites.length <= 2) return user.sites.map((s) => s.name).join(', ');
    return `${user.sites[0].name} + ${user.sites.length - 1} more`;
  }

  protected companiesTitle(user: AdminUser): string {
    return user.sites.map((s) => s.name).join(', ');
  }
}
