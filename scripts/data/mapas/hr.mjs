// Croacia por condados (županije): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los veinte condados y la ciudad de Zagreb, que tiene rango
// de condado; no se agrupan en nada.
//
// Natural Earth da a Požega-Eslavonia el código y el nombre de su vecino (Brod-Posavina):
// `corregir` le pone el suyo por el identificador de la pieza. La capital del condado de Zagreb es
// la ciudad de Zagreb, que no pertenece a él: la comparte con ella.

const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'hr',
  adm0: 'HRV',
  prefijo: 'HR-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: { tipo: { de: [/^Gespanschaft /], fr: [/^Comitat d[’']/] } },
  corregir: { 'HRV-1604': 'HR-11' },

  contexto: ['SVN', 'HUN', 'SRB', 'BIH', 'MNE'],
  ventana: [12.5, 41, 23.5, 49],

  comunidades: {},

  provincias: [
    c('HR-21', 'Ciudad de Zagreb', 'Zagreb', { alias: ['Zagreb', 'Grad Zagreb'] }),
    c('HR-01', 'Condado de Zagreb', 'Zagreb', { alias: ['Zagrebačka'] }),
    c('HR-02', 'Krapina-Zagorje', 'Krapina'),
    c('HR-03', 'Sisak-Moslavina', 'Sisak'),
    c('HR-04', 'Karlovac', 'Karlovac'),
    c('HR-05', 'Varaždin', 'Varaždin', { alias: ['Varazdin'], capAlias: ['Varazdin'] }),
    c('HR-06', 'Koprivnica-Križevci', 'Koprivnica', { alias: ['Koprivnica-Krizevci'] }),
    c('HR-07', 'Bjelovar-Bilogora', 'Bjelovar'),
    c('HR-08', 'Primorje-Gorski Kotar', 'Rijeka', { capAlias: ['Fiume'] }),
    c('HR-09', 'Lika-Senj', 'Gospić', { capAlias: ['Gospic'] }),
    c('HR-10', 'Virovitica-Podravina', 'Virovitica'),
    c('HR-11', 'Požega-Eslavonia', 'Požega', { alias: ['Pozega-Eslavonia', 'Požega-Slavonia'], capAlias: ['Pozega'] }),
    c('HR-12', 'Brod-Posavina', 'Slavonski Brod'),
    c('HR-13', 'Zadar', 'Zadar', { alias: ['Zara'], capAlias: ['Zara'] }),
    c('HR-14', 'Osijek-Baranja', 'Osijek'),
    c('HR-15', 'Šibenik-Knin', 'Šibenik', { alias: ['Sibenik-Knin'], capAlias: ['Sibenik'] }),
    c('HR-16', 'Vukovar-Sirmia', 'Vukovar', { alias: ['Vukovar-Srijem'] }),
    c('HR-17', 'Split-Dalmacia', 'Split', { alias: ['Split-Dalmatia'], capAlias: ['Spalato'] }),
    c('HR-18', 'Istria', 'Pazin'),
    c('HR-19', 'Dubrovnik-Neretva', 'Dubrovnik', { capAlias: ['Ragusa'] }),
    c('HR-20', 'Međimurje', 'Čakovec', { alias: ['Medimurje'], capAlias: ['Cakovec'] }),
  ],

  // La ciudad de Zagreb y el condado de Zagreb se llamarían igual en todos los idiomas: se distinguen
  // como en español. En portugués, además, Wikidata da un condado traducido a medias («Litoral-Serrano»).
  correcciones: {
    en: { provincias: { 'HR-21': { nombre: 'City of Zagreb' }, 'HR-01': { nombre: 'Zagreb County' } } },
    fr: { provincias: { 'HR-21': { nombre: 'Ville de Zagreb' }, 'HR-01': { nombre: 'Comitat de Zagreb' } } },
    de: { provincias: { 'HR-21': { nombre: 'Stadt Zagreb' }, 'HR-01': { nombre: 'Gespanschaft Zagreb' } } },
    it: { provincias: { 'HR-21': { nombre: 'Città di Zagabria' }, 'HR-01': { nombre: 'Regione di Zagabria' } } },
    pt: { provincias: { 'HR-21': { nombre: 'Cidade de Zagreb' }, 'HR-01': { nombre: 'Condado de Zagreb' }, 'HR-08': { nombre: 'Primorje-Gorski Kotar' } } },
    ca: { provincias: { 'HR-21': { nombre: 'Ciutat de Zagreb' }, 'HR-01': { nombre: 'Comtat de Zagreb' } } },
    gl: { provincias: { 'HR-21': { nombre: 'Cidade de Zagreb' }, 'HR-01': { nombre: 'Condado de Zagreb' } } },
    eu: { provincias: { 'HR-21': { nombre: 'Zagreb hiria' }, 'HR-01': { nombre: 'Zagrebeko konderria' } } },
    zh: { provincias: { 'HR-21': { nombre: '萨格勒布市' }, 'HR-01': { nombre: '萨格勒布县' } } },
  },
};
