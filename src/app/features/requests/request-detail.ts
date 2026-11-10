import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideCopy, lucideReply } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { Notify } from '../../core/notify/notify.service';
import { RequestsStore } from './requests.store';
import { StatusBadge } from './status-badge';

/** Side panel with one request: the message and its delivery record. */
@Component({
  selector: 'app-request-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, NgIcon, HlmButton, HlmSeparator, HlmSheetImports, StatusBadge],
  providers: [provideIcons({ lucideCircleAlert, lucideCopy, lucideReply })],
  templateUrl: './request-detail.html',
})
export class RequestDetail {
  protected readonly store = inject(RequestsStore);
  private readonly notify = inject(Notify);

  protected readonly request = this.store.selected;

  protected readonly replyHref = computed(() => {
    const r = this.request();
    if (!r) return '';
    const subject = r.subject ? `Re: ${r.subject}` : `Your message to ${r.siteName}`;
    return `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(subject)}`;
  });

  protected onStateChange(state: string): void {
    if (state === 'closed') this.store.close();
  }

  protected async copy(text: string, what: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.notify.success(`${what} copied`);
    } catch {
      this.notify.warning('Could not copy', 'Your browser blocked clipboard access.');
    }
  }
}
