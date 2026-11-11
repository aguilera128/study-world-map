// Textos de las páginas legales y de donaciones. Los datos del titular salen de sitio.mjs.
//
// Lo que se afirma sobre la aplicación está comprobado en el código (src/app/store.ts y
// public/consent.js, src/app/sync.ts y api/sync.ts): progreso y ajustes en el navegador y, solo si
// se crea un código, también en la base de datos; ubicación solo en memoria; y nada de Google sin
// consentimiento. Si eso cambia, hay que cambiar también estos textos.

import { DONAR_URL, REVISION_LEGAL, SITE, TITULAR } from './sitio.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Un dato del titular; si aún falta, se resalta para que no pase desapercibido. */
const dato = (v) => (v.startsWith('PENDIENTE') ? `<span class="pending">${esc(v)}</span>` : esc(v));
const email = () =>
  TITULAR.email.startsWith('PENDIENTE') ? dato(TITULAR.email) : `<a href="mailto:${esc(TITULAR.email)}">${esc(TITULAR.email)}</a>`;
const revision = `    <p><small>Última revisión: ${REVISION_LEGAL}.</small></p>`;
const consentLink = `<a href="#cookies" onclick="event.preventDefault(); window.swmConsent && swmConsent.open()">configuración de cookies</a>`;

const titularBlock = () => `    <ul>
      <li><strong>Titular:</strong> ${dato(TITULAR.nombre)}</li>
      <li><strong>NIF:</strong> ${dato(TITULAR.nif)}</li>
      <li><strong>Domicilio:</strong> ${dato(TITULAR.domicilio)}</li>
      <li><strong>Correo electrónico:</strong> ${email()}</li>
      <li><strong>Sitio web:</strong> <a href="${SITE}/">${SITE.replace('https://', '')}</a></li>
    </ul>`;

