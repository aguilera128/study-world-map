// Genera las páginas HTML estáticas del sitio (sin JavaScript, legibles por buscadores y asistentes
// de IA, que no ven nada de la aplicación):
//   public/paises-y-capitales/   los 197 países por continente, con capital y bandera (desde el atlas)
//   public/aviso-legal/, privacidad/, cookies/, donar/   textos de scripts/data/legales.mjs
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

const pending = [...Object.values(TITULAR), DONAR_URL].filter((v) => v.startsWith('PENDIENTE'));
console.log(`páginas: paises-y-capitales (${countries.length} países) + ${legalPages().length} legales${pending.length ? ` · ${pending.length} datos PENDIENTES en scripts/data/sitio.mjs` : ''}`);
// En Vercel no se publica un aviso legal a medias.
if (pending.length && process.env.VERCEL) {
  throw new Error(`build-pages: faltan datos en scripts/data/sitio.mjs:\n  ${pending.join('\n  ')}`);
}
