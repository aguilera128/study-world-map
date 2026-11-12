// Irlanda por condados: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Son los veintiséis condados tradicionales de la República, que son los que
// se estudian; no se agrupan aquí en nada (sus cuatro provincias históricas no entran).
//
// Natural Earth trae 34 piezas: las ciudades aparte de su condado, Dublín en cuatro y Tipperary en
// dos, todas con el código ISO 3166-2 de su condado. `fundir` las reúne por ese código.
//
// La capital es la cabeza de condado (county town). Donde el condado reparte su sede entre dos
// ciudades (Tipperary) o la cabeza histórica es otra (Waterford), se acepta también la segunda.

const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'ie',
  adm0: 'IRL',
  prefijo: 'IE-',
  fuente: 'Natural Earth 1:10m (admin 1, fundido por condado) · nombres y capitales: elaboración propia',
  wikidata: {},
  fundir: 'iso_3166_2',

  contexto: ['GBR'],
  ventana: [-11.5, 49, 3, 61.5],

  comunidades: {},

  provincias: [
    c('IE-CW', 'Carlow', 'Carlow'),
    c('IE-CN', 'Cavan', 'Cavan'),
    c('IE-CE', 'Clare', 'Ennis'),
    c('IE-CO', 'Cork', 'Cork'),
    c('IE-DL', 'Donegal', 'Lifford'),
    c('IE-D', 'Dublín', 'Dublín', { alias: ['Dublin'], capAlias: ['Dublin'] }),
    c('IE-G', 'Galway', 'Galway'),
    c('IE-KY', 'Kerry', 'Tralee'),
    c('IE-KE', 'Kildare', 'Naas'),
    c('IE-KK', 'Kilkenny', 'Kilkenny'),
    c('IE-LS', 'Laois', 'Portlaoise', { alias: ['Laoighis', 'Leix'], capAlias: ['Port Laoise'] }),
    c('IE-LM', 'Leitrim', 'Carrick-on-Shannon', { capAlias: ['Carrick on Shannon'] }),
    c('IE-LK', 'Limerick', 'Limerick'),
    c('IE-LD', 'Longford', 'Longford'),
    c('IE-LH', 'Louth', 'Dundalk'),
    c('IE-MO', 'Mayo', 'Castlebar'),
    c('IE-MH', 'Meath', 'Navan'),
    c('IE-MN', 'Monaghan', 'Monaghan'),
    c('IE-OY', 'Offaly', 'Tullamore'),
    c('IE-RN', 'Roscommon', 'Roscommon'),
    c('IE-SO', 'Sligo', 'Sligo'),
    c('IE-TA', 'Tipperary', 'Clonmel', { capAlias: ['Nenagh'] }),
    c('IE-WD', 'Waterford', 'Waterford', { capAlias: ['Dungarvan'] }),
    c('IE-WH', 'Westmeath', 'Mullingar'),
    c('IE-WX', 'Wexford', 'Wexford'),
    c('IE-WW', 'Wicklow', 'Wicklow', { capAlias: ['Wicklow Town'] }),
  ],

  correcciones: {
    // En gallego Wikidata titula varios condados y ciudades con el nombre irlandés detrás («Cavan - An Cabhán»).
    gl: {
      provincias: {
        'IE-CN': { nombre: 'Cavan', capital: 'Cavan' },
        'IE-CE': { capital: 'Ennis' },
        'IE-KY': { capital: 'Tralee' },
        'IE-KE': { capital: 'Naas' },
        'IE-LD': { nombre: 'Longford', capital: 'Longford' },
        'IE-MH': { capital: 'Navan' },
        'IE-OY': { capital: 'Tullamore' },
        'IE-SO': { nombre: 'Sligo', capital: 'Sligo' },
        'IE-WD': { nombre: 'Waterford', capital: 'Waterford' },
        'IE-WX': { nombre: 'Wexford', capital: 'Wexford' },
      },
    },
    // En euskera titula «…ko konderria», con un genitivo que no se puede quitar con una regla.
    eu: {
      provincias: {
        'IE-CE': { nombre: 'Clare' },
        'IE-DL': { nombre: 'Donegal' },
        'IE-KY': { nombre: 'Kerry' },
        'IE-KE': { nombre: 'Kildare' },
        'IE-LS': { nombre: 'Laois' },
        'IE-LM': { nombre: 'Leitrim' },
        'IE-LH': { nombre: 'Louth' },
        'IE-MO': { nombre: 'Mayo' },
        'IE-MH': { nombre: 'Meath' },
        'IE-OY': { nombre: 'Offaly' },
        'IE-TA': { nombre: 'Tipperary' },
        'IE-WH': { nombre: 'Westmeath' },
      },
    },
    // En chino, la ficha de Roscommon en Wikidata lleva por error el nombre de otra cosa (una batalla).
    zh: { provincias: { 'IE-RN': { nombre: '罗斯康芒', capital: '罗斯康芒' } } },
  },
};
