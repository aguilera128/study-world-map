// Português (do Brasil): textos de las páginas de temas. Mismas claves que ./es.mjs (la plantilla).

export default {
  slug: {
    rios: 'rios-e-lagos-do-mundo',
    montanas: 'cordilheiras-e-montanhas-do-mundo',
    mares: 'oceanos-mares-e-estreitos',
    tierras: 'desertos-peninsulas-e-ilhas',
    climas: 'climas-do-mundo',
    poblacion: 'paises-mais-populosos',
    tierra: 'camadas-da-terra',
    atmosfera: 'camadas-da-atmosfera',
  },

  comun: {
    juegos: 'Jogos',
    todos: 'Todos os jogos e temas',
    indiceFisico: 'Geografia física, climas e população',
    indicePlaneta: 'O planeta',
    recurso: 'Jogo educativo',
    nivel: 'Ensino Fundamental e Médio',
    portada: 'O que você pode estudar',
    nombre: 'Nome',
    altitud: 'Altitude',
    pais: 'País',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `São ${n} lugares, os que costumam fazer parte do conteúdo de geografia física. No jogo, o que você erra é perguntado mais vezes, até você saber.`,
    cta: (que) => `Jogar: localizar ${que} →`,
    fuente: 'Posições e altitudes da Natural Earth (domínio público), com correções verificadas.',
    rios: {
      h1: 'Rios e lagos do mundo: jogo no mapa',
      enlace: 'Rios e lagos',
      description: 'Os rios e lagos estudados no Ensino Fundamental e Médio, com um jogo grátis para localizá-los em um mapa interativo com relevo. Sem cadastro nem anúncios.',
      secciones: { rio: 'Rios', lago: 'Lagos' },
    },
    montanas: {
      h1: 'Cordilheiras e montanhas do mundo: jogo no mapa',
      enlace: 'Cordilheiras e montanhas',
      description: 'As cordilheiras e os picos estudados no Ensino Fundamental e Médio, com a altitude, e um jogo grátis para situá-los em um mapa interativo com relevo.',
      secciones: { cordillera: 'Cordilheiras', pico: 'Picos' },
    },
    mares: {
      h1: 'Oceanos, mares e estreitos: jogo no mapa',
      enlace: 'Oceanos, mares e estreitos',
      description: 'Os cinco oceanos e os mares, golfos e estreitos do conteúdo de geografia, com um jogo grátis para localizá-los em um mapa interativo.',
      secciones: { oceano: 'Oceanos', mar: 'Mares', golfo: 'Golfos e baías', estrecho: 'Estreitos e canais' },
    },
    tierras: {
      h1: 'Desertos, planícies, penínsulas e ilhas: jogo no mapa',
      enlace: 'Desertos, penínsulas e ilhas',
      description: 'Desertos, planaltos, planícies, penínsulas e ilhas do conteúdo de geografia física, com um jogo grátis para situá-los em um mapa interativo.',
      secciones: { desierto: 'Desertos', llanura: 'Planaltos e planícies', peninsula: 'Penínsulas e cabos', isla: 'Ilhas e arquipélagos' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climas do mundo por país: lista e jogo',
    enlace: 'Climas do mundo',
    description: (n) => `Que clima tem cada país: equatorial, tropical, desértico, mediterrâneo, oceânico, continental ou polar. Lista de ${n} países e jogo grátis no mapa.`,
    cta: 'Jogar: que clima tem? →',
    intro: 'Os dez climas estudados na escola, agrupados por zonas: quente (equatorial, tropical, desértico e semiárido), temperada (mediterrâneo, oceânico, subtropical úmido e continental) e fria (polar e de alta montanha).',
    h2: 'Clima de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'De cada país são indicados os climas principais, do mais ao menos extenso em seu território.',
    columna: 'Climas',
    fuente: 'Calculado a partir do mapa-múndi de Köppen-Geiger (Kottek et al., 2006), agrupando seus tipos nos climas escolares.',
  },

  // ── población ──
  poblacion: {
    h1: 'Países mais populosos do mundo: lista e jogo',
    enlace: 'Países mais populosos',
    description: (year) => `Os países do mundo ordenados por população (${year}), com a densidade em habitantes por km², e um jogo grátis para comparar qual tem mais habitantes.`,
    cta: 'Jogar: qual tem mais habitantes? →',
    h2: 'População e densidade de cada país',
    cuenta: (n) => `${n} países`,
    nota: 'A densidade populacional é o número de habitantes por quilômetro quadrado: mostra se um país é muito ou pouco povoado para o seu tamanho.',
    habitantes: (year) => `Habitantes (${year})`,
    densidad: 'Densidade',
    unidad: 'hab./km²',
    fuente: 'População: Banco Mundial (indicador SP.POP.TOTL), CC BY 4.0. Área: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Camadas da Terra: crosta, manto e núcleo',
    enlace: 'Camadas da Terra',
    description: 'As camadas do interior da Terra e suas descontinuidades, com profundidade, composição e temperatura, e um globo 3D que se abre para vê-las por dentro.',
    cta: 'Abrir o mapa e tocar em “O planeta” →',
    h2: 'As camadas, de fora para dentro',
    capa: 'Camada',
    como: 'Como é e até onde vai',
    discontinuidades: 'São as superfícies que separam uma camada da seguinte.',
    discontinuidad: 'Descontinuidade',
    separa: 'O que separa',
    zona: 'Zona',
    que: 'O que é',
    fuente: 'Profundidades: USGS, IGN e o modelo PREM. As temperaturas são estimativas a partir de experimentos e modelos (Katsura 2022; Anzellini et al. 2013): de um estudo para outro, variam várias centenas de graus.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Camadas da atmosfera: da troposfera à exosfera',
    enlace: 'Camadas da atmosfera',
    description: 'As cinco camadas da atmosfera, com a altura e o que acontece em cada uma (o tempo, a camada de ozônio, os meteoros, as auroras), e um globo 3D para vê-las.',
    cta: 'Abrir o mapa e tocar em “O planeta” →',
    h2: 'As camadas, do solo para cima',
    capa: 'Camada',
    altura: 'Altura e o que acontece nela',
    nota: 'As alturas são aproximadas: os limites mudam com a latitude e a estação do ano. Fonte: NASA.',
  },
};
