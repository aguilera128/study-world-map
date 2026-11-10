import type { ReactNode } from 'react';

// Iconos de trazo dibujados para esta aplicación (rejilla de 24 px, trazo redondeado).

const PATHS = {
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.800 2.600 4.200 5.600 4.200 9s-1.400 6.400-4.200 9c-2.800-2.600-4.200-5.600-4.200-9S9.200 5.600 12 3z" />
    </>
  ),
  map: (
    <>
      <path d="M3 6.500 9 4l6 2.500L21 4v13.500L15 20l-6-2.500L3 20z" />
      <path d="M9 4v13.500M15 6.500V20" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.500-5.800-6.500-11a6.500 6.500 0 0 1 13 0c0 5.200-6.500 11-6.500 11z" />
      <circle cx="12" cy="10" r="2.300" />
    </>
  ),
  continents: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.200 6.800c1.600.400 2.600 1.500 2.500 3-.100 1.600-1.900 1.700-2.300 3.200-.300 1.300.600 2.300 1.800 3.300" />
      <path d="M13.500 3.200c-.600 1.900.300 3.100 1.900 3.700 1.700.600 3.100 1.400 2.700 3.400-.400 1.900-2.600 1.900-3.100 3.900-.400 1.700.700 3.300 2.200 4.200" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12.500v-8A1.500 1.500 0 0 1 4.500 3h8l8.500 8.500a1.500 1.500 0 0 1 0 2.100l-7.400 7.400a1.500 1.500 0 0 1-2.100 0z" />
      <circle cx="8" cy="8" r="1.400" />
    </>
  ),
  star: <path d="m12 3.200 2.700 5.500 6.100.900-4.400 4.300 1 6.100L12 17.100 6.600 20l1-6.100-4.400-4.300 6.100-.900z" />,
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4.600c4-2 6 2 10 0 1.500-.700 3-.800 4-.500v9c-1-.300-2.500-.200-4 .500-4 2-6-2-10 0" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.600 8.400-2.100 5.100-5.100 2.100 2.100-5.100z" />
    </>
  ),
  chart: (
    <>
      <path d="M6 20v-7M12 20V5M18 20v-10" />
      <path d="M3 20h18" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.500v2M12 19.500v2M5 5l1.400 1.400M17.600 17.600 19 19M2.500 12h2M19.500 12h2M5 19l1.400-1.400M17.600 6.400 19 5" />
    </>
  ),
  moon: <path d="M20 14.300A8.500 8.500 0 1 1 9.700 4a7 7 0 0 0 10.300 10.300z" />,
  daynight: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 3.500a8.500 8.500 0 0 0 0 17z" fill="currentColor" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  target: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="1.300" fill="currentColor" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.500 4.500 4.500L19 7.500" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.500" />
      <path d="m16 16 4.500 4.500" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4.500 6h.01M4.500 12h.01M4.500 18h.01" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19.500 8.500l-4-4L4 16z" />
      <path d="m13.500 6.500 4 4" />
    </>
  ),
  trash: <path d="M4 7h16M9.500 7V4h5v3M6.500 7l1 13h9l1-13" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.700 0l3-3A4 4 0 0 0 13 5.300l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1-1" />
    </>
  ),
  flame: (
    <path d="M12 21c-3.600 0-6-2.500-6-5.800 0-2.400 1.400-4 2.600-5.400 1.200-1.400 2.200-2.800 1.900-5.800 2.500 1.200 4.200 3.400 4.500 6 .700-.600 1.200-1.500 1.300-2.500 1.200 1.500 1.700 3.500 1.700 7.700 0 3.300-2.400 5.800-6 5.800z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.500" />
      <path d="M12 7.500V12l3 2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.500 9 4.500-9 4.500-9-4.500z" />
      <path d="m3 12 9 4.500 9-4.500M3 16l9 4.500 9-4.500" />
    </>
  ),
  bug: (
    <>
      <path d="M9 9V7.500a3 3 0 0 1 6 0V9" />
      <rect x="7.500" y="9" width="9" height="11" rx="4.500" />
      <path d="M12 13v7M4 13.500h3.500M16.500 13.500H20M5 7.500l2.800 2.300M19 7.500l-2.800 2.300M5 19.500 7.800 17M19 19.500 16.200 17" />
    </>
  ),
  heart: <path d="M12 20s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.200a4.300 4.300 0 0 1 7.500 2.600C19.500 15.400 12 20 12 20z" />,
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.500 9.500a2.500 2.500 0 1 1 3.800 2.100c-.800.500-1.300 1.100-1.300 2" />
      <path d="M12 17h.01" />
    </>
  ),
  keyboard: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" />
    </>
  ),
  eye: (
    <>
      <path d="M2.500 12S6 5.500 12 5.500 21.500 12 21.500 12 18 18.500 12 18.500 2.500 12 2.500 12z" />
      <circle cx="12" cy="12" r="2.700" />
    </>
  ),
  replay: (
    <>
      <path d="M4 12a8 8 0 1 0 2.600-5.900" />
      <path d="M4 4v4.500h4.500" />
    </>
  ),
  options: (
    <>
      <rect x="3.500" y="4" width="7" height="7" rx="1.500" />
      <rect x="13.500" y="4" width="7" height="7" rx="1.500" />
      <rect x="3.500" y="13" width="7" height="7" rx="1.500" />
      <rect x="13.500" y="13" width="7" height="7" rx="1.500" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
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
      {PATHS[name]}
    </svg>
  );
}

/** Punta de la rosa partida en dos mitades (llena y clara), como en las cartas náuticas. */
function RosePoint({ rot, r, w, fill, light }: { rot: number; r: number; w: number; fill: string; light: number }) {
  return (
    <g transform={`rotate(${rot} 16 16)`}>
      <path d={`M16 ${16 - r}L${16 - w} ${16 - w}L16 16z`} fill={fill} />
      <path d={`M16 ${16 - r}L${16 + w} ${16 - w}L16 16z`} fill={fill} opacity={light} />
    </g>
  );
}

/**
 * Rosa de los vientos de la marca: cuatro puntas cardinales y cuatro diagonales, con el norte en
 * bermellón. public/favicon.svg es el mismo dibujo, sin fondo y con colores para tema claro y oscuro: si cambia uno, cambia el otro.
 */
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <g opacity="0.6">
        {[45, 135, 225, 315].map((rot) => (
          <RosePoint key={rot} rot={rot} r={9.2} w={1.9} fill="currentColor" light={0.5} />
        ))}
      </g>
      {[90, 180, 270].map((rot) => (
        <RosePoint key={rot} rot={rot} r={13.2} w={2.9} fill="currentColor" light={0.35} />
      ))}
      <RosePoint rot={0} r={13.2} w={2.9} fill="var(--accent)" light={0.6} />
      <circle cx="16" cy="16" r="1.8" fill="var(--paper)" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
