import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { setEngine } from '../app/engineRef';
import { formatCompact, formatCoords } from '../app/format';
import { climateText } from '../game/climate';
import { computeMapState } from '../app/mapState';
import { gameLayers, useApp, useProgress, useSettings, type MapLabel, type Tone } from '../app/store';
import { clockIn } from '../app/time';
import type { Atlas } from '../atlas/atlas';
import { takeMesh } from '../atlas/meshAsync';
import { MapEngine, type PlanetLayer } from '../engine/MapEngine';
import { PALETTES, TOON } from '../engine/palette';
import { siderealAngle, sublunarPoint, subsolarPoint } from '../engine/sun';
import { MASTERY_LABELS, mastery } from '../game/progress';
import { score } from '../game/session';
import { Celebration } from './Celebration';

// El huevo de pascua solo se descarga si alguien lo encuentra.
const ToonSky = lazy(() => import('./ToonSky').then((m) => ({ default: m.ToonSky })));
const ToonSaucer = lazy(() => import('./ToonSky').then((m) => ({ default: m.ToonSaucer })));
import { useNow, useReducedMotion, useTheme, useWide } from './hooks';
import { Icon } from './Icon';
import { DISCONTINUITIES, INTERIOR } from './planetLayers';
import { Flag } from './primitives';
import { RealTimeMarkers } from './RealTime';
import { ScaleRuler } from './ScaleRuler';
import { lang, LOCALE, t } from '../i18n';
import { density } from '../game/population';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'bg-ok text-white',
  help: 'bg-help text-white',
  bad: 'bg-bad text-white',
  info: 'bg-ink text-paper',
};

/** Trazado de un río tal como viene en fisico.json (milésimas de grado, en diferencias) → grados. */
function decodeLine(deltas: number[]): number[] {
  const out = new Array<number>(deltas.length);
  let x = 0;
  let y = 0;
  for (let i = 0; i < deltas.length; i += 2) {
    x += deltas[i];
    y += deltas[i + 1];
    out[i] = x / 1000;
    out[i + 1] = y / 1000;
  }
  return out;
}

interface RawFeature {
  id?: string;
  kind: string;
  rank: number;
  at: [number, number];
  elev?: number;
  names: Record<string, string>;
  lines?: number[][];
  /** Solo las corrientes: velocidad media (m/s) y rumbo en octavos de vuelta desde el norte. */
  speed?: number;
  dir?: number;
}

/** Rumbos de la ficha de una corriente, en octavos de vuelta desde el norte y en el sentido del reloj. */
const COMPASS = [
  t('hacia el norte'),
  t('hacia el noreste'),
  t('hacia el este'),
  t('hacia el sureste'),
  t('hacia el sur'),
  t('hacia el suroeste'),
  t('hacia el oeste'),
  t('hacia el noroeste'),
];
/** Centro de una tarjeta de 16 rem que no se salga de la pantalla por los lados. */
const clampX = (x: number) => Math.min(Math.max(x, 140), window.innerWidth - 140);

/** Las corrientes cargadas, por identificador: de aquí sale la ficha al señalar su rótulo. */
const CURRENTS = new Map<string, RawFeature & { name: string }>();

/** Idiomas que, si falta un nombre, prefieren el español al inglés. */
const SPANISH_FIRST = new Set(['es', 'ca', 'gl', 'eu']);

