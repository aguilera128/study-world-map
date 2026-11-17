// Testi legali e delle donazioni in italiano: traduzione di ./es.mjs, con la stessa struttura.
// In caso di discrepanza prevale l’originale in spagnolo, e ogni pagina legale lo dice.
// Li riunisce ../legales.mjs, che spiega che cosa riceve «paginas».

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'note-legali', privacidad: 'privacy', cookies: 'cookie', donar: 'dona' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta, original }) {
  const revision = `    <p><small>Ultima revisione: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">impostazioni dei cookie</a>`;
  const traduccion = (id) =>
    `    <p><em>Questa è una traduzione a titolo informativo. In caso di discrepanza prevale la <a href="${original(id)}" hreflang="es" lang="es">versione originale in spagnolo</a>.</em></p>`;

  const titularBlock = () => `    <ul>
        <li><strong>Titolare:</strong> ${dato(TITULAR.nombre)}</li>
        <li><strong>NIF (codice fiscale spagnolo):</strong> ${dato(TITULAR.nif)}</li>
        <li><strong>Domicilio:</strong> ${dato(TITULAR.domicilio)}</li>
        <li><strong>Posta elettronica:</strong> ${email()}</li>
        <li><strong>Sito web:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
      </ul>`;


  return [
    {
      id: 'aviso',
      title: 'Note legali · Study World Map',
      description: 'Dati del titolare, condizioni d’uso e proprietà intellettuale di Study World Map.',
      body: `    <h1>Note legali</h1>
${traduccion('aviso')}
    <h2>Titolare del sito web</h2>
    <p>In adempimento dell’articolo 10 della Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE, la legge spagnola sui servizi della società dell’informazione e sul commercio elettronico), questi sono i dati del titolare:</p>
${titularBlock()}

    <h2>Oggetto</h2>
    <p>Study World Map è un progetto educativo personale: un atlante interattivo per studiare la geografia giocando. Insegna i paesi del mondo, i loro continenti, le loro capitali e le loro bandiere; le province, gli stati o le regioni di più di trenta paesi; la geografia fisica, i climi e la popolazione; l’interno della Terra e gli strati dell’atmosfera; e, dal vivo, il giorno e la notte, il meteo e i satelliti. È gratuito, non ha pubblicità, non vende nulla e non richiede registrazione. Si mantiene con il tempo del suo autore e con le <a href="${ruta('donar')}">donazioni volontarie</a> di chi voglia sostenerlo.</p>

    <h2>Condizioni d’uso</h2>
    <p>L’uso del sito è libero e gratuito. Usandolo ti impegni a farlo in modo lecito, senza danneggiare il sito né impedire ad altri di usarlo. Puoi condividere i link e gli elenchi di studio con chi vuoi, per esempio con la tua classe.</p>

    <h2>Esattezza dei contenuti</h2>
    <p>I dati geografici hanno finalità educative e vengono rivisti con cura, ma possono contenere errori o risultare non aggiornati. I confini provengono da Natural Earth e alcune decisioni (per esempio, quali territori si contano come paesi) sono spiegate nell’applicazione stessa; non esprimono alcuna posizione politica. Se trovi un errore, scrivi a ${email()} e lo correggeremo.</p>

    <h2>Proprietà intellettuale</h2>
    <p>Il design, il codice e i testi di Study World Map sono opera del suo titolare e, se del caso, delle persone che contribuiscono al progetto, che pubblicano i loro contributi con la stessa licenza.</p>
    <p>Study World Map è software libero: il suo codice sorgente è pubblicato su <a href="https://github.com/aguilera128/study-world-map">GitHub</a> con la licenza <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, versione 3 (AGPL-3.0)</a>. Chiunque può usarlo, studiarlo, modificarlo e ridistribuirlo alle condizioni di quella licenza; chi pubblica una versione modificata su un sito web deve offrirne anche il codice sorgente. La licenza non copre il nome «Study World Map», il dominio né l’icona.</p>
    <p>I dati di terzi sono usati in conformità alle loro licenze:</p>
    <ul>
      <li>Cartografia: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (pubblico dominio).</li>
      <li>Nomi di paesi, suddivisioni, capitali ed elementi geografici in altre lingue: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Popolazione: Banca Mondiale, indicatore «Popolazione, totale» (SP.POP.TOTL), licenza CC BY 4.0; quella dei paesi che non sono in quella serie, Wikidata.</li>
      <li>Regioni degli Stati Uniti: le quattro regioni dell’Ufficio del Censimento (U.S. Census Bureau).</li>
      <li>Regioni della Finlandia: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unità statistiche per comuni del 2026 (licenza CC BY 4.0), semplificate.</li>
      <li>Contee della Norvegia: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, «Administrative enheter fylker» del 2026 (licenza CC BY 4.0), ritagliate lungo la costa e semplificate.</li>
      <li>Contee dell’Estonia: divisione amministrativa dell’Estonia (EHAK), Ente estone per il territorio e lo sviluppo territoriale (Republic of Estonia Land and Spatial Development Board), dati del 01.11.2026, semplificati, con la sua <a href="https://geoportaal.maaruum.ee/opendata-licence">licenza di dati aperti</a>.</li>
      <li>Distretti di Cipro: Dipartimento del territorio e del catasto della Repubblica di Cipro (Department of Lands and Surveys), unità amministrative INSPIRE, semplificati.</li>
      <li>Distretti della Moldavia: UNHCR e OCHA, confini amministrativi della Moldavia del 2020 (licenza CC BY 3.0 IGO), tramite <a href="https://www.geoboundaries.org/">geoBoundaries</a>, ritagliati e semplificati.</li>
      <li>Temperatura, nuvole e vento di adesso: modello GFS (Global Forecast System) di NOAA/NCEP (pubblico dominio), del programma di dati aperti della NOAA. È una previsione, non una misurazione.</li>
      <li>Pioggia e neve di adesso: IMERG, della missione GPM della NASA, fornito dai Global Imagery Browse Services (GIBS) del sistema ESDIS della NASA.</li>
      <li>Satelliti: elementi orbitali GP di <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), a partire dai dati della U.S. Space Force; la posizione di ogni satellite è calcolata nel browser con il modello SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, licenza MIT).</li>
      <li>Codici ISO e superfici: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Bandiere: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licenza MIT).</li>
      <li>Luci notturne delle città: Black Marble 2016, NASA Earth Observatory (pubblico dominio).</li>
      <li>Immagine satellitare: Blue Marble Next Generation, NASA Earth Observatory (luglio 2004, pubblico dominio).</li>
      <li>Rilievo del fondale marino: ETOPO2v2, NOAA National Geophysical Data Center (pubblico dominio).</li>
      <li>Correnti oceaniche: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), media da dicembre 2011 a settembre 2014, dal server ERDDAP di NOAA CoastWatch; la direzione generale di ogni corrente, dal suo articolo nella Wikipedia in inglese.</li>
      <li>Placche tettoniche: modello PB2002 di Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, nella conversione di Hugo Ahlenius (Nordpil), licenza <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Vulcani: banca dati dei vulcani di NOAA NCEI (pubblico dominio).</li>
      <li>Stelle: Yale Bright Star Catalogue, 5ª edizione (pubblico dominio), e catalogo Hipparcos dell’Agenzia Spaziale Europea (ESA, 1997).</li>
      <li>Via Lattea: «Deep Star Maps 2020», NASA/Goddard Space Flight Center Scientific Visualization Studio, con dati di Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Fusi orari: banca dati dei fusi orari della IANA, tramite <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (licenza MIT).</li>
      <li>Illustrazioni del livello «Pianeta a cartoni»: disegni originali generati con l’intelligenza artificiale a partire da una descrizione propria.</li>
      <li>Climi: mappa mondiale di Köppen-Geiger di Kottek, Grieser, Beck, Rudolf e Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, raggruppata nei climi che si studiano nella scuola secondaria.</li>
      <li>Caratteri tipografici: Besley e Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Link esterni</h2>
    <p>Il sito rimanda a pagine di terzi, come PayPal per le donazioni, GitHub per il codice sorgente e i siti delle fonti dei dati. Il titolare non controlla quelle pagine né risponde dei loro contenuti o delle loro politiche.</p>

    <h2>Responsabilità</h2>
    <p>Il titolare non garantisce che il sito sia disponibile in ogni momento né privo di errori, e non risponde dei danni che possano derivare dal suo uso, salvo nei casi in cui la legge lo esiga.</p>

    <h2>Legge applicabile</h2>
    <p>Queste note legali sono regolate dalla legge spagnola. Le informazioni sul trattamento dei dati personali si trovano nell’<a href="${ruta('privacidad')}">informativa sulla privacy</a> e quelle sui cookie, nell’<a href="${ruta('cookies')}">informativa sui cookie</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Informativa sulla privacy · Study World Map',
      description: 'Quali dati tratta Study World Map, a quale scopo e come esercitare i tuoi diritti. L’applicazione non ha account e salva i tuoi progressi sul tuo dispositivo; solo se lo chiedi tu vengono salvati anche con un codice per usarli su un altro.',
      body: `    <h1>Informativa sulla privacy</h1>
${traduccion('privacidad')}
    <p class="lead">In sintesi: non ci sono account né moduli. I tuoi progressi restano sul tuo dispositivo, a meno che tu non crei un codice per portarli su un altro. Solo se accetti i cookie di analisi vengono inviati dati d’uso a Google Analytics.</p>

    <h2>Titolare del trattamento</h2>
${titularBlock()}

    <h2>Quali dati vengono trattati e a quale scopo</h2>

    <h3>Progressi, impostazioni ed elenchi di studio</h3>
    <p>Sono salvati solo nella memoria locale del tuo browser, perché tu non perda ciò che hai imparato. Non vengono inviati a nessun server e il titolare non vi ha accesso, a meno che tu non usi la sincronizzazione spiegata qui di seguito. Puoi cancellarli dall’applicazione stessa («Progressi») o cancellando i dati del sito nel tuo browser.</p>
    <h3>Continuare su un altro dispositivo (facoltativo)</h3>
    <p>Se in «Progressi» premi «Crea il mio codice», i tuoi progressi vengono salvati anche in una banca dati perché tu possa continuare su un altro dispositivo. Vengono salvati unicamente un codice di dodici lettere e cifre generato a caso, i progressi (quali paesi o elementi geografici sai, i tuoi voti migliori e il risultato della sfida del giorno) e la data. Nella banca dati non vengono salvati il tuo nome, la tua posta elettronica né il tuo indirizzo IP, e il codice non è associato a nessuna persona. Gli elenchi di studio e le impostazioni non vengono inviati.</p>
    <p>La banca dati si trova nell’Unione Europea (Francoforte), nel servizio Neon, e le richieste passano per l’hosting del sito (Vercel), che come in qualsiasi sito registra per un tempo limitato dati tecnici di ogni richiesta, tra cui l’indirizzo IP e l’indirizzo richiesto. Chi conosce il codice può vedere e modificare quei progressi, quindi condividilo solo con chi vuoi. Se apri un link che contiene il codice (quello del codice QR), quel codice fa parte dell’indirizzo di quella visita, e quindi di ciò che registra l’hosting. L’applicazione lo toglie dall’indirizzo appena si apre, prima di caricare l’analisi, perché non arrivi a Google.</p>
    <p>Puoi cancellare ciò che è salvato in qualsiasi momento con «Elimina ciò che è salvato con questo codice». «Interrompi la sincronizzazione» scollega soltanto il dispositivo su cui lo premi: ciò che è salvato resta lì per i tuoi altri dispositivi. Ciò che non viene usato da più di un anno viene cancellato.</p>
    <p><strong>Base giuridica:</strong> il tuo consenso, che dai premendo «Crea il mio codice» (art. 6.1.a del GDPR). Puoi revocarlo quando vuoi cancellando ciò che è salvato.</p>
    <p><strong>Fornitore:</strong> Neon, il servizio di banca dati, che agisce come responsabile del trattamento. I dati sono conservati nel suo centro di Francoforte. Neon appartiene a un’impresa degli Stati Uniti: se vi accedesse da fuori dello Spazio Economico Europeo, lo farebbe con le garanzie che il GDPR esige per i trasferimenti internazionali.</p>

    <h3>Classifica dei risultati (facoltativo)</h3>
    <p>Al termine di una partita puoi pubblicare il tuo risultato nella classifica di quella sfida. Non viene inviato nulla se non premi «Pubblica». Vengono salvati nella banca dati, e li vede chiunque consulti quella classifica, il soprannome che scrivi, il tuo voto, il tuo tempo, la data e il paese da cui ti colleghi (solo le sue due lettere, per mostrare la bandiera). Il paese lo indica l’hosting a partire dal tuo indirizzo IP nel momento della pubblicazione; l’indirizzo IP non viene salvato nella banca dati.</p>
    <p>Il soprannome non deve contenere il tuo nome, il tuo cognome né altri dati personali: l’applicazione te ne propone uno e te lo ricorda mentre lo scrivi. Non è associato a nessun account né a nessuna persona, e chiunque può usare lo stesso. Si conservano solo i dieci migliori risultati di ogni classifica: gli altri vengono cancellati quando sono superati, e quelli della sfida del giorno, dopo 45 giorni. Se vuoi che venga cancellato un risultato che hai pubblicato, o vedi un soprannome che non dovrebbe esserci, scrivi a ${email()} indicando il soprannome e la sfida.</p>
    <p><strong>Base giuridica:</strong> il tuo consenso, che dai premendo «Pubblica» (art. 6.1.a del GDPR).</p>

    <h3>Posizione</h3>
    <p>La funzione «Tempo reale» colloca la tua posizione sulla mappa a partire dal fuso orario del tuo dispositivo, senza chiederti nulla. Se premi il pulsante della posizione esatta, il tuo browser ti chiederà il permesso e l’applicazione userà la tua posizione arrotondata (circa 1 km). In entrambi i casi la posizione viene usata solo sullo schermo: non viene salvata né inviata da nessuna parte.</p>

    <h3>Meteorologia</h3>
    <p>Se attivi uno dei livelli di meteorologia (temperatura, nuvole, pioggia o vento), l’applicazione chiede quei dati a questo stesso sito, che a sua volta li ottiene dalla NOAA e dalla NASA. A quegli enti non arriva nulla di tuo, nemmeno il tuo indirizzo IP, e non viene salvato nulla.</p>

    <h3>Satelliti</h3>
    <p>Se attivi il livello dei satelliti, l’applicazione chiede le loro orbite a questo stesso sito, che a sua volta le ottiene da CelesTrak. A CelesTrak non arriva nulla di tuo, nemmeno il tuo indirizzo IP, e non viene salvato nulla. La posizione di ogni satellite è calcolata nel tuo browser.</p>

    <h3>Analisi (solo con il tuo consenso)</h3>
    <p>Se accetti i cookie di analisi, vengono caricati Google Tag Manager e Google Analytics 4 per contare le visite e sapere quali parti del sito vengono usate, al solo fine di migliorarlo. Vengono trattati dati tecnici e d’uso: identificatori di cookie, pagine viste, tipo di dispositivo e browser, lingua, e paese o città approssimativi. Non vengono usati per la pubblicità né per creare profili commerciali.</p>
    <ul>
      <li><strong>Base giuridica:</strong> il tuo consenso (art. 6.1.a del GDPR). Puoi revocarlo quando vuoi dalle ${consentLink}, senza che ciò incida su quanto trattato prima.</li>
      <li><strong>Fornitore:</strong> Google Ireland Limited, che agisce come responsabile del trattamento. Google può trasferire dati negli Stati Uniti, nel quadro del Data Privacy Framework UE-USA e di clausole contrattuali tipo.</li>
      <li><strong>Conservazione:</strong> quella configurata nella proprietà di Google Analytics, al massimo 14 mesi.</li>
    </ul>
    <p>Se rifiuti o non rispondi, il sito non carica nulla di Google.</p>

    <h3>Posta elettronica</h3>
    <p>Se scrivi a ${email()}, il tuo indirizzo e il tuo messaggio vengono usati per risponderti, sulla base della tua stessa richiesta. Si conservano finché dura la conversazione e vengono cancellati dopo, salvo che si debbano conservare per obbligo di legge.</p>

    <h3>Donazioni</h3>
    <p>Le donazioni si fanno su PayPal, che tratta i dati del pagamento come titolare autonomo secondo la propria informativa sulla privacy. Il titolare riceve da PayPal il nome, la posta elettronica e l’importo di chi dona, e li usa solo per gestire la donazione, ringraziare e adempiere ai propri obblighi fiscali, per il periodo che la legge esige.</p>

    <h3>Hosting</h3>
    <p>Il sito è ospitato da Vercel Inc. Come qualsiasi server web, registra dati tecnici di ogni visita (come l’indirizzo IP) per un tempo limitato, per servire il sito e proteggerlo dagli abusi. Vercel agisce come responsabile del trattamento, con le garanzie del GDPR per i trasferimenti internazionali.</p>
    <p><strong>Base giuridica:</strong> il legittimo interesse del titolare a poter servire il sito e mantenerlo sicuro (art. 6.1.f del GDPR).</p>

    <h2>Minori</h2>
    <p>Study World Map è pensato per studenti. Non chiede dati personali per essere usato. Se hai meno di 14 anni, chiedi a tua madre, a tuo padre o alla persona che si prende cura di te di decidere se accettare i cookie di analisi e se puoi pubblicare i tuoi risultati nella classifica (art. 7 della Ley Orgánica 3/2018, la legge organica spagnola sulla protezione dei dati).</p>

    <h2>I tuoi diritti</h2>
    <p>Puoi chiedere l’accesso, la rettifica o la cancellazione dei tuoi dati, la limitazione del loro trattamento, opporti ad esso o chiederne la portabilità, scrivendo a ${email()}. Poiché non sappiamo di chi sia ciascun codice di sincronizzazione, per dare seguito a una richiesta su dei progressi salvati abbiamo bisogno che tu ci indichi il codice. Se ritieni che i tuoi diritti non siano stati rispettati, puoi presentare reclamo all’<a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a> (l’autorità spagnola per la protezione dei dati).</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Informativa sui cookie · Study World Map',
      description: 'Quali cookie e quale memoria locale usa Study World Map e come cambiare la tua scelta.',
      body: `    <h1>Informativa sui cookie</h1>
${traduccion('cookies')}
    <p class="lead">Gli unici cookie sono quelli di Google Analytics, e vengono installati solo se li accetti. Il resto è memoria locale di cui l’applicazione ha bisogno per funzionare.</p>
    <p><a class="cta" href="#cookies">Cambia la mia scelta</a></p>

    <h2>Cookie di analisi (richiedono il consenso)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">Fornitore</th><th scope="col">A che cosa serve</th><th scope="col">Durata</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguere i visitatori in forma anonima.</td><td>2 anni</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Mantenere lo stato della sessione.</td><td>2 anni</td></tr>
      </tbody>
    </table></div>
    <p>Sono cookie propri del dominio, ma li gestisce Google. Maggiori informazioni nell’<a href="${ruta('privacidad')}">informativa sulla privacy</a> e nella <a href="https://policies.google.com/technologies/cookies?hl=es">spiegazione di Google</a>.</p>

    <h2>Memoria tecnica (non richiede il consenso)</h2>
    <p>Non sono cookie: sono salvati solo nel tuo browser, non vengono inviati a nessun server (salvo i progressi, se crei un codice per portarli su un altro dispositivo, e il soprannome, se pubblichi un risultato nella classifica) e sono necessari perché l’applicazione funzioni come chiedi.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nome</th><th scope="col">A che cosa serve</th><th scope="col">Durata</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, vista, sfida scelta, elenchi di studio e se hai chiuso l’avviso sulla lingua.</td><td>Finché non la cancelli</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Ciò che sai già e i tuoi voti migliori.</td><td>Finché non la cancelli</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Il tuo codice per continuare su un altro dispositivo, se lo hai creato.</td><td>Finché non interrompi la sincronizzazione</td></tr>
        <tr><td><code>swm:apodo</code></td><td>L’ultimo soprannome con cui hai pubblicato nella classifica, per proportelo la prossima volta.</td><td>Finché non la cancelli</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Ricordare che hai detto «Non ora» quando ti viene offerto di creare un codice al termine di una partita.</td><td>Finché non la cancelli</td></tr>
        <tr><td><code>swm:consent</code></td><td>Ricordare se hai accettato o rifiutato i cookie, e quando.</td><td>Due anni; dopo ti viene chiesto di nuovo</td></tr>
        <tr><td>Cache <code>swm-*</code></td><td>Copia dell’applicazione per usarla offline.</td><td>Fino alla versione successiva</td></tr>
      </tbody>
    </table></div>

    <h2>Come cambiare o revocare il tuo consenso</h2>
    <p>In qualsiasi momento, dalle ${consentLink} (anche nel piè di ogni pagina). Se rifiuti, il sito smette di caricare Google Analytics e cancella i suoi cookie. La tua scelta, qualunque essa sia, vale due anni: trascorso quel tempo ti viene chiesto di nuovo. Inoltre, puoi cancellare i cookie e i dati del sito dalle impostazioni del tuo browser; se lo fai, verranno cancellati anche i tuoi progressi.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Sostieni Study World Map con una donazione',
      description: 'Study World Map è gratis, senza annunci e senza registrazione. Se ti aiuta a studiare, puoi sostenerlo con una donazione.',
      body: `    <h1>Sostieni Study World Map</h1>
    <p class="lead">Study World Map è gratis per tutti gli studenti e continuerà a esserlo: senza annunci, senza account e senza vendere i tuoi dati. Se ha aiutato te o la tua classe, una donazione aiuta a mantenerlo vivo.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Dona con PayPal →</a></p>

    <h2>A che cosa è destinata</h2>
    <ul>
      <li>Mantenere il dominio e l’hosting.</li>
      <li>Rivedere e correggere i dati: paesi, capitali, confini, bandiere, geografia fisica e traduzioni.</li>
      <li>Aggiungere nuove sfide e migliorare l’accessibilità.</li>
    </ul>

    <h2>Prima di donare</h2>
    <ul>
      <li>La donazione è volontaria e non dà accesso a nulla in più: l’applicazione è uguale per tutti.</li>
      <li>Il pagamento si fa su PayPal; Study World Map non vede né conserva i dati della tua carta.</li>
      <li>Study World Map è un progetto personale, non una fondazione né un’associazione, quindi la donazione non è detraibile nella dichiarazione dei redditi.</li>
    </ul>
    <p>Preferisci aiutare in un altro modo? Condividilo con la tua classe o scrivi a ${email()} se trovi un errore.</p>`,
    },
  ];
}
