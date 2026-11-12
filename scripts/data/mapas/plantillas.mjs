// Textos de las páginas estáticas de los mapas de un país que no los traen escritos a mano (todos
// menos España, ver ./es.mjs). Salen de una plantilla por idioma, que rellena con:
//   · las palabras del tipo de unidad («regiones», «Regiones», «13 regiones»), que se toman del
//     diccionario de la aplicación (src/i18n/<idioma>.ts): no se repiten aquí;
//   · el nombre del país con su preposición («de Francia», «of France», «Frankreichs»), que sí va
//     aquí, país por país, porque en casi todos los idiomas cambia el artículo;
//   · el género de cada tipo de unidad en los idiomas en los que el artículo depende de él.
// Las frases están pensadas para no necesitar más concordancias que esas (en italiano, por ejemplo,
// el artículo no va nunca delante del número: sería «i 50 stati» pero «gli stati»).
//
// Dos páginas por país (sus unidades y sus capitales) y una tercera si las unidades se agrupan en
// regiones (Estados Unidos, Bélgica). Las plantillas las ha escrito un modelo: como el resto de las
// traducciones, están pendientes de revisión por hablantes nativos.

/** Tipos de unidad (src/game/countryMaps.ts): sus palabras en español, que son la clave del diccionario. */
const TIPOS = {
  provincia: ['provincia', 'provincias', 'Provincias'],
  estado: ['estado', 'estados', 'Estados'],
  estadoFederado: ['estado federado', 'estados federados', 'Estados federados'],
  canton: ['cantón', 'cantones', 'Cantones'],
  region: ['región', 'regiones', 'Regiones'],
  condado: ['condado', 'condados', 'Condados'],
  nacion: ['nación', 'naciones', 'Naciones'],
  voivodato: ['voivodato', 'voivodatos', 'Voivodatos'],
  distrito: ['distrito', 'distritos', 'Distritos'],
};
const ORDEN = Object.keys(TIPOS);

/** Artículo determinado plural de cada tipo, en el orden de TIPOS, donde depende del género. */
const ARTICULOS = {
  es: ['las', 'los', 'los', 'los', 'las', 'los', 'las', 'los', 'los'],
  it: ['le', 'gli', 'gli', 'i', 'le', 'le', 'le', 'i', 'i'],
  pt: ['as', 'os', 'os', 'os', 'as', 'os', 'as', 'as', 'os'],
  ca: ['les', 'els', 'els', 'els', 'les', 'els', 'les', 'els', 'els'],
  gl: ['as', 'os', 'os', 'os', 'as', 'os', 'as', 'os', 'os'],
};
/** Donde el término propio de un país cambia de género: «i distretti» de Bulgaria, no «le province». */
const ARTICULOS_PAIS = { it: { bg: 'i' } };
const FEMENINO = new Set(['las', 'le', 'as', 'les']);

