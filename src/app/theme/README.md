# Theme kit (Spartan + Tailwind 4)

Brand-driven theming for any Angular project using spartan/ui. You set a name,
two logos and two colours in `brand.config.ts`, and every Spartan component
follows: text-on-colour contrast, dark-mode versions, hover tints, focus ring,
sidebar, charts, favicon and page title are all derived.

`/theme` is a theme lab:

- **Controls:** presets, saved themes (this browser), colour pickers, font
  (Google Fonts), corner radius, brand-coloured sidebar, status colours (with a
  warning when "warning" looks like your secondary colour).
- **Logo:** upload SVG/PNG logos; SVG colours are extracted and a pair
  suggested. Tools: *Make dark version* (lightens colours that vanish on dark
  backgrounds, downloadable SVG) and *Favicons* (16/32/180/192/512 PNGs).
- **Views:** Components, Sample screen (sidebar, table, stats, toasts), Scales
  (50–950 for primary, secondary and a brand-tinted grey), Contrast (WCAG
  ratios for 12 text/background pairs in light and dark), Export.
- **Light & dark** side by side, and **colour-blindness simulation**
  (protanopia, deuteranopia, tritanopia, achromatopsia).
- **Export:** brand.config snippet, CSS variables, Tailwind `@theme` scales,
  JSON design tokens, or a **share link** (`/theme?p=…&s=…`) that opens the lab
  with the theme loaded.

Nothing in the lab changes the app; copy the config into `brand.config.ts`.

## Files

| File | What it is |
|---|---|
| `brand.config.ts` | **The only file you edit per project.** Name, logos, colours, radius, default mode. |
| `brand.types.ts` | Config types. |
| `color.ts` | Hex ↔ OKLCH, contrast, token builder, SVG colour extraction. No Angular. |
| `theme.service.ts` | Applies tokens, light/dark/system mode, favicon, title. |
| `brand-logo.ts` | `<app-brand-logo />` / `<app-brand-logo variant="secondary" />`, swaps dark file automatically. |
| `theme-toggle.ts` | Light/dark/system dropdown for a header. |
| `theme-css.ts` | Builds the stylesheet (all tokens, light and dark) from a brand. |
| `fonts.ts` | Font choices and their Google Fonts URLs. |
| `theme-preview.ts/.html` | The `/theme` lab page. |
| `lab/` | Lab panels (contrast, scales, export, sample screen), share links and saved themes, logo tools, colour-blindness filters. |
| `presets.ts` | Lab presets; add your own. |
| `color.spec.ts` | Unit tests for the colour maths. |

## Copy into another project

The sample screen's toast buttons need `<hlm-toaster />` in the app root.

Requires spartan/ui set up with Tailwind 4 (`@spartan-ng/brain/hlm-tailwind-preset.css`
imported in `styles.css`), `@ng-icons/lucide`, and these helm components:
`button card input label separator switch badge dropdown-menu`
(`npx ng g @spartan-ng/cli:ui <name>`).

1. Copy this `theme/` folder to `src/app/theme/`.
2. Put the logos in `public/brand/` and edit `brand.config.ts`.
3. `app.config.ts`: create the service at startup.
   ```ts
   provideAppInitializer(() => { inject(ThemeService); }),
   ```
4. `app.routes.ts`: add the lab.
   ```ts
   { path: 'theme', loadComponent: () => import('./theme/theme-preview').then((m) => m.ThemePreview) },
   ```
5. `index.html`: add to `<head>` to avoid a white flash for dark-mode users
   (the key must match `THEME_MODE_STORAGE_KEY`).
   ```html
   <script>
     (function () {
       var mode = 'system';
       try { mode = localStorage.getItem('theme-mode') || 'system'; } catch (e) {}
       var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
       if (dark) document.documentElement.classList.add('dark');
     })();
   </script>
   ```
6. `styles.css`: change `:root {` to `:root, .light {` and `:root.dark {` to
   `:root.dark, .dark {` (lets the lab show light and dark side by side).
7. `styles.css`: add the status colours used by the lab's badges (optional
   elsewhere). Inside `@theme inline { ... }`, `:root { ... }` and `:root.dark { ... }`:
   ```css
   @theme inline {
     --color-success: var(--success);
     --color-success-foreground: var(--success-foreground);
     --color-warning: var(--warning);
     --color-warning-foreground: var(--warning-foreground);
   }
   :root {
     --success: oklch(0.596 0.145 163.225);
     --success-foreground: oklch(0.985 0 0);
     --warning: oklch(0.666 0.179 58.318);
     --warning-foreground: oklch(0.141 0.005 285.823);
   }
   :root.dark {
     --success: oklch(0.696 0.17 162.48);
     --success-foreground: oklch(0.141 0.005 285.823);
     --warning: oklch(0.769 0.188 70.08);
     --warning-foreground: oklch(0.141 0.005 285.823);
   }
   ```

## How it works

`ThemeService` turns the two brand colours into Spartan's CSS variables
(`--primary`, `--secondary`, `--accent`, `--ring`, `--sidebar-*`, `--chart-1/2`)
and writes them into a `<style id="brand-theme">` at the end of `<head>`, so
they override `styles.css` at equal specificity. Neutrals (background, border,
muted) are left as defined in `styles.css`. Because it happens at runtime, the
brand can also be changed later per tenant with `ThemeService.previewBrand()`.

## Spartan styles

The component *style* (`"style"` in `components.json`, e.g. `mira`) is baked
into the helm files when they are generated, so it can't be switched in the
lab. To compare styles, regenerate the helm components on a separate branch
with a different style and open `/theme` there.
