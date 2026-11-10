// Textos de las páginas estáticas (scripts/build-pages.mjs) en cada idioma, y las traducciones de
// index.html. El español es la referencia: al añadir un idioma se copia el bloque `es` y se traduce.
//
// `ruta` son los tramos de dirección propios del idioma; `zonas` es el nombre de cada continente
// tal como va dentro de una frase («de Europa», «of the Americas»).

const es = {
  locale: 'es_ES',
  intl: 'es-ES',
  nombre: 'Español',
  ruta: {
    paises: 'paises-y-capitales',
    juego: 'juego',
    retos: { paises: 'paises', capitales: 'capitales', banderas: 'banderas' },
    de: 'de',
    zonas: { europa: 'europa', asia: 'asia', africa: 'africa', america: 'america', oceania: 'oceania' },
  },
  zonas: { europa: 'Europa', asia: 'Asia', africa: 'África', america: 'América', oceania: 'Oceanía' },
  retos: { paises: 'Países', capitales: 'Capitales', banderas: 'Banderas' },
  pie: {
    creditos: 'Cartografía: Natural Earth · Banderas: flag-icons (MIT) · Datos de países: mledoze/countries (ODbL).',
    info: 'Información',
    mapa: 'Mapa interactivo',
    paises: 'Países y capitales',
    donar: 'Donar',
    avisoLegal: 'Aviso legal',
    privacidad: 'Privacidad',
    cookies: 'Cookies',
    configurar: 'Configurar cookies',
    idiomas: 'Idiomas',
  },
  paises: {
    title: (n) => `Países del mundo y sus capitales: lista de los ${n} países · Study World Map`,
    ogTitle: 'Países del mundo y sus capitales',
    description: (n) =>
      `Lista completa de los ${n} países del mundo y sus capitales, ordenados por continente, con bandera y superficie. Practícalos gratis en un mapa interactivo.`,
    h1: 'Países del mundo y sus capitales',
    lead: (n) =>
      `Los ${n} países del mundo ordenados por continente, con su capital, su bandera y su superficie. Cuando quieras aprendértelos, practica con el mapa interactivo: te pregunta más lo que fallas hasta que te lo sabes.`,
    cta: 'Practicar en el mapa interactivo →',
    juegos: 'Juegos por continente:',
    juegosAria: 'Juegos por continente',
    lista: 'Lista por continente:',
    listaAria: 'Continentes',
    cuenta: (n) => `${n} países`,
    pais: 'País',
    capital: 'Capital',
    superficie: 'Superficie',
    faqTitulo: 'Preguntas frecuentes',
    faq: [
      [
        '¿Cuántos países hay en el mundo?',
        'Study World Map incluye 197 países: los 193 miembros de la ONU, sus dos Estados observadores (Ciudad del Vaticano y Palestina), Taiwán y Kosovo. Otros territorios, como Groenlandia o Puerto Rico, aparecen en el mapa pero no se preguntan.',
      ],
      [
        '¿Qué países tienen más de una capital?',
        'Algunos reparten funciones entre ciudades: Bolivia (Sucre es la capital constitucional y La Paz la sede del Gobierno), Sudáfrica, Países Bajos o Sri Lanka. En el juego se acepta cualquiera de ellas al escribir la respuesta.',
      ],
      [
        '¿Cómo aprender los países y capitales del mundo?',
        'Practicando con repaso espaciado: Study World Map pregunta más a menudo los países que fallas, repite los fallos tres preguntas después y, entre partidas, sigue cada país con un sistema de cajas de Leitner hasta que lo dominas.',
      ],
      [
        '¿Study World Map es gratis? ¿Necesita registro?',
        'Es gratis, sin anuncios y sin cuentas. El progreso se guarda en tu propio dispositivo y la aplicación funciona sin conexión después de la primera visita.',
      ],
      [
        '¿Qué juegos de geografía tiene?',
        'Cinco retos: localizar países en el mapa, decir en qué continente están, nombrar el país señalado, capitales y banderas. Se puede jugar con todo el mundo, por continentes o con una lista de países propia que se comparte con un enlace.',
      ],
    ],
  },
  juego: {
    enlace: (reto, zona) => `${reto} de ${zona}`,
    h1: (reto, zona) => `${reto} de ${zona}: juego en el mapa`,
    jugar: (reto, zona) => `Jugar: ${reto.toLowerCase()} de ${zona} →`,
    gratis: 'Gratis, sin registro y sin anuncios. Tu progreso se guarda en tu dispositivo.',
    intro: {
      paises: (n, zona) =>
        `Te damos el nombre de un país de ${zona} y tienes que encontrarlo en el mapa. Si fallas, te dice qué país has pulsado y te lo vuelve a preguntar más tarde, hasta que te sepas los ${n}.`,
      capitales: (n, zona) =>
        `Une cada uno de los ${n} países de ${zona} con su capital: con opciones, buscando el país en el mapa o escribiendo la respuesta. Las capitales que fallas vuelven a salir hasta que te las sabes.`,
      banderas: (n, zona) =>
        `Reconoce las ${n} banderas de ${zona}: te enseñamos una bandera y pulsas su país en el mapa o eliges entre opciones. Las que fallas se repiten más a menudo.`,
    },
    h2: {
      paises: (n, zona) => `Los ${n} países de ${zona}`,
      capitales: (n, zona) => `Capitales de los ${n} países de ${zona}`,
      banderas: (n, zona) => `Las ${n} banderas de ${zona}`,
    },
    limita: 'Limita con',
    sinFronteras: 'Sin fronteras terrestres',
    masGrande: (zona, pais, area) => `El país más grande de ${zona} es <strong>${pais}</strong> (${area})`,
    masPequeno: (pais, area) => ` y el más pequeño, <strong>${pais}</strong> (${area})`,
    islas: (k, n) => `${k} de los ${n} países no tienen fronteras terrestres con ningún otro.`,
    banderaDe: (pais) => `Bandera de ${pais}`,
    sigue: 'Sigue practicando',
    otrosRetos: (zona) => `Otros retos de ${zona}`,
    otrasZonas: (reto) => `${reto} de otros continentes`,
    todos: 'Todos los países del mundo y sus capitales',
    titulos: {
      paises: (n, zona) => [
        `Países de ${zona}: juego para aprenderlos en el mapa`,
        `Aprende los ${n} países de ${zona} jugando: encuéntralos en el mapa, con sus fronteras y su superficie. Gratis y sin registro.`,
      ],
      capitales: (n, zona) => [
        `Capitales de ${zona}: lista y juego para aprenderlas`,
        `Las capitales de los ${n} países de ${zona} en una lista y en un juego con mapa que repite las que fallas. Gratis y sin registro.`,
      ],
      banderas: (n, zona) => [
        `Banderas de ${zona}: las ${n} banderas y juego`,
        `Las ${n} banderas de ${zona} con el nombre de su país, y un juego para reconocerlas en el mapa. Gratis y sin registro.`,
      ],
    },
  },
};

