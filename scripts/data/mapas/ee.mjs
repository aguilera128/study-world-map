// Estonia por condados (maakonnad): datos en español, escritos a mano. Qué lleva cada fichero de
// un mapa está explicado en ./es.mjs. Son los quince condados; no se agrupan aquí en nada.
//
// Las fronteras NO salen de Natural Earth, que es anterior a la reforma de 2017 (Lihula, Hanila,
// Koonga y Varbla pasaron del condado de Lääne al de Pärnu, entre otros cambios), sino de la
// división administrativa oficial (EHAK) de la Junta de Tierras y Ordenación del Territorio de
// Estonia (Maa- ja Ruumiamet), con su licencia de datos abiertos, que pide citar el organismo, el
// conjunto de datos y su fecha (https://geoportaal.maaruum.ee/opendata-licence). Se descarga, en
// GeoJSON y EPSG:4326, del servicio WFS de la Agencia de Medio Ambiente de Estonia, que la
// redistribuye (capa `baasandmed:ehak_maakond`; el campo `eksport` dice la fecha de los datos):
//   https://gsavalik.envir.ee/geoserver/baasandmed/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=baasandmed:ehak_maakond&outputFormat=application/json&srsName=EPSG:4326
// y se pasa al generador como tercer argumento:
//   node scripts/build-subdivisions.mjs <Natural Earth> ee <ehak_maakond.geojson>
// (La propia Junta la ofrece en shapefile y en el sistema de coordenadas estonio, L-EST97, en
// https://geoportaal.maaruum.ee/docs/haldus_asustus/maakond_shp.zip.) La capa ya viene sin el mar
// ni el lago Peipus. Rusia no va entre los vecinos (no cabe entera en la ventana): la pone de fondo
// la aplicación, del atlas del mundo.

/** «Jõgeva» → «Jogeva»: para aceptar la respuesta escrita con un teclado sin esas letras. */
const llano = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const c = (n, nombre, capital = nombre) => {
  const alias = llano(nombre) !== nombre ? { alias: [llano(nombre)] } : {};
  const capAlias = llano(capital) !== capital ? { capAlias: [llano(capital)] } : {};
  return { iso: `EE-${n}`, nombre, capital, ...alias, ...capAlias };
};

export default {
  id: 'ee',
  adm0: 'EST',
  prefijo: 'EE-',
  fuente: 'División administrativa de Estonia (EHAK), condados: Junta de Tierras y Ordenación del Territorio de Estonia (Maa- ja Ruumiamet), 01.11.2026 · vecinos: Natural Earth 1:10m · nombres y capitales: elaboración propia',
  wikidata: {},
  /** De qué capa salen sus unidades: el campo que las identifica y el código ISO 3166-2 de cada una. */
  capa: {
    origen: 'Maa- ja Ruumiamet, EHAK maakonnad (WFS baasandmed:ehak_maakond)',
    campo: 'mkood',
    codigos: {
      '0037': 'EE-37', '0039': 'EE-39', '0045': 'EE-45', '0050': 'EE-50', '0052': 'EE-52', '0056': 'EE-56', '0060': 'EE-60', '0064': 'EE-64', '0068': 'EE-68',
      '0071': 'EE-71', '0074': 'EE-74', '0079': 'EE-79', '0081': 'EE-81', '0084': 'EE-84', '0087': 'EE-87',
    },
  },

  contexto: ['LVA'],
  ventana: [20, 55, 30, 61],

  comunidades: {},

  provincias: [
    c('37', 'Harju', 'Tallin'),
    c('39', 'Hiiu', 'Kärdla'),
    c('45', 'Ida-Viru', 'Jõhvi'),
    c('50', 'Jõgeva'),
    c('52', 'Järva', 'Paide'),
    c('56', 'Lääne', 'Haapsalu'),
    c('60', 'Lääne-Viru', 'Rakvere'),
    c('64', 'Põlva'),
    c('68', 'Pärnu'),
    c('71', 'Rapla'),
    c('74', 'Saare', 'Kuressaare'),
    c('79', 'Tartu'),
    c('81', 'Valga'),
    c('84', 'Viljandi'),
    c('87', 'Võru'),
  ],

  // Wikidata da los condados con la palabra «Kreis» en alemán (y el de Hiiu, solo con ella) y con
  // el genitivo en euskera («Harjuko konderria»); en portugués le falta Saare, que allí llevan «-maa».
  correcciones: {
    de: {
      provincias: {
        'EE-37': { nombre: 'Harju' }, 'EE-39': { nombre: 'Hiiu' }, 'EE-45': { nombre: 'Ida-Viru' }, 'EE-52': { nombre: 'Järva' },
        'EE-56': { nombre: 'Lääne' }, 'EE-60': { nombre: 'Lääne-Viru' }, 'EE-74': { nombre: 'Saare' },
      },
    },
    eu: {
      provincias: {
        'EE-37': { nombre: 'Harju' }, 'EE-39': { nombre: 'Hiiu' }, 'EE-45': { nombre: 'Ida-Viru' }, 'EE-52': { nombre: 'Järva' },
        'EE-56': { nombre: 'Lääne' }, 'EE-60': { nombre: 'Lääne-Viru' }, 'EE-74': { nombre: 'Saare' },
      },
    },
    pt: { provincias: { 'EE-74': { nombre: 'Saaremaa' } } },
  },
};
