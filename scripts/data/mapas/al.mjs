// Albania por condados (qarqe): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Los doce condados no se agrupan en nada. Kosovo va entre los
// vecinos, como en el mapa del mundo.

const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'al',
  adm0: 'ALB',
  prefijo: 'AL-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: { tipo: { de: [/^Qark /], it: [/^Prefettura di /] } },

  contexto: ['MNE', 'KOS', 'MKD', 'GRC'],
  ventana: [18, 34.5, 29, 44],

  comunidades: {},

  provincias: [
    c('AL-01', 'Berat', 'Berat'),
    c('AL-09', 'Dibër', 'Peshkopi', { alias: ['Diber', 'Dibra'] }),
    c('AL-02', 'Durrës', 'Durrës', { alias: ['Durres', 'Durazzo'], capAlias: ['Durres', 'Durazzo'] }),
    c('AL-03', 'Elbasan', 'Elbasan'),
    c('AL-04', 'Fier', 'Fier'),
    c('AL-05', 'Gjirokastër', 'Gjirokastër', { alias: ['Gjirokaster', 'Gjirokastra'], capAlias: ['Gjirokaster', 'Gjirokastra'] }),
    c('AL-06', 'Korçë', 'Korçë', { alias: ['Korce', 'Korça'], capAlias: ['Korce', 'Korça'] }),
    c('AL-07', 'Kukës', 'Kukës', { alias: ['Kukes'], capAlias: ['Kukes'] }),
    c('AL-08', 'Lezhë', 'Lezhë', { alias: ['Lezhe', 'Lezha'], capAlias: ['Lezhe', 'Lezha'] }),
    c('AL-10', 'Shkodër', 'Shkodër', { alias: ['Shkoder', 'Shkodra', 'Escútari'], capAlias: ['Shkoder', 'Shkodra', 'Escútari'] }),
    c('AL-11', 'Tirana', 'Tirana', { alias: ['Tiranë'], capAlias: ['Tiranë'] }),
    c('AL-12', 'Vlorë', 'Vlorë', { alias: ['Vlore', 'Vlora', 'Valona'], capAlias: ['Vlore', 'Vlora', 'Valona'] }),
  ],

  correcciones: {
    eu: { provincias: { 'AL-09': { nombre: 'Dibër' } } },
  },
};
