import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { setEngine } from '../app/engineRef';
import { formatCoords } from '../app/format';
import { computeMapState } from '../app/mapState';
import { useApp, useProgress, useSettings, type MapLabel, type Tone } from '../app/store';
import { clockIn } from '../app/time';
import type { Atlas } from '../atlas/atlas';
import { buildMesh } from '../atlas/mesh';
import { MapEngine } from '../engine/MapEngine';
import { PALETTES } from '../engine/palette';
import { subsolarPoint } from '../engine/sun';
import { MASTERY_LABELS, mastery } from '../game/progress';
import { useNow, useReducedMotion, useTheme } from './hooks';
import { Icon } from './Icon';
import { Flag } from './primitives';
import { RealTimeMarkers } from './RealTime';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-ok text-white',
  help: 'bg-help text-white',
  bad: 'bg-bad text-white',
  info: 'bg-ink text-paper',
};

/** Rótulo clavado sobre un país: el motor lo mueve con el mapa. */
function Pin({ engine, atlas, label }: { engine: MapEngine; atlas: Atlas; label: MapLabel }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const [lon, lat] = atlas.countries[label.country].anchor;
    return engine.track(ref.current, lon, lat);
  }, [engine, atlas, label.country]);
  return (
    <div ref={ref} className="map-pin">
      <div>
        <div
          className={`stamp-in relative whitespace-nowrap rounded-lg px-2.5 py-1 text-sm font-bold shadow-[0_8px_18px_-8px_rgb(var(--shadow)/0.7)] ${TONE_CLASS[label.tone]}`}
          style={{ '--tilt': '0deg' } as CSSProperties}
        >
          {label.text}
          <span className={`absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 ${TONE_CLASS[label.tone]}`} />
        </div>
      </div>
    </div>
  );
}

/** Pantallas en las que pasar el cursor por un país dice cuál es. (Jugando sería hacer trampa.) */
const TOOLTIP_SCREENS = new Set(['home', 'explore', 'results', 'progress', 'lists']);

/**
 * Lienzo del mapa. Crea el motor, lo mantiene sincronizado con el estado de la aplicación (tema,
 * vista, estilo de cada país, márgenes) y dibuja lo que va pegado al mapa: rótulos y descripción
 * emergente.
 */
