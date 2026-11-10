import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCopy,
  lucideMail,
  lucideRotateCcw,
  lucideSearch,
  lucideSparkles,
  lucideUpload,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { buttonVariants, HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { BrandLogo } from './brand-logo';
import { extractSvgColors, suggestBrandColors, type ExtractedColor } from './color';
import { THEME_PRESETS, type ThemePreset } from './presets';
import { ThemeService } from './theme.service';
import { ThemeToggle } from './theme-toggle';

type ColorKey = 'primary' | 'secondary';
type LogoKey = 'primary' | 'secondary';

/**
 * Theme lab (/theme). Try presets, colours, radius and logos on real Spartan
 * components. Nothing is saved: copy the snippet into brand.config.ts.
 * Self-contained: copy the whole theme/ folder into another Spartan project.
 */
@Component({
  selector: 'app-theme-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    BrandLogo,
    ThemeToggle,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmLabel,
    HlmSeparator,
    HlmSwitchImports,
  ],
  providers: [
    provideIcons({
      lucideCopy,
      lucideMail,
      lucideRotateCcw,
      lucideSearch,
      lucideSparkles,
      lucideUpload,
      lucideUsers,
    }),
  ],
  template: `
    <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
      <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        <app-brand-logo class="h-7" />
        <span class="text-muted-foreground ms-2 hidden text-sm sm:inline">Theme lab</span>
        <app-theme-toggle class="ms-auto" />
      </div>
    </header>

    <main class="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[340px_1fr]">
      <!-- Controls -->
      <div class="grid h-fit gap-6">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Presets</h2>
            <p hlmCardDescription>Starting points. Edit theme/presets.ts to add your own.</p>
          </div>
          <div hlmCardContent class="flex flex-wrap gap-2">
            @for (preset of presets; track preset.name) {
              <button
                hlmBtn
                variant="outline"
                size="sm"
                (click)="applyPreset(preset)"
                [attr.aria-pressed]="isActive(preset)"
                [class.border-primary]="isActive(preset)"
              >
                <span class="flex -space-x-1">
                  <span class="ring-background size-3 rounded-full ring-2" [style.background]="preset.primary"></span>
                  <span class="ring-background size-3 rounded-full ring-2" [style.background]="preset.secondary"></span>
                </span>
                {{ preset.name }}
              </button>
            }
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Logo</h2>
            <p hlmCardDescription>Try another project's logo. Colours are read from SVG files.</p>
          </div>
          <div hlmCardContent class="grid gap-3">
            @for (slot of logoSlots; track slot.key) {
              <label class="flex items-center gap-3">
                <span [class]="uploadButtonClass">
                  <ng-icon name="lucideUpload" />
                  {{ slot.label }}
                </span>
                <span class="text-muted-foreground truncate text-xs">{{ fileNames()[slot.key] || slot.hint }}</span>
                <input type="file" accept="image/svg+xml,image/png,image/webp,image/jpeg" class="sr-only" (change)="onLogo(slot.key, $event)" />
              </label>
            }

            @if (extracted().length) {
              <div hlmSeparator></div>
              <p class="text-muted-foreground text-xs">Colours in the logo (gradient stops are faded):</p>
              <div class="flex flex-wrap gap-2">
                @for (color of extracted(); track color.hex) {
                  <div class="grid justify-items-center gap-1">
                    <span
                      class="size-8 rounded-md border"
                      [class.opacity-60]="color.source === 'gradient'"
                      [style.background]="color.hex"
                      [title]="color.hex"
                    ></span>
                    <div class="flex gap-0.5">
                      <button hlmBtn variant="ghost" size="xs" title="Use as primary" (click)="setColor('primary', color.hex)">P</button>
                      <button hlmBtn variant="ghost" size="xs" title="Use as secondary" (click)="setColor('secondary', color.hex)">S</button>
                    </div>
                  </div>
                }
              </div>
              @if (suggestion(); as s) {
                <button hlmBtn variant="secondary" size="sm" (click)="setColor('primary', s.primary); setColor('secondary', s.secondary)">
                  <ng-icon name="lucideSparkles" />
                  Use suggested pair ({{ s.primary }} / {{ s.secondary }})
                </button>
              }
            }
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Colours</h2>
            <p hlmCardDescription>Everything else is derived from these two.</p>
          </div>
          <div hlmCardContent class="grid gap-4">
            @for (field of colorFields; track field.key) {
              <div class="grid gap-1.5">
                <label hlmLabel [for]="field.key">{{ field.label }}</label>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    class="border-input size-8 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                    [value]="theme.brand().colors[field.key]"
                    (input)="setColor(field.key, $any($event.target).value)"
                    [attr.aria-label]="field.label + ' picker'"
                  />
                  <input
                    hlmInput
                    [id]="field.key"
                    class="font-mono"
                    [value]="theme.brand().colors[field.key]"
                    (change)="setColor(field.key, $any($event.target).value)"
                  />
                </div>
                <p class="text-muted-foreground text-xs">{{ field.hint }}</p>
              </div>
            }

            <div class="grid gap-1.5">
              <label hlmLabel for="radius">Corner radius ({{ theme.brand().radius }}rem)</label>
              <input
                id="radius"
                type="range"
                min="0"
                max="1.25"
                step="0.125"
                class="accent-primary"
                [value]="theme.brand().radius"
                (input)="theme.previewBrand({ radius: +$any($event.target).value })"
              />
            </div>

            @if (error()) {
              <p class="text-destructive text-xs">{{ error() }}</p>
            }

            <div hlmSeparator></div>

            <div class="flex gap-2">
              <button hlmBtn variant="outline" size="sm" (click)="copySnippet()">
                <ng-icon name="lucideCopy" />
                {{ copied() ? 'Copied' : 'Copy config' }}
              </button>
              <button hlmBtn variant="ghost" size="sm" (click)="reset()">
                <ng-icon name="lucideRotateCcw" />
                Reset
              </button>
            </div>
            <pre class="bg-muted overflow-x-auto rounded-md p-3 text-[11px] leading-relaxed">{{ snippet() }}</pre>
          </div>
        </section>
      </div>

      <!-- Samples -->
      <div class="grid h-fit gap-6">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Logos</h2>
            <p hlmCardDescription>Primary (full) and secondary (mark). Switch dark mode to check both files.</p>
          </div>
          <div hlmCardContent class="flex flex-wrap items-center gap-8">
            <app-brand-logo class="h-10" />
            <app-brand-logo variant="secondary" class="h-10" />
            <div class="bg-sidebar flex items-center gap-2 rounded-lg border p-2">
              <app-brand-logo variant="secondary" class="h-6" />
              <span class="text-sm font-medium">{{ theme.brand().shortName ?? theme.brand().name }}</span>
            </div>
          </div>
        </section>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Buttons and badges</h2>
          </div>
          <div hlmCardContent class="grid gap-4">
            <div class="flex flex-wrap gap-2">
              <button hlmBtn>Primary</button>
              <button hlmBtn variant="secondary">Secondary</button>
              <button hlmBtn variant="outline">Outline</button>
              <button hlmBtn variant="ghost">Ghost</button>
              <button hlmBtn variant="destructive">Destructive</button>
              <button hlmBtn variant="link">Link</button>
              <button hlmBtn disabled>Disabled</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span hlmBadge>Default</span>
              <span hlmBadge variant="secondary">Secondary</span>
              <span hlmBadge variant="outline">Outline</span>
              <span hlmBadge variant="destructive">Failed</span>
              <span hlmBadge class="bg-success/15 text-success">Sent</span>
              <span hlmBadge class="bg-warning/15 text-warning">Queued</span>
            </div>
          </div>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>Sign in</h2>
              <p hlmCardDescription>Form controls and focus ring (tab into the fields).</p>
            </div>
            <div hlmCardContent class="grid gap-3">
              <div class="grid gap-1.5">
                <label hlmLabel for="demo-email">Email</label>
                <input hlmInput id="demo-email" type="email" placeholder="jane@company.com" />
              </div>
              <div class="grid gap-1.5">
                <label hlmLabel for="demo-password">Password</label>
                <input hlmInput id="demo-password" type="password" placeholder="••••••••••••" />
              </div>
              <label class="flex items-center gap-2 text-sm">
                <hlm-switch [checked]="true" />
                Remember this device
              </label>
            </div>
            <div hlmCardFooter>
              <button hlmBtn class="w-full">Sign in</button>
            </div>
          </section>

          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>Sidebar</h2>
              <p hlmCardDescription>Active and hover states.</p>
            </div>
            <div hlmCardContent>
              <nav class="bg-sidebar text-sidebar-foreground grid gap-1 rounded-lg border p-2 text-sm">
                <a class="bg-sidebar-primary text-sidebar-primary-foreground flex items-center gap-2 rounded-md px-2 py-1.5">
                  <ng-icon name="lucideMail" /> Requests
                </a>
                <a class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5">
                  <ng-icon name="lucideSearch" /> Companies
                </a>
                <a class="bg-sidebar-accent text-sidebar-accent-foreground flex items-center gap-2 rounded-md px-2 py-1.5">
                  <ng-icon name="lucideUsers" /> Users (hover state)
                </a>
              </nav>
            </div>
          </section>
        </div>

        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>Colour tokens</h2>
          </div>
          <div hlmCardContent class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            @for (swatch of swatches; track swatch.name) {
              <div class="overflow-hidden rounded-md border text-xs">
                <div [class]="swatch.bg"></div>
                <div class="px-2 py-1 font-mono">{{ swatch.name }}</div>
              </div>
            }
          </div>
        </section>
      </div>
    </main>
  `,
})
export class ThemePreview {
  protected readonly theme = inject(ThemeService);
  protected readonly error = signal('');
  protected readonly copied = signal(false);
  protected readonly extracted = signal<ExtractedColor[]>([]);
  protected readonly fileNames = signal<Partial<Record<LogoKey, string>>>({});
  protected readonly suggestion = computed(() => suggestBrandColors(this.extracted()));

