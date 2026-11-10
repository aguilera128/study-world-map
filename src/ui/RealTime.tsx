import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useApp, useSettings, type Layers } from '../app/store';
import type { MapEngine } from '../engine/MapEngine';
import { dayPhase, moonPhase, sublunarPoint, subsolarPoint, sunAltitude, type DayPhase, type MoonPhase, type SunPosition } from '../engine/sun';
import { useMedia, useNow } from './hooks';
import { Icon } from './Icon';

/** Elemento que el motor mantiene centrado sobre un punto del mapa. */
function Tracked({ engine, lon, lat, alt = 0, children }: { engine: MapEngine; lon: number; lat: number; alt?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) return engine.track(ref.current, lon, lat, alt);
  }, [engine, lon, lat, alt]);
  return (
    <div ref={ref} className="map-pin centered">
      {children}
    </div>
  );
}

/** Disco de la Luna con su fase: la parte iluminada a la derecha si crece (como se ve desde el hemisferio norte). */
function MoonDisc({ phase, size = 22 }: { phase: MoonPhase; size?: number }) {
  const r = 9;
  // El borde de la sombra es media elipse: plana en los cuartos, y se abomba hacia un lado u otro.
  const rx = (r * Math.abs(1 - 2 * phase.lit)).toFixed(2);
  const lit = `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${rx} ${r} 0 0 ${phase.lit > 0.5 ? 1 : 0} 0 ${-r}z`;
  return (
    <svg className="moon-marker" width={size} height={size} viewBox="-11 -11 22 22" aria-hidden="true">
      <circle r={r} className="moon-dark" />
      <path d={lit} className="moon-lit" transform={phase.waxing ? undefined : 'scale(-1 1)'} />
      <circle r={r} className="moon-edge" />
    </svg>
  );
}

// En el globo el Sol y la Luna flotan separados de la Tierra, la Luna más cerca. No es a escala
// (la Luna está a 60 radios y el Sol a 23 500): solo indica desde qué lado alumbra cada uno.
const SUN_ALT = 0.55;
const MOON_ALT = 0.24;

const percent = (lit: number) => `${Math.round(lit * 100)} %`;

/** Lo que el modo de tiempo real pinta sobre el mapa: el Sol y la Luna en su cénit y dónde está el usuario. */
export function RealTimeMarkers({
  engine,
  sun,
  moon,
  layers,
  showUser,
}: {
  engine: MapEngine;
  sun: SunPosition;
  moon: SunPosition;
  layers: Layers;
  showUser: boolean;
}) {
  const location = useApp((s) => s.location);
  const phase = moonPhase(sun, moon);
  return (
    <>
      {layers.moon && (
        <Tracked engine={engine} lon={moon.lon} lat={moon.lat} alt={MOON_ALT}>
          <div className="sky-marker" role="img" aria-label={`Aquí la Luna está en lo más alto. ${phase.name}, ${percent(phase.lit)} iluminada`}>
            <MoonDisc phase={phase} size={18} />
            <span className="sky-tip">
              Luna · {phase.name.toLowerCase().replace('luna ', '')} ({percent(phase.lit)})
            </span>
          </div>
        </Tracked>
      )}
      {layers.sun && (
        <Tracked engine={engine} lon={sun.lon} lat={sun.lat} alt={SUN_ALT}>
          <div className="sky-marker" role="img" aria-label="Aquí es mediodía: el Sol está en lo más alto">
            <span className="sun-marker" />
            <span className="sky-tip">Sol · debajo de él es mediodía</span>
          </div>
        </Tracked>
      )}
      {location && showUser && layers.you && (
        <Tracked engine={engine} lon={location.lon} lat={location.lat}>
          <div className="you-marker">
            <span className="you-dot" />
            <span className="you-label">Tú</span>
          </div>
        </Tracked>
      )}
    </>
  );
}

const PHASE_TEXT: Record<DayPhase, string> = {
  day: 'es de día',
  twilight: 'está entre dos luces',
  night: 'es de noche',
};

const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
const day = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

/** Tarjeta del modo de tiempo real: la hora del usuario, si donde está es de día y su ubicación. */
export function RealTimeStatus() {
  const atlas = useApp((s) => s.atlas)!;
  const screen = useApp((s) => s.screen);
  const location = useApp((s) => s.location);
  const locating = useApp((s) => s.locating);
  const locateExact = useApp((s) => s.locateExact);
  const now = useNow(15_000);
  // Durante la partida solo se muestra si cabe al lado del marcador.
  const roomy = useMedia('(min-width: 80rem)');
  if (screen === 'play' && !roomy) return null;

  const showMoon = useSettings((s) => s.layers.moon);
  const sun = subsolarPoint(now);
  const phase = location ? dayPhase(sunAltitude(sun, location.lon, location.lat)) : null;
  const moon = moonPhase(sun, sublunarPoint(now));
  const country = location && location.country >= 0 ? atlas.countries[location.country].name : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="float fixed right-3 top-[4.25rem] z-30 w-[13rem] px-3 py-2 text-sm wide:right-8 wide:top-[5.25rem] wide:w-[15.5rem] wide:px-3.5 wide:py-2.5"
      role="status"
    >
      <p className="flex items-baseline gap-2">
        <Icon name={phase === 'night' ? 'moon' : 'sun'} size={16} className="translate-y-0.5 self-start text-accent" />
        <span className="tabular display text-lg leading-none wide:text-xl">{clock.format(now)}</span>
        <span className="text-xs text-ink-soft">{day.format(now)}</span>
      </p>
      {/* En el móvil la tarjeta tapa parte del mapa: se queda con lo imprescindible. */}
      <p className="mt-1 text-[0.8125rem] leading-snug text-ink-soft wide:mt-1.5">
        {phase ? (
          <>
            Donde estás <strong className="text-ink">{PHASE_TEXT[phase]}</strong>
            {country && <span className="hidden wide:inline"> · {country}</span>}
            {location && !location.exact && <span className="hidden text-ink-faint wide:inline"> (según tu zona horaria)</span>}
          </>
        ) : (
          'No sabemos en qué parte del mapa estás.'
        )}
      </p>
      {showMoon && (
        <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-soft">
          <MoonDisc phase={moon} size={15} />
          {moon.name} · {percent(moon.lit)}
        </p>
      )}
      {!location?.exact && (
        <button
          type="button"
          onClick={locateExact}
          disabled={locating === 'asking'}
          title="Tu ubicación solo se usa aquí, en tu navegador: no se envía ni se guarda."
          className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-bold underline decoration-rule-strong underline-offset-4 hover:text-accent"
        >
          <Icon name="target" size={14} />
          {locating === 'asking' ? 'Buscándote…' : 'Usar mi ubicación exacta'}
        </button>
      )}
      {locating === 'denied' && <p className="mt-1 text-xs text-ink-faint">Sin permiso de ubicación: se usa la zona horaria.</p>}
      {locating === 'unavailable' && <p className="mt-1 text-xs text-ink-faint">Este dispositivo no ha podido dar su ubicación.</p>}
    </motion.div>
  );
}
