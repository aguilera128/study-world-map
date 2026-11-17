import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'node:fs';
import { loadEnv, type Plugin } from 'vite';
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

/**
 * index.html lleva la dirección del sitio y el contenedor de Tag Manager como %VITE_SITE_URL% y
 * %VITE_GTM_ID% (.env.example). Vite ya sustituye las variables definidas; aquí se da valor también
 * a las que faltan, con los mismos valores por defecto que scripts/data/sitio.mjs.
 */
function siteVars(env: Record<string, string>): Plugin {
  const site = (env.VITE_SITE_URL || 'http://localhost:5173').trim().replace(/\/+$/, '');
  return {
    name: 'site-vars',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%VITE_SITE_URL%', site).replaceAll('%VITE_GTM_ID%', (env.VITE_GTM_ID ?? '').trim()),
    },
  };
}

/**
 * En desarrollo, sirve /api/tiempo y /api/satelites con las mismas funciones que despliega Vercel
 * (api/tiempo.ts y api/satelites.ts), para poder ver las capas del tiempo de ahora y de los
 * satélites. Las otras dos funciones necesitan la base de datos y no se sirven aquí.
 */
function devWeather(): Plugin {
  return {
    name: 'dev-weather',
    apply: 'serve',
    configureServer(server) {
      for (const name of ['tiempo', 'satelites']) {
        server.middlewares.use(`/api/${name}`, (req, res) => {
          void (async () => {
            try {
              const { default: handler } = (await server.ssrLoadModule(`/api/${name}.ts`)) as { default: { fetch(request: Request): Promise<Response> } };
              const response = await handler.fetch(new Request(`http://localhost${req.originalUrl ?? `/api/${name}`}`, { method: req.method }));
              res.statusCode = response.status;
              response.headers.forEach((value, key) => res.setHeader(key, value));
              res.end(Buffer.from(await response.arrayBuffer()));
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
            }
          })();
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), siteVars(loadEnv(mode, process.cwd(), 'VITE_')), preloadCritical(), devWeather()],
  // Los hilos aparte salen como módulos (el de la malla ya se crea con type: 'module'). Hace falta
  // por satellite.js: trae una versión WebAssembly con hilos que no se usa, pero Vite la empaqueta
  // igual, y en el formato clásico no se puede.
  worker: { format: 'es' },
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
}));
