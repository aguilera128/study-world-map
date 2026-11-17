// Legal and donation texts in English (British): a translation of ./es.mjs, with the same structure.
// The Spanish original prevails in case of discrepancy, and each legal page says so.

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'legal-notice', privacidad: 'privacy', cookies: 'cookies', donar: 'donate' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Last reviewed: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">cookie settings</a>`;
  const traduccion = (id) =>
    `    <p><em>This is a translation provided for information purposes only. In the event of any discrepancy, the <a href="${original(id)}" hreflang="es" lang="es">original Spanish version</a> prevails.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Owner:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF (Spanish tax identification number):</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Address:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Email:</strong> ${email()}</li>
        <li><strong>Website:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Legal notice · Study World Map',
      description: 'Details of the owner, terms of use and intellectual property of Study World Map.',
      body: `    <h1>Legal notice</h1>
${traduccion('aviso')}
    <h2>Owner of the website</h2>
    <p>In compliance with article 10 of Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE, the Spanish Act on information society services and electronic commerce), these are the details of the owner:</p>
${titularBlock()}

    <h2>Purpose</h2>
    <p>Study World Map is a personal educational project: an interactive atlas for studying geography by playing. It teaches the countries of the world, their continents, their capitals and their flags; the provinces, states or regions of more than thirty countries; physical geography, climates and population; the interior of the Earth and the layers of the atmosphere; and, live, day and night, the weather and satellites. It is free, has no advertising, sells nothing and requires no sign-up. It is kept going by its author’s time and by the <a href="${ruta('donar')}">voluntary donations</a> of anyone who wants to support it.</p>

    <h2>Terms of use</h2>
    <p>Use of the site is free and open to everyone. By using it you undertake to do so lawfully, without damaging the site or preventing others from using it. You can share the links and the study lists with anyone you like, for example with your class.</p>

    <h2>Accuracy of the content</h2>
    <p>The geographical data are for educational purposes and are reviewed with care, but they may contain errors or become out of date. The borders come from Natural Earth and some decisions (for example, which territories are counted as countries) are explained in the app itself; they do not express any political position. If you find an error, write to ${email()} and we will correct it.</p>

    <h2>Intellectual property</h2>
    <p>The design, the code and the texts of Study World Map are the work of its owner and, where applicable, of the people who contribute to the project, who publish their contributions under the same licence.</p>
    <p>Study World Map is free software: its source code is published on <a href="https://github.com/aguilera128/study-world-map">GitHub</a> under the <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, version 3 (AGPL-3.0)</a>. Anyone can use it, study it, modify it and redistribute it under the terms of that licence; anyone who publishes a modified version on a website must also offer its source code. The licence does not cover the name ‘Study World Map’, the domain or the icon.</p>
    <p>Third-party data are used in accordance with their licences:</p>
    <ul>
      <li>Cartography: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain).</li>
      <li>Names of countries, subdivisions, capitals and geographical features in other languages: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Population: World Bank, indicator ‘Population, total’ (SP.POP.TOTL), CC BY 4.0 licence; for the countries that are not in that series, Wikidata.</li>
      <li>Regions of the United States: the four regions of the U.S. Census Bureau.</li>
      <li>Regions of Finland: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, statistical units by municipality for 2026 (CC BY 4.0 licence), simplified.</li>
      <li>Counties of Norway: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, ‘Administrative enheter fylker’ for 2026 (CC BY 4.0 licence), clipped to the coastline and simplified.</li>
      <li>Counties of Estonia: administrative division of Estonia (EHAK), Republic of Estonia Land and Spatial Development Board, data as of 01.11.2026, simplified, with its <a href="https://geoportaal.maaruum.ee/opendata-licence">open data licence</a>.</li>
      <li>Districts of Cyprus: Department of Lands and Surveys of the Republic of Cyprus, INSPIRE administrative units, simplified.</li>
      <li>Districts of Moldova: UNHCR and OCHA, administrative boundaries of Moldova for 2020 (CC BY 3.0 IGO licence), via <a href="https://www.geoboundaries.org/">geoBoundaries</a>, clipped and simplified.</li>
      <li>Current temperature, clouds and wind: GFS (Global Forecast System) model of NOAA/NCEP (public domain), from NOAA’s open data programme. It is a forecast, not a measurement.</li>
      <li>Current rain and snow: IMERG, from NASA’s GPM mission, served by the Global Imagery Browse Services (GIBS) of NASA’s ESDIS system.</li>
      <li>Satellites: GP orbital elements from <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), based on data from the U.S. Space Force; the position of each satellite is calculated in the browser with the SGP4 model (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, MIT licence).</li>
      <li>ISO codes and areas: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Flags: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (MIT licence).</li>
      <li>City lights at night: Black Marble 2016, NASA Earth Observatory (public domain).</li>
      <li>Satellite image: Blue Marble Next Generation, NASA Earth Observatory (July 2004, public domain).</li>
      <li>Relief of the sea floor: ETOPO2v2, NOAA National Geophysical Data Center (public domain).</li>
      <li>Ocean currents: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), average from December 2011 to September 2014, from the NOAA CoastWatch ERDDAP server; the general direction of each current, from its article in the English Wikipedia.</li>
      <li>Tectonic plates: PB2002 model by Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, in the conversion by Hugo Ahlenius (Nordpil), <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a> licence. Volcanoes: NOAA NCEI volcano database (public domain).</li>
      <li>Stars: Yale Bright Star Catalogue, 5th edition (public domain), and the Hipparcos catalogue of the European Space Agency (ESA, 1997).</li>
      <li>Milky Way: ‘Deep Star Maps 2020’, NASA/Goddard Space Flight Center Scientific Visualization Studio, with data from Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Time zones: IANA time zone database, via <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (MIT licence).</li>
      <li>Illustrations of the ‘Cartoon planet’ layer: original designs generated with artificial intelligence from our own description.</li>
      <li>Climates: Köppen-Geiger world map by Kottek, Grieser, Beck, Rudolf and Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, grouped into the climates studied at secondary school.</li>
      <li>Typefaces: Besley and Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>External links</h2>
    <p>The site links to third-party pages, such as PayPal for donations, GitHub for the source code and the websites of the data sources. The owner does not control those pages and is not responsible for their content or their policies.</p>

    <h2>Liability</h2>
    <p>The owner does not guarantee that the site will be available at all times or free of errors, and is not liable for any damage that may arise from its use, except where the law so requires.</p>

    <h2>Applicable law</h2>
    <p>This legal notice is governed by Spanish law. Information on the processing of personal data is in the <a href="${ruta('privacidad')}">privacy policy</a>, and information on cookies is in the <a href="${ruta('cookies')}">cookie policy</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Privacy policy · Study World Map',
      description: 'What data Study World Map processes, what for and how to exercise your rights. The app has no accounts and stores your progress on your device; only if you ask for it is it also saved with a code so you can use it on another one.',
      body: `    <h1>Privacy policy</h1>
${traduccion('privacidad')}
    <p class="lead">Summary: there are no accounts and no forms. Your progress stays on your device, unless you create a code to take it to another one. Only if you accept analytics cookies are usage data sent to Google Analytics.</p>

    <h2>Data controller</h2>
${titularBlock()}

    <h2>What data are processed and what for</h2>

    <h3>Progress, settings and study lists</h3>
    <p>They are stored only in the local storage of your browser, so that you do not lose what you have learnt. They are not sent to any server and the owner has no access to them, unless you use the syncing explained below. You can delete them from the app itself (‘Progress’) or by deleting the site data in your browser.</p>
    <h3>Continuing on another device (optional)</h3>
    <p>If you press ‘Create my code’ in ‘Progress’, your progress is also saved in a database so that you can continue on another device. Only a randomly generated code of twelve letters and digits, the progress (which countries or geographical features you know, your best scores and the result of the daily challenge) and the date are saved. Your name, your email address and your IP address are not saved in the database, and the code is not associated with any person. Study lists and settings are not sent.</p>
    <p>The database is in the European Union (Frankfurt), on the Neon service, and requests pass through the website’s hosting provider (Vercel), which, as on any site, logs technical data about each request for a limited time, including the IP address and the URL requested. Anyone who knows the code can see and change that progress, so share it only with people you choose. If you open a link that carries the code (the one in the QR code), that code is part of the address of that visit, and therefore of what the hosting provider logs. The app removes it from the address as soon as it opens, before loading analytics, so that it does not reach Google.</p>
    <p>You can delete what is saved at any time with ‘Delete what is saved with this code’. ‘Stop syncing’ only disconnects the device on which you press it: what is saved is still there for your other devices. Anything that has not been used for more than a year is deleted.</p>
    <p><strong>Legal basis:</strong> your consent, which you give by pressing ‘Create my code’ (art. 6.1.a of the GDPR). You can withdraw it whenever you like by deleting what is saved.</p>
    <p><strong>Provider:</strong> Neon, the database service, which acts as a data processor. The data are stored in its Frankfurt data centre. Neon is owned by a United States company: if it were to access them from outside the European Economic Area, it would do so with the safeguards that the GDPR requires for international transfers.</p>

    <h3>Leaderboard (optional)</h3>
    <p>When you finish a game you can publish your result on the leaderboard for that challenge. Nothing is sent unless you press ‘Publish’. What is saved in the database, and seen by anyone who looks at that leaderboard, is the nickname you type, your score, your time, the date and the country you are connecting from (only its two letters, to show the flag). The country is determined by the hosting provider from your IP address at the moment of publishing; the IP address is not saved in the database.</p>
    <p>The nickname must not contain your first name, your surname or other personal data: the app suggests one and reminds you of this when you type it. It is not associated with any account or any person, and anyone can use the same one. Only the ten best results on each leaderboard are kept: the others are deleted when they are beaten, and those of the daily challenge after 45 days. If you want a result you have published to be deleted, or you see a nickname that should not be there, write to ${email()} stating the nickname and the challenge.</p>
    <p><strong>Legal basis:</strong> your consent, which you give by pressing ‘Publish’ (art. 6.1.a of the GDPR).</p>

    <h3>Location</h3>
    <p>The ‘Real time’ feature places your position on the map based on the time zone of your device, without asking you for anything. If you press the exact location button, your browser will ask you for permission and the app will use your rounded position (to about 1 km). In both cases the location is only used on screen: it is not saved or sent anywhere.</p>

    <h3>Weather</h3>
    <p>If you switch on any of the weather layers (temperature, clouds, rain or wind), the app requests those data from this same site, which in turn obtains them from NOAA and NASA. Nothing of yours reaches those bodies, not even your IP address, and nothing is saved.</p>

    <h3>Satellites</h3>
    <p>If you switch on the satellites layer, the app requests their orbits from this same site, which in turn obtains them from CelesTrak. Nothing of yours reaches CelesTrak, not even your IP address, and nothing is saved. The position of each satellite is calculated in your browser.</p>

    <h3>Analytics (only with your consent)</h3>
    <p>If you accept analytics cookies, Google Tag Manager and Google Analytics 4 are loaded to count visits and find out which parts of the website are used, for the sole purpose of improving it. Technical and usage data are processed: cookie identifiers, pages viewed, type of device and browser, language, and approximate country or city. They are not used for advertising or to build commercial profiles.</p>
    <ul>
      <li><strong>Legal basis:</strong> your consent (art. 6.1.a of the GDPR). You can withdraw it whenever you like from the ${consentLink}, without affecting what was processed before.</li>
      <li><strong>Provider:</strong> Google Ireland Limited, which acts as a data processor. Google may transfer data to the United States, under the EU-U.S. Data Privacy Framework and standard contractual clauses.</li>
      <li><strong>Retention:</strong> whatever is configured in the Google Analytics property, at most 14 months.</li>
    </ul>
    <p>If you refuse or do not answer, the website loads nothing from Google.</p>

    <h3>Email</h3>
    <p>If you write to ${email()}, your address and your message are used to reply to you, on the basis of your own request. They are kept for as long as the conversation lasts and deleted afterwards, unless they have to be kept because of a legal obligation.</p>

    <h3>Donations</h3>
    <p>Donations are made on PayPal, which processes the payment data as an independent controller under its own privacy policy. The owner receives from PayPal the name, the email address and the amount of the person donating, and uses them only to manage the donation, to say thank you for it and to comply with tax obligations, for the period required by law.</p>

    <h3>Hosting</h3>
    <p>The site is hosted by Vercel Inc. Like any web server, it logs technical data about each visit (such as the IP address) for a limited time, in order to serve the website and protect it from abuse. Vercel acts as a data processor, with the GDPR safeguards for international transfers.</p>
    <p><strong>Legal basis:</strong> the legitimate interest of the owner in being able to serve the website and keep it secure (art. 6.1.f of the GDPR).</p>

    <h2>Minors</h2>
    <p>Study World Map is designed for students. It does not ask for personal data in order to be used. If you are under 14, ask your mother, your father or the person who looks after you to decide whether analytics cookies are accepted and whether you can publish your results on the leaderboard (art. 7 of Ley Orgánica 3/2018, the Spanish data protection act).</p>

    <h2>Your rights</h2>
    <p>You can request access to your data, its rectification or erasure, or the restriction of its processing, and you can object to its processing or request its portability, by writing to ${email()}. As we do not know who each sync code belongs to, to deal with a request about saved progress we need you to tell us the code. If you believe your rights have not been respected, you can lodge a complaint with the <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a> (the Spanish data protection authority).</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Cookie policy · Study World Map',
      description: 'Which cookies and local storage Study World Map uses and how to change your choice.',
      body: `    <h1>Cookie policy</h1>
