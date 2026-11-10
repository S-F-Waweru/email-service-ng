import { brand } from './brand.config';

export interface ThemePreset {
  name: string;
  primary: string;
  secondary: string;
  radius: number;
}

/** Starting points for the theme lab. Add your own; they only affect /theme. */
export const THEME_PRESETS: ThemePreset[] = [
  { name: 'This project', primary: brand.colors.primary, secondary: brand.colors.secondary, radius: brand.radius },
  { name: 'Spartan neutral', primary: '#18181b', secondary: '#f4f4f5', radius: 0.625 },
  { name: 'Ocean', primary: '#0369a1', secondary: '#14b8a6', radius: 0.5 },
  { name: 'Forest', primary: '#166534', secondary: '#ca8a04', radius: 0.375 },
  { name: 'Sunset', primary: '#c2410c', secondary: '#7c3aed', radius: 0.75 },
  { name: 'Indigo', primary: '#4f46e5', secondary: '#ec4899', radius: 1 },
  { name: 'Graphite', primary: '#334155', secondary: '#0ea5e9', radius: 0 },
];
