// España por provincias: datos en español, escritos a mano (como ../paises.mjs para el mundo).
//
// Un mapa de subdivisiones se compone de tres ficheros con el mismo nombre:
//   es.mjs            este: nombres, capitales y agrupaciones en español, correcciones y textos de las páginas
//   es.topo.json      fronteras reducidas de Natural Earth (scripts/build-subdivisions.mjs)
//   es.wikidata.json  nombres en los demás idiomas (scripts/fetch-subdivisions.mjs)
// scripts/build-maps.mjs los junta en public/data/es/. Para añadir otro país: sus tres ficheros,
// darlo de alta en ./index.mjs y en src/game/maps.ts (retos, filtros y textos de la interfaz).
//
// Las claves son códigos ISO 3166-2: los de las provincias identifican cada entidad (y su progreso
// guardado) y los de las comunidades hacen de «regiones» del atlas.

/**
 * @param {string} iso        ISO 3166-2 de la provincia
 * @param {string} nombre     Nombre en español (grafía recomendada por la RAE)
 * @param {string} capital
 * @param {string} comunidad  ISO 3166-2 de su comunidad autónoma
 * @param {{ alias?: string[], capAlias?: string[] }} [extra]  otros nombres aceptados al escribir
 */
const p = (iso, nombre, capital, comunidad, extra = {}) => ({ iso, nombre, capital, comunidad, ...extra });

