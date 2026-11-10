import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { AuthStore } from '../../core/auth/auth.store';
import { applyServerErrors, serverError } from '../../shared/forms/server-errors';
import { emailValidator } from '../../shared/forms/validators';
import { BrandLogo } from '../../theme/brand-logo';
import { ThemeService } from '../../theme/theme.service';
import { ThemeToggle } from '../../theme/theme-toggle';

type Field = 'email' | 'password';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgIcon,
    BrandLogo,
    ThemeToggle,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmInputGroupImports,
    HlmLabel,
    HlmSpinner,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly showPassword = signal(false);
  private readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, emailValidator, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(256)]],
  });

  /** The message to show under a field, or null. Server messages win. */
  protected fieldError(name: Field): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || !(control.touched || this.submitted())) return null;
    const fromServer = serverError(control);
    if (fromServer) return fromServer;
    if (control.hasError('required')) return name === 'email' ? 'Enter your email.' : 'Enter your password.';
    if (control.hasError('pattern')) return 'Enter a full email address, like name@company.com.';
    if (control.hasError('maxlength')) return 'That is too long.';
    return null;
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.auth.loggingIn()) return;

    try {
      await this.auth.login(this.form.getRawValue());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      // Only in-app paths; never an absolute URL from the query string.
      const safe = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/';
      await this.router.navigateByUrl(safe);
    } catch (error) {
      // The toast is already shown by ApiService; also mark the fields.
      applyServerErrors(this.form, error);
      this.form.controls.password.reset();
    }
  }
}
