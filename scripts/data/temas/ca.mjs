// Valencià / català: textos de las páginas de temas. Mismas claves que ./es.mjs (la plantilla).
// Donde las dos normas difieren, la forma valenciana, como en ../idiomas/ca.mjs.

export default {
  slug: {
    rios: 'rius-i-llacs-del-mon',
    montanas: 'serralades-i-muntanyes-del-mon',
    mares: 'oceans-mars-i-estrets',
    tierras: 'deserts-peninsules-i-illes',
    climas: 'climes-del-mon',
    poblacion: 'paisos-mes-poblats',
    tierra: 'capes-de-la-terra',
    atmosfera: 'capes-de-l-atmosfera',
  },

  comun: {
    juegos: 'Jocs',
    todos: 'Tots els jocs i temes',
    indiceFisico: 'Geografia física, climes i població',
    indicePlaneta: 'El planeta',
    recurso: 'Joc educatiu',
    nivel: 'Educació primària i secundària',
    portada: 'Què pots estudiar',
    nombre: 'Nom',
    altitud: 'Altitud',
    pais: 'País',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Són ${n} llocs, els que solen entrar en el temari de geografia física. En el joc es pregunta més el que falles, fins que t’ho saps.`,
    cta: (que) => `Jugar: localitzar ${que} →`,
    fuente: 'Posicions i altituds de Natural Earth (domini públic), amb correccions contrastades.',
    rios: {
      h1: 'Rius i llacs del món: joc en el mapa',
      enlace: 'Rius i llacs',
      description: 'Els rius i llacs que s’estudien a primària i ESO, amb un joc de franc per a localitzar-los en un mapa interactiu amb relleu. Sense registre ni anuncis.',
      secciones: { rio: 'Rius', lago: 'Llacs' },
    },
    montanas: {
      h1: 'Serralades i muntanyes del món: joc en el mapa',
      enlace: 'Serralades i muntanyes',
      description: 'Les serralades i els cims que s’estudien a primària i ESO, amb l’altitud, i un joc de franc per a situar-los en un mapa interactiu amb relleu.',
      secciones: { cordillera: 'Serralades', pico: 'Cims' },
    },
    mares: {
      h1: 'Oceans, mars i estrets: joc en el mapa',
      enlace: 'Oceans, mars i estrets',
      description: 'Els cinc oceans i els mars, golfs i estrets del temari de geografia, amb un joc de franc per a localitzar-los en un mapa interactiu.',
      secciones: { oceano: 'Oceans', mar: 'Mars', golfo: 'Golfs i badies', estrecho: 'Estrets i canals' },
    },
    tierras: {
      h1: 'Deserts, planes, penínsules i illes: joc en el mapa',
      enlace: 'Deserts, penínsules i illes',
      description: 'Deserts, altiplans, planes, penínsules i illes del temari de geografia física, amb un joc de franc per a situar-los en un mapa interactiu.',
      secciones: { desierto: 'Deserts', llanura: 'Altiplans i planes', peninsula: 'Penínsules i caps', isla: 'Illes i arxipèlags' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Climes del món per països: llista i joc',
    enlace: 'Climes del món',
    description: (n) => `Quin clima té cada país: equatorial, tropical, desèrtic, mediterrani, oceànic, continental o polar. Llista de ${n} països i joc de franc en el mapa.`,
    cta: 'Jugar: quin clima té? →',
    intro: 'Els deu climes que s’estudien a l’ESO, agrupats per zones: càlida (equatorial, tropical, desèrtic i semiàrid), temperada (mediterrani, oceànic, subtropical humit i continental) i freda (polar i d’alta muntanya).',
    h2: 'Clima de cada país',
    cuenta: (n) => `${n} països`,
    nota: 'De cada país es donen els climes principals, de més a menys estés en el seu territori.',
    columna: 'Climes',
    fuente: 'Calculat sobre el mapa mundial de Köppen-Geiger (Kottek et al., 2006), agrupant-ne els tipus en els climes escolars.',
  },

  // ── población ──
  poblacion: {
    h1: 'Països més poblats del món: llista i joc',
    enlace: 'Països més poblats',
    description: (year) => `Els països del món ordenats per població (${year}), amb la densitat en habitants per km², i un joc de franc per a comparar quin té més habitants.`,
    cta: 'Jugar: quin té més habitants? →',
    h2: 'Població i densitat de cada país',
    cuenta: (n) => `${n} països`,
    nota: 'La densitat de població és el nombre d’habitants per quilòmetre quadrat: diu si un país està molt poblat o poc per a la seua grandària.',
    habitantes: (year) => `Habitants (${year})`,
    densidad: 'Densitat',
    unidad: 'hab./km²',
    fuente: 'Població: Banc Mundial (indicador SP.POP.TOTL), CC BY 4.0. Superfície: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Capes de la Terra: escorça, mantell i nucli',
    enlace: 'Capes de la Terra',
    description: 'Les capes de l’interior de la Terra i les seues discontinuïtats, amb profunditat, composició i temperatura, i un globus 3D que s’obri per a veure-les per dins.',
    cta: 'Obrir el mapa i prémer «El planeta» →',
    h2: 'Les capes, de fora cap a dins',
    capa: 'Capa',
    como: 'Com és i fins on arriba',
    discontinuidades: 'Són les superfícies que separen una capa de la següent.',
    discontinuidad: 'Discontinuïtat',
    separa: 'Què separa',
    zona: 'Zona',
    que: 'Què és',
    fuente: 'Profunditats: USGS, IGN i el model PREM. Les temperatures són estimacions a partir d’experiments i models (Katsura 2022; Anzellini et al. 2013): d’un estudi a un altre canvien uns quants centenars de graus.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Capes de l’atmosfera: de la troposfera a l’exosfera',
    enlace: 'Capes de l’atmosfera',
    description: 'Les cinc capes de l’atmosfera, amb l’altura i el que passa en cadascuna (el temps, la capa d’ozó, els meteors, les aurores), i un globus 3D per a veure-les.',
    cta: 'Obrir el mapa i prémer «El planeta» →',
    h2: 'Les capes, de terra cap amunt',
    capa: 'Capa',
    altura: 'Altura i què hi passa',
    nota: 'Les altures són aproximades: els límits canvien amb la latitud i l’estació. Font: NASA.',
  },
};
