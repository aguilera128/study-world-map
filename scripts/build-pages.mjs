// Genera las páginas HTML estáticas del sitio (sin JavaScript, legibles por buscadores y asistentes
// de IA, que no ven nada de la aplicación), en cada idioma de scripts/data/idiomas/:
//   public/paises-y-capitales/ · public/en/countries-and-capitals/
//       los 197 países por continente, con capital y bandera
//   public/juego/<reto>-de-<zona>/ · public/en/game/<reto>-of-<zona>/
//       países, capitales y banderas por continente, con enlace al reto ya elegido
//   public/aviso-legal/, privacidad/, cookies/, donar/   textos de scripts/data/legales.mjs (solo en español)
//   <idioma>/index.html   la portada de la aplicación traducida (otra entrada de Vite; ver vite.config.ts)
//   public/sitemap.xml    todas las páginas anteriores menos las legales, con sus equivalentes en otros idiomas
//
// Se ejecuta después de build-atlas.mjs (lee public/data/atlas.json y names.<idioma>.json); la
// salida no se versiona.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { legalPages } from './data/legales.mjs';
import { IDIOMAS as PAGINAS } from './data/idiomas/index.mjs';
import { DONAR_URL, SITE, TITULAR } from './data/sitio.mjs';

const atlas = JSON.parse(readFileSync('public/data/atlas.json', 'utf8'));
const LANGS = Object.keys(PAGINAS);
const base = (lang) => (lang === 'es' ? '/' : `/${lang}/`);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Los países del atlas con los nombres de un idioma (lo mismo que hace src/atlas/atlas.ts al cargar). */
function worldIn(lang) {
  if (lang === 'es') return { all: atlas.countries, continents: atlas.continents };
  const names = JSON.parse(readFileSync(`public/data/names.${lang}.json`, 'utf8'));
  const all = atlas.countries.map((c) => {
    const own = names.countries[c.id];
    return { ...c, name: own.n, capital: own.c, capitalNote: own.cn };
  });
  return { all, continents: names.continents };
}

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

/** `<link rel="alternate">` de una página: la misma en cada idioma (`alternates` = { es: '/…', en: '/en/…' }). */
const hreflang = (alternates) =>
  Object.keys(alternates).length > 1
    ? [...Object.entries(alternates), ['x-default', alternates.es]]
        .map(([lang, path]) => `\n  <link rel="alternate" hreflang="${lang}" href="${SITE}${path}" />`)
        .join('')
    : '';

/**
 * Página completa: cabecera, marca, contenido y pie comunes.
 * `alternates` son las direcciones de esta misma página en cada idioma en que existe.
 */
