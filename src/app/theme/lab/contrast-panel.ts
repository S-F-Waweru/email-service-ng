import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { contrastRatio, type Oklch, parseOklch } from '../color';
import { ThemeService } from '../theme.service';

interface Pair {
  label: string;
  fg: string;
  bg: string;
  /** Required ratio: 4.5 for text, 3 for large text and UI parts. */
  min: number;
}

/** Text/background pairs every theme should get right. */
const PAIRS: Pair[] = [
  { label: 'Body text', fg: '--foreground', bg: '--background', min: 4.5 },
  { label: 'Secondary text', fg: '--muted-foreground', bg: '--background', min: 4.5 },
  { label: 'Secondary text on muted', fg: '--muted-foreground', bg: '--muted', min: 4.5 },
  { label: 'Primary button', fg: '--primary-foreground', bg: '--primary', min: 4.5 },
  { label: 'Secondary button', fg: '--secondary-foreground', bg: '--secondary', min: 4.5 },
  { label: 'Links (primary on page)', fg: '--primary', bg: '--background', min: 4.5 },
  { label: 'Sidebar text', fg: '--sidebar-foreground', bg: '--sidebar', min: 4.5 },
  { label: 'Sidebar active item', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent', min: 4.5 },
  { label: 'Error text', fg: '--destructive', bg: '--background', min: 4.5 },
  { label: 'Success text', fg: '--success', bg: '--background', min: 4.5 },
  { label: 'Warning text', fg: '--warning', bg: '--background', min: 4.5 },
  { label: 'Focus ring', fg: '--ring', bg: '--background', min: 3 },
];

interface Row extends Pair {
  ratio: number;
  fgCss: string;
  bgCss: string;
}

/** WCAG contrast for the current theme, light and dark. */
@Component({
  selector: 'app-contrast-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Probes: computed token values for each mode. -->
    <div #lightProbe class="light hidden"></div>
    <div #darkProbe class="dark hidden"></div>

    <p class="text-muted-foreground mb-4 text-xs">
      WCAG 2 contrast. Normal text needs 4.5:1 (AA), large text and UI parts 3:1. AAA is 7:1.
    </p>

    <div class="grid gap-6 xl:grid-cols-2">
      @for (mode of modes; track mode.id) {
        <section class="grid gap-2">
          <h3 class="flex items-center justify-between text-sm font-medium">
            {{ mode.label }}
            <span class="text-muted-foreground text-xs font-normal">{{ failing(mode.id) }} below target</span>
          </h3>
          <div class="overflow-hidden rounded-lg border">
            @for (row of rows()[mode.id]; track row.label) {
              <div class="flex items-center gap-3 border-b px-3 py-2 text-xs last:border-b-0">
                <span
                  class="flex h-7 w-12 shrink-0 items-center justify-center rounded border text-[11px] font-semibold"
                  [style.background]="row.bgCss"
                  [style.color]="row.fgCss"
                >
                  Aa
                </span>
                <span class="min-w-0 flex-1 truncate">{{ row.label }}</span>
                <span class="w-12 text-end font-mono">{{ row.ratio.toFixed(2) }}</span>
                <span
                  class="w-16 rounded-full px-2 py-0.5 text-center text-[10px] font-semibold"
                  [class]="grade(row).class"
                >
                  {{ grade(row).label }}
                </span>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class ContrastPanel {
  private readonly theme = inject(ThemeService);
  private readonly lightProbe = viewChild.required<ElementRef<HTMLElement>>('lightProbe');
  private readonly darkProbe = viewChild.required<ElementRef<HTMLElement>>('darkProbe');

  protected readonly modes = [
    { id: 'light', label: 'Light mode' },
    { id: 'dark', label: 'Dark mode' },
  ] as const;
  protected readonly rows = signal<Record<'light' | 'dark', Row[]>>({ light: [], dark: [] });

  constructor() {
    // After render, so the theme <style> for the current brand is in place.
    afterRenderEffect(() => {
      this.theme.brand();
      this.rows.set({
        light: this.measure(this.lightProbe().nativeElement),
        dark: this.measure(this.darkProbe().nativeElement),
      });
    });
  }

  protected failing(mode: 'light' | 'dark'): number {
    return this.rows()[mode].filter((r) => r.ratio < r.min).length;
  }

  protected grade(row: Row): { label: string; class: string } {
    if (row.ratio >= 7 && row.min === 4.5) return { label: 'AAA', class: 'bg-success/15 text-success' };
    if (row.ratio >= row.min) return { label: row.min === 3 ? 'Pass' : 'AA', class: 'bg-success/15 text-success' };
    if (row.ratio >= 3) return { label: 'Large only', class: 'bg-warning/15 text-warning' };
    return { label: 'Fail', class: 'bg-destructive/15 text-destructive' };
  }

  private measure(probe: HTMLElement): Row[] {
    const style = getComputedStyle(probe);
    const read = (name: string) => style.getPropertyValue(name).trim();
    return PAIRS.flatMap((pair) => {
      const fgCss = read(pair.fg);
      const bgCss = read(pair.bg);
      const fg = parseOklch(fgCss);
      const bg = parseOklch(bgCss);
      return fg && bg ? [{ ...pair, fgCss, bgCss, ratio: contrastRatio(fg as Oklch, bg as Oklch) }] : [];
    });
  }
}
