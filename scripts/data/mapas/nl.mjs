// Países Bajos por provincias: datos en español, escritos a mano. Qué lleva cada fichero de un mapa
// está explicado en ./es.mjs. Las doce provincias no se agrupan en nada: no hay «comunidades». Los
// tres municipios especiales del Caribe (Bonaire, Saba y San Eustaquio) quedan fuera de la ventana.

const p = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'nl',
  adm0: 'NLD',
  prefijo: 'NL-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['DEU', 'BEL', 'LUX', 'FRA'],
  ventana: [-5.3, 41, 16, 56],

  comunidades: {},

  provincias: [
    p('NL-DR', 'Drente', 'Assen', { alias: ['Drenthe'] }),
    p('NL-FL', 'Flevoland', 'Lelystad', { alias: ['Flevolanda'] }),
    p('NL-FR', 'Frisia', 'Leeuwarden', { alias: ['Friesland', 'Fryslân'] }),
    p('NL-GE', 'Güeldres', 'Arnhem', { alias: ['Gelderland', 'Gueldres'] }),
    p('NL-GR', 'Groninga', 'Groninga', { alias: ['Groningen'], capAlias: ['Groningen'] }),
    p('NL-LI', 'Limburgo', 'Maastricht', { alias: ['Limburg'], capAlias: ['Mastrique'] }),
    p('NL-NB', 'Brabante Septentrional', 'Bolduque', { alias: ['Noord-Brabant', 'Brabante del Norte'], capAlias: ['’s-Hertogenbosch', 's-Hertogenbosch', 'Den Bosch'] }),
    p('NL-NH', 'Holanda Septentrional', 'Haarlem', { alias: ['Noord-Holland', 'Holanda del Norte'] }),
    p('NL-OV', 'Overijssel', 'Zwolle'),
    p('NL-UT', 'Utrecht', 'Utrecht'),
    p('NL-ZE', 'Zelanda', 'Middelburg', { alias: ['Zeeland'], capAlias: ['Midelburgo'] }),
    p('NL-ZH', 'Holanda Meridional', 'La Haya', { alias: ['Zuid-Holland', 'Holanda del Sur'], capAlias: ['Den Haag', '’s-Gravenhage'] }),
  ],

  correcciones: {
    // Wikidata no da nombre en inglés a la ciudad.
    en: { provincias: { 'NL-NB': { capital: '’s-Hertogenbosch', capAlias: ['Den Bosch'] } } },
    // Wikidata da la forma de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'NL-UT': { nombre: 'Utrecht', capital: 'Utrecht' } } },
  },
};
