import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { applyServerErrors, serverError } from '../../shared/forms/server-errors';
import { emailValidator } from '../../shared/forms/validators';
import {
  type AdminSite,
  type CreatedSite,
  type CreateSiteInput,
  SITE_ID_PATTERN,
  type UpdateSiteInput,
} from './admin.models';
import { AdminSitesStore } from './admin-sites.store';

type SiteField = 'id' | 'name' | 'recipient' | 'smtpHost' | 'smtpPort' | 'smtpFrom';

/** Create (site = null) or edit a site, including its optional SMTP server. */
@Component({
  selector: 'app-site-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmButton, HlmDialogImports, HlmInput, HlmLabel, HlmSpinner, HlmSwitchImports],
  templateUrl: './site-form-dialog.html',
})
export class SiteFormDialog {
  protected readonly store = inject(AdminSitesStore);

  readonly open = input(false);
  /** null: create a new site. */
  readonly site = input<AdminSite | null>(null);
  readonly closed = output<void>();
  readonly created = output<CreatedSite>();

  protected readonly isNew = computed(() => this.site() === null);
  private readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    id: ['', [Validators.required, Validators.pattern(SITE_ID_PATTERN)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    recipient: ['', [Validators.required, emailValidator, Validators.maxLength(254)]],
    isActive: [true],
    useSmtp: [false],
    smtpHost: ['', [Validators.maxLength(255)]],
    smtpPort: [null as number | null, [Validators.min(1), Validators.max(65535)]],
    smtpSecure: [false],
    smtpUser: ['', [Validators.maxLength(255)]],
    smtpPass: ['', [Validators.maxLength(1000)]],
    smtpFrom: ['', [Validators.maxLength(320)]],
  });

  protected readonly useSmtp = signal(false);

  constructor() {
    // Fill the form each time the dialog opens.
    effect(() => {
      if (!this.open()) return;
      const site = this.site();
      this.submitted.set(false);
      this.form.reset({
        id: site?.id ?? '',
        name: site?.name ?? '',
        recipient: site?.recipient ?? '',
        isActive: site?.isActive ?? true,
        useSmtp: !!site?.smtp,
        smtpHost: site?.smtp?.host ?? '',
        smtpPort: site?.smtp?.port ?? null,
        smtpSecure: site?.smtp?.secure ?? false,
        smtpUser: site?.smtp?.user ?? '',
        smtpPass: '',
        smtpFrom: site?.from ?? '',
      });
      this.useSmtp.set(!!site?.smtp);
      if (site) this.form.controls.id.disable();
      else this.form.controls.id.enable();
    });
  }

  protected setUseSmtp(value: boolean): void {
    this.useSmtp.set(value);
    this.form.controls.useSmtp.setValue(value);
    const host = this.form.controls.smtpHost;
    const from = this.form.controls.smtpFrom;
    host.setValidators(value ? [Validators.required, Validators.maxLength(255)] : [Validators.maxLength(255)]);
    // The backend requires a sender address when the site has its own server.
    from.setValidators(value ? [Validators.required, Validators.maxLength(320)] : [Validators.maxLength(320)]);
    host.updateValueAndValidity();
    from.updateValueAndValidity();
  }

  protected error(name: SiteField): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !(control.touched || this.submitted())) return null;
    const fromServer = serverError(control);
    if (fromServer) return fromServer;
    if (control.hasError('required')) return 'Required.';
    if (name === 'id' && control.hasError('pattern')) {
      return '2–50 characters: lowercase letters, digits and dashes, not starting with a dash.';
    }
    if (control.hasError('pattern')) return 'Enter a full email address, like name@company.com.';
    if (control.hasError('min') || control.hasError('max')) return 'Port must be 1–65535.';
    if (control.hasError('maxlength')) return 'Too long.';
    return null;
  }

  protected onState(state: string): void {
    if (state === 'closed') this.closed.emit();
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.store.busy()) return;

    const v = this.form.getRawValue();
    const blank = (s: string) => (s.trim() ? s.trim() : null);
    const smtp = v.useSmtp
      ? {
          smtpHost: v.smtpHost.trim(),
          smtpPort: v.smtpPort,
          smtpSecure: v.smtpSecure,
          smtpUser: blank(v.smtpUser),
          // Editing: an empty password field keeps the stored one.
          ...(v.smtpPass || this.isNew() ? { smtpPass: blank(v.smtpPass) } : {}),
          smtpFrom: blank(v.smtpFrom),
        }
      : // No own server. Clearing smtpHost removes any stored SMTP settings;
        // the From override still applies on its own.
        { ...(this.site()?.smtp ? { smtpHost: null } : {}), smtpFrom: blank(v.smtpFrom) };

    try {
      const site = this.site();
      if (site) {
        const input: UpdateSiteInput = { name: v.name.trim(), recipient: v.recipient.trim(), isActive: v.isActive, ...smtp };
        await this.store.update(site.id, input);
      } else {
        const input: CreateSiteInput = { id: v.id.trim(), name: v.name.trim(), recipient: v.recipient.trim(), ...smtp };
        this.created.emit(await this.store.create(input));
      }
      this.closed.emit();
    } catch (error) {
      applyServerErrors(this.form, error);
    }
  }
}
