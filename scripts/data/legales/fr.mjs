// Textos legales y de donaciones en francés: traducción de ./es.mjs, con la misma estructura. En caso de
// discrepancia manda el original en español, y cada página legal lo dice y lo enlaza.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'mentions-legales', privacidad: 'confidentialite', cookies: 'cookies', donar: 'faire-un-don' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Dernière révision : ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">paramètres des cookies</a>`;
  const traduccion = (id) =>
    `    <p><em>Cette traduction est fournie à titre informatif. En cas de divergence, c’est la <a href="${original(id)}" hreflang="es" lang="es">version originale en espagnol</a> qui prévaut.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titulaire :</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF (numéro d’identification fiscale) :</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Adresse :</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Courrier électronique :</strong> ${email()}</li>
        <li><strong>Site web :</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Mentions légales · Study World Map',
      description: 'Coordonnées du titulaire, conditions d’utilisation et propriété intellectuelle de Study World Map.',
      body: `    <h1>Mentions légales</h1>
${traduccion('aviso')}
    <h2>Titulaire du site web</h2>
    <p>Conformément à l’article 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE, loi espagnole sur les services de la société de l’information et le commerce électronique), voici les coordonnées du titulaire :</p>
${titularBlock()}

    <h2>Objet</h2>
    <p>Study World Map est un projet éducatif personnel : un atlas interactif pour étudier la géographie en jouant. Il enseigne les pays du monde, leurs continents, leurs capitales et leurs drapeaux ; les provinces, les États ou les régions de plus de trente pays ; la géographie physique, les climats et la population ; l’intérieur de la Terre et les couches de l’atmosphère ; et, en direct, le jour et la nuit, la météo et les satellites. Il est gratuit, sans publicité, ne vend rien et ne nécessite aucune inscription. Il vit grâce au temps de son auteur et aux <a href="${ruta('donar')}">dons volontaires</a> de celles et ceux qui souhaitent le soutenir.</p>

    <h2>Conditions d’utilisation</h2>
    <p>L’utilisation du site est libre et gratuite. En l’utilisant, vous vous engagez à le faire de manière licite, sans endommager le site ni empêcher d’autres personnes de l’utiliser. Vous pouvez partager les liens et les listes de révision avec qui vous voulez, par exemple avec votre classe.</p>

    <h2>Exactitude des contenus</h2>
    <p>Les données géographiques ont une finalité éducative et sont vérifiées avec soin, mais elles peuvent contenir des erreurs ou ne plus être à jour. Les frontières proviennent de Natural Earth et certaines décisions (par exemple, quels territoires sont comptés comme des pays) sont expliquées dans l’application elle-même ; elles n’expriment aucune position politique. Si vous trouvez une erreur, écrivez à ${email()} et nous la corrigerons.</p>

    <h2>Propriété intellectuelle</h2>
    <p>Le design, le code et les textes de Study World Map sont l’œuvre de son titulaire et, le cas échéant, des personnes qui contribuent au projet, lesquelles publient leurs contributions sous la même licence.</p>
    <p>Study World Map est un logiciel libre : son code source est publié sur <a href="https://github.com/aguilera128/study-world-map">GitHub</a> sous la licence <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, version 3 (AGPL-3.0)</a>. Chacun peut l’utiliser, l’étudier, le modifier et le redistribuer dans les conditions de cette licence ; quiconque publie une version modifiée sur un site web doit également en proposer le code source. La licence ne couvre ni le nom « Study World Map », ni le domaine, ni l’icône.</p>
    <p>Les données de tiers sont utilisées conformément à leurs licences :</p>
    <ul>
      <li>Cartographie : <a href="https://www.naturalearthdata.com/">Natural Earth</a> (domaine public).</li>
      <li>Noms des pays, des subdivisions, des capitales et des éléments géographiques dans d’autres langues : <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Population : Banque mondiale, indicateur « Population, total » (SP.POP.TOTL), licence CC BY 4.0 ; celle des pays absents de cette série, Wikidata.</li>
      <li>Régions des États-Unis : les quatre régions du Bureau du recensement (U.S. Census Bureau).</li>
      <li>Régions de la Finlande : <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unités statistiques par communes de 2026 (licence CC BY 4.0), simplifiées.</li>
      <li>Comtés de la Norvège : <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, « Administrative enheter fylker » de 2026 (licence CC BY 4.0), découpés le long de la côte et simplifiés.</li>
      <li>Comtés de l’Estonie : division administrative de l’Estonie (EHAK), Office estonien des terres et de l’aménagement du territoire (Republic of Estonia Land and Spatial Development Board), données du 01.11.2026, simplifiées, avec sa <a href="https://geoportaal.maaruum.ee/opendata-licence">licence de données ouvertes</a>.</li>
      <li>Districts de Chypre : Département des terres et du cadastre de la République de Chypre (Department of Lands and Surveys), unités administratives INSPIRE, simplifiés.</li>
      <li>Districts de la Moldavie : HCR et OCHA, limites administratives de la Moldavie de 2020 (licence CC BY 3.0 IGO), via <a href="https://www.geoboundaries.org/">geoBoundaries</a>, découpés et simplifiés.</li>
      <li>Température, nuages et vent du moment : modèle GFS (Global Forecast System) de NOAA/NCEP (domaine public), du programme de données ouvertes de la NOAA. Il s’agit d’une prévision, non d’une mesure.</li>
      <li>Pluie et neige du moment : IMERG, de la mission GPM de la NASA, fourni par les Global Imagery Browse Services (GIBS) du système ESDIS de la NASA.</li>
      <li>Satellites : éléments orbitaux GP de <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), à partir des données de l’U.S. Space Force ; la position de chaque satellite est calculée dans le navigateur avec le modèle SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, licence MIT).</li>
      <li>Codes ISO et superficies : <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Drapeaux : <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licence MIT).</li>
      <li>Lumières nocturnes des villes : Black Marble 2016, NASA Earth Observatory (domaine public).</li>
      <li>Image satellite : Blue Marble Next Generation, NASA Earth Observatory (juillet 2004, domaine public).</li>
      <li>Relief des fonds marins : ETOPO2v2, NOAA National Geophysical Data Center (domaine public).</li>
      <li>Courants océaniques : OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), moyenne de décembre 2011 à septembre 2014, du serveur ERDDAP de NOAA CoastWatch ; la direction générale de chaque courant, de son article dans la Wikipédia en anglais.</li>
      <li>Plaques tectoniques : modèle PB2002 de Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, dans la conversion de Hugo Ahlenius (Nordpil), licence <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Volcans : base de données des volcans de NOAA NCEI (domaine public).</li>
      <li>Étoiles : Yale Bright Star Catalogue, 5e édition (domaine public), et catalogue Hipparcos de l’Agence spatiale européenne (ESA, 1997).</li>
      <li>Voie lactée : « Deep Star Maps 2020 », NASA/Goddard Space Flight Center Scientific Visualization Studio, avec des données de Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Fuseaux horaires : base de données des fuseaux horaires de l’IANA, via <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (licence MIT).</li>
      <li>Illustrations de la couche « Planète de dessin animé » : créations originales générées par intelligence artificielle à partir d’une description propre.</li>
      <li>Climats : carte mondiale de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf et Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, regroupée selon les climats étudiés dans l’enseignement secondaire.</li>
      <li>Polices de caractères : Besley et Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Liens externes</h2>
    <p>Le site renvoie à des pages de tiers, comme PayPal pour les dons, GitHub pour le code source et les sites des sources des données. Le titulaire ne contrôle pas ces pages et ne répond ni de leurs contenus ni de leurs politiques.</p>

    <h2>Responsabilité</h2>
    <p>Le titulaire ne garantit pas que le site soit disponible à tout moment ni exempt d’erreurs, et ne répond pas des dommages qui pourraient découler de son utilisation, sauf dans les cas où la loi l’exige.</p>

    <h2>Législation applicable</h2>
    <p>Les présentes mentions légales sont régies par la législation espagnole. Les informations sur le traitement des données personnelles figurent dans la <a href="${ruta('privacidad')}">politique de confidentialité</a> et celles sur les cookies, dans la <a href="${ruta('cookies')}">politique de cookies</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Politique de confidentialité · Study World Map',
      description: 'Quelles données traite Study World Map, dans quel but et comment exercer vos droits. L’application n’a pas de comptes et enregistre vos progrès sur votre appareil ; ce n’est que si vous le demandez qu’ils sont en outre enregistrés avec un code pour les utiliser sur un autre.',
      body: `    <h1>Politique de confidentialité</h1>
${traduccion('privacidad')}
    <p class="lead">Résumé : il n’y a ni comptes ni formulaires. Vos progrès restent sur votre appareil, sauf si vous créez un code pour les emporter sur un autre. Ce n’est que si vous acceptez les cookies d’analyse que des données d’utilisation sont envoyées à Google Analytics.</p>

    <h2>Responsable du traitement</h2>
${titularBlock()}

    <h2>Quelles données sont traitées et dans quel but</h2>

    <h3>Progrès, réglages et listes de révision</h3>
    <p>Ils sont enregistrés uniquement dans le stockage local de votre navigateur, pour que vous ne perdiez pas ce que vous avez appris. Ils ne sont envoyés à aucun serveur et le titulaire n’y a pas accès, sauf si vous utilisez la synchronisation expliquée ci-après. Vous pouvez les effacer depuis l’application elle-même (« Progrès ») ou en effaçant les données du site dans votre navigateur.</p>
    <h3>Continuer sur un autre appareil (facultatif)</h3>
    <p>Si, dans « Progrès », vous appuyez sur « Créer mon code », vos progrès sont également enregistrés dans une base de données pour que vous puissiez continuer sur un autre appareil. Sont enregistrés uniquement un code de douze lettres et chiffres généré au hasard, les progrès (quels pays ou éléments géographiques vous connaissez, vos meilleures notes et le résultat du défi du jour) et la date. La base de données n’enregistre ni votre nom, ni votre adresse électronique, ni votre adresse IP, et le code n’est associé à aucune personne. Les listes de révision et les réglages ne sont pas envoyés.</p>
    <p>La base de données se trouve dans l’Union européenne (Francfort), dans le service Neon, et les requêtes passent par l’hébergement du site (Vercel), qui, comme pour tout site, enregistre pendant une durée limitée des données techniques de chaque requête, parmi lesquelles l’adresse IP et l’adresse demandée. Toute personne qui connaît le code peut voir et modifier ces progrès : ne le partagez donc qu’avec qui vous voulez. Si vous ouvrez un lien qui contient le code (celui du code QR), ce code fait partie de l’adresse de cette visite, et donc de ce qu’enregistre l’hébergement. L’application le retire de l’adresse dès son ouverture, avant de charger l’outil d’analyse, pour qu’il ne parvienne pas à Google.</p>
    <p>Vous pouvez effacer à tout moment ce qui est enregistré avec « Supprimer ce qui est enregistré avec ce code ». « Arrêter la synchronisation » ne déconnecte que l’appareil sur lequel vous appuyez dessus : ce qui est enregistré reste disponible pour vos autres appareils. Ce qui n’a pas été utilisé depuis plus d’un an est effacé.</p>
    <p><strong>Base juridique :</strong> votre consentement, que vous donnez en appuyant sur « Créer mon code » (art. 6.1.a du RGPD). Vous pouvez le retirer quand vous voulez en effaçant ce qui est enregistré.</p>
    <p><strong>Prestataire :</strong> Neon, le service de base de données, qui agit en qualité de sous-traitant. Les données sont conservées dans son centre de Francfort. Neon appartient à une entreprise des États-Unis : si elle y accédait depuis l’extérieur de l’Espace économique européen, elle le ferait avec les garanties qu’exige le RGPD pour les transferts internationaux.</p>

    <h3>Classement des résultats (facultatif)</h3>
    <p>À la fin d’une partie, vous pouvez publier votre résultat dans le classement de ce défi. Rien n’est envoyé si vous n’appuyez pas sur « Publier ». Sont enregistrés dans la base de données, et visibles par toute personne qui consulte ce classement, le pseudo que vous écrivez, votre note, votre temps, la date et le pays depuis lequel vous vous connectez (seulement ses deux lettres, pour afficher le drapeau). Le pays est indiqué par l’hébergement à partir de votre adresse IP au moment de la publication ; l’adresse IP n’est pas enregistrée dans la base de données.</p>
    <p>Le pseudo ne doit contenir ni votre prénom, ni votre nom de famille, ni d’autres données personnelles : l’application vous en propose un et vous le rappelle au moment de l’écrire. Il n’est associé à aucun compte ni à aucune personne, et n’importe qui peut utiliser le même. Seuls les dix meilleurs résultats de chaque classement sont conservés : les autres sont effacés lorsqu’ils sont dépassés, et ceux du défi du jour, au bout de 45 jours. Si vous voulez que soit effacé un résultat que vous avez publié, ou si vous voyez un pseudo qui ne devrait pas s’y trouver, écrivez à ${email()} en indiquant le pseudo et le défi.</p>
    <p><strong>Base juridique :</strong> votre consentement, que vous donnez en appuyant sur « Publier » (art. 6.1.a du RGPD).</p>

    <h3>Localisation</h3>
    <p>La fonction « Temps réel » situe votre position sur la carte à partir du fuseau horaire de votre appareil, sans rien vous demander. Si vous appuyez sur le bouton de position exacte, votre navigateur vous demandera l’autorisation et l’application utilisera votre position arrondie (environ 1 km). Dans les deux cas, la localisation n’est utilisée qu’à l’écran : elle n’est ni enregistrée ni envoyée où que ce soit.</p>

    <h3>Météo</h3>
    <p>Si vous activez l’une des couches de météo (température, nuages, pluie ou vent), l’application demande ces données à ce même site, qui les obtient à son tour de la NOAA et de la NASA. Ces organismes ne reçoivent rien de vous, pas même votre adresse IP, et rien n’est enregistré.</p>

    <h3>Satellites</h3>
    <p>Si vous activez la couche des satellites, l’application demande leurs orbites à ce même site, qui les obtient à son tour de CelesTrak. CelesTrak ne reçoit rien de vous, pas même votre adresse IP, et rien n’est enregistré. La position de chaque satellite est calculée dans votre navigateur.</p>

    <h3>Analyse d’audience (uniquement avec votre consentement)</h3>
    <p>Si vous acceptez les cookies d’analyse, Google Tag Manager et Google Analytics 4 sont chargés pour compter les visites et savoir quelles parties du site sont utilisées, dans le seul but de l’améliorer. Sont traitées des données techniques et d’utilisation : identifiants de cookie, pages vues, type d’appareil et de navigateur, langue, et pays ou ville approximatifs. Elles ne sont utilisées ni à des fins publicitaires ni pour créer des profils commerciaux.</p>
    <ul>
      <li><strong>Base juridique :</strong> votre consentement (art. 6.1.a du RGPD). Vous pouvez le retirer quand vous voulez depuis les ${consentLink}, sans que cela affecte ce qui a été traité auparavant.</li>
      <li><strong>Prestataire :</strong> Google Ireland Limited, qui agit en qualité de sous-traitant. Google peut transférer des données vers les États-Unis, sous couvert du Cadre de protection des données UE-États-Unis et de clauses contractuelles types.</li>
      <li><strong>Conservation :</strong> celle qui est configurée dans la propriété Google Analytics, au maximum 14 mois.</li>
    </ul>
    <p>Si vous refusez ou ne répondez pas, le site ne charge rien de Google.</p>

    <h3>Courrier électronique</h3>
    <p>Si vous écrivez à ${email()}, votre adresse et votre message sont utilisés pour vous répondre, sur la base de votre propre demande. Ils sont conservés tant que dure la conversation et effacés ensuite, sauf s’il faut les garder en raison d’une obligation légale.</p>

    <h3>Dons</h3>
    <p>Les dons se font sur PayPal, qui traite les données du paiement en tant que responsable indépendant conformément à sa propre politique de confidentialité. Le titulaire reçoit de PayPal le nom, l’adresse électronique et le montant de la personne qui fait un don, et ne les utilise que pour gérer le don, en remercier l’auteur et respecter ses obligations fiscales, pendant la durée qu’exige la loi.</p>

    <h3>Hébergement</h3>
    <p>Le site est hébergé chez Vercel Inc. Comme tout serveur web, il enregistre des données techniques de chaque visite (comme l’adresse IP) pendant une durée limitée, pour servir le site et le protéger contre les abus. Vercel agit en qualité de sous-traitant, avec les garanties du RGPD pour les transferts internationaux.</p>
    <p><strong>Base juridique :</strong> l’intérêt légitime du titulaire à pouvoir servir le site et à le maintenir sécurisé (art. 6.1.f du RGPD).</p>

    <h2>Mineurs</h2>
    <p>Study World Map est conçu pour les élèves. Il ne demande aucune donnée personnelle pour être utilisé. Si vous avez moins de 14 ans, demandez à votre mère, à votre père ou à la personne qui s’occupe de vous de décider si les cookies d’analyse sont acceptés et si vous pouvez publier vos résultats dans le classement (art. 7 de la Ley Orgánica 3/2018, loi organique espagnole sur la protection des données).</p>

    <h2>Vos droits</h2>
    <p>Vous pouvez demander l’accès à vos données, leur rectification ou leur effacement, la limitation de leur traitement, vous y opposer ou demander leur portabilité, en écrivant à ${email()}. Comme nous ne savons pas à qui appartient chaque code de synchronisation, pour répondre à une demande concernant des progrès enregistrés, nous avons besoin que vous nous indiquiez le code. Si vous estimez que vos droits n’ont pas été respectés, vous pouvez introduire une réclamation auprès de l’<a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a> (l’autorité espagnole de protection des données).</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Politique de cookies · Study World Map',
      description: 'Quels cookies et quel stockage local utilise Study World Map et comment modifier votre choix.',
      body: `    <h1>Politique de cookies</h1>
