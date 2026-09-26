# Siwö — sistema visual

Este documento es la fuente visual de verdad. Úsalo al cambiar landing, buscador, tarjetas,
modal, footer, preview social o artwork del repo. Las reglas de trabajo (comandos, pipeline,
deploy) viven en `AGENTS.md`; aquí solo manda lo visual.

Siwö es un archivo de música de anime con forma de revista musical japonesa independiente:
expresivo y hecho a mano, pero fácil de escanear. El archivo es lo primero; la decoración
apoya el descubrimiento, nunca compite con títulos, filtros o acciones.

## Principios

- **Editorial, no ornamental.** Secciones claras, reglas fuertes, etiquetas y asimetría
  intencionada. Cada adorno refuerza la metáfora impresa.
- **Jerarquía alta, controles sobrios.** Titulares grandes y expresivos; inputs, filtros,
  metadatos y acciones del modal convencionales y legibles.
- **Imperfección controlada.** Rotaciones leves, marcas de corte, halftones y sombras offset
  con moderación. Nada de distorsión aleatoria, grano excesivo o efectos que resten legibilidad.
- **Estático y resiliente.** El HTML inicial debe servir antes de hidratar React. Sin portada
  o sin metadatos, se degrada al placeholder sin romper el layout.

## Dónde vive cada cosa — mapa visual

| Pieza | Archivo | Clases / anclas |
|---|---|---|
| Tokens y base | `src/styles/global.css:45-52` | `.manga-page` (`--ink`, `--paper`, `--blue`, `--yellow`, `--red`), `body` papel `#f4f0e7` |
| Fuentes y `<head>` | `src/layouts/Layout.astro:46-51` | `Archivo Black`, `DM Sans`, `Noto Sans JP`; `.font-display` en `global.css:41-43` |
| Nav superior | `src/components/search/HeaderNav.jsx` | `.manga-nav` (`global.css:63-68`: borde inferior `2px ink`, sombra `4px yellow`) |
| Hero | `src/components/search/Hero.jsx` | `.manga-hero`, `.hero-shell`, `.hero-side-label`, `.hero-kicker`, `.hero-collage`, `.hero-copy`, `.hero-eyebrow`, `.hero-title` (+ `.hero-title-blue`), `.hero-intro`, `.hero-stats`, `.hero-art`, `.hero-frame-profile/top/scene/smile`, `.hero-character`, `.hero-stamp`, `.hero-scroll`, `.hero-print-code`, `.hero-registration`, `.hero-crop-mark`, `.hero-art-blue/yellow` |
| Panel de búsqueda | `src/components/search/SearchControls.jsx`, `FilterSelect.jsx` | `.search-panel` (`role="search"`, `data-reveal`), `.search-input-wrap`, `.custom-select-trigger` (`:focus-visible` en `global.css:775`) |
| Resultados y grid | `src/components/search/ArchiveResults.jsx` | `.results-bar` (delay de reveal en `global.css:562`), grid archivo `4 → 3 → 2 → 1` |
| Tarjeta anime | `src/components/search/AnimeCard.jsx` | `.anime-card`, `.anime-card-index` (`FILE` + número `01…`), `.anime-card-cover` (`object-cover`, `group-hover:scale-[1.04]`), `.anime-card-jp`, `.anime-card-score`, `.anime-card-copy`, `.anime-card-meta`, `.anime-card-action`; `data-reveal` con `--reveal-delay: min(index,12)*55ms`; título con `line-clamp-2` |
| Esqueleto de carga | `src/components/AnimeSkeleton.jsx` | Misma retícula que la tarjeta, sin contenido real |
| Modal ficha | `src/components/AnimeModal.jsx`, `src/hooks/useModalDialog.js` | `.modal-stat`, `.modal-stat-mark`, `object-cover` en portada; trampa de foco, cierre con `Escape`, restore de scroll, backdrop cierra al clicar fuera, drag-to-close en táctil |
| Footer | `src/components/Footer.jsx` | `.manga-footer`, `.footer-grid`, `.footer-bottom` (delay en `global.css:563`) |
| Reveals | `src/hooks/useReveal.js:1-29` + `global.css:548-563` | `[data-reveal]` → `.reveal-pending` → `.is-visible` vía `IntersectionObserver` (`threshold 0.12`); con `prefers-reduced-motion` o sin observer, todo visible directo |
| Foco global | `src/styles/global.css:1762-1765` | `:focus-visible`: `outline 3px solid #e94b3c`, `offset 3px` |
| Movimiento reducido | `src/styles/global.css:1771-1778`, `useReveal.js:6`, `SearchApp.jsx:76` | Animaciones a `.01ms`, reveals visibles, scroll suave → `auto` |

