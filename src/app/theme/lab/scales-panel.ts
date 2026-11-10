import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { buildScale, contrastRatio, WHITE } from '../color';
import { ThemeService } from '../theme.service';

/** 50–950 scales for primary, secondary and a brand-tinted grey; click to copy. */
@Component({
  selector: 'app-scales-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p class="text-muted-foreground mb-4 text-xs">
      Generated from your colours, Tailwind-style. Click a swatch to copy its hex. Find them in Export → Tailwind too.
    </p>
    <div class="grid gap-5">
      @for (scale of scales(); track scale.name) {
        <section class="grid gap-1.5">
          <h3 class="text-sm font-medium">
            {{ scale.name }} <span class="text-muted-foreground font-normal">{{ scale.source }}</span>
          </h3>
          <div class="grid grid-cols-11 gap-1">
            @for (swatch of scale.steps; track swatch.step) {
              <button
                type="button"
                class="focus-visible:ring-ring grid h-16 content-end rounded-md p-1 text-start text-[10px] leading-tight outline-none focus-visible:ring-2"
                [style.background]="swatch.hex"
                [style.color]="swatch.text"
                [title]="'Copy ' + swatch.hex"
                (click)="copy(swatch.hex)"
              >
                <span class="font-semibold">{{ swatch.step }}</span>
                <span class="hidden font-mono sm:block">{{ copied() === swatch.hex ? 'Copied' : swatch.hex }}</span>
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class ScalesPanel {
  private readonly theme = inject(ThemeService);
  protected readonly copied = signal('');

  protected readonly scales = computed(() => {
    const { primary, secondary } = this.theme.brand().colors;
    const withText = (steps: ReturnType<typeof buildScale>) =>
      steps.map((s) => ({ ...s, text: contrastRatio(s.oklch, WHITE) >= 4.5 ? '#ffffff' : '#18181b' }));
    return [
      { name: 'Primary', source: primary, steps: withText(buildScale(primary)) },
      { name: 'Secondary', source: secondary, steps: withText(buildScale(secondary)) },
      { name: 'Neutral', source: 'grey tinted with primary', steps: withText(buildScale(primary, 0.012)) },
    ];
  });

  protected async copy(hex: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(hex);
      this.copied.set(hex);
      setTimeout(() => this.copied.set(''), 1200);
    } catch {
      // Clipboard blocked; the hex is in the tooltip.
    }
  }
}
