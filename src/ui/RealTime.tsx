import { motion } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useApp } from '../app/store';
import type { MapEngine } from '../engine/MapEngine';
import { dayPhase, subsolarPoint, sunAltitude, type DayPhase, type SunPosition } from '../engine/sun';
import { useMedia, useNow } from './hooks';
import { Icon } from './Icon';

/** Elemento que el motor mantiene centrado sobre un punto del mapa. */
function Tracked({ engine, lon, lat, children }: { engine: MapEngine; lon: number; lat: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) return engine.track(ref.current, lon, lat);
  }, [engine, lon, lat]);
  return (
    <div ref={ref} className="map-pin centered">
      {children}
    </div>
  );
}

/** Lo que el modo de tiempo real pinta sobre el mapa: el Sol en su cénit y dónde está el usuario. */
export function RealTimeMarkers({ engine, sun, showUser }: { engine: MapEngine; sun: SunPosition; showUser: boolean }) {
  const location = useApp((s) => s.location);
  return (
    <>
      <Tracked engine={engine} lon={sun.lon} lat={sun.lat}>
        <svg className="sun-marker" width="30" height="30" viewBox="0 0 30 30" role="img" aria-label="Aquí el Sol está en lo más alto">
          <circle cx="15" cy="15" r="6" fill="currentColor" />
          <path
            d="M15 2.500v4M15 23.500v4M2.500 15h4M23.500 15h4M6.200 6.200 9 9M21 21l2.800 2.800M6.200 23.800 9 21M21 9l2.800-2.800"
            stroke="currentColor"
            strokeWidth="2.200"
            strokeLinecap="round"
          />
        </svg>
      </Tracked>
      {location && showUser && (
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

  const phase = location ? dayPhase(sunAltitude(subsolarPoint(now), location.lon, location.lat)) : null;
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