${traduccion('cookies')}
    <p class="lead">Les seuls cookies sont ceux de Google Analytics, et ils ne sont installés que si vous les acceptez. Le reste est du stockage local dont l’application a besoin pour fonctionner.</p>
    <p><a class="cta" href="#cookies">Modifier mon choix</a></p>

    <h2>Cookies d’analyse (nécessitent le consentement)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nom</th><th scope="col">Fournisseur</th><th scope="col">À quoi il sert</th><th scope="col">Durée</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguer les visiteurs de manière anonyme.</td><td>2 ans</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Conserver l’état de la session.</td><td>2 ans</td></tr>
      </tbody>
    </table></div>
    <p>Ce sont des cookies propres au domaine, mais c’est Google qui les gère. Plus d’informations dans la <a href="${ruta('privacidad')}">politique de confidentialité</a> et dans l’<a href="https://policies.google.com/technologies/cookies?hl=es">explication de Google</a>.</p>

    <h2>Stockage technique (ne nécessite pas le consentement)</h2>
    <p>Ce ne sont pas des cookies : ils sont enregistrés uniquement dans votre navigateur, ne sont envoyés à aucun serveur (sauf les progrès, si vous créez un code pour les emporter sur un autre appareil, et le pseudo, si vous publiez un résultat dans le classement) et sont nécessaires pour que l’application fonctionne comme vous le demandez.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nom</th><th scope="col">À quoi il sert</th><th scope="col">Durée</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Thème, vue, défi choisi, listes de révision et le fait que vous ayez fermé l’avis de langue.</td><td>Jusqu’à ce que vous l’effaciez</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Ce que vous savez déjà et vos meilleures notes.</td><td>Jusqu’à ce que vous l’effaciez</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Votre code pour continuer sur un autre appareil, si vous l’avez créé.</td><td>Jusqu’à ce que vous arrêtiez la synchronisation</td></tr>
        <tr><td><code>swm:apodo</code></td><td>Le dernier pseudo avec lequel vous avez publié dans le classement, pour vous le proposer la prochaine fois.</td><td>Jusqu’à ce que vous l’effaciez</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Se souvenir que vous avez répondu « Pas maintenant » lorsqu’on vous propose de créer un code à la fin d’une partie.</td><td>Jusqu’à ce que vous l’effaciez</td></tr>
        <tr><td><code>swm:consent</code></td><td>Se souvenir si vous avez accepté ou refusé les cookies, et quand.</td><td>Deux ans ; ensuite, la question vous est posée à nouveau</td></tr>
        <tr><td>Cache <code>swm-*</code></td><td>Copie de l’application pour l’utiliser hors connexion.</td><td>Jusqu’à la version suivante</td></tr>
      </tbody>
    </table></div>

    <h2>Comment modifier ou retirer votre consentement</h2>
    <p>À tout moment, depuis les ${consentLink} (également dans le pied de chaque page). En cas de refus, le site cesse de charger Google Analytics et efface ses cookies. Votre choix, quel qu’il soit, vaut deux ans : passé ce délai, la question vous est posée à nouveau. Vous pouvez en outre effacer les cookies et les données du site depuis les réglages de votre navigateur ; si vous le faites, vos progrès seront également effacés.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Soutenez Study World Map par un don',
      description: 'Study World Map est gratuit, sans publicité et sans inscription. S’il vous aide à étudier, vous pouvez le soutenir par un don.',
      body: `    <h1>Soutenez Study World Map</h1>
    <p class="lead">Study World Map est gratuit pour tous les élèves et le restera : sans publicité, sans comptes et sans vendre vos données. S’il vous a aidé, vous ou votre classe, un don aide à le maintenir en vie.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Faire un don avec PayPal →</a></p>

    <h2>À quoi il est destiné</h2>
    <ul>
      <li>Maintenir le domaine et l’hébergement.</li>
      <li>Vérifier et corriger les données : pays, capitales, frontières, drapeaux, géographie physique et traductions.</li>
      <li>Ajouter de nouveaux défis et améliorer l’accessibilité.</li>
    </ul>

    <h2>Avant de faire un don</h2>
    <ul>
      <li>Le don est volontaire et ne donne accès à rien de plus : l’application est la même pour tout le monde.</li>
      <li>Le paiement se fait sur PayPal ; Study World Map ne voit ni n’enregistre les données de votre carte.</li>
      <li>Study World Map est un projet personnel, ni une fondation ni une association : le don n’ouvre donc droit à aucune déduction dans la déclaration de revenus.</li>
    </ul>
    <p>Vous préférez aider autrement ? Partagez-le avec votre classe ou écrivez à ${email()} si vous trouvez une erreur.</p>`,
    },
  ];
}