## Color

Tokens canónicos en `.manga-page` (`src/styles/global.css:45-52`):

| Token | Valor | Rol |
|---|---|---|
| `--ink` | `#111111` | Texto, bordes, superficies oscuras, sombras duras |
| `--paper` | `#f4f0e7` | Fondo página y superficies cálidas |
| `--blue` | `#5a98cb` | Énfasis editorial, hovers, acento secundario |
| `--yellow` | `#f2c63d` | Etiquetas, CTAs, highlight activo, sombra de nav |
| `--red` | `#e94b3c` | Acentos pequeños de alta energía, foco visible, sello `LISTEN 01` |

Reglas:

- Cuerpo siempre tinta sobre papel. Amarillo y azul son señales distintas, nunca en gradiente.
- Rojo solo en momentos pequeños; nunca color dominante de página.
- Un color nuevo exige necesidad semántica clara y debe convivir con la paleta.
- Prohibido reintroducir teal anterior (`#14b8a6`), glassmorphism o cards redondeadas
  (los restos legacy en `@theme`/`:root` de `global.css:3-32` no se usan en UI nueva).

## Tipografía

Carga en `src/layouts/Layout.astro:46-51`. No cambies familias sin requisito explícito.

| Rol | Familia | Uso |
|---|---|---|
| Display | `Archivo Black` (`.font-display`) | Hero (`hero-title`), títulos de sección, números grandes, wordmark |
| Display japonés | `Noto Sans JP` | Acentos: `アニメ音楽`, `音楽`, `音`, `楽`, `毎週` |
| Interfaz y cuerpo | `DM Sans` | Búsqueda, filtros, tarjetas, modal, textos de apoyo |

Reglas:

- Display en mayúsculas con tracking negativo ajustado; `hero-title-blue` en contorno azul.
- Labels de interfaz en mayúsculas, `900`, `letter-spacing .12-.24em`, tamaños `8-11px`
  (`hero-kicker`, `hero-side-label`, `anime-card-meta`, `No image`).
- Cuerpo en frase normal con interlineado cómodo, mínimo `14px`; tallas menores solo para metadatos cortos.
- El japonés es acento con `aria-hidden="true"` cuando es decorativo; nunca sustituye etiquetas en español.
- Títulos de tarjeta con `line-clamp-2`; nunca ocultar el título tras decoración.

## Geometría y profundidad

- Bordes `2px` o `3px` sólidos en ink (`.hero-art`, `.hero-frame-*`, `.hero-character`, covers, placeholder).
- Esquinas cuadradas siempre: ni pills, ni cards redondeadas, ni paneles glass
  (hay `border-radius: 0` global en `global.css:1755`).
- Sombras duras offset sin blur (`4px 4px 0 ink` en móvil para `hero-character`).
- Reglas horizontales (`2px ink`) marcan ritmo editorial (`hero-kicker`, `manga-hero`, `manga-nav`).
- Texturas: `paper-grid` (`global.css:54-61`, retícula `32px`, máscara al `88%`) y halftones
  sutiles sobre imagen sin taparla.
- Hover mueve pocos píxeles: la tarjeta escala la imagen a `1.04` en `500ms`; la sombra dura
  puede crecer o cambiar de acento para señalar elevación.

## Layout y responsive

- Ancho máximo `1320px` (`.hero-shell { width: min(1320px, calc(100% - 48px)) }`).
- Hero desktop: copy + collage en dos columnas (`.hero-collage`); tablet/móvil: una columna
  con arte debajo de la intro.
