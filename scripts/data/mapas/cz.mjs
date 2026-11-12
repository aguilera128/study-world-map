// Chequia por regiones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Las catorce regiones (trece y Praga) no se agrupan en nada.
//
// Natural Earth trae los códigos ISO 3166-2 anteriores a 2016 (CZ-JC…); `renombrar` los pasa a los
// vigentes (CZ-31…), que son los que identifican cada región aquí y en Wikidata.

const r = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'cz',
  adm0: 'CZE',
  prefijo: 'CZ-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  renombrar: {
    'CZ-PR': 'CZ-10', 'CZ-ST': 'CZ-20', 'CZ-JC': 'CZ-31', 'CZ-PL': 'CZ-32', 'CZ-KA': 'CZ-41', 'CZ-US': 'CZ-42', 'CZ-LI': 'CZ-51',
    'CZ-KR': 'CZ-52', 'CZ-PA': 'CZ-53', 'CZ-VY': 'CZ-63', 'CZ-JM': 'CZ-64', 'CZ-OL': 'CZ-71', 'CZ-ZL': 'CZ-72', 'CZ-MO': 'CZ-80',
  },

  contexto: ['DEU', 'POL', 'SVK', 'AUT'],
  ventana: [5, 45.5, 25, 55.5],

  comunidades: {},

  provincias: [
    r('CZ-10', 'Praga', 'Praga', { alias: ['Praha'], capAlias: ['Praha'] }),
    // Su capital es Praga, que no pertenece a la región.
    r('CZ-20', 'Bohemia Central', 'Praga', { alias: ['Středočeský'], capAlias: ['Praha'] }),
    r('CZ-31', 'Bohemia Meridional', 'České Budějovice', { alias: ['Jihočeský', 'Bohemia del Sur'], capAlias: ['Ceske Budejovice', 'Budweis'] }),
    r('CZ-32', 'Pilsen', 'Pilsen', { alias: ['Plzeň'], capAlias: ['Plzeň'] }),
    r('CZ-41', 'Karlovy Vary', 'Karlovy Vary'),
    r('CZ-42', 'Ústí nad Labem', 'Ústí nad Labem', { alias: ['Usti nad Labem', 'Ústí'], capAlias: ['Usti nad Labem', 'Ústí'] }),
    r('CZ-51', 'Liberec', 'Liberec'),
    r('CZ-52', 'Hradec Králové', 'Hradec Králové', { alias: ['Hradec Kralove'], capAlias: ['Hradec Kralove'] }),
    r('CZ-53', 'Pardubice', 'Pardubice'),
    r('CZ-63', 'Vysočina', 'Jihlava', { alias: ['Vysocina', 'Tierras Altas'] }),
    r('CZ-64', 'Moravia Meridional', 'Brno', { alias: ['Jihomoravský', 'Moravia del Sur'] }),
    r('CZ-71', 'Olomouc', 'Olomouc'),
    r('CZ-72', 'Zlín', 'Zlín', { alias: ['Zlin'], capAlias: ['Zlin'] }),
    r('CZ-80', 'Moravia-Silesia', 'Ostrava', { alias: ['Moravskoslezský', 'Moravia Silesia'] }),
  ],

  correcciones: {
    // En inglés y en alemán Wikidata titula con el adjetivo o con el nombre checo («Středočeský kraj»).
    en: { provincias: { 'CZ-20': { nombre: 'Central Bohemia' }, 'CZ-31': { nombre: 'South Bohemia' }, 'CZ-64': { nombre: 'South Moravia' }, 'CZ-80': { nombre: 'Moravia-Silesia' } } },
    de: {
      provincias: {
        'CZ-20': { nombre: 'Mittelböhmen' },
        'CZ-31': { nombre: 'Südböhmen' },
        'CZ-52': { nombre: 'Königgrätz', capital: 'Königgrätz', alias: ['Hradec Králové'], capAlias: ['Hradec Králové'] },
        'CZ-63': { nombre: 'Vysočina' },
        'CZ-64': { nombre: 'Südmähren' },
        'CZ-80': { nombre: 'Mähren-Schlesien' },
      },
    },
    // Wikidata da la forma de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'CZ-20': { nombre: 'Boêmia Central' } } },
    eu: { provincias: { 'CZ-20': { nombre: 'Erdialdeko Bohemia' }, 'CZ-31': { nombre: 'Hegoaldeko Bohemia' } } },
  },
};
