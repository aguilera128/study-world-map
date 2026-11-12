// Bielorrusia por regiones (vóblasts): datos en español, escritos a mano. Qué lleva cada fichero de
// un mapa está explicado en ./es.mjs. Son las seis regiones y la ciudad de Minsk, que tiene rango
// propio; no se agrupan aquí en nada. Cada región lleva el nombre de su capital.
//
// La capital de la región de Minsk es la ciudad de Minsk, que no pertenece a ella: la comparten.
// Como se llamarían igual, se distinguen en todos los idiomas. Rusia no va entre los vecinos (no
// cabe entera en la ventana): la pone de fondo la aplicación, del atlas del mundo.

const r = (iso, nombre, extra = {}) => ({ iso, nombre, capital: nombre, ...extra });

export default {
  id: 'by',
  adm0: 'BLR',
  prefijo: 'BY-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['POL', 'LTU', 'LVA', 'UKR'],
  ventana: [13.5, 43, 41, 59],

  comunidades: {},

  provincias: [
    r('BY-BR', 'Brest'),
    r('BY-HO', 'Gómel', { alias: ['Gomel', 'Homel'], capAlias: ['Gomel', 'Homel'] }),
    r('BY-HR', 'Grodno', { alias: ['Hrodna'], capAlias: ['Hrodna'] }),
    r('BY-MA', 'Maguilov', { alias: ['Moguilov', 'Mogilev', 'Mahiliou', 'Mahilyow'], capAlias: ['Moguilov', 'Mogilev', 'Mahiliou', 'Mahilyow'] }),
    { iso: 'BY-MI', nombre: 'Región de Minsk', capital: 'Minsk', alias: ['Minsk'] },
    r('BY-VI', 'Vítebsk', { alias: ['Vitebsk', 'Viciebsk'], capAlias: ['Vitebsk', 'Viciebsk'] }),
    { iso: 'BY-HM', nombre: 'Ciudad de Minsk', capital: 'Minsk', alias: ['Minsk'] },
  ],

  // La ciudad y la región de Minsk se distinguen en cada idioma. En catalán, Wikidata da a Brest
  // su nombre bielorruso en otra grafía («Biérastse»).
  correcciones: {
    en: { provincias: { 'BY-HM': { nombre: 'Minsk City' }, 'BY-MI': { nombre: 'Minsk Region' } } },
    fr: { provincias: { 'BY-HM': { nombre: 'Ville de Minsk' }, 'BY-MI': { nombre: 'Région de Minsk' } } },
    de: { provincias: { 'BY-HM': { nombre: 'Stadt Minsk' }, 'BY-MI': { nombre: 'Region Minsk' } } },
    it: { provincias: { 'BY-HM': { nombre: 'Città di Minsk' }, 'BY-MI': { nombre: 'Regione di Minsk' } } },
    pt: { provincias: { 'BY-HM': { nombre: 'Cidade de Minsk' }, 'BY-MI': { nombre: 'Região de Minsk' } } },
    ca: { provincias: { 'BY-BR': { nombre: 'Brest', capital: 'Brest' }, 'BY-HM': { nombre: 'Ciutat de Minsk' }, 'BY-MI': { nombre: 'Regió de Minsk' } } },
    gl: { provincias: { 'BY-HM': { nombre: 'Cidade de Minsk' }, 'BY-MI': { nombre: 'Rexión de Minsk' } } },
    eu: { provincias: { 'BY-HM': { nombre: 'Minsk hiria' }, 'BY-MI': { nombre: 'Minskeko oblasta' } } },
    zh: { provincias: { 'BY-HM': { nombre: '明斯克市', capital: '明斯克' }, 'BY-MI': { nombre: '明斯克州' } } },
  },
};
