---
name: siwo-project
description: Maintain or extend the Siwö anime sound archive repository, including its Astro and React interface, manga-editorial design system, AniTousen indexing pipeline, GitHub Pages deployment, and repository documentation. Use only for work inside this project.
---

# Siwö project

Preserve Siwö as a static, resilient anime music archive with a distinctive manga-editorial presentation.

## Start with the relevant source of truth

- Read `DESIGN.md` before changing UI, styling, imagery, motion, or social artwork.
- Read `AGENTS.md` for project-wide development and validation rules.
- Inspect `scripts/build-index.js` before changing data generation, caching, or provider behavior.
- Inspect `.github/workflows/deploy.yml` and `astro.config.mjs` before changing deployment.

## Choose the project surface

### Interface work

Keep the current Astro shell and React search island. Reuse the established tokens and editorial assets instead of introducing a parallel component language. Preserve keyboard behavior, URL-synchronized filters, browser history, reduced motion, and missing-image fallbacks.

All public asset URLs in application code must respect `import.meta.env.BASE_URL` because the production site is hosted below a GitHub Pages repository path.

### Data work

Treat `public/data.json` and metadata caches as generated artifacts. Make durable changes in `scripts/build-index.js`. Preserve the fallback that lets the static build continue when AniTousen, AniList, or Kitsu is temporarily unavailable.

### Repository presentation

Keep `README.md` concise and visual. Reuse `public/og.png` and `public/editorial/` assets rather than duplicating images. Keep the demo URL, workflow badge, commands, provider credits, and statement that the project does not host audio files accurate.

### Deployment work

Preserve static output, the GitHub Pages base path, and the Actions artifact flow unless the user explicitly requests a hosting migration.

## Validate proportionally

- Run `git diff --check` for documentation-only edits.
- Run `npm run build` for application, data-pipeline, configuration, or dependency changes.
- Start local development only in background mode with `astro dev --background`; use `astro dev status`, `astro dev logs`, and `astro dev stop` to manage it.
- For meaningful UI changes, verify both desktop and narrow mobile behavior while keeping the existing visual direction.

Do not commit, push, publish, or trigger external deployment unless the user asks.
