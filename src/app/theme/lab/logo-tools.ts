import { contrastRatio, hexToOklch, oklchToHex } from '../color';

const DARK_BG = hexToOklch('#18181b');

/**
 * Dark-background version of an SVG logo: any colour that would be hard to
 * see on a dark page (contrast < 3:1) is lightened, keeping its hue.
 * Gradients and bright colours are left alone. Returns the new SVG and what changed.
 */
export function makeDarkVariant(svg: string): { svg: string; replaced: { from: string; to: string }[] } {
  const replaced = new Map<string, string>();
  const out = svg.replace(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi, (match) => {
    const hex = normalize(match);
    if (replaced.has(hex)) return replaced.get(hex)!;
    const color = hexToOklch(hex);
    if (contrastRatio(color, DARK_BG) >= 3) return match;
    const light = color.c > 0.04 ? { l: 0.88, c: Math.min(color.c, 0.09), h: color.h } : { l: 0.97, c: 0, h: 0 };
    const to = oklchToHex(light);
    replaced.set(hex, to);
    return to;
  });
  return { svg: out, replaced: [...replaced].map(([from, to]) => ({ from, to })) };
}

/** PNG data URL of an image (SVG or bitmap) centred in a square. */
export function renderPng(src: string, size: number, background?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not available'));
      if (background) {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size, size);
      }
      // Some SVGs report 0×0 without width/height attributes; assume square.
      const w = img.naturalWidth || size;
      const h = img.naturalHeight || size;
      const scale = Math.min(size / w, size / h);
      ctx.drawImage(img, (size - w * scale) / 2, (size - h * scale) / 2, w * scale, h * scale);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Could not load the logo image'));
    img.src = src;
  });
}

export function download(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
}

function normalize(hex: string): string {
  const v = hex.slice(1).toLowerCase();
  return '#' + (v.length === 3 ? v.split('').map((c) => c + c).join('') : v);
}
