import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideBookmark,
  lucideColumns2,
  lucideCopy,
  lucideDownload,
  lucideEye,
  lucideMail,
  lucideMoon,
  lucideRotateCcw,
  lucideSearch,
  lucideSparkles,
  lucideTrash2,
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
import type { StatusColors } from './brand.types';
import { extractSvgColors, hexToOklch, hueDistance, suggestBrandColors, type ExtractedColor } from './color';
import { FONTS } from './fonts';
import { ContrastPanel } from './lab/contrast-panel';
import { CVD_MODES, CvdFilters, type CvdMode } from './lab/cvd';
import { ExportPanel } from './lab/export-panel';
import { fromQueryParams, loadSavedThemes, type SavedTheme, storeSavedThemes } from './lab/lab-state';
import { download, makeDarkVariant, renderPng } from './lab/logo-tools';
import { ScalesPanel } from './lab/scales-panel';
import { ScreensPanel } from './lab/screens-panel';
import { THEME_PRESETS, type ThemePreset } from './presets';
import type { ThemeInput } from './theme-css';
import { ThemeService } from './theme.service';
import { ThemeToggle } from './theme-toggle';

type ColorKey = 'primary' | 'secondary';
type LogoKey = 'primary' | 'secondary';
type View = 'components' | 'screens' | 'scales' | 'contrast' | 'export';

const FAVICON_SIZES = [16, 32, 180, 192, 512];
const STATUS_DEFAULTS: Required<StatusColors> = { success: '#059669', warning: '#d97706', destructive: '#dc2626' };

/**
 * Theme lab (/theme). Try presets, colours, fonts, radius, status colours and
 * logos on real Spartan components; check contrast and colour blindness;
 * export or share the result. Nothing changes the app until you copy the
 * config into brand.config.ts. Self-contained: copy the whole theme/ folder.
 */
@Component({
  selector: 'app-theme-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
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
    ContrastPanel,
    CvdFilters,
    ExportPanel,
    ScalesPanel,
    ScreensPanel,
  ],
  providers: [
    provideIcons({
      lucideBookmark,
      lucideColumns2,
      lucideCopy,
      lucideDownload,
      lucideEye,
      lucideMail,
      lucideMoon,
      lucideRotateCcw,
      lucideSearch,
      lucideSparkles,
      lucideTrash2,
      lucideUpload,
      lucideUsers,
    }),
  ],
  templateUrl: './theme-preview.html',
})
export class ThemePreview {
  protected readonly theme = inject(ThemeService);

  // ---- View ---------------------------------------------------------------
  protected readonly views: { id: View; label: string }[] = [
    { id: 'components', label: 'Components' },
    { id: 'screens', label: 'Sample screen' },
    { id: 'scales', label: 'Scales' },
    { id: 'contrast', label: 'Contrast' },
    { id: 'export', label: 'Export' },
  ];
  protected readonly view = signal<View>('components');
  protected readonly compare = signal(false);
  protected readonly cvdModes = CVD_MODES;
  protected readonly cvd = signal<CvdMode>('none');
  protected readonly cvdFilter = computed(() => (this.cvd() === 'none' ? null : `url(#cvd-${this.cvd()})`));
  /** Side by side and colour-blindness apply to the visual views only. */
  protected readonly visualView = computed(() => this.view() === 'components' || this.view() === 'screens');

  // ---- Controls -----------------------------------------------------------
  protected readonly presets = THEME_PRESETS;
  protected readonly fonts = FONTS;
  protected readonly error = signal('');
  protected readonly uploadButtonClass = buttonVariants({ variant: 'outline', size: 'sm' }) + ' cursor-pointer';

  protected readonly logoSlots = [
    { key: 'primary', label: 'Primary logo', hint: 'Full logo (icon + name)' },
    { key: 'secondary', label: 'Secondary logo', hint: 'Compact mark / icon' },
  ] as const;

  protected readonly colorFields = [
    { key: 'primary', label: 'Primary colour', hint: 'Main buttons, links, active nav, focus ring.' },
    { key: 'secondary', label: 'Secondary colour', hint: 'Secondary buttons and badges, second chart series.' },
  ] as const;

