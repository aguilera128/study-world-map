// Ucrania por regiones (óblasts): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son las veinticuatro regiones, la República Autónoma de Crimea y
// las ciudades de Kiev y Sebastopol, que tienen rango propio; no se agrupan aquí en nada.
//
// Las fronteras son las reconocidas internacionalmente (resolución 68/262 de la Asamblea General de
// la ONU), como en el mapa del mundo: Crimea y Sebastopol son de Ucrania, y las capitales de Donetsk
// y Lugansk son las de derecho. Natural Earth asigna Crimea a Rusia; lo corrige el generador de
// fronteras (scripts/build-subdivisions.mjs).
//
// La capital de la región de Kiev es la ciudad de Kiev, que no pertenece a ella: la comparten. Los
// nombres llevan la forma española asentada (Kiev, Járkov, Leópolis); al escribir vale también la
// transliteración del ucraniano. Rusia no va entre los vecinos (no cabe entera en la ventana): la
// pone de fondo la aplicación, del atlas del mundo.

const r = (n, nombre, capital = nombre, extra = {}) => ({ iso: `UA-${n}`, nombre, capital, ...extra });

export default {
  id: 'ua',
  adm0: 'UKR',
  prefijo: 'UA-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {
    tipo: {
      en: [/ Oblast$/i],
      fr: [/^Oblast (de la |de |du |d[’'])/i],
      de: [/^Oblast /i],
      it: [/^Oblast['’] (di |della |del )/i],
      pt: [/^Oblast (de |da |do )/i],
      ca: [/^Óblast (de |d[’'])/i],
      gl: [/^Óblast (de |da |do )/i],
    },
  },
  /** Un país mayor que España: pide menos detalle. */
  detalle: 4e-5,
  islote: 1.5e-3,

  contexto: ['POL', 'SVK', 'HUN', 'ROU', 'MDA', 'BLR'],
  ventana: [13.5, 43, 41, 57],

  comunidades: {},

  provincias: [
    r('05', 'Vínnitsa', 'Vínnitsa', { alias: ['Vinnytsia', 'Vinnitsa'], capAlias: ['Vinnytsia', 'Vinnitsa'] }),
    r('07', 'Volinia', 'Lutsk', { alias: ['Volyn', 'Volin'] }),
    r('09', 'Lugansk', 'Lugansk', { alias: ['Luhansk'], capAlias: ['Luhansk'] }),
    r('12', 'Dnipropetrovsk', 'Dnipró', { capAlias: ['Dnipro', 'Dniepropetrovsk'] }),
    r('14', 'Donetsk'),
    r('18', 'Zhitómir', 'Zhitómir', { alias: ['Zhytomyr', 'Yitómir'], capAlias: ['Zhytomyr', 'Yitómir'] }),
    r('21', 'Transcarpatia', 'Úzhgorod', { alias: ['Zakarpatia', 'Zakarpattia'], capAlias: ['Uzhhorod', 'Uzhgorod'] }),
    r('23', 'Zaporiyia', 'Zaporiyia', { alias: ['Zaporizhzhia', 'Zaporozhie'], capAlias: ['Zaporizhzhia', 'Zaporozhie'] }),
    r('26', 'Ivano-Frankivsk'),
    r('30', 'Ciudad de Kiev', 'Kiev', { alias: ['Kiev', 'Kyiv'], capAlias: ['Kyiv'] }),
    r('32', 'Región de Kiev', 'Kiev', { alias: ['Kiev', 'Kyiv'], capAlias: ['Kyiv'] }),
    r('35', 'Kirovogrado', 'Kropivnitski', { alias: ['Kirovohrad', 'Kirovograd'], capAlias: ['Kropyvnytsky', 'Kropyvnytskyi', 'Kropivnitsky'] }),
    r('40', 'Sebastopol', 'Sebastopol', { alias: ['Sevastopol'], capAlias: ['Sevastopol'] }),
    r('43', 'Crimea', 'Simferópol', { capAlias: ['Simferopol'] }),
    r('46', 'Leópolis', 'Leópolis', { alias: ['Lviv', 'Lvov'], capAlias: ['Lviv', 'Lvov'] }),
    r('48', 'Mikoláiv', 'Mikoláiv', { alias: ['Mykolaiv', 'Nikoláiev'], capAlias: ['Nicolaiev', 'Mykolaiv', 'Nikoláiev'] }),
    r('51', 'Odesa', 'Odesa', { alias: ['Odessa'], capAlias: ['Odessa'] }),
    r('53', 'Poltava'),
    r('56', 'Rivne', 'Rivne', { alias: ['Rovno'], capAlias: ['Rovno'] }),
    r('59', 'Sumy', 'Sumy', { alias: ['Sumi'], capAlias: ['Sumi'] }),
    r('61', 'Ternópil', 'Ternópil', { alias: ['Ternopil'], capAlias: ['Ternopil'] }),
    r('63', 'Járkov', 'Járkov', { alias: ['Kharkiv', 'Járkiv'], capAlias: ['Kharkiv', 'Járkiv'] }),
    r('65', 'Jersón', 'Jersón', { alias: ['Kherson'], capAlias: ['Kherson'] }),
    r('68', 'Jmelnitski', 'Jmelnitski', { alias: ['Khmelnytskyi'], capAlias: ['Khmelnytskyi'] }),
    r('71', 'Cherkasy', 'Cherkasy', { alias: ['Cherkasi'], capAlias: ['Cherkasi'] }),
    r('74', 'Chernígov', 'Chernígov', { alias: ['Chernihiv', 'Cherníhiv'], capAlias: ['Chernihiv', 'Cherníhiv'] }),
    r('77', 'Chernivtsí', 'Chernivtsí', { alias: ['Chernivtsi'], capAlias: ['Chernivetsi', 'Chernivtsi'] }),
  ],

  // La ciudad y la región de Kiev se distinguen en cada idioma, con el nombre que ese idioma da a la
  // ciudad; Crimea va sin «República Autónoma de», como en español. En euskera, el genitivo de
  // Wikidata («Voliniako oblasta») se cambia por el nombre.
  correcciones: {
    en: { provincias: { 'UA-30': { nombre: 'Kyiv City', capital: 'Kyiv' }, 'UA-32': { nombre: 'Kyiv Region' }, 'UA-43': { nombre: 'Crimea' } } },
    fr: { provincias: { 'UA-30': { nombre: 'Ville de Kiev', capital: 'Kiev' }, 'UA-32': { nombre: 'Région de Kiev' }, 'UA-43': { nombre: 'Crimée' } } },
    de: { provincias: { 'UA-30': { nombre: 'Stadt Kiew', capital: 'Kiew' }, 'UA-32': { nombre: 'Region Kiew' }, 'UA-43': { nombre: 'Krim' } } },
    it: { provincias: { 'UA-30': { nombre: 'Città di Kiev', capital: 'Kiev' }, 'UA-32': { nombre: 'Regione di Kiev' }, 'UA-43': { nombre: 'Crimea' } } },
    pt: { provincias: { 'UA-30': { nombre: 'Cidade de Kiev', capital: 'Kiev' }, 'UA-32': { nombre: 'Região de Kiev' }, 'UA-43': { nombre: 'Crimeia' } } },
    ca: { provincias: { 'UA-30': { nombre: 'Ciutat de Kíiv', capital: 'Kíiv' }, 'UA-32': { nombre: 'Regió de Kíiv' }, 'UA-43': { nombre: 'Crimea' } } },
    gl: { provincias: { 'UA-35': { capital: 'Kropyvnytskyi' }, 'UA-30': { nombre: 'Cidade de Kíiv', capital: 'Kíiv' }, 'UA-32': { nombre: 'Rexión de Kíiv' }, 'UA-43': { nombre: 'Crimea' } } },
    eu: {
      provincias: {
        'UA-07': { nombre: 'Volinia' },
        'UA-12': { nombre: 'Dnipropetrovsk' },
        'UA-21': { nombre: 'Transkarpatia' },
        'UA-30': { nombre: 'Kiev hiria', capital: 'Kiev' },
        'UA-32': { nombre: 'Kieveko oblasta' },
        'UA-35': { nombre: 'Kirovohrad' },
        'UA-43': { nombre: 'Krimea' },
      },
    },
    zh: { provincias: { 'UA-30': { nombre: '基辅市', capital: '基辅' }, 'UA-32': { nombre: '基辅州' }, 'UA-43': { nombre: '克里米亚' } } },
  },
};
