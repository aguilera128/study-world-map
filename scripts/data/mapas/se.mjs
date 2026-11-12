// Suecia por condados (län): datos en español, escritos a mano. Qué lleva cada fichero de un mapa
// está explicado en ./es.mjs. Los veintiún condados no se agrupan en nada que se estudie.

const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'se',
  adm0: 'SWE',
  prefijo: 'SE-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  /** Un país largo y con miles de islas: pide menos detalle que una provincia española. */
  detalle: 8e-5,
  islote: 2e-3,

  contexto: ['NOR', 'FIN', 'DNK'],
  ventana: [3, 54, 33, 72],

  comunidades: {},

  provincias: [
    c('SE-AB', 'Estocolmo', 'Estocolmo', { alias: ['Stockholm'], capAlias: ['Stockholm'] }),
    c('SE-C', 'Upsala', 'Upsala', { alias: ['Uppsala'], capAlias: ['Uppsala'] }),
    c('SE-D', 'Södermanland', 'Nyköping', { alias: ['Sodermanland', 'Sudermania'], capAlias: ['Nykoping'] }),
    c('SE-E', 'Östergötland', 'Linköping', { alias: ['Ostergotland'], capAlias: ['Linkoping'] }),
    c('SE-F', 'Jönköping', 'Jönköping', { alias: ['Jonkoping'], capAlias: ['Jonkoping'] }),
    c('SE-G', 'Kronoberg', 'Växjö', { capAlias: ['Vaxjo'] }),
    c('SE-H', 'Kalmar', 'Kalmar'),
    c('SE-I', 'Gotland', 'Visby'),
    c('SE-K', 'Blekinge', 'Karlskrona'),
    c('SE-M', 'Escania', 'Malmö', { alias: ['Skåne', 'Skane'], capAlias: ['Malmo'] }),
    c('SE-N', 'Halland', 'Halmstad'),
    c('SE-O', 'Västra Götaland', 'Gotemburgo', { alias: ['Vastra Gotaland', 'Götaland Occidental'], capAlias: ['Göteborg'] }),
    c('SE-S', 'Värmland', 'Karlstad', { alias: ['Varmland'] }),
    c('SE-T', 'Örebro', 'Örebro', { alias: ['Orebro'], capAlias: ['Orebro'] }),
    c('SE-U', 'Västmanland', 'Västerås', { alias: ['Vastmanland'], capAlias: ['Vasteras'] }),
    c('SE-W', 'Dalarna', 'Falun', { alias: ['Dalecarlia'] }),
    c('SE-X', 'Gävleborg', 'Gävle', { alias: ['Gavleborg'], capAlias: ['Gavle'] }),
    c('SE-Y', 'Västernorrland', 'Härnösand', { alias: ['Vasternorrland'], capAlias: ['Harnosand'] }),
    c('SE-Z', 'Jämtland', 'Östersund', { alias: ['Jamtland'], capAlias: ['Ostersund'] }),
    c('SE-AC', 'Västerbotten', 'Umeå', { alias: ['Vasterbotten'], capAlias: ['Umea'] }),
    c('SE-BD', 'Norrbotten', 'Luleå', { capAlias: ['Lulea'] }),
  ],

  correcciones: {
    // En euskera Wikidata titula «…ko konderria», con un genitivo que no se puede quitar con una regla.
    eu: {
      provincias: {
        'SE-D': { nombre: 'Södermanland' },
        'SE-E': { nombre: 'Östergötland' },
        'SE-G': { nombre: 'Kronoberg' },
        'SE-I': { nombre: 'Gotland' },
        'SE-K': { nombre: 'Blekinge' },
        'SE-M': { nombre: 'Eskania' },
        'SE-N': { nombre: 'Halland' },
        'SE-O': { nombre: 'Västra Götaland' },
        'SE-S': { nombre: 'Värmland' },
        'SE-U': { nombre: 'Västmanland' },
        'SE-X': { nombre: 'Gävleborg' },
        'SE-Y': { nombre: 'Västernorrland' },
        'SE-Z': { nombre: 'Jämtland' },
        'SE-AC': { nombre: 'Västerbotten' },
        'SE-BD': { nombre: 'Norrbotten' },
      },
    },
    // Caracteres simplificados.
    zh: { provincias: { 'SE-I': { capital: '维斯比' } } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
