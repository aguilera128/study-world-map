// Service worker: hace que la aplicación funcione sin conexión una vez visitada.
//   · Páginas: primero la red (para recibir siempre la última versión); sin red, la copia guardada.
//   · Atlas: la copia guardada al momento y, de fondo, se actualiza desde la red.
//   · /assets (con hash en el nombre), banderas e iconos: la copia guardada; si no está, la red.
// Subir VERSION borra las cachés anteriores al activarse.

const VERSION = 'v3';
const CACHE = `swm-${VERSION}`;
const PRECACHE = ['/', '/data/atlas.json'];

// Los ficheros de /assets llevan hash en el nombre: se descubren leyendo index.html y lo que este
// carga (el JS principal cita el chunk del mapa y el CSS cita las fuentes). Así la primera visita
// ya deja todo listo para abrir la aplicación sin conexión.
const ASSET_REF = /(?:\/assets\/|\.\/)([\w.-]+\.(?:js|css|woff2))/g;

async function discoverAssets() {
  const seen = new Set();
  let queue = ['/'];
  for (let depth = 0; depth < 5 && queue.length; depth++) {
    const texts = await Promise.all(queue.map((url) => fetch(url).then((r) => (r.ok ? r.text() : ''))));
    queue = [];
    for (const text of texts) {
      for (const [, file] of text.matchAll(ASSET_REF)) {
        const url = `/assets/${file}`;
        if (seen.has(url)) continue;
        seen.add(url);
        if (!file.endsWith('.woff2')) queue.push(url);
      }
    }
  }
  return [...seen];
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      await cache.addAll(await discoverAssets());
    })(),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      // solo las copias de versiones anteriores de la aplicación: hay otras cachés (las imágenes de
      // satélite que guarda src/engine/bitmaps.ts) que no son de este fichero
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('swm-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// La aplicación es una sola página (con ?lista=… o sin nada): se guarda bajo '/'. Las demás páginas
// (p. ej. /paises-y-capitales/) se guardan con su propia ruta.
async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  const path = new URL(request.url).pathname;
  const key = path === '/' || path === '/index.html' ? '/' : path;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(key, response.clone());
    return response;
  } catch {
    return (await cache.match(key)) ?? (await cache.match('/')) ?? Response.error();
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const update = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  if (cached) {
    event.waitUntil(update.catch(() => {}));
    return cached;
  }
  return update;
}

// ponytail: los /assets de versiones anteriores se acumulan hasta que se sube VERSION;
// si la caché crece demasiado, limpiar al activar los que no cite el index.html nuevo.
async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') event.respondWith(networkFirst(request));
  else if (url.pathname.startsWith('/data/')) event.respondWith(staleWhileRevalidate(request, event));
  else if (/^\/(assets|flags|icons)\//.test(url.pathname)) event.respondWith(cacheFirst(request));
});
