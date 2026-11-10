import type { StatusColors } from '../brand.types';
import type { ThemeInput } from '../theme-css';

// Share links (?p=9a205b&s=f5b61b&r=0.625&sb=p&f=inter&ok=…) and saved themes.

const HEX = /^[0-9a-f]{6}$/i;
const STATUS_KEYS: Record<keyof StatusColors, string> = { success: 'ok', warning: 'warn', destructive: 'err' };

export function toQueryParams(theme: ThemeInput): Record<string, string> {
  const params: Record<string, string> = {
    p: theme.colors.primary.replace('#', ''),
    s: theme.colors.secondary.replace('#', ''),
    r: String(theme.radius),
    sb: theme.sidebar === 'primary' ? 'p' : 'n',
  };
  if (theme.font && theme.font !== 'system') params['f'] = theme.font;
  for (const [key, short] of Object.entries(STATUS_KEYS)) {
    const hex = theme.status?.[key as keyof StatusColors];
    if (hex) params[short] = hex.replace('#', '');
  }
  return params;
}

/** Reads a share link. Invalid values are ignored; null if there's nothing usable. */
export function fromQueryParams(get: (key: string) => string | null): Partial<ThemeInput> | null {
  const result: Partial<ThemeInput> = {};
  const p = get('p');
  const s = get('s');
  if (p && HEX.test(p) && s && HEX.test(s)) result.colors = { primary: `#${p.toLowerCase()}`, secondary: `#${s.toLowerCase()}` };
  const r = Number(get('r'));
  if (get('r') !== null && Number.isFinite(r) && r >= 0 && r <= 2) result.radius = r;
  const sb = get('sb');
  if (sb === 'p' || sb === 'n') result.sidebar = sb === 'p' ? 'primary' : 'neutral';
  const f = get('f');
  if (f && /^[a-z0-9-]{1,40}$/.test(f)) result.font = f;
  const status: StatusColors = {};
  for (const [key, short] of Object.entries(STATUS_KEYS)) {
    const hex = get(short);
    if (hex && HEX.test(hex)) status[key as keyof StatusColors] = `#${hex.toLowerCase()}`;
  }
  if (Object.keys(status).length) result.status = status;
  return Object.keys(result).length ? result : null;
}

// ---- Saved themes (this browser only) -------------------------------------

export interface SavedTheme {
  name: string;
  savedAt: string;
  theme: ThemeInput;
}

const SAVED_KEY = 'theme-lab-saved';

export function loadSavedThemes(): SavedTheme[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]') as unknown;
    return Array.isArray(parsed) ? (parsed as SavedTheme[]).filter((t) => t?.name && t.theme?.colors) : [];
  } catch {
    return [];
  }
}

export function storeSavedThemes(themes: SavedTheme[]): boolean {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(themes));
    return true;
  } catch {
    return false;
  }
}
