// Noruega por condados (fylker): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los quince condados vigentes desde el 1 de enero de 2024; no
// se agrupan aquí en nada. Svalbard y Jan Mayen no son condados y quedan fuera.
//
// Las fronteras NO salen de Natural Earth, que trae los condados anteriores a 2018, sino de
// Kartverket: «Administrative enheter fylker», con licencia CC BY 4.0. Se descarga de Geonorge, en
// GeoJSON y EPSG:4258 (ETRS89, que a esta escala coincide con WGS84):
//   https://nedlasting.geonorge.no/geonorge/Basisdata/Fylker/GeoJSON/Basisdata_0000_Norge_4258_Fylker_GeoJSON.zip
// y se pasa al generador como tercer argumento:
//   node scripts/build-subdivisions.mjs <Natural Earth> no <Basisdata_0000_Norge_4258_Fylker_GeoJSON.geojson>
// Esa capa llega hasta el límite del mar territorial: el generador la recorta por la tierra que
// Natural Earth da a Noruega (`costa`), así que la costa y la frontera con los vecinos son las de
// Natural Earth y de Kartverket salen las fronteras entre condados.
//
// Varias capitales no son inequívocas (la sede del condado y la del gobernador están en ciudades
// distintas): va la sede del condado y al escribir se acepta la otra. La de Akershus es Oslo, que
// no pertenece a él: la comparte con el condado de Oslo. Rusia no va entre los vecinos (no cabe
// entera en la ventana): la pone de fondo la aplicación, del atlas del mundo.

const c = (n, nombre, capital, extra = {}) => ({ iso: `NO-${n}`, nombre, capital, ...extra });

export default {
  id: 'no',
  adm0: 'NOR',
  prefijo: 'NO-',
  fuente: 'Kartverket, Administrative enheter fylker de 2026 (CC BY 4.0), recortado por la costa de Natural Earth 1:10m · vecinos: Natural Earth · nombres y capitales: elaboración propia',
  wikidata: {},
  /** De qué capa salen sus unidades: el campo que las identifica y el código ISO 3166-2 de cada una. */
  capa: {
    origen: 'Kartverket, Administrative enheter fylker (Geonorge)',
    campo: 'fylkesnummer',
    codigos: {
      '03': 'NO-03', 11: 'NO-11', 15: 'NO-15', 18: 'NO-18', 31: 'NO-31', 32: 'NO-32', 33: 'NO-33', 34: 'NO-34', 39: 'NO-39', 40: 'NO-40', 42: 'NO-42', 46: 'NO-46',
      50: 'NO-50', 55: 'NO-55', 56: 'NO-56',
    },
    /** Llega hasta el límite del mar territorial: se recorta por la tierra de Natural Earth. */
    costa: true,
  },
  /** Un país largo y con miles de islas: pide menos detalle que una provincia española. */
  detalle: 8e-5,
  islote: 2e-3,

  contexto: ['SWE', 'FIN'],
  ventana: [3, 54, 33, 72],

  comunidades: {},

  provincias: [
    c('03', 'Oslo', 'Oslo'),
    c('11', 'Rogaland', 'Stavanger'),
    c('15', 'Møre og Romsdal', 'Molde', { alias: ['More og Romsdal', 'Møre y Romsdal'] }),
    c('18', 'Nordland', 'Bodø', { capAlias: ['Bodo', 'Bodoe'] }),
    c('31', 'Østfold', 'Sarpsborg', { alias: ['Ostfold', 'Oestfold'] }),
    c('32', 'Akershus', 'Oslo'),
    c('33', 'Buskerud', 'Drammen'),
    c('34', 'Innlandet', 'Hamar', { capAlias: ['Lillehammer'] }),
    c('39', 'Vestfold', 'Tønsberg', { capAlias: ['Tonsberg', 'Toensberg'] }),
    c('40', 'Telemark', 'Skien'),
    c('42', 'Agder', 'Kristiansand', { capAlias: ['Arendal'] }),
    c('46', 'Vestland', 'Bergen', { capAlias: ['Hermansverk', 'Leikanger'] }),
    c('50', 'Trøndelag', 'Steinkjer', { alias: ['Trondelag', 'Troendelag'], capAlias: ['Trondheim'] }),
    c('55', 'Troms', 'Tromsø', { capAlias: ['Tromso', 'Tromsoe'] }),
    c('56', 'Finnmark', 'Vadsø', { capAlias: ['Vadso', 'Vadsoe'] }),
  ],

  // En euskera, Wikidata da a Vestland el nombre de una montaña. En chino faltan varias capitales
  // (van a mano) y dos nombres vienen en caracteres tradicionales.
  correcciones: {
    eu: { provincias: { 'NO-46': { nombre: 'Vestland' } } },
    zh: {
      provincias: {
        'NO-11': { capital: '斯塔万格' },
        'NO-32': { capital: '奥斯陆' },
        'NO-33': { capital: '德拉门' },
        'NO-34': { nombre: '内陆郡' },
        'NO-39': { capital: '滕斯贝格' },
        'NO-40': { capital: '希恩' },
        'NO-42': { capital: '克里斯蒂安桑' },
        'NO-46': { nombre: '韦斯特兰郡' },
        'NO-50': { capital: '斯泰恩谢尔' },
        'NO-55': { capital: '特罗姆瑟' },
        'NO-56': { capital: '瓦德瑟' },
      },
    },
  },
};