  protected readonly statusFields = [
    { key: 'success', label: 'Success' },
    { key: 'warning', label: 'Warning' },
    { key: 'destructive', label: 'Error' },
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

  /** Status colour shown in its picker: the override, or the default. */
  protected statusValue(key: keyof StatusColors): string {
    return this.theme.brand().status?.[key] ?? STATUS_DEFAULTS[key];
  }

  protected hasStatus(key: keyof StatusColors): boolean {
    return !!this.theme.brand().status?.[key];
  }

  /** Warns when the warning colour could be mistaken for the brand's secondary. */
  protected readonly statusClash = computed(() => {
    const secondary = hexToOklch(this.theme.brand().colors.secondary);
    const warning = hexToOklch(this.theme.brand().status?.warning ?? STATUS_DEFAULTS.warning);
    return secondary.c > 0.05 && hueDistance(secondary.h, warning.h) < 25
      ? 'Warning looks a lot like your secondary colour, so "queued" badges may read as brand accents. Try a more orange or red warning.'
      : null;
  });

  // ---- Logo tools ---------------------------------------------------------
  protected readonly extracted = signal<ExtractedColor[]>([]);
  protected readonly fileNames = signal<Partial<Record<LogoKey, string>>>({});
  protected readonly suggestion = computed(() => suggestBrandColors(this.extracted()));
  private readonly svgText = signal<Partial<Record<LogoKey, string>>>({});
  protected readonly darkVariant = signal<{ url: string; changed: number } | null>(null);
  protected readonly favicons = signal<{ size: number; url: string }[]>([]);
  protected readonly logoBusy = signal(false);

  // ---- Saved themes -------------------------------------------------------
  protected readonly saved = signal<SavedTheme[]>(loadSavedThemes());
  protected readonly saveName = signal('');

  private readonly objectUrls: string[] = [];

  constructor() {
    // A share link (?p=…&s=…) loads its theme.
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    const shared = fromQueryParams((key) => params.get(key));
    if (shared) this.theme.previewBrand(shared);

    inject(DestroyRef).onDestroy(() => {
      // Leaving /theme puts the configured brand and the user's mode back.
      this.theme.pageModeOverride.set(null);
      this.theme.resetBrand();
      this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
    });
  }

  // ---- View actions -------------------------------------------------------

  protected setCompare(on: boolean): void {
    this.compare.set(on);
    // The page goes light so the dark pane is the only dark part.
    this.theme.pageModeOverride.set(on ? 'light' : null);
  }

  // ---- Theme actions ------------------------------------------------------

  private current(): ThemeInput {
    const b = this.theme.brand();
    return { colors: b.colors, radius: b.radius, sidebar: b.sidebar, font: b.font, status: b.status };
  }

  protected isActive(preset: ThemePreset): boolean {
    const { colors, radius } = this.theme.brand();
    return colors.primary === preset.primary && colors.secondary === preset.secondary && radius === preset.radius;
  }

  protected applyPreset(preset: ThemePreset): void {
    this.error.set('');
    this.theme.previewBrand({ colors: { primary: preset.primary, secondary: preset.secondary }, radius: preset.radius });
  }

  protected setColor(key: ColorKey, value: string): void {
    const hex = normalizeHex(value);
    if (!hex) {
      this.error.set(`"${value}" is not a hex colour (e.g. #9a205b).`);
      return;
    }
    this.error.set('');
    this.theme.previewBrand({ colors: { [key]: hex } });
  }

  protected setStatus(key: keyof StatusColors, value: string | null): void {
    const status: StatusColors = { ...this.theme.brand().status };
    const hex = value ? normalizeHex(value) : null;
    if (hex) status[key] = hex;
    else delete status[key];
    this.theme.previewBrand({ status });
  }

  protected setFont(id: string): void {
    this.theme.previewBrand({ font: id === 'system' ? undefined : id });
  }

  protected reset(): void {
    this.error.set('');
    this.extracted.set([]);
    this.fileNames.set({});
    this.svgText.set({});
    this.darkVariant.set(null);
    this.favicons.set([]);
    this.theme.resetBrand();
  }

  // ---- Saved themes -------------------------------------------------------

  protected saveTheme(): void {
    const name = this.saveName().trim() || `Theme ${this.saved().length + 1}`;
    const next = [
      { name, savedAt: new Date().toISOString(), theme: this.current() },
      ...this.saved().filter((t) => t.name !== name),
    ];
    if (!storeSavedThemes(next)) {
      this.error.set('This browser blocked saving. Use Export instead.');
      return;
    }
    this.saved.set(next);
    this.saveName.set('');
  }

  protected applySaved(saved: SavedTheme): void {
    this.theme.previewBrand({ ...saved.theme, status: saved.theme.status ?? {} });
  }

  protected deleteSaved(saved: SavedTheme): void {
    const next = this.saved().filter((t) => t !== saved);
    storeSavedThemes(next);
    this.saved.set(next);
  }

  // ---- Logos --------------------------------------------------------------

  protected async onLogo(key: LogoKey, event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    const url = this.track(URL.createObjectURL(file));
    this.fileNames.update((names) => ({ ...names, [key]: file.name }));
    this.theme.previewBrand({ logo: { ...this.theme.brand().logo, [key]: { light: url } } });
    this.darkVariant.set(null);
    this.favicons.set([]);

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const text = await file.text();
      this.svgText.update((t) => ({ ...t, [key]: text }));
      const found = extractSvgColors(text);
      // Merge so a mark and a wordmark both contribute colours.
      this.extracted.update((current) => {
        const seen = new Set(current.map((c) => c.hex));
        return [...current, ...found.filter((c) => !seen.has(c.hex))];
      });
    } else {
      this.svgText.update((t) => ({ ...t, [key]: undefined }));
    }
  }

