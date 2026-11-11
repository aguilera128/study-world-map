import { useEffect, useRef } from 'react';
import type { MapEngine } from '../engine/MapEngine';

// Huevo de pascua (cinco clics en «Globo 3D»): el espacio de unos dibujos animados de ciencia ficción.
// Qué pone: un fondo de nebulosas detrás del mapa, en lugar de la Vía Láctea; planetas de colores y
// un remolino verde que flotan alrededor del globo y giran con él; unas nubes sobre el planeta; y una
// nave hecha en un garaje que cruza por delante con sus dos tripulantes. El Sol de dibujos no está
// aquí: es el de «Tiempo real» (RealTime.tsx), en el sitio del Sol de verdad.
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
      {/* En el mapa plano no hay «alrededor»: los astros se quedan en las esquinas. En el globo flotan en torno a él (ToonBodies). */}
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
 * Los astros del globo: dónde flotan (longitud, latitud y altura sobre la superficie, en radios
 * terrestres), cuánto miden (su radio, también en radios) y la proporción de su dibujo (alto / ancho).
 * Están fijos respecto a la Tierra, así que al girarla dan la vuelta con ella: asoman por un lado,
 * pasan por detrás y salen por el otro.
 */
const BODIES: { art: string; lon: number; lat: number; alt: number; size: number; aspect: number; spin?: boolean }[] = [
  // Cerca de la Tierra y en latitudes bajas: así asoman a los lados del globo durante buena parte de
  // la vuelta. Más lejos solo se verían un instante, pegados al borde.
  { art: 'anillo', lon: -60, lat: 18, alt: 1.1, size: 0.42, aspect: 0.662 },
  { art: 'portal', lon: -150, lat: -12, alt: 0.9, size: 0.4, aspect: 1.021, spin: true },
  { art: 'verde', lon: 140, lat: 24, alt: 1.2, size: 0.2, aspect: 1.009 },
  { art: 'luna', lon: 60, lat: -20, alt: 0.8, size: 0.18, aspect: 1.006 },
  { art: 'verde', lon: -10, lat: -28, alt: 1, size: 0.14, aspect: 1.009 },
  { art: 'luna', lon: -105, lat: 30, alt: 1.3, size: 0.13, aspect: 1.006 },
  { art: 'anillo', lon: 100, lat: -8, alt: 1.5, size: 0.3, aspect: 0.662 },
  { art: 'luna', lon: 175, lat: -30, alt: 1, size: 0.16, aspect: 1.006 },
  { art: 'verde', lon: -35, lat: 34, alt: 1.4, size: 0.12, aspect: 1.009 },
  { art: 'luna', lon: 20, lat: 20, alt: 1.2, size: 0.12, aspect: 1.006 },
];

function Body({ engine, body, animated }: { engine: MapEngine; body: (typeof BODIES)[number]; animated: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (ref.current) return engine.track(ref.current, body.lon, body.lat, body.alt, body.size);
  }, [engine, body]);
  useEffect(() => {
    if (!animated || !body.spin) return;
    const spin = art.current?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 14_000, iterations: Infinity });
    return () => spin?.cancel();
  }, [animated, body.spin]);
  return (
    <div ref={ref} className="map-pin centered" data-hidden>
      {/* El motor le pone el ancho (según lo lejos que esté) y lo recorta con el contorno de la Tierra; lo que gira es la imagen de dentro. */}
      <span data-sky data-aspect={body.aspect} className="block">
        <img ref={art} src={`${ART}/${body.art}.webp`} alt="" draggable={false} className="pointer-events-none block w-full max-w-none select-none" />
      </span>
    </div>
  );
}

/** Los planetas y el remolino, flotando alrededor del globo. */
export function ToonBodies({ engine, animated }: { engine: MapEngine; animated: boolean }) {
  return (
    <div aria-hidden="true">
      {BODIES.map((body, i) => (
        <Body key={i} engine={engine} body={body} animated={animated} />
      ))}
    </div>
  );
}

/** La nave: cruza la pantalla por delante del mapa cada cierto tiempo, balanceándose. */
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

/** Dónde va cada nube sobre el planeta (longitud, latitud) y cuánto mide (en píxeles de una pantalla de 800 de alto). */
const CLOUDS: [lon: number, lat: number, size: number][] = [
  [-32, 38, 96],
  [18, -8, 78],
  [72, 24, 104],
  [118, -26, 84],
  [-98, 12, 90],
  [-150, 42, 74],
  [162, 6, 92],
  [-58, -32, 80],
  [42, 56, 70],
  [-122, -46, 86],
  [100, 52, 76],
  [-8, 14, 68],
];

/** Una nube clavada en un punto del planeta: el motor la mueve con él y la esconde en la cara oculta. */
function Cloud({ engine, lon, lat, size, flip }: { engine: MapEngine; lon: number; lat: number; size: number; flip: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) return engine.track(ref.current, lon, lat);
  }, [engine, lon, lat]);
  return (
    <div ref={ref} className="map-pin centered">
      {/* El centrado lo pone «.map-pin.centered» en este hijo; el volteo va en la imagen, que no lo pise. */}
      <span className="block">
        <img
          src={`${ART}/nube.webp`}
          alt=""
          draggable={false}
          className="pointer-events-none block max-w-none select-none opacity-95"
          // El tamaño va con la pantalla (en una de 800 px de alto, «size» píxeles): en el móvil el globo es menor.
          style={{ width: `${size / 8}vmin`, transform: flip ? 'scaleX(-1)' : undefined }}
        />
      </span>
    </div>
  );
}

/** Las nubes del planeta de dibujos. */
export function ToonClouds({ engine }: { engine: MapEngine }) {
  return (
    <div aria-hidden="true">
      {CLOUDS.map(([lon, lat, size], i) => (
        <Cloud key={i} engine={engine} lon={lon} lat={lat} size={size} flip={i % 2 === 1} />
      ))}
    </div>
  );
}
