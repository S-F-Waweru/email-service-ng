import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideInbox } from '@ng-icons/lucide';
import { ComingSoon } from '../../shared/coming-soon';
import { PageHeader } from '../../shared/page-header';

@Component({
  selector: 'app-requests-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeader, ComingSoon],
  providers: [provideIcons({ lucideInbox })],
  template: `
    <app-page-header title="Requests" description="Contact form submissions and how their emails were delivered." />
    <app-coming-soon icon="lucideInbox" text="Searchable list with status filters, paging and a delivery detail panel." />
  `,
})
export class RequestsPage {}
