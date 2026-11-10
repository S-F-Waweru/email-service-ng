export type ThemeMode = 'light' | 'dark' | 'system';

/** `neutral`: Spartan's light/grey sidebar. `primary`: filled with the primary colour. */
export type SidebarStyle = 'neutral' | 'primary';

export interface StatusColors {
  /** Delivered, active, saved. */
  success?: string;
  /** Queued, retrying, unsaved. */
  warning?: string;
  /** Failed, delete, errors. */
  destructive?: string;
}

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
  /** Sidebar background. Default `neutral`. */
  sidebar?: SidebarStyle;
  /** Font id from fonts.ts (e.g. 'inter'). Default: the system font. */
  font?: string;
  /** Override the status colours (hex). Each is optional. */
  status?: StatusColors;
  defaultMode: ThemeMode;
}
