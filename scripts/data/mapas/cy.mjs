// Chipre por distritos (eparchíes): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los seis distritos de la República de Chipre, que cubren la
// isla entera, como el mapa del mundo, que la trata como un solo país: el norte y las bases
// británicas de Akrotiri y Dhekelia quedan dentro de su distrito. Cada distrito lleva el nombre de
// su capital; no se agrupan aquí en nada.
//
// Las fronteras NO salen de Natural Earth, que trae cinco distritos cortados por la línea de alto
// el fuego y el norte como un solo bloque (falta Kyrenia), sino del Departamento de Tierras y
// Catastro de Chipre (Department of Lands and Surveys): su servicio INSPIRE de unidades
// administrativas, que publica sin condiciones de uso. Se descarga, en GeoJSON y EPSG:4326, de la
// capa de segundo orden:
//   https://eservices.dls.moi.gov.cy/inspire/rest/services/INSPIRE/AU_AdmUnits/MapServer/9/query?where=1%3D1&outFields=nationalCode&outSR=4326&f=geojson
// y se pasa al generador como tercer argumento:
//   node scripts/build-subdivisions.mjs <Natural Earth> cy <distritos.geojson>
// El campo `nationalCode` es el número de distrito del catastro, que no coincide con el del código
// ISO 3166-2 (el 2 es Kyrenia, CY-06). Es una isla: no hay vecinos que dibujar.

const d = (n, nombre, extra = {}) => ({ iso: `CY-0${n}`, nombre, capital: nombre, ...extra });

export default {
  id: 'cy',
  adm0: 'CYP',
  prefijo: 'CY-',
  fuente: 'Departamento de Tierras y Catastro de Chipre (Department of Lands and Surveys), unidades administrativas INSPIRE · nombres y capitales: elaboración propia',
  wikidata: {},
  /** De qué capa salen sus unidades: el campo que las identifica y el código ISO 3166-2 de cada una. */
  capa: {
    origen: 'Department of Lands and Surveys de Chipre, INSPIRE AU_AdmUnits, capa 9',
    campo: 'nationalCode',
    codigos: { 1: 'CY-01', 2: 'CY-06', 3: 'CY-04', 4: 'CY-03', 5: 'CY-02', 6: 'CY-05' },
  },

  contexto: [],
  ventana: [31.5, 34, 35.2, 36.2],

  comunidades: {},

  provincias: [
    d(1, 'Nicosia', { alias: ['Lefkosia', 'Lefkoşa'], capAlias: ['Lefkosia', 'Lefkoşa'] }),
    d(2, 'Limasol', { alias: ['Limassol', 'Lemesos'], capAlias: ['Limassol', 'Lemesos'] }),
    d(3, 'Lárnaca', { alias: ['Larnaca', 'Larnaka'], capAlias: ['Larnaca', 'Larnaka'] }),
    d(4, 'Famagusta', { alias: ['Ammochostos', 'Gazimağusa'], capAlias: ['Ammochostos', 'Gazimağusa'] }),
    d(5, 'Pafos', { alias: ['Paphos'], capAlias: ['Paphos'] }),
    d(6, 'Kyrenia', { alias: ['Kirenia', 'Keryneia', 'Girne'], capAlias: ['Kirenia', 'Keryneia', 'Girne'] }),
  ],

  // Wikidata no enlaza la capital de cada distrito con un nombre en español: los nombres, que son
  // los de la ciudad en cada idioma, van a mano.
  correcciones: {
    en: { provincias: { 'CY-01': { nombre: 'Nicosia', capital: 'Nicosia' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Larnaca', capital: 'Larnaca' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Paphos', capital: 'Paphos' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    fr: { provincias: { 'CY-01': { nombre: 'Nicosie', capital: 'Nicosie' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Larnaca', capital: 'Larnaca' }, 'CY-04': { nombre: 'Famagouste', capital: 'Famagouste' }, 'CY-05': { nombre: 'Paphos', capital: 'Paphos' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    de: { provincias: { 'CY-01': { nombre: 'Nikosia', capital: 'Nikosia' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Larnaka', capital: 'Larnaka' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Paphos', capital: 'Paphos' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    it: { provincias: { 'CY-01': { nombre: 'Nicosia', capital: 'Nicosia' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Larnaca', capital: 'Larnaca' }, 'CY-04': { nombre: 'Famagosta', capital: 'Famagosta' }, 'CY-05': { nombre: 'Pafo', capital: 'Pafo' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    pt: { provincias: { 'CY-01': { nombre: 'Nicósia', capital: 'Nicósia' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Larnaca', capital: 'Larnaca' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Pafos', capital: 'Pafos' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    ca: { provincias: { 'CY-01': { nombre: 'Nicòsia', capital: 'Nicòsia' }, 'CY-02': { nombre: 'Limassol', capital: 'Limassol' }, 'CY-03': { nombre: 'Làrnaca', capital: 'Làrnaca' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Pafos', capital: 'Pafos' }, 'CY-06': { nombre: 'Cerinea', capital: 'Cerinea' } } },
    gl: { provincias: { 'CY-01': { nombre: 'Nicosia', capital: 'Nicosia' }, 'CY-02': { nombre: 'Limasol', capital: 'Limasol' }, 'CY-03': { nombre: 'Larnaca', capital: 'Larnaca' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Pafos', capital: 'Pafos' }, 'CY-06': { nombre: 'Kyrenia', capital: 'Kyrenia' } } },
    eu: { provincias: { 'CY-01': { nombre: 'Nikosia', capital: 'Nikosia' }, 'CY-02': { nombre: 'Limasol', capital: 'Limasol' }, 'CY-03': { nombre: 'Larnaka', capital: 'Larnaka' }, 'CY-04': { nombre: 'Famagusta', capital: 'Famagusta' }, 'CY-05': { nombre: 'Pafos', capital: 'Pafos' }, 'CY-06': { nombre: 'Kirenia', capital: 'Kirenia' } } },
    zh: { provincias: { 'CY-01': { nombre: '尼科西亚', capital: '尼科西亚' }, 'CY-02': { nombre: '利马索尔', capital: '利马索尔' }, 'CY-03': { nombre: '拉纳卡', capital: '拉纳卡' }, 'CY-04': { nombre: '法马古斯塔', capital: '法马古斯塔' }, 'CY-05': { nombre: '帕福斯', capital: '帕福斯' }, 'CY-06': { nombre: '凯里尼亚', capital: '凯里尼亚' } } },
  },
};