const en = {
  locale: 'en_GB',
  intl: 'en-GB',
  nombre: 'English',
  ruta: {
    paises: 'countries-and-capitals',
    juego: 'game',
    retos: { paises: 'countries', capitales: 'capitals', banderas: 'flags' },
    de: 'of',
    zonas: { europa: 'europe', asia: 'asia', africa: 'africa', america: 'the-americas', oceania: 'oceania' },
  },
  zonas: { europa: 'Europe', asia: 'Asia', africa: 'Africa', america: 'the Americas', oceania: 'Oceania' },
  retos: { paises: 'Countries', capitales: 'Capitals', banderas: 'Flags' },
  pie: {
    creditos: 'Cartography: Natural Earth · Flags: flag-icons (MIT) · Country data: mledoze/countries (ODbL).',
    info: 'Information',
    mapa: 'Interactive map',
    paises: 'Countries and capitals',
    donar: 'Donate (in Spanish)',
    avisoLegal: 'Legal notice (in Spanish)',
    privacidad: 'Privacy (in Spanish)',
    cookies: 'Cookies (in Spanish)',
    configurar: 'Cookie settings',
    idiomas: 'Languages',
  },
  paises: {
    title: (n) => `Countries of the world and their capitals: list of all ${n} countries · Study World Map`,
    ogTitle: 'Countries of the world and their capitals',
    description: (n) =>
      `Full list of the ${n} countries of the world and their capitals, by continent, with flag and area. Practise them for free on an interactive map.`,
    h1: 'Countries of the world and their capitals',
    lead: (n) =>
      `The ${n} countries of the world by continent, with their capital, flag and area. When you want to learn them, practise on the interactive map: it asks you more often about the ones you miss, until you know them.`,
    cta: 'Practise on the interactive map →',
    juegos: 'Games by continent:',
    juegosAria: 'Games by continent',
    lista: 'List by continent:',
    listaAria: 'Continents',
    cuenta: (n) => `${n} countries`,
    pais: 'Country',
    capital: 'Capital',
    superficie: 'Area',
    faqTitulo: 'Frequently asked questions',
    faq: [
      [
        'How many countries are there in the world?',
        'Study World Map includes 197 countries: the 193 UN member states, its two observer states (Vatican City and Palestine), Taiwan and Kosovo. Other territories, such as Greenland or Puerto Rico, appear on the map but are not part of the quizzes.',
      ],
      [
        'Which countries have more than one capital?',
        'Some split their functions between cities: Bolivia (Sucre is the constitutional capital and La Paz the seat of government), South Africa, the Netherlands or Sri Lanka. In the game any of them is accepted when you type the answer.',
      ],
      [
        'How can I learn the countries and capitals of the world?',
        'By practising with spaced repetition: Study World Map asks more often about the countries you miss, repeats a miss three questions later and, between games, tracks each country with a Leitner box system until you have mastered it.',
      ],
      [
        'Is Study World Map free? Do I need to sign up?',
        'It is free, with no ads and no accounts. Your progress is stored on your own device and the app works offline after the first visit.',
      ],
      [
        'Which geography games does it have?',
        'Five challenges: locating countries on the map, saying which continent they are in, naming the highlighted country, capitals and flags. You can play with the whole world, by continent or with your own list of countries, which you can share with a link.',
      ],
    ],
  },
  juego: {
    enlace: (reto, zona) => `${reto} of ${zona}`,
    h1: (reto, zona) => `${reto} of ${zona}: map game`,
    jugar: (reto, zona) => `Play: ${reto.toLowerCase()} of ${zona} →`,
    gratis: 'Free, no sign-up and no ads. Your progress is stored on your device.',
    intro: {
      paises: (n, zona) =>
        `We give you the name of a country in ${zona} and you have to find it on the map. If you miss, it tells you which country you tapped and asks you again later, until you know all ${n}.`,
      capitales: (n, zona) =>
        `Match each of the ${n} countries of ${zona} with its capital: multiple choice, finding the country on the map or typing the answer. The capitals you miss come back until you know them.`,
      banderas: (n, zona) =>
        `Recognise the ${n} flags of ${zona}: we show you a flag and you tap its country on the map or pick from the options. The ones you miss come up more often.`,
    },
    h2: {
      paises: (n, zona) => `The ${n} countries of ${zona}`,
      capitales: (n, zona) => `Capitals of the ${n} countries of ${zona}`,
      banderas: (n, zona) => `The ${n} flags of ${zona}`,
    },
    limita: 'Borders',
    sinFronteras: 'No land borders',
    masGrande: (zona, pais, area) => `The largest country in ${zona} is <strong>${pais}</strong> (${area})`,
    masPequeno: (pais, area) => ` and the smallest is <strong>${pais}</strong> (${area})`,
    islas: (k, n) => `${k} of the ${n} countries have no land border with any other.`,
    banderaDe: (pais) => `Flag of ${pais}`,
    sigue: 'Keep practising',
    otrosRetos: (zona) => `Other challenges for ${zona}`,
    otrasZonas: (reto) => `${reto} of other continents`,
    todos: 'All the countries of the world and their capitals',
    titulos: {
      paises: (n, zona) => [
        `Countries of ${zona}: a game to learn them on the map`,
        `Learn the ${n} countries of ${zona} by playing: find them on the map, with their borders and area. Free, no sign-up.`,
      ],
      capitales: (n, zona) => [
        `Capitals of ${zona}: list and game to learn them`,
        `The capitals of the ${n} countries of ${zona} in a list and in a map game that repeats the ones you miss. Free, no sign-up.`,
      ],
      banderas: (n, zona) => [
        `Flags of ${zona}: all ${n} flags and a game`,
        `The ${n} flags of ${zona} with the name of each country, and a game to recognise them on the map. Free, no sign-up.`,
      ],
    },
  },
};

