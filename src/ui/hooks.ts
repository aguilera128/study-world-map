import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { useApp, useSettings } from '../app/store';
import type { Padding } from '../engine/camera';
import type { ThemeName } from '../engine/palette';

/** ¿Se cumple una media query? Se actualiza sola al cambiar el tamaño o las preferencias. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', notify);
      return () => mq.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Pantalla ancha: el panel va a la izquierda en vez de abajo. (Coincide con `wide:` en el CSS.) */
export const useWide = () => useMedia('(min-width: 60rem)');

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');

/**
 * Tema efectivo; también lo aplica al documento. «auto» es quien nunca ha pulsado el botón del tema:
 * ve el de noche, que es como mejor se aprecian el globo y el cielo. El botón solo guarda claro u oscuro.
 */
export function useTheme(): ThemeName {
  const choice = useSettings((s) => s.theme);
  // Con el huevo de pascua encendido el fondo es el espacio: la interfaz va en oscuro, elija lo que elija.
  const toon = useApp((s) => s.toon);
  const theme: ThemeName = toon || choice === 'auto' ? 'night' : choice;
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    // la barra del navegador, del color del papel de cada tema
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'night' ? '#0d1520' : '#f1eadb');
  }, [theme]);
  return theme;
}

// Quién ocupa cada lado del mapa. Al desmontarse un panel su hueco se libera con un pequeño
// retardo: así, si otro panel ocupa el mismo lado justo después, el mapa no da un salto.
const owners: Partial<Record<keyof Padding, symbol>> = {};

/**
 * Declara que un elemento tapa un lado del mapa, para que la cámara encuadre en el hueco libre.
 * `factor` reduce el margen cuando el elemento se funde con el mapa en vez de taparlo del todo.
 */
export function usePad(ref: RefObject<HTMLElement | null>, side: keyof Padding, factor = 1) {
  const setPad = useApp((s) => s.setPad);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = Symbol(side);
    owners[side] = id;
    const measure = () => {
      if (owners[side] !== id) return;
      // Posición de maquetación (offset*), no la visual: así no influyen las animaciones de entrada.
      const covered =
        side === 'left'
          ? el.offsetLeft + el.offsetWidth
          : side === 'top'
            ? el.offsetTop + el.offsetHeight
            : side === 'bottom'
              ? window.innerHeight - el.offsetTop
              : window.innerWidth - el.offsetLeft;
      setPad(side, Math.max(0, covered * factor));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      setTimeout(() => {
        if (owners[side] === id) {
          delete owners[side];
          setPad(side, 0);
        }
      }, 120);
    };
  }, [ref, side, factor, setPad]);
}

/**
 * Último valor no nulo. Una pantalla sigue montada unos instantes mientras se anima su salida,
 * cuando el estado del que dependía (la partida) ya se ha borrado: con esto conserva lo que mostraba.
 */
export function useLast<T>(value: T | null): T | null {
  const ref = useRef(value);
  if (value !== null) ref.current = value;
  return ref.current;
}

/** La fecha actual, renovada cada cierto tiempo (para relojes y para la posición del Sol). */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** Milisegundos transcurridos desde `since`, actualizados cada segundo mientras `running`. */
export function useElapsed(since: number, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since, running]);
  return Math.max(0, now - since);
}
