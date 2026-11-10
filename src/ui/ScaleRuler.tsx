import { useEffect, useRef } from 'react';
import type { MapEngine } from '../engine/MapEngine';
import { LOCALE, t } from '../i18n';

/** Rayas que caben en la regla (cinco por tramo). */
const TICKS = 46;

/** El número «redondo» (1, 2 o 5 por una potencia de diez) más cercano a `value`. */
function round125(value: number): number {
  const power = 10 ** Math.floor(Math.log10(value));
  const lead = value / power;
  return (lead < 1.5 ? 1 : lead < 3.5 ? 2 : lead < 7.5 ? 5 : 10) * power;
}

/**
 * Regla de escala en el borde derecho: rayas horizontales separadas una distancia real (cada tramo
 * rotulado vale lo que dice, en kilómetros, en el centro de la vista). Al acercar o alejar, las
 * rayas se abren o se juntan y los tramos cambian a otro número redondo. Arriba, la altura desde la
 * que se mira. Se actualiza tocando el DOM directamente: el motor avisa en cada fotograma.
 */
export function ScaleRuler({ engine }: { engine: MapEngine }) {
  const root = useRef<HTMLDivElement>(null);
  const height = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const box = root.current;
    if (!box) return;
    const ticks = [...box.querySelectorAll<HTMLElement>('[data-tick]')];
    const number = (value: number) => Math.round(value).toLocaleString(LOCALE);
    return engine.on('view', (view) => {
      const room = box.clientHeight;
      // Un tramo de unos 110 px, redondeado a un número de kilómetros fácil de leer.
      const step = round125(view.kmPerPixel * 110);
      const minor = step / view.kmPerPixel / 5;
      ticks.forEach((tick, j) => {
        const y = j * minor;
        tick.style.transform = `translateY(${-y.toFixed(1)}px)`;
        tick.style.opacity = y > room ? '0' : '';
        const label = tick.firstElementChild;
        if (!label) return;
        const text = j === 0 ? '0' : `${number((j / 5) * step)} km`;
        if (label.textContent !== text) label.textContent = text;
      });
      if (height.current) {
        // En el mapa plano no hay «altura» que valga: solo la escala.
        const text = view.morph > 0.5 ? t('Vista desde {n} km de altura', { n: number(view.heightKm) }) : '';
        if (height.current.textContent !== text) height.current.textContent = text;
      }
    });
  }, [engine]);

  return (
    <div className="scale-ruler" aria-hidden="true">
      <p ref={height} className="scale-height" />
      <div ref={root} className="scale-ticks">
        {Array.from({ length: TICKS }, (_, j) => (
          <span key={j} data-tick className={j % 5 === 0 ? 'major' : undefined}>
            {j % 5 === 0 && <span />}
          </span>
        ))}
      </div>
    </div>
  );
}
