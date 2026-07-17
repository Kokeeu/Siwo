# AniTousen Search

Buscador estático de animes basado en el repositorio [Avriole/AniTousen](https://github.com/Avriole/AniTousen).

- **Framework:** Astro + React
- **Estilos:** Tailwind CSS v4 con diseño Liquid Glass
- **Hosting:** GitHub Pages
- **Datos:** índice `data.json` generado en build-time descargando el ZIP del repo fuente

## Características

- Búsqueda por nombre de anime.
- Filtros por temporada y año.
- Redirección directa a los links acortados de `clck.ru`.
- 586+ entradas indexadas desde 1999 hasta 2026.
- Diseño Liquid Glass con fondo Carbon Ink y gradientes Deep Teal.

## Desarrollo local

```bash
npm install
npm run dev
```

La página estará disponible en `http://localhost:4321/anitousen-search/`.

## Build

```bash
npm run build
```

Esto descarga el repo fuente, genera `public/data.json` y construye el sitio en `dist/`.

## Despliegue en GitHub Pages

1. Sube este repo a GitHub con el nombre `anitousen-search`.
2. Ve a **Settings > Pages**.
3. En **Build and deployment**, selecciona **GitHub Actions**.
4. El workflow `.github/workflows/deploy.yml` se encarga del resto.

## Configuración

Edita `astro.config.mjs` para cambiar el usuario o el base path:

```js
export default defineConfig({
  site: 'https://TU_USUARIO.github.io',
  base: '/anitousen-search',
  // ...
});
```

## Estructura

```text
anitousen-search/
├── public/
│   └── data.json              # Generado en build
├── scripts/
│   └── build-index.js         # Descarga ZIP y genera data.json
├── src/
│   ├── components/
│   │   └── SearchApp.jsx      # Buscador con Liquid Glass
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── .github/workflows/
    └── deploy.yml
```

## Notas

- El `data.json` se regenera automáticamente en cada build, por lo que no es necesario subirlo a git.
- El workflow de GitHub Actions se ejecuta en cada push y una vez al día (cron) para mantener el índice actualizado.
