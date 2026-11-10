// Fonts the theme lab offers. `google` is the Google Fonts css2 family spec;
// leave it out for fonts that need no download.

export interface FontOption {
  id: string;
  label: string;
  /** CSS font-family list. */
  family: string;
  google?: string;
}

const SYSTEM =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

export const FONTS: FontOption[] = [
  { id: 'system', label: 'System', family: SYSTEM },
  { id: 'inter', label: 'Inter', family: `'Inter', ${SYSTEM}`, google: 'Inter:wght@400;500;600;700' },
  { id: 'dm-sans', label: 'DM Sans', family: `'DM Sans', ${SYSTEM}`, google: 'DM+Sans:wght@400;500;600;700' },
  { id: 'manrope', label: 'Manrope', family: `'Manrope', ${SYSTEM}`, google: 'Manrope:wght@400;500;600;700' },
  {
    id: 'plus-jakarta',
    label: 'Plus Jakarta Sans',
    family: `'Plus Jakarta Sans', ${SYSTEM}`,
    google: 'Plus+Jakarta+Sans:wght@400;500;600;700',
  },
  { id: 'outfit', label: 'Outfit', family: `'Outfit', ${SYSTEM}`, google: 'Outfit:wght@400;500;600;700' },
  { id: 'nunito-sans', label: 'Nunito Sans', family: `'Nunito Sans', ${SYSTEM}`, google: 'Nunito+Sans:wght@400;500;600;700' },
  { id: 'ibm-plex', label: 'IBM Plex Sans', family: `'IBM Plex Sans', ${SYSTEM}`, google: 'IBM+Plex+Sans:wght@400;500;600;700' },
  { id: 'poppins', label: 'Poppins', family: `'Poppins', ${SYSTEM}`, google: 'Poppins:wght@400;500;600;700' },
];

export function fontById(id: string | undefined): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

export function googleFontsUrl(font: FontOption): string | null {
  return font.google ? `https://fonts.googleapis.com/css2?family=${font.google}&display=swap` : null;
}
