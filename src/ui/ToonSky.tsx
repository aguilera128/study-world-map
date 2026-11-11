// Huevo de pascua (cinco clics en «Globo 3D»): el espacio de unos dibujos animados de ciencia ficción.
// Dos capas de SVG: el cielo, detrás del mapa (espacio oscuro con bruma verde, estrellas, planetas de
// colores, un sol y un remolino verde que gira), y una nave hecha en un garaje que cruza por delante
// con sus dos tripulantes. Todo es dibujo propio: ni la nave ni los personajes son de ninguna serie.
// El trazo va «a mano» (un filtro lo hace temblar un poco) y las sombras son planas, en dos tonos.
// El globo ocupa el centro y la derecha de la pantalla, así que los planetas van a su izquierda y en
// las esquinas. No guarda ni pide nada. Las animaciones van dentro del SVG (SMIL), así que no hay
// hojas de estilo que cargar; con «reducir movimiento» se queda quieto.

const INK = '#12091c';
const VIEW = '0 0 1600 900';
const SPARK = 'M0-1C.12-.3.3-.12 1 0 .3.12.12.3 0 1-.12.3-.3.12-1 0-.3-.12-.12-.3 0-1z';

/** Números repartidos siempre igual: un generador con semilla, no el azar de cada visita. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

const STARS = (() => {
  const next = seeded(20261111);
  const colors = ['#ffffff', '#fff3b0', '#ffd0ee', '#c8f7ff'];
  return Array.from({ length: 230 }, () => ({ x: next() * 1600, y: next() * 900, r: 0.6 + next() * next() * 2.2, color: colors[Math.floor(next() * colors.length)], opacity: 0.45 + next() * 0.55 }));
})();

const SPARKS = (() => {
  const next = seeded(77);
  return Array.from({ length: 16 }, () => ({ x: next() * 1600, y: next() * 900, size: 5 + next() * 8, delay: next() * 4 }));
})();

/** Contorno irregular, como recortado a mano: un círculo al que le salen bultos. */
function blob(radius: number, bumps: number, amount: number, phase: number): string {
  const steps = 72;
  let d = '';
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius * (1 + amount * Math.sin(bumps * angle + phase) + amount * 0.5 * Math.sin((bumps + 3) * angle + phase * 2));
    d += `${i ? 'L' : 'M'}${(Math.cos(angle) * r).toFixed(1)} ${(Math.sin(angle) * r).toFixed(1)}`;
  }
  return `${d}z`;
}

/** Brazo de espiral, del centro hacia fuera. */
function spiral(turns: number, radius: number, phase: number): string {
  const steps = 70;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = phase + t * turns * Math.PI * 2;
    const r = 10 + t * (radius - 10);
    d += `${i ? 'L' : 'M'}${(Math.cos(angle) * r).toFixed(1)} ${(Math.sin(angle) * r).toFixed(1)}`;
  }
  return d;
}

/** Sombra plana de un astro redondo: una media luna más oscura por el lado contrario a la luz. */
const shadow = (r: number) => `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${(r * 0.55).toFixed(1)} ${r} 0 0 0 0 ${-r}z`;

