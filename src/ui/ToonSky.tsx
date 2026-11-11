// Huevo de pascua (cinco clics en «Globo 3D»): el espacio de unos dibujos animados de ciencia ficción.
// Dos capas de SVG: el cielo, detrás del mapa (nebulosa, destellos, planetas de colores, un sol y un
// remolino verde que gira), y un platillo volante que cruza por delante con sus dos tripulantes.
// El globo ocupa el centro y la derecha de la pantalla, así que los planetas van a su izquierda y en
// las esquinas. Todo es dibujo propio y no guarda ni pide nada. Las animaciones van dentro del SVG (SMIL), así que
// no hay hojas de estilo que cargar; con «reducir movimiento» se queda quieto.

const INK = '#160d22';
const VIEW = '0 0 1600 900';
const SPARK = 'M0-1C.12-.3.3-.12 1 0 .3.12.12.3 0 1-.12.3-.3.12-1 0-.3-.12-.12-.3 0-1z';

/** Destellos repartidos siempre igual: un generador con semilla, no el azar de cada visita. */
const SPARKS = (() => {
  let seed = 20261111;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const colors = ['#ffffff', '#fff3b0', '#ffc2e8', '#c2f5ff'];
  return Array.from({ length: 80 }, () => ({ x: next() * 1600, y: next() * 900, size: 2 + next() * next() * 11, color: colors[Math.floor(next() * colors.length)], blink: next() < 0.4, delay: next() * 4 }));
})();

/** Brazo de espiral, del centro hacia fuera. */
function spiral(turns: number, radius: number, phase: number): string {
  const steps = 60;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = phase + t * turns * Math.PI * 2;
    const r = 8 + t * (radius - 8);
    d += `${i ? 'L' : 'M'}${(Math.cos(angle) * r).toFixed(1)} ${(Math.sin(angle) * r).toFixed(1)}`;
  }
  return d;
}

