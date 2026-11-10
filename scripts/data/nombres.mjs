// Nombres de países, capitales, regiones y notas en los demás idiomas de la aplicación (el español
// está en ./paises.mjs y es el que manda: aquí no se decide qué países ni qué capitales entran).
//
// De dónde sale cada cosa (scripts/build-atlas.mjs lo junta en public/data/names.<idioma>.json):
//   · país        → la base de nombres de Node (Intl.DisplayNames, CLDR), salvo lo corregido aquí
//   · capital     → ./capitales.wikidata.json (scripts/fetch-capitals.mjs), salvo lo corregido aquí
//   · alias, notas, regiones y continentes → solo aquí
//
// Cada entrada de `paises` puede llevar:
//   nombre    nombre habitual, si el de CLDR no vale       alias     otros nombres aceptados al escribir
//   capital   capital, si la de Wikidata no vale           capAlias  otros nombres aceptados para la capital
//   capNota   aclaración breve junto a la capital          nota      dato de la ficha (o de un territorio)

export const NOMBRES = {
  en: {
    regiones: {
      europa: 'Europe',
      asia: 'Asia',
      africa: 'Africa',
      'am-norte': 'North America',
      'am-central': 'Central America',
      'am-caribe': 'Caribbean',
      'am-sur': 'South America',
      oceania: 'Oceania',
    },
    continentes: {
      europa: 'Europe',
      asia: 'Asia',
      africa: 'Africa',
      america: 'The Americas',
      oceania: 'Oceania',
      'europa-asia': 'Europe and Asia',
    },
    paises: {
      // ── Europa ──
      BIH: { alias: ['Bosnia', 'Bosnia-Herzegovina'] },
      BLR: { alias: ['Byelorussia'] },
      CZE: { alias: ['Czech Republic'] },
      GBR: { alias: ['UK', 'Great Britain', 'Britain', 'England'] },
      MKD: { alias: ['Macedonia'] },
      NLD: { alias: ['Holland', 'The Netherlands'], nota: 'Amsterdam is the capital, but the government and parliament sit in The Hague.' },
      RUS: { nota: 'It is the largest country in the world and spans Europe and Asia.' },
      UKR: { capAlias: ['Kiev'] },
      VAT: { alias: ['Vatican', 'Holy See'], nota: 'It is the smallest country in the world: it lies inside the city of Rome.' },
      XKX: {
        capital: 'Pristina',
        capAlias: ['Prishtina'],
        nota: 'It declared independence from Serbia in 2008. About half of the world’s countries recognise it.',
      },
      CYP: { nota: 'Geographically it is in Asia, but it belongs to the European Union.' },
      // ── Asia ──
      ARE: { alias: ['UAE', 'Emirates'] },
      CHN: { capAlias: ['Peking'] },
      IDN: { nota: 'It is building a new capital, Nusantara, on the island of Borneo; for now the capital is still Jakarta.' },
      ISR: { nota: 'Israel regards Jerusalem as its capital; most countries keep their embassies in Tel Aviv.' },
      KOR: { alias: ['Korea', 'Republic of Korea'] },
      PRK: { alias: ['DPRK'] },
      KWT: { capAlias: ['Kuwait'] },
      MMR: { nombre: 'Myanmar', alias: ['Burma'], capAlias: ['Nay Pyi Taw', 'Naypyitaw'] },
      MNG: { capAlias: ['Ulan Bator'] },
      MYS: { nota: 'Kuala Lumpur is the capital; the administrative seat of government is Putrajaya.' },
      PSE: {
        nombre: 'Palestine',
        alias: ['Palestinian Territories', 'State of Palestine'],
        nota: 'A UN observer state. It claims East Jerusalem as its capital; its government sits in Ramallah.',
      },
      SGP: { nota: 'It is a city-state: the country and the capital are one and the same.' },
      LKA: {
        capital: 'Sri Jayawardenepura Kotte',
        capAlias: ['Kotte', 'Colombo'],
        nota: 'The official capital is Sri Jayawardenepura Kotte; Colombo is the largest city and the commercial capital.',
      },
      TLS: { nombre: 'Timor-Leste', alias: ['East Timor'] },
      TUR: { nombre: 'Turkey', alias: ['Türkiye', 'Turkiye'], nota: 'It spans Asia and Europe. Its largest city, Istanbul, is not the capital.' },
      TWN: {
        nota: 'It has its own government, but China regards it as part of its territory and very few countries officially recognise it as a state.',
      },
      // ── África ──
      BEN: { capAlias: ['Porto Novo'], nota: 'Porto-Novo is the official capital; the government sits in Cotonou.' },
      BDI: { capAlias: ['Bujumbura'], nota: 'Gitega has been the political capital since 2019; Bujumbura is still the economic capital.' },
      CIV: {
        nombre: 'Ivory Coast',
        alias: ['Côte d’Ivoire', 'Cote d Ivoire'],
        capAlias: ['Abidjan'],
        nota: 'Yamoussoukro is the official capital; Abidjan is the largest city and the economic capital.',
      },
      COD: { nombre: 'DR Congo', alias: ['Democratic Republic of the Congo', 'Congo-Kinshasa', 'DRC', 'Congo DR'] },
      COG: { nombre: 'Republic of the Congo', alias: ['Congo', 'Congo-Brazzaville', 'Congo Republic'] },
      CPV: { alias: ['Cabo Verde'] },
      GMB: { alias: ['The Gambia'] },
      GNQ: {
        capAlias: ['Malabo'],
        capNota: 'until 2026, Malabo',
        nota: 'In January 2026 it officially moved its capital from Malabo (on the island of Bioko) to Ciudad de la Paz, on the mainland. Many books still say Malabo.',
      },
      SSD: { nota: 'It is the youngest country in the world: it became independent from Sudan in 2011.' },
      SWZ: { alias: ['Swaziland'], capAlias: ['Lobamba'], nota: 'Until 2018 it was called Swaziland. Mbabane is the administrative capital and Lobamba the legislative one.' },
      TCD: { capAlias: ['Ndjamena'] },
      TZA: { capAlias: ['Dar es Salaam'], nota: 'Dodoma is the official capital; Dar es Salaam is the largest city.' },
      ZAF: {
        capAlias: ['Cape Town', 'Bloemfontein'],
        nota: 'It has three capitals: Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial).',
      },
      // ── América ──
      USA: { alias: ['United States of America', 'USA', 'US', 'America'], capital: 'Washington, D.C.', capAlias: ['Washington', 'Washington DC'] },
      ATG: { capital: 'St. John’s', capAlias: ['Saint John’s', 'St Johns'] },
      BHS: { alias: ['The Bahamas'] },
      BOL: {
        capAlias: ['La Paz'],
        capNota: 'seat of government: La Paz',
        nota: 'Sucre is the constitutional capital; the government and parliament sit in La Paz.',
      },
      GRD: { capAlias: ['Saint George’s', 'St Georges'] },
      KNA: { nombre: 'Saint Kitts and Nevis', alias: ['St. Kitts and Nevis', 'St Kitts and Nevis'] },
      LCA: { nombre: 'Saint Lucia', alias: ['St. Lucia', 'St Lucia'] },
      VCT: { nombre: 'Saint Vincent and the Grenadines', alias: ['St. Vincent and the Grenadines', 'Saint Vincent', 'St Vincent'] },
      // ── Oceanía ──
      FSM: { alias: ['Federated States of Micronesia'] },
      KIR: { capital: 'Tarawa', capAlias: ['South Tarawa'] },
      NRU: { capital: 'Yaren', capAlias: ['Yaren District'], nota: 'It has no official capital: the government meets in the Yaren district.' },
      TON: { capital: 'Nukuʻalofa', capAlias: ['Nukualofa'] },
      // ── Territorios ──
      HKG: { nombre: 'Hong Kong' },
      MAC: { nombre: 'Macao' },
      FLK: { nota: 'British territory claimed by Argentina.' },
      ATA: { nota: 'A continent with no countries: it is governed by the Antarctic Treaty.' },
      ESH: { nota: 'A territory awaiting decolonisation, according to the UN.' },
      XSG: { nombre: 'Siachen Glacier', nota: 'An area of Kashmir disputed between India and Pakistan.' },
    },
  },
};
