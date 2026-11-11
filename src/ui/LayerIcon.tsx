import type { ReactNode } from 'react';
import type { LayerId } from '../app/store';

// Un icono por capa del mapa, dibujado para esta aplicación: cada uno enseña lo que la capa pinta,
// como los símbolos de la leyenda de un atlas. Misma rejilla que Icon.tsx (24 px, trazo redondeado),
// con dos recursos más: un trazo fino para el detalle y una aguada (la tinta al 24 %) para las masas.

const fine = { strokeWidth: 1.3 };
const wash = { fill: 'currentColor', fillOpacity: 0.24, stroke: 'none' };
const solid = { fill: 'currentColor', stroke: 'none' };

/** Ola de lado a lado, a la altura «y»: la superficie del mar. */
const wave = (y: number) => `M3 ${y}c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0`;

const ICONS: Record<LayerId, ReactNode> = {
  // Relieve: dos cumbres con la ladera de levante en sombra, como en un mapa sombreado.
  relief: (
    <>
      <path d="M9 6.5l3.6 6.2-.7 6.8h-.4l-1.9-5 1.2-3.5z" {...wash} />
      <path d="M15 9l6.5 10.5h-4.7l-1.600-4.300 1-2.600z" {...wash} />
      <path d="M2.5 19.5 9 6.5l3.6 6.2L15 9l6.5 10.5z" />
      <path d="M9 6.5l1.800 4.500-1.200 3.500 1.900 5M15 9l1.200 3.600-1 2.600 1.600 4.300" {...fine} />
    </>
  ),
  // Montañas, ríos y mares: la cumbre, el río que baja de ella y el mar al que llega.
  features: (
    <>
      <path d="M3.500 12 8.500 4l2.800 4.600L13 6l4 6" />
      <path d="M11.200 11.500C8.500 13.500 15 14 13.800 16.600c-.500 1-1.500 1.600-1.800 2.300" {...fine} />
      <path d={wave(20.5)} />
    </>
  ),
  // Profundidad del mar: corte del fondo (plataforma, talud, llanura) y la sonda que lo mide.
  depth: (
    <>
      <path d="M3 10h3.500c2 0 1.800 4.500 4 4.500h1c2.200 0 2 5 4.500 5H21V21.500H3z" {...wash} />
      <path d={wave(5.5)} />
      <path d="M3 10h3.500c2 0 1.800 4.500 4 4.500h1c2.200 0 2 5 4.500 5H21" />
      <path d="M17.500 8.700v6" strokeDasharray="1.400 2" {...fine} />
      <circle cx="17.500" cy="16.400" r="1.200" {...solid} />
    </>
  ),
  // Corrientes oceánicas: dos ramas que serpentean en sentidos contrarios, como en un giro.
  currents: (
    <>
      <path d="M3 8.500C7 5 11 11 17 8" />
      <path d="M13.800 7.500 17 8l-1.500 2.800" />
      <path d="M21 15.500C17 19 13 13 7 16" />
      <path d="M10.200 16.500 7 16l1.500-2.800" />
      <path d="M7.500 12.300c1.500-.900 3-.900 4.500-.300s3 .600 4.500-.300" {...fine} />
    </>
  ),
  // Placas y volcanes: el volcán en erupción sobre el borde quebrado de una placa.
  tectonics: (
    <>
      <path d="M5 17l5.500-9.500L12 9.500l1.500-2L19 17" />
      <circle cx="12" cy="5.200" r="1" {...solid} />
      <circle cx="8.800" cy="3.700" r="0.800" {...solid} />
      <circle cx="15.200" cy="3.700" r="0.800" {...solid} />
      <path d="M2.500 20.500H7l2-1.800 2.500 2.800 2.300-2.500 1.700 1.500h6" {...fine} />
    </>
  ),
  // Colorear por clima: las zonas climáticas de la Tierra, con la cálida y las polares teñidas.
  climate: (
    <>
      <path d="M3.510 9h16.980a9 9 0 0 1 0 6H3.510a9 9 0 0 1 0-6z" fill="currentColor" fillOpacity={0.4} stroke="none" />
      <path d="M5.780 5.500h12.440a9 9 0 0 0-12.440 0zM5.780 18.500h12.440a9 9 0 0 1-12.440 0z" fill="currentColor" fillOpacity={0.14} stroke="none" />
      <circle cx="12" cy="12" r="9" />
      <path d="M5.780 5.500h12.440M3.510 9h16.980M3.510 15h16.980M5.780 18.500h12.440" {...fine} />
    </>
  ),
  // Densidad de población: mapa de puntos, apretados y gruesos donde vive más gente.
  population: (
    <>
      <circle cx="6" cy="6" r="3.200" {...solid} />
      <circle cx="12.800" cy="5.500" r="2.200" {...solid} />
      <circle cx="18.800" cy="5.200" r="1.300" {...solid} />
      <circle cx="5.500" cy="12.800" r="2.200" {...solid} />
      <circle cx="11.800" cy="12" r="1.600" {...solid} />
      <circle cx="18" cy="11.600" r="1" {...solid} />
      <circle cx="5.200" cy="18.800" r="1.300" {...solid} />
      <circle cx="11.600" cy="18" r="1" {...solid} />
      <circle cx="17.600" cy="17.600" r="0.700" {...solid} />
    </>
  ),
  // Husos horarios: el huso (la franja entre dos meridianos) y las agujas del reloj dentro.
  timezones: (
    <>
      <path d="M12 3c2.800 2.600 4.200 5.600 4.200 9s-1.400 6.400-4.200 9c-2.800-2.600-4.200-5.600-4.200-9S9.200 5.600 12 3z" {...wash} />
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.800 2.600 4.200 5.600 4.200 9s-1.400 6.400-4.200 9c-2.800-2.600-4.200-5.600-4.200-9S9.200 5.600 12 3z" {...fine} />
      <path d="M12 7.800V12l2.400 1.500" />
    </>
  ),
  // Meridianos y paralelos: un trozo de la red, con los meridianos cerrándose hacia el polo.
  grid: (
    <>
      <path d="M7.530 5.050a11 11 0 0 0 8.940 0l5.290 11.880a24 24 0 0 1-19.520 0z" />
      <path d="M12 6v13M4.880 11a17.500 17.500 0 0 0 14.240 0" {...fine} />
    </>
  ),
  // Líneas imaginarias: el eje inclinado de la Tierra y el ecuador, a trazos.
  guides: (
    <>
      <circle cx="12" cy="12" r="7.500" />
      <path d="M14.990 5.120l1.300-3M9.010 18.880l-1.300 3" />
      <path d="M5.120 9.010a7.500 2.600 23.500 0 0 13.760 5.980" strokeDasharray="2.200 2.700" />
    </>
  ),
  // Imagen de satélite: el satélite, con sus paneles, mirando a la Tierra.
  satellite: (
    <>
      <path d="M17.400 22.500a8 8 0 0 1 5.100-5.100v5.100z" {...wash} />
      <path d="M17.400 22.500a8 8 0 0 1 5.100-5.100" />
      <g transform="translate(10.500 10.500) rotate(-45)">
        <rect x="-2.600" y="-2.600" width="5.200" height="5.200" rx="1" />
        <rect x="-10" y="-1.900" width="5.200" height="3.800" rx="0.600" />
        <rect x="4.800" y="-1.900" width="5.200" height="3.800" rx="0.600" />
        <path d="M-4.800 0h2.200M2.600 0h2.200M0 2.600v2.100" />
        <path d="M-7.400-1.900v3.800M7.400-1.900v3.800" {...fine} />
        <path d="M-2.200 6.900a2.200 2.200 0 0 1 4.400 0" />
      </g>
    </>
  ),
  // Reflejo del agua: el destello del Sol sobre las olas.
  glint: (
    <>
      <path d="M12 2c.600 3.200 2.300 4.900 5.500 5.500-3.200.600-4.900 2.300-5.500 5.500-.600-3.200-2.300-4.900-5.500-5.500C9.700 6.900 11.400 5.200 12 2z" {...wash} />
      <path d="M12 2c.600 3.200 2.300 4.900 5.500 5.500-3.200.600-4.900 2.300-5.500 5.500-.600-3.200-2.300-4.900-5.500-5.500C9.700 6.900 11.400 5.200 12 2z" {...fine} />
      <path d={wave(16.5)} />
      <path d="M6 20.800c1-.800 2-.800 3 0s2 .800 3 0 2-.800 3 0 2 .800 3 0" {...fine} />
    </>
  ),
  // Estrellas: el Carro de la Osa Mayor, con sus siete estrellas unidas.
  stars: (
    <>
      <path d="M3 6.500 7 7.700l3.500 2.500 3.200 2.600 1 5 5.500.400.500-5.600-7-.100" strokeWidth={1.1} />
      <circle cx="3" cy="6.500" r="1.300" {...solid} />
      <circle cx="7" cy="7.700" r="1.100" {...solid} />
      <circle cx="10.500" cy="10.200" r="1.300" {...solid} />
      <circle cx="13.700" cy="12.800" r="1.100" {...solid} />
      <circle cx="14.700" cy="17.800" r="1.300" {...solid} />
      <circle cx="20.200" cy="18.200" r="1.500" {...solid} />
      <circle cx="20.700" cy="12.600" r="1.500" {...solid} />
    </>
  ),
  // Día y noche: la luz llega por un lado y la otra cara del globo queda a oscuras.
  dayNight: (
    <>
      <path d="M14 4.500a7.500 7.500 0 0 1 0 15 3 7.500 0 0 1 0-15z" fill="currentColor" fillOpacity={0.5} stroke="none" />
      <circle cx="14" cy="12" r="7.500" />
      <path d="M14 19.500a3 7.500 0 0 1 0-15" {...fine} />
      <path d="M2 12h2.300M2.800 7.300l2 1.100M2.800 16.700l2-1.100" />
    </>
  ),
  // Sol: el disco y sus rayos, largos y cortos.
  sun: (
    <>
      <circle cx="12" cy="12" r="3.800" {...wash} />
      <circle cx="12" cy="12" r="3.800" />
      <path d="M12 2.200v3.300M12 18.500v3.300M2.200 12h3.300M18.500 12h3.300" />
      <path d="M6.300 6.300l1.300 1.300M16.400 16.400l1.300 1.300M6.300 17.700l1.300-1.300M16.400 7.600l1.300-1.300" {...fine} />
    </>
  ),
  // Luna: creciente, con sus cráteres.
  moon: (
    <>
      <path d="M19.740 14.560A8.500 8.500 0 1 1 9.440 4.260a7.400 7.400 0 0 0 10.300 10.300z" />
      <circle cx="8" cy="15.700" r="1.400" {...fine} />
      <circle cx="12.700" cy="18" r="0.900" {...fine} />
      <circle cx="5.600" cy="11" r="0.800" {...fine} />
    </>
  ),
  // Mi ubicación: la chincheta clavada en el suelo, con el cerco de donde estás.
  you: (
    <>
      <path d="M12 18s-4.800-4.400-4.800-8.500a4.800 4.800 0 0 1 9.600 0c0 4.100-4.800 8.500-4.800 8.500z" />
      <circle cx="12" cy="9.400" r="1.700" {...solid} />
      <path d="M7.300 16.300C5 16.800 3.500 17.600 3.500 18.500c0 1.600 3.800 2.900 8.500 2.900s8.500-1.300 8.500-2.900c0-.900-1.500-1.700-3.800-2.200" {...fine} />
    </>
  ),
};

/**
 * El remolino verde del planeta de dibujos (el huevo de pascua). Es el único icono con color propio:
 * no es una capa del atlas, es una broma, y tiene que notarse.
 */
export function PortalIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path
        d="M20.6 12Q22.5 16.4 18.1 18.1 16.4 22.5 12 20.6 7.6 22.5 5.9 18.1 1.5 16.4 3.4 12 1.500 7.600 5.900 5.900 7.600 1.500 12 3.400 16.400 1.500 18.100 5.900 22.500 7.600 20.600 12Z"
        fill="#58c92a"
        stroke="#1d5e12"
        strokeWidth={1.4}
      />
      <circle cx="12" cy="12" r="5.6" fill="#a5ee4c" />
      <path d="M12 12.200c.200-1.300 2-1.500 2.700-.300 1 1.700-.300 3.900-2.400 4.200-2.900.400-5-2.100-4.600-4.800.500-3.300 3.900-5 6.900-3.900" stroke="#1d5e12" strokeWidth={1.5} />
      <circle cx="12" cy="12.100" r="1.100" fill="#f1ffc4" />
    </svg>
  );
}

export function LayerIcon({ id, size = 22, className }: { id: LayerId; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[id]}
    </svg>
  );
}
