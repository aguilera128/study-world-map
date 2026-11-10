// Genera las páginas HTML estáticas del sitio (sin JavaScript, legibles por buscadores y asistentes
// de IA, que no ven nada de la aplicación), en cada idioma de scripts/data/idiomas/:
//   public/paises-y-capitales/ · public/en/countries-and-capitals/
//       los 197 países por continente, con capital y bandera
//   public/juego/<reto>-de-<zona>/ · public/en/game/<reto>-of-<zona>/
//       países, capitales y banderas por continente, con enlace al reto ya elegido
//   public/juego/provincias-de-espana/ · public/en/game/provinces-of-spain/ …
//       provincias, capitales de provincia y comunidades de cada mapa de scripts/data/mapas/
//   public/aviso-legal/, privacidad/, cookies/, donar/   textos de scripts/data/legales.mjs (solo en español)
//   <idioma>/index.html   la portada de la aplicación traducida (otra entrada de Vite; ver vite.config.ts)
//   public/sitemap.xml    todas las páginas anteriores menos las legales, con sus equivalentes en otros idiomas
//
// Se ejecuta después de build-atlas.mjs y build-maps.mjs (lee public/data/atlas.json, los atlas de
// public/data/<mapa>/ y sus names.<idioma>.json); la salida no se versiona.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { CLIMAS } from './data/climas.mjs';
import { legalPages } from './data/legales.mjs';
import { IDIOMAS as PAGINAS } from './data/idiomas/index.mjs';
import { MAPAS } from './data/mapas/index.mjs';
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
    .cols { columns:3 12rem; padding-left:1.2rem; }
    .cols li { break-inside:avoid; }
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
        <a href="mailto:${TITULAR.email}?subject=${encodeURIComponent('Study World Map: error')}">${T.pie.error}</a>
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

/** Título de la pestaña: con la marca solo si cabe en los 60 caracteres que enseña Google. */
const seoTitle = (title) => (`${title} · Study World Map`.length <= 60 ? `${title} · Study World Map` : title);

/** Migas de pan para los datos estructurados: [[nombre, ruta], …] desde la portada. */
const migas = (trail, lang = 'es') => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [['Study World Map', base(lang)], ...trail].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});

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
  // Casi todos los idiomas dicen «reto de zona»; el que no (euskera: «Europako herrialdeak») da su propio `slug`.
  const slug = ruta.slug ? ruta.slug(r.id, z.id) : `${ruta.retos[r.id]}-${ruta.de}-${ruta.zonas[z.id]}`;
  return `${base(lang)}${ruta.juego}/${slug}/`;
};
for (const z of ZONAS) for (const r of RETOS) sitemap.push(Object.fromEntries(LANGS.map((lang) => [lang, juegoPath(lang, r, z)])));

// Páginas de los mapas de un país (más abajo): su dirección y el texto con que se enlazan.
const mapaPath = (mapa, lang, pagina) => `${base(lang)}${PAGINAS[lang].ruta.juego}/${mapa.textos[lang][pagina.id].slug}/`;
// El título sin la coletilla: «Provincias de España: juego en el mapa» → «Provincias de España».
const mapaEnlace = (mapa, lang, pagina) => mapa.textos[lang][pagina.id].h1.split(/\s*[:：]/)[0];

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
${Object.values(MAPAS)
  .map((mapa) => `      <a href="${mapaPath(mapa, lang, mapa.paginas[0])}">${esc(mapaEnlace(mapa, lang, mapa.paginas[0]))}</a>`)
  .join('\n')}
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
          title: seoTitle(title),
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

// ───────────────────────── mapas de un país: provincias, capitales y comunidades ─────────────────────────
// Tres páginas por mapa e idioma (textos en scripts/data/mapas/<mapa>.mjs). Cada una enlaza a la
// aplicación con el mapa y el reto ya elegidos (?mapa=…&reto=…, ver src/app/share.ts).

