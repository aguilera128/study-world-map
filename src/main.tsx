import { createRoot } from 'react-dom/client';
import App from './App';
import { getEngine } from './app/engineRef';
import { useApp, useProgress, useSettings } from './app/store';
import './index.css';

// Sin <StrictMode>: en desarrollo montaría dos veces el lienzo y crearía dos contextos WebGL.
createRoot(document.getElementById('root')!).render(<App />);

// Solo en desarrollo: acceso al estado desde la consola (`__mapamundi.useApp.getState()`).
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
  Object.assign(window, { __mapamundi: { useApp, useSettings, useProgress, getEngine, settle } });
}