/** El cielo: va detrás del mapa, que es transparente fuera del globo. */
export function ToonSky({ animated }: { animated: boolean }) {
  return (
    <svg aria-hidden="true" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" className="pointer-events-none fixed inset-0 h-full w-full">
      <defs>
        <linearGradient id="toon-space" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a0a3d" />
          <stop offset="0.5" stopColor="#3a1263" />
          <stop offset="1" stopColor="#0b2550" />
        </linearGradient>
        <filter id="toon-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="55" />
        </filter>
        <clipPath id="toon-ringed">
          <circle r="62" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#toon-space)" />

      {/* nebulosa: manchas de color muy difuminadas y una banda que cruza el cielo */}
      <g filter="url(#toon-blur)">
        <path d="M-100 620C300 380 700 520 1000 300S1500 80 1750 140" fill="none" stroke="#ff4fa3" strokeWidth="170" opacity="0.32" />
        <path d="M-100 760C350 560 760 700 1080 470S1520 300 1750 330" fill="none" stroke="#7dff6a" strokeWidth="90" opacity="0.22" />
        <ellipse cx="300" cy="180" rx="320" ry="170" fill="#ff7a3d" opacity="0.2" />
        <ellipse cx="1350" cy="700" rx="360" ry="200" fill="#39d7ff" opacity="0.2" />
        <ellipse cx="900" cy="80" rx="300" ry="120" fill="#b44dff" opacity="0.3" />
      </g>

      {SPARKS.map((s, i) => (
        <path key={i} d={SPARK} fill={s.color} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) scale(${s.size.toFixed(1)})`}>
          {animated && s.blink && <animate attributeName="opacity" values="1;0.25;1" dur="3.2s" begin={`${s.delay.toFixed(1)}s`} repeatCount="indefinite" />}
        </path>
      ))}

      {/* un sol amarillo con sus halos */}
      <g transform="translate(1515 850)">
        <circle r="118" fill="#ff9d2e" opacity="0.16">
          {animated && <animate attributeName="r" values="112;126;112" dur="5s" repeatCount="indefinite" />}
        </circle>
        <circle r="88" fill="#ffb347" opacity="0.3" />
        <circle r="60" fill="#ffe36b" stroke="#ff9d2e" strokeWidth="7" />
        <path d="M-28-18c10-12 30-16 44-6M-34 12c14 14 40 18 60 4" fill="none" stroke="#fff6c2" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      </g>

      {/* planeta con anillo */}
      <g transform="translate(655 118) rotate(-18) scale(0.8)">
        <path d="M112 0A112 26 0 0 0-112 0" fill="none" stroke={INK} strokeWidth="17" />
        <path d="M112 0A112 26 0 0 0-112 0" fill="none" stroke="#ffd98a" strokeWidth="9" />
        <circle r="62" fill="#c86bd9" />
        <g clipPath="url(#toon-ringed)">
          <path d="M-70-30c30-14 60 10 90-4s40-8 60 2v22c-20-10-40-6-60 2s-60-10-90 4z" fill="#f29ad8" />
          <path d="M-70 14c30-12 60 12 90 0s40-8 60 2v24c-20-10-40-6-60 2s-60-12-90 0z" fill="#8d49c9" />
          <path d="M-70 46c30-10 70 10 140 0v30h-140z" fill="#6a34a8" />
        </g>
        <circle r="62" fill="none" stroke={INK} strokeWidth="5" />
        <path d="M-112 0A112 26 0 0 0 112 0" fill="none" stroke={INK} strokeWidth="17" />
        <path d="M-112 0A112 26 0 0 0 112 0" fill="none" stroke="#ffd98a" strokeWidth="9" />
      </g>

      {/* luna rojiza con cráteres */}
      <g transform="translate(1500 560)" stroke={INK}>
        <circle r="46" fill="#ff8a5c" strokeWidth="5" />
        <circle cx="-14" cy="-12" r="11" fill="#d95f3d" strokeWidth="3" />
        <circle cx="16" cy="8" r="8" fill="#d95f3d" strokeWidth="3" />
        <circle cx="-6" cy="22" r="6" fill="#d95f3d" strokeWidth="3" />
        <circle cx="22" cy="-20" r="5" fill="#d95f3d" strokeWidth="3" />
      </g>

      {/* planeta verde con manchas */}
      <g transform="translate(548 440)" stroke={INK}>
        <circle r="32" fill="#9be86f" strokeWidth="5" />
        <path d="M-18-8c6-10 20-8 22 2s-12 12-22-2zM4 12c6-4 16-2 16 6s-14 8-16-6z" fill="#4fb53c" strokeWidth="3" />
      </g>

      {/* remolino verde: gira despacio */}
      <g transform="translate(600 745) scale(0.85)">
        <g>
          {animated && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite" />}
          <path
            d="M96 0c6 22-10 34-18 50s-2 34-24 42-34-8-52-8-34 14-52 2-12-32-22-46-30-22-26-44 26-26 36-40 10-36 32-44 34 8 52 8 34-14 52-2 12 32 22 46 26 20 20 36z"
            fill="#2f9e2a"
            stroke={INK}
            strokeWidth="5"
          />
          <path d={spiral(1.6, 84, 0)} fill="none" stroke="#7dff6a" strokeWidth="15" strokeLinecap="round" />
          <path d={spiral(1.6, 78, 2.1)} fill="none" stroke="#d6ff6a" strokeWidth="9" strokeLinecap="round" />
          <path d={spiral(1.6, 72, 4.2)} fill="none" stroke="#f4ffd0" strokeWidth="5" strokeLinecap="round" />
          <circle r="11" fill="#f4ffd0" />
        </g>
      </g>
    </svg>
  );
}

/** El platillo volante: cruza la pantalla por delante del mapa cada cierto tiempo. */
export function ToonSaucer({ animated }: { animated: boolean }) {
  return (
    <svg aria-hidden="true" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" className="pointer-events-none fixed inset-0 h-full w-full">
      <g transform={animated ? undefined : 'translate(1180 300)'}>
        {/* Empieza y acaba fuera de la pantalla; al terminar se queda allí hasta la siguiente pasada. */}
        {animated && <animateMotion id="toon-fly" dur="13s" begin="0s; toon-fly.end+11s" fill="freeze" path="M-220 320C300 120 620 540 920 300S1500 140 1840 400" />}
        <g>
          {animated && <animateTransform attributeName="transform" type="rotate" values="-7;7;-7" dur="3.4s" repeatCount="indefinite" />}
          <ellipse cy="27" rx="46" ry="10" fill="#7df9ff" opacity="0.75">
            {animated && <animate attributeName="opacity" values="0.75;0.35;0.75" dur="0.5s" repeatCount="indefinite" />}
          </ellipse>
          <path d="M-84 4C-58 31 58 31 84 4z" fill="#5b5f86" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cy="2" rx="88" ry="20" fill="#9aa0c8" stroke={INK} strokeWidth="4" />
          {[-60, -30, 0, 30, 60].map((x) => (
            <circle key={x} cx={x} cy={7 - Math.abs(x) / 30} r="5" fill="#ffe36b" stroke={INK} strokeWidth="2" />
          ))}
          {/* los dos tripulantes */}
          <g stroke={INK} strokeWidth="2.5" strokeLinecap="round">
            <path d="M-15-28v-9" fill="none" />
            <circle cx="-15" cy="-39" r="2.6" fill="#ffe36b" />
            <ellipse cx="-15" cy="-17" rx="11" ry="12" fill="#7be26b" />
            <ellipse cx="-19" cy="-19" rx="2.6" ry="3.6" fill={INK} stroke="none" />
            <ellipse cx="-11" cy="-19" rx="2.6" ry="3.6" fill={INK} stroke="none" />
            <path d="M14-21v-7" fill="none" />
            <circle cx="14" cy="-30" r="2.2" fill="#7df9ff" />
            <ellipse cx="14" cy="-12" rx="9" ry="9.5" fill="#ff8ad0" />
            <circle cx="11" cy="-13" r="2.2" fill={INK} stroke="none" />
            <circle cx="17" cy="-13" r="2.2" fill={INK} stroke="none" />
          </g>
          <path d="M-42-6C-42-54 42-54 42-6z" fill="#bff3ff" fillOpacity="0.45" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M-30-14c2-18 14-28 28-30" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        </g>
      </g>
    </svg>
  );
}