function page({ lang = 'es', path, alternates = { [lang]: path }, title, description, ogTitle = title, ogType = 'website', jsonLd, prose = false, body }) {
  const T = PAGINAS[lang];
  const others = Object.entries(alternates).filter(([l]) => l !== lang);
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${SITE}${path}" />${hreflang(alternates)}
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${esc(ogTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${SITE}${path}" />
  <meta property="og:image" content="${SITE}/og.jpg" />
  <meta property="og:locale" content="${T.locale}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="theme-color" content="#f1eadb" />
  <script src="/consent.js" defer></script>${jsonLd ? `\n  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
  <style>${CSS}
  </style>
</head>
<body>
  <main${prose ? ' class="prose"' : ''}>
    <a class="brand" href="${base(lang)}"><img src="/favicon.svg" alt="" width="28" height="28" /> Study World Map</a>
${body}
    <footer>
      ${T.pie.creditos}
      <nav aria-label="${T.pie.info}">
        <a href="${base(lang)}">${T.pie.mapa}</a>
        <a href="${base(lang)}${T.ruta.paises}/">${T.pie.paises}</a>
        <a href="/donar/">${T.pie.donar}</a>
        <a href="/aviso-legal/">${T.pie.avisoLegal}</a>
        <a href="/privacidad/">${T.pie.privacidad}</a>
        <a href="/cookies/">${T.pie.cookies}</a>
        <a href="#cookies" onclick="event.preventDefault(); window.swmConsent && swmConsent.open()">${T.pie.configurar}</a>
      </nav>${
        others.length
          ? `\n      <nav aria-label="${T.pie.idiomas}">\n${others.map(([l, p]) => `        <a href="${p}" hreflang="${l}" lang="${l}">${PAGINAS[l].nombre}</a>`).join('\n')}\n      </nav>`
          : ''
      }
    </footer>
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

/** Todas las páginas con equivalente en otros idiomas, para el sitemap: [{ es: '/…', en: '/en/…' }, …]. */
const sitemap = [Object.fromEntries(LANGS.map((lang) => [lang, base(lang)]))];

// ───────────────────────── países y capitales ─────────────────────────

const ORDER = ['europa', 'europa-asia', 'asia', 'africa', 'america', 'oceania'];
const paisesPath = (lang) => `${base(lang)}${PAGINAS[lang].ruta.paises}/`;
const paisesAlternates = Object.fromEntries(LANGS.map((lang) => [lang, paisesPath(lang)]));
sitemap.push(paisesAlternates);

// ───────────────────────── juegos por continente ─────────────────────────
// Cada página enlaza a la aplicación con el reto y la zona ya elegidos (?reto=…&zona=…, ver
// src/app/share.ts). Los países de cada zona salen igual que en el juego: por región del atlas.

const ZONAS = [
  { id: 'europa', keys: ['europa'] },
  { id: 'asia', keys: ['asia'] },
  { id: 'africa', keys: ['africa'] },
  { id: 'america', keys: ['am-norte', 'am-central', 'am-caribe', 'am-sur'] },
  { id: 'oceania', keys: ['oceania'] },
];
// `reto` es el valor del parámetro ?reto= de la aplicación (siempre en español).
const RETOS = [
  { id: 'paises', reto: 'localizar' },
  { id: 'capitales', reto: 'capitales' },
  { id: 'banderas', reto: 'banderas' },
];

const juegoPath = (lang, r, z) => {
  const ruta = PAGINAS[lang].ruta;
  return `${base(lang)}${ruta.juego}/${ruta.retos[r.id]}-${ruta.de}-${ruta.zonas[z.id]}/`;
};
for (const z of ZONAS) for (const r of RETOS) sitemap.push(Object.fromEntries(LANGS.map((lang) => [lang, juegoPath(lang, r, z)])));

let juegos = 0;
let nPaises = 0;

for (const lang of LANGS) {
  const T = PAGINAS[lang];
  const { all, continents } = worldIn(lang);
  const countries = all.filter((c) => c.kind === 'country');
  nPaises = countries.length;
  const byName = (a, b) => a.name.localeCompare(b.name, lang);
  const km2 = (n) => (n ? `${Math.round(n).toLocaleString(T.intl)} km²` : '—');
  const flag = (c) => `<img src="/flags/${c.a2}.svg" alt="" width="24" height="18" loading="lazy" />`;
  const website = { '@type': 'WebSite', name: 'Study World Map', url: `${SITE}/` };

  // ── países y capitales ──
  const groups = ORDER.map((key) => ({
    key,
    name: continents[key],
    list: countries.filter((c) => c.continents[0] === key).sort(byName),
  })).filter((g) => g.list.length);
  if (groups.reduce((n, g) => n + g.list.length, 0) !== countries.length) {
    throw new Error('build-pages: hay países sin continente principal conocido.');
  }
  const P = T.paises;
  const zonas = ZONAS.map((z) => ({
    ...z,
    name: T.zonas[z.id],
    list: countries.filter((c) => c.regions.some((r) => z.keys.includes(r))).sort(byName),
  }));

  write(
    paisesPath(lang),
    page({
      lang,
      path: paisesPath(lang),
      alternates: paisesAlternates,
      title: P.title(countries.length),
      ogTitle: P.ogTitle,
      description: P.description(countries.length),
      ogType: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: P.ogTitle,
          url: `${SITE}${paisesPath(lang)}`,
          inLanguage: lang,
          isPartOf: website,
          mainEntity: {
            '@type': 'ItemList',
            name: P.ogTitle,
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
          mainEntity: P.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
      body: `    <h1>${P.h1}</h1>
    <p class="lead">${P.lead(countries.length)}</p>
    <a class="cta" href="${base(lang)}">${P.cta}</a>
    <p>${P.juegos}</p>
    <nav class="toc" aria-label="${P.juegosAria}">
${zonas.map((z) => `      <a href="${juegoPath(lang, RETOS[0], z)}">${esc(T.juego.enlace(T.retos.paises, z.name))}</a>`).join('\n')}
    </nav>
    <p>${P.lista}</p>
    <nav class="toc" aria-label="${P.listaAria}">
${groups.map((g) => `      <a href="#${g.key}">${esc(g.name)}</a>`).join('\n')}
    </nav>
${groups
  .map(
    (g) => `    <section id="${g.key}">
      <h2>${esc(g.name)} <span class="count">${P.cuenta(g.list.length)}</span></h2>
      <div class="table-wrap"><table>
        <thead><tr><th scope="col">${P.pais}</th><th scope="col">${P.capital}</th><th scope="col" class="num">${P.superficie}</th></tr></thead>
        <tbody>
${g.list
  .map(
    (c) => `        <tr>
          <td>${flag(c)} ${esc(c.name)}</td>
          <td>${esc(c.capital ?? '—')}${c.capitalNote ? ` <small>(${esc(c.capitalNote)})</small>` : ''}</td>
          <td class="num">${km2(c.areaKm2)}</td>
        </tr>`,
  )
  .join('\n')}
        </tbody>
      </table></div>
    </section>`,
  )
  .join('\n')}
    <section id="faq">
      <h2>${P.faqTitulo}</h2>
      <dl>
${P.faq.map(([q, a]) => `        <dt>${esc(q)}</dt>\n        <dd>${esc(a)}</dd>`).join('\n')}
      </dl>
    </section>`,
    }),
  );

  // ── juegos por continente ──
  const J = T.juego;
  const nameOf = (i) => all[i]?.name;
  for (const z of zonas) {
    const n = z.list.length;
    const zn = esc(z.name);
    const byArea = z.list.filter((c) => c.areaKm2).sort((a, b) => b.areaKm2 - a.areaKm2);
    const islas = z.list.filter((c) => !c.neighbors?.length).length;
    for (const r of RETOS) {
      const label = T.retos[r.id];
      const path = juegoPath(lang, r, z);
      const [title, description] = J.titulos[r.id](n, z.name);
      const content = {
        paises: () => `    <div class="table-wrap"><table>
      <thead><tr><th scope="col">${P.pais}</th><th scope="col">${J.limita}</th><th scope="col" class="num">${P.superficie}</th></tr></thead>
      <tbody>
${z.list
  .map((c) => {
    const vecinos = (c.neighbors ?? []).map(nameOf).filter(Boolean).sort((a, b) => a.localeCompare(b, lang));
    return `        <tr><td>${flag(c)} ${esc(c.name)}</td><td>${esc(vecinos.join(', ') || J.sinFronteras)}</td><td class="num">${km2(c.areaKm2)}</td></tr>`;
  })
  .join('\n')}
      </tbody>
    </table></div>
    <ul>
      <li>${J.masGrande(zn, esc(byArea[0].name), km2(byArea[0].areaKm2))}${
        // Sin la superficie de todos (al Vaticano le falta en la fuente) no se puede decir cuál es el más pequeño.
        byArea.length === n ? J.masPequeno(esc(byArea.at(-1).name), km2(byArea.at(-1).areaKm2)) : ''
      }.</li>
      <li>${J.islas(islas, n)}</li>
    </ul>`,
        capitales: () => `    <div class="table-wrap"><table>
      <thead><tr><th scope="col">${P.pais}</th><th scope="col">${P.capital}</th></tr></thead>
      <tbody>
${z.list
  .map(
    (c) =>
      `        <tr><td>${flag(c)} ${esc(c.name)}</td><td><strong>${esc(c.capital ?? '—')}</strong>${c.capitalNote ? ` <small>(${esc(c.capitalNote)})</small>` : ''}</td></tr>`,
  )
  .join('\n')}
      </tbody>
    </table></div>`,
        banderas: () => `    <ul class="flags">
${z.list.map((c) => `      <li><img src="/flags/${c.a2}.svg" alt="${esc(J.banderaDe(c.name))}" width="160" height="120" loading="lazy" />${esc(c.name)}</li>`).join('\n')}
    </ul>`,
      }[r.id]();

      const otherRetos = RETOS.filter((o) => o !== r).map((o) => `<a href="${juegoPath(lang, o, z)}">${esc(J.enlace(T.retos[o.id], z.name))}</a>`);
      const otherZonas = zonas.filter((o) => o !== z).map((o) => `<a href="${juegoPath(lang, r, o)}">${esc(J.enlace(label, o.name))}</a>`);
      juegos++;
      write(
        path,
        page({
          lang,
          path,
          alternates: Object.fromEntries(LANGS.map((l) => [l, juegoPath(l, r, z)])),
          title: `${title} · Study World Map`,
          ogTitle: title,
          description,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            url: `${SITE}${path}`,
            inLanguage: lang,
            isPartOf: website,
            mainEntity: {
              '@type': 'ItemList',
              name: J.enlace(label, z.name),
              numberOfItems: n,
              itemListElement: z.list.map((c, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: r.id === 'capitales' && c.capital ? `${c.capital} (${c.name})` : c.name,
              })),
            },
          },
          body: `    <h1>${esc(J.h1(label, z.name))}</h1>
    <p class="lead">${esc(J.intro[r.id](n, z.name))}</p>
    <a class="cta" href="${base(lang)}?reto=${r.reto}&amp;zona=${z.id}">${esc(J.jugar(label, z.name))}</a>
    <p>${J.gratis}</p>
    <h2>${esc(J.h2[r.id](n, z.name))}</h2>
${content}
    <h2>${J.sigue}</h2>
    <nav class="toc" aria-label="${esc(J.otrosRetos(z.name))}">${otherRetos.join(' ')}</nav>
    <nav class="toc" aria-label="${esc(J.otrasZonas(label))}">${otherZonas.join(' ')}</nav>
    <p><a href="${paisesPath(lang)}">${J.todos}</a></p>`,
        }),
      );
    }
  }
}

// ───────────────────────── textos legales y donaciones (solo en español) ─────────────────────────

for (const legal of legalPages()) write(legal.path, page({ ...legal, prose: true }));

// ───────────────────────── portada de la aplicación en cada idioma ─────────────────────────
// index.html (en español) es la entrada de Vite; cada idioma tiene la suya, <idioma>/index.html,
// con los mismos scripts y el texto traducido. Así cada idioma se sirve en su dirección con su
// título, su descripción y su contenido para buscadores.

const index = readFileSync('index.html', 'utf8').replace(/\r/g, '');
for (const lang of LANGS) {
  if (!index.includes(`hreflang="${lang}"`)) throw new Error(`build-pages: index.html no enlaza al idioma «${lang}» (hreflang).`);
  if (lang === 'es') continue;
  const T = PAGINAS[lang];
  const home = `${SITE}${base(lang)}`;
  // Lo que cambia en todos los idiomas igual: códigos de idioma y direcciones…
  const pairs = [
    ['<html lang="es">', `<html lang="${lang}">`],
    ['content="es_ES"', `content="${T.locale}"`],
    [`<meta property="og:url" content="${SITE}/" />`, `<meta property="og:url" content="${home}" />`],
    [`<link rel="canonical" href="${SITE}/" />`, `<link rel="canonical" href="${home}" />`],
    [`"@type": "WebApplication",
            "name": "Study World Map",
            "url": "${SITE}/",`, `"@type": "WebApplication",
            "name": "Study World Map",
            "url": "${home}",`],
    [`"inLanguage": "es",
            "isAccessibleForFree"`, `"inLanguage": "${lang}",
            "isAccessibleForFree"`],
    // …y los textos, que cada idioma traduce en el mismo orden que es.mjs.
    ...PAGINAS.es.index.map((text, i) => [text, T.index[i].replace('{paises}', paisesPath(lang))]),
  ];
  if (T.index.length !== PAGINAS.es.index.length) throw new Error(`build-pages: a «${lang}» le faltan o le sobran textos de index.html.`);
  let html = index;
  for (const [from, to] of pairs) {
    if (!html.includes(from)) throw new Error(`build-pages: index.html ya no contiene «${from.slice(0, 60)}…» (scripts/data/idiomas/es.mjs).`);
    html = html.replaceAll(from, to);
  }
  mkdirSync(lang, { recursive: true });
  writeFileSync(`${lang}/index.html`, html);
}

// ───────────────────────── sitemap ─────────────────────────

const urls = sitemap.flatMap((alternates) =>
  Object.entries(alternates).map(
    ([, path]) =>
      `  <url><loc>${SITE}${path}</loc>${[...Object.entries(alternates), ['x-default', alternates.es]]
        .map(([lang, other]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${other}" />`)
        .join('')}</url>`,
  ),
);
writeFileSync(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
  <url><loc>${SITE}/donar/</loc></url>
</urlset>
`,
);

const pending = [...Object.values(TITULAR), DONAR_URL].filter((v) => v.startsWith('PENDIENTE'));
console.log(
  `páginas (${LANGS.join(', ')}): países y capitales (${nPaises}) + ${juegos} juegos + ${legalPages().length} legales${pending.length ? ` · ${pending.length} datos PENDIENTES en scripts/data/sitio.mjs` : ''}`,
);
// En Vercel no se publica un aviso legal a medias.
if (pending.length && process.env.VERCEL) {
  throw new Error(`build-pages: faltan datos en scripts/data/sitio.mjs:\n  ${pending.join('\n  ')}`);
}
