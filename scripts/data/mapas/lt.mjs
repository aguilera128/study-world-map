// Lituania por condados (apskritys): datos en español, escritos a mano. Qué lleva cada fichero de
// un mapa está explicado en ./es.mjs. Los diez condados llevan el nombre de su capital y no se
// agrupan en nada. Rusia (Kaliningrado) no va entre los vecinos detallados: la dibuja el fondo.

const c = (iso, nombre, extra = {}) => ({ iso, nombre, capital: nombre, ...extra });

export default {
  id: 'lt',
  adm0: 'LTU',
  prefijo: 'LT-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: { tipo: { de: [/^Bezirk /] } },

  contexto: ['LVA', 'BLR', 'POL'],
  ventana: [13, 48, 34, 59],

  comunidades: {},

  provincias: [
    c('LT-AL', 'Alytus'),
    c('LT-KU', 'Kaunas'),
    c('LT-KL', 'Klaipėda', { alias: ['Klaipeda'], capAlias: ['Klaipeda'] }),
    c('LT-MR', 'Marijampolė', { alias: ['Marijampole'], capAlias: ['Marijampole'] }),
    c('LT-PN', 'Panevėžys', { alias: ['Panevezys'], capAlias: ['Panevezys'] }),
    c('LT-SA', 'Šiauliai', { alias: ['Siauliai'], capAlias: ['Siauliai'] }),
    c('LT-TA', 'Tauragė', { alias: ['Taurage'], capAlias: ['Taurage'] }),
    c('LT-TE', 'Telšiai', { alias: ['Telsiai'], capAlias: ['Telsiai'] }),
    c('LT-UT', 'Utena', { capAlias: ['Utena (Lituania)'] }),
    c('LT-VL', 'Vilna', { alias: ['Vilnius'], capAlias: ['Vilnius'] }),
  ],

  correcciones: {
    eu: { provincias: { 'LT-UT': { nombre: 'Utena' } } },
  },
};
