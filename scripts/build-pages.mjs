// Genera las páginas HTML estáticas del sitio (sin JavaScript, legibles por buscadores y asistentes
// de IA, que no ven nada de la aplicación):
//   public/paises-y-capitales/   los 197 países por continente, con capital y bandera (desde el atlas)
//   public/juego/<reto>-de-<zona>/   países, capitales y banderas por continente, con enlace al reto
//   public/aviso-legal/, privacidad/, cookies/, donar/   textos de scripts/data/legales.mjs
//   public/sitemap.xml   todas las páginas anteriores menos las legales
//
// Se ejecuta después de build-atlas.mjs (lee public/data/atlas.json); la salida no se versiona.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { legalPages } from './data/legales.mjs';
import { DONAR_URL, SITE, TITULAR } from './data/sitio.mjs';

const atlas = JSON.parse(readFileSync('public/data/atlas.json', 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const km2 = (n) => (n ? `${Math.round(n).toLocaleString('es-ES')} km²` : '—');

const countries = atlas.countries.filter((c) => c.kind === 'country');
const ORDER = ['europa', 'europa-asia', 'asia', 'africa', 'america', 'oceania'];
const groups = ORDER.map((key) => ({
  key,
  name: atlas.continents[key],
  list: countries
    .filter((c) => c.continents[0] === key)
    .sort((a, b) => a.name.localeCompare(b.name, 'es')),
})).filter((g) => g.list.length);

if (groups.reduce((n, g) => n + g.list.length, 0) !== countries.length) {
  throw new Error('build-pages: hay países sin continente principal conocido.');
}

// Preguntas frecuentes: todo lo que dicen es comprobable en la aplicación (ver README).
const FAQ = [
  [
    '¿Cuántos países hay en el mundo?',
    'Study World Map incluye 197 países: los 193 miembros de la ONU, sus dos Estados observadores (Ciudad del Vaticano y Palestina), Taiwán y Kosovo. Otros territorios, como Groenlandia o Puerto Rico, aparecen en el mapa pero no se preguntan.',
  ],
  [
    '¿Qué países tienen más de una capital?',
    'Algunos reparten funciones entre ciudades: Bolivia (Sucre es la capital constitucional y La Paz la sede del Gobierno), Sudáfrica, Países Bajos o Sri Lanka. En el juego se acepta cualquiera de ellas al escribir la respuesta.',
  ],
  [
    '¿Cómo aprender los países y capitales del mundo?',
    'Practicando con repaso espaciado: Study World Map pregunta más a menudo los países que fallas, repite los fallos tres preguntas después y, entre partidas, sigue cada país con un sistema de cajas de Leitner hasta que lo dominas.',
  ],
  [
    '¿Study World Map es gratis? ¿Necesita registro?',
    'Es gratis, sin anuncios y sin cuentas. El progreso se guarda en tu propio dispositivo y la aplicación funciona sin conexión después de la primera visita.',
  ],
  [
    '¿Qué juegos de geografía tiene?',
    'Cinco retos: localizar países en el mapa, decir en qué continente están, nombrar el país señalado, capitales y banderas. Se puede jugar con todo el mundo, por continentes o con una lista de países propia que se comparte con un enlace.',
  ],
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Países del mundo y sus capitales',
    url: `${SITE}/paises-y-capitales/`,
    inLanguage: 'es',
    isPartOf: { '@type': 'WebSite', name: 'Study World Map', url: `${SITE}/` },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Países del mundo y sus capitales',
      numberOfItems: countries.length,
      itemListElement: groups
        .flatMap((g) => g.list)
        .map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: { '@type': 'Country', name: c.name, ...(c.capital && { containsPlace: { '@type': 'City', name: c.capital } }) },
        })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
];

