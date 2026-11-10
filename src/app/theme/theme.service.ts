import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { brand as configuredBrand } from './brand.config';
import type { BrandConfig, LogoSource, ThemeMode } from './brand.types';
import { buildBrandTokens, type ThemeTokens } from './color';

// Same key as the inline script in index.html, which applies the mode before
// Angular starts so a dark-mode user never sees a white flash.
export const THEME_MODE_STORAGE_KEY = 'theme-mode';
const STYLE_ELEMENT_ID = 'brand-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  /** Current brand. Starts from brand.config.ts; `previewBrand` can override it live. */
  readonly brand = signal<BrandConfig>(configuredBrand);
  readonly mode = signal<ThemeMode>(readStoredMode() ?? configuredBrand.defaultMode);

  private lastBrandName = '';
  private readonly systemDark =signal(this.media?.matches ?? false);
  readonly isDark = computed(() =>
    this.mode() === 'system' ? this.systemDark() : this.mode() === 'dark',
  );

  readonly primaryLogo = computed(() => this.pick(this.brand().logo.primary));
  readonly secondaryLogo = computed(() => this.pick(this.brand().logo.secondary));

  constructor() {
    this.media?.addEventListener('change', (e) => this.systemDark.set(e.matches));

    effect(() => {
      const root = this.document.documentElement;
      root.classList.toggle('dark', this.isDark());
      root.style.colorScheme = this.isDark() ? 'dark' : 'light';
    });

    effect(() => this.applyBrand(this.brand()));
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch {
      // Private mode / storage blocked: the choice just won't survive a reload.
    }
  }

  /** Try colours or logos without editing the config (used by the theme preview page). */
  previewBrand(patch: Partial<Omit<BrandConfig, 'colors'>> & { colors?: Partial<BrandConfig['colors']> }): void {
    this.brand.update((current) => ({
      ...current,
      ...patch,
      colors: { ...current.colors, ...patch.colors },
      logo: { ...current.logo, ...patch.logo },
    }));
  }

  resetBrand(): void {
    this.brand.set(configuredBrand);
  }

  private pick(source: LogoSource): string {
    return (this.isDark() && source.dark) || source.light;
  }

  private applyBrand(brand: BrandConfig): void {
    const { light, dark } = buildBrandTokens(brand.colors.primary, brand.colors.secondary);
    const radius = `--radius: ${brand.radius}rem;`;

    // A <style> appended at the end of <head> comes after styles.css, so these
    // values win over Spartan's defaults at equal specificity.
    let style = this.document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!style) {
      style = this.document.createElement('style');
      style.id = STYLE_ELEMENT_ID;
      this.document.head.appendChild(style);
    }
    style.textContent = `:root { ${radius} ${declarations(light)} }\n:root.dark { ${declarations(dark)} }`;

    // Only when no page has set its own title (a router TitleStrategy may own it).
    if (!this.document.title || this.document.title === this.lastBrandName || !this.lastBrandName) {
      this.document.title = brand.name;
    }
    this.lastBrandName = brand.name;
    this.setFavicon(brand.logo.secondary.light);
  }

  private setFavicon(href: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    link.type = href.endsWith('.svg') ? 'image/svg+xml' : '';
    link.href = href;
  }
}

function declarations(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ');
}

function readStoredMode(): ThemeMode | null {
  try {
    const value = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    return null;
  }
}
