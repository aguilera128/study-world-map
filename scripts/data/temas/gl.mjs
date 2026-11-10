// Galego: textos de las páginas de temas (scripts/build-pages.mjs). Mismas claves que ./es.mjs,
// que es la plantilla; los datos (nombres, cifras) salen de los ficheros de la aplicación.

export default {
  slug: {
    rios: 'rios-e-lagos-do-mundo',
    montanas: 'cordilleiras-e-montanas-do-mundo',
    mares: 'oceanos-mares-e-estreitos',
    tierras: 'desertos-peninsulas-e-illas',
    climas: 'climas-do-mundo',
    poblacion: 'paises-mais-poboados',
    tierra: 'capas-da-terra',
    atmosfera: 'capas-da-atmosfera',
  },

  comun: {
    juegos: 'Xogos',
    todos: 'Todos os xogos e temas',
    indiceFisico: 'Xeografía física, climas e poboación',
    indicePlaneta: 'O planeta',
    recurso: 'Xogo educativo',
    nivel: 'Educación primaria e secundaria',
    portada: 'Que podes estudar',
    nombre: 'Nome',
    altitud: 'Altitude',
    pais: 'País',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Son ${n} lugares, os que adoitan entrar no temario de xeografía física. No xogo pregúntase máis o que fallas, ata que o saibas.`,
    cta: (que) => `Xogar: localizar ${que} →`,
    fuente: 'Posicións e altitudes de Natural Earth (dominio público), con correccións contrastadas.',
    rios: {
      h1: 'Ríos e lagos do mundo: xogo no mapa',
      enlace: 'Ríos e lagos',
      description: 'Os ríos e lagos que se estudan en primaria e ESO, cun xogo de balde para localizalos nun mapa interactivo con relevo. Sen rexistro nin anuncios.',
      secciones: { rio: 'Ríos', lago: 'Lagos' },
    },
    montanas: {
      h1: 'Cordilleiras e montañas do mundo: xogo no mapa',
      enlace: 'Cordilleiras e montañas',
      description: 'As cordilleiras e os picos que se estudan en primaria e ESO, coa súa altitude, e un xogo de balde para situalos nun mapa interactivo con relevo.',
      secciones: { cordillera: 'Cordilleiras', pico: 'Picos' },
    },
    mares: {
      h1: 'Océanos, mares e estreitos: xogo no mapa',
      enlace: 'Océanos, mares e estreitos',
      description: 'Os cinco océanos e os mares, golfos e estreitos do temario de xeografía, cun xogo de balde para localizalos nun mapa interactivo.',
      secciones: { oceano: 'Océanos', mar: 'Mares', golfo: 'Golfos e baías', estrecho: 'Estreitos e canles' },
    },
    tierras: {
      h1: 'Desertos, chairas, penínsulas e illas: xogo no mapa',
      enlace: 'Desertos, penínsulas e illas',
      description: 'Desertos, mesetas, chairas, penínsulas e illas do temario de xeografía física, cun xogo de balde para situalos nun mapa interactivo.',
      secciones: { desierto: 'Desertos', llanura: 'Mesetas e chairas', peninsula: 'Penínsulas e cabos', isla: 'Illas e arquipélagos' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climas do mundo por países: lista e xogo',
    enlace: 'Climas do mundo',
    description: (n) => `Que clima ten cada país: ecuatorial, tropical, desértico, mediterráneo, oceánico, continental ou polar. Lista de ${n} países e xogo de balde no mapa.`,
    cta: 'Xogar: que clima ten? →',
    intro: 'Os dez climas que se estudan na ESO, agrupados por zonas: cálida (ecuatorial, tropical, desértico e semiárido), temperada (mediterráneo, oceánico, subtropical húmido e continental) e fría (polar e de alta montaña).',
    h2: 'Clima de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'De cada país danse os seus climas principais, do máis ao menos estendido no seu territorio.',
    columna: 'Climas',
    fuente: 'Calculado sobre o mapa mundial de Köppen-Geiger (Kottek et al., 2006), agrupando os seus tipos nos climas escolares.',
  },

  // ── población ──
  poblacion: {
    h1: 'Países máis poboados do mundo: lista e xogo',
    enlace: 'Países máis poboados',
    description: (year) => `Os países do mundo ordenados por poboación (${year}), coa súa densidade en habitantes por km², e un xogo de balde para comparar cal ten máis habitantes.`,
    cta: 'Xogar: cal ten máis habitantes? →',
    h2: 'Poboación e densidade de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'A densidade de poboación é o número de habitantes por quilómetro cadrado: di se un país está moi poboado ou pouco para o seu tamaño.',
    habitantes: (year) => `Habitantes (${year})`,
    densidad: 'Densidade',
    unidad: 'hab./km²',
    fuente: 'Poboación: Banco Mundial (indicador SP.POP.TOTL), CC BY 4.0. Superficie: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Capas da Terra: codia, manto e núcleo',
    enlace: 'Capas da Terra',
    description: 'As capas do interior da Terra e as súas descontinuidades, con profundidade, composición e temperatura, e un globo 3D que se abre para velas por dentro.',
    cta: 'Abrir o mapa e premer «O planeta» →',
    h2: 'As capas, de fóra a dentro',
    capa: 'Capa',
    como: 'Como é e ata onde chega',
    discontinuidades: 'Son as superficies que separan unha capa da seguinte.',
    discontinuidad: 'Descontinuidade',
    separa: 'Que separa',
    zona: 'Zona',
    que: 'Que é',
    fuente: 'Profundidades: USGS, IGN e o modelo PREM. As temperaturas son estimacións a partir de experimentos e modelos (Katsura 2022; Anzellini et al. 2013): dun estudo a outro cambian varios centos de graos.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Capas da atmosfera: da troposfera á exosfera',
    enlace: 'Capas da atmosfera',
    description: 'As cinco capas da atmosfera, coa súa altura e o que acontece en cada unha (o tempo, a capa de ozono, os meteoros, as auroras), e un globo 3D para velas.',
    cta: 'Abrir o mapa e premer «O planeta» →',
    h2: 'As capas, do chan cara arriba',
    capa: 'Capa',
    altura: 'Altura e que acontece nela',
    nota: 'As alturas son aproximadas: os límites cambian coa latitude e a estación. Fonte: NASA.',
  },
};
