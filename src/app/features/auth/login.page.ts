import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleAlert, lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { errorMessage } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { BrandLogo } from '../../theme/brand-logo';
import { ThemeService } from '../../theme/theme.service';
import { ThemeToggle } from '../../theme/theme-toggle';

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
  providers: [provideIcons({ lucideCircleAlert, lucideEye, lucideEyeOff })],
  template: `
    <div class="bg-muted/40 relative grid min-h-svh place-items-center px-4 py-10">
      <app-theme-toggle class="absolute end-4 top-4" />

      <div class="grid w-full max-w-sm gap-6">
        <app-brand-logo class="h-10 justify-self-center" />

        <section hlmCard>
          <div hlmCardHeader>
            <h1 hlmCardTitle class="text-base">Sign in</h1>
            <p hlmCardDescription>to {{ theme.brand().name }}</p>
          </div>

          <form hlmCardContent class="grid gap-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (error()) {
              <div role="alert" class="bg-destructive/10 text-destructive flex gap-2 rounded-md px-3 py-2 text-xs">
                <ng-icon name="lucideCircleAlert" class="mt-0.5 shrink-0" />
                <span>{{ error() }}</span>
              </div>
            }

            <div class="grid gap-1.5">
              <label hlmLabel for="email">Email</label>
              <input
                hlmInput
                id="email"
                type="email"
                autocomplete="username"
                formControlName="email"
                placeholder="you@company.com"
                [attr.aria-invalid]="showError('email') || null"
              />
              @if (showError('email')) {
                <p class="text-destructive text-xs">Enter a valid email address.</p>
              }
            </div>

            <div class="grid gap-1.5">
              <label hlmLabel for="password">Password</label>
              <div hlmInputGroup>
                <input
                  hlmInputGroupInput
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  formControlName="password"
                  [attr.aria-invalid]="showError('password') || null"
                />
                <div hlmInputGroupAddon align="inline-end">
                  <button
                    hlmInputGroupButton
                    type="button"
                    size="icon-xs"
                    (click)="showPassword.set(!showPassword())"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                  >
                    <ng-icon [name]="showPassword() ? 'lucideEyeOff' : 'lucideEye'" />
                  </button>
                </div>
              </div>
              @if (showError('password')) {
                <p class="text-destructive text-xs">Enter your password.</p>
              }
            </div>

            <button hlmBtn type="submit" size="lg" class="w-full" [disabled]="loading()">
              @if (loading()) {
                <hlm-spinner class="size-4" />
              }
              Sign in
            </button>
          </form>
        </section>

        <p class="text-muted-foreground text-center text-xs">
          Forgot your password? Ask your administrator to reset it.
        </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  protected readonly theme = inject(ThemeService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly showPassword = signal(false);
  private readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.maxLength(256)]],
  });

  protected showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.loading()) return;

    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.form.getRawValue());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      // Only follow in-app paths, never an absolute URL from the query string.
      await this.router.navigateByUrl(returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/');
    } catch (err) {
      this.error.set(errorMessage(err));
      this.form.controls.password.reset();
    } finally {
      this.loading.set(false);
    }
  }
}
