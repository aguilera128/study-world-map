// Consentimiento de cookies y Google Tag Manager. El contenedor (GTM-…) llega en el atributo
// «data-gtm» de la etiqueta que carga este script, que sale de la variable VITE_GTM_ID. Sin él no
// hay analítica y, por tanto, tampoco aviso.
//
// RGPD/LSSI: no se carga nada de Google hasta que la persona acepta. Sin respuesta o si rechaza,
// la web no hace ninguna petición a terceros. La elección se guarda en este navegador y se puede
// cambiar con el botón de la portada (`swmConsent.open()`) o con cualquier enlace a `#cookies` (pie de las páginas).
//
// Script clásico, sin dependencias: lo usan tanto la aplicación como las páginas estáticas.

(function () {
  var KEY = 'swm:consent';
  var GTM_ID = (document.currentScript && document.currentScript.getAttribute('data-gtm')) || '';
  // Una portada servida sin pasar por Vite deja la variable tal cual: es lo mismo que no tenerla.
  if (GTM_ID.charAt(0) === '%') GTM_ID = '';
  var loaded = false;

  function read() {
    try {
      return localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function save(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (e) {
      // Sin almacenamiento (modo privado estricto): la elección dura lo que la visita.
    }
  }

  function loadGtm() {
    if (loaded) return;
    loaded = true;
    var w = window;
    w.dataLayer = w.dataLayer || [];
    // GTM solo entiende los comandos de consentimiento con la forma de gtag(): un objeto `arguments`.
    w.gtag =
      w.gtag ||
      function () {
        w.dataLayer.push(arguments);
      };
    // Modo de consentimiento: solo analítica; nada de publicidad.
    w.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  var CSS =
    '.swm-consent{position:fixed;z-index:60;left:16px;right:16px;bottom:16px;max-width:34rem;margin:0 auto;' +
    'padding:16px 18px;border-radius:14px;border:1px solid var(--rule,rgba(27,42,58,.16));' +
    'background:var(--surface,#faf6ec);color:var(--ink,#1b2a3a);font:0.9rem/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;' +
    'box-shadow:0 18px 40px -18px rgba(0,0,0,.45)}' +
    '.swm-consent p{margin:0 0 12px}' +
    // En el móvil va arriba: abajo taparía el botón de empezar y los controles de la partida.
    '@media (max-width:40rem){.swm-consent{top:64px;bottom:auto;padding:12px 14px;font-size:.8125rem}.swm-consent p{margin-bottom:10px}}' +
    '.swm-consent div{display:flex;gap:8px;flex-wrap:wrap}' +
    '.swm-consent button{flex:1 1 9rem;min-height:44px;padding:0 16px;border-radius:10px;font:700 0.9rem system-ui,sans-serif;cursor:pointer;' +
    'border:1px solid var(--ink,#1b2a3a);background:transparent;color:var(--ink,#1b2a3a)}' +
    '.swm-consent button:focus-visible{outline:2px solid var(--accent,#d5462a);outline-offset:2px}';

  // Aviso en el idioma de la página (primer tramo de la dirección): [texto, más información, rechazar, aceptar].
  var TEXTS = {
    es: [
      '¿Nos dejas usar cookies de Google Analytics para contar las visitas y ver qué partes de la web se usan? ' +
        'Solo sirven para mejorarla: nada de publicidad. Si no aceptas, la web funciona igual.',
      'Más información sobre las cookies',
      'Rechazar',
      'Aceptar',
    ],
    en: [
      'May we use Google Analytics cookies to count visits and see which parts of the site are used? ' +
        'They only help us improve it: no advertising. If you decline, the site works just the same.',
      'More about cookies (in Spanish)',
      'Decline',
      'Accept',
    ],
    fr: [
      'Acceptez-vous que nous utilisions les cookies de Google Analytics pour compter les visites et voir quelles parties du site sont utilisées ? ' +
        'Ils servent uniquement à l’améliorer : aucune publicité. Si vous refusez, le site fonctionne de la même façon.',
      'En savoir plus sur les cookies (en espagnol)',
      'Refuser',
      'Accepter',
    ],
    de: [
      'Dürfen wir Cookies von Google Analytics verwenden, um Besuche zu zählen und zu sehen, welche Teile der Seite genutzt werden? ' +
        'Sie dienen nur der Verbesserung: keine Werbung. Wenn du ablehnst, funktioniert die Seite genauso.',
      'Mehr über Cookies (auf Spanisch)',
      'Ablehnen',
      'Akzeptieren',
    ],
    it: [
      'Possiamo usare i cookie di Google Analytics per contare le visite e vedere quali parti del sito vengono usate? ' +
        'Servono solo a migliorarlo: niente pubblicità. Se rifiuti, il sito funziona lo stesso.',
      'Maggiori informazioni sui cookie (in spagnolo)',
      'Rifiuta',
      'Accetta',
    ],
    pt: [
      'Podemos usar cookies do Google Analytics para contar as visitas e ver quais partes do site são usadas? ' +
        'Servem só para melhorá-lo: nada de publicidade. Se você recusar, o site funciona do mesmo jeito.',
      'Mais sobre os cookies (em espanhol)',
      'Recusar',
      'Aceitar',
    ],
    ca: [
      'Ens deixes usar galetes de Google Analytics per a comptar les visites i veure quines parts del web s’usen? ' +
        'Només serveixen per a millorar-lo: res de publicitat. Si no acceptes, el web funciona igual.',
      'Més informació sobre les galetes (en castellà)',
      'Rebutjar',
      'Acceptar',
    ],
    gl: [
      'Déixasnos usar cookies de Google Analytics para contar as visitas e ver que partes da web se usan? ' +
        'Só serven para mellorala: nada de publicidade. Se non aceptas, a web funciona igual.',
      'Máis información sobre as cookies (en castelán)',
      'Rexeitar',
      'Aceptar',
    ],
    eu: [
      'Google Analytics-en cookieak erabiltzen uzten diguzu, bisitak zenbatzeko eta webgunearen zein atal erabiltzen diren ikusteko? ' +
        'Hobetzeko bakarrik balio dute: publizitaterik ez. Onartzen ez baduzu, webguneak berdin funtzionatzen du.',
      'Cookieei buruzko informazio gehiago (gaztelaniaz)',
      'Baztertu',
      'Onartu',
    ],
    zh: [
      '可以让我们使用 Google Analytics 的 Cookie 来统计访问量、了解网站哪些部分被使用吗？' +
        '它们只用于改进网站，不用于广告。如果你拒绝，网站照常可用。',
      '了解 Cookie 详情（西班牙语）',
      '拒绝',
      '接受',
    ],
  };

  var banner = null;

  function close() {
    if (banner) banner.remove();
    banner = null;
  }

  // Al rechazar se borran las cookies que Google Analytics hubiera dejado (_ga y _ga_<id>).
  function dropAnalyticsCookies() {
    var host = location.hostname;
    var domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) return;
      domains.forEach(function (domain) {
        document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
      });
    });
  }

  // La web la usan estudiantes: el aviso recuerda a los menores de 14 años que pregunten antes.
  var MINORS = {
    es: 'Si tienes menos de 14 años, pregunta antes a un adulto.',
    en: 'If you are under 14, ask an adult first.',
    fr: 'Si vous avez moins de 14 ans, demandez d’abord à un adulte.',
    de: 'Wenn du unter 14 bist, frag zuerst einen Erwachsenen.',
    it: 'Se hai meno di 14 anni, chiedi prima a un adulto.',
    pt: 'Se você tem menos de 14 anos, pergunte antes a um adulto.',
    ca: 'Si tens menys de 14 anys, pregunta abans a un adult.',
    gl: 'Se tes menos de 14 anos, pregúntalle antes a un adulto.',
    eu: '14 urte baino gutxiago badituzu, galdetu lehenengo heldu bati.',
    zh: '如果你未满 14 岁，请先询问成年人。',
  };

  function choose(value) {
    var before = read();
    save(value);
    close();
    if (value === 'granted') loadGtm();
    else {
      dropAnalyticsCookies();
      // Retirar el permiso con GTM ya cargado: recargar es la forma segura de dejar de medir.
      if (before === 'granted' && loaded) location.reload();
    }
  }

  function open() {
    if (banner || !GTM_ID) return;
    if (!document.getElementById('swm-consent-css')) {
      var style = document.createElement('style');
      style.id = 'swm-consent-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    banner = document.createElement('section');
    banner.className = 'swm-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookies');
    var lang = location.pathname.split('/')[1];
    var text = TEXTS[lang] || TEXTS.es;
    banner.innerHTML =
      '<p>' + text[0] + ' ' + (MINORS[lang] || MINORS.es) + ' <a href="/cookies/" style="color:inherit">' + text[1] + '</a>.</p>' +
      '<div><button type="button" data-v="denied">' + text[2] + '</button>' +
      '<button type="button" data-v="granted">' + text[3] + '</button></div>';
    banner.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-v');
      if (v) choose(v);
    });
    document.body.appendChild(banner);
  }

  window.swmConsent = { open: open };

  // Los enlaces «Configurar cookies» de las páginas (href="#cookies") abren el aviso. Se escucha aquí
  // y no con un «onclick» en cada enlace: la política de contenido (CSP) no deja ejecutar código en línea.
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest && e.target.closest('a[href="#cookies"]');
    if (!link) return;
    e.preventDefault();
    open();
  });

  var saved = read();
  if (!GTM_ID) return;
  if (saved === 'granted') loadGtm();
  else if (saved !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
    else open();
  }
})();