const row = (c) => `        <tr>
          <td><img src="/flags/${c.a2}.svg" alt="" width="24" height="18" loading="lazy" /> ${esc(c.name)}</td>
          <td>${esc(c.capital ?? '—')}${c.capitalNote ? ` <small>(${esc(c.capitalNote)})</small>` : ''}</td>
          <td class="num">${km2(c.areaKm2)}</td>
        </tr>`;

const section = (g) => `    <section id="${g.key}">
      <h2>${esc(g.name)} <span class="count">${g.list.length} países</span></h2>
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">País</th><th scope="col">Capital</th><th scope="col" class="num">Superficie</th></tr></thead>
        <tbody>
${g.list.map(row).join('\n')}
        </tbody>
      </table></div>
    </section>`;

// ───────────────────────── plantilla común ─────────────────────────

const CSS = `
    :root { --paper:#f1eadb; --surface:#faf6ec; --ink:#1b2a3a; --soft:#485868; --rule:rgb(27 42 58/.16); --accent:#d5462a; color-scheme:light; }
    @media (prefers-color-scheme: dark) { :root { --paper:#0d1520; --surface:#162231; --ink:#efe7d6; --soft:#b3bcc7; --rule:rgb(239 231 214/.15); --accent:#ff7654; color-scheme:dark; } }
    * { box-sizing: border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font:1rem/1.6 system-ui,-apple-system,"Segoe UI",sans-serif; }
    main { max-width:58rem; margin:0 auto; padding:1.5rem 1rem 4rem; }
    main.prose { max-width:44rem; }
    h1,h2,h3 { font-family:Besley,Georgia,"Times New Roman",serif; line-height:1.15; }
    h1 { font-size:clamp(2rem,5vw,3rem); margin:1.5rem 0 .75rem; }
    h2 { font-size:1.6rem; margin:2.5rem 0 .75rem; }
    h3 { font-size:1.2rem; margin:1.75rem 0 .5rem; }
    .count { font:600 .8rem system-ui,sans-serif; color:var(--soft); letter-spacing:.06em; text-transform:uppercase; }
    a { color:var(--accent); }
    .brand { display:inline-flex; align-items:center; gap:.5rem; color:var(--ink); font-weight:700; text-decoration:none; }
    .lead { font-size:1.125rem; color:var(--soft); max-width:42rem; }
    .cta { display:inline-block; margin:.5rem 0 1rem; padding:.75rem 1.25rem; border-radius:10px; background:var(--accent); color:#fff7ee; font-weight:700; text-decoration:none; }
    nav.toc { display:flex; flex-wrap:wrap; gap:.5rem; margin:1rem 0; }
    nav.toc a { padding:.3rem .7rem; border:1px solid var(--rule); border-radius:999px; text-decoration:none; color:var(--ink); background:var(--surface); }
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; background:var(--surface); border-radius:10px; overflow:hidden; }
    th,td { padding:.5rem .75rem; border-bottom:1px solid var(--rule); text-align:left; vertical-align:middle; }
    th { font-size:.8rem; text-transform:uppercase; letter-spacing:.06em; color:var(--soft); }
    td img { vertical-align:-3px; margin-right:.4rem; border-radius:2px; box-shadow:0 0 0 1px var(--rule); }
    td small { color:var(--soft); }
    .num { text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums; }
    dt { font-weight:700; margin-top:1rem; }
    dd { margin:.25rem 0 0; color:var(--soft); }
    .pending { background:#ffd95a; color:#1b2a3a; padding:0 .25rem; border-radius:3px; }
    footer { margin-top:3rem; padding-top:1rem; border-top:1px solid var(--rule); font-size:.8rem; color:var(--soft); }
    footer nav { display:flex; flex-wrap:wrap; gap:.25rem 1rem; margin-top:.5rem; }
    .flags { display:grid; grid-template-columns:repeat(auto-fill,minmax(9rem,1fr)); gap:.75rem; padding:0; list-style:none; }
    .flags li { background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:.6rem; text-align:center; font-size:.9rem; }
    .flags img { display:block; width:100%; height:auto; aspect-ratio:4/3; object-fit:cover; border-radius:4px; box-shadow:0 0 0 1px var(--rule); margin-bottom:.4rem; }
    @media (max-width:36rem) { .num { display:none; } }`;

