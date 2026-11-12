// Moldavia por distritos (raioane): datos en español, escritos a mano. Qué lleva cada fichero de
// un mapa está explicado en ./es.mjs. Son las 37 unidades de primer nivel: los 32 distritos, los
// municipios de Chisináu, Bălți y Bender, y las dos unidades autónomas, Gagauzia y Transnistria
// (de derecho, «Unidades administrativo-territoriales de la margen izquierda del Dniéster»). No se
// agrupan aquí en nada. Casi todas llevan el nombre de su capital.
//
// Las fronteras NO salen de Natural Earth, que parte Transnistria en sus distritos y no trae el de
// Dubăsari, sino de la capa de ACNUR y OCHA (2020, licencia CC BY 3.0 IGO) que publica
// geoBoundaries, con el código ISO 3166-2 de cada unidad:
//   https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/MDA/ADM1/geoBoundaries-MDA-ADM1.geojson
// y se pasa al generador como tercer argumento:
//   node scripts/build-subdivisions.mjs <Natural Earth> md <geoBoundaries-MDA-ADM1.geojson>
// Esa capa sigue las fronteras de derecho: Cocieri, en la margen izquierda, es del distrito de
// Dubăsari, y la ciudad de Dubăsari, de Transnistria. Es poco detallada: se recorta por el contorno
// que Natural Earth da al país (`costa`) para que no pise a los vecinos.

/** «Bălți» → «Balti»: para aceptar la respuesta escrita con un teclado sin esas letras. */
const llano = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const sinRepetir = (lista, propio) => [...new Set(lista.filter((x) => x && x !== propio))];
const r = (c, nombre, { capital = nombre, alias = [], capAlias = [] } = {}) => {
  const a = sinRepetir([...alias, llano(nombre)], nombre);
  const ca = sinRepetir([...capAlias, llano(capital)], capital);
  return { iso: `MD-${c}`, nombre, capital, ...(a.length && { alias: a }), ...(ca.length && { capAlias: ca }) };
};

const UNIDADES = [
  r('AN', 'Anenii Noi'),
  r('BA', 'Bălți', { alias: ['Beltsy'], capAlias: ['Beltsy'] }),
  r('BD', 'Bender', { alias: ['Tighina'], capAlias: ['Tighina'] }),
  r('BR', 'Briceni'),
  r('BS', 'Basarabeasca'),
  r('CA', 'Cahul'),
  r('CL', 'Călărași'),
  r('CM', 'Cimișlia'),
  r('CR', 'Criuleni'),
  r('CS', 'Căușeni'),
  r('CT', 'Cantemir'),
  r('CU', 'Chisináu', { alias: ['Chișinău', 'Chisinau', 'Kishinev'], capAlias: ['Chișinău', 'Chisinau', 'Kishinev'] }),
  r('DO', 'Dondușeni'),
  r('DR', 'Drochia'),
  r('DU', 'Dubăsari', { capital: 'Cocieri' }),
  r('ED', 'Edineț'),
  r('FA', 'Fălești'),
  r('FL', 'Florești'),
  r('GA', 'Gagauzia', { capital: 'Comrat', alias: ['Găgăuzia'] }),
  r('GL', 'Glodeni'),
  r('HI', 'Hîncești', { alias: ['Hâncești'], capAlias: ['Hâncești'] }),
  r('IA', 'Ialoveni'),
  r('LE', 'Leova'),
  r('NI', 'Nisporeni'),
  r('OC', 'Ocnița'),
  r('OR', 'Orhei'),
  r('RE', 'Rezina'),
  r('RI', 'Rîșcani', { alias: ['Râșcani'], capAlias: ['Râșcani'] }),
  r('SD', 'Șoldănești'),
  r('SI', 'Sîngerei', { alias: ['Sângerei'], capAlias: ['Sângerei'] }),
  r('SN', 'Transnistria', { capital: 'Tiraspol', alias: ['Stînga Nistrului', 'Stânga Nistrului', 'Margen izquierda del Dniéster'] }),
  r('SO', 'Soroca'),
  r('ST', 'Strășeni'),
  r('SV', 'Ștefan Vodă'),
  r('TA', 'Taraclia'),
  r('TE', 'Telenești'),
  r('UN', 'Ungheni'),
];

export default {
  id: 'md',
  adm0: 'MDA',
  prefijo: 'MD-',
  fuente: 'ACNUR y OCHA, límites administrativos de Moldavia de 2020 (CC BY 3.0 IGO), vía geoBoundaries, recortados por el contorno de Natural Earth 1:10m · vecinos: Natural Earth · nombres y capitales: elaboración propia',
  wikidata: { tipo: { en: [/ District$/i], fr: [/^district de /i], de: [/^Rajon /i], it: [/^distretto di /i], ca: [/^districte de /i] } },
  /** De qué capa salen sus unidades: el campo que las identifica (ya es el código ISO 3166-2). */
  capa: {
    origen: 'geoBoundaries MDA ADM1 (ACNUR, OCHA)',
    campo: 'shapeISO',
    codigos: Object.fromEntries(UNIDADES.map((u) => [u.iso, u.iso])),
    /** Es poco detallada y pisaría a los vecinos: se recorta por la tierra de Natural Earth. */
    costa: true,
  },

  contexto: ['ROU', 'UKR'],
  ventana: [19, 43, 41, 53.5],

  comunidades: {},

  provincias: UNIDADES,

  // Transnistria va con su nombre corriente, no con el oficial («Unidades administrativo-territoriales
  // de la margen izquierda del Dniéster»), como en español.
  correcciones: {
    en: { provincias: { 'MD-SN': { nombre: 'Transnistria' } } },
    it: { provincias: { 'MD-SN': { nombre: 'Transnistria' } } },
    pt: { provincias: { 'MD-SN': { nombre: 'Transnístria' } } },
    ca: { provincias: { 'MD-SN': { nombre: 'Transnístria' } } },
    zh: { provincias: { 'MD-SN': { nombre: '德涅斯特河沿岸', capital: '蒂拉斯波尔' } } },
  },
};
