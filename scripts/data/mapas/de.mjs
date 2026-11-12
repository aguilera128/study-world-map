// Alemania por estados federados: datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Los dieciséis estados no se agrupan en nada: no hay «comunidades».

/**
 * @param {string} iso      ISO 3166-2 del estado
 * @param {string} nombre   Nombre en español
 * @param {string} capital
 * @param {{ alias?: string[], capAlias?: string[] }} [extra]  otros nombres aceptados al escribir
 */
const e = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'de',
  adm0: 'DEU',
  prefijo: 'DE-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['DNK', 'POL', 'CZE', 'AUT', 'CHE', 'FRA', 'LUX', 'BEL', 'NLD', 'LIE'],
  ventana: [-6, 41, 25, 59],

  comunidades: {},

  provincias: [
    e('DE-BW', 'Baden-Wurtemberg', 'Stuttgart', { alias: ['Baden-Württemberg'] }),
    e('DE-BY', 'Baviera', 'Múnich', { alias: ['Bayern'], capAlias: ['Munich', 'München'] }),
    e('DE-BE', 'Berlín', 'Berlín', { alias: ['Berlin'], capAlias: ['Berlin'] }),
    e('DE-BB', 'Brandeburgo', 'Potsdam', { alias: ['Brandenburg', 'Brandemburgo'] }),
    e('DE-HB', 'Bremen', 'Bremen', { alias: ['Brema'], capAlias: ['Brema'] }),
    e('DE-HH', 'Hamburgo', 'Hamburgo', { alias: ['Hamburg'], capAlias: ['Hamburg'] }),
    e('DE-HE', 'Hesse', 'Wiesbaden', { alias: ['Hessen'] }),
    e('DE-MV', 'Mecklemburgo-Pomerania Occidental', 'Schwerin', { alias: ['Mecklenburg-Vorpommern', 'Mecklemburgo-Antepomerania'] }),
    e('DE-NI', 'Baja Sajonia', 'Hannover', { alias: ['Niedersachsen'], capAlias: ['Hanóver'] }),
    e('DE-NW', 'Renania del Norte-Westfalia', 'Düsseldorf', { alias: ['Nordrhein-Westfalen', 'Renania del Norte Westfalia'], capAlias: ['Dusseldorf'] }),
    e('DE-RP', 'Renania-Palatinado', 'Maguncia', { alias: ['Rheinland-Pfalz', 'Renania Palatinado'], capAlias: ['Mainz'] }),
    e('DE-SL', 'Sarre', 'Saarbrücken', { alias: ['Saarland'], capAlias: ['Sarrebruck', 'Saarbrucken'] }),
    e('DE-SN', 'Sajonia', 'Dresde', { alias: ['Sachsen'], capAlias: ['Dresden'] }),
    e('DE-ST', 'Sajonia-Anhalt', 'Magdeburgo', { alias: ['Sachsen-Anhalt', 'Sajonia Anhalt'], capAlias: ['Magdeburg'] }),
    e('DE-SH', 'Schleswig-Holstein', 'Kiel'),
    e('DE-TH', 'Turingia', 'Erfurt', { alias: ['Thüringen'] }),
  ],

  correcciones: {
    // Wikidata da las formas de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'DE-SN': { nombre: 'Saxônia' }, 'DE-ST': { nombre: 'Saxônia-Anhalt' }, 'DE-BW': { capital: 'Stuttgart' } } },
    // En gallego, Wikidata titula tres estados con el nombre alemán detrás.
    gl: { provincias: { 'DE-NW': { nombre: 'Renania do Norte-Westfalia' }, 'DE-SN': { nombre: 'Saxonia' }, 'DE-ST': { nombre: 'Saxonia-Anhalt' } } },
    // Caracteres simplificados.
    zh: { provincias: { 'DE-NW': { capital: '杜塞尔多夫' } } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
