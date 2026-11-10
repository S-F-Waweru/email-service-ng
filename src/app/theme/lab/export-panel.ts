import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy, lucideDownload } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { buildScale } from '../color';
import { themeStylesheet, themeTokens } from '../theme-css';
import { ThemeService } from '../theme.service';
import { download } from './logo-tools';
import { toQueryParams } from './lab-state';

type Format = 'config' | 'css' | 'tailwind' | 'json' | 'link';

/** The current theme as brand.config, CSS, Tailwind, JSON tokens or a share link. */
@Component({
  selector: 'app-export-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon, HlmButton],
  providers: [provideIcons({ lucideCheck, lucideCopy, lucideDownload })],
  template: `
    <div class="mb-3 flex flex-wrap items-center gap-1" role="tablist" aria-label="Export format">
      @for (f of formats; track f.id) {
        <button
          hlmBtn
          size="sm"
          role="tab"
          [variant]="format() === f.id ? 'secondary' : 'ghost'"
          [attr.aria-selected]="format() === f.id"
          (click)="format.set(f.id)"
        >
          {{ f.label }}
        </button>
      }
      <span class="ms-auto flex gap-1">
        <button hlmBtn size="sm" variant="outline" (click)="copy()">
          <ng-icon [name]="copied() ? 'lucideCheck' : 'lucideCopy'" />
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
        @if (format() !== 'link') {
          <button hlmBtn size="sm" variant="outline" (click)="save()">
            <ng-icon name="lucideDownload" />
            Download
          </button>
        }
      </span>
    </div>
    <p class="text-muted-foreground mb-2 text-xs">{{ hint() }}</p>
    <pre class="bg-muted max-h-[60svh] overflow-auto rounded-md p-3 text-[11px] leading-relaxed"><code>{{ output() }}</code></pre>
  `,
})
export class ExportPanel {
  private readonly theme = inject(ThemeService);
  protected readonly format = signal<Format>('config');
  protected readonly copied = signal(false);

  protected readonly formats: { id: Format; label: string; hint: string; file: string }[] = [
    { id: 'config', label: 'brand.config', hint: 'Paste into theme/brand.config.ts (keeps your name and logos).', file: 'brand.config.snippet.ts' },
    { id: 'css', label: 'CSS', hint: 'Spartan variables for projects without the theme kit. Put after the Spartan preset in styles.css.', file: 'theme.css' },
    { id: 'tailwind', label: 'Tailwind', hint: 'Adds bg-brand-500, text-accent-200, bg-neutral-100… utilities. Put in styles.css.', file: 'brand-colors.css' },
    { id: 'json', label: 'JSON tokens', hint: 'Design tokens for other tools (Figma plugins, mobile apps…).', file: 'theme-tokens.json' },
    { id: 'link', label: 'Share link', hint: 'Opens the lab with this theme loaded. Logos are not included.', file: '' },
  ];

  private readonly input = computed(() => {
    const b = this.theme.brand();
    return { colors: b.colors, radius: b.radius, sidebar: b.sidebar, font: b.font, status: b.status };
  });

  protected readonly hint = computed(() => this.formats.find((f) => f.id === this.format())!.hint);

  protected readonly output = computed(() => {
    const t = this.input();
    switch (this.format()) {
      case 'config': {
        const lines = [
          `colors: {`,
          `  primary: '${t.colors.primary}',`,
          `  secondary: '${t.colors.secondary}',`,
          `},`,
          `radius: ${t.radius},`,
          `sidebar: '${t.sidebar ?? 'neutral'}',`,
        ];
        if (t.font && t.font !== 'system') lines.push(`font: '${t.font}',`);
        const status = Object.entries(t.status ?? {}).filter(([, v]) => v);
        if (status.length) lines.push(`status: { ${status.map(([k, v]) => `${k}: '${v}'`).join(', ')} },`);
        return lines.join('\n');
      }
      case 'css':
        return themeStylesheet(t);
      case 'tailwind': {
        const scale = (name: string, hex: string, chroma?: number) =>
          buildScale(hex, chroma).map((s) => `  --color-${name}-${s.step}: ${s.hex};`).join('\n');
        return [
          '@theme {',
          scale('brand', t.colors.primary),
          '',
          scale('accent', t.colors.secondary),
          '',
          scale('neutral', t.colors.primary, 0.012),
          '}',
        ].join('\n');
      }
      case 'json': {
        const scales = (hex: string, chroma?: number) =>
          Object.fromEntries(buildScale(hex, chroma).map((s) => [s.step, s.hex]));
        return JSON.stringify(
          {
            brand: t,
            tokens: themeTokens(t),
            scales: {
              brand: scales(t.colors.primary),
              accent: scales(t.colors.secondary),
              neutral: scales(t.colors.primary, 0.012),
            },
          },
          null,
          2,
        );
      }
      case 'link': {
        const url = new URL(window.location.href);
        url.search = new URLSearchParams(toQueryParams(t)).toString();
        return url.toString();
      }
    }
  });

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.output());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    } catch {
      // Clipboard blocked: the text is selectable.
    }
  }

  protected save(): void {
    const format = this.formats.find((f) => f.id === this.format())!;
    const type = format.id === 'json' ? 'application/json' : 'text/plain';
    const url = URL.createObjectURL(new Blob([this.output()], { type }));
    download(url, format.file);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
