import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import type { ContactRequest } from './requests.models';

/** Delivery status pill. A failure that will be retried shows as "Retrying". */
@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HlmBadge],
  templateUrl: './status-badge.html',
})
export class StatusBadge {
  readonly request = input.required<Pick<ContactRequest, 'status' | 'delivery'>>();

  protected readonly view = computed(() => {
    const { status, delivery } = this.request();
    switch (status) {
      case 'sent':
        return { label: 'Sent', class: 'bg-success/15 text-success' };
      case 'queued':
        return { label: 'Queued', class: 'bg-warning/15 text-warning' };
      case 'pending':
        return { label: 'Pending', class: 'bg-muted text-muted-foreground' };
      case 'cancelled':
        return { label: 'Stopped', class: 'bg-muted text-muted-foreground line-through decoration-1' };
      case 'failed':
        return delivery.willRetry
          ? { label: `Retrying ${delivery.attempts}/${delivery.maxAttempts}`, class: 'bg-warning/15 text-warning' }
          : { label: 'Failed', class: 'bg-destructive/10 text-destructive' };
    }
  });
}
