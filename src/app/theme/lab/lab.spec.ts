import { fromQueryParams, toQueryParams } from './lab-state';
import { makeDarkVariant } from './logo-tools';

describe('share links', () => {
  it('round-trips a theme through query params', () => {
    const theme = {
      colors: { primary: '#9a205b', secondary: '#f5b61b' },
      radius: 0.5,
      sidebar: 'primary' as const,
      font: 'inter',
      status: { warning: '#ea580c' },
    };
    const params = toQueryParams(theme);
    expect(params).toEqual({ p: '9a205b', s: 'f5b61b', r: '0.5', sb: 'p', f: 'inter', warn: 'ea580c' });
    expect(fromQueryParams((k) => params[k] ?? null)).toEqual(theme);
  });

  it('ignores invalid values and returns null for an empty link', () => {
    expect(fromQueryParams(() => null)).toBeNull();
    const bad: Record<string, string> = { p: 'zzz', s: '123456', r: '99', f: '<script>' };
    expect(fromQueryParams((k) => bad[k] ?? null)).toBeNull();
  });
});

describe('makeDarkVariant', () => {
  it('lightens colours that would vanish on a dark page and keeps bright ones', () => {
    const svg = '<svg><path fill="#9a205b"/><path fill="#F5B61B"/><path fill="#000"/></svg>';
    const { svg: out, replaced } = makeDarkVariant(svg);
    expect(replaced.map((r) => r.from).sort()).toEqual(['#000000', '#9a205b']);
    expect(out).toContain('#F5B61B');
    expect(out).not.toContain('#9a205b');
    expect(out).not.toContain('#000"');
  });
});
