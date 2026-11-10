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
import { mediaQuery } from '../../shared/media-query';
import { RequestReadingPane } from './request-reading-pane';
import { RequestSheet } from './request-sheet';
import { REQUEST_STATUSES, type RequestStatus } from './requests.models';
import { RequestsStore } from './requests.store';
import { StatusBadge } from './status-badge';

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
  cancelled: 'Stopped',
};

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
    RequestReadingPane,
    RequestSheet,
    StatusBadge,
  ],
  providers: [RequestsStore, provideIcons({ lucideInbox, lucideRefreshCw, lucideSearch, lucideSearchX, lucideX })],
  templateUrl: './requests.page.html',
})
export class RequestsPage {
  protected readonly store = inject(RequestsStore);

  protected readonly statusOptions: { value: RequestStatus | null; label: string }[] = [
    { value: null, label: 'All' },
    ...REQUEST_STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] })),
  ];

  /** Wide screens show the reading pane next to the list, like an email client. */
  protected readonly wide = mediaQuery('(min-width: 1024px)');

  protected readonly skeletonRows = Array.from({ length: 6 }, (_, i) => i);

  /** First line of the message, for rows without a subject. */
  protected preview(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }
}
