<div align="center">

  <a href="https://kokeeu.github.io/anitousen-search/">
    <img src="./public/og.png" alt="Siwö — Anime Sound Archive" width="920" />
  </a>

  <h1>Siwö — Anime Sound Archive</h1>

  <p>
    Un archivo visual para encontrar openings y endings de anime.<br />
    Rápido, estático y actualizado automáticamente.
  </p>

  <p>
    <a href="https://kokeeu.github.io/anitousen-search/"><img src="https://img.shields.io/badge/Explorar_el_archivo-e94b3c?style=for-the-badge&logo=githubpages&logoColor=white" alt="Abrir Siwö" /></a>
    <a href="https://github.com/Kokeeu/anitousen-search/actions/workflows/deploy.yml"><img src="https://img.shields.io/github/actions/workflow/status/Kokeeu/anitousen-search/deploy.yml?branch=main&style=for-the-badge&label=GitHub%20Pages" alt="Estado del despliegue" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Astro-7.1-BC52EE?style=flat-square&logo=astro&logoColor=white" alt="Astro 7.1" />
    <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/600%2B_series-111111?style=flat-square" alt="Más de 600 series" />
  </p>

</div>

---

## El proyecto

Siwö transforma el índice público de [AniTousen](https://github.com/Avriole/AniTousen) en una experiencia de búsqueda inspirada en revistas musicales japonesas. Permite recorrer más de 600 series publicadas entre 1999 y 2026 sin base de datos ni servidor de aplicación.

El catálogo se genera durante el build, se enriquece con metadatos de AniList y Kitsu y se publica como un sitio completamente estático en GitHub Pages.

## Dirección visual

La identidad de Siwö nace de un collage de paneles manga, pósteres editoriales y escenas musicales en blanco y negro. La interfaz reutiliza estas piezas como recortes, texturas e interludios para conservar la sensación de una revista impresa.

<table>
  <tr>
    <td width="34%"><img src="./public/editorial/hero-character.jpg" alt="Personaje sobre fondo amarillo utilizado en la portada" /></td>
    <td width="33%"><img src="./public/editorial/hero-panel-profile.jpg" alt="Panel manga de perfil utilizado en el collage principal" /></td>
    <td width="33%"><img src="./public/editorial/hero-panel-expression.jpg" alt="Primer plano manga utilizado en el collage principal" /></td>
  </tr>
  <tr>
    <td align="center"><sub>HERO CHARACTER</sub></td>
    <td align="center"><sub>PROFILE PANEL</sub></td>
    <td align="center"><sub>EXPRESSION PANEL</sub></td>
  </tr>
  <tr>
    <td><img src="./public/editorial/interlude-look-back.jpg" alt="Póster editorial inspirado en Look Back" /></td>
    <td><img src="./public/editorial/interlude-goodbye-eri.jpg" alt="Póster editorial inspirado en Goodbye Eri" /></td>
    <td><img src="./public/editorial/interlude-band.jpg" alt="Ilustración manga de una banda utilizada en el sitio" /></td>
  </tr>
  <tr>
    <td align="center"><sub>LOOK BACK</sub></td>
    <td align="center"><sub>GOODBYE ERI</sub></td>
    <td align="center"><sub>BAND INTERLUDE</sub></td>
  </tr>
</table>

<p align="center"><sub>Selección de las piezas utilizadas para construir el lenguaje visual del sitio.</sub></p>

## Lo que incluye

| | Característica | Detalle |
|---|---|---|
| `01` | Búsqueda instantánea | Encuentra una serie por título mientras escribes. |
| `02` | Filtros combinables | Filtra el catálogo por temporada y año. |
| `03` | Fichas completas | Portada, sinopsis, géneros, estudio, puntuación y enlaces relacionados. |
| `04` | URLs compartibles | La búsqueda, los filtros, la página y la ficha abierta quedan reflejados en la URL. |
| `05` | Diseño responsive | Interfaz manga-editorial adaptada a escritorio y móvil. |
| `06` | Actualización automática | GitHub Actions reconstruye el índice diariamente y con cada push a `main`. |

## Cómo funciona

```text
AniTousen
    │
    │  ZIP del repositorio
    ▼
scripts/build-index.js ─── AniList / Kitsu
    │
    │  catálogo enriquecido
    ▼
public/data.json
    │
    ▼
Astro + React ─── build estático ─── GitHub Pages
```

El generador es tolerante a fallos. Si AniList o Kitsu no responden, conserva la información básica de AniTousen; si no puede actualizar el ZIP, reutiliza el último `data.json` válido.

## Desarrollo local

Requisitos: Node.js 22.12 o superior y npm.

```bash
git clone https://github.com/Kokeeu/anitousen-search.git
cd anitousen-search
npm install
npm run build-index
npx astro dev --background
```

La aplicación estará disponible en [http://localhost:4321](http://localhost:4321).

Para administrar el servidor en segundo plano:

```bash
npx astro dev status
npx astro dev logs
npx astro dev stop
```

### Build de producción

```bash
npm run build
```

El resultado se genera en `dist/`. Para crear rápidamente el índice básico sin consultar proveedores de metadatos:

```bash
npm run build-index -- --skip-metadata
```

## Configuración del índice

El proceso de generación acepta estas variables de entorno:

| Variable | Valor predeterminado | Uso |
|---|---:|---|
| `METADATA_CACHE_TTL_DAYS` | `14` | Vigencia de los metadatos almacenados en caché. |
| `API_REQUEST_TIMEOUT_MS` | `15000` | Tiempo máximo de cada petición. |
| `API_DELAY_MS` | `2100` | Pausa entre consultas para respetar límites externos. |
| `API_MAX_RETRIES` | `2` | Reintentos por petición fallida. |
| `SKIP_METADATA` | `0` | Usa `1` para omitir AniList y Kitsu. |
| `ANITOUSEN_ZIP_URL` | Repositorio oficial | Permite usar otra fuente compatible. |

## Documentación del proyecto

- [`DESIGN.md`](./DESIGN.md) — identidad visual, componentes, responsive y accesibilidad.
- [`AGENTS.md`](./AGENTS.md) — instrucciones de desarrollo y validación para agentes.
- [`siwo-project`](./.agents/skills/siwo-project/SKILL.md) — skill reutilizable para mantener el proyecto sin perder su dirección técnica o visual.

## Estructura

```text
anitousen-search/
├── .github/workflows/deploy.yml  # Build y despliegue automático
├── public/                       # Imágenes y catálogo generado
├── scripts/build-index.js        # Pipeline de datos
└── src/
    ├── components/               # Buscador, fichas y elementos visuales
    ├── layouts/                  # Metadatos y estructura del documento
    ├── pages/                    # Rutas de Astro
    └── styles/                   # Sistema visual manga-editorial
```

## Despliegue

El workflow de GitHub Actions:

1. Restaura la caché del catálogo.
2. Instala las dependencias.
3. Regenera el índice y construye el sitio.
4. Publica `dist/` en GitHub Pages.
5. Guarda el catálogo actualizado para la siguiente ejecución.

Para usarlo en un fork, selecciona **GitHub Actions** como fuente en **Settings → Pages** y ajusta `site` en `astro.config.mjs`.

## Fuentes y créditos

- [AniTousen](https://github.com/Avriole/AniTousen) — índice y enlaces del catálogo.
- [AniList](https://anilist.co/) — metadatos enriquecidos.
- [Kitsu](https://kitsu.io/) — proveedor alternativo de metadatos.
- [Astro](https://astro.build/) — generación del sitio estático.

> [!IMPORTANT]
> Este proyecto no almacena archivos de audio. Organiza información y enlaces publicados por fuentes externas; cada sitio conserva la responsabilidad sobre su contenido.

---

<div align="center">
  Hecho para encontrar esa canción que no sale de tu cabeza.
</div>
