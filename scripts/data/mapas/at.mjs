// Austria por estados federados: datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Los nueve estados no se agrupan en nada: no hay «comunidades».

/**
 * @param {string} iso      ISO 3166-2 del estado
 * @param {string} nombre   Nombre en español
 * @param {string} capital
 * @param {{ alias?: string[], capAlias?: string[] }} [extra]  otros nombres aceptados al escribir
 */
const e = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'at',
  adm0: 'AUT',
  prefijo: 'AT-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['DEU', 'CZE', 'SVK', 'HUN', 'SVN', 'ITA', 'CHE', 'LIE'],
  ventana: [5, 35, 23, 56],

  comunidades: {},

  provincias: [
    e('AT-1', 'Burgenland', 'Eisenstadt'),
    e('AT-2', 'Carintia', 'Klagenfurt', { alias: ['Kärnten'], capAlias: ['Klagenfurt am Wörthersee'] }),
    e('AT-3', 'Baja Austria', 'Sankt Pölten', { alias: ['Niederösterreich'], capAlias: ['St. Pölten', 'St Pölten', 'San Pölten'] }),
    e('AT-4', 'Alta Austria', 'Linz', { alias: ['Oberösterreich'] }),
    e('AT-5', 'Salzburgo', 'Salzburgo', { alias: ['Salzburg'], capAlias: ['Salzburg'] }),
    e('AT-6', 'Estiria', 'Graz', { alias: ['Steiermark'] }),
    e('AT-7', 'Tirol', 'Innsbruck'),
    e('AT-8', 'Vorarlberg', 'Bregenz'),
    e('AT-9', 'Viena', 'Viena', { alias: ['Wien'], capAlias: ['Wien'] }),
  ],

  correcciones: {
    gl: { provincias: { 'AT-4': { nombre: 'Alta Austria' } } },
    // Wikidata no da nombre en español a Bregenz: se queda el nuestro en todos los idiomas menos el chino.
    zh: { provincias: { 'AT-8': { capital: '布雷根茨' } } },
  },
};
