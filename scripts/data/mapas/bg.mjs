// Bulgaria por provincias (óblasti): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son veintiocho y cada una lleva el nombre de su capital; no se
// agrupan aquí en nada.
//
// La ciudad de Sofía es una provincia por sí sola (BG-22) y la que la rodea (BG-23) tiene también
// en ella su capital, aunque no le pertenece: la comparten. Como se llamarían igual, se distinguen
// en todos los idiomas. Los nombres siguen la transliteración oficial búlgara (la de Natural Earth
// y los rótulos de carretera), salvo Sofía, que tiene forma española.

const p = (n, nombre, extra = {}) => ({ iso: `BG-${n}`, nombre, capital: nombre, ...extra });

export default {
  id: 'bg',
  adm0: 'BGR',
  prefijo: 'BG-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {
    tipo: {
      fr: [/^oblast (de |d[’'])/i],
      de: [/^Oblast /i],
      it: [/^distretto di /i],
    },
  },
  /** Entre los vecinos van Grecia y Turquía enteras, con sus miles de islotes. */
  detalle: 4e-5,
  islote: 1.5e-3,

  contexto: ['ROU', 'SRB', 'MKD', 'GRC', 'TUR'],
  ventana: [18, 33.5, 45.5, 49],

  comunidades: {},

  provincias: [
    p('01', 'Blagoevgrad'),
    p('02', 'Burgas', { alias: ['Bourgas'], capAlias: ['Bourgas'] }),
    p('03', 'Varna'),
    p('04', 'Veliko Tarnovo', { alias: ['Veliko Tărnovo', 'Veliko Turnovo'], capAlias: ['Veliko Tărnovo', 'Veliko Turnovo'] }),
    p('05', 'Vidin'),
    p('06', 'Vratsa', { alias: ['Vratza'], capAlias: ['Vratza'] }),
    p('07', 'Gabrovo'),
    p('08', 'Dobrich', { alias: ['Dobrič'], capAlias: ['Dobrič'] }),
    p('09', 'Kardzhali', { alias: ['Kărdžali', 'Kardjali'], capAlias: ['Kărdžali', 'Kardjali'] }),
    p('10', 'Kyustendil', { alias: ['Kiustendil'], capAlias: ['Kiustendil'] }),
    p('11', 'Lovech', { alias: ['Loveč'], capAlias: ['Loveč'] }),
    p('12', 'Montana'),
    p('13', 'Pazardzhik', { alias: ['Pazardjik'], capAlias: ['Pazardjik'] }),
    p('14', 'Pernik'),
    p('15', 'Pleven'),
    p('16', 'Plovdiv'),
    p('17', 'Razgrad'),
    p('18', 'Ruse', { alias: ['Rousse', 'Russe'], capAlias: ['Rousse', 'Russe'] }),
    p('19', 'Silistra'),
    p('20', 'Sliven'),
    p('21', 'Smolyan', { alias: ['Smolian'], capAlias: ['Smolian'] }),
    { iso: 'BG-22', nombre: 'Ciudad de Sofía', capital: 'Sofía', alias: ['Sofía', 'Sofia', 'Sofía-Ciudad', 'Sofía ciudad'], capAlias: ['Sofia'] },
    { iso: 'BG-23', nombre: 'Provincia de Sofía', capital: 'Sofía', alias: ['Sofía', 'Sofia'], capAlias: ['Sofia'] },
    p('24', 'Stara Zagora'),
    p('25', 'Targovishte', { alias: ['Targóvishte', 'Tărgovište'], capAlias: ['Targóvishte', 'Tărgovište'] }),
    p('26', 'Haskovo'),
    p('27', 'Shumen', { alias: ['Šumen'], capAlias: ['Šumen'] }),
    p('28', 'Yambol', { alias: ['Jambol'], capAlias: ['Jambol'] }),
  ],

  // La ciudad y la provincia de Sofía se distinguen en cada idioma con el término que usa para las
  // provincias búlgaras. Y dos nombres que Wikidata da con otra transliteración que el resto.
  correcciones: {
    en: { provincias: { 'BG-22': { nombre: 'Sofia City' }, 'BG-23': { nombre: 'Sofia Province' } } },
    fr: { provincias: { 'BG-22': { nombre: 'Sofia-ville' }, 'BG-23': { nombre: 'Oblast de Sofia' } } },
    de: { provincias: { 'BG-22': { nombre: 'Sofia-Stadt' }, 'BG-23': { nombre: 'Oblast Sofia' } } },
    it: {
      provincias: {
        'BG-09': { nombre: 'Kărdžali', capital: 'Kărdžali' },
        'BG-22': { nombre: 'Sofia città' },
        'BG-23': { nombre: 'Distretto di Sofia' },
      },
    },
    pt: { provincias: { 'BG-22': { nombre: 'Cidade de Sófia' }, 'BG-23': { nombre: 'Província de Sófia' } } },
    ca: {
      provincias: {
        'BG-22': { nombre: 'Sofia-Ciutat' },
        'BG-23': { nombre: 'Província de Sofia' },
        'BG-25': { nombre: 'Tàrgovixte', capital: 'Tàrgovixte' },
      },
    },
    gl: { provincias: { 'BG-22': { nombre: 'Sofía-Cidade' }, 'BG-23': { nombre: 'Provincia de Sofía' } } },
    eu: { provincias: { 'BG-22': { nombre: 'Sofia-hiria' }, 'BG-23': { nombre: 'Sofiako probintzia' } } },
    zh: { provincias: { 'BG-22': { nombre: '索非亚市' }, 'BG-23': { nombre: '索非亚州' } } },
  },
};
