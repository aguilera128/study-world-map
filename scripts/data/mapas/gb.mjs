// Reino Unido por naciones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Son los cuatro países constituyentes, que no se agrupan en nada.
//
// Natural Earth trae 232 condados, distritos y municipios, cada uno con su nación en `geonunit`:
// `fundir` los reúne por ese campo y `renombrar` da a cada nación su código ISO 3166-2.

const n = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'gb',
  adm0: 'GBR',
  prefijo: 'GB-',
  fuente: 'Natural Earth 1:10m (admin 1, fundido por nación) · nombres y capitales: elaboración propia',
  wikidata: {},
  fundir: 'geonunit',
  renombrar: { England: 'GB-ENG', Scotland: 'GB-SCT', Wales: 'GB-WLS', 'Northern Ireland': 'GB-NIR' },
  /** Mucha costa y miles de islas para cuatro piezas: pide menos detalle que una provincia. */
  detalle: 6e-5,
  islote: 2e-3,

  contexto: ['IRL'],
  ventana: [-11.5, 49, 3, 61.5],

  comunidades: {},

  provincias: [
    n('GB-ENG', 'Inglaterra', 'Londres', { alias: ['England'], capAlias: ['London'] }),
    n('GB-SCT', 'Escocia', 'Edimburgo', { alias: ['Scotland'], capAlias: ['Edinburgh'] }),
    n('GB-WLS', 'Gales', 'Cardiff', { alias: ['Wales', 'País de Gales'] }),
    n('GB-NIR', 'Irlanda del Norte', 'Belfast', { alias: ['Northern Ireland'] }),
  ],

  correcciones: {
    // Wikidata no da nombre en español a Cardiff: se queda el nuestro en todos los idiomas menos el chino.
    zh: { provincias: { 'GB-WLS': { capital: '加的夫' } } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
