// Français: textos de las páginas de temas (scripts/build-pages.mjs). Mismas claves que ./es.mjs,
// que es la plantilla.

export default {
  slug: {
    rios: 'fleuves-et-lacs-du-monde',
    montanas: 'chaines-de-montagnes-et-sommets-du-monde',
    mares: 'oceans-mers-et-detroits',
    tierras: 'deserts-peninsules-et-iles',
    climas: 'climats-du-monde',
    poblacion: 'pays-les-plus-peuples',
    tierra: 'couches-de-la-terre',
    atmosfera: 'couches-de-l-atmosphere',
  },

  comun: {
    juegos: 'Jeux',
    todos: 'Tous les jeux et thèmes',
    indiceFisico: 'Géographie physique, climats et population',
    indicePlaneta: 'La planète',
    recurso: 'Jeu éducatif',
    nivel: 'École primaire et collège',
    portada: 'Ce que vous pouvez étudier',
    nombre: 'Nom',
    altitud: 'Altitude',
    pais: 'Pays',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Voici les ${n} lieux qui figurent le plus souvent au programme de géographie physique. Dans le jeu, ce que vous ratez revient plus souvent, jusqu’à ce que vous le sachiez.`,
    cta: (que) => `Jouer : situer les ${que} →`,
    fuente: 'Positions et altitudes de Natural Earth (domaine public), avec des corrections vérifiées.',
    rios: {
      h1: 'Fleuves et lacs du monde : jeu sur la carte',
      enlace: 'Fleuves et lacs',
      description: 'Les fleuves et les lacs étudiés à l’école primaire et au collège, avec un jeu gratuit pour les situer sur une carte interactive en relief. Sans inscription.',
      secciones: { rio: 'Fleuves', lago: 'Lacs' },
    },
    montanas: {
      h1: 'Chaînes de montagnes et sommets du monde : jeu sur la carte',
      enlace: 'Chaînes de montagnes et sommets',
      description: 'Les chaînes de montagnes et les sommets étudiés à l’école primaire et au collège, avec leur altitude, et un jeu gratuit pour les situer sur une carte en relief.',
      secciones: { cordillera: 'Chaînes de montagnes', pico: 'Sommets' },
    },
    mares: {
      h1: 'Océans, mers et détroits : jeu sur la carte',
      enlace: 'Océans, mers et détroits',
      description: 'Les cinq océans et les mers, golfes et détroits du programme de géographie, avec un jeu gratuit pour les situer sur une carte interactive.',
      secciones: { oceano: 'Océans', mar: 'Mers', golfo: 'Golfes et baies', estrecho: 'Détroits et canaux' },
    },
    tierras: {
      h1: 'Déserts, plaines, péninsules et îles : jeu sur la carte',
      enlace: 'Déserts, péninsules et îles',
      description: 'Déserts, plateaux, plaines, péninsules et îles du programme de géographie physique, avec un jeu gratuit pour les situer sur une carte interactive.',
      secciones: { desierto: 'Déserts', llanura: 'Plateaux et plaines', peninsula: 'Péninsules et caps', isla: 'Îles et archipels' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climats du monde par pays : liste et jeu',
    enlace: 'Climats du monde',
    description: (n) => `Le climat de chaque pays : équatorial, tropical, désertique, méditerranéen, océanique, continental ou polaire. Liste de ${n} pays et jeu gratuit sur la carte.`,
    cta: 'Jouer : quel est son climat ? →',
    intro: 'Les dix climats étudiés au collège, regroupés par zones : chaude (équatorial, tropical, désertique et semi-aride), tempérée (méditerranéen, océanique, subtropical humide et continental) et froide (polaire et montagnard).',
    h2: 'Climat de chaque pays',
    cuenta: (n) => `${n} pays`,
    nota: 'Pour chaque pays, on indique ses principaux climats, du plus étendu au moins étendu sur son territoire.',
    columna: 'Climats',
    fuente: 'Calculé à partir de la carte mondiale de Köppen-Geiger (Kottek et al., 2006), en regroupant ses types selon les climats enseignés à l’école.',
  },

  // ── población ──
  poblacion: {
    h1: 'Pays les plus peuplés du monde : liste et jeu',
    enlace: 'Pays les plus peuplés',
    description: (year) => `Les pays du monde classés par population (${year}), avec leur densité en habitants par km², et un jeu gratuit pour comparer lequel a le plus d’habitants.`,
    cta: 'Jouer : lequel a le plus d’habitants ? →',
    h2: 'Population et densité de chaque pays',
    cuenta: (n) => `${n} pays`,
    nota: 'La densité de population est le nombre d’habitants par kilomètre carré : elle indique si un pays est très ou peu peuplé par rapport à sa taille.',
    habitantes: (year) => `Habitants (${year})`,
    densidad: 'Densité',
    unidad: 'hab./km²',
    fuente: 'Population : Banque mondiale (indicateur SP.POP.TOTL), CC BY 4.0. Superficie : mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Couches de la Terre : croûte, manteau et noyau',
    enlace: 'Couches de la Terre',
    description: 'Les couches internes de la Terre et leurs discontinuités, avec profondeur, composition et température, et un globe 3D qui s’ouvre pour les voir de l’intérieur.',
    cta: 'Ouvrir la carte et appuyer sur « La planète » →',
    h2: 'Les couches, de l’extérieur vers l’intérieur',
    capa: 'Couche',
    como: 'Comment elle est et jusqu’où elle s’étend',
    discontinuidades: 'Ce sont les surfaces qui séparent une couche de la suivante.',
    discontinuidad: 'Discontinuité',
    separa: 'Ce qu’elle sépare',
    zona: 'Zone',
    que: 'Ce que c’est',
    fuente: 'Profondeurs : USGS, IGN (Espagne) et modèle PREM. Les températures sont des estimations tirées d’expériences et de modèles (Katsura 2022 ; Anzellini et al. 2013) : elles varient de plusieurs centaines de degrés d’une étude à l’autre.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Couches de l’atmosphère : de la troposphère à l’exosphère',
    enlace: 'Couches de l’atmosphère',
    description: 'Les cinq couches de l’atmosphère, avec leur altitude et ce qui s’y passe (la météo, la couche d’ozone, les météores, les aurores), et un globe 3D pour les voir.',
    cta: 'Ouvrir la carte et appuyer sur « La planète » →',
    h2: 'Les couches, du sol vers le haut',
    capa: 'Couche',
    altura: 'Altitude et ce qui s’y passe',
    nota: 'Les altitudes sont approximatives : les limites varient selon la latitude et la saison. Source : NASA.',
  },
};
