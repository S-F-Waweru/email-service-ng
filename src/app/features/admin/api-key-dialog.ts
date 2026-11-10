import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy, lucideEye, lucideEyeOff, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { Notify } from '../../core/notify/notify.service';

/** Shows a site's API key with a copy button. */
@Component({
  selector: 'app-api-key-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton, HlmDialogImports, HlmInputGroupImports],
  providers: [provideIcons({ lucideCheck, lucideCopy, lucideEye, lucideEyeOff, lucideTriangleAlert })],
  templateUrl: './api-key-dialog.html',
})
export class ApiKeyDialog {
  private readonly notify = inject(Notify);

  /** null: closed. */
  readonly apiKey = input<string | null>(null);
  readonly siteName = input('');
  readonly siteId = input('');
  /** Explains why the key is being shown. */
  readonly reason = input<'created' | 'rotated' | 'revealed'>('revealed');
  readonly closed = output<void>();

  protected readonly visible = signal(false);
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    const key = this.apiKey();
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.visible.set(true);
      this.notify.warning('Could not copy', 'Select the key and copy it manually.');
    }
  }

  protected onState(state: string): void {
    if (state === 'closed') {
      this.visible.set(false);
      this.closed.emit();
    }
  }
}
