import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { brand as configuredBrand } from './brand.config';
import type { BrandConfig, LogoSource, ThemeMode } from './brand.types';
import { sidebarIsDark } from './color';
import { fontById, googleFontsUrl } from './fonts';
import { themeStylesheet } from './theme-css';

// Same key as the inline script in index.html, which applies the mode before
// Angular starts so a dark-mode user never sees a white flash.
export const THEME_MODE_STORAGE_KEY = 'theme-mode';
const STYLE_ELEMENT_ID = 'brand-theme';
const FONT_LINK_ID = 'brand-font';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  /** Current brand. Starts from brand.config.ts; `previewBrand` can override it live. */
  readonly brand = signal<BrandConfig>(configuredBrand);
  readonly mode = signal<ThemeMode>(readStoredMode() ?? configuredBrand.defaultMode);

  private lastBrandName = '';
  private readonly systemDark = signal(this.media?.matches ?? false);
  readonly isDark = computed(() =>
    this.mode() === 'system' ? this.systemDark() : this.mode() === 'dark',
  );
  /**
   * Temporarily forces the page into one mode without changing the user's
   * choice. The theme lab sets 'light' for its side-by-side view, so the
   * `.dark` preview pane is the only dark part of the page.
   */
  readonly pageModeOverride = signal<'light' | 'dark' | null>(null);
  private readonly pageDark = computed(() => {
    const forced = this.pageModeOverride();
    return forced ? forced === 'dark' : this.isDark();
  });

  /** Whether the sidebar background is dark (picks the logo file that shows on it). */
  readonly sidebarDark = computed(() =>
    sidebarIsDark(this.brand().colors.primary, this.isDark() ? 'dark' : 'light', this.brand().sidebar ?? 'neutral'),
  );

  readonly primaryLogo = computed(() => this.pick(this.brand().logo.primary, this.isDark()));
  readonly secondaryLogo = computed(() => this.pick(this.brand().logo.secondary, this.isDark()));
  readonly sidebarPrimaryLogo = computed(() => this.pick(this.brand().logo.primary, this.sidebarDark()));
  readonly sidebarSecondaryLogo = computed(() => this.pick(this.brand().logo.secondary, this.sidebarDark()));

  constructor() {
    this.media?.addEventListener('change', (e) => this.systemDark.set(e.matches));

    effect(() => {
      const root = this.document.documentElement;
      root.classList.toggle('dark', this.pageDark());
      root.style.colorScheme = this.pageDark() ? 'dark' : 'light';
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

  private pick(source: LogoSource, dark: boolean): string {
    return (dark && source.dark) || source.light;
  }

  private applyBrand(brand: BrandConfig): void {
    // A <style> appended at the end of <head> comes after styles.css, so these
    // values win over Spartan's defaults at equal specificity.
    let style = this.document.getElementById(STYLE_ELEMENT_ID) as HTMLStyleElement | null;
    if (!style) {
      style = this.document.createElement('style');
      style.id = STYLE_ELEMENT_ID;
      this.document.head.appendChild(style);
    }
    style.textContent = themeStylesheet(brand);
    this.loadFont(brand.font);

    // Only when no page has set its own title (a router TitleStrategy may own it).
    if (!this.document.title || this.document.title === this.lastBrandName || !this.lastBrandName) {
      this.document.title = brand.name;
    }
    this.lastBrandName = brand.name;
    this.setFavicon(brand.logo.secondary.light);
  }

  /** Adds (or swaps) the Google Fonts stylesheet for the chosen font. */
  private loadFont(id: string | undefined): void {
    const url = googleFontsUrl(fontById(id));
    let link = this.document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
    if (!url) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      this.document.head.appendChild(link);
    }
    if (link.href !== url) link.href = url;
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


function readStoredMode(): ThemeMode | null {
  try {
    const value = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    return null;
  }
}
