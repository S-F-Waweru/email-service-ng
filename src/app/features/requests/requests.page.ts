import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideInbox, lucideRefreshCw, lucideSearch, lucideSearchX, lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { PageHeader } from '../../shared/page-header';
import { RequestDetail } from './request-detail';
import { REQUEST_STATUSES, type RequestStatus } from './requests.models';
import { RequestsStore } from './requests.store';
import { StatusBadge } from './status-badge';

@Component({
  selector: 'app-requests-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    NgIcon,
    HlmButton,
    HlmEmptyImports,
    HlmInputGroupImports,
    HlmPaginationImports,
    HlmSkeleton,
    HlmTableImports,
    PageHeader,
    RequestDetail,
    StatusBadge,
  ],
  providers: [RequestsStore, provideIcons({ lucideInbox, lucideRefreshCw, lucideSearch, lucideSearchX, lucideX })],
  templateUrl: './requests.page.html',
})
export class RequestsPage {
  protected readonly store = inject(RequestsStore);

  protected readonly statusOptions: { value: RequestStatus | null; label: string }[] = [
    { value: null, label: 'All' },
    ...REQUEST_STATUSES.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) })),
  ];

  protected readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  /** First line of the message, for rows without a subject. */
  protected preview(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