/** El país con su preposición, por mapa. En euskera es el genitivo, que va delante; en chino, el nombre. */
const PAISES = {
  es: { es: 'de España', us: 'de Estados Unidos', de: 'de Alemania', at: 'de Austria', ch: 'de Suiza', nl: 'de los Países Bajos', be: 'de Bélgica', fr: 'de Francia', it: 'de Italia', cz: 'de Chequia', sk: 'de Eslovaquia', gr: 'de Grecia', se: 'de Suecia', gb: 'del Reino Unido', pl: 'de Polonia', pt: 'de Portugal', ie: 'de Irlanda', ro: 'de Rumanía', lt: 'de Lituania', hr: 'de Croacia', al: 'de Albania', rs: 'de Serbia', hu: 'de Hungría', tr: 'de Turquía', bg: 'de Bulgaria', by: 'de Bielorrusia', ua: 'de Ucrania', fi: 'de Finlandia', no: 'de Noruega', ee: 'de Estonia', cy: 'de Chipre', md: 'de Moldavia' },
  en: { es: 'of Spain', us: 'of the United States', de: 'of Germany', at: 'of Austria', ch: 'of Switzerland', nl: 'of the Netherlands', be: 'of Belgium', fr: 'of France', it: 'of Italy', cz: 'of Czechia', sk: 'of Slovakia', gr: 'of Greece', se: 'of Sweden', gb: 'of the United Kingdom', pl: 'of Poland', pt: 'of Portugal', ie: 'of Ireland', ro: 'of Romania', lt: 'of Lithuania', hr: 'of Croatia', al: 'of Albania', rs: 'of Serbia', hu: 'of Hungary', tr: 'of Turkey', bg: 'of Bulgaria', by: 'of Belarus', ua: 'of Ukraine', fi: 'of Finland', no: 'of Norway', ee: 'of Estonia', cy: 'of Cyprus', md: 'of Moldova' },
  fr: { es: 'd’Espagne', us: 'des États-Unis', de: 'd’Allemagne', at: 'd’Autriche', ch: 'de Suisse', nl: 'des Pays-Bas', be: 'de Belgique', fr: 'de France', it: 'd’Italie', cz: 'de Tchéquie', sk: 'de Slovaquie', gr: 'de Grèce', se: 'de Suède', gb: 'du Royaume-Uni', pl: 'de Pologne', pt: 'du Portugal', ie: 'd’Irlande', ro: 'de Roumanie', lt: 'de Lituanie', hr: 'de Croatie', al: 'd’Albanie', rs: 'de Serbie', hu: 'de Hongrie', tr: 'de Turquie', bg: 'de Bulgarie', by: 'de Biélorussie', ua: 'd’Ukraine', fi: 'de Finlande', no: 'de Norvège', ee: 'd’Estonie', cy: 'de Chypre', md: 'de Moldavie' },
  de: { es: 'Spaniens', us: 'der USA', de: 'Deutschlands', at: 'Österreichs', ch: 'der Schweiz', nl: 'der Niederlande', be: 'Belgiens', fr: 'Frankreichs', it: 'Italiens', cz: 'Tschechiens', sk: 'der Slowakei', gr: 'Griechenlands', se: 'Schwedens', gb: 'des Vereinigten Königreichs', pl: 'Polens', pt: 'Portugals', ie: 'Irlands', ro: 'Rumäniens', lt: 'Litauens', hr: 'Kroatiens', al: 'Albaniens', rs: 'Serbiens', hu: 'Ungarns', tr: 'der Türkei', bg: 'Bulgariens', by: 'von Belarus', ua: 'der Ukraine', fi: 'Finnlands', no: 'Norwegens', ee: 'Estlands', cy: 'Zyperns', md: 'der Republik Moldau' },
  it: { es: 'della Spagna', us: 'degli Stati Uniti', de: 'della Germania', at: 'dell’Austria', ch: 'della Svizzera', nl: 'dei Paesi Bassi', be: 'del Belgio', fr: 'della Francia', it: 'dell’Italia', cz: 'della Cechia', sk: 'della Slovacchia', gr: 'della Grecia', se: 'della Svezia', gb: 'del Regno Unito', pl: 'della Polonia', pt: 'del Portogallo', ie: 'dell’Irlanda', ro: 'della Romania', lt: 'della Lituania', hr: 'della Croazia', al: 'dell’Albania', rs: 'della Serbia', hu: 'dell’Ungheria', tr: 'della Turchia', bg: 'della Bulgaria', by: 'della Bielorussia', ua: 'dell’Ucraina', fi: 'della Finlandia', no: 'della Norvegia', ee: 'dell’Estonia', cy: 'di Cipro', md: 'della Moldavia' },
  pt: { es: 'da Espanha', us: 'dos Estados Unidos', de: 'da Alemanha', at: 'da Áustria', ch: 'da Suíça', nl: 'dos Países Baixos', be: 'da Bélgica', fr: 'da França', it: 'da Itália', cz: 'da Tchéquia', sk: 'da Eslováquia', gr: 'da Grécia', se: 'da Suécia', gb: 'do Reino Unido', pl: 'da Polônia', pt: 'de Portugal', ie: 'da Irlanda', ro: 'da Romênia', lt: 'da Lituânia', hr: 'da Croácia', al: 'da Albânia', rs: 'da Sérvia', hu: 'da Hungria', tr: 'da Turquia', bg: 'da Bulgária', by: 'da Bielorrússia', ua: 'da Ucrânia', fi: 'da Finlândia', no: 'da Noruega', ee: 'da Estônia', cy: 'do Chipre', md: 'da Moldávia' },
  ca: { es: 'd’Espanya', us: 'dels Estats Units', de: 'd’Alemanya', at: 'd’Àustria', ch: 'de Suïssa', nl: 'dels Països Baixos', be: 'de Bèlgica', fr: 'de França', it: 'd’Itàlia', cz: 'de Txèquia', sk: 'd’Eslovàquia', gr: 'de Grècia', se: 'de Suècia', gb: 'del Regne Unit', pl: 'de Polònia', pt: 'de Portugal', ie: 'd’Irlanda', ro: 'de Romania', lt: 'de Lituània', hr: 'de Croàcia', al: 'd’Albània', rs: 'de Sèrbia', hu: 'd’Hongria', tr: 'de Turquia', bg: 'de Bulgària', by: 'de Belarús', ua: 'd’Ucraïna', fi: 'de Finlàndia', no: 'de Noruega', ee: 'd’Estònia', cy: 'de Xipre', md: 'de Moldàvia' },
  gl: { es: 'de España', us: 'dos Estados Unidos', de: 'de Alemaña', at: 'de Austria', ch: 'de Suíza', nl: 'dos Países Baixos', be: 'de Bélxica', fr: 'de Francia', it: 'de Italia', cz: 'de Chequia', sk: 'de Eslovaquia', gr: 'de Grecia', se: 'de Suecia', gb: 'do Reino Unido', pl: 'de Polonia', pt: 'de Portugal', ie: 'de Irlanda', ro: 'de Romanía', lt: 'de Lituania', hr: 'de Croacia', al: 'de Albania', rs: 'de Serbia', hu: 'de Hungría', tr: 'de Turquía', bg: 'de Bulgaria', by: 'de Belarús', ua: 'de Ucraína', fi: 'de Finlandia', no: 'de Noruega', ee: 'de Estonia', cy: 'de Chipre', md: 'de Moldavia' },
  eu: { es: 'Espainiako', us: 'Estatu Batuetako', de: 'Alemaniako', at: 'Austriako', ch: 'Suitzako', nl: 'Herbehereetako', be: 'Belgikako', fr: 'Frantziako', it: 'Italiako', cz: 'Txekiako', sk: 'Eslovakiako', gr: 'Greziako', se: 'Suediako', gb: 'Erresuma Batuko', pl: 'Poloniako', pt: 'Portugalgo', ie: 'Irlandako', ro: 'Errumaniako', lt: 'Lituaniako', hr: 'Kroaziako', al: 'Albaniako', rs: 'Serbiako', hu: 'Hungariako', tr: 'Turkiako', bg: 'Bulgariako', by: 'Bielorrusiako', ua: 'Ukrainako', fi: 'Finlandiako', no: 'Norvegiako', ee: 'Estoniako', cy: 'Zipreko', md: 'Moldaviako' },
  zh: { es: '西班牙', us: '美国', de: '德国', at: '奥地利', ch: '瑞士', nl: '荷兰', be: '比利时', fr: '法国', it: '意大利', cz: '捷克', sk: '斯洛伐克', gr: '希腊', se: '瑞典', gb: '英国', pl: '波兰', pt: '葡萄牙', ie: '爱尔兰', ro: '罗马尼亚', lt: '立陶宛', hr: '克罗地亚', al: '阿尔巴尼亚', rs: '塞尔维亚', hu: '匈牙利', tr: '土耳其', bg: '保加利亚', by: '白俄罗斯', ua: '乌克兰', fi: '芬兰', no: '挪威', ee: '爱沙尼亚', cy: '塞浦路斯', md: '摩尔多瓦' },
};

