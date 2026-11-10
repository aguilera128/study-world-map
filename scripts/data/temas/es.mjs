// Español: textos de las páginas de temas (scripts/build-pages.mjs): geografía física, climas,
// población y «El planeta». Es la plantilla: cada idioma tiene un fichero igual, con las mismas
// claves. Los datos (nombres de ríos, países, capas, cifras) no van aquí: salen de los mismos
// ficheros que usa la aplicación.

export default {
  // Trozo de la dirección de cada página (sin tildes ni espacios). Las cuatro de geografía física,
  // la de climas y la de población van bajo /juego/; las dos del planeta, en la raíz del idioma.
  slug: {
    rios: 'rios-y-lagos-del-mundo',
    montanas: 'cordilleras-y-montanas-del-mundo',
    mares: 'oceanos-mares-y-estrechos',
    tierras: 'desiertos-peninsulas-e-islas',
    climas: 'climas-del-mundo',
    poblacion: 'paises-mas-poblados',
    tierra: 'capas-de-la-tierra',
    atmosfera: 'capas-de-la-atmosfera',
  },

  comun: {
    // Miga de pan e índice
    juegos: 'Juegos',
    todos: 'Todos los juegos y temas',
    indiceFisico: 'Geografía física, climas y población',
    indicePlaneta: 'El planeta',
    // Datos estructurados
    recurso: 'Juego educativo',
    nivel: 'Educación Primaria y Secundaria',
    // Portada: título de la lista de enlaces a estas páginas
    portada: 'Qué puedes estudiar',
    // Tablas
    nombre: 'Nombre',
    altitud: 'Altitud',
    pais: 'País',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Son ${n} lugares, los que suelen entrar en el temario de geografía física. En el juego se pregunta más lo que fallas, hasta que te lo sabes.`,
    cta: (que) => `Jugar: localizar ${que} →`,
    fuente: 'Posiciones y altitudes de Natural Earth (dominio público), con correcciones contrastadas.',
    rios: {
      h1: 'Ríos y lagos del mundo: juego en el mapa',
      enlace: 'Ríos y lagos',
      description: 'Los ríos y lagos que se estudian en Primaria y ESO, con un juego gratis para localizarlos en un mapa interactivo con relieve. Sin registro ni anuncios.',
      secciones: { rio: 'Ríos', lago: 'Lagos' },
    },
    montanas: {
      h1: 'Cordilleras y montañas del mundo: juego en el mapa',
      enlace: 'Cordilleras y montañas',
      description: 'Las cordilleras y los picos que se estudian en Primaria y ESO, con su altitud, y un juego gratis para situarlos en un mapa interactivo con relieve.',
      secciones: { cordillera: 'Cordilleras', pico: 'Picos' },
    },
    mares: {
      h1: 'Océanos, mares y estrechos: juego en el mapa',
      enlace: 'Océanos, mares y estrechos',
      description: 'Los cinco océanos y los mares, golfos y estrechos del temario de geografía, con un juego gratis para localizarlos en un mapa interactivo.',
      secciones: { oceano: 'Océanos', mar: 'Mares', golfo: 'Golfos y bahías', estrecho: 'Estrechos y canales' },
    },
    tierras: {
      h1: 'Desiertos, llanuras, penínsulas e islas: juego en el mapa',
      enlace: 'Desiertos, penínsulas e islas',
      description: 'Desiertos, mesetas, llanuras, penínsulas e islas del temario de geografía física, con un juego gratis para situarlos en un mapa interactivo.',
      secciones: { desierto: 'Desiertos', llanura: 'Mesetas y llanuras', peninsula: 'Penínsulas y cabos', isla: 'Islas y archipiélagos' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climas del mundo por países: lista y juego',
    enlace: 'Climas del mundo',
    description: (n) => `Qué clima tiene cada país: ecuatorial, tropical, desértico, mediterráneo, oceánico, continental o polar. Lista de ${n} países y juego gratis en el mapa.`,
    cta: 'Jugar: ¿qué clima tiene? →',
    intro: 'Los diez climas que se estudian en la ESO, agrupados por zonas: cálida (ecuatorial, tropical, desértico y semiárido), templada (mediterráneo, oceánico, subtropical húmedo y continental) y fría (polar y de alta montaña).',
    h2: 'Clima de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'De cada país se dan sus climas principales, de más a menos extendido en su territorio.',
    columna: 'Climas',
    fuente: 'Calculado sobre el mapa mundial de Köppen-Geiger (Kottek et al., 2006), agrupando sus tipos en los climas escolares.',
  },

  // ── población ──
  poblacion: {
    h1: 'Países más poblados del mundo: lista y juego',
    enlace: 'Países más poblados',
    description: (year) => `Los países del mundo ordenados por población (${year}), con su densidad en habitantes por km², y un juego gratis para comparar cuál tiene más habitantes.`,
    cta: 'Jugar: ¿cuál tiene más habitantes? →',
    h2: 'Población y densidad de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'La densidad de población es el número de habitantes por kilómetro cuadrado: dice si un país está muy poblado o poco para su tamaño.',
    habitantes: (year) => `Habitantes (${year})`,
    densidad: 'Densidad',
    unidad: 'hab./km²',
    fuente: 'Población: Banco Mundial (indicador SP.POP.TOTL), CC BY 4.0. Superficie: mledoze/countries.',
  },

  // ── capas de la Tierra ── (los nombres y datos de cada capa salen del diccionario de la aplicación)
  tierra: {
    h1: 'Capas de la Tierra: corteza, manto y núcleo',
    enlace: 'Capas de la Tierra',
    description: 'Las capas del interior de la Tierra y sus discontinuidades, con profundidad, composición y temperatura, y un globo 3D que se abre para verlas por dentro.',
    cta: 'Abrir el mapa y pulsar «El planeta» →',
    h2: 'Las capas, de fuera adentro',
    capa: 'Capa',
    como: 'Cómo es y hasta dónde llega',
    discontinuidades: 'Son las superficies que separan una capa de la siguiente.',
    discontinuidad: 'Discontinuidad',
    separa: 'Qué separa',
    zona: 'Zona',
    que: 'Qué es',
    fuente: 'Profundidades: USGS, IGN y el modelo PREM. Las temperaturas son estimaciones a partir de experimentos y modelos (Katsura 2022; Anzellini et al. 2013): de un estudio a otro cambian varios cientos de grados.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Capas de la atmósfera: de la troposfera a la exosfera',
    enlace: 'Capas de la atmósfera',
    description: 'Las cinco capas de la atmósfera, con su altura y lo que ocurre en cada una (el tiempo, la capa de ozono, los meteoros, las auroras), y un globo 3D para verlas.',
    cta: 'Abrir el mapa y pulsar «El planeta» →',
    h2: 'Las capas, del suelo hacia arriba',
    capa: 'Capa',
    altura: 'Altura y qué ocurre en ella',
    nota: 'Las alturas son aproximadas: los límites cambian con la latitud y la estación. Fuente: NASA.',
  },
};
