import type { BrandConfig } from './brand.types';

/**
 * The one file to edit to rebrand the dashboard.
 *
 * - Logos: put the files in `public/brand/` and point to them here (paths
 *   start with `/`). SVG is best; PNG/WebP work too.
 *   - `primary`   full logo (icon + name): login page, expanded sidebar.
 *   - `secondary` compact mark/icon: collapsed sidebar, mobile header, favicon.
 *   - `dark` variants are optional; leave them out if the logo works on both.
 * - Colours: any hex value. Everything else (text-on-colour, focus rings,
 *   hover tints, sidebar, charts, dark-mode versions) is derived from these.
 *   - `primary`   main buttons, links, active nav item, focus ring.
 *   - `secondary` secondary buttons and badges, second chart series.
 */
export const brand: BrandConfig = {
  name: 'Helapay Email Service',
  shortName: 'Helapay',

  logo: {
    // Wordmark is plum (#9a205b) in the original; the dark file swaps it for
    // white so it reads on dark backgrounds. The mark (petals) works on both.
    primary: { light: '/brand/helapay-logo.svg', dark: '/brand/helapay-logo-dark.svg' },
    secondary: { light: '/brand/helapay-mark.svg' },
  },

  // Taken from the logo: plum wordmark and gold "pay".
  colors: {
    primary: '#9a205b',
    secondary: '#f5b61b',
  },

  // Corner radius in rem. 0 = square, 0.625 = Spartan default, 1 = very round.
  radius: 0.625,

  // 'primary' fills the sidebar with the primary colour; 'neutral' keeps it light/grey.
  sidebar: 'primary',

  // What first-time visitors get before they pick a mode themselves.
  defaultMode: 'system',
};