const FOOTER = `    <footer>
      Cartografía: Natural Earth · Banderas: flag-icons (MIT) · Datos de países: mledoze/countries (ODbL).
      <nav aria-label="Información">
        <a href="/">Mapa interactivo</a>
        <a href="/paises-y-capitales/">Países y capitales</a>
        <a href="/donar/">Donar</a>
        <a href="/aviso-legal/">Aviso legal</a>
        <a href="/privacidad/">Privacidad</a>
        <a href="/cookies/">Cookies</a>
        <a href="#cookies" onclick="event.preventDefault(); window.swmConsent && swmConsent.open()">Configurar cookies</a>
      </nav>
    </footer>`;

/** Página completa: cabecera, marca, contenido y pie comunes. */
function page({ path, title, description, ogTitle = title, ogType = 'website', jsonLd, prose = false, body }) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${SITE}${path}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${SITE}${path}" />
  <meta property="og:image" content="${SITE}/og.jpg" />
  <meta property="og:locale" content="es_ES" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="theme-color" content="#f1eadb" />
  <script src="/consent.js" defer></script>${jsonLd ? `\n  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\u003c')}</script>` : ''}
  <style>${CSS}
  </style>
</head>
<body>
  <main${prose ? ' class="prose"' : ''}>
    <a class="brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28" /> Study World Map</a>
${body}
${FOOTER}
  </main>
</body>
</html>
`;
}

function write(path, html) {
  const dir = `public${path}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}index.html`, html);
}

// ───────────────────────── juegos por continente (/juego/…) ─────────────────────────
// Cada página enlaza a la aplicación con el reto y la zona ya elegidos (?reto=…&zona=…, ver
// src/app/share.ts). Los países de cada zona salen igual que en el juego: por región del atlas.

const ZONAS = [
  { id: 'europa', name: 'Europa', keys: ['europa'] },
  { id: 'asia', name: 'Asia', keys: ['asia'] },
  { id: 'africa', name: 'África', keys: ['africa'] },
  { id: 'america', name: 'América', keys: ['am-norte', 'am-central', 'am-caribe', 'am-sur'] },
  { id: 'oceania', name: 'Oceanía', keys: ['oceania'] },
].map((z) => ({
  ...z,
  list: countries.filter((c) => c.regions.some((r) => z.keys.includes(r))).sort((a, b) => a.name.localeCompare(b.name, 'es')),
}));

const RETOS = [
  { id: 'paises', reto: 'localizar', label: 'Países' },
  { id: 'capitales', reto: 'capitales', label: 'Capitales' },
  { id: 'banderas', reto: 'banderas', label: 'Banderas' },
];

const juegoPath = (r, z) => `/juego/${r.id}-de-${z.id}/`;
const nameOf = (i) => atlas.countries[i]?.name;
const flag = (c) => `<img src="/flags/${c.a2}.svg" alt="" width="24" height="18" loading="lazy" />`;

function juegoBody(r, z) {
  const n = z.list.length;
  const zn = esc(z.name);
  const byArea = z.list.filter((c) => c.areaKm2).sort((a, b) => b.areaKm2 - a.areaKm2);
  const islas = z.list.filter((c) => !c.neighbors?.length).length;
  const otherRetos = RETOS.filter((o) => o !== r).map((o) => `<a href="${juegoPath(o, z)}">${o.label} de ${zn}</a>`);
  const otherZonas = ZONAS.filter((o) => o !== z).map((o) => `<a href="${juegoPath(r, o)}">${r.label} de ${esc(o.name)}</a>`);

  const intro = {
    paises: `Te damos el nombre de un país de ${zn} y tienes que encontrarlo en el mapa. Si fallas, te dice qué país has pulsado y te lo vuelve a preguntar más tarde, hasta que te sepas los ${n}.`,
    capitales: `Une cada uno de los ${n} países de ${zn} con su capital: con opciones, buscando el país en el mapa o escribiendo la respuesta. Las capitales que fallas vuelven a salir hasta que te las sabes.`,
    banderas: `Reconoce las ${n} banderas de ${zn}: te enseñamos una bandera y pulsas su país en el mapa o eliges entre opciones. Las que fallas se repiten más a menudo.`,
  }[r.id];

  const content = {
    paises: `    <h2>Los ${n} países de ${zn}</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">País</th><th scope="col">Limita con</th><th scope="col" class="num">Superficie</th></tr></thead>
      <tbody>
