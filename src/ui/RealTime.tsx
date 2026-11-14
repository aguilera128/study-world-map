import { motion } from 'motion/react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useApp, useSettings, type Layers } from '../app/store';
import type { MapEngine } from '../engine/MapEngine';
import { dayPhase, moonPhase, sublunarPoint, subsolarPoint, sunAltitude, type DayPhase, type MoonPhase, type SunPosition } from '../engine/sun';
import { useMedia, useNow, useWide } from './hooks';
import { Icon } from './Icon';
import { LOCALE, lang, t } from '../i18n';
import { tx } from '../i18n/tx';

/** Elemento que el motor mantiene centrado sobre un punto del mapa. */
export function Tracked({ engine, lon, lat, alt = 0, children }: { engine: MapEngine; lon: number; lat: number; alt?: number; children: ReactNode }) {
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

/**
 * Disco de la Luna con su fase real: la cara visible (mares y cráteres donde están de verdad, el
 * norte arriba) y la sombra hasta el terminador. La parte iluminada queda a la derecha si crece,
 * como se ve desde el hemisferio norte; la oscura se adivina, por la luz que refleja la Tierra.
 */
function MoonDisc({ phase, size = 22 }: { phase: MoonPhase; size?: number }) {
  const id = useId();
  const r = 9;
  // El terminador es media elipse: recta en los cuartos, y se abomba hacia un lado u otro.
  const rx = (r * Math.abs(1 - 2 * phase.lit)).toFixed(2);
  const dark = `M0 ${-r}A${r} ${r} 0 0 0 0 ${r}A${rx} ${r} 0 0 ${phase.lit > 0.5 ? 1 : 0} 0 ${-r}z`;
  return (
    <svg className="moon-marker" data-sky width={size} height={size} viewBox="-10 -10 20 20" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}s`} cx="42%" cy="38%" r="68%">
          <stop offset="0" stopColor="#fbf9f0" />
          <stop offset="0.7" stopColor="#dedbcf" />
          <stop offset="1" stopColor="#b9b6ab" />
        </radialGradient>
        <clipPath id={`${id}c`}>
          <circle r={r} />
        </clipPath>
        <filter id={`${id}b`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.45" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <circle r={r} fill={`url(#${id}s)`} />
        {/* los mares: Procellarum, Imbrium, Serenitatis, Tranquillitatis, Crisium, Fecunditatis, Nectaris, Nubium y Humorum */}
        <g fill="#7f838a" opacity="0.62" filter={`url(#${id}b)`}>
          <ellipse cx="-4.7" cy="-0.4" rx="2.5" ry="4.5" />
          <circle cx="-2.2" cy="-4" r="2.7" />
          <circle cx="2.2" cy="-3.4" r="1.9" />
          <ellipse cx="3.6" cy="-0.6" rx="2.3" ry="1.8" />
          <ellipse cx="6.3" cy="-2" rx="1" ry="1.4" />
          <ellipse cx="5.3" cy="1.7" rx="1.2" ry="1.8" />
          <circle cx="3.4" cy="2.8" r="1" />
          <ellipse cx="-1.6" cy="3.6" rx="2.2" ry="1.6" />
          <circle cx="-4.4" cy="4" r="1.1" />
        </g>
        {/* cráteres jóvenes y brillantes: Tycho con sus rayos, Copérnico y Kepler */}
        <g stroke="#fffdf4" strokeWidth="0.25" opacity="0.5" strokeLinecap="round">
          <path d="M-1 6.6 L-3.6 2.2M-1 6.6 L1.8 2M-1 6.6 L-5.4 6M-1 6.6 L3.4 7.2M-1 6.6 L-0.6 1.4" />
        </g>
        <g fill="#fffdf4">
          <circle cx="-1" cy="6.6" r="0.6" />
          <circle cx="-2.7" cy="-0.9" r="0.5" opacity="0.9" />
          <circle cx="-5.2" cy="-1.3" r="0.35" opacity="0.8" />
        </g>
        <path d={dark} fill="#070d18" opacity="0.88" filter={`url(#${id}b)`} transform={phase.waxing ? undefined : 'scale(-1 1)'} />
      </g>
      <circle r={r} className="moon-edge" />
    </svg>
  );
}

// En el globo el Sol y la Luna van a su distancia real, en radios terrestres sobre la superficie
// (la Luna a unos 60 del centro y el Sol a unos 23 500): casi siempre quedan fuera de la pantalla
// o detrás de la Tierra. Su tamaño en pantalla no es a escala (medirían unos pocos píxeles).
const SUN_ALT = 149_600_000 / 6371 - 1;
const MOON_ALT = 384_400 / 6371 - 1;

const percent = (lit: number) => `${Math.round(lit * 100)} %`;
const num = (value: number) => value.toLocaleString(LOCALE);
// En chino las distancias van en «千米» como en el resto de los textos, y a partir de diez mil se cuentan en 万.
const km = (value: number) => (lang === 'zh' && value >= 10_000 ? `${num(value / 10_000)} 万千米` : t('{n} km', { n: num(value) }));
// En chino no se cuenta en millones sino en 万 (diez mil) y 亿 (cien millones): el número lleva la unidad.
const millions = (value: number) => (lang !== 'zh' ? num(value) : value >= 100 ? `${num(value / 100)} 亿` : `${num(Math.round(value * 100))} 万`);
const millionsKm = (value: number) => t('{n} millones de km', { n: millions(value) });
const days = (value: number) => t('{n} días', { n: num(value) });

/**
 * Ficha de un astro, al pasar el cursor por él. Cifras de las hojas de datos de la NASA (Sun y Moon
 * Fact Sheet, science.nasa.gov): valores medios y redondeados.
 */
export function SkyCard({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <span className="sky-tip sky-card">
      <strong className="block">{title}</strong>
      {rows.map(([label, value]) => (
        <span key={label} className="sky-row">
          <span>{label}</span>
          <span className="tabular">{value}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Un astro sobre el mapa, con su ficha al pasar el cursor. La ficha sale debajo y centrada; si el
 * astro está junto a un borde de la pantalla, se pone encima o se corre a un lado para verse entera.
 */
function SkyMarker({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const place = () => {
    const marker = ref.current;
    const card = marker?.querySelector<HTMLElement>('.sky-tip');
    if (!marker || !card) return;
    const box = marker.getBoundingClientRect();
    const [width, height, margin] = [card.offsetWidth, card.offsetHeight, 8];
    const center = box.left + box.width / 2;
    const up = box.bottom + 6 + height + margin > window.innerHeight && box.top - 6 - height > margin;
    const shift = Math.max(margin + width / 2 - center, Math.min(0, window.innerWidth - margin - width / 2 - center));
    marker.toggleAttribute('data-up', up);
    marker.style.setProperty('--shift', `${Math.round(shift)}px`);
  };
  return (
    <div ref={ref} className="sky-marker" role="img" aria-label={label} onPointerEnter={place}>
      {children}
    </div>
  );
}

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
  // Con el huevo de pascua, el Sol es el de dibujos: el mismo sitio, otro aspecto. Lleva alto y ancho
  // fijos: el mapa lo mide para recortarlo con el borde de la Tierra, y no puede esperar a que cargue.
  const toon = useApp((s) => s.toon);
  const phase = moonPhase(sun, moon);
  return (
    <>
      {layers.moon && (
        <Tracked engine={engine} lon={moon.lon} lat={moon.lat} alt={MOON_ALT}>
          <SkyMarker label={t('Aquí la Luna está en lo más alto. {phase}, {lit} iluminada', { phase: t(phase.name), lit: percent(phase.lit) })}>
            <MoonDisc phase={phase} size={28} />
            <SkyCard
              title={`${t(phase.name)} · ${percent(phase.lit)}`}
              rows={[
                [t('Distancia media'), km(384_400)],
                [t('Diámetro'), `${km(3474)} · ${t('un cuarto del de la Tierra')}`],
                [t('Vuelta a la Tierra'), days(27.3)],
                [t('Ciclo de fases'), days(29.5)],
                [t('Temperatura'), `−173 … 127 °C`],
                [t('Gravedad'), t('un sexto de la terrestre')],
              ]}
            />
          </SkyMarker>
        </Tracked>
      )}
      {layers.sun && (
        <Tracked engine={engine} lon={sun.lon} lat={sun.lat} alt={SUN_ALT}>
          <SkyMarker label={t('Aquí es mediodía: el Sol está en lo más alto')}>
            {toon ? <img src="/toon/sol.webp" alt="" data-sky draggable={false} className="block h-[11vmin] w-[11vmin] max-w-none select-none object-contain" /> : <span className="sun-marker" data-sky />}
            <SkyCard
              title={t('Sol · debajo de él es mediodía')}
              rows={[
                [t('Qué es'), t('una estrella')],
                [t('Distancia media'), millionsKm(149.6)],
                [t('Su luz tarda'), t('unos 8 minutos')],
                [t('Diámetro'), `${millionsKm(1.39)} · ${t('109 veces el de la Tierra')}`],
                [t('En la superficie'), `≈ ${num(5500)} °C`],
                [t('En el núcleo'), t('unos {n} millones de °C', { n: millions(15) })],
                [t('Edad'), t('unos {n} millones de años', { n: millions(4600) })],
              ]}
            />
          </SkyMarker>
        </Tracked>
      )}
      {location && showUser && layers.you && (
        <Tracked engine={engine} lon={location.lon} lat={location.lat}>
          <div className="you-marker">
            <span className="you-dot" />
            <span className="you-label">{t('Tú')}</span>
          </div>
        </Tracked>
      )}
    </>
  );
}

const PHASE_TEXT: Record<DayPhase, string> = {
  day: t('es de día'),
  twilight: t('está entre dos luces'),
  night: t('es de noche'),
};

const clock = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const day = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });

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
  const wide = useWide();
  const showMoon = useSettings((s) => s.layers.moon);
  // La tarjeta se pliega al tocar la hora y se queda solo con ella. En el móvil, donde tapa el
  // mapa, empieza plegada; en pantalla ancha, desplegada (null = como venga de serie).
  const [choice, setOpen] = useState<boolean | null>(null);
  const open = choice ?? wide;
  const full = open;
  // (Los hooks, siempre antes de este return: si no, React falla al empezar una partida.)
  if (screen === 'play' && !roomy) return null;

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
      className={`float fixed right-3 top-[4.25rem] z-30 px-3 py-2 text-sm wide:right-8 wide:top-[5.25rem] wide:px-3.5 wide:py-2.5 ${open ? 'w-[13rem] wide:w-[15.5rem]' : ''}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={full}
        title={t(open ? 'Ocultar detalles' : 'Ver detalles')}
        className="flex w-full items-baseline gap-2 text-left"
      >
        <Icon name={phase === 'night' ? 'moon' : 'sun'} size={16} className="translate-y-0.5 self-start text-accent" />
        <span className="tabular display text-lg leading-none wide:text-xl">{clock.format(now)}</span>
        {full && <span className="text-xs text-ink-soft">{day.format(now)}</span>}
        <Icon name="arrow" size={14} className={`ml-auto self-center text-ink-faint transition-transform ${open ? '-rotate-90' : 'rotate-90'}`} />
      </button>
      {full && (
        <>
      <p className="mt-1 text-[0.8125rem] leading-snug text-ink-soft wide:mt-1.5">
        {phase ? (
          <>
            {tx('Donde estás {phase}', { phase: <strong className="text-ink">{PHASE_TEXT[phase]}</strong> })}
            {country && <span className="hidden wide:inline"> · {country}</span>}
            {location && !location.exact && <span className="hidden text-ink-faint wide:inline"> {t('(según tu zona horaria)')}</span>}
          </>
        ) : (
          t('No sabemos en qué parte del mapa estás.')
        )}
      </p>
      {showMoon && (
        <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-soft">
          <MoonDisc phase={moon} size={20} />
          {t(moon.name)} · {percent(moon.lit)}
        </p>
      )}
      {!location?.exact && (
        <button
          type="button"
          onClick={locateExact}
          disabled={locating === 'asking'}
          title={t('Tu ubicación solo se usa aquí, en tu navegador: no se envía ni se guarda.')}
          className="mt-1.5 flex items-center gap-1.5 text-[0.8125rem] font-bold underline decoration-rule-strong underline-offset-4 hover:text-accent"
        >
          <Icon name="target" size={14} />
          {locating === 'asking' ? t('Buscándote…') : t('Usar mi ubicación exacta')}
        </button>
      )}
      {/* Solo se anuncia el resultado de pedir la ubicación (no la tarjeta, que lleva el reloj).
          La región está siempre puesta para que el lector de pantalla note el cambio. */}
      <p role="status" className={locating === 'denied' || locating === 'unavailable' ? 'mt-1 text-xs text-ink-faint' : undefined}>
        {locating === 'denied' && t('Sin permiso de ubicación: se usa la zona horaria.')}
        {locating === 'unavailable' && t('Este dispositivo no ha podido dar su ubicación.')}
      </p>
        </>
      )}
    </motion.div>
  );
}
