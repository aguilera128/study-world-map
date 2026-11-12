// Grecia por regiones (periferias): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Las trece regiones no se agrupan en nada. El Monte Athos, estado
// monástico autónomo, se dibuja y se nombra, pero no es una región y no se pregunta.
//
// Natural Earth da al Ática un código que no es el suyo (GR-A1); `renombrar` lo pasa al de ISO 3166-2.

const r = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'gr',
  adm0: 'GRC',
  prefijo: 'GR-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  renombrar: { 'GR-A1': 'GR-I' },
  /** Miles de islotes: con el detalle de una provincia pesaría más que todo lo demás. */
  detalle: 5e-5,
  islote: 1.5e-3,

  contexto: ['ALB', 'MKD', 'BGR', 'TUR'],
  ventana: [18, 33.5, 45.5, 44.5],

  comunidades: {},

  provincias: [
    r('GR-A', 'Macedonia Oriental y Tracia', 'Komotiní', { capAlias: ['Komotini'] }),
    r('GR-B', 'Macedonia Central', 'Salónica', { capAlias: ['Tesalónica', 'Thessaloniki'] }),
    r('GR-C', 'Macedonia Occidental', 'Kozani', { capAlias: ['Kozáni'] }),
    r('GR-D', 'Epiro', 'Ioánina', { capAlias: ['Ioannina', 'Yánina', 'Janina'] }),
    r('GR-E', 'Tesalia', 'Larisa', { capAlias: ['Lárisa'] }),
    r('GR-F', 'Islas Jónicas', 'Corfú', { capAlias: ['Kerkyra'] }),
    r('GR-G', 'Grecia Occidental', 'Patras'),
    r('GR-H', 'Grecia Central', 'Lamía', { capAlias: ['Lamia'] }),
    r('GR-I', 'Ática', 'Atenas', { alias: ['Atica'] }),
    r('GR-J', 'Peloponeso', 'Trípoli', { capAlias: ['Tripoli'] }),
    r('GR-K', 'Egeo Septentrional', 'Mitilene', { alias: ['Egeo del Norte'], capAlias: ['Mitilini'] }),
    r('GR-L', 'Egeo Meridional', 'Ermúpoli', { alias: ['Egeo del Sur'], capAlias: ['Ermoupoli', 'Hermúpolis'] }),
    r('GR-M', 'Creta', 'Heraclión', { capAlias: ['Heraklion', 'Iraklio', 'Candía'] }),
    // ── Decorado ──
    { iso: 'GR-69', nombre: 'Monte Athos', decorado: true },
  ],

  correcciones: {
    en: { provincias: { 'GR-69': { nombre: 'Mount Athos' } } },
    fr: { provincias: { 'GR-69': { nombre: 'Mont Athos' } } },
    de: { provincias: { 'GR-69': { nombre: 'Athos' } } },
    it: { provincias: { 'GR-69': { nombre: 'Monte Athos' } } },
    // Wikidata da formas de Portugal o a medio traducir; aquí el portugués es el de Brasil.
    pt: { provincias: { 'GR-F': { nombre: 'Ilhas Jônicas' }, 'GR-I': { nombre: 'Ática' }, 'GR-J': { nombre: 'Peloponeso' } } },
    ca: { provincias: { 'GR-69': { nombre: 'Mont Atos' } } },
    eu: { provincias: { 'GR-M': { nombre: 'Kreta' } } },
    // Caracteres simplificados.
    zh: { provincias: { 'GR-69': { nombre: '圣山' } } },
  },
};
