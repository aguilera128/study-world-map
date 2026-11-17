// Textos legales y de donaciones en español: el original. Los demás idiomas (los otros ficheros de
// esta carpeta) son su traducción, con la misma estructura, y avisan de que en caso de duda manda
// este. Los reúne ../legales.mjs, que explica qué recibe «paginas».

/** El tramo de la dirección de cada página en este idioma. */
export const rutas = { aviso: 'aviso-legal', privacidad: 'privacidad', cookies: 'cookies', donar: 'donar' };

export function paginas({ TITULAR, SITE, DONAR_URL, dato, email, esc, fecha, ruta }) {
  const revision = `    <p><small>Última revisión: ${fecha}.</small></p>`;
  const consentLink = `<a href="#cookies">configuración de cookies</a>`;

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
      description: 'Datos del titular, condiciones de uso y propiedad intelectual de Study World Map.',
      body: `    <h1>Aviso legal</h1>
    <h2>Titular del sitio web</h2>
    <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), estos son los datos del titular:</p>
${titularBlock()}

    <h2>Objeto</h2>
    <p>Study World Map es un proyecto educativo personal: un atlas interactivo para estudiar geografía jugando. Enseña los países del mundo, sus continentes, sus capitales y sus banderas; las provincias, los estados o las regiones de más de treinta países; la geografía física, los climas y la población; el interior de la Tierra y las capas de la atmósfera; y, en vivo, el día y la noche, el tiempo y los satélites. Es gratuito, no tiene publicidad, no vende nada y no requiere registro. Se mantiene con el tiempo de su autor y con las <a href="${ruta('donar')}">donaciones voluntarias</a> de quien quiera apoyarlo.</p>

    <h2>Condiciones de uso</h2>
    <p>El uso del sitio es libre y gratuito. Al usarlo te comprometes a hacerlo de forma lícita, sin dañar el sitio ni impedir que otros lo usen. Puedes compartir los enlaces y las listas de estudio con quien quieras, por ejemplo con tu clase.</p>

    <h2>Exactitud de los contenidos</h2>
    <p>Los datos geográficos tienen fines educativos y se revisan con cuidado, pero pueden contener errores o quedar desactualizados. Las fronteras proceden de Natural Earth y algunas decisiones (por ejemplo, qué territorios se cuentan como países) se explican en la propia aplicación; no expresan ninguna posición política. Si encuentras un error, escribe a ${email()} y lo corregiremos.</p>

    <h2>Propiedad intelectual</h2>
    <p>El diseño, el código y los textos de Study World Map son obra de su titular y, en su caso, de las personas que contribuyen al proyecto, que publican sus aportaciones bajo la misma licencia.</p>
    <p>Study World Map es software libre: su código fuente está publicado en <a href="https://github.com/aguilera128/study-world-map">GitHub</a> bajo la licencia <a href="https://www.gnu.org/licenses/agpl-3.0.html">GNU Affero General Public License, versión 3 (AGPL-3.0)</a>. Cualquiera puede usarlo, estudiarlo, modificarlo y redistribuirlo en las condiciones de esa licencia; quien publique una versión modificada en una web tiene que ofrecer también su código fuente. La licencia no cubre el nombre «Study World Map», el dominio ni el icono.</p>
    <p>Los datos de terceros se usan conforme a sus licencias:</p>
    <ul>
      <li>Cartografía: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (dominio público).</li>
      <li>Nombres de países, subdivisiones, capitales y accidentes geográficos en otros idiomas: <a href="https://www.wikidata.org/">Wikidata</a> (CC0).</li>
      <li>Población: Banco Mundial, indicador «Población, total» (SP.POP.TOTL), licencia CC BY 4.0; la de los países que no están en esa serie, Wikidata.</li>
      <li>Regiones de Estados Unidos: las cuatro regiones de la Oficina del Censo (U.S. Census Bureau).</li>
      <li>Regiones de Finlandia: <a href="https://stat.fi/en/services/statistical-data-services/geographic-data">Statistics Finland</a>, unidades estadísticas por municipios de 2026 (licencia CC BY 4.0), simplificadas.</li>
      <li>Condados de Noruega: <a href="https://kartkatalog.geonorge.no/">Kartverket</a>, «Administrative enheter fylker» de 2026 (licencia CC BY 4.0), recortados por la costa y simplificados.</li>
      <li>Condados de Estonia: división administrativa de Estonia (EHAK), Junta de Tierras y Ordenación del Territorio de Estonia (Republic of Estonia Land and Spatial Development Board), datos del 01.11.2026, simplificados, con su <a href="https://geoportaal.maaruum.ee/opendata-licence">licencia de datos abiertos</a>.</li>
      <li>Distritos de Chipre: Departamento de Tierras y Catastro de la República de Chipre (Department of Lands and Surveys), unidades administrativas INSPIRE, simplificados.</li>
      <li>Distritos de Moldavia: ACNUR y OCHA, límites administrativos de Moldavia de 2020 (licencia CC BY 3.0 IGO), vía <a href="https://www.geoboundaries.org/">geoBoundaries</a>, recortados y simplificados.</li>
      <li>Temperatura, nubes y viento de ahora: modelo GFS (Global Forecast System) de NOAA/NCEP (dominio público), del programa de datos abiertos de la NOAA. Es una previsión, no una medición.</li>
      <li>Lluvia y nieve de ahora: IMERG, de la misión GPM de la NASA, servido por los Global Imagery Browse Services (GIBS) del sistema ESDIS de la NASA.</li>
      <li>Satélites: elementos orbitales GP de <a href="https://celestrak.org/">CelesTrak</a> (T. S. Kelso), a partir de los datos de la U.S. Space Force; la posición de cada satélite se calcula en el navegador con el modelo SGP4 (<a href="https://github.com/shashwatak/satellite-js">satellite.js</a>, licencia MIT).</li>
      <li>Códigos ISO y superficies: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Banderas: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licencia MIT).</li>
      <li>Luces nocturnas de las ciudades: Black Marble 2016, NASA Earth Observatory (dominio público).</li>
      <li>Imagen de satélite: Blue Marble Next Generation, NASA Earth Observatory (julio de 2004, dominio público).</li>
      <li>Relieve del fondo marino: ETOPO2v2, NOAA National Geophysical Data Center (dominio público).</li>
      <li>Corrientes oceánicas: OSCAR (Ocean Surface Current Analyses Real-time, Earth &amp; Space Research), media de diciembre de 2011 a septiembre de 2014, del servidor ERDDAP de NOAA CoastWatch; el rumbo general de cada corriente, de su artículo en la Wikipedia en inglés.</li>
      <li>Placas tectónicas: modelo PB2002 de Peter Bird (2003), <em>Geochemistry, Geophysics, Geosystems</em>, en la conversión de Hugo Ahlenius (Nordpil), licencia <a href="https://github.com/fraxen/tectonicplates">ODC-By 1.0</a>. Volcanes: base de datos de volcanes de NOAA NCEI (dominio público).</li>
      <li>Estrellas: Yale Bright Star Catalogue, 5.ª edición (dominio público), y catálogo Hipparcos de la Agencia Espacial Europea (ESA, 1997).</li>
      <li>Vía Láctea: «Deep Star Maps 2020», NASA/Goddard Space Flight Center Scientific Visualization Studio, con datos de Gaia DR2 (ESA/Gaia/DPAC).</li>
      <li>Zonas horarias: base de datos de zonas horarias de la IANA, vía <a href="https://github.com/moment/moment-timezone">moment-timezone</a> (licencia MIT).</li>
      <li>Ilustraciones de la capa «Planeta de dibujos»: diseños originales generados con inteligencia artificial a partir de una descripción propia.</li>
      <li>Climas: mapa mundial de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf y Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, agrupado en los climas que se estudian en secundaria.</li>
      <li>Tipografías: Besley y Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Enlaces externos</h2>
    <p>El sitio enlaza a páginas de terceros, como PayPal para las donaciones, GitHub para el código fuente y las webs de las fuentes de los datos. El titular no controla esas páginas ni responde de sus contenidos o de sus políticas.</p>

    <h2>Responsabilidad</h2>
    <p>El titular no garantiza que el sitio esté disponible en todo momento ni libre de errores, y no responde de los daños que puedan derivarse de su uso, salvo en los casos en que la ley lo exija.</p>

    <h2>Legislación aplicable</h2>
    <p>Este aviso legal se rige por la legislación española. La información sobre el tratamiento de datos personales está en la <a href="${ruta('privacidad')}">política de privacidad</a> y la de cookies, en la <a href="${ruta('cookies')}">política de cookies</a>.</p>
${revision}`,
    },

    {
      id: 'privacidad',
      title: 'Política de privacidad · Study World Map',
      description: 'Qué datos trata Study World Map, para qué y cómo ejercer tus derechos. La aplicación no tiene cuentas y guarda tu progreso en tu dispositivo; solo si tú lo pides se guarda además con un código para usarlo en otro.',
      body: `    <h1>Política de privacidad</h1>
    <p class="lead">Resumen: no hay cuentas ni formularios. Tu progreso se queda en tu dispositivo, salvo que crees un código para llevarlo a otro. Solo si aceptas las cookies de analítica se envían datos de uso a Google Analytics.</p>

    <h2>Responsable del tratamiento</h2>
${titularBlock()}

    <h2>Qué datos se tratan y para qué</h2>

    <h3>Progreso, ajustes y listas de estudio</h3>
    <p>Se guardan solo en el almacenamiento local de tu navegador, para que no pierdas lo aprendido. No se envían a ningún servidor y el titular no tiene acceso a ellos, salvo que uses la sincronización que se explica a continuación. Puedes borrarlos desde la propia aplicación («Progreso») o borrando los datos del sitio en tu navegador.</p>
    <h3>Seguir en otro dispositivo (opcional)</h3>
    <p>Si en «Progreso» pulsas «Crear mi código», tu progreso se guarda también en una base de datos para que puedas continuar en otro dispositivo. Se guarda únicamente un código de doce letras y cifras generado al azar, el progreso (qué países o accidentes geográficos te sabes, tus mejores notas y el resultado del reto del día) y la fecha. En la base de datos no se guarda tu nombre, tu correo ni tu dirección IP, y el código no está asociado a ninguna persona. Las listas de estudio y los ajustes no se envían.</p>
    <p>La base de datos está en la Unión Europea (Fráncfort), en el servicio Neon, y las peticiones pasan por el alojamiento de la web (Vercel), que como en cualquier sitio registra durante un tiempo limitado datos técnicos de cada petición, entre ellos la dirección IP y la dirección solicitada. Quien conozca el código puede ver y cambiar ese progreso, así que compártelo solo con quien quieras. Si abres un enlace que lleva el código (el del código QR), ese código forma parte de la dirección de esa visita, y por tanto de lo que registra el alojamiento. La aplicación lo quita de la dirección nada más abrirse, antes de cargar la analítica, para que no llegue a Google.</p>
    <p>Puedes borrar lo guardado en cualquier momento con «Borrar lo guardado con este código». «Dejar de sincronizar» solo desconecta el dispositivo en el que lo pulsas: lo guardado sigue ahí para tus otros dispositivos. Lo que lleve más de un año sin usarse se borra.</p>
    <p><strong>Base legal:</strong> tu consentimiento, que das al pulsar «Crear mi código» (art. 6.1.a del RGPD). Puedes retirarlo cuando quieras borrando lo guardado.</p>
    <p><strong>Proveedor:</strong> Neon, el servicio de base de datos, que actúa como encargado del tratamiento. Los datos se guardan en su centro de Fráncfort. Neon pertenece a una empresa de Estados Unidos: si accediera a ellos desde fuera del Espacio Económico Europeo, lo haría con las garantías que exige el RGPD para las transferencias internacionales.</p>

    <h3>Ranking de resultados (opcional)</h3>
    <p>Al terminar una partida puedes publicar tu resultado en el ranking de ese reto. No se envía nada si no pulsas «Publicar». Se guardan en la base de datos, y los ve cualquiera que consulte ese ranking, el apodo que escribas, tu nota, tu tiempo, la fecha y el país desde el que te conectas (solo sus dos letras, para enseñar la bandera). El país lo indica el alojamiento a partir de tu dirección IP en el momento de publicar; la dirección IP no se guarda en la base de datos.</p>
    <p>El apodo no debe contener tu nombre, tus apellidos ni otros datos personales: la aplicación te propone uno y te lo recuerda al escribirlo. No está asociado a ninguna cuenta ni a ninguna persona, y cualquiera puede usar el mismo. Solo se conservan los diez mejores resultados de cada ranking: los demás se borran al ser superados, y los del reto del día, a los 45 días. Si quieres que se borre un resultado que has publicado, o ves un apodo que no debería estar, escribe a ${email()} indicando el apodo y el reto.</p>
    <p><strong>Base legal:</strong> tu consentimiento, que das al pulsar «Publicar» (art. 6.1.a del RGPD).</p>

    <h3>Ubicación</h3>
    <p>La función «Tiempo real» sitúa tu posición en el mapa a partir de la zona horaria de tu dispositivo, sin pedirte nada. Si pulsas el botón de ubicación exacta, tu navegador te pedirá permiso y la aplicación usará tu posición redondeada (unos 1 km). En ambos casos la ubicación solo se usa en la pantalla: no se guarda ni se envía a ningún sitio.</p>

    <h3>Meteorología</h3>
    <p>Si enciendes alguna de las capas de meteorología (temperatura, nubes, lluvia o viento), la aplicación pide esos datos a este mismo sitio, que a su vez los obtiene de la NOAA y de la NASA. A esos organismos no les llega nada tuyo, ni siquiera tu dirección IP, y no se guarda nada.</p>

    <h3>Satélites</h3>
    <p>Si enciendes la capa de satélites, la aplicación pide sus órbitas a este mismo sitio, que a su vez las obtiene de CelesTrak. A CelesTrak no le llega nada tuyo, ni siquiera tu dirección IP, y no se guarda nada. La posición de cada satélite se calcula en tu navegador.</p>

    <h3>Analítica (solo con tu consentimiento)</h3>
    <p>Si aceptas las cookies de analítica, se carga Google Tag Manager y Google Analytics 4 para contar las visitas y saber qué partes de la web se usan, con el único fin de mejorarla. Se tratan datos técnicos y de uso: identificadores de cookie, páginas vistas, tipo de dispositivo y navegador, idioma, y país o ciudad aproximados. No se usan para publicidad ni para crear perfiles comerciales.</p>
    <ul>
      <li><strong>Base legal:</strong> tu consentimiento (art. 6.1.a del RGPD). Puedes retirarlo cuando quieras desde la ${consentLink}, sin que afecte a lo tratado antes.</li>
      <li><strong>Proveedor:</strong> Google Ireland Limited, que actúa como encargado del tratamiento. Google puede transferir datos a Estados Unidos, amparado por el Marco de Privacidad de Datos UE-EE. UU. y por cláusulas contractuales tipo.</li>
      <li><strong>Conservación:</strong> la que tenga configurada la propiedad de Google Analytics, como máximo 14 meses.</li>
    </ul>
    <p>Si rechazas o no respondes, la web no carga nada de Google.</p>

    <h3>Correo electrónico</h3>
    <p>Si escribes a ${email()}, se usan tu dirección y tu mensaje para responderte, con base en tu propia petición. Se conservan mientras dure la conversación y se borran después, salvo que haya que guardarlos por obligación legal.</p>

    <h3>Donaciones</h3>
    <p>Las donaciones se hacen en PayPal, que trata los datos del pago como responsable independiente según su propia política de privacidad. El titular recibe de PayPal el nombre, el correo electrónico y el importe de quien dona, y los usa solo para gestionar la donación, agradecerla y cumplir sus obligaciones fiscales, durante el plazo que exija la ley.</p>

    <h3>Alojamiento</h3>
    <p>El sitio se aloja en Vercel Inc. Como cualquier servidor web, registra datos técnicos de cada visita (como la dirección IP) durante un tiempo limitado, para servir la web y protegerla de abusos. Vercel actúa como encargado del tratamiento, con las garantías del RGPD para las transferencias internacionales.</p>
    <p><strong>Base legal:</strong> el interés legítimo del titular en poder servir la web y mantenerla segura (art. 6.1.f del RGPD).</p>

    <h2>Menores de edad</h2>
    <p>Study World Map está pensado para estudiantes. No pide datos personales para usarse. Si tienes menos de 14 años, pide a tu madre, a tu padre o a la persona que te cuide que decida si se aceptan las cookies de analítica y si puedes publicar tus resultados en el ranking (art. 7 de la Ley Orgánica 3/2018).</p>

    <h2>Tus derechos</h2>
    <p>Puedes pedir el acceso, la rectificación o la supresión de tus datos, la limitación de su tratamiento, oponerte a él o pedir su portabilidad, escribiendo a ${email()}. Como no sabemos de quién es cada código de sincronización, para atender una petición sobre un progreso guardado necesitamos que nos indiques el código. Si crees que no se han respetado tus derechos, puedes reclamar ante la <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a>.</p>
${revision}`,
    },

    {
      id: 'cookies',
      title: 'Política de cookies · Study World Map',
      description: 'Qué cookies y almacenamiento local usa Study World Map y cómo cambiar tu elección.',
      body: `    <h1>Política de cookies</h1>
    <p class="lead">Las únicas cookies son las de Google Analytics, y solo se instalan si las aceptas. Lo demás es almacenamiento local que necesita la aplicación para funcionar.</p>
    <p><a class="cta" href="#cookies">Cambiar mi elección</a></p>

    <h2>Cookies de analítica (requieren consentimiento)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Proveedor</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguir visitantes de forma anónima.</td><td>2 años</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Mantener el estado de la sesión.</td><td>2 años</td></tr>
      </tbody>
    </table></div>
    <p>Son cookies propias del dominio, pero las gestiona Google. Más información en la <a href="${ruta('privacidad')}">política de privacidad</a> y en la <a href="https://policies.google.com/technologies/cookies?hl=es">explicación de Google</a>.</p>

    <h2>Almacenamiento técnico (no requiere consentimiento)</h2>
    <p>No son cookies: se guardan solo en tu navegador, no se envían a ningún servidor (salvo el progreso, si creas un código para llevarlo a otro dispositivo, y el apodo, si publicas un resultado en el ranking) y son necesarios para que la aplicación funcione como pides.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, vista, reto elegido, listas de estudio y si has cerrado el aviso de idioma.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Lo que ya te sabes y tus mejores notas.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Tu código para seguir en otro dispositivo, si lo has creado.</td><td>Hasta que dejes de sincronizar</td></tr>
        <tr><td><code>swm:apodo</code></td><td>El último apodo con el que publicaste en el ranking, para proponértelo la próxima vez.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>swm:sin-oferta</code></td><td>Recordar que has dicho «Ahora no» cuando se te ofrece crear un código al terminar una partida.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>swm:consent</code></td><td>Recordar si aceptaste o rechazaste las cookies, y cuándo.</td><td>Dos años; después se te vuelve a preguntar</td></tr>
        <tr><td>Caché <code>swm-*</code></td><td>Copia de la aplicación para usarla sin conexión.</td><td>Hasta la siguiente versión</td></tr>
      </tbody>
    </table></div>

    <h2>Cómo cambiar o retirar tu consentimiento</h2>
    <p>En cualquier momento, desde la ${consentLink} (también en el pie de cada página). Al rechazar, la web deja de cargar Google Analytics y borra sus cookies. Tu elección, sea cual sea, vale dos años: pasado ese tiempo se te vuelve a preguntar. Además, puedes borrar las cookies y los datos del sitio desde los ajustes de tu navegador; si lo haces, también se borrará tu progreso.</p>
${revision}`,
    },

    {
      id: 'donar',
      title: 'Apoya Study World Map con una donación',
      description: 'Study World Map es gratis, sin anuncios y sin registro. Si te ayuda a estudiar, puedes apoyarlo con una donación.',
      body: `    <h1>Apoya Study World Map</h1>
    <p class="lead">Study World Map es gratis para todos los estudiantes y lo seguirá siendo: sin anuncios, sin cuentas y sin vender tus datos. Si te ha ayudado a ti o a tu clase, una donación ayuda a mantenerlo vivo.</p>
    <p><a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Donar con PayPal →</a></p>

    <h2>A qué se destina</h2>
    <ul>
      <li>Mantener el dominio y el alojamiento.</li>
      <li>Revisar y corregir los datos: países, capitales, fronteras, banderas, geografía física y traducciones.</li>
      <li>Añadir nuevos retos y mejorar la accesibilidad.</li>
    </ul>

    <h2>Antes de donar</h2>
    <ul>
      <li>La donación es voluntaria y no da acceso a nada extra: la aplicación es igual para todos.</li>
      <li>El pago se hace en PayPal; Study World Map no ve ni guarda los datos de tu tarjeta.</li>
      <li>Study World Map es un proyecto personal, no una fundación ni una asociación, así que la donación no desgrava en la declaración de la renta.</li>
    </ul>
    <p>¿Prefieres ayudar de otra forma? Compártelo con tu clase o escribe a ${email()} si encuentras un error.</p>`,
    },
  ];
}
