import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideWandSparkles } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { Notify } from '../../core/notify/notify.service';
import { type AdminUser, generatePassword, MIN_PASSWORD_LENGTH } from './admin.models';
import { AdminUsersStore } from './admin-users.store';

/** Set a new password for a user (they're not told automatically). */
@Component({
  selector: 'app-reset-password-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton, HlmDialogImports, HlmInputGroupImports, HlmLabel, HlmSpinner],
  providers: [provideIcons({ lucideCopy, lucideWandSparkles })],
  templateUrl: './reset-password-dialog.html',
})
export class ResetPasswordDialog {
  protected readonly store = inject(AdminUsersStore);
  private readonly notify = inject(Notify);

  /** null: closed. */
  readonly user = input<AdminUser | null>(null);
  readonly closed = output<void>();

  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly min = MIN_PASSWORD_LENGTH;

  constructor() {
    effect(() => {
      if (this.user()) {
        this.password.set(generatePassword());
        this.error.set('');
      }
    });
  }

  protected generate(): void {
    this.password.set(generatePassword());
    this.error.set('');
  }

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.password());
      this.notify.success('Password copied');
    } catch {
      this.notify.warning('Could not copy', 'Select the password and copy it manually.');
    }
  }

  protected async save(): Promise<void> {
    const user = this.user();
    if (!user || this.store.busy()) return;
    if (this.password().length < MIN_PASSWORD_LENGTH) {
      this.error.set(`At least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    try {
      await this.store.setPassword(user.id, this.password());
      this.closed.emit();
    } catch {
      // toast shown by ApiService
    }
  }

  protected onState(state: string): void {
    if (state === 'closed') this.closed.emit();
  }
}
