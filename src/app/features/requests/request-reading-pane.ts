import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideCircleStop,
  lucideCopy,
  lucideMailOpen,
  lucideReply,
  lucideX,
} from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { Notify } from '../../core/notify/notify.service';
import { RequestsStore } from './requests.store';
import { StatusBadge } from './status-badge';

/**
 * One request, email-client style: the message and its delivery record.
 * Inline next to the list on wide screens, inside a sheet on small ones.
 */
@Component({
  selector: 'app-request-reading-pane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgIcon, HlmAlertDialogImports, HlmButton, HlmEmptyImports, HlmSeparator, HlmSpinner, StatusBadge],
  providers: [
    provideIcons({ lucideCircleAlert, lucideCircleStop, lucideCopy, lucideMailOpen, lucideReply, lucideX }),
  ],
  host: { class: 'block' },
  templateUrl: './request-reading-pane.html',
})
export class RequestReadingPane {
  protected readonly store = inject(RequestsStore);
  private readonly notify = inject(Notify);

  /** The sheet has its own close button. */
  readonly showClose = input(true);

  protected readonly request = this.store.selected;
  protected readonly confirmingStop = signal(false);

  protected readonly replyHref = computed(() => {
    const r = this.request();
    if (!r) return '';
    const subject = r.subject ? `Re: ${r.subject}` : `Your message to ${r.siteName}`;
    return `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(subject)}`;
  });

  protected async copy(text: string, what: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.notify.success(`${what} copied`);
    } catch {
      this.notify.warning('Could not copy', 'Your browser blocked clipboard access.');
    }
  }

  protected async confirmStop(): Promise<void> {
    const r = this.request();
    if (!r) return;
    await this.store.stopDelivery(r.id);
    // Close either way: on a 409 the list reloads with the real status.
    this.confirmingStop.set(false);
  }

  protected onStopDialog(state: string): void {
    if (state === 'closed') this.confirmingStop.set(false);
  }
}