export function legalPages() {
  return [
    {
      path: '/aviso-legal/',
      title: 'Aviso legal · Study World Map',
      description: 'Datos del titular, condiciones de uso y propiedad intelectual de Study World Map.',
      body: `    <h1>Aviso legal</h1>
    <h2>Titular del sitio web</h2>
    <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE), estos son los datos del titular:</p>
${titularBlock()}

    <h2>Objeto</h2>
    <p>Study World Map es un proyecto educativo personal: un mapamundi interactivo para aprender los países del mundo, sus continentes, sus capitales y sus banderas. Es gratuito, no tiene publicidad, no vende nada y no requiere registro. Se mantiene con el tiempo de su autor y con las <a href="/donar/">donaciones voluntarias</a> de quien quiera apoyarlo.</p>

    <h2>Condiciones de uso</h2>
    <p>El uso del sitio es libre y gratuito. Al usarlo te comprometes a hacerlo de forma lícita, sin dañar el sitio ni impedir que otros lo usen. Puedes compartir los enlaces y las listas de estudio con quien quieras, por ejemplo con tu clase.</p>

    <h2>Exactitud de los contenidos</h2>
    <p>Los datos geográficos tienen fines educativos y se revisan con cuidado, pero pueden contener errores o quedar desactualizados. Las fronteras proceden de Natural Earth y algunas decisiones (por ejemplo, qué territorios se cuentan como países) se explican en la propia aplicación; no expresan ninguna posición política. Si encuentras un error, escribe a ${email()} y lo corregiremos.</p>

    <h2>Propiedad intelectual</h2>
    <p>El diseño, el código y los textos de Study World Map son obra de su titular. Los datos de terceros se usan conforme a sus licencias:</p>
    <ul>
      <li>Cartografía: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (dominio público).</li>
      <li>Códigos ISO y superficies: <a href="https://github.com/mledoze/countries">mledoze/countries</a> (Open Database License).</li>
      <li>Banderas: <a href="https://github.com/lipis/flag-icons">flag-icons</a> (licencia MIT).</li>
      <li>Imagen de satélite: Blue Marble Next Generation, NASA Earth Observatory (julio de 2004, dominio público).</li>
      <li>Relieve del fondo marino: ETOPO2v2, NOAA National Geophysical Data Center (dominio público).</li>
      <li>Estrellas: Yale Bright Star Catalogue, 5.ª edición (dominio público), y catálogo Hipparcos de la Agencia Espacial Europea (ESA, 1997).</li>
      <li>Climas: mapa mundial de Köppen-Geiger de Kottek, Grieser, Beck, Rudolf y Rubel (2006), <em>Meteorologische Zeitschrift</em> 15, 259-263, agrupado en los climas que se estudian en secundaria.</li>
      <li>Tipografías: Besley y Atkinson Hyperlegible Next (SIL Open Font License).</li>
    </ul>

    <h2>Enlaces externos</h2>
    <p>El sitio enlaza a páginas de terceros, como PayPal para las donaciones. El titular no controla esas páginas ni responde de sus contenidos o de sus políticas.</p>

    <h2>Responsabilidad</h2>
    <p>El titular no garantiza que el sitio esté disponible en todo momento ni libre de errores, y no responde de los daños que puedan derivarse de su uso, salvo en los casos en que la ley lo exija.</p>

    <h2>Legislación aplicable</h2>
    <p>Este aviso legal se rige por la legislación española. La información sobre el tratamiento de datos personales está en la <a href="/privacidad/">política de privacidad</a> y la de cookies, en la <a href="/cookies/">política de cookies</a>.</p>
${revision}`,
    },

    {
      path: '/privacidad/',
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
    <p>La base de datos está en la Unión Europea (Fráncfort), en el servicio Neon, y las peticiones pasan por el alojamiento de la web (Vercel), que como en cualquier sitio registra durante un tiempo limitado datos técnicos de cada petición, entre ellos la dirección IP y la dirección solicitada. Quien conozca el código puede ver y cambiar ese progreso, así que compártelo solo con quien quieras. Si abres un enlace que lleva el código (el del código QR), ese código forma parte de la dirección de esa visita.</p>
    <p>Puedes borrar lo guardado en cualquier momento con «Borrar lo guardado con este código». «Dejar de sincronizar» solo desconecta el dispositivo en el que lo pulsas: lo guardado sigue ahí para tus otros dispositivos. Lo que lleve más de un año sin usarse se borra.</p>

    <h3>Ubicación</h3>
    <p>La función «Tiempo real» sitúa tu posición en el mapa a partir de la zona horaria de tu dispositivo, sin pedirte nada. Si pulsas el botón de ubicación exacta, tu navegador te pedirá permiso y la aplicación usará tu posición redondeada (unos 1 km). En ambos casos la ubicación solo se usa en la pantalla: no se guarda ni se envía a ningún sitio.</p>

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

    <h2>Menores de edad</h2>
    <p>Study World Map está pensado para estudiantes. No pide datos personales para usarse. Si tienes menos de 14 años, pide a tu madre, a tu padre o a la persona que te cuide que decida si se aceptan las cookies de analítica (art. 7 de la Ley Orgánica 3/2018).</p>

    <h2>Tus derechos</h2>
    <p>Puedes pedir el acceso, la rectificación o la supresión de tus datos, la limitación de su tratamiento, oponerte a él o pedir su portabilidad, escribiendo a ${email()}. Como no sabemos de quién es cada código de sincronización, para atender una petición sobre un progreso guardado necesitamos que nos indiques el código. Si crees que no se han respetado tus derechos, puedes reclamar ante la <a href="https://www.aepd.es/">Agencia Española de Protección de Datos</a>.</p>
${revision}`,
    },

    {
      path: '/cookies/',
      title: 'Política de cookies · Study World Map',
      description: 'Qué cookies y almacenamiento local usa Study World Map y cómo cambiar tu elección.',
      body: `    <h1>Política de cookies</h1>
    <p class="lead">Las únicas cookies son las de Google Analytics, y solo se instalan si las aceptas. Lo demás es almacenamiento local que necesita la aplicación para funcionar.</p>
    <p><a class="cta" href="#cookies" onclick="event.preventDefault(); window.swmConsent && swmConsent.open()">Cambiar mi elección</a></p>

    <h2>Cookies de analítica (requieren consentimiento)</h2>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Proveedor</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>_ga</code></td><td>Google Analytics</td><td>Distinguir visitantes de forma anónima.</td><td>2 años</td></tr>
        <tr><td><code>_ga_&lt;id&gt;</code></td><td>Google Analytics</td><td>Mantener el estado de la sesión.</td><td>2 años</td></tr>
      </tbody>
    </table></div>
    <p>Son cookies propias del dominio, pero las gestiona Google. Más información en la <a href="/privacidad/">política de privacidad</a> y en la <a href="https://policies.google.com/technologies/cookies?hl=es">explicación de Google</a>.</p>

    <h2>Almacenamiento técnico (no requiere consentimiento)</h2>
    <p>No son cookies: se guardan solo en tu navegador, no se envían a ningún servidor (salvo el progreso, si creas un código para llevarlo a otro dispositivo) y son necesarios para que la aplicación funcione como pides.</p>
    <div class="table-wrap"><table>
      <thead><tr><th scope="col">Nombre</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
      <tbody>
        <tr><td><code>mapamundi:ajustes</code></td><td>Tema, vista, reto elegido, listas de estudio y si has cerrado el aviso de idioma.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>mapamundi:progreso</code></td><td>Lo que ya te sabes y tus mejores notas.</td><td>Hasta que la borres</td></tr>
        <tr><td><code>mapamundi:sync</code></td><td>Tu código para seguir en otro dispositivo, si lo has creado.</td><td>Hasta que dejes de sincronizar</td></tr>
        <tr><td><code>swm:consent</code></td><td>Recordar si aceptaste o rechazaste las cookies.</td><td>Hasta que la borres</td></tr>
        <tr><td>Caché <code>swm-*</code></td><td>Copia de la aplicación para usarla sin conexión.</td><td>Hasta la siguiente versión</td></tr>
      </tbody>
    </table></div>

    <h2>Cómo cambiar o retirar tu consentimiento</h2>
    <p>En cualquier momento, desde la ${consentLink} (también en el pie de cada página). Al rechazar, la web deja de cargar Google Analytics y borra sus cookies. Además, puedes borrar las cookies y los datos del sitio desde los ajustes de tu navegador; si lo haces, también se borrará tu progreso.</p>
${revision}`,
    },

    {
      path: '/donar/',
      title: 'Apoya Study World Map con una donación',
      description: 'Study World Map es gratis, sin anuncios y sin registro. Si te ayuda a estudiar, puedes apoyarlo con una donación.',
      body: `    <h1>Apoya Study World Map</h1>
    <p class="lead">Study World Map es gratis para todos los estudiantes y lo seguirá siendo: sin anuncios, sin cuentas y sin vender tus datos. Si te ha ayudado a ti o a tu clase, una donación ayuda a mantenerlo vivo.</p>
    <p>${DONAR_URL.startsWith('PENDIENTE') ? dato(DONAR_URL) : `<a class="cta" href="${esc(DONAR_URL)}" rel="noopener" target="_blank">Donar con PayPal →</a>`}</p>

    <h2>A qué se destina</h2>
    <ul>
      <li>Mantener el dominio y el alojamiento.</li>
      <li>Revisar y corregir los datos: países, capitales, fronteras y banderas.</li>
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
