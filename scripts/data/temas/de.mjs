// Deutsch: textos de las páginas de temas (scripts/build-pages.mjs). Mismas claves que ./es.mjs.
// Ojo: en alemán los sustantivos van con mayúscula; lo que llegue a `fisico.cta` no debe ir en minúsculas.

export default {
  slug: {
    rios: 'fluesse-und-seen-der-welt',
    montanas: 'gebirge-und-berge-der-welt',
    mares: 'ozeane-meere-und-meerengen',
    tierras: 'wuesten-halbinseln-und-inseln',
    climas: 'klimazonen-der-welt',
    poblacion: 'bevoelkerungsreichste-laender',
    tierra: 'aufbau-der-erde',
    atmosfera: 'schichten-der-atmosphaere',
  },

  comun: {
    juegos: 'Spiele',
    todos: 'Alle Spiele und Themen',
    indiceFisico: 'Physische Geografie, Klima und Bevölkerung',
    indicePlaneta: 'Der Planet',
    recurso: 'Lernspiel',
    nivel: 'Grundschule und Sekundarstufe',
    portada: 'Was du lernen kannst',
    nombre: 'Name',
    altitud: 'Höhe',
    pais: 'Land',
  },

  // ── geografía física ──
  fisico: {
    intro: (n) => `Das sind ${n} Orte, die im Unterricht zur physischen Geografie meist vorkommen. Im Spiel wird häufiger gefragt, was du falsch hattest, bis du es kannst.`,
    cta: (que) => `Spielen: ${que} finden →`,
    fuente: 'Lage und Höhen nach Natural Earth (gemeinfrei), mit geprüften Korrekturen.',
    rios: {
      h1: 'Flüsse und Seen der Welt: Spiel auf der Karte',
      enlace: 'Flüsse und Seen',
      description: 'Die Flüsse und Seen aus dem Unterricht in Grundschule und Sekundarstufe, mit kostenlosem Spiel auf einer interaktiven Reliefkarte. Ohne Anmeldung und Werbung.',
      secciones: { rio: 'Flüsse', lago: 'Seen' },
    },
    montanas: {
      h1: 'Gebirge und Berge der Welt: Spiel auf der Karte',
      enlace: 'Gebirge und Berge',
      description: 'Die Gebirge und Gipfel aus dem Unterricht in Grundschule und Sekundarstufe mit ihrer Höhe, dazu ein kostenloses Spiel auf einer interaktiven Reliefkarte.',
      secciones: { cordillera: 'Gebirge', pico: 'Gipfel' },
    },
    mares: {
      h1: 'Ozeane, Meere und Meerengen: Spiel auf der Karte',
      enlace: 'Ozeane, Meere und Meerengen',
      description: 'Die fünf Ozeane sowie die Meere, Golfe und Meerengen aus dem Geografieunterricht, mit einem kostenlosen Spiel, um sie auf einer interaktiven Karte zu finden.',
      secciones: { oceano: 'Ozeane', mar: 'Meere', golfo: 'Golfe und Buchten', estrecho: 'Meerengen und Kanäle' },
    },
    tierras: {
      h1: 'Wüsten, Ebenen, Halbinseln und Inseln: Spiel auf der Karte',
      enlace: 'Wüsten, Halbinseln und Inseln',
      description: 'Wüsten, Hochebenen, Ebenen, Halbinseln und Inseln aus dem Unterricht zur physischen Geografie, mit einem kostenlosen Spiel auf einer interaktiven Karte.',
      secciones: { desierto: 'Wüsten', llanura: 'Hochebenen und Ebenen', peninsula: 'Halbinseln und Kaps', isla: 'Inseln und Inselgruppen' },
    },
  },

  // ── climas ──
  climas: {
    h1: 'Klimazonen der Welt nach Ländern: Liste und Spiel',
    enlace: 'Klimazonen der Welt',
    description: (n) => `Welches Land hat welches Klima: äquatorial, tropisch, Wüste, mediterran, ozeanisch, kontinental oder polar? Liste mit ${n} Ländern und kostenloses Kartenspiel.`,
    cta: 'Spielen: Welches Klima hat es? →',
    intro: 'Die zehn Klimatypen, die in der Sekundarstufe behandelt werden, nach Zonen geordnet: warme Zone (äquatorial, tropisch, Wüstenklima und Steppenklima), gemäßigte Zone (mediterran, ozeanisch, feucht-subtropisch und kontinental) und kalte Zone (polar und Hochgebirgsklima).',
    h2: 'Klima jedes Landes',
    cuenta: (n) => `${n} Länder`,
    nota: 'Für jedes Land sind die wichtigsten Klimatypen angegeben, geordnet nach ihrem Anteil an der Landesfläche, der größte zuerst.',
    columna: 'Klimatypen',
    fuente: 'Berechnet auf Grundlage der Köppen-Geiger-Weltkarte (Kottek et al., 2006); ihre Typen wurden zu den Klimatypen aus dem Schulunterricht zusammengefasst.',
  },

  // ── población ──
  poblacion: {
    h1: 'Bevölkerungsreichste Länder der Welt: Liste und Spiel',
    enlace: 'Bevölkerungsreichste Länder',
    description: (year) => `Die Länder der Welt nach Einwohnerzahl (${year}) mit ihrer Dichte in Einwohnern pro km², dazu ein kostenloses Spiel: Welches Land hat mehr Einwohner?`,
    cta: 'Spielen: Welches Land hat die meisten Einwohner? →',
    h2: 'Bevölkerung und Dichte jedes Landes',
    cuenta: (n) => `${n} Länder`,
    nota: 'Die Bevölkerungsdichte ist die Zahl der Einwohner pro Quadratkilometer: Sie zeigt, ob ein Land für seine Größe dicht oder dünn besiedelt ist.',
    habitantes: (year) => `Einwohner (${year})`,
    densidad: 'Dichte',
    unidad: 'Einw./km²',
    fuente: 'Bevölkerung: Weltbank (Indikator SP.POP.TOTL), CC BY 4.0. Fläche: mledoze/countries.',
  },

  // ── capas de la Tierra ──
  tierra: {
    h1: 'Aufbau der Erde: Erdkruste, Erdmantel und Erdkern',
    enlace: 'Aufbau der Erde',
    description: 'Die Schichten des Erdinneren und ihre Diskontinuitäten mit Tiefe, Zusammensetzung und Temperatur, dazu ein 3D-Globus, der sich öffnet und das Innere zeigt.',
    cta: 'Karte öffnen und auf „Der Planet“ tippen →',
    h2: 'Die Schichten von außen nach innen',
    capa: 'Schicht',
    como: 'Wie sie ist und wie weit sie reicht',
    discontinuidades: 'Das sind die Grenzflächen, die eine Schicht von der nächsten trennen.',
    discontinuidad: 'Diskontinuität',
    separa: 'Was sie trennt',
    zona: 'Zone',
    que: 'Was sie ist',
    fuente: 'Tiefen: USGS, IGN und das PREM-Modell. Die Temperaturen sind Schätzungen aus Experimenten und Modellen (Katsura 2022; Anzellini et al. 2013): Sie weichen von Studie zu Studie um mehrere hundert Grad ab.',
  },

  // ── capas de la atmósfera ──
  atmosfera: {
    h1: 'Schichten der Atmosphäre: Troposphäre bis Exosphäre',
    enlace: 'Schichten der Atmosphäre',
    description: 'Die fünf Schichten der Atmosphäre mit ihrer Höhe und dem, was dort geschieht (Wetter, Ozonschicht, Meteore, Polarlichter), dazu ein 3D-Globus zum Ansehen.',
    cta: 'Karte öffnen und auf „Der Planet“ tippen →',
    h2: 'Die Schichten vom Boden nach oben',
    capa: 'Schicht',
    altura: 'Höhe und was dort geschieht',
    nota: 'Die Höhen sind Näherungswerte: Die Grenzen ändern sich mit der geografischen Breite und der Jahreszeit. Quelle: NASA.',
  },
};
