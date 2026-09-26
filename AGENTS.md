# Siwö — instrucciones del proyecto

Siwö es un archivo estático de música de anime (openings y endings) con estética de revista manga-editorial.
La interfaz es un shell Astro con una isla de búsqueda en React. El catálogo se genera en el build desde
AniTousen y se enriquece con AniList y Kitsu. La UI está en español. No hay base de datos ni servidor.

Stack fijo: `Astro 7.1`, `@astrojs/react 6`, `React 19`, `Tailwind CSS 4` (vía `@tailwindcss/vite`),
`Node.js >=22.12`, `npm`. No cambies de gestor de paquetes ni de framework sin requisito explícito.

## Alcance y precedencia

- Este archivo aplica a todo el repositorio.
- Si hay conflicto, gana en este orden: instrucción explícita del usuario > `AGENTS.md` más cercano al archivo editado > este `AGENTS.md` raíz.
- Fuente visual: lee `DESIGN.md` antes de tocar layout, estilos, imágenes, tipografía, movimiento o responsive.
- Workflow Siwö: usa el skill en `.agents/skills/siwo-project/SKILL.md`.
- Doc humana y panorama general: `README.md`.

## Comandos

```bash
npm install                              # instalar dependencias
npm run build-index                      # regenerar public/data.json con metadatos
npm run build-index -- --skip-metadata   # índice básico sin llamar a AniList/Kitsu
npm run build                            # build-index (prebuild) + astro build -> dist/
npm test                                 # node --test, suite en tests/
npx astro dev --background               # dev local en segundo plano
npx astro dev status                     # estado del servidor de fondo
npx astro dev logs                       # ver logs del servidor de fondo
npx astro dev stop                       # detener el servidor de fondo
```

Notas:

- `predev` y `prebuild` ejecutan `build-index` automáticamente.
- El dev local sirve en `http://localhost:4321`.
- El deploy usa `npm ci`, no `npm install` (ver `.github/workflows/deploy.yml`).
- Variables del pipeline en `scripts/build-index.js`: `ANITOUSEN_ZIP_URL`, `METADATA_CACHE_TTL_DAYS` (14),
  `API_REQUEST_TIMEOUT_MS` (15000), `API_DELAY_MS` (2100), `API_MAX_RETRIES` (2),
  `API_RETRY_BASE_MS`, `API_MAX_BACKOFF_MS`, `PROVIDER_MAX_FAILURES`, `BUILD_CHECKPOINT_INTERVAL`,
  `SKIP_METADATA=1`.

## Mapa del repositorio — qué leer antes de tocar cada zona

```text
anitousen-search/
├── AGENTS.md                            # este archivo: reglas para agentes
├── DESIGN.md                            # sistema visual manga-editorial
├── README.md                            # doc humana, demo y créditos
├── astro.config.mjs                     # output static + base para GitHub Pages
├── package.json                         # scripts npm y versiones
├── .github/workflows/deploy.yml         # build diario + deploy a Pages
├── .agents/skills/siwo-project/SKILL.md # skill reutilizable de Siwö
├── scripts/build-index.js               # pipeline de datos (único script)
├── tests/                               # catalog.test.js, searchState.test.js
├── public/                              # estáticos + artefactos generados
│   ├── data.json                        # GENERADO, no editar a mano
│   ├── metadata-cache.json              # GENERADO, caché AniList/Kitsu
│   ├── jikan-cache.json                 # GENERADO legacy, no editar
│   ├── editorial/*.jpg                  # 10 piezas editoriales canónicas
│   ├── og.png, placeholder.jpg/png      # social y fallback de portadas
│   └── favicon*, apple-touch-icon.png, avatar.jpg
├── src/pages/index.astro                # única ruta: monta Layout + SearchApp
├── src/layouts/Layout.astro             # <head>, SEO/OG/canonical, fuentes, CSS global
├── src/components/SearchApp.jsx         # isla React: estado, filtros, paginación, modal
├── src/components/search/               # Hero, SearchControls, FilterSelect, ArchiveResults, AnimeCard, HeaderNav
├── src/components/AnimeModal.jsx        # ficha editorial (foco, Escape, links)
├── src/components/AnimeSkeleton.jsx     # esqueleto de carga de tarjetas
├── src/components/Footer.jsx            # cierre oscuro con créditos y fuentes
├── src/state/searchState.js             # reducer + parse/serialize URL (q, season, year, page, anime)
├── src/hooks/useCatalog.js              # carga /data.json sobre los 20 iniciales
├── src/hooks/useSearchUrlState.js        # sincroniza filtros con URL e historial
├── src/hooks/useModalDialog.js          # trampa de foco y scroll del modal
├── src/hooks/useReveal.js               # reveals al paginar/filtrar
├── src/hooks/useScrolledHeader.js        # estado scrolled del header
├── src/utils/catalog.js                 # filterCatalog, paginateCatalog (PAGE_SIZE=20), temporadas/años
├── src/utils/assets.js                  # HOME_URL y assetUrl() con BASE_URL
├── src/utils/season.js                  # helpers de temporada
└── src/styles/global.css                # tokens .manga-page, geometría, breakpoints
```

