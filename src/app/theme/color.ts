import type { SidebarStyle } from './brand.types';

// Small colour toolkit: turns the two brand hex colours into the full set of
// Spartan CSS variables (light + dark). Uses OKLCH, the same space Spartan's
// default theme is written in, so lightness changes look even across hues.

export interface Oklch {
  l: number; // 0..1
  c: number; // 0..~0.37
  h: number; // degrees
}

export function parseHex(hex: string): [number, number, number] {
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Invalid hex colour "${hex}" in brand config`);
  }
  const n = parseInt(value, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [number, number, number];
}

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = parseHex(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

/** Linear sRGB, clamped to the displayable range. */
function oklchToLinearRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function oklchToHex(color: Oklch): string {
  return (
    '#' +
    oklchToLinearRgb(color)
      .map((v) =>
        Math.round(fromLinear(v) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/** WCAG relative luminance. */
function luminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearRgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const WHITE: Oklch = { l: 0.985, c: 0, h: 0 };
export const INK: Oklch = { l: 0.141, c: 0.005, h: 285.823 };

/** Whichever of near-white / near-black text reads better on `bg`. */
export function readableOn(bg: Oklch): Oklch {
  return contrastRatio(bg, WHITE) >= contrastRatio(bg, INK) ? WHITE : INK;
}

export function css({ l, c, h }: Oklch, alpha?: number): string {
  const base = `${round(l, 4)} ${round(c, 4)} ${round(h, 3)}`;
  return alpha === undefined ? `oklch(${base})` : `oklch(${base} / ${alpha}%)`;
}

const round = (v: number, digits: number) => Number(v.toFixed(digits));

const clampL = (color: Oklch, min: number, max: number): Oklch => ({
  ...color,
  l: Math.min(max, Math.max(min, color.l)),
});

export type ThemeTokens = Record<string, string>;

/**
 * Brand-driven Spartan tokens. Neutrals (background, border, muted, ...) stay
 * as defined in styles.css; only the colour-bearing tokens are replaced.
 */
export function buildBrandTokens(primaryHex: string, secondaryHex: string, sidebar: SidebarStyle = 'neutral') {
  const primary = hexToOklch(primaryHex);
  const secondary = hexToOklch(secondaryHex);

  // On a dark background very dark brand colours disappear, and very light
  // ones glare, so dark mode nudges lightness into a readable band.
  const primaryDark = clampL(primary, 0.62, 0.82);
  const secondaryDark = clampL(secondary, 0.55, 0.8);

  // Faint brand tint for hover/selected states (menus, sidebar items).
  const tintLight: Oklch = { l: 0.965, c: Math.min(primary.c, 0.025), h: primary.h };
  const tintDark: Oklch = { l: 0.28, c: Math.min(primary.c, 0.03), h: primary.h };

  const light: ThemeTokens = {
    '--primary': css(primary),
    '--primary-foreground': css(readableOn(primary)),
    '--secondary': css(secondary),
    '--secondary-foreground': css(readableOn(secondary)),
    '--accent': css(tintLight),
    '--accent-foreground': css(INK),
    '--ring': css(clampL(primary, 0.55, 0.72)),
    '--sidebar-primary': css(primary),
    '--sidebar-primary-foreground': css(readableOn(primary)),
    '--sidebar-accent': css(tintLight),
    '--sidebar-accent-foreground': css(INK),
    '--sidebar-ring': css(clampL(primary, 0.55, 0.72)),
    '--chart-1': css(primary),
    '--chart-2': css(secondary),
  };

  const dark: ThemeTokens = {
    '--primary': css(primaryDark),
    '--primary-foreground': css(readableOn(primaryDark)),
    '--secondary': css(secondaryDark),
    '--secondary-foreground': css(readableOn(secondaryDark)),
    '--accent': css(tintDark),
    '--accent-foreground': css(WHITE),
    '--ring': css(clampL(primaryDark, 0.5, 0.65)),
    '--sidebar-primary': css(primaryDark),
    '--sidebar-primary-foreground': css(readableOn(primaryDark)),
    '--sidebar-accent': css(tintDark),
    '--sidebar-accent-foreground': css(WHITE),
    '--sidebar-ring': css(clampL(primaryDark, 0.5, 0.65)),
    '--chart-1': css(primaryDark),
    '--chart-2': css(secondaryDark),
  };

  if (sidebar === 'primary') {
    Object.assign(light, brandSidebarTokens(primary, secondary));
    // Dark mode: a deep version of the brand colour, so the sidebar still
    // reads as "brand" without glowing next to the dark page.
    Object.assign(dark, brandSidebarTokens({ ...primary, l: Math.min(Math.max(primary.l, 0.26), 0.34) }, secondaryDark));
  }

  return { light, dark };
}


/**
 * Sidebar filled with the brand colour. Hover/active items are the same hue
 * shifted in lightness; the secondary colour marks the company badge and
 * focus ring.
 */
function brandSidebarTokens(bg: Oklch, accent: Oklch): ThemeTokens {
  const fg = readableOn(bg);
  const lightText = fg === WHITE;
  // Move toward the text colour so hover/active stand out on either kind of bg.
  const shift = (amount: number): Oklch => ({ ...bg, l: Math.min(0.97, Math.max(0.05, bg.l + (lightText ? amount : -amount))) });
  return {
    '--sidebar': css(bg),
    '--sidebar-foreground': css(fg),
    '--sidebar-accent': css(shift(0.08)),
    '--sidebar-accent-foreground': css(fg),
    '--sidebar-primary': css(accent),
    '--sidebar-primary-foreground': css(readableOn(accent)),
    '--sidebar-border': lightText ? 'oklch(1 0 0 / 15%)' : 'oklch(0 0 0 / 12%)',
    '--sidebar-ring': css(accent),
  };
}

/** True when the sidebar background is dark enough to need the dark-mode logo. */
export function sidebarIsDark(primaryHex: string, mode: 'light' | 'dark', sidebar: SidebarStyle): boolean {
  if (sidebar === 'neutral') return mode === 'dark';
  if (mode === 'dark') return true;
  return readableOn(hexToOklch(primaryHex)) === WHITE;
}

export interface ExtractedColor {
  hex: string;
  /** `fill`: a solid fill/stroke. `gradient`: a gradient stop (less representative). */
  source: 'fill' | 'gradient';
}

/** Every distinct hex / rgb() colour in an SVG's markup, solid fills first. */
export function extractSvgColors(svg: string): ExtractedColor[] {
  const found = new Map<string, ExtractedColor['source']>();
  const add = (hex: string, source: ExtractedColor['source']) => {
    const normalized = normalizeHex(hex);
    if (normalized && (!found.has(normalized) || source === 'fill')) found.set(normalized, source);
  };

  for (const m of svg.matchAll(/stop-color\s*[:=]\s*["']?\s*(#[0-9a-f]{3,6}\b|rgb\([^)]*\))/gi)) {
    add(m[1], 'gradient');
  }
  const withoutStops = svg.replace(/stop-color\s*[:=]\s*["']?\s*(#[0-9a-f]{3,6}\b|rgb\([^)]*\))/gi, '');
  for (const m of withoutStops.matchAll(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b|rgb\([^)]*\)/gi)) {
    add(m[0], 'fill');
  }

  return [...found]
    .map(([hex, source]) => ({ hex, source }))
    .sort((a, b) => (a.source === b.source ? 0 : a.source === 'fill' ? -1 : 1));
}

/**
 * Best guess at a brand pair from a logo's colours: primary is a strong,
 * readable colour (works as a button on white); secondary is the next colour
 * with a clearly different hue. Solid fills win over gradient stops.
 */
export function suggestBrandColors(colors: ExtractedColor[]): { primary: string; secondary: string } | null {
  const chromatic = colors
    .map((color) => ({ ...color, oklch: hexToOklch(color.hex) }))
    .filter(({ oklch }) => oklch.c > 0.05);
  if (chromatic.length === 0) return null;

  const primary =
    chromatic.find(({ oklch }) => contrastRatio(oklch, WHITE) >= 4.5) ??
    chromatic.find(({ oklch }) => contrastRatio(oklch, WHITE) >= 3) ??
    chromatic[0];
  const secondary =
    chromatic.find(({ oklch }) => hueDistance(oklch.h, primary.oklch.h) >= 40) ??
    chromatic.find((color) => color !== primary) ??
    primary;

  return { primary: primary.hex, secondary: secondary.hex };
}

function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function normalizeHex(value: string): string | null {
  const rgb = value.match(/rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
  if (rgb) {
    return '#' + rgb.slice(1, 4).map((n) => Math.min(255, +n).toString(16).padStart(2, '0')).join('');
  }
  try {
    return oklchToHex(hexToOklch(value));
  } catch {
    return null;
  }
}
