export type ThemeMode = 'light' | 'dark' | 'system';

export interface LogoSource {
  light: string;
  /** Used in dark mode; falls back to `light`. */
  dark?: string;
}

export interface BrandConfig {
  name: string;
  /** Short name for tight spots (collapsed sidebar tooltip, browser tab). */
  shortName?: string;
  logo: {
    primary: LogoSource;
    secondary: LogoSource;
  };
  colors: {
    /** Hex, e.g. `#2563eb`. */
    primary: string;
    /** Hex, e.g. `#f59e0b`. */
    secondary: string;
  };
  /** Corner radius in rem. */
  radius: number;
  defaultMode: ThemeMode;
}
