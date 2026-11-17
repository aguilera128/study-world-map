// Rechtliche Texte und Spendenseite auf Deutsch: Übersetzung von ./es.mjs, mit derselben Struktur.
// En caso de discrepancia manda el original en español, y cada página lo avisa. Los reúne
// ../legales.mjs, que explica qué recibe «paginas».

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'impressum', privacidad: 'datenschutz', cookies: 'cookies', donar: 'spenden' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Letzte Überarbeitung: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">Cookie-Einstellungen</a>`;
  const traduccion = (id) =>
    `    <p><em>Diese Übersetzung dient nur der Information. Bei Abweichungen gilt die <a href="${original(id)}" hreflang="es" lang="es">spanische Originalfassung</a>.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Inhaber:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF (spanische Steueridentifikationsnummer):</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Anschrift:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>E-Mail:</strong> ${email()}</li>
        <li><strong>Website:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Impressum · Study World Map',
      description: 'Angaben zum Inhaber, Nutzungsbedingungen und geistiges Eigentum von Study World Map.',
      body: `    <h1>Impressum</h1>
${traduccion('aviso')}
    <h2>Inhaber der Website</h2>
    <p>Gemäß Artikel 10 der Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE, spanisches Gesetz über Dienste der Informationsgesellschaft und den elektronischen Geschäftsverkehr) sind dies die Angaben zum Inhaber:</p>