export default {
  id: 'es',
  /** Código del país en Natural Earth (adm0_a3) y prefijo de sus códigos ISO 3166-2. */
  adm0: 'ESP',
  prefijo: 'ES-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  /** Para scripts/fetch-subdivisions.mjs: clase de Wikidata de las capitales (Q2074737, municipio de España). */
  wikidata: { capitalClase: 'Q2074737' },

  /**
   * Países vecinos que se dibujan apagados, como decorado (códigos adm0_a3 de Natural Earth; SAH es
   * el Sáhara Occidental). Solo entra lo que toca la ventana [oeste, sur, este, norte].
   */
  contexto: ['PRT', 'FRA', 'AND', 'MAR', 'DZA', 'SAH'],
  ventana: [-20, 20, 12, 52],

  // Las 17 comunidades autónomas y las dos ciudades autónomas.
  comunidades: {
    'ES-AN': 'Andalucía',
    'ES-AR': 'Aragón',
    'ES-AS': 'Principado de Asturias',
    'ES-IB': 'Islas Baleares',
    'ES-CN': 'Canarias',
    'ES-CB': 'Cantabria',
    'ES-CM': 'Castilla-La Mancha',
    'ES-CL': 'Castilla y León',
    'ES-CT': 'Cataluña',
    'ES-VC': 'Comunidad Valenciana',
    'ES-EX': 'Extremadura',
    'ES-GA': 'Galicia',
    'ES-RI': 'La Rioja',
    'ES-MD': 'Comunidad de Madrid',
    'ES-MC': 'Región de Murcia',
    'ES-NC': 'Navarra',
    'ES-PV': 'País Vasco',
    'ES-CE': 'Ceuta',
    'ES-ML': 'Melilla',
  },

  // Las 50 provincias y las dos ciudades autónomas (que no son provincias, pero se estudian con ellas).
  provincias: [
    // ── Andalucía ──
    p('ES-AL', 'Almería', 'Almería', 'ES-AN'),
    p('ES-CA', 'Cádiz', 'Cádiz', 'ES-AN'),
    p('ES-CO', 'Córdoba', 'Córdoba', 'ES-AN'),
    p('ES-GR', 'Granada', 'Granada', 'ES-AN'),
    p('ES-H', 'Huelva', 'Huelva', 'ES-AN'),
    p('ES-J', 'Jaén', 'Jaén', 'ES-AN'),
    p('ES-MA', 'Málaga', 'Málaga', 'ES-AN'),
    p('ES-SE', 'Sevilla', 'Sevilla', 'ES-AN'),
    // ── Aragón ──
    p('ES-HU', 'Huesca', 'Huesca', 'ES-AR'),
    p('ES-TE', 'Teruel', 'Teruel', 'ES-AR'),
    p('ES-Z', 'Zaragoza', 'Zaragoza', 'ES-AR'),
    // ── Comunidades de una sola provincia ──
    p('ES-O', 'Asturias', 'Oviedo', 'ES-AS', { capAlias: ['Uviéu'] }),
    p('ES-PM', 'Islas Baleares', 'Palma', 'ES-IB', { alias: ['Baleares', 'Illes Balears'], capAlias: ['Palma de Mallorca'] }),
    p('ES-S', 'Cantabria', 'Santander', 'ES-CB'),
    p('ES-LO', 'La Rioja', 'Logroño', 'ES-RI'),
    p('ES-M', 'Madrid', 'Madrid', 'ES-MD'),
    p('ES-MU', 'Murcia', 'Murcia', 'ES-MC'),
    p('ES-NA', 'Navarra', 'Pamplona', 'ES-NC', { alias: ['Nafarroa'], capAlias: ['Iruña', 'Pamplona/Iruña'] }),
    // ── Canarias ──
    p('ES-GC', 'Las Palmas', 'Las Palmas de Gran Canaria', 'ES-CN', { capAlias: ['Las Palmas'] }),
    p('ES-TF', 'Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 'ES-CN', { alias: ['Tenerife'], capAlias: ['Santa Cruz'] }),
    // ── Castilla-La Mancha ──
    p('ES-AB', 'Albacete', 'Albacete', 'ES-CM'),
    p('ES-CR', 'Ciudad Real', 'Ciudad Real', 'ES-CM'),
    p('ES-CU', 'Cuenca', 'Cuenca', 'ES-CM'),
    p('ES-GU', 'Guadalajara', 'Guadalajara', 'ES-CM'),
    p('ES-TO', 'Toledo', 'Toledo', 'ES-CM'),
    // ── Castilla y León ──
    p('ES-AV', 'Ávila', 'Ávila', 'ES-CL'),
    p('ES-BU', 'Burgos', 'Burgos', 'ES-CL'),
    p('ES-LE', 'León', 'León', 'ES-CL'),
    p('ES-P', 'Palencia', 'Palencia', 'ES-CL'),
    p('ES-SA', 'Salamanca', 'Salamanca', 'ES-CL'),
    p('ES-SG', 'Segovia', 'Segovia', 'ES-CL'),
    p('ES-SO', 'Soria', 'Soria', 'ES-CL'),
    p('ES-VA', 'Valladolid', 'Valladolid', 'ES-CL'),
    p('ES-ZA', 'Zamora', 'Zamora', 'ES-CL'),
    // ── Cataluña ──
    p('ES-B', 'Barcelona', 'Barcelona', 'ES-CT'),
    p('ES-GI', 'Gerona', 'Gerona', 'ES-CT', { alias: ['Girona'], capAlias: ['Girona'] }),
    p('ES-L', 'Lérida', 'Lérida', 'ES-CT', { alias: ['Lleida'], capAlias: ['Lleida'] }),
    p('ES-T', 'Tarragona', 'Tarragona', 'ES-CT'),
    // ── Comunidad Valenciana ──
    p('ES-A', 'Alicante', 'Alicante', 'ES-VC', { alias: ['Alacant'], capAlias: ['Alacant'] }),
    p('ES-CS', 'Castellón', 'Castellón de la Plana', 'ES-VC', { alias: ['Castelló'], capAlias: ['Castellón', 'Castelló de la Plana', 'Castelló'] }),
    p('ES-V', 'Valencia', 'Valencia', 'ES-VC', { alias: ['València'], capAlias: ['València'] }),
    // ── Extremadura ──
    p('ES-BA', 'Badajoz', 'Badajoz', 'ES-EX'),
    p('ES-CC', 'Cáceres', 'Cáceres', 'ES-EX'),
    // ── Galicia ──
    p('ES-C', 'La Coruña', 'La Coruña', 'ES-GA', { alias: ['A Coruña', 'Coruña'], capAlias: ['A Coruña', 'Coruña'] }),
    p('ES-LU', 'Lugo', 'Lugo', 'ES-GA'),
    p('ES-OR', 'Orense', 'Orense', 'ES-GA', { alias: ['Ourense'], capAlias: ['Ourense'] }),
    p('ES-PO', 'Pontevedra', 'Pontevedra', 'ES-GA'),
    // ── País Vasco ──
    p('ES-VI', 'Álava', 'Vitoria', 'ES-PV', { alias: ['Araba'], capAlias: ['Vitoria-Gasteiz', 'Gasteiz'] }),
    p('ES-SS', 'Guipúzcoa', 'San Sebastián', 'ES-PV', { alias: ['Gipuzkoa'], capAlias: ['Donostia', 'Donostia-San Sebastián'] }),
    p('ES-BI', 'Vizcaya', 'Bilbao', 'ES-PV', { alias: ['Bizkaia'], capAlias: ['Bilbo'] }),
    // ── Ciudades autónomas ──
    p('ES-CE', 'Ceuta', 'Ceuta', 'ES-CE'),
    p('ES-ML', 'Melilla', 'Melilla', 'ES-ML'),
  ],

  /**
   * Correcciones a los nombres de Wikidata (es.wikidata.json), por idioma:
   *   provincias   { 'ES-…': { nombre, capital, alias, capAlias } }
   *   comunidades  { 'ES-…': 'nombre' }
   * Donde Wikidata no tiene nombre y aquí tampoco, se usa el español.
   */
  correcciones: {
    en: { provincias: { 'ES-O': { capital: 'Oviedo' } } },
    pt: {
      provincias: { 'ES-PM': { nombre: 'Ilhas Baleares' } },
      comunidades: { 'ES-IB': 'Ilhas Baleares', 'ES-PV': 'País Basco' },
    },
    ca: { comunidades: { 'ES-VC': 'Comunitat Valenciana', 'ES-CM': 'Castella-la Manxa' } },
    eu: { provincias: { 'ES-O': { nombre: 'Asturias' }, 'ES-NA': { nombre: 'Nafarroa' } } },
    zh: {
      // Wikidata titula las comunidades «…自治区»; para la provincia basta el nombre.
      provincias: {
        'ES-O': { nombre: '阿斯图里亚斯', capital: '奥维耶多' },
        'ES-S': { nombre: '坎塔布里亚' },
        'ES-LO': { nombre: '拉里奥哈' },
        'ES-NA': { nombre: '纳瓦拉' },
        'ES-PM': { nombre: '巴利阿里群岛' },
        'ES-PO': { nombre: '蓬特韦德拉', capital: '蓬特韦德拉' },
      },
      comunidades: { 'ES-IB': '巴利阿里群岛' },
    },
  },

  /**
   * Páginas estáticas (scripts/build-pages.mjs), tres por idioma: provincias, capitales y comunidades.
   * `reto` es el valor de ?reto= con el que la página abre la aplicación.
   */
  paginas: [
    { id: 'provincias', reto: 'localizar' },
    { id: 'capitales', reto: 'capitales' },
    { id: 'comunidades', reto: 'comunidades' },
  ],
  textos: {
    es: {
      columnas: { provincia: 'Provincia', capital: 'Capital', comunidad: 'Comunidad autónoma', provincias: 'Provincias' },
      provincias: {
        slug: 'provincias-de-espana',
        h1: 'Provincias de España: juego en el mapa',
        description: 'Aprende las 50 provincias de España, con Ceuta y Melilla, jugando: búscalas en el mapa, con su comunidad autónoma. Gratis y sin registro.',
        cta: 'Jugar: provincias de España →',
        h2: 'Las 50 provincias de España y las dos ciudades autónomas',
      },
      capitales: {
        slug: 'capitales-de-provincia-de-espana',
        h1: 'Capitales de provincia de España: lista y juego',
        description: 'Las capitales de las 50 provincias de España, en una lista y en un juego sobre el mapa que repite las que fallas. Gratis y sin registro.',
        cta: 'Jugar: capitales de provincia →',
        h2: 'Capital de cada provincia',
      },
      comunidades: {
        slug: 'comunidades-autonomas-de-espana',
        h1: 'Comunidades autónomas de España y sus provincias',
        description: 'Las 17 comunidades autónomas de España y las dos ciudades autónomas, con las provincias de cada una, y un juego para aprender a qué comunidad pertenece cada provincia.',
        cta: 'Jugar: ¿a qué comunidad pertenece? →',
        h2: 'Las 17 comunidades autónomas y sus provincias',
      },
    },
    en: {
      columnas: { provincia: 'Province', capital: 'Capital', comunidad: 'Autonomous community', provincias: 'Provinces' },
      provincias: {
        slug: 'provinces-of-spain',
        h1: 'Provinces of Spain: map game',
        description: 'Learn the 50 provinces of Spain, plus Ceuta and Melilla, by playing: find them on the map, with their autonomous community. Free, no sign-up.',
        cta: 'Play: provinces of Spain →',
        h2: 'The 50 provinces of Spain and the two autonomous cities',
      },
      capitales: {
        slug: 'provincial-capitals-of-spain',
        h1: 'Provincial capitals of Spain: list and game',
        description: 'The capitals of the 50 provinces of Spain in a list and in a map game that repeats the ones you miss. Free, no sign-up.',
        cta: 'Play: provincial capitals →',
        h2: 'Capital of each province',
      },
      comunidades: {
        slug: 'autonomous-communities-of-spain',
        h1: 'Autonomous communities of Spain and their provinces',
        description: 'The 17 autonomous communities of Spain and the two autonomous cities, with the provinces of each, and a game to learn which community each province belongs to.',
        cta: 'Play: which community does it belong to? →',
        h2: 'The 17 autonomous communities and their provinces',
      },
    },
    fr: {
      columnas: { provincia: 'Province', capital: 'Capitale', comunidad: 'Communauté autonome', provincias: 'Provinces' },
      provincias: {
        slug: 'provinces-d-espagne',
        h1: 'Provinces d’Espagne : jeu sur la carte',
        description: 'Apprenez les 50 provinces d’Espagne, ainsi que Ceuta et Melilla, en jouant : trouvez-les sur la carte, avec leur communauté autonome. Gratuit, sans inscription.',
        cta: 'Jouer : provinces d’Espagne →',
        h2: 'Les 50 provinces d’Espagne et les deux villes autonomes',
      },
      capitales: {
        slug: 'capitales-des-provinces-d-espagne',
        h1: 'Capitales des provinces d’Espagne : liste et jeu',
        description: 'Les capitales des 50 provinces d’Espagne, en liste et dans un jeu sur la carte qui répète celles que vous ratez. Gratuit, sans inscription.',
        cta: 'Jouer : capitales des provinces →',
        h2: 'Capitale de chaque province',
      },
      comunidades: {
        slug: 'communautes-autonomes-d-espagne',
        h1: 'Communautés autonomes d’Espagne et leurs provinces',
        description: 'Les 17 communautés autonomes d’Espagne et les deux villes autonomes, avec les provinces de chacune, et un jeu pour apprendre à quelle communauté appartient chaque province.',
        cta: 'Jouer : à quelle communauté appartient-elle ? →',
        h2: 'Les 17 communautés autonomes et leurs provinces',
      },
    },
    de: {
      columnas: { provincia: 'Provinz', capital: 'Hauptstadt', comunidad: 'Autonome Gemeinschaft', provincias: 'Provinzen' },
      provincias: {
        slug: 'provinzen-spaniens',
        h1: 'Provinzen Spaniens: Spiel auf der Karte',
        description: 'Lerne spielend die 50 Provinzen Spaniens sowie Ceuta und Melilla: Finde sie auf der Karte, mit ihrer autonomen Gemeinschaft. Kostenlos und ohne Anmeldung.',
        cta: 'Spielen: Provinzen Spaniens →',
        h2: 'Die 50 Provinzen Spaniens und die zwei autonomen Städte',
      },
      capitales: {
        slug: 'provinzhauptstaedte-spaniens',
        h1: 'Provinzhauptstädte Spaniens: Liste und Spiel',
        description: 'Die Hauptstädte der 50 Provinzen Spaniens als Liste und in einem Kartenspiel, das wiederholt, was du nicht wusstest. Kostenlos und ohne Anmeldung.',
        cta: 'Spielen: Provinzhauptstädte →',
        h2: 'Hauptstadt jeder Provinz',
      },
      comunidades: {
        slug: 'autonome-gemeinschaften-spaniens',
        h1: 'Autonome Gemeinschaften Spaniens und ihre Provinzen',
        description: 'Die 17 autonomen Gemeinschaften Spaniens und die zwei autonomen Städte mit ihren Provinzen, dazu ein Spiel, um zu lernen, zu welcher Gemeinschaft jede Provinz gehört.',
        cta: 'Spielen: Zu welcher Gemeinschaft gehört sie? →',
        h2: 'Die 17 autonomen Gemeinschaften und ihre Provinzen',
      },
    },
    it: {
      columnas: { provincia: 'Provincia', capital: 'Capoluogo', comunidad: 'Comunità autonoma', provincias: 'Province' },
      provincias: {
        slug: 'province-della-spagna',
        h1: 'Province della Spagna: gioco sulla mappa',
        description: 'Impara giocando le 50 province della Spagna, più Ceuta e Melilla: trovale sulla mappa, con la loro comunità autonoma. Gratis e senza registrazione.',
        cta: 'Gioca: province della Spagna →',
        h2: 'Le 50 province della Spagna e le due città autonome',
      },
      capitales: {
        slug: 'capoluoghi-di-provincia-della-spagna',
        h1: 'Capoluoghi di provincia della Spagna: elenco e gioco',
        description: 'I capoluoghi delle 50 province della Spagna in un elenco e in un gioco sulla mappa che ripete quelli che sbagli. Gratis e senza registrazione.',
        cta: 'Gioca: capoluoghi di provincia →',
        h2: 'Capoluogo di ogni provincia',
      },
      comunidades: {
        slug: 'comunita-autonome-della-spagna',
        h1: 'Comunità autonome della Spagna e le loro province',
        description: 'Le 17 comunità autonome della Spagna e le due città autonome, con le province di ciascuna, e un gioco per imparare a quale comunità appartiene ogni provincia.',
        cta: 'Gioca: a quale comunità appartiene? →',
        h2: 'Le 17 comunità autonome e le loro province',
      },
    },
    pt: {
      columnas: { provincia: 'Província', capital: 'Capital', comunidad: 'Comunidade autônoma', provincias: 'Províncias' },
      provincias: {
        slug: 'provincias-da-espanha',
        h1: 'Províncias da Espanha: jogo no mapa',
        description: 'Aprenda as 50 províncias da Espanha, mais Ceuta e Melilla, jogando: encontre-as no mapa, com a sua comunidade autônoma. Grátis e sem cadastro.',
        cta: 'Jogar: províncias da Espanha →',
        h2: 'As 50 províncias da Espanha e as duas cidades autônomas',
      },
      capitales: {
        slug: 'capitais-de-provincia-da-espanha',
        h1: 'Capitais de província da Espanha: lista e jogo',
        description: 'As capitais das 50 províncias da Espanha em uma lista e em um jogo no mapa que repete as que você erra. Grátis e sem cadastro.',
        cta: 'Jogar: capitais de província →',
        h2: 'Capital de cada província',
      },
      comunidades: {
        slug: 'comunidades-autonomas-da-espanha',
        h1: 'Comunidades autônomas da Espanha e suas províncias',
        description: 'As 17 comunidades autônomas da Espanha e as duas cidades autônomas, com as províncias de cada uma, e um jogo para aprender a que comunidade pertence cada província.',
        cta: 'Jogar: a que comunidade pertence? →',
        h2: 'As 17 comunidades autônomas e suas províncias',
      },
    },
    ca: {
      columnas: { provincia: 'Província', capital: 'Capital', comunidad: 'Comunitat autònoma', provincias: 'Províncies' },
      provincias: {
        slug: 'provincies-d-espanya',
        h1: 'Províncies d’Espanya: joc al mapa',
        description: 'Aprén les 50 províncies d’Espanya, amb Ceuta i Melilla, jugant: busca-les al mapa, amb la seua comunitat autònoma. Gratis i sense registre.',
        cta: 'Jugar: províncies d’Espanya →',
        h2: 'Les 50 províncies d’Espanya i les dues ciutats autònomes',
      },
      capitales: {
        slug: 'capitals-de-provincia-d-espanya',
        h1: 'Capitals de província d’Espanya: llista i joc',
        description: 'Les capitals de les 50 províncies d’Espanya, en una llista i en un joc sobre el mapa que repeteix les que falles. Gratis i sense registre.',
        cta: 'Jugar: capitals de província →',
        h2: 'Capital de cada província',
      },
      comunidades: {
        slug: 'comunitats-autonomes-d-espanya',
        h1: 'Comunitats autònomes d’Espanya i les seues províncies',
        description: 'Les 17 comunitats autònomes d’Espanya i les dues ciutats autònomes, amb les províncies de cadascuna, i un joc per a aprendre a quina comunitat pertany cada província.',
        cta: 'Jugar: a quina comunitat pertany? →',
        h2: 'Les 17 comunitats autònomes i les seues províncies',
      },
    },
    gl: {
      columnas: { provincia: 'Provincia', capital: 'Capital', comunidad: 'Comunidade autónoma', provincias: 'Provincias' },
      provincias: {
        slug: 'provincias-de-espana',
        h1: 'Provincias de España: xogo no mapa',
        description: 'Aprende as 50 provincias de España, con Ceuta e Melilla, xogando: búscaas no mapa, coa súa comunidade autónoma. De balde e sen rexistro.',
        cta: 'Xogar: provincias de España →',
        h2: 'As 50 provincias de España e as dúas cidades autónomas',
      },
      capitales: {
        slug: 'capitais-de-provincia-de-espana',
        h1: 'Capitais de provincia de España: lista e xogo',
        description: 'As capitais das 50 provincias de España, nunha lista e nun xogo sobre o mapa que repite as que fallas. De balde e sen rexistro.',
        cta: 'Xogar: capitais de provincia →',
        h2: 'Capital de cada provincia',
      },
      comunidades: {
        slug: 'comunidades-autonomas-de-espana',
        h1: 'Comunidades autónomas de España e as súas provincias',
        description: 'As 17 comunidades autónomas de España e as dúas cidades autónomas, coas provincias de cada unha, e un xogo para aprender a que comunidade pertence cada provincia.',
        cta: 'Xogar: a que comunidade pertence? →',
        h2: 'As 17 comunidades autónomas e as súas provincias',
      },
    },
    eu: {
      columnas: { provincia: 'Probintzia', capital: 'Hiriburua', comunidad: 'Autonomia-erkidegoa', provincias: 'Probintziak' },
      provincias: {
        slug: 'espainiako-probintziak',
        h1: 'Espainiako probintziak: jokoa mapan',
        description: 'Ikasi jolasean Espainiako 50 probintziak, Ceuta eta Melillarekin batera: bilatu mapan, bakoitza bere autonomia-erkidegoarekin. Doan eta izena eman gabe.',
        cta: 'Jokatu: Espainiako probintziak →',
        h2: 'Espainiako 50 probintziak eta bi hiri autonomoak',
      },
      capitales: {
        slug: 'espainiako-probintzia-hiriburuak',
        h1: 'Espainiako probintzia-hiriburuak: zerrenda eta jokoa',
        description: 'Espainiako 50 probintzien hiriburuak, zerrenda batean eta huts egiten dituzunak errepikatzen dituen mapa-joko batean. Doan eta izena eman gabe.',
        cta: 'Jokatu: probintzia-hiriburuak →',
        h2: 'Probintzia bakoitzaren hiriburua',
      },
      comunidades: {
        slug: 'espainiako-autonomia-erkidegoak',
        h1: 'Espainiako autonomia-erkidegoak eta haien probintziak',
        description: 'Espainiako 17 autonomia-erkidegoak eta bi hiri autonomoak, bakoitzaren probintziekin, eta probintzia bakoitza zein erkidegotakoa den ikasteko jokoa.',
        cta: 'Jokatu: zein erkidegotakoa da? →',
        h2: '17 autonomia-erkidegoak eta haien probintziak',
      },
    },
    zh: {
      columnas: { provincia: '省', capital: '首府', comunidad: '自治区', provincias: '省份' },
      provincias: {
        slug: 'provinces-of-spain',
        h1: '西班牙各省：地图游戏',
        description: '边玩边学西班牙的50个省以及休达和梅利利亚：在地图上找到它们，并了解所属的自治区。免费，无需注册。',
        cta: '开始：西班牙各省 →',
        h2: '西班牙的50个省和两个自治市',
      },
      capitales: {
        slug: 'provincial-capitals-of-spain',
        h1: '西班牙各省首府：列表与游戏',
        description: '西班牙50个省的首府列表，以及一个会重复你答错内容的地图游戏。免费，无需注册。',
        cta: '开始：各省首府 →',
        h2: '各省的首府',
      },
      comunidades: {
        slug: 'autonomous-communities-of-spain',
        h1: '西班牙自治区及其省份',
        description: '西班牙的17个自治区和两个自治市及其下属省份，还有一个游戏，帮助你记住每个省属于哪个自治区。免费，无需注册。',
        cta: '开始：它属于哪个自治区？ →',
        h2: '17个自治区及其省份',
      },
    },
  },
};
