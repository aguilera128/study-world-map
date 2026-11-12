// Polonia por voivodatos: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Los dieciséis voivodatos no se agrupan en nada.
//
// Natural Earth trae los códigos ISO 3166-2 anteriores a 2018 (PL-DS…); `renombrar` los pasa a los
// vigentes (PL-02…). Rusia (Kaliningrado) no va entre los vecinos detallados: habría que traerla
// entera; la dibuja el fondo del mundo, con algo menos de detalle en esa frontera.
//
// Dos voivodatos reparten la capitalidad entre dos ciudades (el gobernador en una y la asamblea en
// otra): se da la del gobernador y se acepta la otra al escribir.

const v = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'pl',
  adm0: 'POL',
  prefijo: 'PL-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  renombrar: {
    'PL-DS': 'PL-02', 'PL-KP': 'PL-04', 'PL-LU': 'PL-06', 'PL-LB': 'PL-08', 'PL-LD': 'PL-10', 'PL-MA': 'PL-12', 'PL-MZ': 'PL-14', 'PL-OP': 'PL-16',
    'PL-PK': 'PL-18', 'PL-PD': 'PL-20', 'PL-PM': 'PL-22', 'PL-SL': 'PL-24', 'PL-SK': 'PL-26', 'PL-WN': 'PL-28', 'PL-WP': 'PL-30', 'PL-ZP': 'PL-32',
  },

  contexto: ['DEU', 'CZE', 'SVK', 'UKR', 'BLR', 'LTU'],
  ventana: [5, 43.5, 41, 57],

  comunidades: {},

  provincias: [
    v('PL-02', 'Baja Silesia', 'Breslavia', { alias: ['Dolnośląskie'], capAlias: ['Wrocław', 'Wroclaw'] }),
    v('PL-04', 'Cuyavia y Pomerania', 'Bydgoszcz', { alias: ['Kujawsko-Pomorskie', 'Cuyavia-Pomerania'], capAlias: ['Toruń', 'Torun'] }),
    v('PL-06', 'Lublin', 'Lublin', { alias: ['Lubelskie'] }),
    v('PL-08', 'Lubusz', 'Gorzów Wielkopolski', { alias: ['Lubuskie', 'Lubus'], capAlias: ['Gorzow Wielkopolski', 'Gorzów', 'Zielona Góra', 'Zielona Gora'] }),
    v('PL-10', 'Łódź', 'Łódź', { alias: ['Lodz', 'Łódzkie'], capAlias: ['Lodz'] }),
    v('PL-12', 'Pequeña Polonia', 'Cracovia', { alias: ['Małopolskie', 'Malopolska'], capAlias: ['Kraków', 'Krakow'] }),
    v('PL-14', 'Mazovia', 'Varsovia', { alias: ['Mazowieckie', 'Masovia'], capAlias: ['Warszawa'] }),
    v('PL-16', 'Opole', 'Opole', { alias: ['Opolskie'] }),
    v('PL-18', 'Subcarpacia', 'Rzeszów', { alias: ['Podkarpackie', 'Subcarpatia'], capAlias: ['Resovia', 'Rzeszow'] }),
    v('PL-20', 'Podlaquia', 'Białystok', { alias: ['Podlaskie'], capAlias: ['Bialystok'] }),
    v('PL-22', 'Pomerania', 'Gdansk', { alias: ['Pomorskie'], capAlias: ['Gdańsk', 'Dánzig', 'Danzig'] }),
    v('PL-24', 'Silesia', 'Katowice', { alias: ['Śląskie'] }),
    v('PL-26', 'Santa Cruz', 'Kielce', { alias: ['Świętokrzyskie', 'Swietokrzyskie'] }),
    v('PL-28', 'Varmia y Masuria', 'Olsztyn', { alias: ['Warmińsko-Mazurskie', 'Varmia-Masuria'] }),
    v('PL-30', 'Gran Polonia', 'Poznan', { alias: ['Wielkopolskie', 'Wielkopolska'], capAlias: ['Poznań', 'Posnania'] }),
    v('PL-32', 'Pomerania Occidental', 'Szczecin', { alias: ['Zachodniopomorskie'], capAlias: ['Estetino', 'Stettin'] }),
  ],

  // Wikidata no da nombre en español a Poznan, así que su nombre en cada idioma va a mano.
  correcciones: {
    // En inglés Wikidata titula con el adjetivo («Lower Silesian Voivodeship») o con el nombre polaco.
    en: {
      provincias: {
        'PL-02': { nombre: 'Lower Silesia' },
        'PL-04': { nombre: 'Kuyavia-Pomerania' },
        'PL-14': { nombre: 'Masovia' },
        'PL-18': { nombre: 'Subcarpathia' },
        'PL-20': { nombre: 'Podlachia' },
        'PL-22': { nombre: 'Pomerania' },
        'PL-24': { nombre: 'Silesia' },
        'PL-26': { nombre: 'Holy Cross', alias: ['Świętokrzyskie'] },
        'PL-28': { nombre: 'Warmia-Masuria' },
        'PL-30': { capital: 'Poznań' },
        'PL-32': { nombre: 'West Pomerania' },
      },
    },
    fr: { provincias: { 'PL-30': { capital: 'Poznań' } } },
    de: { provincias: { 'PL-30': { capital: 'Posen', capAlias: ['Poznań'] } } },
    it: { provincias: { 'PL-30': { capital: 'Poznań' } } },
    // Wikidata da las formas de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'PL-12': { nombre: 'Pequena Polônia' }, 'PL-30': { nombre: 'Grande Polônia', capital: 'Poznań' } } },
    ca: { provincias: { 'PL-30': { capital: 'Poznań' } } },
    gl: { provincias: { 'PL-30': { capital: 'Poznań' } } },
    // En euskera Wikidata titula «…ko voivoderria», con un genitivo que no se puede quitar con una regla.
    eu: {
      provincias: {
        'PL-02': { nombre: 'Silesia Beherea' },
        'PL-04': { nombre: 'Kujavia-Pomerania' },
        'PL-08': { nombre: 'Lubusz' },
        'PL-12': { nombre: 'Polonia Txikia' },
        'PL-14': { nombre: 'Mazovia' },
        'PL-18': { nombre: 'Karpatoazpia' },
        'PL-20': { nombre: 'Podlasia' },
        'PL-22': { nombre: 'Pomerania' },
        'PL-24': { nombre: 'Silesia' },
        'PL-26': { nombre: 'Gurutze Santua' },
        'PL-28': { nombre: 'Varmia-Mazuria' },
        'PL-30': { nombre: 'Polonia Handia', capital: 'Poznań' },
        'PL-32': { nombre: 'Mendebaldeko Pomerania' },
      },
    },
    zh: { provincias: { 'PL-30': { capital: '波兹南' } } },
  },

  // Sin páginas estáticas de momento: sus textos (tres páginas en diez idiomas) están por escribir.
  paginas: [],
};