/** El filtro que hace temblar el trazo. Cada capa lleva el suyo: los identificadores no se comparten entre SVG. */
function Ink({ id, scale = 5 }: { id: string; scale?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
}

/** El cielo: va detrás del mapa, que es transparente fuera del globo. */
export function ToonSky({ animated }: { animated: boolean }) {
  return (
    <svg aria-hidden="true" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" className="pointer-events-none fixed inset-0 h-full w-full">
      <defs>
        <linearGradient id="toon-space" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a0a22" />
          <stop offset="0.55" stopColor="#141338" />
          <stop offset="1" stopColor="#06231f" />
        </linearGradient>
        <filter id="toon-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
        <Ink id="toon-ink" />
        <clipPath id="toon-ringed">
          <circle r="62" />
        </clipPath>
        <clipPath id="toon-moon">
          <circle r="46" />
        </clipPath>
        <clipPath id="toon-green">
          <circle r="32" />
        </clipPath>
      </defs>
      <rect width="1600" height="900" fill="url(#toon-space)" />

      {/* bruma: verde alrededor del remolino y un par de nubes de color muy difuminadas */}
      <g filter="url(#toon-blur)">
        <ellipse cx="620" cy="760" rx="420" ry="260" fill="#39ff6a" opacity="0.3" />
        <path d="M-100 560C300 360 700 480 1000 280S1500 60 1750 120" fill="none" stroke="#c13bff" strokeWidth="150" opacity="0.2" />
        <ellipse cx="1380" cy="640" rx="340" ry="200" fill="#ff5f8f" opacity="0.14" />
        <ellipse cx="900" cy="60" rx="300" ry="110" fill="#3b7bff" opacity="0.22" />
      </g>

      {STARS.map((s, i) => (
        <circle key={i} cx={s.x.toFixed(0)} cy={s.y.toFixed(0)} r={s.r.toFixed(1)} fill={s.color} opacity={s.opacity.toFixed(2)} />
      ))}
      {SPARKS.map((s, i) => (
        <path key={i} d={SPARK} fill="#ffffff" transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) scale(${s.size.toFixed(1)})`}>
          {animated && <animate attributeName="opacity" values="1;0.2;1" dur="3.2s" begin={`${s.delay.toFixed(1)}s`} repeatCount="indefinite" />}
        </path>
      ))}

      {/* un sol amarillo con sus halos */}
      <g transform="translate(1515 850)">
        <circle r="122" fill="#ff9d2e" opacity="0.16">
          {animated && <animate attributeName="r" values="114;130;114" dur="5s" repeatCount="indefinite" />}
        </circle>
        <circle r="90" fill="#ffb347" opacity="0.3" />
        <g filter="url(#toon-ink)">
          <circle r="60" fill="#ffe36b" stroke={INK} strokeWidth="5" />
          <path d="M-30-22c12-14 34-18 50-6M-36 10c16 16 44 20 66 4" fill="none" stroke="#ffb347" strokeWidth="7" strokeLinecap="round" />
        </g>
      </g>

      {/* planeta con anillo */}
      <g transform="translate(655 118) rotate(-18) scale(0.8)" filter="url(#toon-ink)">
        <path d="M112 0A112 26 0 0 0-112 0" fill="none" stroke={INK} strokeWidth="18" />
        <path d="M112 0A112 26 0 0 0-112 0" fill="none" stroke="#ffd98a" strokeWidth="9" />
        <circle r="62" fill="#c86bd9" />
        <g clipPath="url(#toon-ringed)">
          <path d="M-70-30c30-14 60 10 90-4s40-8 60 2v22c-20-10-40-6-60 2s-60-10-90 4z" fill="#f29ad8" />
          <path d="M-70 14c30-12 60 12 90 0s40-8 60 2v24c-20-10-40-6-60 2s-60-12-90 0z" fill="#8d49c9" />
          <path d="M-70 46c30-10 70 10 140 0v30h-140z" fill="#6a34a8" />
          <path d={shadow(62)} fill={INK} opacity="0.25" transform="rotate(40)" />
        </g>
        <circle r="62" fill="none" stroke={INK} strokeWidth="6" />
        <path d="M-112 0A112 26 0 0 0 112 0" fill="none" stroke={INK} strokeWidth="18" />
        <path d="M-112 0A112 26 0 0 0 112 0" fill="none" stroke="#ffd98a" strokeWidth="9" />
      </g>

      {/* luna rojiza con cráteres */}
      <g transform="translate(1500 560)" stroke={INK} filter="url(#toon-ink)">
        <circle r="46" fill="#ff8a5c" stroke="none" />
        <g clipPath="url(#toon-moon)" stroke="none">
          <path d={shadow(46)} fill={INK} opacity="0.25" transform="rotate(20)" />
        </g>
        <circle cx="-14" cy="-12" r="11" fill="#d95f3d" strokeWidth="3.5" />
        <circle cx="12" cy="10" r="8" fill="#d95f3d" strokeWidth="3.5" />
        <circle cx="-8" cy="22" r="6" fill="#d95f3d" strokeWidth="3.5" />
        <circle cx="20" cy="-22" r="5" fill="#d95f3d" strokeWidth="3.5" />
        <circle r="46" fill="none" strokeWidth="6" />
      </g>

      {/* planeta verde con manchas */}
      <g transform="translate(548 440)" stroke={INK} filter="url(#toon-ink)">
        <circle r="32" fill="#9be86f" stroke="none" />
        <g clipPath="url(#toon-green)" stroke="none">
          <path d={shadow(32)} fill={INK} opacity="0.22" transform="rotate(30)" />
        </g>
        <path d="M-18-8c6-10 20-8 22 2s-12 12-22-2zM0 12c6-4 14-2 14 5s-12 7-14-5z" fill="#4fb53c" strokeWidth="3.5" />
        <circle r="32" fill="none" strokeWidth="6" />
      </g>

      {/* unas rocas sueltas */}
      <g fill="#6f7c8f" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" filter="url(#toon-ink)">
        <path d="M1418 398l14-10 16 6 4 14-12 10-18-4z" />
        <path d="M1466 368l10-6 10 6-2 12-12 4-8-8z" />
        <path d="M1456 428l8-4 8 4-2 9-9 2z" />
      </g>

      {/* remolino verde: gira despacio */}
      <g transform="translate(600 745)" filter="url(#toon-ink)">
        <g>
          {animated && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="11s" repeatCount="indefinite" />}
          <path d={blob(112, 7, 0.07, 0.4)} fill="#1c6b1a" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
          <path d={blob(92, 6, 0.08, 1.9)} fill="#2f9e2a" />
          <path d={blob(66, 5, 0.1, 3.1)} fill="#52c93a" />
          <path d={spiral(1.7, 96, 0)} fill="none" stroke="#8dff5a" strokeWidth="15" strokeLinecap="round" />
          <path d={spiral(1.7, 90, 2.1)} fill="none" stroke="#c9ff7a" strokeWidth="9" strokeLinecap="round" />
          <path d={spiral(1.7, 84, 4.2)} fill="none" stroke="#f1ffc4" strokeWidth="5" strokeLinecap="round" />
          <g fill="#f1ffc4">
            <ellipse cx="52" cy="-30" rx="9" ry="5" transform="rotate(-30 52 -30)" />
            <ellipse cx="-58" cy="18" rx="8" ry="4.500" transform="rotate(20 -58 18)" />
            <ellipse cx="14" cy="66" rx="7" ry="4" />
            <circle cx="-22" cy="-62" r="3.500" />
            <circle cx="78" cy="24" r="3" />
          </g>
          <circle r="13" fill="#f1ffc4" />
        </g>
      </g>
    </svg>
  );
}

/** La nave: un platillo hecho con piezas sueltas, que cruza la pantalla por delante del mapa cada cierto tiempo. */
export function ToonSaucer({ animated }: { animated: boolean }) {
  return (
    <svg aria-hidden="true" viewBox={VIEW} preserveAspectRatio="xMidYMid slice" className="pointer-events-none fixed inset-0 h-full w-full">
      <defs>
        <Ink id="toon-ink-ship" scale={3} />
      </defs>
      <g transform={animated ? undefined : 'translate(1180 300)'}>
        {/* Empieza y acaba fuera de la pantalla; al terminar se queda allí hasta la siguiente pasada. */}
        {animated && <animateMotion id="toon-fly" dur="14s" begin="0s; toon-fly.end+10s" fill="freeze" path="M-260 330C300 130 620 540 920 300S1500 150 1880 410" />}
        <g transform="scale(1.35)">
          <g>
            {animated && <animateTransform attributeName="transform" type="rotate" values="-6;6;-6" dur="3.6s" repeatCount="indefinite" />}

            {/* humo del tubo de escape */}
            <g fill="#d8dbe6" opacity="0.8">
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={-112 - i * 20} cy={10 - i * 5} r={5 + i * 2.5}>
                  {animated && <animate attributeName="opacity" values="0.9;0.15;0.9" dur="1.2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />}
                </circle>
              ))}
            </g>

            <g filter="url(#toon-ink-ship)" stroke={INK} strokeLinejoin="round" strokeLinecap="round">
              {/* tubo de escape y propulsor de abajo */}
              <path d="M-96 2l-14 4 2 8 16-2z" fill="#6b6f80" strokeWidth="3" />
              <ellipse cy="28" rx="40" ry="8" fill="#7df9ff" stroke="none" opacity="0.8">
                {animated && <animate attributeName="opacity" values="0.8;0.35;0.8" dur="0.5s" repeatCount="indefinite" />}
              </ellipse>
              <path d="M-80 6C-56 32 56 32 80 6z" fill="#4a4e63" strokeWidth="3.500" />

              {/* el disco: chapas, remaches y un parche */}
              <ellipse cy="2" rx="92" ry="21" fill="#8f96a8" strokeWidth="3.500" />
              <path d="M-88 8C-50 22 50 22 88 8" fill="none" stroke="#39c9c0" strokeWidth="5" />
              <path d="M-46-14l-8 30M-8-18l-2 38M34-16l6 32" fill="none" strokeWidth="2" opacity="0.6" />
              <path d="M44-9l24-4 5 13-25 5z" fill="#c2a878" strokeWidth="2.500" />
              <path d="M49-5l4 3M53-6l-3 5M61-8l4 3M65-9l-3 5" fill="none" strokeWidth="1.500" />
              {[-78, -62, -30, 8, 24, 80].map((x) => (
                <circle key={x} cx={x} cy={1 + (x * x) / 2400} r="1.600" fill={INK} stroke="none" />
              ))}

              {/* dos faros, cada uno de su padre y de su madre */}
              <path d="M70-4l12-16" fill="none" strokeWidth="3" />
              <path d="M96-30l40-14v30z" fill="#ffe36b" stroke="none" opacity="0.35" />
              <circle cx="86" cy="-24" r="8" fill="#ffe36b" strokeWidth="3" />
              <path d="M-66-4l-8-12" fill="none" strokeWidth="3" />
              <rect x="-84" y="-26" width="14" height="11" rx="2" fill="#ffd0a0" strokeWidth="3" />

              {/* los dos tripulantes: uno alto de tres ojos y uno pequeño de un ojo, al volante */}
              <path d="M-30-6c0-12 6-18 14-18s14 6 14 18z" fill="#ff9d4d" strokeWidth="2.500" />
              <path d="M-22-44l-4-9M-10-44l4-9" fill="none" strokeWidth="2.500" />
              <ellipse cx="-16" cy="-34" rx="12" ry="13" fill="#b9a7ff" strokeWidth="2.500" />
              <g fill="#ffffff" strokeWidth="1.500">
                <circle cx="-22" cy="-37" r="3.400" />
                <circle cx="-15" cy="-39" r="3.400" />
                <circle cx="-9" cy="-36" r="3.400" />
              </g>
              <g fill={INK} stroke="none">
                <circle cx="-21" cy="-37" r="1.400" />
                <circle cx="-14" cy="-39" r="1.400" />
                <circle cx="-8" cy="-36" r="1.400" />
              </g>
              <path d="M-21-27c3 2 7 2 10 0" fill="none" strokeWidth="2" />
              <ellipse cx="18" cy="-17" rx="12" ry="11" fill="#4fd6c0" strokeWidth="2.500" />
              <circle cx="18" cy="-20" r="5.500" fill="#ffffff" strokeWidth="1.500" />
              <circle cx="19.500" cy="-20" r="2.400" fill={INK} stroke="none" />
              <path d="M12-11c4 3 8 3 12 0" fill="none" strokeWidth="2" />
              <path d="M28-14l8-4M32-22a7 7 0 0 1 8 8" fill="none" strokeWidth="2.500" />

              {/* la cúpula, con su reflejo, y una antena torcida */}
              <path d="M-48-6C-48-66 48-66 48-6z" fill="#bff3ff" fillOpacity="0.4" strokeWidth="3.500" />
              <path d="M-34-16c2-22 16-34 32-37" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.7" />
              <path d="M6-51l6-14 10 2" fill="none" strokeWidth="2.500" />
              <circle cx="23" cy="-63" r="3.600" fill="#ff5f5f" strokeWidth="2">
                {animated && <animate attributeName="fill" values="#ff5f5f;#ffd0d0;#ff5f5f" dur="1.1s" repeatCount="indefinite" />}
              </circle>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