  protected readonly presets = THEME_PRESETS;
  // hlmBtn only applies to <button>/<a>; the upload trigger is a <span> inside a <label>.
  protected readonly uploadButtonClass = buttonVariants({ variant: 'outline', size: 'sm' }) + ' cursor-pointer';

  protected readonly logoSlots = [
    { key: 'primary', label: 'Primary logo', hint: 'Full logo (icon + name)' },
    { key: 'secondary', label: 'Secondary logo', hint: 'Compact mark / icon' },
  ] as const;

  protected readonly colorFields = [
    { key: 'primary', label: 'Primary colour', hint: 'Main buttons, links, active nav, focus ring.' },
    { key: 'secondary', label: 'Secondary colour', hint: 'Secondary buttons and badges, second chart series.' },
  ] as const;

  // Full class strings (not built at runtime) so Tailwind generates them.
  protected readonly swatches = [
    { name: 'primary', bg: 'h-10 bg-primary' },
    { name: 'secondary', bg: 'h-10 bg-secondary' },
    { name: 'accent', bg: 'h-10 bg-accent' },
    { name: 'ring', bg: 'h-10 bg-ring' },
    { name: 'muted', bg: 'h-10 bg-muted' },
    { name: 'success', bg: 'h-10 bg-success' },
    { name: 'warning', bg: 'h-10 bg-warning' },
    { name: 'destructive', bg: 'h-10 bg-destructive' },
  ];

