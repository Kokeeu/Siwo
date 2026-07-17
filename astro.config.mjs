// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://Kokeeu.github.io',
  base: '/anitousen-search',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()]
  }
});