export const PAGINAS = { es, en };

/**
 * Traducciones de index.html: cada texto en español del fichero y lo que va en su lugar. Si
 * index.html cambia y un texto de aquí deja de aparecer, build-pages.mjs falla para avisar.
 */
export const INDEX = {
  en: [
    ['<html lang="es">', '<html lang="en">'],
    ['Juego de países, capitales y banderas del mundo · Study World Map', 'Countries, capitals and flags of the world game · Study World Map'],
    [
      'Mapamundi interactivo en 3D y 2D para aprender los 197 países del mundo, sus capitales y sus banderas. Gratis, sin registro y en español: juega, falla, repasa y aprende geografía a tu ritmo.',
      'Interactive 3D and 2D world map to learn the 197 countries of the world, their capitals and their flags. Free and with no sign-up: play, miss, review and learn geography at your own pace.',
    ],
    ['Study World Map · Aprende los países del mundo jugando', 'Study World Map · Learn the countries of the world by playing'],
    ['Globo 3D y mapa plano interactivos para estudiar países, capitales y banderas.', 'Interactive 3D globe and flat map to study countries, capitals and flags.'],
    ['content="es_ES"', 'content="en_GB"'],
    ['<meta property="og:url" content="https://www.studyworldmap.com/" />', '<meta property="og:url" content="https://www.studyworldmap.com/en/" />'],
    ['<link rel="canonical" href="https://www.studyworldmap.com/" />', '<link rel="canonical" href="https://www.studyworldmap.com/en/" />'],
    [
      'Globo terráqueo con los países coloreados junto al panel de retos de Study World Map',
      'A globe with the countries in colour next to the Study World Map challenge panel',
    ],
    ['"@id": "https://www.studyworldmap.com/#website",\n            "name": "Study World Map",\n            "url": "https://www.studyworldmap.com/",\n            "inLanguage": "es"', '"@id": "https://www.studyworldmap.com/#website",\n            "name": "Study World Map",\n            "url": "https://www.studyworldmap.com/",\n            "inLanguage": ["es", "en"]'],
    ['"@type": "WebApplication",\n            "name": "Study World Map",\n            "url": "https://www.studyworldmap.com/",', '"@type": "WebApplication",\n            "name": "Study World Map",\n            "url": "https://www.studyworldmap.com/en/",'],
    [
      'Mapamundi interactivo (globo 3D y mapa plano) para aprender los 197 países del mundo, sus continentes, capitales y banderas con cinco retos y repaso espaciado.',
      'Interactive world map (3D globe and flat map) to learn the 197 countries of the world, their continents, capitals and flags with five challenges and spaced repetition.',
    ],
    ['"operatingSystem": "Cualquiera con un navegador moderno",\n            "inLanguage": "es"', '"operatingSystem": "Any with a modern browser",\n            "inLanguage": "en"'],
    ['"educationalUse": "Práctica y repaso"', '"educationalUse": "Practice and review"'],
    ['"learningResourceType": "Juego educativo"', '"learningResourceType": "Educational game"'],
    ['["Geografía", "Países del mundo", "Capitales del mundo", "Banderas del mundo"]', '["Geography", "Countries of the world", "World capitals", "Flags of the world"]'],
    ['Study World Map: aprende los países del mundo jugando', 'Study World Map: learn the countries of the world by playing'],
    [
      `Mapamundi interactivo para aprender los 197 países del mundo, sus continentes, sus capitales y sus
          banderas. Un globo 3D que se desenrolla en un mapa plano, cinco retos con corrección inmediata y un
          sistema de repaso que insiste en lo que todavía no te sabes. Gratis, sin anuncios, sin registro y en
          español.`,
      `Interactive world map to learn the 197 countries of the world, their continents, their capitals and their
          flags. A 3D globe that unrolls into a flat map, five challenges with instant feedback and a review
          system that keeps asking what you do not know yet. Free, with no ads and no sign-up.`,
    ],
    ['Retos de geografía', 'Geography challenges'],
    ['<strong>Localizar:</strong> te damos el nombre de un país y lo buscas en el mapa.', '<strong>Locate:</strong> we give you the name of a country and you find it on the map.'],
    ['<strong>Continentes:</strong> dices en qué continente está cada país.', '<strong>Continents:</strong> you say which continent each country is in.'],
    ['<strong>Nombrar:</strong> señalamos un país en el mapa y dices cuál es.', '<strong>Name:</strong> we point to a country on the map and you say which one it is.'],
    ['<strong>Capitales:</strong> unes cada país con su capital.', '<strong>Capitals:</strong> you match each country with its capital.'],
    ['<strong>Banderas:</strong> reconoces de qué país es cada bandera.', '<strong>Flags:</strong> you recognise which country each flag belongs to.'],
    ['Cómo ayuda a aprender', 'How it helps you learn'],
    ['Cada fallo dice qué país has pulsado y, tras varios intentos, se enseña la solución.', 'Every miss tells you which country you tapped and, after a few attempts, the answer is shown.'],
    [
      'Lo que fallas vuelve a preguntarse tres preguntas después, y entre partidas cada país sigue un repaso espaciado (cajas de Leitner).',
      'What you miss is asked again three questions later, and between games each country follows spaced repetition (Leitner boxes).',
    ],
    [
      'Se juega con el mundo entero, por continentes o con una lista de países propia que se comparte con un enlace, ideal para preparar un examen.',
      'You can play with the whole world, by continent or with your own list of countries, shared with a link: ideal for preparing a test.',
    ],
    ['Funciona en el móvil, se puede instalar y, tras la primera visita, también sin conexión.', 'It works on mobile, can be installed and, after the first visit, also works offline.'],
    [
      `¿Buscas la lista completa? Consulta los
          <a href="/paises-y-capitales/">países del mundo y sus capitales</a>, ordenados por continente.`,
      `Looking for the full list? See the
          <a href="/en/countries-and-capitals/">countries of the world and their capitals</a>, by continent.`,
    ],
    ['El mapa interactivo y los juegos necesitan JavaScript.', 'The interactive map and the games need JavaScript.'],
  ],
};
