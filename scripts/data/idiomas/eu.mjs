// Euskara. Ver ./index.mjs para qué es cada apartado.
// `zonas` va con el sufijo -ko («Europako herrialdeak»), y por eso las direcciones llevan su propio
// `slug`. Traducción revisada, pero no por un hablante nativo: conviene que alguien la repase.

const SLUG_RETOS = { paises: 'herrialdeak', capitales: 'hiriburuak', banderas: 'banderak' };
const SLUG_ZONAS = { europa: 'europako', asia: 'asiako', africa: 'afrikako', america: 'amerikako', oceania: 'ozeaniako' };

export default {
  locale: 'eu_ES',
  intl: 'eu-ES',
  nombre: 'Euskara',
  ruta: {
    paises: 'herrialdeak-eta-hiriburuak',
    juego: 'jokoa',
    slug: (reto, zona) => `${SLUG_ZONAS[zona]}-${SLUG_RETOS[reto]}`,
  },
  zonas: { europa: 'Europako', asia: 'Asiako', africa: 'Afrikako', america: 'Amerikako', oceania: 'Ozeaniako' },
  retos: { paises: 'Herrialdeak', capitales: 'Hiriburuak', banderas: 'Banderak' },
  pie: {
    creditos: 'Kartografia: Natural Earth · Banderak: flag-icons (MIT) · Herrialdeen datuak: mledoze/countries (ODbL).',
    info: 'Informazioa',
    mapa: 'Mapa interaktiboa',
    paises: 'Herrialdeak eta hiriburuak',
    donar: 'Dohaintza egin',
    avisoLegal: 'Lege-oharra',
    privacidad: 'Pribatutasuna',
    cookies: 'Cookieak',
    configurar: 'Cookieak konfiguratu',
    error: 'Akats baten berri eman',
    idiomas: 'Hizkuntzak',
  },
  paises: {
    title: (n) => `Munduko herrialdeak eta haien hiriburuak: ${n} herrialdeen zerrenda · Study World Map`,
    ogTitle: 'Munduko herrialdeak eta haien hiriburuak',
    description: (n) =>
      `Munduko ${n} herrialdeen eta haien hiriburuen zerrenda osoa, kontinenteka, bandera eta azalerarekin. Praktikatu doan mapa interaktibo batean.`,
    h1: 'Munduko herrialdeak eta haien hiriburuak',
    lead: (n) =>
      `Munduko ${n} herrialdeak kontinenteka ordenatuta, hiriburuarekin, banderarekin eta azalerarekin. Ikasi nahi dituzunean, praktikatu mapa interaktiboarekin: huts egiten duzuna gehiagotan galdetzen dizu, ikasi arte.`,
    cta: 'Praktikatu mapa interaktiboan →',
    juegos: 'Jokoak kontinenteka:',
    juegosAria: 'Jokoak kontinenteka',
    lista: 'Zerrenda kontinenteka:',
    listaAria: 'Kontinenteak',
    cuenta: (n) => `${n} herrialde`,
    pais: 'Herrialdea',
    capital: 'Hiriburua',
    superficie: 'Azalera',
    faqTitulo: 'Ohiko galderak',
    faq: [
      [
        'Zenbat herrialde daude munduan?',
        'Study World Mapek 197 herrialde ditu: NBEko 193 kideak, bi estatu behatzaileak (Vatikano Hiria eta Palestina), Taiwan eta Kosovo. Beste lurralde batzuk, hala nola Groenlandia edo Puerto Rico, mapan agertzen dira, baina ez dira galdetzen.',
      ],
      [
        'Zein herrialdek dute hiriburu bat baino gehiago?',
        'Batzuek hirien artean banatzen dituzte eginkizunak: Bolivia (Sucre da hiriburu konstituzionala eta La Paz gobernuaren egoitza), Hegoafrika, Herbehereak edo Sri Lanka. Jokoan, erantzuna idaztean, haietako edozein onartzen da.',
      ],
      [
        'Nola ikasi munduko herrialdeak eta hiriburuak?',
        'Errepaso tartekatuarekin praktikatuz: Study World Mapek gehiagotan galdetzen ditu huts egiten dituzun herrialdeak, hutsegitea hiru galdera geroago errepikatzen du eta, partiden artean, herrialde bakoitzaren jarraipena egiten du Leitner kutxen sistemarekin, menderatzen duzun arte.',
      ],
      [
        'Study World Map doakoa da? Erregistratu behar da?',
        'Doakoa da, iragarkirik eta konturik gabe. Aurrerapena zure gailuan gordetzen da, eta aplikazioak konexiorik gabe funtzionatzen du lehen bisitaren ondoren.',
      ],
      [
        'Zer geografia-joko ditu?',
        'Bost erronka: herrialdeak mapan kokatzea, zein kontinentetan dauden esatea, markatutako herrialdea izendatzea, hiriburuak eta banderak. Mundu osoarekin, kontinenteka edo zeure herrialde-zerrenda batekin joka daiteke; zerrenda esteka baten bidez parteka daiteke.',
      ],
    ],
  },
  juego: {
    enlace: (reto, zona) => `${zona} ${reto.toLowerCase()}`,
    h1: (reto, zona) => `${zona} ${reto.toLowerCase()}: jokoa mapan`,
    jugar: (reto, zona) => `Jokatu: ${zona} ${reto.toLowerCase()} →`,
    gratis: 'Doan, erregistrorik eta iragarkirik gabe. Zure aurrerapena zure gailuan gordetzen da.',
    intro: {
      paises: (n, zona) =>
        `${zona} herrialde baten izena ematen dizugu, eta mapan aurkitu behar duzu. Huts egiten baduzu, zein herrialde ukitu duzun esaten dizugu eta geroago berriro galdetzen dizugu, ${n} herrialdeak ikasi arte.`,
      capitales: (n, zona) =>
        `Lotu ${zona} ${n} herrialdeetako bakoitza bere hiriburuarekin: aukerekin, herrialdea mapan bilatuz edo erantzuna idatziz. Huts egiten dituzun hiriburuak berriro ateratzen dira, ikasi arte.`,
      banderas: (n, zona) =>
        `Ezagutu ${zona} ${n} banderak: bandera bat erakusten dizugu, eta haren herrialdea ukitzen duzu mapan edo aukeren artean hautatzen duzu. Huts egiten dituzunak maizago errepikatzen dira.`,
    },
    h2: {
      paises: (n, zona) => `${zona} ${n} herrialdeak`,
      capitales: (n, zona) => `${zona} ${n} herrialdeen hiriburuak`,
      banderas: (n, zona) => `${zona} ${n} banderak`,
    },
    limita: 'Mugakideak',
    sinFronteras: 'Lehorreko mugarik gabe',
    masGrande: (zona, pais, area) => `${zona} herrialderik handiena <strong>${pais}</strong> da (${area})`,
    masPequeno: (pais, area) => `, eta txikiena, <strong>${pais}</strong> (${area})`,
    islas: (k, n) => `Beste inorekin lehorreko mugarik ez duten herrialdeak: ${k} (${n} herrialdeetatik).`,
    banderaDe: (pais) => `Bandera: ${pais}`,
    sigue: 'Jarraitu praktikatzen',
    otrosRetos: (zona) => `${zona} beste erronka batzuk`,
    otrasZonas: (reto) => `Beste kontinenteetako ${reto.toLowerCase()}`,
    todos: 'Munduko herrialde guztiak eta haien hiriburuak',
    titulos: {
      paises: (n, zona) => [
        `${zona} herrialdeak: mapan ikasteko jokoa`,
        `Ikasi ${zona} ${n} herrialdeak jolastuz: aurkitu mapan, haien mugekin eta azalerarekin. Doan eta erregistrorik gabe.`,
      ],
      capitales: (n, zona) => [
        `${zona} hiriburuak: zerrenda eta ikasteko jokoa`,
        `${zona} ${n} herrialdeen hiriburuak zerrenda batean eta huts egiten dituzunak errepikatzen dituen mapa-joko batean. Doan eta erregistrorik gabe.`,
      ],
      banderas: (n, zona) => [
        `${zona} banderak: ${n} banderak eta joko bat`,
        `${zona} ${n} banderak herrialde bakoitzaren izenarekin, eta mapan ezagutzeko joko bat. Doan eta erregistrorik gabe.`,
      ],
    },
  },
  y: ' eta ',
  nombres: {
    regiones: {
      europa: 'Europa',
      asia: 'Asia',
      africa: 'Afrika',
      'am-norte': 'Ipar Amerika',
      'am-central': 'Erdialdeko Amerika',
      'am-caribe': 'Karibea',
      'am-sur': 'Hego Amerika',
      oceania: 'Ozeania',
    },
    continentes: {
      europa: 'Europa',
      asia: 'Asia',
      africa: 'Afrika',
      america: 'Amerika',
      oceania: 'Ozeania',
      'europa-asia': 'Europa eta Asia',
    },
    paises: {
      // ── Europa ──
      BIH: { alias: ['Bosnia', 'Bosnia eta Herzegovina'] },
      CZE: { alias: ['Txekiar Errepublika'] },
      GBR: { alias: ['Britainia Handia', 'Ingalaterra'] },
      MKD: { alias: ['Mazedonia'] },
      MLT: { capital: 'Valletta', capAlias: ['Valleta', 'La Valletta'] },
      NLD: { alias: ['Holanda'], nota: 'Amsterdam da hiriburua, baina gobernua eta parlamentua Hagan daude.' },
      RUS: { capAlias: ['Moskua'], nota: 'Munduko herrialderik handiena da, eta Europaren eta Asiaren artean banatuta dago.' },
      UKR: { capAlias: ['Kyiv'] },
      VAT: { alias: ['Vatikanoa', 'Egoitza Santua'], nota: 'Munduko herrialderik txikiena da: Erroma hiriaren barruan dago.' },
      XKX: {
        capital: 'Pristina',
        capAlias: ['Prishtina'],
        nota: 'Serbiarekiko independentzia 2008an aldarrikatu zuen. Munduko herrialdeen erdiak, gutxi gorabehera, aitortzen du; Espainiak ez.',
      },
      CYP: { nota: 'Geografikoki Asian dago, baina Europar Batasuneko kidea da.' },
      // ── Asia ──
      ARE: { alias: ['Emirerri Arabiar Batuak', 'Emirerriak'] },
      CHN: { capAlias: ['Beijing'] },
      IDN: { nota: 'Hiriburu berri bat eraikitzen ari da, Nusantara, Borneo uhartean; oraingoz, Jakarta da hiriburua.' },
      IND: { capital: 'New Delhi', capAlias: ['Delhi Berria'] },
      ISR: { nota: 'Israelek Jerusalem du hiriburutzat; herrialde gehienek Tel Aviven dituzte enbaxadak.' },
      KOR: { alias: ['Korea'] },
      MMR: { nombre: 'Myanmar', alias: ['Birmania'], capAlias: ['Nay Pyi Taw'] },
      MYS: { nota: 'Kuala Lumpur da hiriburua; gobernuaren egoitza administratiboa Putrajayan dago.' },
      PSE: {
        nombre: 'Palestina',
        alias: ['Palestinako Estatua'],
        capAlias: ['Ramala'],
        nota: 'NBEko estatu behatzailea. Ekialdeko Jerusalem aldarrikatzen du hiriburutzat; gobernuak Ramallahn du egoitza.',
      },
      SGP: { nota: 'Hiri-estatua da: herrialdea eta hiriburua gauza bera dira.' },
      LKA: {
        capital: 'Sri Jayewardenepura Kotte',
        capAlias: ['Kotte', 'Colombo', 'Sri Jayawardenapura Kotte'],
        nota: 'Hiriburu ofiziala Sri Jayewardenepura Kotte da; Colombo da hiririk handiena eta hiriburu ekonomikoa.',
      },
      TLS: { alias: ['Timor-Leste'] },
      TUR: { nota: 'Asiaren eta Europaren artean banatuta dago. Hiririk handiena, Istanbul, ez da hiriburua.' },
      TWN: {
        nota: 'Gobernu propioa du, baina Txinak bere lurraldearen zatitzat du, eta oso herrialde gutxik aitortzen dute ofizialki estatu gisa.',
      },
      // ── África ──
      BEN: { capAlias: ['Porto-Novo', 'Cotonou'], nota: 'Porto Novo da hiriburu ofiziala; gobernuak Cotonoun du egoitza.' },
      BDI: { capAlias: ['Bujumbura'], nota: 'Gitega da hiriburu politikoa 2019tik; Bujumbura da oraindik hiriburu ekonomikoa.' },
      CIV: { alias: ['Côte d’Ivoire'], capAlias: ['Yamoussoukro', 'Abidjan'], nota: 'Jamusukro da hiriburu ofiziala; Abidjan da hiririk handiena eta hiriburu ekonomikoa.' },
      COD: { alias: ['Kongoko ED', 'Kongo-Kinshasa'] },
      COG: { nombre: 'Kongoko Errepublika', alias: ['Kongo', 'Kongo-Brazzaville'] },
      GNQ: {
        capAlias: ['Malabo'],
        capNota: '2026ra arte, Malabo',
        nota: '2026ko urtarrilean Ciudad de la Paz, kontinentean, izendatu zuen ofizialki hiriburu, Malaboren ordez (Bioko uhartean); lekualdaketa pixkanaka egiten ari da. Liburu askok Malabo diote oraindik.',
      },
      SOM: { capital: 'Mogadixu', capAlias: ['Muqdisho', 'Mogadiscio'] },
      SSD: { nota: 'Munduko herrialderik gazteena da: 2011n lortu zuen Sudanekiko independentzia.' },
      SWZ: { nombre: 'Eswatini', alias: ['Swazilandia'], capAlias: ['Lobamba'], nota: '2018ra arte Swazilandia zuen izena. Mbabane da hiriburu administratiboa, eta Lobamba, legegilea.' },
      TCD: { capAlias: ['Ndjamena'] },
      TZA: { capAlias: ['Dar es Salaam'], nota: 'Dodoma da hiriburu ofiziala; Dar es Salaam da hiririk handiena.' },
      ZAF: {
        capAlias: ['Lurmutur Hiria', 'Bloemfontein'],
        nota: 'Hiru hiriburu ditu: Pretoria (betearazlea), Lurmutur Hiria (legegilea) eta Bloemfontein (judiziala).',
      },
      // ── América ──
      USA: { alias: ['Estatu Batuak', 'AEB', 'Amerika'], capAlias: ['Washington DC'] },
      ATG: { capital: 'Saint John’s', capAlias: ['St. John’s'] },
      BOL: {
        capAlias: ['La Paz'],
        capNota: 'gobernuaren egoitza: La Paz',
        nota: 'Sucre da hiriburu konstituzionala; gobernuak eta parlamentuak La Pazen dute egoitza.',
      },
      CUB: { capAlias: ['La Habana'] },
      TTO: { capital: 'Port of Spain', capAlias: ['Port-of-Spain'] },
      // ── Oceanía ──
      KIR: { capital: 'Hego Tarawa', capAlias: ['Tarawa'] },
      NRU: { capital: 'Yaren', nota: 'Ez du hiriburu ofizialik: gobernua Yaren barrutian biltzen da.' },
      TON: { capital: 'Nukuʻalofa', capAlias: ['Nukualofa'] },
      // ── Territorios ──
      HKG: { nombre: 'Hong Kong' },
      MAC: { nombre: 'Macau' },
      FLK: { nombre: 'Malvinak', nota: 'Britainiar lurraldea, Argentinak aldarrikatua.' },
      ATA: { nota: 'Herrialderik gabeko kontinentea: Antartikako Itunak arautzen du.' },
      ESH: { nota: 'NBEren arabera, deskolonizatzeko dagoen lurraldea.' },
      XSG: { nombre: 'Siachen glaziarra', nota: 'Kaxmirreko eremua, Indiak eta Pakistanek biek aldarrikatua.' },
    },
  },
  index: [
    'Study World Map: geografia ikasteko mapa interaktiboa',
    '3D globoa eta mapa interaktiboa: herrialdeak, hiriburuak, banderak, Espainiako probintziak, ibaiak, mendiak eta klimak. Doan, erregistro eta iragarkirik gabe.',
    'Study World Map · Ikasi munduko herrialdeak jolastuz',
    '3D globo eta mapa lau interaktiboak, herrialdeak, hiriburuak eta banderak ikasteko.',
    'Herrialdeak koloreztatuta dituen lur-globoa, Study World Mapen erronken panelaren ondoan',
    'Geografia ikasteko mapa interaktiboa (3D globoa eta mapa laua): munduko 197 herrialdeak, haien hiriburu eta banderekin, Espainiako probintziak, ibaiak, mendiak, itsasoak, klimak eta biztanleria, erronkekin eta errepaso tartekatuarekin.',
    'Nabigatzaile moderno bat duen edonor',
    'Praktika eta errepasoa',
    'Hezkuntza-jokoa',
    '["Geografia", "Munduko herrialdeak", "Munduko hiriburuak", "Munduko banderak"]',
    'Study World Map: ikasi geografia mapan jolastuz',
    `Geografia ikasteko mapa interaktiboa: munduko 197 herrialdeak, haien hiriburu eta banderekin,
          Espainiako probintziak, ikasgaietako ibaiak, mendiak eta itsasoak, klimak eta biztanleria. Mapa lau
          bihurtzen den 3D globo bat, berehala zuzentzen diren erronkak eta oraindik ez dakizuna behin eta berriz
          galdetzen dizun errepasoa. Doan, iragarkirik eta erregistrorik gabe, eta euskaraz.`,
    'Geografia-erronkak',
    '<strong>Kokatu:</strong> herrialde baten izena ematen dizugu, eta mapan bilatzen duzu.',
    '<strong>Kontinenteak:</strong> herrialde bakoitza zein kontinentetan dagoen esaten duzu.',
    '<strong>Izendatu:</strong> herrialde bat markatzen dugu mapan, eta zein den esaten duzu.',
    '<strong>Hiriburuak:</strong> herrialde bakoitza bere hiriburuarekin lotzen duzu.',
    '<strong>Banderak:</strong> bandera bakoitza zein herrialdetakoa den antzematen duzu.',
    'Nola laguntzen duen ikasten',
    'Huts egiten duzun bakoitzean, zein herrialde ukitu duzun esaten dizu, eta zenbait saiakeraren ondoren erantzuna erakusten da.',
    'Huts egiten duzuna hiru galdera geroago galdetzen da berriro, eta partiden artean herrialde bakoitzak errepaso tartekatua du (Leitner kutxak).',
    'Mundu osoarekin, kontinenteka edo zeure herrialde-zerrenda batekin joka daiteke, esteka baten bidez partekatuta: azterketa bat prestatzeko aproposa.',
    'Mugikorrean dabil, instala daiteke eta, lehen bisitaren ondoren, konexiorik gabe ere bai.',
    `Zerrenda osoaren bila zabiltza? Ikusi
          <a href="{paises}">munduko herrialdeak eta haien hiriburuak</a>, kontinenteka ordenatuta.`,
    'Mapa interaktiboak eta jokoek JavaScript behar dute.',
  ],
};
