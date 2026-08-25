// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'Siwo';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://Kokeeu.github.io',
  // Local development runs at the domain root; GitHub Pages uses the repo path.
  base: process.env.NODE_ENV === 'development' ? '/' : `/${repoName}`,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});
