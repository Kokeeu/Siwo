# Siwö Design System

This document is the visual source of truth for Siwö. Use it when changing the landing experience, search interface, anime cards, modal, footer, social preview, or repository artwork.

## Product character

Siwö is an anime music archive presented like an independent Japanese music magazine. It should feel expressive and handmade without becoming difficult to scan.

The interface combines:

- manga panels and editorial crops;
- print-registration marks, halftone textures, and issue numbers;
- oversized condensed headlines;
- hard borders and offset shadows;
- a small, controlled palette;
- straightforward search and filtering behavior.

The product is an archive first. Decorative work must support discovery instead of competing with titles, filters, or actions.

## Design principles

### Editorial, not ornamental

Compose pages with clear sections, strong rules, labels, and intentional asymmetry. Every decorative element should reinforce the printed-magazine metaphor.

### Loud hierarchy, quiet controls

Headlines may be oversized and expressive. Search fields, filters, metadata, and modal actions should remain conventional and immediately understandable.

### Controlled imperfection

Use slight rotations, crop marks, halftones, and offset shadows sparingly. Avoid random distortion, excessive grain, or effects that reduce legibility.

### Static-first and resilient

The initial HTML must remain useful before React hydration. Missing artwork or metadata must degrade to the existing placeholders without breaking layout.

## Color system

The canonical tokens live on `.manga-page` in `src/styles/global.css`.

| Token | Value | Primary use |
|---|---|---|
| `--ink` | `#111111` | Text, borders, dark surfaces, hard shadows |
| `--paper` | `#f4f0e7` | Page background and warm paper surfaces |
| `--blue` | `#5a98cb` | Editorial emphasis, hover states, secondary accents |
| `--yellow` | `#f2c63d` | Labels, calls to action, active highlights |
| `--red` | `#e94b3c` | Small high-energy accents and destructive emphasis |

Guidelines:

- Prefer ink on paper for body content.
- Use yellow and blue as distinct editorial signals, not as gradients.
- Reserve red for small moments; it should not become the dominant page color.
- New colors require a clear semantic need and must work with the existing palette.
- Do not reintroduce the previous teal, glassmorphism, or rounded-card direction.

## Typography

| Role | Family | Usage |
|---|---|---|
| Display | `Archivo Black` | Hero headings, section titles, large numbers, brand wordmark |
| Japanese display | `Noto Sans JP` | Japanese labels and glyphs |
| Interface and body | `DM Sans` | Search, filters, cards, modal copy, supporting text |

Typography rules:

- Display text is usually uppercase with tight negative tracking.
- Interface labels use uppercase, heavy weight, and generous letter spacing.
- Body copy uses sentence case and comfortable line height.
- Japanese text is an accent and must not replace essential Spanish labels.
- Keep body copy readable at `14px` or larger; smaller sizes are reserved for short metadata labels.

## Geometry and depth

Siwö uses square geometry:

- borders: usually `2px` or `3px` solid ink;
- corners: square; avoid rounded cards, pills, and glass panels;
- shadows: hard offset shadows with no blur;
- rules: horizontal dividers establish editorial rhythm;
- texture: subtle grids or halftone dots may sit above imagery without obscuring it.

Interactive elements should move only a few pixels on hover. A hard shadow may grow or change accent color to signal elevation.

## Layout

- Maximum content width: `1320px`.
- Desktop hero: copy and editorial collage in two columns.
- Tablet hero: a single column with artwork below the introduction.
- Archive grid: four columns on large screens, then three, two, and one.
- Maintain the vertical issue rail and margin notes only when enough space is available.
- Primary touch targets must be at least `44px` high.

Existing responsive breakpoints in `src/styles/global.css` are the reference. Extend them only when a component cannot adapt through intrinsic layout.

## Component language

### Hero

The hero establishes the magazine-cover metaphor. Preserve the issue rail, large three-line title, short introduction, archive statistics, collage, and clear path to the catalogue.

### Search panel

Search is the product's primary control. Keep the title input first, followed by season and year. Selected values and keyboard focus must be obvious. Custom select behavior must remain keyboard accessible.

### Anime cards

Cards resemble numbered archive files. Preserve the file number, cover ratio, season/year metadata, title, score label, and explicit action. Artwork can crop, but titles must not be hidden by decoration.

### Anime modal

The modal is a detailed editorial spread. It must trap focus, close with Escape, restore body scrolling, and expose meaningful actions as normal links.

### Footer

The footer is a dark closing spread. Background panels may be atmospheric, but the brand, credits, update time, community link, and data sources must remain readable.

## Image direction

Canonical editorial assets live in `public/editorial/`:

- `hero-character.jpg`
- `hero-panel-expression.jpg`
- `hero-panel-profile.jpg`
- `hero-panel-scene.jpg`
- `hero-panel-smile.jpg`
- `interlude-band.jpg`
- `interlude-cowboy.jpg`
- `interlude-goodbye-eri.jpg`
- `interlude-lain.jpg`
- `interlude-look-back.jpg`

Use these before adding new imagery. New assets should match one of the established treatments: high-contrast monochrome manga, editorial poster, or a single flat accent background.

- Put deployable images in `public/` and reference them through `import.meta.env.BASE_URL` in application code.
- Use empty alt text for decorative collage panels.
- Give informative artwork concise alt text when it contributes content.
- Preserve `public/og.png` unless the brand or principal headline changes.
- Avoid AI-generated imitations of identifiable artists or existing characters.

## Motion

Motion should resemble pieces being placed on a printed page:

- short reveals, clipping, and small translations;
- staggered card entry;
- restrained floating on decorative hero panels;
- no continuous motion on core reading or control surfaces.

All animation must respect `prefers-reduced-motion`. Favor opacity and transforms; avoid layout-triggering animation.

## Accessibility

- Preserve visible `:focus-visible` treatment.
- Keep text contrast strong on every accent color.
- Associate labels with inputs and expose custom selects as combobox/listbox controls.
- Do not convey state through color alone.
- Decorative Japanese text and crop marks should use `aria-hidden="true"`.
- Modal and history behavior must remain usable with keyboard and browser navigation.
- Validate desktop and narrow mobile layouts after meaningful visual changes.

## GitHub Pages constraints

Production is served from a repository subpath. Never hardcode application assets to `/`.

- Build asset URLs with `import.meta.env.BASE_URL`.
- Keep the static output mode.
- Preserve canonical and social metadata in `src/layouts/Layout.astro`.
- Keep external links using `target="_blank"` paired with `rel="noopener noreferrer"`.

## Review checklist

Before completing a visual change, confirm:

- the result still reads as Siwö rather than a generic anime dashboard;
- search and filters remain the clearest interactive surface;
- the five canonical colors and three font roles are respected;
- paths work under the GitHub Pages base URL;
- desktop and mobile layouts remain coherent;
- keyboard focus and reduced-motion behavior are preserved;
- missing cover art still renders a stable placeholder;
- `npm run build` succeeds.