  /** Lightens colours in the primary logo that would vanish on a dark page. */
  protected async makeDarkLogo(): Promise<void> {
    this.logoBusy.set(true);
    this.error.set('');
    try {
      const source = this.theme.brand().logo.primary;
      const text = this.svgText().primary ?? (await fetchSvg(source.light));
      if (!text) {
        this.error.set('The dark version needs an SVG logo.');
        return;
      }
      const { svg, replaced } = makeDarkVariant(text);
      const url = this.track(URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })));
      this.darkVariant.set({ url, changed: replaced.length });
      this.theme.previewBrand({ logo: { ...this.theme.brand().logo, primary: { light: source.light, dark: url } } });
    } catch {
      this.error.set('Could not read the logo file.');
    } finally {
      this.logoBusy.set(false);
    }
  }

  protected downloadDarkLogo(): void {
    const variant = this.darkVariant();
    if (variant) download(variant.url, 'logo-dark.svg');
  }

  /** PNG favicons and app icons from the secondary logo. */
  protected async makeFavicons(): Promise<void> {
    this.logoBusy.set(true);
    this.error.set('');
    try {
      const src = this.theme.brand().logo.secondary.light;
      const icons: { size: number; url: string }[] = [];
      for (const size of FAVICON_SIZES) icons.push({ size, url: await renderPng(src, size) });
      this.favicons.set(icons);
    } catch {
      this.error.set('Could not render the secondary logo.');
    } finally {
      this.logoBusy.set(false);
    }
  }

  protected downloadIcon(icon: { size: number; url: string }): void {
    download(icon.url, icon.size >= 180 ? `icon-${icon.size}.png` : `favicon-${icon.size}.png`);
  }

  private track(url: string): string {
    this.objectUrls.push(url);
    return url;
  }
}

function normalizeHex(value: string): string | null {
  const v = value.trim().replace(/^#?/, '#').toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return '#' + v.slice(1).split('').map((c) => c + c).join('');
  return null;
}

async function fetchSvg(url: string): Promise<string | null> {
  if (!url.endsWith('.svg') && !url.startsWith('blob:')) return null;
  const res = await fetch(url);
  const text = await res.text();
  return text.includes('<svg') ? text : null;
}