let paginasMapa = 0;
for (const mapa of Object.values(MAPAS)) {
  const sub = JSON.parse(readFileSync(`public/data/${mapa.id}/atlas.json`, 'utf8'));
  const alternatesOf = (pagina) => Object.fromEntries(LANGS.map((lang) => [lang, mapaPath(mapa, lang, pagina)]));
  for (const lang of LANGS) if (!mapa.textos[lang]) throw new Error(`build-pages: al mapa «${mapa.id}» le faltan los textos en «${lang}».`);
  for (const pagina of mapa.paginas) sitemap.push(alternatesOf(pagina));

  for (const lang of LANGS) {
    const T = PAGINAS[lang];
    const X = mapa.textos[lang];
    const names = lang === 'es' ? null : JSON.parse(readFileSync(`public/data/${mapa.id}/names.${lang}.json`, 'utf8'));
    const byName = (a, b) => a.name.localeCompare(b.name, lang);
    const regionName = (key) => names?.regions[key] ?? sub.regions[key].name;
    const provincias = sub.countries
      .filter((c) => c.kind === 'country')
      .map((c) => ({ name: names?.countries[c.id].n ?? c.name, capital: names?.countries[c.id].c ?? c.capital, region: c.regions[0] }))
      .sort(byName);
    const comunidades = Object.keys(sub.regions)
      .map((key) => ({ name: regionName(key), list: provincias.filter((p) => p.region === key) }))
      .sort(byName);
    const tabla = (head, rows) => `    <div class="table-wrap"><table>
      <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
${rows.map((cells) => `        <tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('\n')}
      </tbody>
    </table></div>`;
    // Contenido de cada página y, para los datos estructurados, la lista de lo que enseña.
    const contenido = {
      provincias: [
        tabla([X.columnas.provincia, X.columnas.comunidad], provincias.map((p) => [esc(p.name), esc(regionName(p.region))])),
        provincias.map((p) => p.name),
      ],
      capitales: [
        tabla([X.columnas.provincia, X.columnas.capital], provincias.map((p) => [esc(p.name), `<strong>${esc(p.capital)}</strong>`])),
        provincias.map((p) => `${p.capital} (${p.name})`),
      ],
      comunidades: [
        tabla([X.columnas.comunidad, X.columnas.provincias], comunidades.map((c) => [esc(c.name), esc(c.list.map((p) => p.name).join(', '))])),
        comunidades.map((c) => c.name),
      ],
    };

    for (const pagina of mapa.paginas) {
      const P = X[pagina.id];
      const [tablaHtml, items] = contenido[pagina.id];
      const path = mapaPath(mapa, lang, pagina);
      const otras = mapa.paginas.filter((o) => o !== pagina).map((o) => `<a href="${mapaPath(mapa, lang, o)}">${esc(mapaEnlace(mapa, lang, o))}</a>`);
      paginasMapa++;
      write(
        path,
        page({
          lang,
          path,
          alternates: alternatesOf(pagina),
          title: seoTitle(P.h1),
          ogTitle: P.h1,
          description: P.description,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: P.h1,
            url: `${SITE}${path}`,
            inLanguage: lang,
            isPartOf: { '@type': 'WebSite', name: 'Study World Map', url: `${SITE}/` },
            mainEntity: {
              '@type': 'ItemList',
              name: mapaEnlace(mapa, lang, pagina),
              numberOfItems: items.length,
              itemListElement: items.map((name, i) => ({ '@type': 'ListItem', position: i + 1, name })),
            },
          },
          body: `    <h1>${esc(P.h1)}</h1>
    <p class="lead">${esc(P.description)}</p>
    <a class="cta" href="${base(lang)}?mapa=${mapa.id}&amp;reto=${pagina.reto}">${esc(P.cta)}</a>
    <p>${T.juego.gratis}</p>
    <h2>${esc(P.h2)}</h2>
${tablaHtml}
    <h2>${T.juego.sigue}</h2>
    <nav class="toc">${otras.join(' ')}</nav>
    <p><a href="${paisesPath(lang)}">${T.juego.todos}</a></p>`,
        }),
      );
    }
  }
}

// ───────────────────────── temas que la aplicación ya enseña ─────────────────────────
// Geografía física, climas, población y «El planeta»: una página por tema y por idioma, con sus
// datos (los mismos que usa la aplicación) y el enlace que abre el reto ya elegido. Los textos de
// la página están en scripts/data/temas/<idioma>.mjs; los nombres de climas y de capas salen del
// diccionario de la aplicación (src/i18n/<idioma>.ts) y los de ríos, montañas y países, de los datos.
// No se hace una página por país ni por combinación: eso sería contenido de relleno.

/** Los temas de cada idioma, en el mismo orden: { es: [{ id, path, enlace, … }], en: […] }. */
const TEMAS = {};
{
  const fisico = JSON.parse(readFileSync('public/data/fisico.json', 'utf8')).features.filter((f) => f.quiz);
  const SPANISH_FIRST = new Set(['ca', 'gl', 'eu']); // como src/ui/MapCanvas.tsx cuando falta un nombre
  const fuente = readFileSync('src/ui/planetLayers.ts', 'utf8');
  const capas = (nombre) => {
    const bloque = fuente.slice(fuente.indexOf(`export const ${nombre} = [`));
    const filas = [...bloque.slice(0, bloque.indexOf('\n];')).matchAll(/\{[^{}]*?name: t\('([^']+)'\)[^{}]*?detail: t\('([^']+)'\)[^{}]*?\}/gs)];
    if (!filas.length) throw new Error(`build-pages: no se han podido leer las capas «${nombre}» de src/ui/planetLayers.ts`);
    return filas.map((m) => ({ name: m[1], detail: m[2], temp: /temp: '([^']+)'/.exec(m[0])?.[1] }));
  };
  const LITOSFERA =
    'Según cómo se comportan, las capas de fuera se nombran de otra forma: la litosfera es la parte rígida (la corteza y lo más alto del manto, unos 100 km), rota en placas; debajo está la astenosfera, sólida pero plástica, sobre la que esas placas se mueven.';
  // Clases de accidente de cada página, por secciones, y la zona del reto que abre (?zona=…).
  const FISICO = [
    { id: 'rios', zona: 'fisico-rios', secciones: { rio: ['rio'], lago: ['lago'] } },
    { id: 'montanas', zona: 'fisico-montanas', secciones: { cordillera: ['cordillera'], pico: ['pico'] } },
    { id: 'mares', zona: 'fisico-mares', secciones: { oceano: ['oceano'], mar: ['mar'], golfo: ['golfo'], estrecho: ['estrecho'] } },
    { id: 'tierras', zona: 'fisico-tierras', secciones: { desierto: ['desierto'], llanura: ['meseta', 'llanura'], peninsula: ['peninsula'], isla: ['isla'] } },
  ];

  for (const lang of LANGS) {
    const T = PAGINAS[lang];
    const X = (await import(`./data/temas/${lang}.mjs`)).default;
    const dic = lang === 'es' ? null : (await import(`../src/i18n/${lang}.ts`)).default;
    const tr = (texto) => {
      if (!dic) return texto;
      if (!dic[texto]) throw new Error(`build-pages: a src/i18n/${lang}.ts le falta «${texto.slice(0, 60)}».`);
      return dic[texto];
    };
    const home = base(lang);
    const juego = `${home}${T.ruta.juego}/`;
    const num = (n) => Math.round(n).toLocaleString(T.intl);
    const bandera = (c) => `<img src="/flags/${c.a2}.svg" alt="" width="24" height="18" loading="lazy" /> ${esc(c.name)}`;
    const tabla = (head, rows) => `    <div class="table-wrap"><table>
      <thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>
${rows.map((cells) => `        <tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('\n')}
      </tbody>
    </table></div>`;
    const lista = (items) => `    <ul class="cols">\n${items.map((item) => `      <li>${esc(item)}</li>`).join('\n')}\n    </ul>`;
    const temas = [];

    // ── geografía física: lo que entra en el reto, por clases ──
    const deClase = (kinds) =>
      fisico
        .filter((f) => kinds.includes(f.kind))
        .map((f) => ({ name: f.names[lang] ?? (SPANISH_FIRST.has(lang) ? (f.names.es ?? f.names.en) : (f.names.en ?? f.names.es)), elev: f.elev }))
        .sort((a, b) => a.name.localeCompare(b.name, T.intl));
    for (const f of FISICO) {
      const textos = X.fisico[f.id];
      const secciones = Object.entries(f.secciones).map(([clave, kinds]) => [textos.secciones[clave], deClase(kinds)]);
      const total = secciones.reduce((n, [, items]) => n + items.length, 0);
      temas.push({
        id: f.id,
        path: `${juego}${X.slug[f.id]}/`,
        enlace: textos.enlace,
        h1: textos.h1,
        description: textos.description,
        cta: [`${home}?mapa=fisico&amp;reto=localizar&amp;zona=${f.zona}`, X.fisico.cta(lang === 'de' ? textos.enlace : textos.enlace.toLowerCase())],
        items: secciones.flatMap(([, items]) => items.map((i) => i.name)),
        body: `    <p>${esc(X.fisico.intro(total))}</p>
${secciones
  .map(([titulo, items]) =>
    items.some((i) => i.elev)
      ? `    <h2>${esc(titulo)} <span class="count">${items.length}</span></h2>\n${tabla([X.comun.nombre, X.comun.altitud], items.map((i) => [esc(i.name), i.elev ? `${num(i.elev)} m` : '—']))}`
      : `    <h2>${esc(titulo)} <span class="count">${items.length}</span></h2>\n${lista(items.map((i) => i.name))}`,
  )
  .join('\n')}
    <p><small>${esc(X.fisico.fuente)}</small></p>`,
      });
    }

    // ── climas y población: con los datos de cada país del atlas ──
    const paises = worldIn(lang)
      .all.filter((c) => c.kind === 'country')
      .sort((a, b) => a.name.localeCompare(b.name, T.intl));
    const conClima = paises.filter((c) => c.climate?.length);
    temas.push({
      id: 'climas',
      path: `${juego}${X.slug.climas}/`,
      enlace: X.climas.enlace,
      h1: X.climas.h1,
      description: X.climas.description(conClima.length),
      cta: [`${home}?reto=climas`, X.climas.cta],
      items: Object.values(CLIMAS).map(tr),
      body: `    <p>${esc(X.climas.intro)}</p>
    <h2>${esc(X.climas.h2)} <span class="count">${esc(X.climas.cuenta(conClima.length))}</span></h2>
    <p>${esc(X.climas.nota)}</p>
${tabla([X.comun.pais, X.climas.columna], conClima.map((c) => [bandera(c), esc(c.climate.map((k) => tr(CLIMAS[k])).join(', '))]))}
    <p><small>${esc(X.climas.fuente)}</small></p>`,
    });
    const poblados = paises.filter((c) => c.population).sort((a, b) => b.population - a.population);
    const year = poblados[0].populationYear;
    temas.push({
      id: 'poblacion',
      path: `${juego}${X.slug.poblacion}/`,
      enlace: X.poblacion.enlace,
      h1: X.poblacion.h1,
      description: X.poblacion.description(year),
      cta: [`${home}?reto=habitantes`, X.poblacion.cta],
      items: poblados.slice(0, 30).map((c) => c.name),
      body: `    <h2>${esc(X.poblacion.h2)} <span class="count">${esc(X.poblacion.cuenta(poblados.length))}</span></h2>
    <p>${esc(X.poblacion.nota)}</p>
${tabla(
  ['', X.comun.pais, X.poblacion.habitantes(year), X.poblacion.densidad],
  poblados.map((c, i) => [String(i + 1), bandera(c), num(c.population), c.areaKm2 ? `${num(c.population / c.areaKm2)} ${esc(X.poblacion.unidad)}` : '—']),
)}
    <p><small>${esc(X.poblacion.fuente)}</small></p>`,
    });

    // ── el planeta: las mismas capas que enseña la aplicación (src/ui/planetLayers.ts) ──
    const fila = (c) => [`<strong>${esc(tr(c.name))}</strong>`, esc(tr(c.detail))];
    const interior = capas('INTERIOR').reverse();
    temas.push({
      id: 'tierra',
      path: `${home}${X.slug.tierra}/`,
      enlace: X.tierra.enlace,
      h1: X.tierra.h1,
      description: X.tierra.description,
      cta: [home, X.tierra.cta],
      items: interior.map((c) => tr(c.name)),
      body: `    <h2>${esc(X.tierra.h2)}</h2>
${tabla([X.tierra.capa, X.tierra.como, tr('Temperatura')], interior.map((c) => [...fila(c), esc(c.temp ?? '—')]))}
    <h2>${esc(tr('Discontinuidades'))}</h2>
    <p>${esc(X.tierra.discontinuidades)}</p>
${tabla([X.tierra.discontinuidad, X.tierra.separa], capas('DISCONTINUITIES').map(fila))}
    <h2>${esc(tr('Dentro del manto'))}</h2>
${tabla([X.tierra.zona, X.tierra.que], capas('MANTLE_ZONES').map(fila))}
    <p>${esc(tr(LITOSFERA))}</p>
    <p><small>${esc(X.tierra.fuente)}</small></p>`,
    });
    const atmosfera = capas('ATMOSPHERE').reverse();
    temas.push({
      id: 'atmosfera',
      path: `${home}${X.slug.atmosfera}/`,
      enlace: X.atmosfera.enlace,
      h1: X.atmosfera.h1,
      description: X.atmosfera.description,
      cta: [home, X.atmosfera.cta],
      items: atmosfera.map((c) => tr(c.name)),
      body: `    <h2>${esc(X.atmosfera.h2)}</h2>
${tabla([X.atmosfera.capa, X.atmosfera.altura], atmosfera.map(fila))}
    <p>${esc(X.atmosfera.nota)}</p>`,
    });

    TEMAS[lang] = Object.assign(temas, { textos: X.comun });
  }

  const site = { '@type': 'WebSite', name: 'Study World Map', url: `${SITE}/` };
  TEMAS.es.forEach((_, i) => sitemap.push(Object.fromEntries(LANGS.map((l) => [l, TEMAS[l][i].path]))));
  for (const lang of LANGS) {
    const T = PAGINAS[lang];
    const temas = TEMAS[lang];
    const juego = `${base(lang)}${T.ruta.juego}/`;
    temas.forEach((tema, i) => {
      const otros = temas.filter((o) => o !== tema).map((o) => `<a href="${o.path}">${esc(o.enlace)}</a>`);
      write(
        tema.path,
        page({
          lang,
          path: tema.path,
          alternates: Object.fromEntries(LANGS.map((l) => [l, TEMAS[l][i].path])),
          title: seoTitle(tema.h1),
          ogTitle: tema.h1,
          description: tema.description,
          ogType: 'article',
          jsonLd: [
            {
              '@context': 'https://schema.org',
              '@type': ['WebPage', 'LearningResource'],
              name: tema.h1,
              url: `${SITE}${tema.path}`,
              inLanguage: lang,
              isPartOf: site,
              learningResourceType: temas.textos.recurso,
              educationalLevel: temas.textos.nivel,
              isAccessibleForFree: true,
              mainEntity: { '@type': 'ItemList', name: tema.enlace, numberOfItems: tema.items.length, itemListElement: tema.items.map((name, n) => ({ '@type': 'ListItem', position: n + 1, name })) },
            },
            migas([[temas.textos.juegos, juego], [tema.enlace, tema.path]], lang),
          ],
          body: `    <h1>${esc(tema.h1)}</h1>
    <p class="lead">${esc(tema.description)}</p>
    <a class="cta" href="${tema.cta[0]}">${esc(tema.cta[1])}</a>
    <p>${T.juego.gratis}</p>
${tema.body}
    <h2>${T.juego.sigue}</h2>
    <nav class="toc">${otros.join(' ')}</nav>
    <p><a href="${juego}">${esc(temas.textos.todos)}</a> · <a href="${paisesPath(lang)}">${T.juego.todos}</a></p>`,
        }),
      );
    });
  }
}
const temas = TEMAS.es; // la página de «no encontrado» solo existe en español

// ───────────────────────── índice de juegos de cada idioma ─────────────────────────
// /juego/, /en/game/…: todas las páginas de juego del idioma en una sola, a un clic de la portada.

for (const lang of LANGS) {
  const T = PAGINAS[lang];
  const path = `${base(lang)}${T.ruta.juego}/`;
  const { continents } = worldIn(lang);
  void continents;
  const porZona = ZONAS.map((z) => ({ name: T.zonas[z.id], enlaces: RETOS.map((r) => [juegoPath(lang, r, z), T.juego.enlace(T.retos[r.id], T.zonas[z.id])]) }));
  const mapas = Object.values(MAPAS).flatMap((mapa) => mapa.paginas.map((pagina) => [mapaPath(mapa, lang, pagina), mapaEnlace(mapa, lang, pagina)]));
  const nav = (enlaces) => `    <nav class="toc">${enlaces.map(([href, text]) => `<a href="${href}">${esc(text)}</a>`).join(' ')}</nav>`;
  const titulo = T.paises.juegosAria;
  write(
    path,
    page({
      lang,
      path,
      alternates: Object.fromEntries(LANGS.map((l) => [l, `${base(l)}${PAGINAS[l].ruta.juego}/`])),
      title: seoTitle(titulo),
      ogTitle: titulo,
      description: T.paises.description(nPaises),
      jsonLd: migas([[titulo, path]], lang),
      body: `    <h1>${esc(titulo)}</h1>
    <a class="cta" href="${base(lang)}">${T.paises.cta}</a>
${porZona.map((z) => `    <h2>${esc(z.name)}</h2>\n${nav(z.enlaces)}`).join('\n')}
${Object.values(MAPAS).length ? `    <h2>${esc(mapaEnlace(Object.values(MAPAS)[0], lang, Object.values(MAPAS)[0].paginas[0]))}</h2>\n${nav(mapas)}` : ''}${
        `\n    <h2>${esc(TEMAS[lang].textos.indiceFisico)}</h2>\n${nav(TEMAS[lang].filter((t) => t.path.startsWith(path)).map((t) => [t.path, t.enlace]))}\n    <h2>${esc(TEMAS[lang].textos.indicePlaneta)}</h2>\n${nav(TEMAS[lang].filter((t) => !t.path.startsWith(path)).map((t) => [t.path, t.enlace]))}`
      }
    <p><a href="${paisesPath(lang)}">${T.juego.todos}</a></p>`,
    }),
  );
}
sitemap.push(Object.fromEntries(LANGS.map((l) => [l, `${base(l)}${PAGINAS[l].ruta.juego}/`])));

// ───────────────────────── página de «no encontrado» ─────────────────────────
// Vercel sirve public/404.html con estado 404 para cualquier dirección que no exista.

writeFileSync(
  'public/404.html',
  page({
    path: '/404.html',
    title: 'Página no encontrada · Study World Map',
    description: 'Esta página no existe. Vuelve al mapa interactivo o elige un juego de geografía.',
    body: `    <h1>Esta página no existe</h1>
    <p class="lead">Puede que el enlace esté mal escrito o que la página haya cambiado de sitio.</p>
    <a class="cta" href="/">Ir al mapa interactivo →</a>
    <nav class="toc"><a href="/juego/">Todos los juegos</a> <a href="/paises-y-capitales/">Países y capitales</a> ${temas.map((t) => `<a href="${t.path}">${esc(t.enlace)}</a>`).join(' ')}</nav>`,
  }).replace('<link rel="canonical" href="' + SITE + '/404.html" />', '<meta name="robots" content="noindex" />'),
);

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
  // La lista de enlaces a juegos y temas de index.html está escrita a mano en español; en los demás
  // idiomas se genera con los mismos enlaces.
  const a = (href, text) => `<a href="${href}">${esc(text)}</a>`;
  const tema = (id) => TEMAS[lang].find((t) => t.id === id);
  const grupos = [
    [a(`${base(lang)}${T.ruta.juego}/`, T.paises.juegosAria)],
    Object.values(MAPAS).flatMap((mapa) => mapa.paginas.map((pagina) => a(mapaPath(mapa, lang, pagina), mapaEnlace(mapa, lang, pagina)))),
    ['rios', 'montanas', 'mares', 'tierras'].map((id) => a(tema(id).path, tema(id).enlace)),
    ['climas', 'poblacion'].map((id) => a(tema(id).path, tema(id).enlace)),
    ['tierra', 'atmosfera'].map((id) => a(tema(id).path, tema(id).enlace)),
  ];
  const enlaces = `<h2>${esc(TEMAS[lang].textos.portada)}</h2>
        <ul>
${grupos.map((g) => `          <li>${g.join(' · ')}</li>`).join('\n')}
        </ul>`;
  let html = index.replace(/<!-- solo-es -->[\s\S]*?<!-- \/solo-es -->/, () => enlaces);
  for (const [from, to] of pairs) {
    if (!html.includes(from)) throw new Error(`build-pages: index.html ya no contiene «${from.slice(0, 60)}…» (scripts/data/idiomas/es.mjs).`);
    html = html.replaceAll(from, to);
  }
  mkdirSync(lang, { recursive: true });
  writeFileSync(`${lang}/index.html`, html);
}

// ───────────────────────── sitemap ─────────────────────────

let lastmod = new Date().toISOString().slice(0, 10);
try {
  lastmod = execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim() || lastmod;
} catch {
  // sin git (o sin historial) vale la fecha de hoy
}
const urls = sitemap.flatMap((alternates) =>
  Object.entries(alternates).map(
    ([, path]) =>
      `  <url><loc>${SITE}${path}</loc><lastmod>${lastmod}</lastmod>${
        Object.keys(alternates).length > 1
          ? [...Object.entries(alternates), ['x-default', alternates.es]].map(([lang, other]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${SITE}${other}" />`).join('')
          : ''
      }</url>`,
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
  `páginas (${LANGS.join(', ')}): países y capitales (${nPaises}) + ${juegos} juegos + ${paginasMapa} de mapas de un país + ${legalPages().length} legales${pending.length ? ` · ${pending.length} datos PENDIENTES en scripts/data/sitio.mjs` : ''}`,
);
// En Vercel no se publica un aviso legal a medias.
if (pending.length && process.env.VERCEL) {
  throw new Error(`build-pages: faltan datos en scripts/data/sitio.mjs:\n  ${pending.join('\n  ')}`);
}