- Grid archivo: cuatro columnas en grande, luego tres, dos y una.
- Rail lateral vertical (`hero-side-label`, `writing-mode: vertical-rl`) y notas de margen solo
  con espacio suficiente; en móvil se estrecha a `38px` y luego a `32px` de padding.
- Targets táctiles primarios de al menos `44px`.
- Breakpoints reales en `src/styles/global.css` (no inventes otros):

| Max-width | Qué cambia |
|---|---|
| `900px` | Hero a una columna, `hero-art` con borde, título `clamp(56px,16vw,92px)` |
| `520px` | Hero compacto, se ocultan `hero-frame-profile/smile` y la 3ª stat, título `clamp(46px,15vw,64px)` |
| `1040px`, `800px`, `767px`, `760px`, `540px`, `460px` | Ajustes de grid, modal, footer y paginación |

Extiende breakpoints solo si un componente no se adapta con layout intrínseco.

## Lenguaje por componente

### Hero (`Hero.jsx`)

Portada de revista. Preserva rail `SIWÖ ARCHIVE / VOL. 01`, kicker `Openings / Endings ＊ + アニメ音楽`,
título en tres líneas `ANIME / SOUND / ARCHIVE`, intro, stats (`series / OP+ED / 毎週`),
collage (`profile, expression, scene, smile` + `hero-character.jpg`), sello `LISTEN 01`,
código `FILE 001 / SOUND INDEX`, registro `＋` y botón scroll al catálogo.

### Panel de búsqueda (`SearchControls.jsx`, `FilterSelect.jsx`)

Es el control principal. Orden: input de título primero, luego temporada y año.
Valor seleccionado y foco siempre obvios (`custom-select-trigger:focus-visible`).
Los selects custom siguen siendo `combobox/listbox` de teclado. El placeholder del input
es `Escribe el nombre de un anime...` en `rgba(17,17,17,.42)` (`global.css:740`).

### Tarjetas (`AnimeCard.jsx`, `AnimeSkeleton.jsx`)

Parecen fichas numeradas de archivo. Preserva número `FILE 01…`, ratio de portada con
`object-cover`, metadatos temporada/año (`formatSeason` en `src/utils/season.js`),
título (`line-clamp-2`), score `★ 8.5` y acción explícita `Ver ficha ↗`.
La tarjeta es un `<button>` con `aria-label="Ver detalles de …"`.
Sin `coverImage`: fondo `#ece7dc` + `placeholder.png` (`alt="Sin portada"`) + etiqueta `No image`.
El arte puede recortar; el título nunca queda tapado.

### Modal (`AnimeModal.jsx`, `useModalDialog.js`)

Pliego editorial de detalle. Trampa de foco, cierra con `Escape` y con clic en backdrop,
restaura el scroll del body, resetea scroll interno al cambiar de anime, soporta
drag-to-close táctil. Stats en `.modal-stat` con marca de color. Acciones reales como
links normales con `target="_blank" + rel="noopener noreferrer"`.

### Footer (`Footer.jsx`)

Cierre oscuro. Paneles atmosféricos permitidos, pero marca, créditos, fecha de
actualización, enlace comunitario y fuentes (AniTousen, AniList, Kitsu) siempre legibles.
`.footer-bottom` entra con reveal retardado (`global.css:563`).

## Imágenes

Canónicas en `public/editorial/` (reutilizar antes de añadir nada):

`hero-character.jpg`, `hero-panel-expression.jpg`, `hero-panel-profile.jpg`,
`hero-panel-scene.jpg`, `hero-panel-smile.jpg`, `interlude-band.jpg`, `interlude-cowboy.jpg`,
`interlude-goodbye-eri.jpg`, `interlude-lain.jpg`, `interlude-look-back.jpg`.

Tratamientos válidos: manga monocromo de alto contraste, póster editorial o fondo plano
de un solo acento. Lo nuevo debe encajar en uno de los tres.

- Imágenes desplegables en `public/` y referenciadas vía `import.meta.env.BASE_URL`
  (`HOME_URL` / `assetUrl()` en `src/utils/assets.js`). Nunca hardcodear `/`.
