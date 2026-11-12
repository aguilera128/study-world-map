// Estados Unidos por estados: datos en español, escritos a mano. Qué lleva cada fichero de un mapa
// está explicado en ./es.mjs; aquí solo cambia lo que es distinto.
//
// Las «comunidades» de este mapa son las cuatro regiones de la Oficina del Censo de EE. UU. (Census
// Regions), que es la agrupación oficial de los estados. No tienen código ISO 3166-2, así que sus
// claves son propias (us-noreste…) y sus nombres en otros idiomas van a mano, en `correcciones`.

/**
 * @param {string} iso      ISO 3166-2 del estado
 * @param {string} nombre   Nombre en español (grafía recomendada por la RAE)
 * @param {string} capital
 * @param {string} region   Clave de su región del censo
 * @param {{ alias?: string[], capAlias?: string[] }} [extra]  otros nombres aceptados al escribir
 */
const e = (iso, nombre, capital, region, extra = {}) => ({ iso, nombre, capital, comunidad: region, ...extra });

export default {
  id: 'us',
  adm0: 'USA',
  prefijo: 'US-',
  fuente: 'Natural Earth 1:10m (admin 1) · regiones: Oficina del Censo de EE. UU. · nombres y capitales: elaboración propia',
  wikidata: {},
  /** El país es cien veces mayor que España: con el detalle de aquel, solo la costa de Alaska pesaría más que todo su mapa. */
  detalle: 6e-4,
  islote: 5e-3,

  contexto: ['CAN', 'MEX', 'CUB', 'BHS'],
  ventana: [-180, 14, -50, 85],

  comunidades: {
    'us-noreste': 'Noreste',
    'us-medio-oeste': 'Medio Oeste',
    'us-sur': 'Sur',
    'us-oeste': 'Oeste',
  },

  // Los 50 estados y el Distrito de Columbia, que no es un estado: se dibuja y se nombra, pero no se pregunta.
  provincias: [
    // ── Noreste ──
    e('US-CT', 'Connecticut', 'Hartford', 'us-noreste'),
    e('US-ME', 'Maine', 'Augusta', 'us-noreste'),
    e('US-MA', 'Massachusetts', 'Boston', 'us-noreste'),
    e('US-NH', 'Nuevo Hampshire', 'Concord', 'us-noreste', { alias: ['New Hampshire', 'Nueva Hampshire'] }),
    e('US-NJ', 'Nueva Jersey', 'Trenton', 'us-noreste', { alias: ['New Jersey'] }),
    e('US-NY', 'Nueva York', 'Albany', 'us-noreste', { alias: ['New York'] }),
    e('US-PA', 'Pensilvania', 'Harrisburg', 'us-noreste', { alias: ['Pennsylvania'] }),
    e('US-RI', 'Rhode Island', 'Providence', 'us-noreste'),
    e('US-VT', 'Vermont', 'Montpelier', 'us-noreste'),
    // ── Medio Oeste ──
    e('US-IL', 'Illinois', 'Springfield', 'us-medio-oeste'),
    e('US-IN', 'Indiana', 'Indianápolis', 'us-medio-oeste', { capAlias: ['Indianapolis'] }),
    e('US-IA', 'Iowa', 'Des Moines', 'us-medio-oeste'),
    e('US-KS', 'Kansas', 'Topeka', 'us-medio-oeste'),
    e('US-MI', 'Míchigan', 'Lansing', 'us-medio-oeste', { alias: ['Michigan'] }),
    e('US-MN', 'Minnesota', 'Saint Paul', 'us-medio-oeste', { capAlias: ['St. Paul', 'St Paul'] }),
    e('US-MO', 'Misuri', 'Jefferson City', 'us-medio-oeste', { alias: ['Missouri'] }),
    e('US-NE', 'Nebraska', 'Lincoln', 'us-medio-oeste'),
    e('US-ND', 'Dakota del Norte', 'Bismarck', 'us-medio-oeste', { alias: ['North Dakota'] }),
    e('US-OH', 'Ohio', 'Columbus', 'us-medio-oeste'),
    e('US-SD', 'Dakota del Sur', 'Pierre', 'us-medio-oeste', { alias: ['South Dakota'] }),
    e('US-WI', 'Wisconsin', 'Madison', 'us-medio-oeste'),
    // ── Sur ──
    e('US-AL', 'Alabama', 'Montgomery', 'us-sur'),
    e('US-AR', 'Arkansas', 'Little Rock', 'us-sur'),
    e('US-DE', 'Delaware', 'Dover', 'us-sur'),
    e('US-FL', 'Florida', 'Tallahassee', 'us-sur'),
    e('US-GA', 'Georgia', 'Atlanta', 'us-sur'),
    e('US-KY', 'Kentucky', 'Frankfort', 'us-sur'),
    e('US-LA', 'Luisiana', 'Baton Rouge', 'us-sur', { alias: ['Louisiana'] }),
    e('US-MD', 'Maryland', 'Annapolis', 'us-sur'),
    e('US-MS', 'Misisipi', 'Jackson', 'us-sur', { alias: ['Mississippi', 'Misisipí'] }),
    e('US-NC', 'Carolina del Norte', 'Raleigh', 'us-sur', { alias: ['North Carolina'] }),
    e('US-OK', 'Oklahoma', 'Oklahoma City', 'us-sur', { capAlias: ['Ciudad de Oklahoma'] }),
    e('US-SC', 'Carolina del Sur', 'Columbia', 'us-sur', { alias: ['South Carolina'] }),
    e('US-TN', 'Tennessee', 'Nashville', 'us-sur', { alias: ['Tennesse'] }),
    e('US-TX', 'Texas', 'Austin', 'us-sur', { alias: ['Tejas'] }),
    e('US-VA', 'Virginia', 'Richmond', 'us-sur'),
    e('US-WV', 'Virginia Occidental', 'Charleston', 'us-sur', { alias: ['West Virginia'] }),
    // ── Oeste ──
    e('US-AK', 'Alaska', 'Juneau', 'us-oeste'),
    e('US-AZ', 'Arizona', 'Phoenix', 'us-oeste'),
    e('US-CA', 'California', 'Sacramento', 'us-oeste'),
    e('US-CO', 'Colorado', 'Denver', 'us-oeste'),
    e('US-HI', 'Hawái', 'Honolulu', 'us-oeste', { alias: ['Hawaii', 'Hawai'], capAlias: ['Honolulú'] }),
    e('US-ID', 'Idaho', 'Boise', 'us-oeste'),
    e('US-MT', 'Montana', 'Helena', 'us-oeste'),
    e('US-NV', 'Nevada', 'Carson City', 'us-oeste'),
    e('US-NM', 'Nuevo México', 'Santa Fe', 'us-oeste', { alias: ['New Mexico', 'Nuevo Méjico'] }),
    e('US-OR', 'Oregón', 'Salem', 'us-oeste', { alias: ['Oregon'] }),
    e('US-UT', 'Utah', 'Salt Lake City', 'us-oeste'),
    e('US-WA', 'Washington', 'Olympia', 'us-oeste'),
    e('US-WY', 'Wyoming', 'Cheyenne', 'us-oeste'),
    // ── Decorado ──
    { iso: 'US-DC', nombre: 'Washington D. C.', decorado: true },
  ],

  // Wikidata no da nombre en español a Juneau: se queda el nuestro en todos los idiomas menos el chino.
  correcciones: {
    en: { comunidades: { 'us-noreste': 'Northeast', 'us-medio-oeste': 'Midwest', 'us-sur': 'South', 'us-oeste': 'West' } },
    fr: { comunidades: { 'us-noreste': 'Nord-Est', 'us-medio-oeste': 'Midwest', 'us-sur': 'Sud', 'us-oeste': 'Ouest' } },
    de: { comunidades: { 'us-noreste': 'Nordosten', 'us-medio-oeste': 'Mittlerer Westen', 'us-sur': 'Süden', 'us-oeste': 'Westen' } },
    it: { comunidades: { 'us-noreste': 'Nord-est', 'us-medio-oeste': 'Midwest', 'us-sur': 'Sud', 'us-oeste': 'Ovest' } },
    pt: {
      // Wikidata da las formas de Portugal; aquí el portugués es el de Brasil.
      provincias: { 'US-NJ': { nombre: 'Nova Jersey' }, 'US-NY': { nombre: 'Nova York' }, 'US-OR': { nombre: 'Oregon' } },
      comunidades: { 'us-noreste': 'Nordeste', 'us-medio-oeste': 'Meio-Oeste', 'us-sur': 'Sul', 'us-oeste': 'Oeste' },
    },
    ca: { comunidades: { 'us-noreste': 'Nord-est', 'us-medio-oeste': 'Mig Oest', 'us-sur': 'Sud', 'us-oeste': 'Oest' } },
    gl: { comunidades: { 'us-noreste': 'Nordeste', 'us-medio-oeste': 'Medio Oeste', 'us-sur': 'Sur', 'us-oeste': 'Oeste' } },
    eu: {
      provincias: { 'US-NJ': { nombre: 'New Jersey' } },
      comunidades: { 'us-noreste': 'Ipar-ekialdea', 'us-medio-oeste': 'Mendebalde Ertaina', 'us-sur': 'Hegoaldea', 'us-oeste': 'Mendebaldea' },
    },
    zh: {
      // Wikidata trae Virginia Occidental en caracteres tradicionales y Oklahoma con otra grafía que su capital.
      provincias: { 'US-WV': { nombre: '西弗吉尼亚州' }, 'US-OK': { nombre: '俄克拉何马州' }, 'US-AK': { capital: '朱诺' } },
      comunidades: { 'us-noreste': '东北部', 'us-medio-oeste': '中西部', 'us-sur': '南部', 'us-oeste': '西部' },
    },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