/** «Capital» como cabecera de columna. */
const CAPITAL = { es: 'Capital', en: 'Capital', fr: 'Capitale', de: 'Hauptstadt', it: 'Capoluogo', pt: 'Capital', ca: 'Capital', gl: 'Capital', eu: 'Hiriburua', zh: '首府' };

// v: P «Regiones» · p «regiones» · s «región» · cuenta «13 regiones» · de «de Francia» · art «las» ·
// fem · G «Regiones» · g «región» (la agrupación). Cada plantilla devuelve [unidades, capitales,
// agrupación], y cada página, [título, descripción, botón, encabezado de la tabla].
const PLANTILLAS = {
  es: (v) => [
    [`${v.P} ${v.de}: juego en el mapa`, `Aprende ${v.art} ${v.cuenta} ${v.de} con un juego sobre el mapa, que repite lo que fallas hasta que te lo sabes. Gratis y sin registro.`, `Jugar: ${v.p} ${v.de} →`, 'Lista completa'],
    [`${v.P} ${v.de} y sus capitales: lista y juego`, `Las capitales de ${v.art} ${v.cuenta} ${v.de}, en una lista y en un juego sobre el mapa que repite las que fallas. Gratis y sin registro.`, `Jugar: capitales ${v.de} →`, `Capital de cada ${v.s}`],
    [`${v.G} ${v.de} y sus ${v.p}: lista y juego`, `A qué ${v.g} pertenece cada ${v.s} ${v.de}: la lista completa y un juego para aprenderlo. Gratis y sin registro.`, `Jugar: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} y sus ${v.p}`],
  ],
  en: (v) => [
    [`${v.P} ${v.de}: map game`, `Learn the ${v.cuenta} ${v.de} with a map game that repeats the ones you miss until you know them. Free, no sign-up.`, `Play: ${v.p} ${v.de} →`, 'Full list'],
    [`${v.P} ${v.de} and their capitals: list and game`, `The capitals of the ${v.cuenta} ${v.de}, in a list and in a map game that repeats the ones you miss. Free, no sign-up.`, `Play: capitals ${v.de} →`, `Capital of each ${v.s}`],
    [`${v.G} ${v.de} and their ${v.p}: list and game`, `Which ${v.g} each ${v.s} ${v.de} belongs to: the full list and a game to learn it. Free, no sign-up.`, `Play: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} and their ${v.p}`],
  ],
  fr: (v) => [
    [`${v.P} ${v.de} : jeu sur la carte`, `Apprenez les ${v.cuenta} ${v.de} avec un jeu sur la carte, qui répète ce que vous ratez jusqu’à ce que vous le sachiez. Gratuit et sans inscription.`, `Jouer : ${v.p} ${v.de} →`, 'Liste complète'],
    [`${v.P} ${v.de} et leurs capitales : liste et jeu`, `Les capitales des ${v.cuenta} ${v.de}, dans une liste et dans un jeu sur la carte qui répète celles que vous ratez. Gratuit et sans inscription.`, `Jouer : capitales ${v.de} →`, 'Les capitales'],
    [`${v.G} ${v.de} et leurs ${v.p} : liste et jeu`, `À quelle ${v.g} appartiennent les ${v.p} ${v.de} : la liste complète et un jeu pour l’apprendre. Gratuit et sans inscription.`, `Jouer : ${v.G.toLowerCase()} ${v.de} →`, `${v.G} et leurs ${v.p}`],
  ],
  de: (v) => [
    [`${v.P} ${v.de}: Kartenspiel`, `Lerne die ${v.cuenta} ${v.de} mit einem Kartenspiel, das wiederholt, was du nicht weißt, bis es sitzt. Kostenlos und ohne Anmeldung.`, `Spielen: ${v.p} ${v.de} →`, 'Vollständige Liste'],
    [`${v.P} ${v.de} und ihre Hauptstädte: Liste und Spiel`, `Die Hauptstädte der ${v.cuenta} ${v.de}, als Liste und in einem Kartenspiel, das wiederholt, was du nicht weißt. Kostenlos und ohne Anmeldung.`, `Spielen: Hauptstädte ${v.de} →`, 'Die Hauptstädte'],
    [`${v.G} ${v.de} und ihre ${v.p}: Liste und Spiel`, `Welche ${v.p} ${v.de} zu welcher ${v.g} gehören: die vollständige Liste und ein Spiel dazu. Kostenlos und ohne Anmeldung.`, `Spielen: ${v.G} ${v.de} →`, `${v.G} und ihre ${v.p}`],
  ],
  it: (v) => [
    [`${v.P} ${v.de}: gioco sulla mappa`, `Impara ${v.art} ${v.p} ${v.de} (${v.n} in tutto) con un gioco sulla mappa, che ripete ciò che sbagli finché non lo sai. Gratis e senza registrazione.`, `Gioca: ${v.p} ${v.de} →`, 'Elenco completo'],
    [`${v.P} ${v.de} e i loro capoluoghi: elenco e gioco`, `${v.Art} ${v.p} ${v.de} (${v.n} in tutto) con il loro capoluogo, in un elenco e in un gioco sulla mappa che ripete quelli che sbagli. Gratis e senza registrazione.`, `Gioca: capoluoghi ${v.de} →`, 'I capoluoghi'],
    [`${v.G} ${v.de} e ${v.fem ? 'le' : 'i'} loro ${v.p}: elenco e gioco`, `A quale ${v.g} appartiene ogni ${v.s} ${v.de}: l’elenco completo e un gioco per impararlo. Gratis e senza registrazione.`, `Gioca: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} e ${v.fem ? 'le' : 'i'} loro ${v.p}`],
  ],
  pt: (v) => [
    [`${v.P} ${v.de}: jogo no mapa`, `Aprenda ${v.art} ${v.cuenta} ${v.de} com um jogo no mapa, que repete o que você erra até saber. Grátis e sem cadastro.`, `Jogar: ${v.p} ${v.de} →`, 'Lista completa'],
    [`${v.P} ${v.de} e suas capitais: lista e jogo`, `As capitais d${v.art} ${v.cuenta} ${v.de}, em uma lista e em um jogo no mapa que repete as que você erra. Grátis e sem cadastro.`, `Jogar: capitais ${v.de} →`, `Capital de cada ${v.s}`],
    [`${v.G} ${v.de} e ${v.fem ? 'suas' : 'seus'} ${v.p}: lista e jogo`, `A que ${v.g} pertence cada ${v.s} ${v.de}: a lista completa e um jogo para aprender. Grátis e sem cadastro.`, `Jogar: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} e ${v.fem ? 'suas' : 'seus'} ${v.p}`],
  ],
  ca: (v) => [
    [`${v.P} ${v.de}: joc en el mapa`, `Aprén ${v.art} ${v.cuenta} ${v.de} amb un joc sobre el mapa, que repetix el que falles fins que t’ho saps. Gratis i sense registre.`, `Jugar: ${v.p} ${v.de} →`, 'Llista completa'],
    [`${v.P} ${v.de} i les seues capitals: llista i joc`, `Les capitals ${v.fem ? 'de les' : 'dels'} ${v.cuenta} ${v.de}, en una llista i en un joc sobre el mapa que repetix les que falles. Gratis i sense registre.`, `Jugar: capitals ${v.de} →`, `Capital de cada ${v.s}`],
    [`${v.G} ${v.de} i ${v.fem ? 'les seues' : 'els seus'} ${v.p}: llista i joc`, `A quina ${v.g} pertany cada ${v.s} ${v.de}: la llista completa i un joc per a aprendre-ho. Gratis i sense registre.`, `Jugar: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} i ${v.fem ? 'les seues' : 'els seus'} ${v.p}`],
  ],
  gl: (v) => [
    [`${v.P} ${v.de}: xogo no mapa`, `Aprende ${v.art} ${v.cuenta} ${v.de} cun xogo sobre o mapa, que repite o que fallas ata que o sabes. Gratis e sen rexistro.`, `Xogar: ${v.p} ${v.de} →`, 'Lista completa'],
    [`${v.P} ${v.de} e as súas capitais: lista e xogo`, `As capitais d${v.art} ${v.cuenta} ${v.de}, nunha lista e nun xogo sobre o mapa que repite as que fallas. Gratis e sen rexistro.`, `Xogar: capitais ${v.de} →`, `Capital de cada ${v.s}`],
    [`${v.G} ${v.de} e ${v.fem ? 'as súas' : 'os seus'} ${v.p}: lista e xogo`, `A que ${v.g} pertence cada ${v.s} ${v.de}: a lista completa e un xogo para aprendelo. Gratis e sen rexistro.`, `Xogar: ${v.G.toLowerCase()} ${v.de} →`, `${v.G} e ${v.fem ? 'as súas' : 'os seus'} ${v.p}`],
  ],
  // En euskera el país va delante, en genitivo, y las unidades en plural determinado («eskualdeak»).
  eu: (v) => [
    [`${v.de} ${v.p}: mapako jokoa`, `Ikasi ${v.de} ${v.p} (${v.cuenta}) mapako joko batekin: huts egiten duzuna errepikatzen du, ikasi arte. Doan eta erregistratu gabe.`, `Jolastu: ${v.de} ${v.p} →`, 'Zerrenda osoa'],
    [`${v.de} ${v.p} eta haien hiriburuak: zerrenda eta jokoa`, `${v.de} ${v.p} (${v.cuenta}) eta haien hiriburuak, zerrenda batean eta huts egiten dituzunak errepikatzen dituen mapako joko batean. Doan eta erregistratu gabe.`, `Jolastu: ${v.de} hiriburuak →`, 'Hiriburuak'],
    [`${v.de} ${v.G.toLowerCase()} eta haien ${v.p}: zerrenda eta jokoa`, `${v.de} ${v.p} zein eskualdetakoak diren: zerrenda osoa eta ikasteko joko bat. Doan eta erregistratu gabe.`, `Jolastu: ${v.de} ${v.G.toLowerCase()} →`, `${v.G} eta haien ${v.p}`],
  ],
  // En chino no hay artículos ni preposición: el país va delante.
  zh: (v) => [
    [`${v.de}的${v.P}：地图游戏`, `通过地图游戏学习${v.de}的${v.cuenta}：答错的会重复出现，直到学会。免费，无需注册。`, `开始游戏：${v.de}的${v.P} →`, '完整列表'],
    [`${v.de}的${v.P}及其首府：列表与游戏`, `${v.de}${v.cuenta}的首府列表，以及一个会重复你答错内容的地图游戏。免费，无需注册。`, `开始游戏：${v.de}首府 →`, '首府一览'],
    [`${v.de}的${v.G}及其${v.P}：列表与游戏`, `${v.de}的${v.P}分别属于哪个${v.G}：完整列表和一个帮助记忆的游戏。免费，无需注册。`, `开始游戏：${v.de}的${v.G} →`, `${v.G}及其${v.P}`],
  ],
};