${z.list
  .map((c) => {
    const vecinos = (c.neighbors ?? []).map(nameOf).filter(Boolean).sort((a, b) => a.localeCompare(b, 'es'));
    return `        <tr><td>${flag(c)} ${esc(c.name)}</td><td>${esc(vecinos.join(', ') || 'Sin fronteras terrestres')}</td><td class="num">${km2(c.areaKm2)}</td></tr>`;
  })
  .join('\n')}
      </tbody>
    </table></div>
    <ul class="facts">
      <li>El país más grande de ${zn} es <strong>${esc(byArea[0].name)}</strong> (${km2(byArea[0].areaKm2)})${
        // Sin la superficie de todos (al Vaticano le falta en la fuente) no se puede decir cuál es el más pequeño.
        byArea.length === n ? ` y el más pequeño, <strong>${esc(byArea.at(-1).name)}</strong> (${km2(byArea.at(-1).areaKm2)})` : ''
      }.</li>
      <li>${islas} de los ${n} países no tienen fronteras terrestres con ningún otro.</li>
    </ul>`,
    capitales: `    <h2>Capitales de los ${n} países de ${zn}</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">País</th><th scope="col">Capital</th></tr></thead>
      <tbody>
${z.list
  .map(
    (c) =>
      `        <tr><td>${flag(c)} ${esc(c.name)}</td><td><strong>${esc(c.capital ?? '—')}</strong>${c.capitalNote ? ` <small>(${esc(c.capitalNote)})</small>` : ''}</td></tr>`,
  )
  .join('\n')}
      </tbody>
    </table></div>`,
    banderas: `    <h2>Las ${n} banderas de ${zn}</h2>
    <ul class="flags">
${z.list.map((c) => `      <li><img src="/flags/${c.a2}.svg" alt="Bandera de ${esc(c.name)}" width="160" height="120" loading="lazy" />${esc(c.name)}</li>`).join('\n')}
    </ul>`,
  }[r.id];

  return `    <h1>${r.label} de ${zn}: juego en el mapa</h1>
    <p class="lead">${intro}</p>
    <a class="cta" href="/?reto=${r.reto}&amp;zona=${z.id}">Jugar: ${r.label.toLowerCase()} de ${zn} →</a>
    <p>Gratis, sin registro y sin anuncios. Tu progreso se guarda en tu dispositivo.</p>