| Quiero cambiar… | Leer primero |
|---|---|
| Ruta de entrada / SSR inicial | `src/pages/index.astro` (corta a 20, pasa `dataUrl`) |
| SEO, canonical, OG, favicons, fuentes | `src/layouts/Layout.astro`, `DESIGN.md` |
| Buscador, filtros, grid, paginación | `src/components/SearchApp.jsx`, `src/components/search/*.jsx` |
| Ficha de anime (modal) | `src/components/AnimeModal.jsx`, `src/hooks/useModalDialog.js` |
| Estado de búsqueda y URLs compartibles | `src/state/searchState.js`, `src/hooks/useSearchUrlState.js` |
| Carga del catálogo completo | `src/hooks/useCatalog.js` (fallback a los 20 iniciales si falla fetch) |
| Filtrado, orden, paginación, `PAGE_SIZE` | `src/utils/catalog.js`, `tests/catalog.test.js` |
| Rutas de assets con subpath | `src/utils/assets.js`, `astro.config.mjs` |
| Colores, tipografías, bordes, sombras, responsive | `DESIGN.md`, `src/styles/global.css` (`.manga-page`) |
| Datos, cachés, reintentos, fallback | `scripts/build-index.js` |
| Base path, `site`, output estático | `astro.config.mjs` |
| CI, caché del índice, cron diario, artefacto `dist/` | `.github/workflows/deploy.yml` |
| Tests | `tests/catalog.test.js`, `tests/searchState.test.js` (`npm test`) |
| Presentación del repo, demo, badges, créditos | `README.md` |

## Pipeline de datos

- Flujo: ZIP de AniTousen (`ANITOUSEN_ZIP_URL`) → `scripts/build-index.js` → enriquece con AniList/Kitsu → `public/data.json`.
- `public/data.json`, `public/metadata-cache.json` y `public/jikan-cache.json` son artefactos generados. Haz cambios duraderos en `scripts/build-index.js`.
- Comportamiento resiliente obligatorio: si AniList/Kitsu fallan, conserva lo básico de AniTousen; si el ZIP no se puede actualizar, reutiliza el último `data.json` válido. No rompas este fallback.
- Para iterar rápido sin red: `npm run build-index -- --skip-metadata`.

## Convenciones de código

- Astro para shell y rutas (`.astro`); React solo en la isla (`SearchApp` con `client:load`) y componentes `.jsx`; utilidades y hooks en `.js`.
- No introduzcas otro framework UI, otro sistema de estilos ni una API en runtime.
- Todos los assets públicos en código deben usar el subpath de GitHub Pages:

```jsx
// ✅ Bien: respeta import.meta.env.BASE_URL vía HOME_URL
import { HOME_URL, assetUrl } from '../utils/assets.js';
const dataUrl = `${HOME_URL}data.json`;
const cover = assetUrl('editorial/hero-character.jpg');

// ❌ Mal: rompe el deploy bajo /<repo>/
const dataUrl = '/data.json';
```

- Preserva: filtros sincronizados con URL (`q, season, year, page, anime`), historial del navegador, navegación por teclado, `combobox/listbox` accesibles, foco visible, `prefers-reduced-motion` y placeholder si falta la portada (`public/placeholder.jpg`).
- Geometría cuadrada, bordes duros y sombras offset según `DESIGN.md`. No reintroduzcas teal anterior, glassmorphism ni cards redondeadas.

## Assets, imágenes y diseño

- Reutiliza `public/editorial/` antes de añadir imágenes: `hero-character.jpg`, `hero-panel-expression.jpg`, `hero-panel-profile.jpg`, `hero-panel-scene.jpg`, `hero-panel-smile.jpg`, `interlude-band.jpg`, `interlude-cowboy.jpg`, `interlude-goodbye-eri.jpg`, `interlude-lain.jpg`, `interlude-look-back.jpg`.
- `public/og.png` solo cambia si cambia la marca o el titular principal.
- Alt vacío para collage decorativo; alt conciso para imagen con contenido. Respeta `DESIGN.md` en accesibilidad y movimiento.

## No tocar y límites

- Nunca edites a mano: `public/data.json`, `public/metadata-cache.json`, `public/jikan-cache.json`, `dist/`, `node_modules/`, `.astro/`.
- Mantén el sitio estático (`output: 'static'` en `astro.config.mjs`). No añadas base de datos, servidor ni endpoints sin requisito explícito.
- No cambies `site`/`base` ni el flujo Actions→Pages sin que te lo pidan (prod sirve bajo `/<repo>`, dev en `/`).
- No commitees secretos ni `.env`. Nombra variables, nunca valores.
- No ejecutes `commit`, `push`, `publish` ni despliegues externos a menos que el usuario lo pida explícitamente.

## Validación

- Solo documentación: `git diff --check`.
- Código, config, dependencias o pipeline: `npm run build` (y `npm test` si tocas `src/utils/`, `src/state/` o añades tests).
- Cambio visual relevante: comprueba desktop y móvil estrecho, foco de teclado, `prefers-reduced-motion`, placeholder sin portada y que las rutas funcionen con el `BASE_URL` de Pages.

## Desarrollo local

Arranca siempre en segundo plano con `npx astro dev --background` y gestiónalo con `status`, `logs` y `stop`. No uses `astro dev` en primer plano bloqueando la sesión.
