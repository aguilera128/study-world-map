// Textos de las páginas legales y de donaciones. Los datos del titular salen de sitio.mjs
// (variables de entorno). Son los textos de studyworldmap.com: otro despliegue debe revisarlos.
//
// Lo que se afirma sobre la aplicación está comprobado en el código (src/app/store.ts y
// public/consent.js, src/app/sync.ts y api/sync.ts): progreso y ajustes en el navegador y, solo si
// se crea un código, también en la base de datos; ubicación solo en memoria; nada de Google sin
// consentimiento; y en el ranking (src/app/ranking.ts y api/ranking.ts) solo lo que se publica a
// propósito: apodo, nota, tiempo, fecha y país. Las capas de meteorología piden sus datos a este
// mismo sitio (api/tiempo.ts), que es quien habla con la NOAA y la NASA, y la de satélites también
// (api/satelites.ts, que habla con CelesTrak): a ellos no les llega nada de quien visita la web. Si
// eso cambia, hay que cambiar también estos textos.

//
// Hay un fichero por idioma en legales/, todos con la misma forma: «rutas» (el tramo de la dirección
// de cada página) y «paginas(contexto)», que devuelve las cuatro páginas con su id, título,
// descripción y cuerpo. El original es el español (legales/es.mjs); los demás son traducciones.

import { IDIOMAS } from './idiomas/index.mjs';
import * as ca from './legales/ca.mjs';
import * as de from './legales/de.mjs';
import * as en from './legales/en.mjs';
import * as es from './legales/es.mjs';
import * as eu from './legales/eu.mjs';
import * as fr from './legales/fr.mjs';
import * as gl from './legales/gl.mjs';
import * as it from './legales/it.mjs';
import * as pt from './legales/pt.mjs';
import * as zh from './legales/zh.mjs';
import { DONAR_URL, REVISION_LEGAL, SITE, TITULAR } from './sitio.mjs';

const TEXTOS = { es, en, fr, de, it, pt, ca, gl, eu, zh };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Un dato del titular; si aún falta, se resalta para que no pase desapercibido. */
const dato = (v) => (v.startsWith('PENDIENTE') ? `<span class="pending">${esc(v)}</span>` : esc(v));
const email = () =>
  TITULAR.email.startsWith('PENDIENTE') ? dato(TITULAR.email) : `<a href="mailto:${esc(TITULAR.email)}">${esc(TITULAR.email)}</a>`;

/** Los idiomas que tienen textos legales. */
export const LEGAL_LANGS = Object.keys(TEXTOS);

/** La dirección de una página legal («aviso», «privacidad», «cookies» o «donar») en un idioma. */
export const legalRuta = (lang, id) => `${lang === 'es' ? '/' : `/${lang}/`}${TEXTOS[lang].rutas[id]}/`;

/** Las páginas legales de un idioma, cada una con su dirección y las de sus equivalentes en los demás. */
export function legalPages(lang = 'es') {
  // La fecha de la última revisión, escrita como se escribe en ese idioma.
  const fecha = new Intl.DateTimeFormat(IDIOMAS[lang].locale.replace('_', '-'), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${REVISION_LEGAL}T00:00:00Z`));
  const contexto = { TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta: (id) => legalRuta(lang, id), original: (id) => legalRuta('es', id) };
  return TEXTOS[lang].paginas(contexto).map((pagina) => ({
    ...pagina,
    // Los enlaces a las páginas de ayuda de Google llevan el idioma en la dirección.
    body: pagina.body.replaceAll('?hl=es', `?hl=${IDIOMAS[lang].locale.replace('_', '-')}`),
    lang,
    path: legalRuta(lang, pagina.id),
    alternates: Object.fromEntries(LEGAL_LANGS.map((other) => [other, legalRuta(other, pagina.id)])),
  }));
}
