import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemeService } from './theme.service';

/**
 * The brand logo, switching to the dark-mode file automatically.
 *
 *   <app-brand-logo />                       full logo
 *   <app-brand-logo variant="secondary" />   compact mark
 *
 * Size it with a height class on the host, e.g. class="h-8".
 */
@Component({
  selector: 'app-brand-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 items-center h-8' },
  template: `<img [src]="src()" [alt]="theme.brand().name" class="h-full w-auto object-contain" />`,
})
export class BrandLogo {
  protected readonly theme = inject(ThemeService);
  readonly variant = input<'primary' | 'secondary'>('primary');

  protected readonly src = computed(() =>
    this.variant() === 'primary' ? this.theme.primaryLogo() : this.theme.secondaryLogo(),
  );
}