${titularBlock()}

    <h2>Gegenstand</h2>
    <p>Study World Map ist ein persönliches Bildungsprojekt: ein interaktiver Atlas, um Geografie spielerisch zu lernen. Er zeigt die Länder der Welt, ihre Kontinente, ihre Hauptstädte und ihre Flaggen; die Provinzen, Bundesstaaten oder Regionen von mehr als dreißig Ländern; die physische Geografie, die Klimate und die Bevölkerung; das Innere der Erde und die Schichten der Atmosphäre; und live Tag und Nacht, das Wetter und die Satelliten. Er ist kostenlos, hat keine Werbung, verkauft nichts und erfordert keine Anmeldung. Getragen wird er von der Zeit seines Autors und von den <a href="${ruta('donar')}">freiwilligen Spenden</a> derer, die ihn unterstützen möchten.</p>

    <h2>Nutzungsbedingungen</h2>
    <p>Die Nutzung der Website ist frei und kostenlos. Mit der Nutzung verpflichtest du dich, sie rechtmäßig zu verwenden, ohne die Website zu beschädigen oder andere an ihrer Nutzung zu hindern. Du kannst die Links und die Lernlisten mit wem du möchtest teilen, zum Beispiel mit deiner Klasse.</p>

    <h2>Richtigkeit der Inhalte</h2>
    <p>Die geografischen Daten dienen Bildungszwecken und werden sorgfältig geprüft, können aber Fehler enthalten oder veralten. Die Grenzen stammen von Natural Earth, und einige Entscheidungen (zum Beispiel, welche Gebiete als Länder gezählt werden) werden in der Anwendung selbst erklärt; sie drücken keine politische Position aus. Wenn du einen Fehler findest, schreib an ${email()}, und wir korrigieren ihn.</p>

    <h2>Geistiges Eigentum</h2>
    <p>Das Design, der Code und die Texte von Study World Map sind das Werk des Inhabers und gegebenenfalls der Personen, die zum Projekt beitragen und ihre Beiträge unter derselben Lizenz veröffentlichen.</p>
    <p>Study World Map ist freie Software: Der Quellcode ist auf <a href="https://github.com/aguilera128/study-world-map">GitHub</a> unter der Lizenz <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, Version 3 (AGPL-3.0)</a> veröffentlicht. Jeder kann ihn zu den Bedingungen dieser Lizenz nutzen, untersuchen, verändern und weiterverbreiten; wer eine veränderte Version auf einer Website veröffentlicht, muss auch deren Quellcode anbieten. Die Lizenz erstreckt sich nicht auf den Namen „Study World Map“, die Domain und das Icon.</p>
    <p>Die Daten Dritter werden gemäß ihren Lizenzen verwendet:</p>
    <ul>
      <li>Kartografie: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (gemeinfrei).</li>
      <li>Namen von Ländern, Untergliederungen, Hauptstädten und geografischen Objekten in anderen Sprachen: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Bevölkerung: Weltbank, Indikator „Bevölkerung, gesamt“ (SP.POP.TOTL), Lizenz CC BY 4.0; die der Länder, die in dieser Reihe fehlen, Wikidata.</li>
      <li>Regionen der Vereinigten Staaten: die vier Regionen der Volkszählungsbehörde (U.S. Census Bureau).</li>
      <li>Regionen Finnlands: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, statistische Einheiten nach Gemeinden von 2026 (Lizenz CC BY 4.0), vereinfacht.</li>
      <li>Provinzen Norwegens: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, „Administrative enheter fylker“ von 2026 (Lizenz CC BY 4.0), an der Küste zugeschnitten und vereinfacht.</li>
      <li>Kreise Estlands: Verwaltungsgliederung Estlands (EHAK), estnisches Amt für Land und Raumentwicklung (Republic of Estonia Land and Spatial Development Board), Daten vom 01.11.2026, vereinfacht, mit seiner <a href="https://geoportaal.maaruum.ee/opendata-licence">Lizenz für offene Daten</a>.</li>
      <li>Bezirke Zyperns: Amt für Land und Vermessung der Republik Zypern (Department of Lands and Surveys), INSPIRE-Verwaltungseinheiten, vereinfacht.</li>
      <li>Bezirke Moldaus: UNHCR und OCHA, Verwaltungsgrenzen Moldaus von 2020 (Lizenz CC BY 3.0 IGO), über <a href="https://www.geoboundaries.org/">geoBoundaries</a>, zugeschnitten und vereinfacht.</li>
      <li>Temperatur, Wolken und Wind von jetzt: Modell GFS (Global Forecast System) von NOAA/NCEP (gemeinfrei), aus dem Programm für offene Daten der NOAA. Es ist eine Vorhersage, keine Messung.</li>
      <li>Regen und Schnee von jetzt: IMERG, von der GPM-Mission der NASA, bereitgestellt über die Global Imagery Browse Services (GIBS) des ESDIS-Systems der NASA.</li>
      <li>Satelliten: GP-Bahnelemente von <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), auf Grundlage der Daten der U.S. Space Force; die Position jedes Satelliten wird im Browser mit dem Modell SGP4 berechnet (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, MIT-Lizenz).</li>
      <li>ISO-Codes und Flächen: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Flaggen: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (MIT-Lizenz).</li>
      <li>Nächtliche Lichter der Städte: Black Marble 2016, NASA Earth Observatory (gemeinfrei).</li>
      <li>Satellitenbild: Blue Marble Next Generation, NASA Earth Observatory (Juli 2004, gemeinfrei).</li>
      <li>Relief des Meeresbodens: ETOPO2v2, NOAA National Geophysical Data Center (gemeinfrei).</li>
      <li>Meeresströmungen: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), Mittel von Dezember 2011 bis September 2014, vom ERDDAP-Server von NOAA CoastWatch; die allgemeine Richtung jeder Strömung aus ihrem Artikel in der englischsprachigen Wikipedia.</li>
      <li>Tektonische Platten: Modell PB2002 von Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, in der Umwandlung von Hugo Ahlenius (Nordpil), Lizenz <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Vulkane: Vulkandatenbank von NOAA NCEI (gemeinfrei).</li>
      <li>Sterne: Yale Bright Star Catalogue, 5. Ausgabe (gemeinfrei), und Hipparcos-Katalog der Europäischen Weltraumorganisation (ESA, 1997).</li>
      <li>Milchstraße: „Deep Star Maps 2020“, NASA/Goddard Space Flight Center Scientific Visualization Studio, mit Daten von Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Zeitzonen: Zeitzonendatenbank der IANA, über <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (MIT-Lizenz).</li>
      <li>Illustrationen der Ebene „Comic-Planet“: Originalentwürfe, mit künstlicher Intelligenz nach einer eigenen Beschreibung erzeugt.</li>
      <li>Klimate: Weltkarte nach Köppen-Geiger von Kottek, Grieser, Beck, Rudolf und Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, zusammengefasst zu den Klimaten, die in der Sekundarstufe gelernt werden.</li>
      <li>Schriften: Besley und Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Externe Links</h2>
    <p>Die Website verlinkt auf Seiten Dritter, etwa auf PayPal für die Spenden, auf GitHub für den Quellcode und auf die Websites der Datenquellen. Der Inhaber kontrolliert diese Seiten nicht und haftet weder für ihre Inhalte noch für ihre Richtlinien.</p>

    <h2>Haftung</h2>
    <p>Der Inhaber garantiert nicht, dass die Website jederzeit verfügbar oder frei von Fehlern ist, und haftet nicht für Schäden, die aus ihrer Nutzung entstehen können, außer in den Fällen, in denen das Gesetz es verlangt.</p>

    <h2>Anwendbares Recht</h2>
    <p>Dieses Impressum unterliegt spanischem Recht. Die Informationen zur Verarbeitung personenbezogener Daten stehen in der <a href="${ruta('privacidad')}">Datenschutzerklärung</a> und die zu Cookies in der <a href="${ruta('cookies')}">Cookie-Richtlinie</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Datenschutzerklärung · Study World Map',
      description: 'Welche Daten Study World Map verarbeitet, wozu, und wie du deine Rechte ausübst. Die Anwendung hat keine Konten und speichert deinen Fortschritt auf deinem Gerät; nur wenn du es verlangst, wird er zusätzlich mit einem Code gespeichert, um ihn auf einem anderen zu nutzen.',
      body: `    <h1>Datenschutzerklärung</h1>
${traduccion('privacidad')}
    <p class="lead">Kurzfassung: Es gibt keine Konten und keine Formulare. Dein Fortschritt bleibt auf deinem Gerät, es sei denn, du erstellst einen Code, um ihn auf ein anderes mitzunehmen. Nur wenn du die Analyse-Cookies akzeptierst, werden Nutzungsdaten an Google Analytics gesendet.</p>

    <h2>Verantwortlicher</h2>
${titularBlock()}

    <h2>Welche Daten verarbeitet werden und wozu</h2>

    <h3>Fortschritt, Einstellungen und Lernlisten</h3>
    <p>Sie werden nur im lokalen Speicher deines Browsers gespeichert, damit du das Gelernte nicht verlierst. Sie werden an keinen Server gesendet, und der Inhaber hat keinen Zugriff darauf, es sei denn, du nutzt die Synchronisierung, die im Folgenden erklärt wird. Du kannst sie in der Anwendung selbst („Fortschritt“) löschen oder indem du die Websitedaten in deinem Browser löschst.</p>
    <h3>Auf einem anderen Gerät weitermachen (optional)</h3>
    <p>Wenn du unter „Fortschritt“ auf „Meinen Code erstellen“ tippst, wird dein Fortschritt auch in einer Datenbank gespeichert, damit du auf einem anderen Gerät weitermachen kannst. Gespeichert werden ausschließlich ein zufällig erzeugter Code aus zwölf Buchstaben und Ziffern, der Fortschritt (welche Länder oder geografischen Objekte du kannst, deine besten Noten und das Ergebnis der Tagesaufgabe) und das Datum. In der Datenbank werden weder dein Name noch deine E-Mail-Adresse noch deine IP-Adresse gespeichert, und der Code ist keiner Person zugeordnet. Die Lernlisten und die Einstellungen werden nicht gesendet.</p>
    <p>Die Datenbank befindet sich in der Europäischen Union (Frankfurt), beim Dienst Neon, und die Anfragen laufen über das Hosting der Website (Vercel), das wie bei jeder Website für begrenzte Zeit technische Daten jeder Anfrage protokolliert, darunter die IP-Adresse und die angeforderte Adresse. Wer den Code kennt, kann diesen Fortschritt sehen und ändern, teile ihn also nur mit wem du möchtest. Wenn du einen Link öffnest, der den Code enthält (den des QR-Codes), ist dieser Code Teil der Adresse dieses Besuchs und damit dessen, was das Hosting protokolliert. Die Anwendung entfernt ihn sofort beim Öffnen aus der Adresse, bevor die Analyse geladen wird, damit er nicht zu Google gelangt.</p>
    <p>Du kannst das Gespeicherte jederzeit mit „Mit diesem Code Gespeichertes löschen“ löschen. „Synchronisierung beenden“ trennt nur das Gerät, auf dem du es antippst: Das Gespeicherte bleibt für deine anderen Geräte erhalten. Was länger als ein Jahr nicht genutzt wurde, wird gelöscht.</p>
    <p><strong>Rechtsgrundlage:</strong> deine Einwilligung, die du mit dem Tippen auf „Meinen Code erstellen“ gibst (Art. 6.1.a DSGVO). Du kannst sie jederzeit widerrufen, indem du das Gespeicherte löschst.</p>
    <p><strong>Anbieter:</strong> Neon, der Datenbankdienst, der als Auftragsverarbeiter handelt. Die Daten werden in seinem Rechenzentrum in Frankfurt gespeichert. Neon gehört zu einem Unternehmen aus den Vereinigten Staaten: Würde es von außerhalb des Europäischen Wirtschaftsraums darauf zugreifen, geschähe dies mit den Garantien, die die DSGVO für internationale Übermittlungen verlangt.</p>

    <h3>Rangliste der Ergebnisse (optional)</h3>
    <p>Am Ende einer Runde kannst du dein Ergebnis in der Rangliste dieser Aufgabe veröffentlichen. Es wird nichts gesendet, wenn du nicht auf „Veröffentlichen“ tippst. In der Datenbank gespeichert werden, und für jeden sichtbar, der diese Rangliste aufruft, der Spitzname, den du eingibst, deine Note, deine Zeit, das Datum und das Land, von dem aus du dich verbindest (nur seine zwei Buchstaben, um die Flagge zu zeigen). Das Land gibt das Hosting anhand deiner IP-Adresse im Moment der Veröffentlichung an; die IP-Adresse wird nicht in der Datenbank gespeichert.</p>
    <p>Der Spitzname darf weder deinen Vornamen noch deinen Nachnamen noch andere personenbezogene Daten enthalten: Die Anwendung schlägt dir einen vor und erinnert dich beim Eingeben daran. Er ist keinem Konto und keiner Person zugeordnet, und jeder kann denselben verwenden. Aufbewahrt werden nur die zehn besten Ergebnisse jeder Rangliste: Die übrigen werden gelöscht, sobald sie übertroffen werden, und die der Tagesaufgabe nach 45 Tagen. Wenn du möchtest, dass ein von dir veröffentlichtes Ergebnis gelöscht wird, oder einen Spitznamen siehst, der dort nicht stehen sollte, schreib an ${email()} und nenne den Spitznamen und die Aufgabe.</p>
    <p><strong>Rechtsgrundlage:</strong> deine Einwilligung, die du mit dem Tippen auf „Veröffentlichen“ gibst (Art. 6.1.a DSGVO).</p>

    <h3>Standort</h3>
    <p>Die Funktion „Echtzeit“ zeigt deine Position auf der Karte anhand der Zeitzone deines Geräts, ohne dich um etwas zu bitten. Wenn du auf die Schaltfläche für den genauen Standort tippst, bittet dich dein Browser um Erlaubnis, und die Anwendung verwendet deine gerundete Position (etwa 1 km). In beiden Fällen wird der Standort nur auf dem Bildschirm verwendet: Er wird weder gespeichert noch irgendwohin gesendet.</p>

    <h3>Wetter</h3>
    <p>Wenn du eine der Wetterebenen (Temperatur, Wolken, Regen oder Wind) einschaltest, fragt die Anwendung diese Daten bei dieser Website selbst an, die sie ihrerseits von der NOAA und der NASA bezieht. Diese Einrichtungen erhalten nichts von dir, nicht einmal deine IP-Adresse, und es wird nichts gespeichert.</p>

    <h3>Satelliten</h3>
    <p>Wenn du die Satellitenebene einschaltest, fragt die Anwendung ihre Bahnen bei dieser Website selbst an, die sie ihrerseits von CelesTrak bezieht. CelesTrak erhält nichts von dir, nicht einmal deine IP-Adresse, und es wird nichts gespeichert. Die Position jedes Satelliten wird in deinem Browser berechnet.</p>

    <h3>Analyse (nur mit deiner Einwilligung)</h3>
    <p>Wenn du die Analyse-Cookies akzeptierst, werden Google Tag Manager und Google Analytics 4 geladen, um die Besuche zu zählen und zu erfahren, welche Teile der Website genutzt werden, mit dem einzigen Zweck, sie zu verbessern. Verarbeitet werden technische Daten und Nutzungsdaten: Cookie-Kennungen, aufgerufene Seiten, Art des Geräts und des Browsers, Sprache sowie ungefähres Land oder ungefähre Stadt. Sie werden nicht für Werbung und nicht zur Erstellung kommerzieller Profile verwendet.</p>
    <ul>
      <li><strong>Rechtsgrundlage:</strong> deine Einwilligung (Art. 6.1.a DSGVO). Du kannst sie jederzeit in den ${consentLink} widerrufen, ohne dass dies das zuvor Verarbeitete berührt.</li>
      <li><strong>Anbieter:</strong> Google Ireland Limited, das als Auftragsverarbeiter handelt. Google kann Daten in die Vereinigten Staaten übermitteln, gestützt auf den EU-US-Datenschutzrahmen und auf Standardvertragsklauseln.</li>
      <li><strong>Speicherdauer:</strong> die in der Google-Analytics-Property eingestellte, höchstens 14 Monate.</li>
    </ul>
    <p>Wenn du ablehnst oder nicht antwortest, lädt die Website nichts von Google.</p>

    <h3>E-Mail</h3>
    <p>Wenn du an ${email()} schreibst, werden deine Adresse und deine Nachricht verwendet, um dir zu antworten, auf Grundlage deiner eigenen Anfrage. Sie werden aufbewahrt, solange die Unterhaltung dauert, und danach gelöscht, es sei denn, sie müssen aufgrund einer gesetzlichen Pflicht aufbewahrt werden.</p>

    <h3>Spenden</h3>
    <p>Die Spenden erfolgen über PayPal, das die Zahlungsdaten als eigenständiger Verantwortlicher gemäß seiner eigenen Datenschutzerklärung verarbeitet. Der Inhaber erhält von PayPal den Namen, die E-Mail-Adresse und den Betrag der spendenden Person und verwendet sie nur, um die Spende abzuwickeln, sich dafür zu bedanken und seine steuerlichen Pflichten zu erfüllen, für die gesetzlich vorgeschriebene Dauer.</p>

    <h3>Hosting</h3>
    <p>Die Website wird bei Vercel Inc. gehostet. Wie jeder Webserver protokolliert es für begrenzte Zeit technische Daten jedes Besuchs (wie die IP-Adresse), um die Website auszuliefern und sie vor Missbrauch zu schützen. Vercel handelt als Auftragsverarbeiter, mit den Garantien der DSGVO für internationale Übermittlungen.</p>
    <p><strong>Rechtsgrundlage:</strong> das berechtigte Interesse des Inhabers, die Website ausliefern und sicher halten zu können (Art. 6.1.f DSGVO).</p>

    <h2>Minderjährige</h2>
    <p>Study World Map ist für Schülerinnen und Schüler gedacht. Für die Nutzung werden keine personenbezogenen Daten verlangt. Wenn du jünger als 14 Jahre bist, bitte deine Mutter, deinen Vater oder die Person, die für dich sorgt, zu entscheiden, ob die Analyse-Cookies akzeptiert werden und ob du deine Ergebnisse in der Rangliste veröffentlichen darfst (Art. 7 der Ley Orgánica 3/2018, des spanischen Datenschutzgesetzes).</p>

    <h2>Deine Rechte</h2>
    <p>Du kannst Auskunft über deine Daten, ihre Berichtigung oder Löschung und die Einschränkung ihrer Verarbeitung verlangen, ihr widersprechen oder ihre Übertragbarkeit verlangen, indem du an ${email()} schreibst. Da wir nicht wissen, wem welcher Synchronisierungscode gehört, brauchen wir für eine Anfrage zu einem gespeicherten Fortschritt, dass du uns den Code nennst. Wenn du meinst, dass deine Rechte nicht gewahrt wurden, kannst du Beschwerde bei der <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a> (spanische Datenschutzbehörde) einlegen.</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Cookie-Richtlinie · Study World Map',
      description: 'Welche Cookies und welchen lokalen Speicher Study World Map verwendet und wie du deine Auswahl änderst.',
      body: `    <h1>Cookie-Richtlinie</h1>
