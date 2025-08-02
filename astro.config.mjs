// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      // Le dice a Vite que pre-empaquete pixi.js para un mejor rendimiento en desarrollo
      include: ['pixi.js'],
    },
  },

  integrations: [svelte()],
  site: 'https://nglmercer.github.io/AI-streaming-web/',
  base: '/AI-streaming-web',
});