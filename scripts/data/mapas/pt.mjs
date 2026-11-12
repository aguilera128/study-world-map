// Portugal por distritos: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Los dieciocho distritos del continente llevan el nombre de su capital y no
// se agrupan en nada. Las Azores y Madeira son regiones autónomas, no distritos, pero se estudian
// con ellos, como Ceuta y Melilla en el mapa de España.

const d = (iso, nombre, extra = {}) => ({ iso, nombre, capital: nombre, ...extra });

// Wikidata tiene los distritos a medias (sin capital, o con el nombre en dos o tres idiomas), así que
// sus nombres van a mano: el portugués, salvo las pocas ciudades que tienen otro en algún idioma.
const PORTUGUES = { 'PT-04': 'Bragança', 'PT-06': 'Coimbra', 'PT-13': 'Porto' };
const EXONIMOS = {
  'PT-04': { fr: 'Bragance', it: 'Braganza', gl: 'Braganza', eu: 'Bragantza' },
  'PT-06': { ca: 'Coïmbra' },
  'PT-11': { en: 'Lisbon', fr: 'Lisbonne', de: 'Lissabon', it: 'Lisbona' },
};
const CHINO = {
  'PT-01': '阿威罗', 'PT-02': '贝雅', 'PT-03': '布拉加', 'PT-04': '布拉干萨', 'PT-05': '布朗库堡', 'PT-06': '科英布拉',
  'PT-07': '埃武拉', 'PT-08': '法鲁', 'PT-09': '瓜达', 'PT-10': '莱里亚', 'PT-11': '里斯本', 'PT-12': '波塔莱格雷',
  'PT-13': '波尔图', 'PT-14': '圣塔伦', 'PT-15': '塞图巴尔', 'PT-16': '维亚纳堡', 'PT-17': '雷阿尔城', 'PT-18': '维塞乌',
};
/** Nombre del distrito (y de su capital, que es el mismo) en un idioma. */
const enIdioma = (distrito, idioma) => (idioma === 'zh' ? CHINO[distrito.iso] : (EXONIMOS[distrito.iso]?.[idioma] ?? PORTUGUES[distrito.iso] ?? distrito.nombre));
const DISTRITOS = [
  d('PT-01', 'Aveiro'),
  d('PT-02', 'Beja'),
  d('PT-03', 'Braga'),
  d('PT-04', 'Braganza', { alias: ['Bragança'], capAlias: ['Bragança'] }),
  d('PT-05', 'Castelo Branco'),
  d('PT-06', 'Coímbra', { alias: ['Coimbra'], capAlias: ['Coimbra'] }),
  d('PT-07', 'Évora', { alias: ['Evora'], capAlias: ['Evora'] }),
  d('PT-08', 'Faro'),
  d('PT-09', 'Guarda'),
  d('PT-10', 'Leiria'),
  d('PT-11', 'Lisboa'),
  d('PT-12', 'Portalegre'),
  d('PT-13', 'Oporto', { alias: ['Porto'], capAlias: ['Porto'] }),
  d('PT-14', 'Santarém', { alias: ['Santarem'], capAlias: ['Santarem'] }),
  d('PT-15', 'Setúbal', { alias: ['Setubal'], capAlias: ['Setubal'] }),
  d('PT-16', 'Viana do Castelo'),
  d('PT-17', 'Vila Real'),
  d('PT-18', 'Viseu'),
];
/** Lo que Wikidata da de más o en otra escritura para las dos regiones autónomas. */
const ISLAS = { gl: { 'PT-30': { nombre: 'Madeira' } }, zh: { 'PT-30': { nombre: '马德拉' } } };

export default {
  id: 'pt',
  adm0: 'PRT',
  prefijo: 'PT-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  /** El encuadre del mapa es el del continente: con las Azores dentro, quedaría en una esquina. Las islas se buscan girando el globo. */
  marco: [-9.6, 36.9, -6.1, 42.2],

  contexto: ['ESP'],
  ventana: [-32, 29, 5, 45],

  comunidades: {},

  provincias: [
    ...DISTRITOS,
    // ── Regiones autónomas ──
    { iso: 'PT-20', nombre: 'Azores', capital: 'Ponta Delgada', alias: ['Açores', 'Islas Azores'] },
    { iso: 'PT-30', nombre: 'Madeira', capital: 'Funchal' },
  ],

  correcciones: Object.fromEntries(
    ['en', 'fr', 'de', 'it', 'pt', 'ca', 'gl', 'eu', 'zh'].map((idioma) => [
      idioma,
      {
        provincias: {
          ...Object.fromEntries(DISTRITOS.map((distrito) => [distrito.iso, { nombre: enIdioma(distrito, idioma), capital: enIdioma(distrito, idioma) }])),
          ...ISLAS[idioma],
        },
      },
    ]),
  ),

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