${traduccion('cookies')}
    <p class="lead">Die einzigen Cookies sind die von Google Analytics, und sie werden nur gesetzt, wenn du sie akzeptierst. Alles andere ist lokaler Speicher, den die Anwendung zum Funktionieren braucht.</p>
    <p><a class="cta" href="#cookies">Meine Auswahl ändern</a></p>

    <h2>Analyse-Cookies (erfordern Einwilligung)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Name</th><th scope="col">Anbieter</th><th scope="col">Wozu es dient</th><th scope="col">Dauer</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Besucher anonym unterscheiden.</td><td>2 Jahre</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Den Zustand der Sitzung beibehalten.</td><td>2 Jahre</td></tr>
      </tbody>
    </table></div>
    <p>Es sind eigene Cookies der Domain, aber sie werden von Google verwaltet. Mehr Informationen in der <a href="${ruta('privacidad')}">Datenschutzerklärung</a> und in der <a href="https://policies.google.com/technologies/cookies?hl=es">Erklärung von Google</a>.</p>

    <h2>Technischer Speicher (erfordert keine Einwilligung)</h2>
    <p>Es sind keine Cookies: Sie werden nur in deinem Browser gespeichert, an keinen Server gesendet (außer dem Fortschritt, wenn du einen Code erstellst, um ihn auf ein anderes Gerät mitzunehmen, und dem Spitznamen, wenn du ein Ergebnis in der Rangliste veröffentlichst) und sind notwendig, damit die Anwendung so funktioniert, wie du es verlangst.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Name</th><th scope="col">Wozu es dient</th><th scope="col">Dauer</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Design, Ansicht, gewählte Aufgabe, Lernlisten und ob du den Sprachhinweis geschlossen hast.</td><td>Bis du es löschst</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Was du schon kannst und deine besten Noten.</td><td>Bis du es löschst</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Dein Code, um auf einem anderen Gerät weiterzumachen, falls du ihn erstellt hast.</td><td>Bis du die Synchronisierung beendest</td></tr>
        <tr><td><code>swm:apodo</code></td><td>Der letzte Spitzname, mit dem du in der Rangliste veröffentlicht hast, um ihn dir beim nächsten Mal vorzuschlagen.</td><td>Bis du es löschst</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Sich merken, dass du „Jetzt nicht“ gesagt hast, als dir am Ende einer Runde angeboten wurde, einen Code zu erstellen.</td><td>Bis du es löschst</td></tr>
        <tr><td><code>swm:consent</code></td><td>Sich merken, ob du die Cookies akzeptiert oder abgelehnt hast, und wann.</td><td>Zwei Jahre; danach wirst du erneut gefragt</td></tr>
        <tr><td>Cache <code>swm-*</code></td><td>Kopie der Anwendung, um sie offline zu nutzen.</td><td>Bis zur nächsten Version</td></tr>
      </tbody>
    </table></div>

    <h2>Wie du deine Einwilligung änderst oder widerrufst</h2>
    <p>Jederzeit in den ${consentLink} (auch in der Fußzeile jeder Seite). Wenn du ablehnst, lädt die Website Google Analytics nicht mehr und löscht dessen Cookies. Deine Auswahl, wie auch immer sie ausfällt, gilt zwei Jahre: Nach Ablauf dieser Zeit wirst du erneut gefragt. Außerdem kannst du die Cookies und die Websitedaten in den Einstellungen deines Browsers löschen; wenn du das tust, wird auch dein Fortschritt gelöscht.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Unterstütze Study World Map mit einer Spende',
      description: 'Study World Map ist kostenlos, ohne Werbung und ohne Anmeldung. Wenn es dir beim Lernen hilft, kannst du es mit einer Spende unterstützen.',
      body: `    <h1>Unterstütze Study World Map</h1>
    <p class="lead">Study World Map ist für alle Schülerinnen und Schüler kostenlos und wird es bleiben: ohne Werbung, ohne Konten und ohne Verkauf deiner Daten. Wenn es dir oder deiner Klasse geholfen hat, hilft eine Spende, es am Leben zu erhalten.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Mit PayPal spenden →</a></p>

    <h2>Wofür sie verwendet wird</h2>
    <ul>
      <li>Die Domain und das Hosting unterhalten.</li>
      <li>Die Daten prüfen und korrigieren: Länder, Hauptstädte, Grenzen, Flaggen, physische Geografie und Übersetzungen.</li>
      <li>Neue Aufgaben hinzufügen und die Barrierefreiheit verbessern.</li>
    </ul>

    <h2>Vor dem Spenden</h2>
    <ul>
      <li>Die Spende ist freiwillig und gibt keinen Zugang zu irgendetwas Zusätzlichem: Die Anwendung ist für alle gleich.</li>
      <li>Die Zahlung erfolgt über PayPal; Study World Map sieht und speichert die Daten deiner Karte nicht.</li>
      <li>Study World Map ist ein persönliches Projekt, keine Stiftung und kein Verein, daher ist die Spende in der Einkommensteuererklärung nicht absetzbar.</li>
    </ul>
    <p>Möchtest du lieber auf andere Weise helfen? Teile es mit deiner Klasse oder schreib an ${email()}, wenn du einen Fehler findest.</p>`,
    },
  ];
}