${traduccion('cookies')}
    <p class="lead">The only cookies are those of Google Analytics, and they are only set if you accept them. The rest is local storage that the app needs in order to work.</p>
    <p><a class="cta" href="#cookies">Change my choice</a></p>

    <h2>Analytics cookies (require consent)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Name</th><th scope="col">Provider</th><th scope="col">What it is for</th><th scope="col">Duration</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Telling visitors apart anonymously.</td><td>2 years</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Keeping the session state.</td><td>2 years</td></tr>
      </tbody>
    </table></div>
    <p>They are first-party cookies set on this domain, but they are managed by Google. More information in the <a href="${ruta('privacidad')}">privacy policy</a> and in <a href="https://policies.google.com/technologies/cookies?hl=es">Google’s explanation</a>.</p>

    <h2>Technical storage (does not require consent)</h2>
    <p>These are not cookies: they are stored only in your browser, they are not sent to any server (except the progress, if you create a code to take it to another device, and the nickname, if you publish a result on the leaderboard) and they are necessary for the app to work the way you ask.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Name</th><th scope="col">What it is for</th><th scope="col">Duration</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Theme, view, chosen challenge, study lists and whether you have closed the language notice.</td><td>Until you delete it</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>What you already know and your best scores.</td><td>Until you delete it</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Your code for continuing on another device, if you have created one.</td><td>Until you stop syncing</td></tr>
        <tr><td><code>swm:apodo</code></td><td>The last nickname you used on the leaderboard, to suggest it to you next time.</td><td>Until you delete it</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Remembering that you said ‘Not now’ when you were offered the chance to create a code at the end of a game.</td><td>Until you delete it</td></tr>
        <tr><td><code>swm:consent</code></td><td>Remembering whether you accepted or refused cookies, and when.</td><td>Two years; after that you are asked again</td></tr>
        <tr><td><code>swm-*</code> cache</td><td>A copy of the app so you can use it offline.</td><td>Until the next version</td></tr>
      </tbody>
    </table></div>

    <h2>How to change or withdraw your consent</h2>
    <p>At any time, from the ${consentLink} (also in the footer of every page). When you refuse, the website stops loading Google Analytics and deletes its cookies. Your choice, whatever it is, is valid for two years: after that time you are asked again. You can also delete the cookies and the site data from your browser settings; if you do, your progress will be deleted too.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Support Study World Map with a donation',
      description: 'Study World Map is free, with no ads and no sign-up. If it helps you study, you can support it with a donation.',
      body: `    <h1>Support Study World Map</h1>
    <p class="lead">Study World Map is free for all students and will stay that way: no ads, no accounts and no selling your data. If it has helped you or your class, a donation helps keep it alive.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Donate with PayPal →</a></p>

    <h2>What it goes towards</h2>
    <ul>
      <li>Keeping up the domain and the hosting.</li>
      <li>Reviewing and correcting the data: countries, capitals, borders, flags, physical geography and translations.</li>
      <li>Adding new challenges and improving accessibility.</li>
    </ul>

    <h2>Before you donate</h2>
    <ul>
      <li>The donation is voluntary and gives no access to anything extra: the app is the same for everyone.</li>
      <li>The payment is made on PayPal; Study World Map does not see or store your card details.</li>
      <li>Study World Map is a personal project, not a foundation or an association, so donations are not tax-deductible.</li>
    </ul>
    <p>Would you rather help in another way? Share it with your class or write to ${email()} if you find an error.</p>`,
    },
  ];
}
