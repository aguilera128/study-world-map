// Lege-testuak eta dohaintzen orria euskaraz (euskara batua): ./es.mjs fitxategiaren itzulpena,
// egitura berarekin. Desadostasunik badago, gaztelaniazko jatorrizkoa da nagusi, eta lege-orri
// bakoitzak hala dio. Traducción no revisada por un hablante nativo.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'lege-oharra', privacidad: 'pribatutasuna', cookies: 'cookieak', donar: 'dohaintza' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Azken berrikuspena: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">cookieen konfigurazioa</a>`;
  const traduccion = (id) =>
    `    <p><em>Itzulpen hau informazio-helburuz soilik eskaintzen da. Desadostasunik izanez gero, <a href="${original(id)}" hreflang="es" lang="es">gaztelaniazko jatorrizko bertsioa</a> gailentzen da.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titularra:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>IFZ (NIF):</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Helbidea:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Posta elektronikoa:</strong> ${email()}</li>
        <li><strong>Webgunea:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Lege-oharra · Study World Map',
      description: 'Study World Mapen titularraren datuak, erabilera-baldintzak eta jabetza intelektuala.',
      body: `    <h1>Lege-oharra</h1>
${traduccion('aviso')}
    <h2>Webgunearen titularra</h2>
    <p>Informazioaren Gizartearen eta Merkataritza Elektronikoaren Zerbitzuei buruzko 34/2002 Legearen (LSSI-CE) 10. artikulua betez, hauek dira titularraren datuak:</p>
