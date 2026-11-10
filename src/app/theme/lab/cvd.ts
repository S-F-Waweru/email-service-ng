import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Colour-vision simulations (approximate), applied with `filter: url(#cvd-…)`. */
export const CVD_MODES = [
  { id: 'none', label: 'Normal vision' },
  { id: 'protanopia', label: 'Protanopia (no red)' },
  { id: 'deuteranopia', label: 'Deuteranopia (no green)' },
  { id: 'tritanopia', label: 'Tritanopia (no blue)' },
  { id: 'achromatopsia', label: 'Achromatopsia (no colour)' },
] as const;
export type CvdMode = (typeof CVD_MODES)[number]['id'];

/** Hidden SVG holding the filters. Render once on the page that uses them. */
@Component({
  selector: 'app-cvd-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'absolute size-0 overflow-hidden' },
  template: `
    <svg width="0" height="0">
      <filter id="cvd-protanopia" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
      </filter>
      <filter id="cvd-deuteranopia" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
      </filter>
      <filter id="cvd-tritanopia" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
      </filter>
      <filter id="cvd-achromatopsia" color-interpolation-filters="linearRGB">
        <feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" />
      </filter>
    </svg>
  `,
})
export class CvdFilters {}
