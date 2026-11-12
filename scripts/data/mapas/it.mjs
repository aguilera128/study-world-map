// Italia por regiones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Las veinte regiones no se agrupan en nada.
//
// Natural Earth trae las provincias (con una división de Cerdeña que ya no es la vigente), cada una
// con el código ISO 3166-2 de su región (`region_cod`): `fundir` las reúne por ese campo, así que
// las provincias no llegan al mapa.

const r = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'it',
  adm0: 'ITA',
  prefijo: 'IT-',
  fuente: 'Natural Earth 1:10m (admin 1, provincias fundidas por región) · nombres y capitales: elaboración propia',
  wikidata: {},
  fundir: 'region_cod',

  contexto: ['FRA', 'CHE', 'AUT', 'SVN', 'SMR', 'VAT', 'MCO'],
  ventana: [-6, 35, 19, 52],

  comunidades: {},

  provincias: [
    r('IT-21', 'Piamonte', 'Turín', { alias: ['Piemonte'], capAlias: ['Torino'] }),
    r('IT-23', 'Valle de Aosta', 'Aosta', { alias: ['Valle d’Aosta', "Valle d'Aosta"] }),
    r('IT-25', 'Lombardía', 'Milán', { alias: ['Lombardia'], capAlias: ['Milano'] }),
    r('IT-32', 'Trentino-Alto Adigio', 'Trento', { alias: ['Trentino-Alto Adige', 'Trentino Alto Adigio'] }),
    r('IT-34', 'Véneto', 'Venecia', { alias: ['Veneto'], capAlias: ['Venezia'] }),
    r('IT-36', 'Friul-Venecia Julia', 'Trieste', { alias: ['Friuli-Venezia Giulia', 'Friuli-Venecia Julia', 'Friul Venecia Julia'] }),
    r('IT-42', 'Liguria', 'Génova', { capAlias: ['Genova'] }),
    r('IT-45', 'Emilia-Romaña', 'Bolonia', { alias: ['Emilia-Romagna', 'Emilia Romaña'], capAlias: ['Bologna'] }),
    r('IT-52', 'Toscana', 'Florencia', { capAlias: ['Firenze'] }),
    r('IT-55', 'Umbría', 'Perugia', { alias: ['Umbria'], capAlias: ['Perusa'] }),
    r('IT-57', 'Marcas', 'Ancona', { alias: ['Marche', 'Las Marcas'] }),
    r('IT-62', 'Lacio', 'Roma', { alias: ['Lazio'] }),
    r('IT-65', 'Abruzos', 'L’Aquila', { alias: ['Abruzzo', 'Abruzo', 'Los Abruzos'], capAlias: ["L'Aquila", 'Aquila', 'La Águila'] }),
    r('IT-67', 'Molise', 'Campobasso'),
    r('IT-72', 'Campania', 'Nápoles', { capAlias: ['Napoli'] }),
    r('IT-75', 'Apulia', 'Bari', { alias: ['Puglia', 'Pulla'] }),
    r('IT-77', 'Basilicata', 'Potenza'),
    r('IT-78', 'Calabria', 'Catanzaro'),
    r('IT-82', 'Sicilia', 'Palermo'),
    r('IT-88', 'Cerdeña', 'Cagliari', { alias: ['Sardegna'], capAlias: ['Cáller'] }),
  ],

  correcciones: {
    // Wikidata da las formas de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'IT-34': { nombre: 'Vêneto' }, 'IT-42': { capital: 'Gênova' } } },
    // Caracteres simplificados.
    zh: { provincias: { 'IT-57': { capital: '安科纳' }, 'IT-88': { capital: '卡利亚里' } } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
