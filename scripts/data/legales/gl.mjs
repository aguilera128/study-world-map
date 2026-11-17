// Textos legais e de doazóns en galego: unha tradución de ./es.mjs, coa mesma estrutura.
// En caso de discrepancia manda o orixinal en castelán, e cada páxina legal dio.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'aviso-legal', privacidad: 'privacidade', cookies: 'cookies', donar: 'doar' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Última revisión: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">configuración de cookies</a>`;
  const traduccion = (id) =>
    `    <p><em>Esta é unha tradución que se ofrece só a título informativo. En caso de discrepancia, prevalece a <a href="${original(id)}" hreflang="es" lang="es">versión orixinal en castelán</a>.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titular:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF:</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Domicilio:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Correo electrónico:</strong> ${email()}</li>
        <li><strong>Sitio web:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Aviso legal · Study World Map',
      description: 'Datos do titular, condicións de uso e propiedade intelectual de Study World Map.',
      body: `    <h1>Aviso legal</h1>
${traduccion('aviso')}
    <h2>Titular do sitio web</h2>
    <p>En cumprimento do artigo 10 da Lei 34/2002, de servizos da sociedade da información e de comercio electrónico (LSSI-CE), estes son os datos do titular:</p>
${titularBlock()}

    <h2>Obxecto</h2>
    <p>Study World Map é un proxecto educativo persoal: un atlas interactivo para estudar xeografía xogando. Ensina os países do mundo, os seus continentes, as súas capitais e as súas bandeiras; as provincias, os estados ou as rexións de máis de trinta países; a xeografía física, os climas e a poboación; o interior da Terra e as capas da atmosfera; e, en vivo, o día e a noite, o tempo e os satélites. É gratuíto, non ten publicidade, non vende nada e non require rexistro. Mantense co tempo do seu autor e coas <a href="${ruta('donar')}">doazóns voluntarias</a> de quen queira apoialo.</p>

    <h2>Condicións de uso</h2>
    <p>O uso do sitio é libre e gratuíto. Ao usalo comprométeste a facelo de forma lícita, sen danar o sitio nin impedir que outros o usen. Podes compartir as ligazóns e as listas de estudo con quen queiras, por exemplo coa túa clase.</p>

    <h2>Exactitude dos contidos</h2>
    <p>Os datos xeográficos teñen fins educativos e revísanse con coidado, pero poden conter erros ou quedar desactualizados. As fronteiras proceden de Natural Earth e algunhas decisións (por exemplo, que territorios se contan como países) explícanse na propia aplicación; non expresan ningunha posición política. Se atopas un erro, escribe a ${email()} e corrixirémolo.</p>

    <h2>Propiedade intelectual</h2>
    <p>O deseño, o código e os textos de Study World Map son obra do seu titular e, se é o caso, das persoas que contribúen ao proxecto, que publican as súas achegas baixo a mesma licenza.</p>
    <p>Study World Map é software libre: o seu código fonte está publicado en <a href="https://github.com/aguilera128/study-world-map">GitHub</a> baixo a licenza <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, versión 3 (AGPL-3.0)</a>. Calquera pode usalo, estudalo, modificalo e redistribuílo nas condicións desa licenza; quen publique unha versión modificada nunha web ten que ofrecer tamén o seu código fonte. A licenza non cobre o nome «Study World Map», o dominio nin a icona.</p>
    <p>Os datos de terceiros úsanse conforme ás súas licenzas:</p>
    <ul>
      <li>Cartografía: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (dominio público).</li>
      <li>Nomes de países, subdivisións, capitais e accidentes xeográficos noutros idiomas: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Poboación: Banco Mundial, indicador «Poboación, total» (SP.POP.TOTL), licenza CC BY 4.0; a dos países que non están nesa serie, Wikidata.</li>
      <li>Rexións dos Estados Unidos: as catro rexións da Oficina do Censo (U.S. Census Bureau).</li>
      <li>Rexións de Finlandia: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unidades estatísticas por municipios de 2026 (licenza CC BY 4.0), simplificadas.</li>
      <li>Condados de Noruega: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, «Administrative enheter fylker» de 2026 (licenza CC BY 4.0), recortados pola costa e simplificados.</li>
      <li>Condados de Estonia: división administrativa de Estonia (EHAK), Xunta de Terras e Ordenación do Territorio de Estonia (Republic of Estonia Land and Spatial Development Board), datos do 01.11.2026, simplificados, coa súa <a href="https://geoportaal.maaruum.ee/opendata-licence">licenza de datos abertos</a>.</li>
      <li>Distritos de Chipre: Departamento de Terras e Catastro da República de Chipre (Department of Lands and Surveys), unidades administrativas INSPIRE, simplificados.</li>
      <li>Distritos de Moldavia: ACNUR e OCHA, límites administrativos de Moldavia de 2020 (licenza CC BY 3.0 IGO), vía <a href="https://www.geoboundaries.org/">geoBoundaries</a>, recortados e simplificados.</li>
      <li>Temperatura, nubes e vento de agora: modelo GFS (Global Forecast System) de NOAA/NCEP (dominio público), do programa de datos abertos da NOAA. É unha previsión, non unha medición.</li>
      <li>Chuvia e neve de agora: IMERG, da misión GPM da NASA, servido polos Global Imagery Browse Services (GIBS) do sistema ESDIS da NASA.</li>
      <li>Satélites: elementos orbitais GP de <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), a partir dos datos da U.S. Space Force; a posición de cada satélite calcúlase no navegador co modelo SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, licenza MIT).</li>
      <li>Códigos ISO e superficies: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Bandeiras: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licenza MIT).</li>
      <li>Luces nocturnas das cidades: Black Marble 2016, NASA Earth Observatory (dominio público).</li>
      <li>Imaxe de satélite: Blue Marble Next Generation, NASA Earth Observatory (xullo de 2004, dominio público).</li>
      <li>Relevo do fondo mariño: ETOPO2v2, NOAA National Geophysical Data Center (dominio público).</li>
      <li>Correntes oceánicas: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), media de decembro de 2011 a setembro de 2014, do servidor ERDDAP de NOAA CoastWatch; o rumbo xeral de cada corrente, do seu artigo na Wikipedia en inglés.</li>
      <li>Placas tectónicas: modelo PB2002 de Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, na conversión de Hugo Ahlenius (Nordpil), licenza <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Volcáns: base de datos de volcáns de NOAA NCEI (dominio público).</li>
      <li>Estrelas: Yale Bright Star Catalogue, 5.ª edición (dominio público), e catálogo Hipparcos da Axencia Espacial Europea (ESA, 1997).</li>
      <li>Vía Láctea: «Deep Star Maps 2020», NASA/Goddard Space Flight Center Scientific Visualization Studio, con datos de Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Zonas horarias: base de datos de zonas horarias da IANA, vía <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (licenza MIT).</li>
      <li>Ilustracións da capa «Planeta de debuxos»: deseños orixinais xerados con intelixencia artificial a partir dunha descrición propia.</li>
      <li>Climas: mapa mundial de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf e Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, agrupado nos climas que se estudan en secundaria.</li>
      <li>Tipografías: Besley e Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Ligazóns externas</h2>
    <p>O sitio enlaza a páxinas de terceiros, como PayPal para as doazóns, GitHub para o código fonte e as webs das fontes dos datos. O titular non controla esas páxinas nin responde dos seus contidos ou das súas políticas.</p>

    <h2>Responsabilidade</h2>
    <p>O titular non garante que o sitio estea dispoñible en todo momento nin libre de erros, e non responde dos danos que poidan derivarse do seu uso, salvo nos casos en que a lei o esixa.</p>

    <h2>Lexislación aplicable</h2>
    <p>Este aviso legal réxese pola lexislación española. A información sobre o tratamento de datos persoais está na <a href="${ruta('privacidad')}">política de privacidade</a> e a de cookies, na <a href="${ruta('cookies')}">política de cookies</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Política de privacidade · Study World Map',
      description: 'Que datos trata Study World Map, para que e como exercer os teus dereitos. A aplicación non ten contas e garda o teu progreso no teu dispositivo; só se ti o pides se garda ademais cun código para usalo noutro.',
      body: `    <h1>Política de privacidade</h1>
${traduccion('privacidad')}
    <p class="lead">Resumo: non hai contas nin formularios. O teu progreso queda no teu dispositivo, salvo que crees un código para levalo a outro. Só se aceptas as cookies de analítica se envían datos de uso a Google Analytics.</p>

    <h2>Responsable do tratamento</h2>
${titularBlock()}

    <h2>Que datos se tratan e para que</h2>

    <h3>Progreso, axustes e listas de estudo</h3>
    <p>Gárdanse só no almacenamento local do teu navegador, para que non perdas o aprendido. Non se envían a ningún servidor e o titular non ten acceso a eles, salvo que uses a sincronización que se explica a continuación. Podes borralos desde a propia aplicación («Progreso») ou borrando os datos do sitio no teu navegador.</p>
    <h3>Seguir noutro dispositivo (opcional)</h3>
    <p>Se en «Progreso» premes «Crear o meu código», o teu progreso gárdase tamén nunha base de datos para que poidas continuar noutro dispositivo. Gárdase unicamente un código de doce letras e cifras xerado ao azar, o progreso (que países ou accidentes xeográficos sabes, as túas mellores notas e o resultado do reto do día) e a data. Na base de datos non se garda o teu nome, o teu correo nin o teu enderezo IP, e o código non está asociado a ningunha persoa. As listas de estudo e os axustes non se envían.</p>
    <p>A base de datos está na Unión Europea (Fráncfort), no servizo Neon, e as peticións pasan polo aloxamento da web (Vercel), que como en calquera sitio rexistra durante un tempo limitado datos técnicos de cada petición, entre eles o enderezo IP e o enderezo solicitado. Quen coñeza o código pode ver e cambiar ese progreso, así que compárteo só con quen queiras. Se abres unha ligazón que leva o código (a do código QR), ese código forma parte do enderezo desa visita, e polo tanto do que rexistra o aloxamento. A aplicación quítao do enderezo en canto se abre, antes de cargar a analítica, para que non chegue a Google.</p>
    <p>Podes borrar o gardado en calquera momento con «Borrar o gardado con este código». «Deixar de sincronizar» só desconecta o dispositivo no que o premes: o gardado segue aí para os teus outros dispositivos. O que leve máis dun ano sen usarse bórrase.</p>
    <p><strong>Base legal:</strong> o teu consentimento, que dás ao premer «Crear o meu código» (art. 6.1.a do RGPD). Podes retiralo cando queiras borrando o gardado.</p>
    <p><strong>Provedor:</strong> Neon, o servizo de base de datos, que actúa como encargado do tratamento. Os datos gárdanse no seu centro de Fráncfort. Neon pertence a unha empresa dos Estados Unidos: se accedese a eles desde fóra do Espazo Económico Europeo, faríao coas garantías que esixe o RGPD para as transferencias internacionais.</p>

    <h3>Clasificación de resultados (opcional)</h3>
    <p>Ao rematar unha partida podes publicar o teu resultado na clasificación dese reto. Non se envía nada se non premes «Publicar». Gárdanse na base de datos, e veos calquera que consulte esa clasificación, o alcume que escribas, a túa nota, o teu tempo, a data e o país desde o que te conectas (só as súas dúas letras, para ensinar a bandeira). O país indícao o aloxamento a partir do teu enderezo IP no momento de publicar; o enderezo IP non se garda na base de datos.</p>
    <p>O alcume non debe conter o teu nome, os teus apelidos nin outros datos persoais: a aplicación proponche un e lémbracho ao escribilo. Non está asociado a ningunha conta nin a ningunha persoa, e calquera pode usar o mesmo. Só se conservan os dez mellores resultados de cada clasificación: os demais bórranse ao seren superados, e os do reto do día, aos 45 días. Se queres que se borre un resultado que publicaches, ou ves un alcume que non debería estar, escribe a ${email()} indicando o alcume e o reto.</p>
    <p><strong>Base legal:</strong> o teu consentimento, que dás ao premer «Publicar» (art. 6.1.a do RGPD).</p>

    <h3>Localización</h3>
    <p>A función «Tempo real» sitúa a túa posición no mapa a partir da zona horaria do teu dispositivo, sen pedirche nada. Se premes o botón de localización exacta, o teu navegador pedirache permiso e a aplicación usará a túa posición arredondada (uns 1 km). En ambos os casos a localización só se usa na pantalla: non se garda nin se envía a ningún sitio.</p>

    <h3>Meteoroloxía</h3>
    <p>Se acendes algunha das capas de meteoroloxía (temperatura, nubes, chuvia ou vento), a aplicación pide eses datos a este mesmo sitio, que pola súa vez os obtén da NOAA e da NASA. A eses organismos non lles chega nada teu, nin sequera o teu enderezo IP, e non se garda nada.</p>

    <h3>Satélites</h3>
    <p>Se acendes a capa de satélites, a aplicación pide as súas órbitas a este mesmo sitio, que pola súa vez as obtén de CelesTrak. A CelesTrak non lle chega nada teu, nin sequera o teu enderezo IP, e non se garda nada. A posición de cada satélite calcúlase no teu navegador.</p>

    <h3>Analítica (só co teu consentimento)</h3>
    <p>Se aceptas as cookies de analítica, cárgase Google Tag Manager e Google Analytics 4 para contar as visitas e saber que partes da web se usan, co único fin de mellorala. Trátanse datos técnicos e de uso: identificadores de cookie, páxinas vistas, tipo de dispositivo e navegador, idioma, e país ou cidade aproximados. Non se usan para publicidade nin para crear perfís comerciais.</p>
    <ul>
      <li><strong>Base legal:</strong> o teu consentimento (art. 6.1.a do RGPD). Podes retiralo cando queiras desde a ${consentLink}, sen que afecte ao tratado antes.</li>
      <li><strong>Provedor:</strong> Google Ireland Limited, que actúa como encargado do tratamento. Google pode transferir datos aos Estados Unidos, amparado polo Marco de Privacidade de Datos UE-EE. UU. e por cláusulas contractuais tipo.</li>
      <li><strong>Conservación:</strong> a que teña configurada a propiedade de Google Analytics, como máximo 14 meses.</li>
    </ul>
    <p>Se rexeitas ou non respondes, a web non carga nada de Google.</p>

    <h3>Correo electrónico</h3>
    <p>Se escribes a ${email()}, úsanse o teu enderezo e a túa mensaxe para responderche, con base na túa propia petición. Consérvanse mentres dure a conversa e bórranse despois, salvo que haxa que gardalos por obriga legal.</p>

    <h3>Doazóns</h3>
    <p>As doazóns fanse en PayPal, que trata os datos do pagamento como responsable independente segundo a súa propia política de privacidade. O titular recibe de PayPal o nome, o correo electrónico e o importe de quen doa, e úsaos só para xestionar a doazón, agradecela e cumprir as súas obrigas fiscais, durante o prazo que esixa a lei.</p>

    <h3>Aloxamento</h3>
    <p>O sitio alóxase en Vercel Inc. Como calquera servidor web, rexistra datos técnicos de cada visita (como o enderezo IP) durante un tempo limitado, para servir a web e protexela de abusos. Vercel actúa como encargado do tratamento, coas garantías do RGPD para as transferencias internacionais.</p>
    <p><strong>Base legal:</strong> o interese lexítimo do titular en poder servir a web e mantela segura (art. 6.1.f do RGPD).</p>

    <h2>Menores de idade</h2>
    <p>Study World Map está pensado para estudantes. Non pide datos persoais para usarse. Se tes menos de 14 anos, pídelle á túa nai, ao teu pai ou á persoa que te coide que decida se se aceptan as cookies de analítica e se podes publicar os teus resultados na clasificación (art. 7 da Lei orgánica 3/2018).</p>

    <h2>Os teus dereitos</h2>
    <p>Podes pedir o acceso, a rectificación ou a supresión dos teus datos, a limitación do seu tratamento, opoñerte a el ou pedir a súa portabilidade, escribindo a ${email()}. Como non sabemos de quen é cada código de sincronización, para atender unha petición sobre un progreso gardado necesitamos que nos indiques o código. Se cres que non se respectaron os teus dereitos, podes reclamar ante a <a href="https://www.aepd.es/">Axencia Española de Protección de Datos</a>.</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Política de cookies · Study World Map',
      description: 'Que cookies e almacenamento local usa Study World Map e como cambiar a túa elección.',
      body: `    <h1>Política de cookies</h1>
