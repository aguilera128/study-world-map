// Finlandia por regiones (maakunnat): datos en español, escritos a mano. Qué lleva cada fichero de
// un mapa está explicado en ./es.mjs. Son las diecinueve regiones, con Åland; no se agrupan aquí en
// nada.
//
// Las fronteras NO salen de Natural Earth, que es anterior al 1 de enero de 2021 (ese día cambiaron
// de región Heinävesi, Joroinen, Iitti, Kuhmoinen e Isokyrö), sino de Statistics Finland: «unidades
// estadísticas por municipios», regiones de 2026 a escala 1:1 000 000, con licencia CC BY 4.0. Se
// descargan de su servicio WFS (capa `tilastointialueet:maakunta1000k_2026`, en GeoJSON y EPSG:4326):
//   https://geo.stat.fi/geoserver/tilastointialueet/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=tilastointialueet:maakunta1000k_2026&outputFormat=application/json&srsName=EPSG:4326
// y se pasan al generador como tercer argumento:
//   node scripts/build-subdivisions.mjs <Natural Earth> fi <maakunta1000k_2026.geojson>
// Los vecinos siguen saliendo de Natural Earth, así que su frontera con Finlandia no es la misma
// línea que la de las regiones: casan a menos de un kilómetro. Rusia no va entre los vecinos (no
// cabe entera en la ventana): la pone de fondo la aplicación, del atlas del mundo.

const r = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'fi',
  adm0: 'FIN',
  prefijo: 'FI-',
  fuente: 'Statistics Finland, unidades estadísticas por municipios de 2026 (CC BY 4.0) · vecinos: Natural Earth 1:10m · nombres y capitales: elaboración propia',
  wikidata: {},
  /** De qué capa salen sus unidades: el campo que las identifica y el código ISO 3166-2 de cada una. */
  capa: {
    origen: 'Statistics Finland, tilastointialueet:maakunta1000k_2026',
    campo: 'maakunta',
    codigos: {
      '01': 'FI-18', '02': 'FI-19', '04': 'FI-17', '05': 'FI-06', '06': 'FI-11', '07': 'FI-16', '08': 'FI-09', '09': 'FI-02', 10: 'FI-04', 11: 'FI-15',
      12: 'FI-13', 13: 'FI-08', 14: 'FI-03', 15: 'FI-12', 16: 'FI-07', 17: 'FI-14', 18: 'FI-05', 19: 'FI-10', 21: 'FI-01',
    },
  },
  /** Åland es una de las regiones: el atlas del mundo la trae aparte, como territorio, y no se dibuja otra vez de fondo. */
  mundo: ['ALA'],
  /** Un país largo y con miles de islas: pide menos detalle que una provincia española. */
  detalle: 6e-5,
  islote: 2e-3,

  contexto: ['SWE', 'NOR'],
  ventana: [3, 54, 33, 72],

  comunidades: {},

  provincias: [
    r('FI-01', 'Åland', 'Mariehamn', { alias: ['Aland', 'Ahvenanmaa', 'Islas Åland'], capAlias: ['Maarianhamina'] }),
    r('FI-02', 'Carelia del Sur', 'Lappeenranta', { alias: ['Karelia del Sur', 'Etelä-Karjala'] }),
    r('FI-03', 'Ostrobotnia del Sur', 'Seinäjoki', { alias: ['Etelä-Pohjanmaa'], capAlias: ['Seinajoki'] }),
    r('FI-04', 'Savonia del Sur', 'Mikkeli', { alias: ['Etelä-Savo'] }),
    r('FI-05', 'Kainuu', 'Kajaani'),
    r('FI-06', 'Tavastia Propia', 'Hämeenlinna', { alias: ['Kanta-Häme', 'Kanta-Hame'], capAlias: ['Hameenlinna'] }),
    r('FI-07', 'Ostrobotnia Central', 'Kokkola', { alias: ['Keski-Pohjanmaa'] }),
    r('FI-08', 'Finlandia Central', 'Jyväskylä', { alias: ['Keski-Suomi'], capAlias: ['Jyvaskyla'] }),
    r('FI-09', 'Kymenlaakso', 'Kotka', { alias: ['Valle del Kymi'] }),
    r('FI-10', 'Laponia', 'Rovaniemi', { alias: ['Laponia finlandesa', 'Lappi'] }),
    r('FI-11', 'Pirkanmaa', 'Tampere'),
    r('FI-12', 'Ostrobotnia', 'Vaasa', { alias: ['Pohjanmaa'] }),
    r('FI-13', 'Carelia del Norte', 'Joensuu', { alias: ['Karelia del Norte', 'Pohjois-Karjala'] }),
    r('FI-14', 'Ostrobotnia del Norte', 'Oulu', { alias: ['Pohjois-Pohjanmaa'] }),
    r('FI-15', 'Savonia del Norte', 'Kuopio', { alias: ['Pohjois-Savo'] }),
    r('FI-16', 'Päijänne Tavastia', 'Lahti', { alias: ['Päijät-Häme', 'Paijanne Tavastia', 'Paijat-Hame'] }),
    r('FI-17', 'Satakunta', 'Pori'),
    r('FI-18', 'Uusimaa', 'Helsinki', { alias: ['Nyland'] }),
    r('FI-19', 'Finlandia Propia', 'Turku', { alias: ['Finlandia del Sudoeste', 'Varsinais-Suomi'], capAlias: ['Åbo'] }),
  ],

  // Wikidata mezcla el portugués de Portugal con el de Brasil y el chino tradicional con el
  // simplificado, y en gallego desambigua Laponia con una coma.
  correcciones: {
    pt: { provincias: { 'FI-04': { nombre: 'Savônia do Sul' }, 'FI-15': { nombre: 'Savônia do Norte' }, 'FI-18': { capital: 'Helsinque' } } },
    gl: { provincias: { 'FI-10': { nombre: 'Laponia' } } },
    zh: { provincias: { 'FI-08': { nombre: '中芬兰区' }, 'FI-10': { nombre: '拉普兰区' } } },
  },
};
