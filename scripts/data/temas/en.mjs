// English: textos de las páginas de temas. Mismas claves que ./es.mjs (la plantilla).

export default {
  slug: {
    rios: 'rivers-and-lakes-of-the-world',
    montanas: 'mountain-ranges-and-peaks-of-the-world',
    mares: 'oceans-seas-and-straits',
    tierras: 'deserts-peninsulas-and-islands',
    climas: 'climates-of-the-world',
    poblacion: 'most-populous-countries',
    tierra: 'layers-of-the-earth',
    atmosfera: 'layers-of-the-atmosphere',
  },

  comun: {
    // Miga de pan e índice
    juegos: 'Games',
    todos: 'All games and topics',
    indiceFisico: 'Physical geography, climates and population',
    indicePlaneta: 'The planet',
    // Datos estructurados
    recurso: 'Educational game',
    nivel: 'Primary and secondary education',
    // Portada: título de la lista de enlaces a estas páginas
    portada: 'What you can study',
    // Tablas
    nombre: 'Name',
    altitud: 'Elevation',
    pais: 'Country',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `These are the ${n} places that usually come up in physical geography lessons. The game asks you more often about the ones you miss, until you know them.`,
    cta: (que) => `Play: locate ${que} →`,
    fuente: 'Positions and elevations from Natural Earth (public domain), with verified corrections.',
    rios: {
      h1: 'Rivers and lakes of the world: map game',
      enlace: 'Rivers and lakes',
      description: 'The rivers and lakes taught in primary and secondary school, with a free game to locate them on an interactive relief map. No sign-up, no ads.',
      secciones: { rio: 'Rivers', lago: 'Lakes' },
    },
    montanas: {
      h1: 'Mountain ranges and peaks of the world: map game',
      enlace: 'Mountain ranges and peaks',
      description: 'The mountain ranges and peaks taught in primary and secondary school, with their elevation, and a free game to find them on an interactive relief map.',
      secciones: { cordillera: 'Mountain ranges', pico: 'Peaks' },
    },
    mares: {
      h1: 'Oceans, seas and straits: map game',
      enlace: 'Oceans, seas and straits',
      description: 'The five oceans and the seas, gulfs and straits on the geography syllabus, with a free game to locate them on an interactive map.',
      secciones: { oceano: 'Oceans', mar: 'Seas', golfo: 'Gulfs and bays', estrecho: 'Straits and channels' },
    },
    tierras: {
      h1: 'Deserts, plains, peninsulas and islands: map game',
      enlace: 'Deserts, peninsulas and islands',
      description: 'Deserts, plateaus, plains, peninsulas and islands on the physical geography syllabus, with a free game to find them on an interactive map.',
      secciones: { desierto: 'Deserts', llanura: 'Plateaus and plains', peninsula: 'Peninsulas and capes', isla: 'Islands and archipelagos' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climates of the world by country: list and game',
    enlace: 'Climates of the world',
    description: (n) => `The climate of each country: equatorial, tropical, desert, Mediterranean, oceanic, continental or polar. A list of ${n} countries and a free map game.`,
    cta: 'Play: what is its climate? →',
    intro: 'The ten climates taught in secondary school, grouped by zone: hot (equatorial, tropical, desert and semi-arid), temperate (Mediterranean, oceanic, humid subtropical and continental) and cold (polar and high mountain).',
    h2: 'Climate of each country',
    cuenta: (n) => `${n} countries`,
    nota: 'Each country is listed with its main climates, from the most to the least widespread across its territory.',
    columna: 'Climates',
    fuente: 'Calculated from the Köppen-Geiger world map (Kottek et al., 2006), grouping its types into the climates taught at school.',
  },

  // ── población ──
  poblacion: {
    h1: 'Most populous countries in the world: list and game',
    enlace: 'Most populous countries',
    description: (year) => `The countries of the world ranked by population (${year}), with their density in people per km², and a free game to compare which has the most inhabitants.`,
    cta: 'Play: which has the most inhabitants? →',
    h2: 'Population and density of each country',
    cuenta: (n) => `${n} countries`,
    nota: 'Population density is the number of inhabitants per square kilometre: it tells you whether a country is densely or sparsely populated for its size.',
    habitantes: (year) => `Inhabitants (${year})`,
    densidad: 'Density',
    unidad: 'people/km²',
    fuente: 'Population: World Bank (indicator SP.POP.TOTL), CC BY 4.0. Area: mledoze/countries.',
  },

  // ── capas de la Tierra ── (los nombres y datos de cada capa salen del diccionario de la aplicación)
  tierra: {
    h1: 'Layers of the Earth: crust, mantle and core',
    enlace: 'Layers of the Earth',
    description: 'The layers of the Earth’s interior and its discontinuities, with depth, composition and temperature, and a 3D globe that opens up to show them from the inside.',
    cta: 'Open the map and press “The planet” →',
    h2: 'The layers, from the outside in',
    capa: 'Layer',
    como: 'What it is like and how deep it goes',
    discontinuidades: 'These are the boundaries that separate one layer from the next.',
    discontinuidad: 'Discontinuity',
    separa: 'What it separates',
    zona: 'Zone',
    que: 'What it is',
    fuente: 'Depths: USGS, IGN and the PREM model. Temperatures are estimates from experiments and models (Katsura 2022; Anzellini et al. 2013): they differ by several hundred degrees from one study to another.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Layers of the atmosphere: troposphere to exosphere',
    enlace: 'Layers of the atmosphere',
    description: 'The five layers of the atmosphere, with their height and what happens in each (weather, the ozone layer, meteors, auroras), and a 3D globe to see them.',
    cta: 'Open the map and press “The planet” →',
    h2: 'The layers, from the ground up',
    capa: 'Layer',
    altura: 'Height and what happens there',
    nota: 'Heights are approximate: the boundaries change with latitude and season. Source: NASA.',
  },
};
