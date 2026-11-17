// Textos legals i de donacions en valencià / català: traducció de ./es.mjs, amb la mateixa
// estructura. En cas de discrepància preval l’original en castellà, i cada pàgina legal ho avisa.
// Los reúne ../legales.mjs, que explica qué recibe «paginas».

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'avis-legal', privacidad: 'privacitat', cookies: 'galetes', donar: 'donar' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Última revisió: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">configuració de galetes</a>`;
  const traduccion = (id) =>
    `    <p><em>Esta és una traducció a títol informatiu. En cas de discrepància, preval la <a href="${original(id)}" hreflang="es" lang="es">versió original en castellà</a>.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titular:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF:</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Domicili:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Correu electrònic:</strong> ${email()}</li>
        <li><strong>Lloc web:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Avís legal · Study World Map',
      description: 'Dades del titular, condicions d’ús i propietat intel·lectual de Study World Map.',
      body: `    <h1>Avís legal</h1>
${traduccion('aviso')}
    <h2>Titular del lloc web</h2>
    <p>En compliment de l’article 10 de la Llei 34/2002, de serveis de la societat de la informació i de comerç electrònic (LSSI-CE), estes són les dades del titular:</p>
${titularBlock()}

    <h2>Objecte</h2>
    <p>Study World Map és un projecte educatiu personal: un atles interactiu per a estudiar geografia jugant. Ensenya els països del món, els seus continents, les seues capitals i les seues banderes; les províncies, els estats o les regions de més de trenta països; la geografia física, els climes i la població; l’interior de la Terra i les capes de l’atmosfera; i, en viu, el dia i la nit, l’oratge i els satèl·lits. És de franc, no té publicitat, no ven res i no requereix registre. Es manté amb el temps del seu autor i amb les <a href="${ruta('donar')}">donacions voluntàries</a> de qui vulga donar-li suport.</p>

    <h2>Condicions d’ús</h2>
    <p>L’ús del lloc és lliure i gratuït. En usar-lo et compromets a fer-ho de manera lícita, sense danyar el lloc ni impedir que altres l’usen. Pots compartir els enllaços i les llistes d’estudi amb qui vulgues, per exemple amb la teua classe.</p>

    <h2>Exactitud dels continguts</h2>
    <p>Les dades geogràfiques tenen finalitats educatives i es revisen amb cura, però poden contindre errors o quedar desactualitzades. Les fronteres procedeixen de Natural Earth i algunes decisions (per exemple, quins territoris es compten com a països) s’expliquen en la mateixa aplicació; no expressen cap posició política. Si trobes un error, escriu a ${email()} i el corregirem.</p>

    <h2>Propietat intel·lectual</h2>
    <p>El disseny, el codi i els textos de Study World Map són obra del seu titular i, si escau, de les persones que contribueixen al projecte, que publiquen les seues aportacions sota la mateixa llicència.</p>
    <p>Study World Map és programari lliure: el seu codi font està publicat en <a href="https://github.com/aguilera128/study-world-map">GitHub</a> sota la llicència <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, versió 3 (AGPL-3.0)</a>. Qualsevol pot usar-lo, estudiar-lo, modificar-lo i redistribuir-lo en les condicions d’eixa llicència; qui publique una versió modificada en un web ha d’oferir també el seu codi font. La llicència no cobreix el nom «Study World Map», el domini ni la icona.</p>
    <p>Les dades de tercers s’usen d’acord amb les seues llicències:</p>
    <ul>
      <li>Cartografia: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (domini públic).</li>
      <li>Noms de països, subdivisions, capitals i accidents geogràfics en altres idiomes: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Població: Banc Mundial, indicador «Població, total» (SP.POP.TOTL), llicència CC BY 4.0; la dels països que no estan en eixa sèrie, Wikidata.</li>
      <li>Regions dels Estats Units: les quatre regions de l’Oficina del Cens (U.S. Census Bureau).</li>
      <li>Regions de Finlàndia: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unitats estadístiques per municipis de 2026 (llicència CC BY 4.0), simplificades.</li>
      <li>Comtats de Noruega: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, «Administrative enheter fylker» de 2026 (llicència CC BY 4.0), retallats per la costa i simplificats.</li>
      <li>Comtats d’Estònia: divisió administrativa d’Estònia (EHAK), Junta de Terres i Ordenació del Territori d’Estònia (Republic of Estonia Land and Spatial Development Board), dades de l’01.11.2026, simplificats, amb la seua <a href="https://geoportaal.maaruum.ee/opendata-licence">llicència de dades obertes</a>.</li>
      <li>Districtes de Xipre: Departament de Terres i Cadastre de la República de Xipre (Department of Lands and Surveys), unitats administratives INSPIRE, simplificats.</li>
      <li>Districtes de Moldàvia: ACNUR i OCHA, límits administratius de Moldàvia de 2020 (llicència CC BY 3.0 IGO), via <a href="https://www.geoboundaries.org/">geoBoundaries</a>, retallats i simplificats.</li>
      <li>Temperatura, núvols i vent d’ara: model GFS (Global Forecast System) de NOAA/NCEP (domini públic), del programa de dades obertes de la NOAA. És una previsió, no un mesurament.</li>
      <li>Pluja i neu d’ara: IMERG, de la missió GPM de la NASA, servit pels Global Imagery Browse Services (GIBS) del sistema ESDIS de la NASA.</li>
      <li>Satèl·lits: elements orbitals GP de <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), a partir de les dades de la U.S. Space Force; la posició de cada satèl·lit es calcula en el navegador amb el model SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, llicència MIT).</li>
      <li>Codis ISO i superfícies: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Banderes: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (llicència MIT).</li>
      <li>Llums nocturnes de les ciutats: Black Marble 2016, NASA Earth Observatory (domini públic).</li>
      <li>Imatge de satèl·lit: Blue Marble Next Generation, NASA Earth Observatory (juliol de 2004, domini públic).</li>
      <li>Relleu del fons marí: ETOPO2v2, NOAA National Geophysical Data Center (domini públic).</li>
      <li>Corrents oceànics: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), mitjana de desembre de 2011 a setembre de 2014, del servidor ERDDAP de NOAA CoastWatch; el rumb general de cada corrent, del seu article en la Viquipèdia en anglés.</li>
      <li>Plaques tectòniques: model PB2002 de Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, en la conversió d’Hugo Ahlenius (Nordpil), llicència <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Volcans: base de dades de volcans de NOAA NCEI (domini públic).</li>
      <li>Estreles: Yale Bright Star Catalogue, 5a edició (domini públic), i catàleg Hipparcos de l’Agència Espacial Europea (ESA, 1997).</li>
      <li>Via Làctia: «Deep Star Maps 2020», NASA/Goddard Space Flight Center Scientific Visualization Studio, amb dades de Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Zones horàries: base de dades de zones horàries de la IANA, via <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (llicència MIT).</li>
      <li>Il·lustracions de la capa «Planeta de dibuixos»: dissenys originals generats amb intel·ligència artificial a partir d’una descripció pròpia.</li>
      <li>Climes: mapa mundial de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf i Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, agrupat en els climes que s’estudien en secundària.</li>
      <li>Tipografies: Besley i Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Enllaços externs</h2>
    <p>El lloc enllaça a pàgines de tercers, com PayPal per a les donacions, GitHub per al codi font i els webs de les fonts de les dades. El titular no controla eixes pàgines ni respon dels seus continguts o de les seues polítiques.</p>

    <h2>Responsabilitat</h2>
    <p>El titular no garanteix que el lloc estiga disponible en tot moment ni lliure d’errors, i no respon dels danys que puguen derivar-se del seu ús, excepte en els casos en què la llei ho exigisca.</p>

    <h2>Legislació aplicable</h2>
    <p>Este avís legal es regeix per la legislació espanyola. La informació sobre el tractament de dades personals està en la <a href="${ruta('privacidad')}">política de privacitat</a> i la de galetes, en la <a href="${ruta('cookies')}">política de galetes</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Política de privacitat · Study World Map',
      description: 'Quines dades tracta Study World Map, per a què i com exercir els teus drets. L’aplicació no té comptes i guarda el teu progrés en el teu dispositiu; només si tu ho demanes es guarda a més amb un codi per a usar-lo en un altre.',
      body: `    <h1>Política de privacitat</h1>
${traduccion('privacidad')}
    <p class="lead">Resum: no hi ha comptes ni formularis. El teu progrés es queda en el teu dispositiu, llevat que crees un codi per a portar-lo a un altre. Només si acceptes les galetes d’analítica s’envien dades d’ús a Google Analytics.</p>

    <h2>Responsable del tractament</h2>
${titularBlock()}

    <h2>Quines dades es tracten i per a què</h2>

    <h3>Progrés, ajustos i llistes d’estudi</h3>
    <p>Es guarden només en l’emmagatzematge local del teu navegador, perquè no perdes el que has aprés. No s’envien a cap servidor i el titular no hi té accés, llevat que uses la sincronització que s’explica a continuació. Pots esborrar-los des de la mateixa aplicació («Progrés») o esborrant les dades del lloc en el teu navegador.</p>
    <h3>Continuar en un altre dispositiu (opcional)</h3>
    <p>Si en «Progrés» prems «Crear el meu codi», el teu progrés es guarda també en una base de dades perquè pugues continuar en un altre dispositiu. Es guarda únicament un codi de dotze lletres i xifres generat a l’atzar, el progrés (quins països o accidents geogràfics et saps, les teues millors notes i el resultat del repte del dia) i la data. En la base de dades no es guarda el teu nom, el teu correu ni la teua adreça IP, i el codi no està associat a cap persona. Les llistes d’estudi i els ajustos no s’envien.</p>
    <p>La base de dades està en la Unió Europea (Frankfurt), en el servei Neon, i les peticions passen per l’allotjament del web (Vercel), que com en qualsevol lloc registra durant un temps limitat dades tècniques de cada petició, entre elles l’adreça IP i l’adreça sol·licitada. Qui conega el codi pot veure i canviar eixe progrés, així que comparteix-lo només amb qui vulgues. Si obris un enllaç que porta el codi (el del codi QR), eixe codi forma part de l’adreça d’eixa visita, i per tant del que registra l’allotjament. L’aplicació el lleva de l’adreça només obrir-se, abans de carregar l’analítica, perquè no arribe a Google.</p>
    <p>Pots esborrar el que hi ha guardat en qualsevol moment amb «Esborrar el que hi ha guardat amb este codi». «Deixar de sincronitzar» només desconnecta el dispositiu en què el prems: el que hi ha guardat continua ahí per als teus altres dispositius. El que porte més d’un any sense usar-se s’esborra.</p>
    <p><strong>Base legal:</strong> el teu consentiment, que dones en prémer «Crear el meu codi» (art. 6.1.a de l’RGPD). Pots retirar-lo quan vulgues esborrant el que hi ha guardat.</p>
    <p><strong>Proveïdor:</strong> Neon, el servei de base de dades, que actua com a encarregat del tractament. Les dades es guarden en el seu centre de Frankfurt. Neon pertany a una empresa dels Estats Units: si hi accedira des de fora de l’Espai Econòmic Europeu, ho faria amb les garanties que exigeix l’RGPD per a les transferències internacionals.</p>

    <h3>Rànquing de resultats (opcional)</h3>
    <p>En acabar una partida pots publicar el teu resultat en el rànquing d’eixe repte. No s’envia res si no prems «Publicar». Es guarden en la base de dades, i els veu qualsevol que consulte eixe rànquing, el malnom que escrigues, la teua nota, el teu temps, la data i el país des del qual et connectes (només les seues dos lletres, per a ensenyar la bandera). El país l’indica l’allotjament a partir de la teua adreça IP en el moment de publicar; l’adreça IP no es guarda en la base de dades.</p>
    <p>El malnom no ha de contindre el teu nom, els teus cognoms ni altres dades personals: l’aplicació te’n proposa un i t’ho recorda en escriure’l. No està associat a cap compte ni a cap persona, i qualsevol pot usar el mateix. Només es conserven els deu millors resultats de cada rànquing: els altres s’esborren en ser superats, i els del repte del dia, als 45 dies. Si vols que s’esborre un resultat que has publicat, o veus un malnom que no hi hauria d’estar, escriu a ${email()} indicant el malnom i el repte.</p>
    <p><strong>Base legal:</strong> el teu consentiment, que dones en prémer «Publicar» (art. 6.1.a de l’RGPD).</p>

    <h3>Ubicació</h3>
    <p>La funció «Temps real» situa la teua posició en el mapa a partir de la zona horària del teu dispositiu, sense demanar-te res. Si prems el botó d’ubicació exacta, el teu navegador et demanarà permís i l’aplicació usarà la teua posició arredonida (uns 1 km). En els dos casos la ubicació només s’usa en la pantalla: no es guarda ni s’envia a cap lloc.</p>

    <h3>Meteorologia</h3>
    <p>Si encens alguna de les capes de meteorologia (temperatura, núvols, pluja o vent), l’aplicació demana eixes dades a este mateix lloc, que al seu torn les obté de la NOAA i de la NASA. A eixos organismes no els arriba res teu, ni tan sols la teua adreça IP, i no es guarda res.</p>

    <h3>Satèl·lits</h3>
    <p>Si encens la capa de satèl·lits, l’aplicació demana les seues òrbites a este mateix lloc, que al seu torn les obté de CelesTrak. A CelesTrak no li arriba res teu, ni tan sols la teua adreça IP, i no es guarda res. La posició de cada satèl·lit es calcula en el teu navegador.</p>

    <h3>Analítica (només amb el teu consentiment)</h3>
    <p>Si acceptes les galetes d’analítica, es carrega Google Tag Manager i Google Analytics 4 per a comptar les visites i saber quines parts del web s’usen, amb l’única finalitat de millorar-lo. Es tracten dades tècniques i d’ús: identificadors de galeta, pàgines vistes, tipus de dispositiu i navegador, idioma, i país o ciutat aproximats. No s’usen per a publicitat ni per a crear perfils comercials.</p>
    <ul>
      <li><strong>Base legal:</strong> el teu consentiment (art. 6.1.a de l’RGPD). Pots retirar-lo quan vulgues des de la ${consentLink}, sense que afecte el que s’ha tractat abans.</li>
      <li><strong>Proveïdor:</strong> Google Ireland Limited, que actua com a encarregat del tractament. Google pot transferir dades als Estats Units, emparat pel Marc de Privacitat de Dades UE-EUA i per clàusules contractuals tipus.</li>
      <li><strong>Conservació:</strong> la que tinga configurada la propietat de Google Analytics, com a màxim 14 mesos.</li>
    </ul>
    <p>Si rebutges o no respons, el web no carrega res de Google.</p>

    <h3>Correu electrònic</h3>
    <p>Si escrius a ${email()}, s’usen la teua adreça i el teu missatge per a respondre’t, amb base en la teua pròpia petició. Es conserven mentre dure la conversa i s’esborren després, llevat que calga guardar-los per obligació legal.</p>

    <h3>Donacions</h3>
    <p>Les donacions es fan en PayPal, que tracta les dades del pagament com a responsable independent segons la seua pròpia política de privacitat. El titular rep de PayPal el nom, el correu electrònic i l’import de qui dona, i els usa només per a gestionar la donació, agrair-la i complir les seues obligacions fiscals, durant el termini que exigisca la llei.</p>

    <h3>Allotjament</h3>
    <p>El lloc s’allotja en Vercel Inc. Com qualsevol servidor web, registra dades tècniques de cada visita (com l’adreça IP) durant un temps limitat, per a servir el web i protegir-lo d’abusos. Vercel actua com a encarregat del tractament, amb les garanties de l’RGPD per a les transferències internacionals.</p>
    <p><strong>Base legal:</strong> l’interés legítim del titular a poder servir el web i mantindre’l segur (art. 6.1.f de l’RGPD).</p>

    <h2>Menors d’edat</h2>
    <p>Study World Map està pensat per a estudiants. No demana dades personals per a usar-se. Si tens menys de 14 anys, demana a ta mare, a ton pare o a la persona que et cuide que decidisca si s’accepten les galetes d’analítica i si pots publicar els teus resultats en el rànquing (art. 7 de la Llei orgànica 3/2018).</p>

    <h2>Els teus drets</h2>
    <p>Pots demanar l’accés, la rectificació o la supressió de les teues dades, la limitació del seu tractament, oposar-t’hi o demanar la seua portabilitat, escrivint a ${email()}. Com que no sabem de qui és cada codi de sincronització, per a atendre una petició sobre un progrés guardat necessitem que ens indiques el codi. Si creus que no s’han respectat els teus drets, pots reclamar davant de l’<a href="https://www.aepd.es/">Agència Espanyola de Protecció de Dades</a>.</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Política de galetes · Study World Map',
      description: 'Quines galetes i quin emmagatzematge local usa Study World Map i com canviar la teua elecció.',
      body: `    <h1>Política de galetes</h1>
