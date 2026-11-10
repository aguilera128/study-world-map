// Italiano: textos de las páginas de temas. Mismas claves que ./es.mjs (la plantilla).

export default {
  slug: {
    rios: 'fiumi-e-laghi-del-mondo',
    montanas: 'catene-montuose-e-montagne-del-mondo',
    mares: 'oceani-mari-e-stretti',
    tierras: 'deserti-penisole-e-isole',
    climas: 'climi-del-mondo',
    poblacion: 'paesi-piu-popolosi',
    tierra: 'strati-della-terra',
    atmosfera: 'strati-dell-atmosfera',
  },

  comun: {
    juegos: 'Giochi',
    todos: 'Tutti i giochi e gli argomenti',
    indiceFisico: 'Geografia fisica, climi e popolazione',
    indicePlaneta: 'Il pianeta',
    recurso: 'Gioco educativo',
    nivel: 'Scuola primaria e secondaria',
    portada: 'Che cosa puoi studiare',
    nombre: 'Nome',
    altitud: 'Altitudine',
    pais: 'Paese',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Sono ${n} luoghi, quelli che di solito rientrano nel programma di geografia fisica. Nel gioco ti viene chiesto più spesso ciò che sbagli, finché non lo sai.`,
    cta: (que) => `Gioca: localizza ${que} →`,
    fuente: 'Posizioni e altitudini di Natural Earth (pubblico dominio), con correzioni verificate.',
    rios: {
      h1: 'Fiumi e laghi del mondo: gioco sulla mappa',
      enlace: 'Fiumi e laghi',
      description: 'I fiumi e i laghi che si studiano nella scuola primaria e secondaria, con un gioco gratis per localizzarli su una mappa interattiva con rilievo.',
      secciones: { rio: 'Fiumi', lago: 'Laghi' },
    },
    montanas: {
      h1: 'Catene montuose e montagne del mondo: gioco sulla mappa',
      enlace: 'Catene montuose e montagne',
      description: 'Le catene montuose e le vette che si studiano nella scuola primaria e secondaria, con l’altitudine, e un gioco gratis per trovarle su una mappa con rilievo.',
      secciones: { cordillera: 'Catene montuose', pico: 'Vette' },
    },
    mares: {
      h1: 'Oceani, mari e stretti: gioco sulla mappa',
      enlace: 'Oceani, mari e stretti',
      description: 'I cinque oceani e i mari, i golfi e gli stretti del programma di geografia, con un gioco gratis per localizzarli su una mappa interattiva.',
      secciones: { oceano: 'Oceani', mar: 'Mari', golfo: 'Golfi e baie', estrecho: 'Stretti e canali' },
    },
    tierras: {
      h1: 'Deserti, pianure, penisole e isole: gioco sulla mappa',
      enlace: 'Deserti, penisole e isole',
      description: 'Deserti, altopiani, pianure, penisole e isole del programma di geografia fisica, con un gioco gratis per trovarli su una mappa interattiva.',
      secciones: { desierto: 'Deserti', llanura: 'Altopiani e pianure', peninsula: 'Penisole e capi', isla: 'Isole e arcipelaghi' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climi del mondo per paese: elenco e gioco',
    enlace: 'Climi del mondo',
    description: (n) => `Che clima ha ogni paese: equatoriale, tropicale, desertico, mediterraneo, oceanico, continentale o polare. Elenco di ${n} paesi e gioco gratis sulla mappa.`,
    cta: 'Gioca: che clima ha? →',
    intro: 'I dieci climi che si studiano nella scuola secondaria, raggruppati per zone: calda (equatoriale, tropicale, desertico e semiarido), temperata (mediterraneo, oceanico, subtropicale umido e continentale) e fredda (polare e di alta montagna).',
    h2: 'Clima di ogni paese',
    cuenta: (n) => `${n} paesi`,
    nota: 'Di ogni paese sono indicati i climi principali, dal più al meno esteso sul suo territorio.',
    columna: 'Climi',
    fuente: 'Calcolato sulla mappa mondiale di Köppen-Geiger (Kottek et al., 2006), raggruppando i suoi tipi nei climi che si studiano a scuola.',
  },

  // ── población ──
  poblacion: {
    h1: 'Paesi più popolosi del mondo: elenco e gioco',
    enlace: 'Paesi più popolosi',
    description: (year) => `I paesi del mondo in ordine di popolazione (${year}), con la densità in abitanti per km², e un gioco gratis per confrontare quale ha più abitanti.`,
    cta: 'Gioca: quale ha più abitanti? →',
    h2: 'Popolazione e densità di ogni paese',
    cuenta: (n) => `${n} paesi`,
    nota: 'La densità di popolazione è il numero di abitanti per chilometro quadrato: indica se un paese è molto o poco popolato rispetto alle sue dimensioni.',
    habitantes: (year) => `Abitanti (${year})`,
    densidad: 'Densità',
    unidad: 'ab./km²',
    fuente: 'Popolazione: Banca Mondiale (indicatore SP.POP.TOTL), CC BY 4.0. Superficie: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Strati della Terra: crosta, mantello e nucleo',
    enlace: 'Strati della Terra',
    description: 'Gli strati interni della Terra e le loro discontinuità, con profondità, composizione e temperatura, e un globo 3D che si apre per vederli dall’interno.',
    cta: 'Apri la mappa e premi «Il pianeta» →',
    h2: 'Gli strati, dall’esterno verso l’interno',
    capa: 'Strato',
    como: 'Com’è e fin dove arriva',
    discontinuidades: 'Sono le superfici che separano uno strato dal successivo.',
    discontinuidad: 'Discontinuità',
    separa: 'Che cosa separa',
    zona: 'Zona',
    que: 'Che cos’è',
    fuente: 'Profondità: USGS, IGN e il modello PREM. Le temperature sono stime ricavate da esperimenti e modelli (Katsura 2022; Anzellini et al. 2013): da uno studio all’altro cambiano di diverse centinaia di gradi.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Strati dell’atmosfera: dalla troposfera all’esosfera',
    enlace: 'Strati dell’atmosfera',
    description: 'I cinque strati dell’atmosfera, con l’altezza e ciò che accade in ciascuno (il meteo, lo strato di ozono, le meteore, le aurore), e un globo 3D per vederli.',
    cta: 'Apri la mappa e premi «Il pianeta» →',
    h2: 'Gli strati, dal suolo verso l’alto',
    capa: 'Strato',
    altura: 'Altezza e che cosa vi accade',
    nota: 'Le altezze sono approssimative: i limiti cambiano con la latitudine e la stagione. Fonte: NASA.',
  },
};
