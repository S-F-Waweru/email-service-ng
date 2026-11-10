import {
  buildBrandTokens,
  buildScale,
  parseOklch,
  contrastRatio,
  extractSvgColors,
  hexToOklch,
  INK,
  oklchToHex,
  readableOn,
  suggestBrandColors,
  WHITE,
} from './color';

describe('color', () => {
  it('round-trips hex through OKLCH', () => {
    for (const hex of ['#2563eb', '#f59e0b', '#000000', '#ffffff', '#10b981']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });

  it('accepts 3-digit hex and rejects junk', () => {
    expect(oklchToHex(hexToOklch('#fff'))).toBe('#ffffff');
    expect(() => hexToOklch('blue')).toThrow(/Invalid hex/);
  });

  it('picks readable text for light and dark brand colours', () => {
    expect(readableOn(hexToOklch('#1e3a8a'))).toBe(WHITE); // dark navy
    expect(readableOn(hexToOklch('#fde047'))).toBe(INK); // light yellow
  });

  it('keeps text-on-primary readable (WCAG AA for large text) in both modes', () => {
    for (const hex of ['#2563eb', '#f59e0b', '#111111', '#fef08a', '#16a34a']) {
      const { light, dark } = buildBrandTokens(hex, hex);
      for (const tokens of [light, dark]) {
        const bg = parse(tokens['--primary']);
        const fg = parse(tokens['--primary-foreground']);
        expect(contrastRatio(bg, fg)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('lifts a very dark primary in dark mode', () => {
    const { dark } = buildBrandTokens('#111111', '#111111');
    expect(parse(dark['--primary']).l).toBeGreaterThanOrEqual(0.62);
  });
});

function parse(value: string) {
  const [l, c, h] = value.replace(/oklch\(|\)/g, '').split(' ').map(Number);
  return { l, c, h };
}

describe('extractSvgColors / suggestBrandColors', () => {
  const svg = `<svg><defs><style>.a{fill:url(#g)}.b,.c{fill:#9a205b;}.d{fill:#f5b61b;}.e{fill:#fff;}</style>
    <linearGradient id="g"><stop offset="0" stop-color="#d8408d"/><stop offset="1" stop-color="#720539"/></linearGradient></defs></svg>`;

  it('lists solid fills before gradient stops', () => {
    expect(extractSvgColors(svg)).toEqual([
      { hex: '#9a205b', source: 'fill' },
      { hex: '#f5b61b', source: 'fill' },
      { hex: '#ffffff', source: 'fill' },
      { hex: '#d8408d', source: 'gradient' },
      { hex: '#720539', source: 'gradient' },
    ]);
  });

  it('suggests a readable primary and a different-hue secondary', () => {
    expect(suggestBrandColors(extractSvgColors(svg))).toEqual({ primary: '#9a205b', secondary: '#f5b61b' });
  });

  it('returns null for a monochrome logo', () => {
    expect(suggestBrandColors(extractSvgColors('<svg fill="#000"><path fill="#ffffff"/></svg>'))).toBeNull();
  });
});

describe('buildScale / parseOklch / status tokens', () => {
  it('builds an 11-step scale from light to dark with the same hue', () => {
    const scale = buildScale('#9a205b');
    expect(scale.map((s) => s.step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    for (let i = 1; i < scale.length; i++) expect(scale[i].oklch.l).toBeLessThan(scale[i - 1].oklch.l);
    expect(new Set(scale.map((s) => Math.round(s.oklch.h)))).toEqual(new Set([Math.round(hexToOklch('#9a205b').h)]));
  });

  it('makes a near-grey scale when chroma is forced low', () => {
    expect(buildScale('#9a205b', 0.012).every((s) => s.oklch.c <= 0.012)).toBe(true);
  });

  it('parses oklch() values, with % lightness and alpha', () => {
    expect(parseOklch('oklch(0.5 0.1 200)')).toEqual({ l: 0.5, c: 0.1, h: 200 });
    expect(parseOklch('oklch(50% 0.1 200 / 40%)')).toEqual({ l: 0.5, c: 0.1, h: 200 });
    expect(parseOklch('#fff')).toBeNull();
  });

  it('adds status colour tokens only for overridden statuses', () => {
    const { light, dark } = buildBrandTokens('#9a205b', '#f5b61b', 'neutral', { warning: '#ea580c' });
    expect(light['--warning']).toBeDefined();
    expect(dark['--warning']).toBeDefined();
    expect(light['--success']).toBeUndefined();
  });
});