/** Carga una capa de datos (formato de fisico.json) y se la pasa al motor; la quita al apagarla. */
function useOverlay(engine: MapEngine | null, key: string, url: string, on: boolean, labels: boolean, line: 'river' | 'plate') {
  useEffect(() => {
    if (!engine || !on) return;
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((data: { features: RawFeature[] }) => {
        if (cancelled) return;
          engine.setOverlay(
            key,
            data.features.map((f) => {
              const name = f.names[lang] ?? (SPANISH_FIRST.has(lang) ? (f.names.es ?? f.names.en) : (f.names.en ?? f.names.es)) ?? '';
              const text = !labels || !name ? '' : f.elev ? `▲ ${name} · ${f.elev.toLocaleString(LOCALE)} m` : name;
              // Las corrientes llevan ficha: su rótulo se puede señalar.
              const id = f.speed !== undefined && f.id ? f.id : undefined;
              if (id) CURRENTS.set(id, { ...f, name });
              return { kind: f.kind, rank: f.rank, lon: f.at[0], lat: f.at[1], lines: f.lines?.map(decodeLine), text, id };
            }),
            line,
          );
        })
        .catch(() => {});
      return () => {
        cancelled = true;
        engine.setOverlay(key, []);
      };
    }, [engine, key, url, on, labels, line]);
  }

  /** ¿El navegador dibuja WebGL por software (sin tarjeta gráfica)? Se mira en un lienzo de usar y tirar. */
  function softwareRendering(): boolean {
    try {
      const gl = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl');
      if (!gl) return false; // sin WebGL ya hay su propio aviso
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    } catch {
      return false;
    }
  }

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
    const moon = useMemo(() => sublunarPoint(now), [now]);
    const chosenLayers = useSettings((s) => s.layers);
    // Jugando, el mapa lleva las capas del juego y no las que hubiera puestas: ver «gameLayers».
    const inGame = screen === 'play' || screen === 'results';
    // Huevo de pascua (cinco clics en «Globo 3D»): planeta y espacio de dibujos, sin foto ni relieve.
    const toon = useApp((s) => s.toon);
    const layers = useMemo(() => {
      const base = inGame ? gameLayers(chosenLayers, atlas.map) : chosenLayers;
      return toon ? { ...base, satellite: false, relief: false, depth: false } : base;
    }, [chosenLayers, inGame, atlas.map, toon]);
    const theme = useTheme();
    const reducedMotion = useReducedMotion();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const coordsRef = useRef<HTMLSpanElement>(null);
    // El motor vive en el estado: si se vuelve a crear, todas las sincronizaciones se repiten con el nuevo.
    const [engine, setLocalEngine] = useState<MapEngine | null>(null);
    const [failed, setFailed] = useState(false);
    const [hovered, setHovered] = useState(-1);
    // Con el interior del planeta a la vista, la capa bajo el cursor en vez de un país.
    const [layerId, setLayerId] = useState<PlanetLayer | null>(null);

    // El aviso va a la derecha del cursor; si no cabe en la pantalla, a su izquierda. Se recoloca
    // también cuando cambia su texto, porque cambia su ancho.
    const pointerAt = useRef<{ x: number; y: number } | null>(null);
    const placeTip = () => {
      const [tip, at] = [tipRef.current, pointerAt.current];
      if (!tip || !at) return;
      const width = tip.offsetWidth;
      const x = at.x + 16 + width > window.innerWidth - 8 ? Math.max(8, at.x - 16 - width) : at.x + 16;
      tip.style.transform = `translate3d(${x}px, ${at.y + 18}px, 0)`;
    };
    useLayoutEffect(placeTip, [hovered, layerId]);

    // Sin tarjeta gráfica (dibujo por software) compilar los sombreadores deja la página sin
    // responder varios segundos, o muchos más en máquinas lentas y en navegadores automáticos como el
    // de PageSpeed. Ahí el mapa no se arranca solo: espera al primer toque o tecla.
    const [waiting, setWaiting] = useState(softwareRendering);
    useEffect(() => {
      if (!waiting) return;
      const start = () => setWaiting(false);
      window.addEventListener('pointerdown', start, { once: true });
      window.addEventListener('keydown', start, { once: true });
      return () => {
        window.removeEventListener('pointerdown', start);
        window.removeEventListener('keydown', start);
      };
    }, [waiting]);

    // ── Crear el motor (una vez) ──
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || waiting) return;
      let engine: MapEngine | undefined;
      let cancelled = false;
      let offs: (() => void)[] = [];
      // La malla se construye en un hilo aparte (y suele estar ya hecha: se pide al llegar el atlas).
      void takeMesh(atlas).then((mesh) => {
        if (cancelled) return;
      try {
        const { viewMode: mode } = useSettings.getState();
        engine = new MapEngine(canvas, atlas, mesh, {
          palette: PALETTES[document.documentElement.dataset.theme === 'night' ? 'night' : 'paper'],
          mode,
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        });
      } catch (error) {
        console.error(error);
        setFailed(true);
        return;
      }
      // El mapa de un país arranca encuadrado en él, no en el globo entero.
      if (atlas.frame) engine.frame(atlas.frame, { duration: 0 });
      setEngine(engine);
      setLocalEngine(engine);

      offs = [
        engine.on('click', (hit) => {
          // En pantallas táctiles no hay cursor: con el planeta abierto, tocar una capa enseña su ficha.
          if (hit.layer !== undefined) {
            setLayerId(hit.layer);
            pointerAt.current = hit;
            return;
          }
          useApp.getState().mapClick(hit);
        }),
        engine.on('pointer', (info) => {
          setHovered(info ? info.index : -1);
          setLayerId(info?.layer ?? null);
          if (info) pointerAt.current = info;
          placeTip();
          if (coordsRef.current) coordsRef.current.textContent = info && info.layer === undefined ? formatCoords(info.lon, info.lat) : '';
        }),
      ];
    });
    return () => {
      cancelled = true;
      if (!engine) return;
      offs.forEach((off) => off());
      setEngine(null);
      setLocalEngine(null);
      engine.dispose();
    };
  }, [atlas, waiting]);

  // ── Ficha de una corriente, al señalar su rótulo (o tocarlo) ──
  const [current, setCurrent] = useState<{ id: string; x: number; y: number } | null>(null);
  useEffect(() => {
    const host = canvasRef.current?.parentElement;
    if (!host) return;
    const labelOf = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLElement>('.feature-label[data-id]') : null);
    const show = (e: Event) => {
      const el = labelOf(e);
      if (!el?.dataset.id) return;
      const box = el.getBoundingClientRect();
      setCurrent({ id: el.dataset.id, x: box.left + box.width / 2, y: box.bottom });
    };
    const hide = (e: Event) => labelOf(e) && setCurrent(null);
    host.addEventListener('pointerover', show);
    host.addEventListener('pointerout', hide);
    return () => {
      host.removeEventListener('pointerover', show);
      host.removeEventListener('pointerout', hide);
    };
  }, []);
  const currentInfo = current && layers.currents ? CURRENTS.get(current.id) : undefined;

  // ── Sincronizar el motor con el estado ──
  useEffect(() => {
    engine?.setPalette(toon ? TOON : PALETTES[theme]);
    engine?.setToon(toon);
  }, [engine, theme, toon]);
  useEffect(() => engine?.setMode(viewMode), [engine, viewMode]);
  useEffect(() => engine?.setReducedMotion(reducedMotion), [engine, reducedMotion]);
  useEffect(() => engine?.setPadding(pad), [engine, pad]);
  // El globo gira solo en la portada del mundo: en el mapa de un país se lo llevaría de la vista.
  useEffect(() => engine?.setAutoRotate(screen === 'home' && !atlas.frame), [engine, screen, atlas]);
  const playing = screen === 'play' || screen === 'results';
  const reviewOnly = useApp((s) => s.reviewOnly);
  const perfect = screen === 'results' && !!session && !reviewOnly && score(session).first === session.total;
  const wideScreen = useWide();
  // Durante la partida el tiempo real se aparta: el día y la noche oscurecerían medio mapa.
  const live = realTime && !playing;
  const daylight = live && layers.dayNight && !toon;
  useEffect(() => engine?.setDaylight(daylight ? 1 : 0), [engine, daylight]);
  useEffect(() => engine?.setRelief(layers.relief), [engine, layers.relief]);
  useEffect(() => engine?.setPlayLines(playing), [engine, playing]);
  useEffect(() => engine?.setSatellite(layers.satellite), [engine, layers.satellite]);
  useEffect(() => engine?.setSeaDepth(layers.depth), [engine, layers.depth]);
  useEffect(() => engine?.setCurrents(layers.currents), [engine, layers.currents]);
  useEffect(() => {
    engine?.setGuides(
      layers.guides
        ? [t('Círculo polar ártico'), t('Trópico de Cáncer'), t('Ecuador'), t('Trópico de Capricornio'), t('Círculo polar antártico'), t('Meridiano de Greenwich')]
        : null,
    );
  }, [engine, layers.guides]);
  useEffect(() => engine?.setZones(layers.timezones), [engine, layers.timezones]);
  // Jugando a coordenadas: retícula con grados también sobre tierra, y sin la lectura de la posición
  // del cursor, que daría la respuesta.
  const playedMode = useApp((s) => s.session?.config.mode);
  const readingCoords = screen === 'play' && playedMode === 'coords';
  useEffect(() => engine?.setGraticule(readingCoords, t('O')), [engine, readingCoords]);
  // Capas de datos: cada fichero solo se descarga si su capa está encendida. La de accidentes
  // también en el mapa de geografía física, que necesita los ríos dibujados; jugando no lleva
  // rótulos, porque darían la respuesta.
  const physical = (atlas as Atlas | null)?.map === 'fisico';
  useOverlay(engine, 'features', '/data/fisico.json', layers.features || physical, layers.features && screen !== 'play', 'river');
  useOverlay(engine, 'tectonics', '/data/tectonica.json', layers.tectonics, true, 'plate');
  useOverlay(engine, 'currents', '/data/corrientes.json', layers.currents, true, 'river');
  useEffect(() => engine?.setLayers(layers.grid, layers.glint, layers.stars), [engine, layers.grid, layers.glint, layers.stars]);
  useEffect(() => engine?.setSidereal(siderealAngle(now)), [engine, now]);
  useEffect(() => engine?.setSun(sun.lon, sun.lat), [engine, sun]);

  const mapState = useMemo(
    () => computeMapState({ atlas, screen, session, selected, exploreScope, lists, progressMode, draft, progress, byClimate: layers.climate, byZone: layers.timezones, byDensity: layers.population }),
    [atlas, screen, session, selected, exploreScope, lists, progressMode, draft, progress, layers.climate, layers.timezones, layers.population],
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
  const layer = layerId ? [...INTERIOR, ...DISCONTINUITIES].find((item) => item.id === layerId) : undefined;
  const showTip = !!layer || (!!country && (screen !== 'lists' || country.kind === 'country'));
  const localTime = country?.tz ? clockIn(country.tz, now) : null;

  if (failed) {
    return (
      <div className="fixed inset-0 grid place-items-center p-8 text-center">
        <p className="max-w-sm text-ink-soft">
          {t('Tu navegador no ha podido iniciar los gráficos 3D (WebGL). Prueba a actualizarlo o a abrir la página en otro navegador.')}
        </p>
      </div>
    );
  }

  return (
    <>
      {toon && (
        <Suspense fallback={null}>
          <ToonSky animated={!reducedMotion} />
        </Suspense>
      )}
      <canvas
        ref={canvasRef}
        className="map-canvas transition-opacity duration-700"
        style={{ opacity: engine ? 1 : 0 }}
        tabIndex={0}
        role="application"
        aria-roledescription={t('mapa')}
        aria-label={t('Mapa del mundo interactivo. Flechas para moverlo, más y menos para acercar o alejar, Intro para elegir el país del centro.')}
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
      {waiting && (
        <p className="pointer-events-none fixed inset-x-0 top-[28%] z-10 mx-auto max-w-xs px-6 text-center text-sm text-ink-soft wide:left-[30rem] wide:top-[45%]">
          {t('Tu navegador dibuja sin aceleración gráfica, así que el mapa irá lento. Toca la pantalla o pulsa una tecla para cargarlo.')}
        </p>
      )}
      {/* La regla de escala: solo donde hay sitio y fuera de la partida. */}
      {engine && wideScreen && !playing && <ScaleRuler engine={engine} />}
      {engine && live && <RealTimeMarkers engine={engine} sun={sun} moon={moon} layers={layers} showUser={!playing} />}
      {engine && labels.map((label) => <Pin key={label.key} engine={engine} atlas={atlas} label={label} />)}
      {toon && (
        <Suspense fallback={null}>
          <ToonSaucer animated={!reducedMotion} />
        </Suspense>
      )}
      {/* Un 10 (todo a la primera, en una partida entera) se celebra con fuegos artificiales. */}
      {engine && perfect && !reducedMotion && <Celebration key={session.startedAt} engine={engine} atlas={atlas} countries={session.results.map((r) => r.country)} />}

      {current && currentInfo && (
        <div
          role="tooltip"
          className="float pointer-events-none fixed z-40 w-64 bg-surface! px-3 py-2.5 text-sm"
          style={{ left: clampX(current.x), top: current.y + 8, transform: 'translateX(-50%)' }}
        >
          <p className="display text-base leading-tight">{currentInfo.name}</p>
          <p className="mt-1 flex items-start gap-2 text-ink-soft">
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${currentInfo.kind === 'corriente-calida' ? 'bg-[#e0452a]' : 'bg-[#2f7fd0]'}`} />
            {currentInfo.kind === 'corriente-calida'
              ? t('Corriente cálida: su agua está más caliente que la que la rodea.')
              : t('Corriente fría: su agua está más fría que la que la rodea.')}
          </p>
          <dl className="mt-2 space-y-1.5">
            <div>
              <dt className="text-xs text-ink-soft">{t('Dirección')}</dt>
              <dd className="font-semibold">
                <span className="mr-1.5 inline-block" style={{ transform: `rotate(${(currentInfo.dir ?? 0) * 45}deg)` }} aria-hidden="true">
                  ↑
                </span>
                {COMPASS[currentInfo.dir ?? 0]}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">{t('Velocidad media en superficie')}</dt>
              <dd className="tabular font-semibold">
                {(currentInfo.speed ?? 0).toLocaleString(LOCALE, { maximumFractionDigits: 2 })} m/s · {((currentInfo.speed ?? 0) * 3.6).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} km/h
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-ink-faint">{t('Medida por satélite: media de 2011 a 2014 (OSCAR).')}</p>
        </div>
      )}

      <div
        ref={tipRef}
        role={showTip ? 'tooltip' : undefined}
        aria-hidden={!showTip}
        className={`float pointer-events-none fixed left-0 top-0 z-40 flex items-center gap-2 px-2.5 py-1.5 text-sm font-semibold transition-opacity duration-150 ${showTip ? 'opacity-100' : 'opacity-0'}`}
      >
        {layer && (
          <>
            <span className="h-3.5 w-3.5 shrink-0 rounded-[4px] border border-rule-strong" style={{ background: layer.color }} />
            <span>{layer.name}</span>
            <span className="font-normal text-ink-soft">· {layer.detail}</span>
            {'temp' in layer && <span className="tabular font-normal text-ink-soft">· {String(layer.temp)}</span>}
          </>
        )}
        {country && !layer && (
          <>
            {(country.a2 || !atlas.frame) && <Flag a2={country.a2} height={15} />}
            <span>{country.name}</span>
            {localTime && (
              <span className="tabular flex items-center gap-1 font-normal text-ink-soft" title={t('Hora local')}>
                <Icon name="clock" size={13} />
                {localTime}
                {country.tzMulti && country.capital && <> {t('en {place}', { place: country.capital })}</>}
              </span>
            )}
            {country.climate.length > 0 && <span className="font-normal text-ink-soft">· {climateText(country.climate, 2)}</span>}
            {country.population && (
              <span className="tabular font-normal text-ink-soft">
                · {t('{n} hab. ({year})', { n: formatCompact(country.population), year: country.populationYear ?? '' })}
              </span>
            )}
            {layers.population && density(country) !== null && (
              <span className="tabular font-normal text-ink-soft">· {t('{n} hab./km²', { n: Math.round(density(country)!).toLocaleString(LOCALE) })}</span>
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
        className={`tabular pointer-events-none fixed bottom-3 left-1/2 z-10 hidden -translate-x-1/2 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-faint ${readingCoords ? '' : 'wide:block'}`}
      />
    </>
  );
}