/** «Regiones de Francia» → «regiones-de-francia». */
const slug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Los textos de las páginas de un mapa en un idioma, con la misma forma que los escritos a mano
 * (ver ./es.mjs): `columnas` y, por página, `slug`, `h1`, `description`, `cta` y `h2`.
 * @param {string} id        el del mapa
 * @param {string} tipo      tipo de sus unidades (src/game/countryMaps.ts)
 * @param {string | undefined} contexto  el del país, si sus unidades tienen traducción propia
 * @param {boolean} agrupado si lleva la página de la agrupación
 * @param {number} n         cuántas unidades se preguntan
 * @param {string} idioma
 * @param {Record<string, string>} diccionarios  los de la aplicación, por idioma (sin el español)
 */
export function textosDe(id, tipo, contexto, agrupado, n, idioma, diccionarios) {
  const frases = (lang) => {
    const dic = diccionarios[lang];
    const [singular, plural, Plural] = TIPOS[tipo];
    const tr = (texto, ctx = contexto) => {
      if (lang === 'es') return texto;
      const propio = (ctx && dic[`${texto}|${ctx}`]) ?? dic[texto];
      if (!propio) throw new Error(`plantillas: a src/i18n/${lang}.ts le falta «${texto}».`);
      return propio;
    };
    const art = ARTICULOS_PAIS[lang]?.[contexto] ?? ARTICULOS[lang]?.[ORDEN.indexOf(tipo)] ?? '';
    const P = tr(Plural);
    const v = {
      P,
      // En euskera y en chino el plural suelto del diccionario es el que va detrás de un número.
      p: lang === 'eu' ? P.toLowerCase() : lang === 'zh' ? P : tr(plural),
      s: lang === 'zh' ? P : tr(singular),
      cuenta: tr(`{n} ${plural}`).replace('{n}', String(n)),
      de: PAISES[lang][id],
      art,
      Art: art.charAt(0).toUpperCase() + art.slice(1),
      fem: FEMENINO.has(art),
      n,
      G: tr('Regiones', undefined),
      g: lang === 'zh' ? tr('Regiones', undefined) : tr('región', undefined),
    };
    if (!v.de) throw new Error(`plantillas: falta el país «${id}» en «${lang}».`);
    return { v, paginas: PLANTILLAS[lang](v) };
  };
  const { v, paginas } = frases(idioma);
  // Las direcciones de las páginas en chino van en inglés, como las del resto del sitio.
  const paraSlug = idioma === 'zh' ? frases('en').paginas : paginas;
  const pagina = (i) => {
    const [h1, description, cta, h2] = paginas[i];
    return { slug: slug(paraSlug[i][0].split(/\s*[:：]/)[0]), h1, description, cta, h2 };
  };
  const titulo = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  return {
    columnas: { provincia: titulo(v.s), capital: CAPITAL[idioma], comunidad: titulo(v.g), provincias: v.P },
    provincias: pagina(0),
    capitales: pagina(1),
    ...(agrupado && { comunidades: pagina(2) }),
  };
}
