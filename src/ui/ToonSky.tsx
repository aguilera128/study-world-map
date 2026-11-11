import { useEffect, useRef } from 'react';

// Huevo de pascua (cinco clics en «Globo 3D»): el espacio de unos dibujos animados de ciencia ficción.
// Aquí está lo del mapa plano: el fondo de nebulosas, los astros en las esquinas y una nave que cruza
// la pantalla. En el globo todo eso va dentro del propio mapa, en tres dimensiones
// (src/engine/toonScene.ts): la nave da vueltas al planeta, las nubes van pegadas a él y los astros
// flotan por detrás; el fondo ocupa el sitio de la Vía Láctea (MapEngine.setToon). El Sol de dibujos
// es el de «Tiempo real» (RealTime.tsx), en el sitio del Sol de verdad.
//
// Las ilustraciones (public/toon/*.webp) son diseños originales generados con IA (el generador de
// imágenes de Codex) a partir de una descripción propia: ni la nave ni los personajes son de ninguna
// serie. Solo se descargan si alguien encuentra el huevo de pascua. No guardan ni piden nada.
//
// El movimiento se hace con la API de animaciones del navegador, sin hojas de estilo; con «reducir
// movimiento» todo se queda quieto.

const ART = '/toon';
const img = 'pointer-events-none absolute select-none';

/**
 * El cielo del mapa plano, detrás de él. En el globo, las nebulosas las pinta el propio mapa en el
 * sitio de la Vía Láctea, para que giren con las estrellas (MapEngine.setToon): esta capa queda
 * debajo y solo se ve mientras llega la imagen o durante el paso de una vista a otra.
 */
export function ToonSky({ animated, flat }: { animated: boolean; flat: boolean }) {
  const portal = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!animated || !flat) return;
    const spin = portal.current?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 14_000, iterations: Infinity });
    return () => spin?.cancel();
  }, [animated, flat]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-[#0b0a24]">
      <img src={`${ART}/fondo.webp`} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" />
      {/* En el mapa plano no hay «alrededor»: los astros se quedan en las esquinas. En el globo flotan en torno a él, dentro del mapa. */}
      {flat && (
        <>
          <img src={`${ART}/anillo.webp`} alt="" draggable={false} className={`${img} left-[2%] top-[9%] w-[30vmin] wide:left-[31%] wide:top-[3%] wide:w-[22vmin]`} />
          <img src={`${ART}/verde.webp`} alt="" draggable={false} className={`${img} right-[3%] top-[33%] w-[13vmin] wide:left-[31.5%] wide:right-auto wide:top-[46%] wide:w-[9vmin]`} />
          <img src={`${ART}/luna.webp`} alt="" draggable={false} className={`${img} right-[4%] top-[9%] w-[15vmin] wide:bottom-[3%] wide:right-[6%] wide:top-auto wide:w-[12vmin]`} />
          <img ref={portal} src={`${ART}/portal.webp`} alt="" draggable={false} className={`${img} -left-[10vmin] top-[30%] w-[38vmin] wide:bottom-[1%] wide:left-[29%] wide:top-auto wide:w-[26vmin]`} />
        </>
      )}
    </div>
  );
}

/**
 * La nave del mapa plano: una ilustración que cruza la pantalla cada cierto tiempo, balanceándose.
 * En el globo no hace falta: allí vuela una de verdad, en tres dimensiones (src/engine/toonScene.ts).
 */
export function ToonSaucer({ animated }: { animated: boolean }) {
  const path = useRef<HTMLDivElement>(null);
  const ship = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!animated) return;
    // Cruza de izquierda a derecha en algo más de la mitad del ciclo; el resto espera fuera de la pantalla.
    const fly = path.current?.animate(
      [
        { transform: 'translate(-50vmin, 34vh)', offset: 0 },
        { transform: 'translate(22vw, 14vh)', offset: 0.18 },
        { transform: 'translate(48vw, 44vh)', offset: 0.36 },
        { transform: 'translate(74vw, 20vh)', offset: 0.5 },
        { transform: 'translate(110vw, 38vh)', offset: 0.62 },
        { transform: 'translate(110vw, 38vh)', offset: 1 },
      ],
      { duration: 26_000, iterations: Infinity },
    );
    const bob = ship.current?.animate([{ transform: 'rotate(-6deg)' }, { transform: 'rotate(5deg)' }], { duration: 1_900, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    return () => {
      fly?.cancel();
      bob?.cancel();
    };
  }, [animated]);

  return (
    // Por encima de las nubes (que van con los rótulos del mapa, en z 20) y por debajo de los paneles.
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[21] overflow-hidden">
      <div ref={path} className="absolute left-0 top-0" style={animated ? { transform: 'translate(-50vmin, 34vh)' } : { transform: 'translate(58vw, 12vh)' }}>
        <img ref={ship} src={`${ART}/nave.webp`} alt="" draggable={false} className="w-[42vmin] max-w-none select-none wide:w-[36vmin]" />
      </div>
    </div>
  );
}
