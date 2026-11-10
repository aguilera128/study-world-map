import { createRoot } from 'react-dom/client';
import { initI18n } from './i18n';
import './index.css';

// El diccionario del idioma tiene que estar cargado antes de importar la aplicación: muchos módulos
// traducen sus textos al evaluarse (los títulos de los retos, las etiquetas de las capas…).
await initI18n();
const [{ default: App }, { getEngine }, { useApp, useProgress, useSettings }] = await Promise.all([
  import('./App'),
  import('./app/engineRef'),
  import('./app/store'),
]);

// Sin <StrictMode>: en desarrollo montaría dos veces el lienzo y crearía dos contextos WebGL.
createRoot(document.getElementById('root')!).render(<App />);

// Funcionamiento sin conexión (public/sw.js). En desarrollo no: serviría copias viejas de Vite.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

// Solo en desarrollo: acceso al estado desde la consola (`__swm.useApp.getState()`).
if (import.meta.env.DEV) {
  /**
   * Avanza el motor `ms` milisegundos de golpe, sin esperar a requestAnimationFrame. Sirve para
   * comprobar el resultado de una animación en una pestaña en segundo plano, donde no hay fotogramas.
   */
  const settle = (ms = 2500) => {
    const engine = getEngine() as unknown as { tick(now: number): void } | null;
    if (!engine) return;
    const start = performance.now();
    for (let t = 16; t <= ms; t += 16) engine.tick(start + t);
  };
  Object.assign(window, { __swm: { useApp, useSettings, useProgress, getEngine, settle } });
}
