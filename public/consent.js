// Consentimiento de cookies y Google Tag Manager (GTM-TW2XCZJM).
//
// RGPD/LSSI: no se carga nada de Google hasta que la persona acepta. Sin respuesta o si rechaza,
// la web no hace ninguna petición a terceros. La elección se guarda en este navegador y se puede
// cambiar con cualquier enlace que llame a `swmConsent.open()` (pie de la portada y de las páginas).
//
// Script clásico, sin dependencias: lo usan tanto la aplicación como las páginas estáticas.

(function () {
  var KEY = 'swm:consent';
  var GTM_ID = 'GTM-TW2XCZJM';
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
    '.swm-consent div{display:flex;gap:8px;flex-wrap:wrap}' +
    '.swm-consent button{flex:1 1 9rem;min-height:44px;padding:0 16px;border-radius:10px;font:700 0.9rem system-ui,sans-serif;cursor:pointer;' +
    'border:1px solid var(--ink,#1b2a3a);background:transparent;color:var(--ink,#1b2a3a)}' +
    '.swm-consent button:focus-visible{outline:2px solid var(--accent,#d5462a);outline-offset:2px}';

  var banner = null;

  function close() {
    if (banner) banner.remove();
    banner = null;
  }

  function choose(value) {
    var before = read();
    save(value);
    close();
    if (value === 'granted') loadGtm();
    // Retirar el permiso con GTM ya cargado: recargar es la forma segura de dejar de medir.
    else if (before === 'granted' && loaded) location.reload();
  }

  function open() {
    if (banner) return;
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
    banner.innerHTML =
      '<p>¿Nos dejas usar cookies de Google Analytics para contar las visitas y ver qué partes de la web se usan? ' +
      'Solo sirven para mejorarla: nada de publicidad. Si no aceptas, la web funciona igual. ' +
      '<a href="/cookies/" style="color:inherit">Más información</a>.</p>' +
      '<div><button type="button" data-v="denied">Rechazar</button>' +
      '<button type="button" data-v="granted">Aceptar</button></div>';
    banner.addEventListener('click', function (e) {
      var v = e.target && e.target.getAttribute && e.target.getAttribute('data-v');
      if (v) choose(v);
    });
    document.body.appendChild(banner);
  }

  window.swmConsent = { open: open };

  var saved = read();
  if (saved === 'granted') loadGtm();
  else if (saved !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
    else open();
  }
})();
