// Español: los textos de las páginas estáticas y de index.html (el idioma de referencia). Los
// nombres de países y capitales en español están en ../paises.mjs.

export default {
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
  // Textos de index.html. Cada idioma da su traducción en este mismo orden (`index`); el enlace a
  // la página de países se escribe {paises} en las traducciones.
  index: [
    "Juego de países, capitales y banderas del mundo · Study World Map",
    "Mapamundi interactivo en 3D y 2D para aprender los 197 países del mundo, sus capitales y sus banderas. Gratis, sin registro y en español: juega, falla, repasa y aprende geografía a tu ritmo.",
    "Study World Map · Aprende los países del mundo jugando",
    "Globo 3D y mapa plano interactivos para estudiar países, capitales y banderas.",
    "Globo terráqueo con los países coloreados junto al panel de retos de Study World Map",
    "Mapamundi interactivo (globo 3D y mapa plano) para aprender los 197 países del mundo, sus continentes, capitales y banderas con cinco retos y repaso espaciado.",
    "Cualquiera con un navegador moderno",
    "Práctica y repaso",
    "Juego educativo",
    "[\"Geografía\", \"Países del mundo\", \"Capitales del mundo\", \"Banderas del mundo\"]",
    "Study World Map: aprende los países del mundo jugando",
    `Mapamundi interactivo para aprender los 197 países del mundo, sus continentes, sus capitales y sus
          banderas. Un globo 3D que se desenrolla en un mapa plano, cinco retos con corrección inmediata y un
          sistema de repaso que insiste en lo que todavía no te sabes. Gratis, sin anuncios, sin registro y en
          español.`,
    "Retos de geografía",
    "<strong>Localizar:</strong> te damos el nombre de un país y lo buscas en el mapa.",
    "<strong>Continentes:</strong> dices en qué continente está cada país.",
    "<strong>Nombrar:</strong> señalamos un país en el mapa y dices cuál es.",
    "<strong>Capitales:</strong> unes cada país con su capital.",
    "<strong>Banderas:</strong> reconoces de qué país es cada bandera.",
    "Cómo ayuda a aprender",
    "Cada fallo dice qué país has pulsado y, tras varios intentos, se enseña la solución.",
    "Lo que fallas vuelve a preguntarse tres preguntas después, y entre partidas cada país sigue un repaso espaciado (cajas de Leitner).",
    "Se juega con el mundo entero, por continentes o con una lista de países propia que se comparte con un enlace, ideal para preparar un examen.",
    "Funciona en el móvil, se puede instalar y, tras la primera visita, también sin conexión.",
    `¿Buscas la lista completa? Consulta los
          <a href="/paises-y-capitales/">países del mundo y sus capitales</a>, ordenados por continente.`,
    "El mapa interactivo y los juegos necesitan JavaScript.",
  ],
};
