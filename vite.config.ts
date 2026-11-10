import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Una portada por idioma: index.html (español) y las que genera scripts/build-pages.mjs en <idioma>/.
const LANGS = ['en'].filter((lang) => existsSync(`${lang}/index.html`));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // three.js va en su propio chunk (se carga con el motor del mapa) y supera el aviso por defecto
    chunkSizeWarningLimit: 800,
    rollupOptions: { input: ['index.html', ...LANGS.map((lang) => `${lang}/index.html`)] },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
