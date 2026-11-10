import type { BrandConfig } from './brand.types';
import { buildBrandTokens, type ThemeTokens } from './color';
import { fontById } from './fonts';

export type ThemeInput = Pick<BrandConfig, 'colors' | 'radius' | 'sidebar' | 'font' | 'status'>;

/** Every CSS variable the brand sets, for light and dark. */
export function themeTokens(brand: ThemeInput): { light: ThemeTokens; dark: ThemeTokens } {
  const { light, dark } = buildBrandTokens(
    brand.colors.primary,
    brand.colors.secondary,
    brand.sidebar,
    brand.status,
  );
  return {
    light: {
      '--radius': `${brand.radius}rem`,
      ...(brand.font && brand.font !== 'system' ? { '--font-sans': fontById(brand.font).family } : {}),
      ...light,
    },
    dark,
  };
}

/**
 * The stylesheet ThemeService injects. `.light` / `.dark` let any element show
 * one mode regardless of the page (theme lab side-by-side view).
 */
export function themeStylesheet(brand: ThemeInput): string {
  const { light, dark } = themeTokens(brand);
  return `:root,\n.light {\n${declarations(light)}\n}\n\n:root.dark,\n.dark {\n${declarations(dark)}\n}\n`;
}

function declarations(tokens: ThemeTokens): string {
  return Object.entries(tokens)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
}
