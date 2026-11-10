import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'node:fs';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Una portada por idioma: index.html (español) y las que genera scripts/build-pages.mjs en <idioma>/.
const LANGS = readdirSync('.').filter((dir) => /^[a-z]{2}$/.test(dir) && existsSync(`${dir}/index.html`));

/**
 * Precarga en la portada lo que la aplicación va a pedir seguro, para que baje a la vez que el
 * código principal y no en cadena (principal → aplicación → mapa → atlas): el código del mapa, el
 * atlas del mundo, los nombres del idioma de la página y las tres tipografías de la primera pantalla.
 */
function preloadCritical(): Plugin {
  const FONTS = /^assets\/(besley-latin-wght-(normal|italic)|atkinson-hyperlegible-next-latin-wght-normal)-[\w-]+\.woff2$/;
  return {
    name: 'preload-critical',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle ?? {};
        const chunks = Object.values(bundle).filter((file) => file.type === 'chunk');
        const wanted = new Set<string>();
        for (const chunk of chunks) {
          if (chunk.name !== 'App' && chunk.name !== 'MapCanvas') continue;
          wanted.add(chunk.fileName);
          for (const dep of chunk.imports) wanted.add(dep);
        }
        const lang = /^\/?([a-z]{2})\//.exec(ctx.path)?.[1];
        const tags = [
          ...[...wanted].filter((file) => !html.includes(file)).map((file) => `<link rel="modulepreload" crossorigin href="/${file}" />`),
          '<link rel="preload" as="fetch" crossorigin="anonymous" href="/data/atlas.json" />',
          ...(lang ? [`<link rel="preload" as="fetch" crossorigin="anonymous" href="/data/names.${lang}.json" />`] : []),
          ...Object.keys(bundle)
            .filter((file) => FONTS.test(file))
            .map((file) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="/${file}" />`),
        ];
        return html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`);
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCritical()],
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