${traduccion('cookies')}
    <p class="lead">Les úniques galetes són les de Google Analytics, i només s’instal·len si les acceptes. La resta és emmagatzematge local que necessita l’aplicació per a funcionar.</p>
    <p><a class="cta" href="#cookies">Canviar la meua elecció</a></p>

    <h2>Galetes d’analítica (requereixen consentiment)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nom</th><th scope="col">Proveïdor</th><th scope="col">Per a què serveix</th><th scope="col">Duració</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distingir visitants de manera anònima.</td><td>2 anys</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Mantindre l’estat de la sessió.</td><td>2 anys</td></tr>
      </tbody>
    </table></div>
    <p>Són galetes pròpies del domini, però les gestiona Google. Més informació en la <a href="${ruta('privacidad')}">política de privacitat</a> i en l’<a href="https://policies.google.com/technologies/cookies?hl=es">explicació de Google</a>.</p>

    <h2>Emmagatzematge tècnic (no requereix consentiment)</h2>
    <p>No són galetes: es guarden només en el teu navegador, no s’envien a cap servidor (excepte el progrés, si crees un codi per a portar-lo a un altre dispositiu, i el malnom, si publiques un resultat en el rànquing) i són necessaris perquè l’aplicació funcione com demanes.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nom</th><th scope="col">Per a què serveix</th><th scope="col">Duració</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, vista, repte triat, llistes d’estudi i si has tancat l’avís d’idioma.</td><td>Fins que l’esborres</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>El que ja et saps i les teues millors notes.</td><td>Fins que l’esborres</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>El teu codi per a continuar en un altre dispositiu, si l’has creat.</td><td>Fins que deixes de sincronitzar</td></tr>
        <tr><td><code>swm:apodo</code></td><td>L’últim malnom amb què vas publicar en el rànquing, per a proposar-te’l la pròxima vegada.</td><td>Fins que l’esborres</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Recordar que has dit «Ara no» quan se t’ofereix crear un codi en acabar una partida.</td><td>Fins que l’esborres</td></tr>
        <tr><td><code>swm:consent</code></td><td>Recordar si vas acceptar o vas rebutjar les galetes, i quan.</td><td>Dos anys; després se’t torna a preguntar</td></tr>
        <tr><td>Memòria cau <code>swm-*</code></td><td>Còpia de l’aplicació per a usar-la sense connexió.</td><td>Fins a la versió següent</td></tr>
      </tbody>
    </table></div>

    <h2>Com canviar o retirar el teu consentiment</h2>
    <p>En qualsevol moment, des de la ${consentLink} (també en el peu de cada pàgina). En rebutjar, el web deixa de carregar Google Analytics i esborra les seues galetes. La teua elecció, siga quina siga, val dos anys: passat eixe temps se’t torna a preguntar. A més, pots esborrar les galetes i les dades del lloc des dels ajustos del teu navegador; si ho fas, també s’esborrarà el teu progrés.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Dona suport a Study World Map amb una donació',
      description: 'Study World Map és de franc, sense anuncis i sense registre. Si t’ajuda a estudiar, pots donar-li suport amb una donació.',
      body: `    <h1>Dona suport a Study World Map</h1>
    <p class="lead">Study World Map és de franc per a tots els estudiants i ho continuarà sent: sense anuncis, sense comptes i sense vendre les teues dades. Si t’ha ajudat a tu o a la teua classe, una donació ajuda a mantindre’l viu.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Donar amb PayPal →</a></p>

    <h2>A què es destina</h2>
    <ul>
      <li>Mantindre el domini i l’allotjament.</li>
      <li>Revisar i corregir les dades: països, capitals, fronteres, banderes, geografia física i traduccions.</li>
      <li>Afegir nous reptes i millorar l’accessibilitat.</li>
    </ul>

    <h2>Abans de donar</h2>
    <ul>
      <li>La donació és voluntària i no dona accés a res extra: l’aplicació és igual per a tots.</li>
      <li>El pagament es fa en PayPal; Study World Map no veu ni guarda les dades de la teua targeta.</li>
      <li>Study World Map és un projecte personal, no una fundació ni una associació, així que la donació no desgrava en la declaració de la renda.</li>
    </ul>
    <p>Prefereixes ajudar d’una altra manera? Comparteix-lo amb la teua classe o escriu a ${email()} si trobes un error.</p>`,
    },
  ];
}