export default function MapCanvas() {
  const atlas = useApp((s) => s.atlas)!;
  const screen = useApp((s) => s.screen);
  const session = useApp((s) => s.session);
  const selected = useApp((s) => s.selected);
  const exploreScope = useApp((s) => s.exploreScope);
  const lists = useSettings((s) => s.lists);
  const progressMode = useApp((s) => s.progressMode);
  const draft = useApp((s) => s.draft);
  const labels = useApp((s) => s.labels);
  const pad = useApp((s) => s.pad);
  const progress = useProgress((s) => s.progress);
  const viewMode = useSettings((s) => s.viewMode);
  const realTime = useSettings((s) => s.realTime);
  // Marca el paso del tiempo: mueve el Sol y pone en hora el reloj de la descripción emergente.
  const now = useNow(20_000);
  const sun = useMemo(() => subsolarPoint(now), [now]);
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  // El motor vive en el estado: si se vuelve a crear, todas las sincronizaciones se repiten con el nuevo.
  const [engine, setLocalEngine] = useState<MapEngine | null>(null);
  const [failed, setFailed] = useState(false);
  const [hovered, setHovered] = useState(-1);

  // ── Crear el motor (una vez) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: MapEngine;
    try {
      const { viewMode: mode } = useSettings.getState();
      engine = new MapEngine(canvas, atlas, buildMesh(atlas), {
        palette: PALETTES[document.documentElement.dataset.theme === 'night' ? 'night' : 'paper'],
        mode,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      });
    } catch (error) {
      console.error(error);
      setFailed(true);
      return;
    }
    setEngine(engine);
    setLocalEngine(engine);

    const offs = [
      engine.on('click', (hit) => useApp.getState().mapClick(hit)),
      engine.on('pointer', (info) => {
        setHovered(info ? info.index : -1);
        const tip = tipRef.current;
        if (tip && info) tip.style.transform = `translate3d(${info.x + 16}px, ${info.y + 18}px, 0)`;
        if (coordsRef.current) coordsRef.current.textContent = info ? formatCoords(info.lon, info.lat) : '';
      }),
    ];
    return () => {
      offs.forEach((off) => off());
      setEngine(null);
      setLocalEngine(null);
      engine.dispose();
    };
  }, [atlas]);

  // ── Sincronizar el motor con el estado ──
  useEffect(() => engine?.setPalette(PALETTES[theme]), [engine, theme]);
  useEffect(() => engine?.setMode(viewMode), [engine, viewMode]);
  useEffect(() => engine?.setReducedMotion(reducedMotion), [engine, reducedMotion]);
  useEffect(() => engine?.setPadding(pad), [engine, pad]);
  useEffect(() => engine?.setAutoRotate(screen === 'home'), [engine, screen]);
  // Durante la partida la noche se atenúa: los colores de las respuestas tienen que seguir leyéndose.
  const playing = screen === 'play' || screen === 'results';
  useEffect(() => engine?.setDaylight(realTime ? (playing ? 0.5 : 1) : 0), [engine, realTime, playing]);
  useEffect(() => engine?.setSun(sun.lon, sun.lat), [engine, sun]);

  const mapState = useMemo(
    () => computeMapState({ atlas, screen, session, selected, exploreScope, lists, progressMode, draft, progress }),
    [atlas, screen, session, selected, exploreScope, lists, progressMode, draft, progress],
  );
  // La primera vez que un motor recibe los estilos se aplican de golpe, sin transición.
  const styled = useRef<MapEngine | null>(null);
  useEffect(() => {
    if (!engine) return;
    engine.setStyles(mapState.styles, mapState.active, { markers: mapState.markers, instant: styled.current !== engine });
    engine.setPulse(mapState.pulse);
    styled.current = engine;
  }, [engine, mapState]);

  const country = hovered >= 0 && TOOLTIP_SCREENS.has(screen) ? atlas.countries[hovered] : null;
  const showTip = !!country && (screen !== 'lists' || country.kind === 'country');
  const localTime = country?.tz ? clockIn(country.tz, now) : null;

  if (failed) {
    return (
      <div className="fixed inset-0 grid place-items-center p-8 text-center">
        <p className="max-w-sm text-ink-soft">
          Tu navegador no ha podido iniciar los gráficos 3D (WebGL). Prueba a actualizarlo o a abrir la página en otro
          navegador.
        </p>
      </div>
    );
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="map-canvas transition-opacity duration-700"
        style={{ opacity: engine ? 1 : 0 }}
        tabIndex={0}
        role="application"
        aria-roledescription="mapa"
        aria-label="Mapa del mundo interactivo. Flechas para moverlo, más y menos para acercar o alejar, Intro para elegir el país del centro."
      />
      {/* Punto de mira del teclado: marca qué país elige Intro. Solo se ve con el mapa enfocado. */}
      <div
        aria-hidden="true"
        className="map-reticle"
        style={{
          left: pad.left + (window.innerWidth - pad.left - pad.right) / 2,
          top: pad.top + (window.innerHeight - pad.top - pad.bottom) / 2,
        }}
      />

      {/* Durante la partida no se marca dónde está el jugador: sería una pista. */}
      {engine && realTime && <RealTimeMarkers engine={engine} sun={sun} showUser={!playing} />}
      {engine && labels.map((label) => <Pin key={label.key} engine={engine} atlas={atlas} label={label} />)}

      <div
        ref={tipRef}
        role="tooltip"
        className={`float pointer-events-none fixed left-0 top-0 z-40 flex items-center gap-2 px-2.5 py-1.5 text-sm font-semibold transition-opacity duration-150 ${showTip ? 'opacity-100' : 'opacity-0'}`}
      >
        {country && (
          <>
            <Flag a2={country.a2} height={15} />
            <span>{country.name}</span>
            {localTime && (
              <span className="tabular flex items-center gap-1 font-normal text-ink-soft" title="Hora local">
                <Icon name="clock" size={13} />
                {localTime}
                {country.tzMulti && country.capital && <> en {country.capital}</>}
              </span>
            )}
            {screen === 'progress' && country.kind === 'country' && (
              <span className="font-normal text-ink-soft">· {MASTERY_LABELS[mastery(progress[country.id]?.[progressMode])]}</span>
            )}
          </>
        )}
      </div>

      <span
        ref={coordsRef}
        aria-hidden="true"
        className="tabular pointer-events-none fixed bottom-3 left-1/2 z-10 hidden -translate-x-1/2 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-faint wide:block"
      />
    </>
  );
}