${content}
    <h2>Sigue practicando</h2>
    <nav class="toc" aria-label="Otros retos de ${zn}">${otherRetos.join(' ')}</nav>
    <nav class="toc" aria-label="${r.label} de otros continentes">${otherZonas.join(' ')}</nav>
    <p><a href="/paises-y-capitales/">Todos los países del mundo y sus capitales</a></p>`;
}

const TITULOS = {
  paises: (z) => [
    `Países de ${z.name}: juego para aprenderlos en el mapa`,
    `Aprende los ${z.list.length} países de ${z.name} jugando: encuéntralos en el mapa, con sus fronteras y su superficie. Gratis y sin registro.`,
  ],
  capitales: (z) => [
    `Capitales de ${z.name}: lista y juego para aprenderlas`,
    `Las capitales de los ${z.list.length} países de ${z.name} en una lista y en un juego con mapa que repite las que fallas. Gratis y sin registro.`,
  ],
  banderas: (z) => [
    `Banderas de ${z.name}: las ${z.list.length} banderas y juego`,
    `Las ${z.list.length} banderas de ${z.name} con el nombre de su país, y un juego para reconocerlas en el mapa. Gratis y sin registro.`,
  ],
};

const juegos = [];
for (const z of ZONAS) {
  for (const r of RETOS) {
    const path = juegoPath(r, z);
    const [title, description] = TITULOS[r.id](z);
    juegos.push(path);
    write(
      path,
      page({
        path,
        title: `${title} · Study World Map`,
        ogTitle: title,
        description,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          url: `${SITE}${path}`,
          inLanguage: 'es',
          isPartOf: { '@type': 'WebSite', name: 'Study World Map', url: `${SITE}/` },
          mainEntity: {
            '@type': 'ItemList',
            name: `${r.label} de ${z.name}`,
            numberOfItems: z.list.length,
            itemListElement: z.list.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: r.id === 'capitales' && c.capital ? `${c.capital} (${c.name})` : c.name,
            })),
          },
        },
        body: juegoBody(r, z),
      }),
    );
  }
}

// ───────────────────────── páginas ─────────────────────────

write(
  '/paises-y-capitales/',
  page({
    path: '/paises-y-capitales/',
    title: `Países del mundo y sus capitales: lista de los ${countries.length} países · Study World Map`,
    ogTitle: 'Países del mundo y sus capitales',
    description: `Lista completa de los ${countries.length} países del mundo y sus capitales, ordenados por continente, con bandera y superficie. Practícalos gratis en un mapa interactivo.`,
    ogType: 'article',
    jsonLd,
    body: `    <h1>Países del mundo y sus capitales</h1>
    <p class="lead">Los ${countries.length} países del mundo ordenados por continente, con su capital, su bandera y su superficie. Cuando quieras aprendértelos, practica con el mapa interactivo: te pregunta más lo que fallas hasta que te lo sabes.</p>
    <a class="cta" href="/">Practicar en el mapa interactivo →</a>
    <p>Juegos por continente:</p>
    <nav class="toc" aria-label="Juegos por continente">
${ZONAS.map((z) => `      <a href="/juego/paises-de-${z.id}/">Países de ${esc(z.name)}</a>`).join('\n')}
    </nav>
    <p>Lista por continente:</p>
    <nav class="toc" aria-label="Continentes">
${groups.map((g) => `      <a href="#${g.key}">${esc(g.name)}</a>`).join('\n')}
    </nav>
${groups.map(section).join('\n')}
    <section id="preguntas">
      <h2>Preguntas frecuentes</h2>
      <dl>
${FAQ.map(([q, a]) => `        <dt>${esc(q)}</dt>\n        <dd>${esc(a)}</dd>`).join('\n')}
      </dl>
    </section>`,
  }),
);

for (const legal of legalPages()) write(legal.path, page({ ...legal, prose: true }));

const urls = ['/', '/paises-y-capitales/', ...juegos, '/donar/'];
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`,
);

const pending = [...Object.values(TITULAR), DONAR_URL].filter((v) => v.startsWith('PENDIENTE'));
console.log(`páginas: paises-y-capitales (${countries.length} países) + ${juegos.length} juegos + ${legalPages().length} legales${pending.length ? ` · ${pending.length} datos PENDIENTES en scripts/data/sitio.mjs` : ''}`);
// En Vercel no se publica un aviso legal a medias.
if (pending.length && process.env.VERCEL) {
  throw new Error(`build-pages: faltan datos en scripts/data/sitio.mjs:\n  ${pending.join('\n  ')}`);
}
