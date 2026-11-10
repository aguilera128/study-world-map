// Euskara: textos de las páginas de temas (ver ./es.mjs, que es la plantilla). Mismas claves.
// Traducción sin revisar por un hablante nativo.

export default {
  slug: {
    rios: 'munduko-ibaiak-eta-aintzirak',
    montanas: 'munduko-mendikateak-eta-mendiak',
    mares: 'ozeanoak-itsasoak-eta-itsasarteak',
    tierras: 'basamortuak-penintsulak-eta-uharteak',
    climas: 'munduko-klimak',
    poblacion: 'herrialde-jendetsuenak',
    tierra: 'lurraren-geruzak',
    atmosfera: 'atmosferaren-geruzak',
  },

  comun: {
    juegos: 'Jokoak',
    todos: 'Joko eta gai guztiak',
    indiceFisico: 'Geografia fisikoa, klimak eta biztanleria',
    indicePlaneta: 'Planeta',
    recurso: 'Hezkuntza-jokoa',
    nivel: 'Lehen Hezkuntza eta Bigarren Hezkuntza',
    portada: 'Zer ikas dezakezun',
    nombre: 'Izena',
    altitud: 'Altitudea',
    pais: 'Herrialdea',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `${n} leku dira, geografia fisikoko gai-zerrendan sartu ohi direnak. Jokoan, huts egiten duzuna maizago galdetzen da, ikasi arte.`,
    // El nombre va en absolutivo, sin sufijo pegado: «Jokatu: ibaiak eta aintzirak mapan kokatu →».
    cta: (que) => `Jokatu: ${que} mapan kokatu →`,
    fuente: 'Kokapenak eta altitudeak: Natural Earth (jabari publikoa), egiaztatutako zuzenketekin.',
    rios: {
      h1: 'Munduko ibaiak eta aintzirak: jokoa mapan',
      enlace: 'Ibaiak eta aintzirak',
      description: 'Lehen Hezkuntzan eta DBHn ikasten diren ibaiak eta aintzirak, erliebedun mapa interaktiboan kokatzeko doako joko batekin. Erregistrorik eta iragarkirik gabe.',
      secciones: { rio: 'Ibaiak', lago: 'Aintzirak' },
    },
    montanas: {
      h1: 'Munduko mendikateak eta mendiak: jokoa mapan',
      enlace: 'Mendikateak eta mendiak',
      description: 'Lehen Hezkuntzan eta DBHn ikasten diren mendikateak eta tontorrak, altitudearekin, eta erliebedun mapa interaktibo batean kokatzeko doako jokoa.',
      secciones: { cordillera: 'Mendikateak', pico: 'Tontorrak' },
    },
    mares: {
      h1: 'Ozeanoak, itsasoak eta itsasarteak: jokoa mapan',
      enlace: 'Ozeanoak, itsasoak eta itsasarteak',
      description: 'Bost ozeanoak eta geografiako gai-zerrendako itsasoak, golkoak eta itsasarteak, mapa interaktibo batean kokatzeko doako joko batekin.',
      secciones: { oceano: 'Ozeanoak', mar: 'Itsasoak', golfo: 'Golkoak eta badiak', estrecho: 'Itsasarteak eta kanalak' },
    },
    tierras: {
      h1: 'Basamortuak, lautadak, penintsulak eta uharteak: jokoa mapan',
      enlace: 'Basamortuak, penintsulak eta uharteak',
      description: 'Geografia fisikoko gai-zerrendako basamortuak, goi-lautadak, lautadak, penintsulak eta uharteak, mapa interaktibo batean kokatzeko doako joko batekin.',
      secciones: { desierto: 'Basamortuak', llanura: 'Goi-lautadak eta lautadak', peninsula: 'Penintsulak eta lurmuturrak', isla: 'Uharteak eta artxipelagoak' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Munduko klimak herrialdeka: zerrenda eta jokoa',
    enlace: 'Munduko klimak',
    description: (n) => `Herrialdeen klimak: ekuatoriala, tropikala, basamortukoa, mediterraneoa, ozeanikoa, kontinentala edo polarra. ${n} herrialderen zerrenda eta doako jokoa mapan.`,
    cta: 'Jokatu: zer klima du? →',
    intro: 'DBHn ikasten diren hamar klimak, eremuka bilduta: beroa (ekuatoriala, tropikala, basamortukoa eta erdi-lehorra), epela (mediterraneoa, ozeanikoa, subtropikal hezea eta kontinentala) eta hotza (polarra eta goi-mendikoa).',
    h2: 'Herrialde bakoitzaren klima',
    cuenta: (n) => `${n} herrialde`,
    nota: 'Herrialde bakoitzaren klima nagusiak ematen dira, lurraldean hedatuenetik gutxien hedatuenera.',
    columna: 'Klimak',
    fuente: 'Köppen-Geiger munduko maparen gainean kalkulatua (Kottek et al., 2006), haren motak eskolako klimetan bilduta.',
  },

  // ── población ──
  poblacion: {
    h1: 'Munduko herrialde jendetsuenak: zerrenda eta jokoa',
    enlace: 'Herrialde jendetsuenak',
    description: (year) => `Munduko herrialdeak biztanleriaren arabera ordenatuta (${year}), dentsitatearekin (biztanle km²-ko), eta zeinek biztanle gehiago dituen konparatzeko doako jokoa.`,
    cta: 'Jokatu: zeinek ditu biztanle gehien? →',
    h2: 'Herrialde bakoitzaren biztanleria eta dentsitatea',
    cuenta: (n) => `${n} herrialde`,
    nota: 'Biztanleria-dentsitatea kilometro koadroko biztanle kopurua da: herrialde batek, bere tamainarako, biztanle asko ala gutxi dituen adierazten du.',
    habitantes: (year) => `Biztanleak (${year})`,
    densidad: 'Dentsitatea',
    unidad: 'bizt./km²',
    fuente: 'Biztanleria: Munduko Bankua (SP.POP.TOTL adierazlea), CC BY 4.0. Azalera: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Lurraren geruzak: lurrazala, mantua eta nukleoa',
    enlace: 'Lurraren geruzak',
    description: 'Lurraren barneko geruzak eta haien etenak, sakonera, osaera eta tenperaturarekin, eta barrutik ikusteko irekitzen den 3D globo bat.',
    cta: 'Ireki mapa eta sakatu «Planeta» →',
    h2: 'Geruzak, kanpotik barrura',
    capa: 'Geruza',
    como: 'Nolakoa den eta noraino iristen den',
    discontinuidades: 'Geruza bat hurrengotik bereizten duten gainazalak dira.',
    discontinuidad: 'Etena',
    separa: 'Zer bereizten duen',
    zona: 'Eremua',
    que: 'Zer den',
    fuente: 'Sakonerak: USGS, IGN eta PREM eredua. Tenperaturak esperimentuetan eta ereduetan oinarritutako estimazioak dira (Katsura 2022; Anzellini et al. 2013): ikerketa batetik bestera ehunka gradu aldatzen dira.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Atmosferaren geruzak: troposferatik exosferara',
    enlace: 'Atmosferaren geruzak',
    description: 'Atmosferaren bost geruzak, bakoitzaren altuera eta bertan gertatzen dena (eguraldia, ozono-geruza, meteoroak, aurorak), eta haiek ikusteko 3D globo bat.',
    cta: 'Ireki mapa eta sakatu «Planeta» →',
    h2: 'Geruzak, lurretik gora',
    capa: 'Geruza',
    altura: 'Altuera eta bertan zer gertatzen den',
    nota: 'Altuerak gutxi gorabeherakoak dira: mugak aldatu egiten dira latitudearen eta urtaroaren arabera. Iturria: NASA.',
  },
};