  protected readonly snippet = computed(() => {
    const { colors, radius } = this.theme.brand();
    return `colors: {\n  primary: '${colors.primary}',\n  secondary: '${colors.secondary}',\n},\nradius: ${radius},`;
  });

  private readonly objectUrls: string[] = [];

  constructor() {
    // Leaving /theme puts the configured brand back for the rest of the app.
    inject(DestroyRef).onDestroy(() => {
      this.theme.resetBrand();
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });
  }

  protected isActive(preset: ThemePreset): boolean {
    const { colors, radius } = this.theme.brand();
    return colors.primary === preset.primary && colors.secondary === preset.secondary && radius === preset.radius;
  }

  protected applyPreset(preset: ThemePreset): void {
    this.error.set('');
    this.theme.previewBrand({
      colors: { primary: preset.primary, secondary: preset.secondary },
      radius: preset.radius,
    });
  }

  protected setColor(key: ColorKey, value: string): void {
    const hex = value.trim().startsWith('#') ? value.trim() : `#${value.trim()}`;
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
      this.error.set(`"${value}" is not a hex colour (e.g. #9a205b).`);
      return;
    }
    this.error.set('');
    this.theme.previewBrand({ colors: { [key]: hex.toLowerCase() } });
  }

  protected async onLogo(key: LogoKey, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const url = URL.createObjectURL(file);
    this.objectUrls.push(url);
    this.fileNames.update((names) => ({ ...names, [key]: file.name }));
    this.theme.previewBrand({ logo: { ...this.theme.brand().logo, [key]: { light: url } } });

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const found = extractSvgColors(await file.text());
      // Merge so a mark and a wordmark both contribute colours.
      this.extracted.update((current) => {
        const seen = new Set(current.map((c) => c.hex));
        return [...current, ...found.filter((c) => !seen.has(c.hex))];
      });
    }
  }

  protected reset(): void {
    this.error.set('');
    this.extracted.set([]);
    this.fileNames.set({});
    this.theme.resetBrand();
  }

  protected async copySnippet(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.snippet());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      this.error.set('Clipboard blocked: select the snippet and copy it.');
    }
  }
}
