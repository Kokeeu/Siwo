# Siwö project instructions

## Project context

Siwö is a static anime music archive built with Astro and a React search island. The catalogue is generated at build time from AniTousen and enriched through AniList and Kitsu. Production is deployed to a GitHub Pages repository subpath.

- Read `DESIGN.md` before changing layout, styling, imagery, typography, motion, or responsive behavior.
- Use the project skill at `.agents/skills/siwo-project/SKILL.md` for Siwö-specific implementation and maintenance work.
- Preserve the existing Astro, React, Tailwind, and npm structure.

## Change boundaries

- Keep the site statically generated; do not add a runtime database or server without an explicit requirement.
- Do not manually maintain `public/data.json` or metadata caches. Change `scripts/build-index.js` when data generation behavior must change.
- Preserve the resilient data fallback: a provider outage must not prevent a valid cached catalogue from building.
- Asset paths in application code must respect `import.meta.env.BASE_URL` so GitHub Pages subpath deployment continues to work.
- Reuse the editorial assets under `public/editorial/` before adding new image files.
- Do not commit, push, publish, or trigger a deployment unless the user explicitly asks.

## Validation

- For documentation-only changes, run `git diff --check`.
- For source, configuration, dependency, or pipeline changes, run `npm run build`.
- For meaningful visual changes, check desktop and narrow mobile layouts, keyboard focus, and reduced-motion behavior.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
