import { useEffect, useState } from 'react';
import { formatCoords } from '../app/format';
import { useSatCatalog, useStations, type SatCard, type StationId } from '../app/satellites';
import type { MapEngine } from '../engine/MapEngine';
import { SAT_COLORS, type SatGroup } from '../satellites/format';
import { iconSvg } from '../satellites/icons';
import { LOCALE, t } from '../i18n';
import { SkyCard, Tracked } from './RealTime';

const NAMES: Record<StationId, string> = {
  iss: t('Estación Espacial Internacional'),
  tiangong: t('Estación espacial Tiangong'),
};

/** Rótulos de las estaciones espaciales, sobre su punto: el motor los mueve con el mapa y ellos siguen a la estación. */
export function SatelliteLabels({ engine }: { engine: MapEngine }) {
  const stations = useStations();
  return (
    <>
      {(Object.keys(NAMES) as StationId[]).map((id) => {
        const at = stations[id];
        return (
          at && (
            <Tracked key={id} engine={engine} lon={at.lon} lat={at.lat} alt={at.alt}>
              <span
                className="block -translate-y-3.5 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold text-ink shadow-[0_4px_10px_-6px_rgb(var(--shadow)/0.7)]"
                style={{ background: 'color-mix(in srgb, var(--surface) 88%, transparent)', borderLeft: `3px solid ${SAT_COLORS.estaciones}` }}
              >
                {NAMES[id]}
              </span>
            </Tracked>
          )
        );
      })}
    </>
  );
}

/** La silueta de un grupo, la misma que en el mapa (src/satellites/icons.ts), con su color. */
export function SatIcon({ group, size = 22, className }: { group: SatGroup; size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" className={className} fill={SAT_COLORS[group]}>
      {iconSvg(group).map(({ tag: Tag, attrs }, i) => (
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}

const SAT_GROUP_NAMES: Record<SatGroup, string> = {
  estaciones: t('Estación espacial'),
  navegacion: t('Navegación'),
  meteorologicos: t('Meteorológico'),
  starlink: t('Starlink'),
};
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

/**
 * La ficha del satélite que hay bajo el cursor (o el que se toca, en pantalla táctil; otro toque
 * fuera la cierra). Escucha el lienzo sin capturar nada: el mapa se sigue arrastrando y pulsando igual.
 */
export function SatelliteCard({ engine, canvas }: { engine: MapEngine; canvas: HTMLCanvasElement | null }) {
  const catalog = useSatCatalog((s) => s.catalog);
  const [focus, setFocus] = useState(-1);
  const [, tick] = useState(0);

  // Con otros satélites (otros grupos, datos nuevos) los índices cambian: se cierra la ficha.
  useEffect(() => setFocus(-1), [catalog]);

  useEffect(() => {
    if (!canvas) return;
    const at = (e: PointerEvent, radius: number) => {
      const box = canvas.getBoundingClientRect();
      return engine.satelliteAt(e.clientX - box.left, e.clientY - box.top, radius);
    };
    let down: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => e.pointerType === 'mouse' && e.buttons === 0 && setFocus(at(e, 12));
    const onLeave = (e: PointerEvent) => e.pointerType === 'mouse' && setFocus(-1);
    const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY });
    // Un toque (sin arrastrar) elige el satélite que haya debajo, o cierra la ficha si no hay ninguno.
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 8) setFocus(at(e, 18));
      down = null;
    };
    const signal = new AbortController();
    const opts = { passive: true, signal: signal.signal };
    canvas.addEventListener('pointermove', onMove, opts);
    canvas.addEventListener('pointerleave', onLeave, opts);
    canvas.addEventListener('pointerdown', onDown, opts);
    canvas.addEventListener('pointerup', onUp, opts);
    return () => signal.abort();
  }, [engine, canvas]);

  // El satélite señalado, resaltado y con su órbita; sus datos de ahora, al día cada segundo.
  useEffect(() => {
    engine.setSatelliteFocus(focus, focus >= 0 ? (catalog?.orbit(focus, new Date()) ?? null) : null);
    if (focus < 0) return;
    const timer = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => {
      window.clearInterval(timer);
      engine.setSatelliteFocus(-1, null);
    };
  }, [engine, catalog, focus]);

  // Para los lectores de pantalla, una sola vez al abrirla: la ficha cambia cada segundo y no se lee en bucle.
  const [spoken, setSpoken] = useState('');
  useEffect(() => {
    const first = focus >= 0 ? catalog?.card(focus, new Date()) : null;
    setSpoken(first ? `${first.name}. ${rowsOf(first).map(([label, value]) => `${label}: ${value}`).join('. ')}` : '');
  }, [catalog, focus]);

  const card = focus >= 0 ? catalog?.card(focus, new Date()) : null;
  return (
    <>
      <span role="status" className="sr-only">
        {spoken}
      </span>
      {card && (
        <Tracked engine={engine} lon={card.now.lon} lat={card.now.lat} alt={card.now.altitudeKm / 6371}>
          <div className="sat-card relative h-5 w-5" aria-hidden="true">
            <SkyCard title={card.name} rows={rowsOf(card)} />
          </div>
        </Tracked>
      )}
    </>
  );
}

/** Las filas de la ficha: lo que trae CelesTrak (número, año del designador) y lo calculado para ahora. */
function rowsOf(card: SatCard): [string, string][] {
  const { now } = card;
  return [
    [t('Tipo'), SAT_GROUP_NAMES[card.group]],
    [t('Número NORAD'), String(card.norad)],
    ...(card.launchYear !== null ? [[t('Lanzamiento'), String(card.launchYear)] as [string, string]] : []),
    [t('Altura'), `${integer.format(now.altitudeKm)} km`],
    [t('Velocidad'), `${integer.format(now.speedKmh)} km/h`],
    [t('Una vuelta'), `${decimal.format(now.periodMin)} min`],
    [t('Inclinación'), `${decimal.format(now.inclinationDeg)}°`],
    [t('Debajo'), formatCoords(now.lon, now.lat)],
  ];
}
