import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideWandSparkles } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import type { UserRole } from '../../core/auth/auth.models';
import { Notify } from '../../core/notify/notify.service';
import { applyServerErrors, serverError } from '../../shared/forms/server-errors';
import { emailValidator } from '../../shared/forms/validators';
import { type AdminUser, generatePassword, MIN_PASSWORD_LENGTH } from './admin.models';
import { AdminUsersStore } from './admin-users.store';

type UserField = 'email' | 'fullName' | 'password';

/** Create (user = null) or edit a dashboard user. */
@Component({
  selector: 'app-user-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmButton,
    HlmDialogImports,
    HlmInput,
    HlmInputGroupImports,
    HlmLabel,
    HlmSpinner,
    HlmSwitchImports,
  ],
  providers: [provideIcons({ lucideCopy, lucideWandSparkles })],
  templateUrl: './user-form-dialog.html',
})
export class UserFormDialog {
  protected readonly store = inject(AdminUsersStore);
  private readonly notify = inject(Notify);

  readonly open = input(false);
  readonly user = input<AdminUser | null>(null);
  readonly closed = output<void>();

  protected readonly isNew = computed(() => this.user() === null);
  /** The backend blocks changing your own role or deactivating yourself. */
  protected readonly isSelf = computed(() => this.user()?.id === this.store.currentUserId());
  protected readonly minPassword = MIN_PASSWORD_LENGTH;
  protected readonly roles: { value: UserRole; label: string; hint: string }[] = [
    { value: 'company_user', label: 'Company user', hint: 'Sees only the companies ticked below.' },
    { value: 'super_admin', label: 'Administrator', hint: 'Sees every company and manages sites and users.' },
  ];

  private readonly submitted = signal(false);
  protected readonly role = signal<UserRole>('company_user');
  protected readonly siteIds = signal<string[]>([]);
  protected readonly isActive = signal(true);
  protected readonly sitesError = signal('');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, emailValidator, Validators.maxLength(254)]],
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH), Validators.maxLength(200)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const user = this.user();
      this.submitted.set(false);
      this.sitesError.set('');
      this.form.reset({ email: user?.email ?? '', fullName: user?.fullName ?? '', password: '' });
      this.role.set(user?.role ?? 'company_user');
      this.siteIds.set(user?.sites.map((s) => s.id) ?? []);
      this.isActive.set(user?.isActive ?? true);
      // Email can't be changed and the password is reset separately when editing.
      if (user) {
        this.form.controls.email.disable();
        this.form.controls.password.disable();
      } else {
        this.form.controls.email.enable();
        this.form.controls.password.enable();
      }
    });
  }

  protected toggleSite(id: string, checked: boolean): void {
    this.siteIds.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
    this.sitesError.set('');
  }

  protected generate(): void {
    this.form.controls.password.setValue(generatePassword());
    this.form.controls.password.markAsTouched();
  }

  protected async copyPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.form.controls.password.value);
      this.notify.success('Password copied');
    } catch {
      this.notify.warning('Could not copy', 'Select the password and copy it manually.');
    }
  }

  protected error(name: UserField): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !(control.touched || this.submitted())) return null;
    const fromServer = serverError(control);
    if (fromServer) return fromServer;
    if (control.hasError('required')) return 'Required.';
    if (control.hasError('pattern')) return 'Enter a full email address, like name@company.com.';
    if (control.hasError('minlength')) return `At least ${MIN_PASSWORD_LENGTH} characters.`;
    if (control.hasError('maxlength')) return 'Too long.';
    return null;
  }

  protected onState(state: string): void {
    if (state === 'closed') this.closed.emit();
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const needsSites = this.role() === 'company_user' && this.siteIds().length === 0;
    this.sitesError.set(needsSites ? 'Pick at least one company.' : '');
    if (this.form.invalid || needsSites || this.store.busy()) return;

    const v = this.form.getRawValue();
    // Administrators see everything; the backend ignores their siteIds.
    const siteIds = this.role() === 'super_admin' ? [] : this.siteIds();
    try {
      const user = this.user();
      if (user) {
        await this.store.update(user.id, {
          fullName: v.fullName.trim(),
          siteIds,
          ...(this.isSelf() ? {} : { role: this.role(), isActive: this.isActive() }),
        });
      } else {
        await this.store.create({
          email: v.email.trim().toLowerCase(),
          fullName: v.fullName.trim(),
          role: this.role(),
          siteIds,
          password: v.password,
        });
      }
      this.closed.emit();
    } catch (error) {
      applyServerErrors(this.form, error);
    }
  }
}
