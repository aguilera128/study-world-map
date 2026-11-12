// Bélgica por provincias: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Las «comunidades» son las tres regiones del país; la de Bruselas-Capital no
// tiene provincias y se estudia con ellas, como Ceuta y Melilla en el mapa de España.

const p = (iso, nombre, capital, region, extra = {}) => ({ iso, nombre, capital, comunidad: region, ...extra });

export default {
  id: 'be',
  adm0: 'BEL',
  prefijo: 'BE-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['NLD', 'DEU', 'LUX', 'FRA'],
  ventana: [-5.3, 41, 16, 56],

  comunidades: {
    'BE-VLG': 'Flandes',
    'BE-WAL': 'Valonia',
    'BE-BRU': 'Bruselas',
  },

  provincias: [
    // ── Flandes ──
    p('BE-VAN', 'Amberes', 'Amberes', 'BE-VLG', { alias: ['Antwerpen'], capAlias: ['Antwerpen'] }),
    p('BE-VLI', 'Limburgo', 'Hasselt', 'BE-VLG', { alias: ['Limburg'] }),
    p('BE-VOV', 'Flandes Oriental', 'Gante', 'BE-VLG', { alias: ['Oost-Vlaanderen'], capAlias: ['Gent'] }),
    p('BE-VBR', 'Brabante Flamenco', 'Lovaina', 'BE-VLG', { alias: ['Vlaams-Brabant'], capAlias: ['Leuven'] }),
    p('BE-VWV', 'Flandes Occidental', 'Brujas', 'BE-VLG', { alias: ['West-Vlaanderen'], capAlias: ['Brugge'] }),
    // ── Valonia ──
    p('BE-WBR', 'Brabante Valón', 'Wavre', 'BE-WAL', { alias: ['Brabant wallon'] }),
    p('BE-WHT', 'Henao', 'Mons', 'BE-WAL', { alias: ['Hainaut'] }),
    p('BE-WLG', 'Lieja', 'Lieja', 'BE-WAL', { alias: ['Liège', 'Liege'], capAlias: ['Liège', 'Liege'] }),
    p('BE-WLX', 'Luxemburgo', 'Arlon', 'BE-WAL', { alias: ['Luxembourg'] }),
    p('BE-WNA', 'Namur', 'Namur', 'BE-WAL'),
    // ── Bruselas-Capital ──
    p('BE-BRU', 'Bruselas', 'Bruselas', 'BE-BRU', { alias: ['Bruselas-Capital', 'Bruxelles', 'Brussel'], capAlias: ['Bruxelles', 'Brussel'] }),
  ],

  // Las regiones, por su nombre corriente y no por el oficial («Región Flamenca»), como en español.
  correcciones: {
    en: { comunidades: { 'BE-VLG': 'Flanders', 'BE-WAL': 'Wallonia' } },
    fr: { comunidades: { 'BE-VLG': 'Flandre', 'BE-WAL': 'Wallonie' } },
    de: { comunidades: { 'BE-VLG': 'Flandern', 'BE-WAL': 'Wallonien' } },
    it: { comunidades: { 'BE-VLG': 'Fiandre', 'BE-WAL': 'Vallonia' } },
    pt: { comunidades: { 'BE-VLG': 'Flandres', 'BE-WAL': 'Valônia' } },
    ca: { comunidades: { 'BE-VLG': 'Flandes', 'BE-WAL': 'Valònia' } },
    gl: {
      provincias: { 'BE-VOV': { nombre: 'Flandres Oriental' }, 'BE-VBR': { nombre: 'Brabante Flamengo' } },
      comunidades: { 'BE-VLG': 'Flandres', 'BE-WAL': 'Valonia' },
    },
    eu: { comunidades: { 'BE-VLG': 'Flandria', 'BE-WAL': 'Valonia' } },
    zh: { comunidades: { 'BE-VLG': '弗拉芒大区', 'BE-WAL': '瓦隆大区' } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
