import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideUsers } from '@ng-icons/lucide';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  providers: [provideIcons({ lucideUsers })],
  template: `
    <app-page-header title="Users" description="Who can sign in to the dashboard and which companies they see." />
    <app-coming-soon icon="lucideUsers" text="Create and edit users, assign companies, reset passwords." />
  `,
})
export class AdminUsersPage {}
