# Theme kit (Spartan + Tailwind 4)

Brand-driven theming for any Angular project using spartan/ui. You set a name,
two logos and two colours in `brand.config.ts`, and every Spartan component
follows: text-on-colour contrast, dark-mode versions, hover tints, focus ring,
sidebar, charts, favicon and page title are all derived.

`/theme` is a theme lab: presets, colour pickers, radius, logo upload (SVG
colours are extracted and a primary/secondary pair suggested), and a live
preview of real components in light and dark. Nothing there is saved; copy the
snippet it gives you into `brand.config.ts`.

## Files

| File | What it is |
|---|---|
| `brand.config.ts` | **The only file you edit per project.** Name, logos, colours, radius, default mode. |
| `brand.types.ts` | Config types. |
| `color.ts` | Hex ↔ OKLCH, contrast, token builder, SVG colour extraction. No Angular. |
| `theme.service.ts` | Applies tokens, light/dark/system mode, favicon, title. |
| `brand-logo.ts` | `<app-brand-logo />` / `<app-brand-logo variant="secondary" />`, swaps dark file automatically. |
| `theme-toggle.ts` | Light/dark/system dropdown for a header. |
| `theme-preview.ts` | The `/theme` lab page. |
| `presets.ts` | Lab presets; add your own. |
| `color.spec.ts` | Unit tests for the colour maths. |

## Copy into another project

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
6. `styles.css`: add the status colours used by the lab's badges (optional
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