${traduccion('cookies')}
    <p class="lead">As únicas cookies son as de Google Analytics, e só se instalan se as aceptas. O demais é almacenamento local que necesita a aplicación para funcionar.</p>
    <p><a class="cta" href="#cookies">Cambiar a miña elección</a></p>

    <h2>Cookies de analítica (requiren consentimento)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">Provedor</th><th scope="col">Para que serve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguir visitantes de forma anónima.</td><td>2 anos</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Manter o estado da sesión.</td><td>2 anos</td></tr>
      </tbody>
    </table></div>
    <p>Son cookies propias do dominio, pero xestiónaas Google. Máis información na <a href="${ruta('privacidad')}">política de privacidade</a> e na <a href="https://policies.google.com/technologies/cookies?hl=es">explicación de Google</a>.</p>

    <h2>Almacenamento técnico (non require consentimento)</h2>
    <p>Non son cookies: gárdanse só no teu navegador, non se envían a ningún servidor (salvo o progreso, se creas un código para levalo a outro dispositivo, e o alcume, se publicas un resultado na clasificación) e son necesarios para que a aplicación funcione como pides.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">Para que serve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, vista, reto elixido, listas de estudo e se pechaches o aviso de idioma.</td><td>Ata que a borres</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>O que xa sabes e as túas mellores notas.</td><td>Ata que a borres</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>O teu código para seguir noutro dispositivo, se o creaches.</td><td>Ata que deixes de sincronizar</td></tr>
        <tr><td><code>swm:apodo</code></td><td>O último alcume co que publicaches na clasificación, para propoñercho a próxima vez.</td><td>Ata que a borres</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Lembrar que dixeches «Agora non» cando se che ofrece crear un código ao rematar unha partida.</td><td>Ata que a borres</td></tr>
        <tr><td><code>swm:consent</code></td><td>Lembrar se aceptaches ou rexeitaches as cookies, e cando.</td><td>Dous anos; despois vólveseche preguntar</td></tr>
        <tr><td>Caché <code>swm-*</code></td><td>Copia da aplicación para usala sen conexión.</td><td>Ata a seguinte versión</td></tr>
      </tbody>
    </table></div>

    <h2>Como cambiar ou retirar o teu consentimento</h2>
    <p>En calquera momento, desde a ${consentLink} (tamén no pé de cada páxina). Ao rexeitar, a web deixa de cargar Google Analytics e borra as súas cookies. A túa elección, sexa cal sexa, vale dous anos: pasado ese tempo vólveseche preguntar. Ademais, podes borrar as cookies e os datos do sitio desde os axustes do teu navegador; se o fas, tamén se borrará o teu progreso.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Apoia Study World Map cunha doazón',
      description: 'Study World Map é de balde, sen anuncios e sen rexistro. Se che axuda a estudar, podes apoialo cunha doazón.',
      body: `    <h1>Apoia Study World Map</h1>
    <p class="lead">Study World Map é de balde para todos os estudantes e seguirao sendo: sen anuncios, sen contas e sen vender os teus datos. Se che axudou a ti ou á túa clase, unha doazón axuda a mantelo vivo.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Doar con PayPal →</a></p>

    <h2>A que se destina</h2>
    <ul>
      <li>Manter o dominio e o aloxamento.</li>
      <li>Revisar e corrixir os datos: países, capitais, fronteiras, bandeiras, xeografía física e traducións.</li>
      <li>Engadir novos retos e mellorar a accesibilidade.</li>
    </ul>

    <h2>Antes de doar</h2>
    <ul>
      <li>A doazón é voluntaria e non dá acceso a nada extra: a aplicación é igual para todos.</li>
      <li>O pagamento faise en PayPal; Study World Map non ve nin garda os datos da túa tarxeta.</li>
      <li>Study World Map é un proxecto persoal, non unha fundación nin unha asociación, así que a doazón non desgrava na declaración da renda.</li>
    </ul>
    <p>Prefires axudar doutra forma? Compárteo coa túa clase ou escribe a ${email()} se atopas un erro.</p>`,
    },
  ];
}