${titularBlock()}

    <h2>Xedea</h2>
    <p>Study World Map hezkuntza-proiektu pertsonal bat da: geografia jolastuz ikasteko atlas interaktibo bat. Munduko herrialdeak, haien kontinenteak, hiriburuak eta banderak erakusten ditu; hogeita hamar herrialde baino gehiagoren probintziak, estatuak edo eskualdeak; geografia fisikoa, klimak eta biztanleria; Lurraren barnealdea eta atmosferaren geruzak; eta, zuzenean, eguna eta gaua, eguraldia eta sateliteak. Doakoa da, ez du publizitaterik, ez du ezer saltzen eta ez du erregistrorik eskatzen. Egilearen denborarekin eta lagundu nahi duenaren <a href="${ruta('donar')}">borondatezko dohaintzekin</a> mantentzen da.</p>

    <h2>Erabilera-baldintzak</h2>
    <p>Webgunearen erabilera librea eta doakoa da. Erabiltzean, legez erabiltzeko konpromisoa hartzen duzu, webguneari kalterik egin gabe eta besteei erabiltzea eragotzi gabe. Estekak eta ikasketa-zerrendak nahi duzunarekin parteka ditzakezu, adibidez zure ikasgelarekin.</p>

    <h2>Edukien zehaztasuna</h2>
    <p>Datu geografikoek hezkuntza-helburuak dituzte eta arretaz berrikusten dira, baina akatsak izan ditzakete edo zaharkituta gera daitezke. Mugak Natural Earthetik datoz, eta erabaki batzuk (adibidez, zein lurralde hartzen diren herrialdetzat) aplikazioan bertan azaltzen dira; ez dute inolako jarrera politikorik adierazten. Akatsen bat aurkitzen baduzu, idatzi helbide honetara, eta zuzenduko dugu: ${email()}.</p>

    <h2>Jabetza intelektuala</h2>
    <p>Study World Mapen diseinua, kodea eta testuak haren titularraren lana dira eta, hala badagokio, proiektuan laguntzen duten pertsonena, zeinek beren ekarpenak lizentzia beraren pean argitaratzen baitituzte.</p>
    <p>Study World Map software librea da: iturburu-kodea <a href="https://github.com/aguilera128/study-world-map">GitHub</a>en argitaratuta dago, <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, 3. bertsioa (AGPL-3.0)</a> lizentziaren pean. Edonork erabil, azter, alda eta birbana dezake lizentzia horren baldintzetan; bertsio aldatu bat webgune batean argitaratzen duenak haren iturburu-kodea ere eskaini behar du. Lizentziak ez ditu barne hartzen «Study World Map» izena, domeinua eta ikonoa.</p>
    <p>Hirugarrenen datuak haien lizentzien arabera erabiltzen dira:</p>
    <ul>
      <li>Kartografia: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (jabari publikoa).</li>
      <li>Herrialdeen, azpibanaketen, hiriburuen eta elementu geografikoen izenak beste hizkuntza batzuetan: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Biztanleria: Munduko Bankua, «Biztanleria, guztira» adierazlea (SP.POP.TOTL), CC BY 4.0 lizentzia; serie horretan ez dauden herrialdeena, Wikidata.</li>
      <li>Estatu Batuetako eskualdeak: Errolda Bulegoaren (U.S. Census Bureau) lau eskualdeak.</li>
      <li>Finlandiako eskualdeak: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, 2026ko udalerrikako unitate estatistikoak (CC BY 4.0 lizentzia), sinplifikatuta.</li>
      <li>Norvegiako konderriak: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, 2026ko «Administrative enheter fylker» (CC BY 4.0 lizentzia), kostaldetik moztuta eta sinplifikatuta.</li>
      <li>Estoniako konderriak: Estoniako banaketa administratiboa (EHAK), Estoniako Lurren eta Lurralde Antolamenduaren Batzordea (Republic of Estonia Land and Spatial Development Board), 2026.11.01eko datuak, sinplifikatuta, bere <a href="https://geoportaal.maaruum.ee/opendata-licence">datu irekien lizentziarekin</a>.</li>
      <li>Zipreko barrutiak: Zipreko Errepublikako Lurren eta Katastroaren Saila (Department of Lands and Surveys), INSPIRE unitate administratiboak, sinplifikatuta.</li>
      <li>Moldaviako barrutiak: ACNUR eta OCHA, Moldaviako 2020ko muga administratiboak (CC BY 3.0 IGO lizentzia), <a href="https://www.geoboundaries.org/">geoBoundaries</a>en bidez, moztuta eta sinplifikatuta.</li>
      <li>Oraingo tenperatura, hodeiak eta haizea: NOAA/NCEPen GFS eredua (Global Forecast System) (jabari publikoa), NOAAren datu irekien programakoa. Iragarpen bat da, ez neurketa bat.</li>
      <li>Oraingo euria eta elurra: IMERG, NASAren GPM misioarena, NASAren ESDIS sistemaren Global Imagery Browse Services (GIBS) zerbitzuek emana.</li>
      <li>Sateliteak: <a href="https://celestrak.org/">CelesTrak</a>en (T. S. Kelso) GP elementu orbitalak, U.S. Space Forceren datuetatik abiatuta; satelite bakoitzaren posizioa nabigatzailean kalkulatzen da SGP4 ereduarekin (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, MIT lizentzia).</li>
      <li>ISO kodeak eta azalerak: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Banderak: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (MIT lizentzia).</li>
      <li>Hirietako gaueko argiak: Black Marble 2016, NASA Earth Observatory (jabari publikoa).</li>
      <li>Satelite-irudia: Blue Marble Next Generation, NASA Earth Observatory (2004ko uztaila, jabari publikoa).</li>
      <li>Itsas hondoaren erliebea: ETOPO2v2, NOAA National Geophysical Data Center (jabari publikoa).</li>
      <li>Itsaslasterrak: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), 2011ko abendutik 2014ko irailera bitarteko batezbestekoa, NOAA CoastWatchen ERDDAP zerbitzaritik; itsaslaster bakoitzaren norabide orokorra, ingelesezko Wikipedian duen artikulutik.</li>
      <li>Plaka tektonikoak: Peter Birden PB2002 eredua (2003), <em>Geochemistry, Geophysics, Geosystems</em>, Hugo Ahleniusen (Nordpil) bihurketan, <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a> lizentzia. Sumendiak: NOAA NCEIren sumendien datu-basea (jabari publikoa).</li>
      <li>Izarrak: Yale Bright Star Catalogue, 5. edizioa (jabari publikoa), eta Europako Espazio Agentziaren Hipparcos katalogoa (ESA, 1997).</li>
      <li>Esne Bidea: «Deep Star Maps 2020», NASA/Goddard Space Flight Center Scientific Visualization Studio, Gaia DR2ren datuekin (ESA/Gaia/DPAC).</li>
      <li>Ordu-eremuak: IANAren ordu-eremuen datu-basea, <a href="https://github.com/moment/moment-timezone">moment-timezone</a>ren bidez (MIT lizentzia).</li>
      <li>«Marrazki bizidunen planeta» geruzako ilustrazioak: adimen artifizialarekin sortutako diseinu originalak, deskribapen propio batetik abiatuta.</li>
      <li>Klimak: Kottek, Grieser, Beck, Rudolf eta Rubelen Köppen-Geiger munduko mapa (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, bigarren hezkuntzan ikasten diren klimetan bilduta.</li>
      <li>Tipografiak: Besley eta Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Kanpoko estekak</h2>
    <p>Webguneak hirugarrenen orrietarako estekak ditu, hala nola PayPal dohaintzetarako, GitHub iturburu-koderako eta datuen iturrien webguneak. Titularrak ez ditu orri horiek kontrolatzen, eta ez du haien edukien edo politiken erantzukizunik.</p>

    <h2>Erantzukizuna</h2>
    <p>Titularrak ez du bermatzen webgunea une oro erabilgarri egongo denik, ezta akatsik gabe egongo denik ere, eta ez du haren erabileratik erator daitezkeen kalteen erantzukizunik, legeak hala eskatzen duen kasuetan izan ezik.</p>

    <h2>Aplikatu beharreko legeria</h2>
    <p>Lege-ohar hau Espainiako legeriak arautzen du. Datu pertsonalen tratamenduari buruzko informazioa <a href="${ruta('privacidad')}">pribatutasun-politikan</a> dago, eta cookieei buruzkoa, <a href="${ruta('cookies')}">cookie-politikan</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Pribatutasun-politika · Study World Map',
      description: 'Study World Mapek zer datu tratatzen dituen, zertarako, eta nola baliatu zure eskubideak. Aplikazioak ez du konturik eta zure aurrerapena zure gailuan gordetzen du; zuk eskatzen baduzu bakarrik gordetzen da, gainera, kode batekin, beste gailu batean erabiltzeko.',
      body: `    <h1>Pribatutasun-politika</h1>
${traduccion('privacidad')}
    <p class="lead">Laburpena: ez dago konturik ez formulariorik. Zure aurrerapena zure gailuan geratzen da, beste batera eramateko kode bat sortzen ez baduzu behintzat. Analitika-cookieak onartzen badituzu bakarrik bidaltzen dira erabilera-datuak Google Analyticsera.</p>

    <h2>Tratamenduaren arduraduna</h2>
${titularBlock()}

    <h2>Zer datu tratatzen diren eta zertarako</h2>

    <h3>Aurrerapena, ezarpenak eta ikasketa-zerrendak</h3>
    <p>Zure nabigatzailearen biltegiratze lokalean bakarrik gordetzen dira, ikasitakoa gal ez dezazun. Ez dira inongo zerbitzarira bidaltzen eta titularrak ez du haietarako sarbiderik, jarraian azaltzen den sinkronizazioa erabiltzen ez baduzu behintzat. Aplikazioan bertan («Aurrerapena») ezaba ditzakezu, edo zure nabigatzailean webgunearen datuak ezabatuz.</p>
    <h3>Jarraitu beste gailu batean (aukerakoa)</h3>
    <p>«Aurrerapena» atalean «Sortu nire kodea» sakatzen baduzu, zure aurrerapena datu-base batean ere gordetzen da, beste gailu batean jarraitu ahal izateko. Hauek baino ez dira gordetzen: ausaz sortutako hamabi letra eta zenbakiko kode bat, aurrerapena (zein herrialde edo elementu geografiko dakizkizun, zure notarik onenak eta eguneko erronkaren emaitza) eta data. Datu-basean ez da gordetzen zure izena, zure posta elektronikoa, ezta zure IP helbidea ere, eta kodea ez dago inongo pertsonarekin lotuta. Ikasketa-zerrendak eta ezarpenak ez dira bidaltzen.</p>
    <p>Datu-basea Europar Batasunean dago (Frankfurt), Neon zerbitzuan, eta eskaerak webgunearen ostatatzetik (Vercel) igarotzen dira; horrek, edozein webgunetan bezala, eskaera bakoitzaren datu teknikoak erregistratzen ditu denbora mugatu batez, besteak beste IP helbidea eta eskatutako helbidea. Kodea ezagutzen duenak aurrerapen hori ikusi eta alda dezake; beraz, partekatu nahi duzunarekin bakarrik. Kodea daraman esteka bat irekitzen baduzu (QR kodearena), kode hori bisita horren helbidearen parte da, eta, beraz, ostatatzeak erregistratzen duenaren parte. Aplikazioak helbidetik kentzen du ireki bezain laster, analitika kargatu aurretik, Googlera irits ez dadin.</p>
    <p>Gordetakoa edozein unetan ezaba dezakezu «Ezabatu kode honekin gordetakoa» aukerarekin. «Utzi sinkronizatzeari» aukerak sakatzen duzun gailua baino ez du deskonektatzen: gordetakoak hor jarraitzen du zure beste gailuetarako. Urtebete baino gehiago erabili gabe daramana ezabatu egiten da.</p>
    <p><strong>Lege-oinarria:</strong> zure adostasuna, «Sortu nire kodea» sakatzean ematen duzuna (Datuak Babesteko Erregelamendu Orokorra, DBEO —RGPD—, 6.1.a art.). Nahi duzunean ken dezakezu, gordetakoa ezabatuz.</p>
    <p><strong>Hornitzailea:</strong> Neon, datu-basearen zerbitzua, tratamenduaren eragile gisa jarduten duena. Datuak Frankfurteko zentroan gordetzen dira. Neon Estatu Batuetako enpresa batena da: Europako Esparru Ekonomikotik kanpotik datu horietara sartuko balitz, DBEOk nazioarteko transferentzietarako eskatzen dituen bermeekin egingo luke.</p>

    <h3>Emaitzen sailkapena (aukerakoa)</h3>
    <p>Partida bat amaitzean, zure emaitza erronka horren sailkapenean argitara dezakezu. Ez da ezer bidaltzen «Argitaratu» sakatzen ez baduzu. Datu-basean gordetzen dira, eta sailkapen hori kontsultatzen duen edonork ikusten ditu, idazten duzun ezizena, zure nota, zure denbora, data eta zein herrialdetatik konektatzen zaren (haren bi letrak bakarrik, bandera erakusteko). Herrialdea ostatatzeak adierazten du, argitaratzeko unean duzun IP helbidetik abiatuta; IP helbidea ez da datu-basean gordetzen.</p>
    <p>Ezizenak ez du zure izena, zure abizenak edo beste datu pertsonalik izan behar: aplikazioak bat proposatzen dizu eta idaztean gogorarazten dizu. Ez dago inongo konturekin ez pertsonarekin lotuta, eta edonork erabil dezake bera. Sailkapen bakoitzeko hamar emaitzarik onenak baino ez dira gordetzen: gainerakoak beste batek gainditzean ezabatzen dira, eta eguneko erronkarenak, 45 egunera. Argitaratu duzun emaitza bat ezabatzea nahi baduzu, edo egon behar ez lukeen ezizen bat ikusten baduzu, idatzi helbide honetara, ezizena eta erronka adierazita: ${email()}.</p>
    <p><strong>Lege-oinarria:</strong> zure adostasuna, «Argitaratu» sakatzean ematen duzuna (DBEO, 6.1.a art.).</p>

    <h3>Kokapena</h3>
    <p>«Denbora erreala» funtzioak zure posizioa mapan kokatzen du zure gailuaren ordu-eremutik abiatuta, zuri ezer eskatu gabe. Kokapen zehatzaren botoia sakatzen baduzu, nabigatzaileak baimena eskatuko dizu eta aplikazioak zure posizio biribildua erabiliko du (1 km inguru). Bi kasuetan kokapena pantailan bakarrik erabiltzen da: ez da gordetzen, ezta inora bidaltzen ere.</p>

    <h3>Eguraldia</h3>
    <p>Eguraldiaren geruzetako bat pizten baduzu (tenperatura, hodeiak, euria edo haizea), aplikazioak datu horiek webgune honi berari eskatzen dizkio, eta honek, bere aldetik, NOAAtik eta NASAtik lortzen ditu. Erakunde horiei ez zaie zure ezer iristen, ezta zure IP helbidea ere, eta ez da ezer gordetzen.</p>

    <h3>Sateliteak</h3>
    <p>Sateliteen geruza pizten baduzu, aplikazioak haien orbitak webgune honi berari eskatzen dizkio, eta honek, bere aldetik, CelesTraketik lortzen ditu. CelesTraki ez zaio zure ezer iristen, ezta zure IP helbidea ere, eta ez da ezer gordetzen. Satelite bakoitzaren posizioa zure nabigatzailean kalkulatzen da.</p>

    <h3>Analitika (zure adostasunarekin bakarrik)</h3>
    <p>Analitika-cookieak onartzen badituzu, Google Tag Manager eta Google Analytics 4 kargatzen dira, bisitak zenbatzeko eta webgunearen zein zati erabiltzen diren jakiteko, hura hobetzeko helburu bakarrarekin. Datu teknikoak eta erabilera-datuak tratatzen dira: cookie-identifikatzaileak, ikusitako orriak, gailu- eta nabigatzaile-mota, hizkuntza, eta gutxi gorabeherako herrialdea edo hiria. Ez dira erabiltzen publizitaterako, ezta profil komertzialak sortzeko ere.</p>
    <ul>
      <li><strong>Lege-oinarria:</strong> zure adostasuna (DBEO, 6.1.a art.). Nahi duzunean ken dezakezu, aurretik tratatutakoari eragin gabe, esteka honetatik: ${consentLink}.</li>
      <li><strong>Hornitzailea:</strong> Google Ireland Limited, tratamenduaren eragile gisa jarduten duena. Googlek datuak Estatu Batuetara transferi ditzake, EB-AEB Datuen Pribatutasun Esparruaren eta kontratu-klausula tipoen babesean.</li>
      <li><strong>Kontserbazioa:</strong> Google Analyticsen jabetzak konfiguratuta duena, gehienez 14 hilabete.</li>
    </ul>
    <p>Uko egiten badiozu edo erantzuten ez baduzu, webguneak ez du Googleren ezer kargatzen.</p>

    <h3>Posta elektronikoa</h3>
    <p>Helbide honetara idazten baduzu, zure helbidea eta zure mezua zuri erantzuteko erabiltzen dira, zure eskaera bera oinarri hartuta: ${email()}. Elkarrizketak dirauen bitartean gordetzen dira eta gero ezabatu egiten dira, legezko betebeharren batengatik gorde behar direnean izan ezik.</p>

    <h3>Dohaintzak</h3>
    <p>Dohaintzak PayPalen egiten dira, zeinak ordainketaren datuak arduradun independente gisa tratatzen baititu, bere pribatutasun-politikaren arabera. Titularrak PayPaletik jasotzen ditu dohaintza egiten duenaren izena, posta elektronikoa eta zenbatekoa, eta dohaintza kudeatzeko, eskertzeko eta bere zerga-betebeharrak betetzeko baino ez ditu erabiltzen, legeak eskatzen duen epean.</p>

    <h3>Ostatatzea</h3>
    <p>Webgunea Vercel Inc. enpresan ostatatzen da. Edozein web-zerbitzarik bezala, bisita bakoitzaren datu teknikoak (hala nola IP helbidea) erregistratzen ditu denbora mugatu batez, webgunea zerbitzatzeko eta abusuetatik babesteko. Vercelek tratamenduaren eragile gisa jarduten du, DBEOk nazioarteko transferentzietarako ezartzen dituen bermeekin.</p>
    <p><strong>Lege-oinarria:</strong> titularrak webgunea zerbitzatu eta seguru mantendu ahal izateko duen interes legitimoa (DBEO, 6.1.f art.).</p>

    <h2>Adingabeak</h2>
    <p>Study World Map ikasleentzat pentsatuta dago. Erabiltzeko ez du datu pertsonalik eskatzen. 14 urte baino gutxiago badituzu, eskatu zure amari, zure aitari edo zaintzen zaituen pertsonari erabaki dezala analitika-cookieak onartzen diren eta zure emaitzak sailkapenean argitara ditzakezun (3/2018 Lege Organikoa, 7. art.).</p>

    <h2>Zure eskubideak</h2>
    <p>Zure datuetan sartzea, haiek zuzentzea edo ezabatzea, haien tratamendua mugatzea, tratamenduari aurka egitea edo datuen eramangarritasuna eska dezakezu, helbide honetara idatziz: ${email()}. Ez dakigunez sinkronizazio-kode bakoitza norena den, gordetako aurrerapen bati buruzko eskaera bati erantzuteko kodea adieraz diezaguzun behar dugu. Zure eskubideak errespetatu ez direla uste baduzu, erreklamazioa aurkez dezakezu <a href="https://www.aepd.es/">Datuak Babesteko Espainiako Agentzian</a>.</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Cookie-politika · Study World Map',
      description: 'Study World Mapek zer cookie eta biltegiratze lokal erabiltzen dituen eta nola aldatu zure aukera.',
      body: `    <h1>Cookie-politika</h1>
${traduccion('cookies')}
    <p class="lead">Cookie bakarrak Google Analyticsenak dira, eta onartzen badituzu bakarrik instalatzen dira. Gainerakoa aplikazioak funtzionatzeko behar duen biltegiratze lokala da.</p>
    <p><a class="cta" href="#cookies">Aldatu nire aukera</a></p>

    <h2>Analitika-cookieak (adostasuna behar dute)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Izena</th><th scope="col">Hornitzailea</th><th scope="col">Zertarako den</th><th scope="col">Iraupena</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Bisitariak modu anonimoan bereiztea.</td><td>2 urte</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Saioaren egoera mantentzea.</td><td>2 urte</td></tr>
      </tbody>
    </table></div>
    <p>Domeinuaren beraren cookieak dira, baina Googlek kudeatzen ditu. Informazio gehiago <a href="${ruta('privacidad')}">pribatutasun-politikan</a> eta <a href="https://policies.google.com/technologies/cookies?hl=es">Googleren azalpenean</a>.</p>

    <h2>Biltegiratze teknikoa (ez du adostasunik behar)</h2>
    <p>Ez dira cookieak: zure nabigatzailean bakarrik gordetzen dira, ez dira inongo zerbitzarira bidaltzen (aurrerapena izan ezik, beste gailu batera eramateko kode bat sortzen baduzu, eta ezizena, sailkapenean emaitza bat argitaratzen baduzu) eta beharrezkoak dira aplikazioak zuk eskatu bezala funtziona dezan.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Izena</th><th scope="col">Zertarako den</th><th scope="col">Iraupena</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Gaia, bista, aukeratutako erronka, ikasketa-zerrendak eta hizkuntza-oharra itxi duzun ala ez.</td><td>Ezabatzen duzun arte</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Dagoeneko dakizuna eta zure notarik onenak.</td><td>Ezabatzen duzun arte</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Beste gailu batean jarraitzeko zure kodea, sortu baduzu.</td><td>Sinkronizatzeari uzten diozun arte</td></tr>
        <tr><td><code>swm:apodo</code></td><td>Sailkapenean argitaratzeko erabili zenuen azken ezizena, hurrengoan zuri proposatzeko.</td><td>Ezabatzen duzun arte</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Partida bat amaitzean kode bat sortzea eskaintzen zaizunean «Orain ez» esan duzula gogoratzea.</td><td>Ezabatzen duzun arte</td></tr>
        <tr><td><code>swm:consent</code></td><td>Cookieak onartu ala baztertu zenituen gogoratzea, eta noiz.</td><td>Bi urte; ondoren berriro galdetzen zaizu</td></tr>
        <tr><td><code>swm-*</code> cachea</td><td>Aplikazioaren kopia, konexiorik gabe erabiltzeko.</td><td>Hurrengo bertsiora arte</td></tr>
      </tbody>
    </table></div>

    <h2>Nola aldatu edo kendu zure adostasuna</h2>
    <p>Edozein unetan, esteka honetatik: ${consentLink} (orri bakoitzaren oinean ere badago). Baztertzean, webguneak Google Analytics kargatzeari uzten dio eta haren cookieak ezabatzen ditu. Zure aukerak, edozein dela ere, bi urterako balio du: denbora hori igarota, berriro galdetzen zaizu. Gainera, cookieak eta webgunearen datuak zure nabigatzailearen ezarpenetatik ezaba ditzakezu; hala egiten baduzu, zure aurrerapena ere ezabatuko da.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Lagundu Study World Mapi dohaintza batekin',
      description: 'Study World Map doakoa da, iragarkirik gabea eta erregistrorik gabea. Ikasten laguntzen badizu, dohaintza batekin lagun diezaiokezu.',
      body: `    <h1>Lagundu Study World Mapi</h1>
    <p class="lead">Study World Map doakoa da ikasle guztientzat, eta hala izaten jarraituko du: iragarkirik gabe, konturik gabe eta zure datuak saldu gabe. Zuri edo zure ikasgelari lagundu badio, dohaintza batek bizirik mantentzen laguntzen du.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Dohaintza egin PayPalekin →</a></p>

    <h2>Zertara bideratzen den</h2>
    <ul>
      <li>Domeinua eta ostatatzea mantentzea.</li>
      <li>Datuak berrikustea eta zuzentzea: herrialdeak, hiriburuak, mugak, banderak, geografia fisikoa eta itzulpenak.</li>
      <li>Erronka berriak gehitzea eta irisgarritasuna hobetzea.</li>
    </ul>

    <h2>Dohaintza egin aurretik</h2>
    <ul>
      <li>Dohaintza borondatezkoa da eta ez du aparteko ezertarako sarbiderik ematen: aplikazioa berdina da guztientzat.</li>
      <li>Ordainketa PayPalen egiten da; Study World Mapek ez ditu zure txartelaren datuak ikusten, ezta gordetzen ere.</li>
      <li>Study World Map proiektu pertsonal bat da, ez fundazio bat ez elkarte bat; beraz, dohaintzak ez du kenkaririk ematen errenta-aitorpenean.</li>
    </ul>
    <p>Beste modu batean lagundu nahiago duzu? Partekatu zure ikasgelarekin, edo, akatsen bat aurkitzen baduzu, idatzi helbide honetara: ${email()}</p>`,
    },
  ];
}