- Collage decorativo con `alt=""` y `aria-hidden="true"`; `hero-character.jpg` lleva alt
  conciso porque aporta contenido.
- Fallback sin portada: `public/placeholder.png` (`alt="Sin portada"`), estable y sin romper grid.
- `public/og.png` solo cambia si cambia la marca o el titular principal.
- Nada de imitaciones IA de artistas identificables o personajes existentes.

## Movimiento

Debe parecer piezas colocándose sobre la página impresa:

- Entrada hero: `hero-rule-in .65s`, `hero-label-in .65s .18s`, `hero-title-in .82s`
  (stagger `.2/.3/.4s`), `hero-copy-in .7s .58/.68s`, `hero-art-in .9s .12s`,
  `frame-snap-in .72s`, `stamp-pop-in .7s .9s` (todo `cubic-bezier(.16,1,.3,1)` o `(.2,.8,.2,1)`).
- Flotación contenida solo en deco hero: `glyph-drift 7-8s`, `registration-pulse 3.2s`,
  `arrow-bounce 1.4s` en la flecha del botón scroll.
- Reveals: `[data-reveal]` con `opacity 0 → 1` y `translateY(34px → 0)` en `.75s`,
  stagger de tarjetas vía `--reveal-delay` y delays fijos para `search-panel/.08s`,
  `results-bar/.12s`, `footer-bottom/.1s`.
- Prohibido movimiento continuo en superficies de lectura o controles; la tarjeta solo
  escala imagen (`group-hover:scale-[1.04]`).
- Todo respeta `prefers-reduced-motion` (`global.css:1771-1778`): animaciones a `.01ms`,
  reveals visibles de inmediato, scroll suave a `auto`. Solo `opacity`/`transform`,
  nunca animar layout.

## Accesibilidad

- Foco visible global preservado: `outline 3px solid #e94b3c` + `offset 3px`
  (`global.css:1762-1765`); no lo ocultes ni lo sustituyas por solo-color.
- Contraste fuerte sobre cada acento; no comunicar estado solo con color.
- Labels asociados a inputs; selects custom como `combobox/listbox`.
- Japonés decorativo y marcas de corte con `aria-hidden="true"`.
- Modal e historial usables con teclado y navegación de navegador.
- `line-clamp` para títulos largos sin romper tarjetas; `loading="lazy"` en portadas.

## Restricciones de GitHub Pages

Prod sirve bajo `/<repo>`, dev en `/`. Nunca hardcodear assets a `/`:

- Construir URLs con `import.meta.env.BASE_URL` (`HOME_URL` / `assetUrl()`).
- Mantener `output: 'static'` en `astro.config.mjs`.
- Preservar canonical y metadatos sociales en `src/layouts/Layout.astro`.
- Externos con `target="_blank"` + `rel="noopener noreferrer"`.

## No hacer (explícito)

- No teal, no glassmorphism, no cards/pills redondeadas, no gradientes decorativos.
- No `transition: all`; nombra las propiedades (`opacity`, `transform`).
- No sombras con blur; solo offset duro.
- No más de un CTA primario por vista; el resto, acciones sobrias.
- No tapar títulos con decoración ni usar japonés como etiqueta esencial.
- No añadir familias tipográficas, breakpoints o keyframes nuevos sin necesidad probada.
- No recrear componentes que ya existen (`AnimeCard`, `AnimeModal`, `FilterSelect`);
  reutilízalos. Este archivo describe intención; el código en `src/` manda en la implementación.

## Checklist de revisión

Antes de dar por terminado un cambio visual, confirma:

- Sigue leyéndose como Siwö, no como un dashboard genérico de anime.
- Búsqueda y filtros son la superficie interactiva más clara.
- Se respetan los 5 colores y los 3 roles tipográficos.
- Las rutas funcionan con el `BASE_URL` de Pages.
- Desktop y móvil estrecho coherentes (incluido `520px` sin frames ocultos rotos).
- Foco de teclado y `reduced-motion` preservados.
- Sin portada sigue renderizando `placeholder.png` estable.
- `git diff --check` limpio y `npm run build` en verde.
