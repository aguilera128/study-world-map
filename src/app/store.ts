import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadAtlas, type Atlas } from '../atlas/atlas';
import { warmMesh } from '../atlas/meshAsync';
import { warmBitmap } from '../engine/bitmaps';
import type { MapId } from '../atlas/types';
import type { Padding } from '../engine/camera';
import type { PointerInfo, ViewMode } from '../engine/MapEngine';
import {
  DEFAULT_CONFIG,
  inputOf,
  modeDef,
  resolveScope,
  SAMPLE_LIST,
  sanitizeConfig,
  showsTarget,
  type GameConfig,
  type ModeId,
  type StudyList,
} from '../game/config';
import { record, sanitizeProgress, type Outcome, type Progress, mergeProgress } from '../game/progress';
import { advance, answersOf, createSession, currentQuestion, score, submit, type Answer, type Session } from '../game/session';
import { dailyConfig, dailyKey, dailyRng, recordDaily, type DailyRecord } from '../game/daily';
import { COUNTRY_IDS, COUNTRY_MAPS, type CountryMapId } from '../game/countryMaps';
import { isCountryMap, isMapId, MAPS, type MapDef } from '../game/maps';
import { getEngine } from './engineRef';
import { deviceZone } from './time';
import { SAT_GROUPS, type SatGroup } from '../satellites/format';
import { lang, t } from '../i18n';

// Estado de la aplicación en tres almacenes:
//   useSettings  preferencias y listas de estudio          (se guardan en el navegador)
//   useProgress  lo aprendido y los récords                 (se guarda en el navegador)
//   useApp       pantalla actual, partida en curso, etc.    (se pierde al recargar)

// ───────────────────────── Ajustes ─────────────────────────

export type ThemeChoice = 'auto' | 'paper' | 'night';

/** Capas del mapa que se pueden ocultar. Las cuatro últimas solo existen en el modo de tiempo real. */
export const LAYERS = {
  grid: t('Meridianos y paralelos'),
  guides: t('Líneas imaginarias'),
  timezones: t('Husos horarios'),
  population: t('Densidad de población'),
  relief: t('Relieve'),
  depth: t('Profundidad del mar'),
  currents: t('Corrientes oceánicas'),
  tectonics: t('Placas y volcanes'),
  features: t('Montañas, ríos y mares'),
  satellite: t('Imagen de satélite'),
  // el tiempo de ahora: se piden sus datos al encenderlas (./weather.ts)
  weatherTemp: t('Temperatura'),
  weatherCloud: t('Nubes'),
  weatherRain: t('Lluvia y nieve'),
  weatherWind: t('Viento'),
  // los satélites de ahora: sus grupos se encienden aparte, en la leyenda (./satellites.ts)
  satellites: t('Satélites'),
  glint: t('Reflejo del agua'),
  // solo se ven en el globo con el tema oscuro
  stars: t('Estrellas'),
  climate: t('Colorear por clima'),
  dayNight: t('Día y noche'),
  sun: t('Sol'),
  moon: t('Luna'),
  you: t('Mi ubicación'),
};
export type LayerId = keyof typeof LAYERS;
export type Layers = Record<LayerId, boolean>;
/** Capas que empiezan ocultas; las demás se ven salvo que se hayan quitado. */
const WEATHER: LayerId[] = ['weatherTemp', 'weatherCloud', 'weatherRain', 'weatherWind'];
const OFF_BY_DEFAULT: LayerId[] = ['satellite', 'climate', 'features', 'guides', 'currents', 'timezones', 'tectonics', 'population', ...WEATHER, 'satellites'];
/**
 * Capas que se apartan durante una partida, las tenga puestas o no quien juega: tapan el mapa mudo
 * (la foto de satélite), lo llenan de líneas y rótulos (ríos, placas, corrientes, líneas
 * imaginarias, husos) o son colores de otro tema (climas, densidad, el tiempo de ahora). Al salir
 * vuelven como estaban.
 */
const OFF_IN_GAME: readonly LayerId[] = ['satellite', 'features', 'currents', 'tectonics', 'guides', 'timezones', 'climate', 'population', ...WEATHER, 'satellites'];
/**
 * Las capas que se apartan jugando en un mapa. En los de países también el relieve: su sombreado
 * compite con las fronteras, que es lo que hay que leer. En el de geografía física se queda, porque
 * allí las montañas son la pregunta.
 */
export const offInGame = (map: MapId): readonly LayerId[] => (map === 'fisico' ? OFF_IN_GAME : [...OFF_IN_GAME, 'relief']);
/** Las capas con las que se juega: las de quien juega, sin las que estorban. */
export const gameLayers = (layers: Layers, map: MapId): Layers => ({ ...layers, ...Object.fromEntries(offInGame(map).map((id) => [id, false])) });

const ALL_LAYERS = Object.fromEntries(Object.keys(LAYERS).map((id) => [id, !OFF_BY_DEFAULT.includes(id as LayerId)])) as Layers;
/** Grupos de la capa de satélites que se ven al encenderla: todos menos Starlink, que son miles. */
const SAT_GROUPS_ON = Object.fromEntries(SAT_GROUPS.map((g) => [g, g !== 'starlink'])) as Record<SatGroup, boolean>;

interface SettingsState {
  theme: ThemeChoice;
  viewMode: ViewMode;
  /** Día y noche en tiempo real sobre el mapa. */
  realTime: boolean;
  layers: Layers;
  /** Qué grupos de satélites se ven con su capa encendida. */
  satGroups: Record<SatGroup, boolean>;
  /** Con la capa de satélites, sus órbitas. */
  satOrbits: boolean;
  config: GameConfig;
  /** Lo último elegido en los otros mapas, para recuperarlo al volver a ellos. */
  configs: Partial<Record<MapId, GameConfig>>;
  lists: StudyList[];
  /** Ya se ha cerrado (o usado) el aviso «Ver en…» de la portada, o se ha elegido idioma a mano. */
  langHintSeen: boolean;
  dismissLangHint(): void;
  setTheme(theme: ThemeChoice): void;
  setViewMode(mode: ViewMode): void;
  setRealTime(on: boolean): void;
  setLayer(id: LayerId, on: boolean): void;
  setSatGroup(group: SatGroup, on: boolean): void;
  setSatOrbits(on: boolean): void;
  /** Deja las capas como vienen de entrada. */
  resetLayers(): void;
  setConfig(patch: Partial<GameConfig>): void;
  saveList(list: StudyList): void;
  deleteList(id: string): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'auto',
      viewMode: 'globe',
      // Encendido de entrada: el globo de la portada se ve con su día y su noche de ahora mismo.
      realTime: true,
      layers: ALL_LAYERS,
      satGroups: SAT_GROUPS_ON,
      satOrbits: true,
      config: DEFAULT_CONFIG,
      configs: {},
      lists: [SAMPLE_LIST],
      langHintSeen: false,
      dismissLangHint: () => set({ langHintSeen: true }),
      setTheme: (theme) => set({ theme }),
      setViewMode: (viewMode) => set({ viewMode }),
      setRealTime: (realTime) => set({ realTime }),
      setLayer: (id, on) => set((s) => ({ layers: { ...s.layers, [id]: on } })),
      setSatGroup: (group, on) => set((s) => ({ satGroups: { ...s.satGroups, [group]: on } })),
      setSatOrbits: (satOrbits) => set({ satOrbits }),
      resetLayers: () => set({ layers: ALL_LAYERS, satGroups: SAT_GROUPS_ON, satOrbits: true }),
      setConfig: (patch) =>
        set((s) => {
          // Al cambiar de mapa se guarda lo elegido en el que se deja y se recupera lo del que se abre.
          const change = patch.map !== undefined && patch.map !== s.config.map;
          const base = change ? (s.configs[patch.map!] ?? {}) : s.config;
          return {
            config: sanitizeConfig({ ...base, ...patch }, s.lists),
            configs: change ? { ...s.configs, [s.config.map]: s.config } : s.configs,
          };
        }),
      saveList: (list) =>
        set((s) => ({
          lists: s.lists.some((l) => l.id === list.id) ? s.lists.map((l) => (l.id === list.id ? list : l)) : [...s.lists, list],
        })),
      deleteList: (id) =>
        set((s) => {
          const lists = s.lists.filter((l) => l.id !== id);
          return { lists, config: sanitizeConfig(s.config, lists) };
        }),
    }),
    {
      // Las claves de almacenamiento conservan el nombre anterior del proyecto (Mapamundi) para no
      // perder lo que ya esté guardado en el navegador.
      name: 'mapamundi:ajustes',
      version: 3,
      // Versión 2: la imagen de satélite pasa a verse de entrada. Quien ya tenía ajustes guardados la
      // tenía apagada porque así venía, no porque la quitara: se le enciende una vez y después manda
      // lo que elija. Versión 3: vuelve a empezar apagada, y por lo mismo se apaga una vez a quien la
      // tenía encendida.
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        // «merge» valida después lo que salga de aquí.
        return (version < 3 ? { ...saved, layers: { ...saved.layers, satellite: false } } : saved) as SettingsState;
      },
      partialize: ({ theme, viewMode, realTime, layers, satGroups, satOrbits, config, configs, lists, langHintSeen }) => ({ theme, viewMode, realTime, layers, satGroups, satOrbits, config, configs, lists, langHintSeen }),
      // Lo guardado puede venir de una versión anterior: se valida antes de usarlo.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        const lists = Array.isArray(saved.lists) ? saved.lists : current.lists;
        return {
          ...current,
          theme: saved.theme === 'paper' || saved.theme === 'night' ? saved.theme : 'auto',
          viewMode: saved.viewMode === 'flat' ? 'flat' : 'globe',
          realTime: saved.realTime !== false,
          langHintSeen: saved.langHintSeen === true,
          // Cada capa conserva lo guardado; las nuevas toman su valor inicial.
          layers: Object.fromEntries(
            Object.keys(LAYERS).map((id) => [id, typeof saved.layers?.[id as LayerId] === 'boolean' ? saved.layers[id as LayerId] : ALL_LAYERS[id as LayerId]]),
          ) as Layers,
          satGroups: Object.fromEntries(SAT_GROUPS.map((g) => [g, typeof saved.satGroups?.[g] === 'boolean' ? saved.satGroups[g] : SAT_GROUPS_ON[g]])) as Record<SatGroup, boolean>,
          satOrbits: saved.satOrbits !== false,
          lists,
          config: sanitizeConfig(saved.config, lists),
          configs: Object.fromEntries(
            Object.entries(saved.configs ?? {})
              .filter(([map]) => isMapId(map))
              .map(([map, config]) => [map, sanitizeConfig({ ...config, map: map as MapId }, lists)]),
          ),
        };
      },
    },
  ),
);

// ───────────────────────── Progreso ─────────────────────────

export interface Best {
  grade: number;
  ms: number;
  at: number;
}

interface ProgressState {
  progress: Progress;
  bests: Record<string, Best>;
  /** Reto del día: último día jugado, su nota y la racha. */
  daily: DailyRecord | null;
  recordDailyGame(key: string, grade: number): void;
  recordAnswer(country: string, mode: ModeId, outcome: Outcome): void;
  /** Guarda el resultado de una partida; devuelve true si mejora la marca anterior. */
  recordGame(config: GameConfig, grade: number, ms: number): boolean;
  /** Borra lo aprendido y las marcas de un mapa; lo del otro no se toca. */
  reset(atlas: Atlas): void;
  /** Mezcla con lo de este dispositivo el progreso de otro (sincronización, src/app/sync.ts). */
  absorb(remote: unknown): void;
}

const bestKey = (c: GameConfig) => `${c.mode}/${c.answer}/${c.scope}/${c.length}`;

/** Progreso, marcas y reto del día de una fuente que no es de fiar (lo guardado, lo de otro dispositivo), ya validados. */
function cleanSaved(raw: unknown): Pick<ProgressState, 'progress' | 'bests' | 'daily'> {
  const saved = (raw && typeof raw === 'object' ? raw : {}) as Partial<ProgressState>;
  const bests: Record<string, Best> = {};
  if (saved.bests && typeof saved.bests === 'object') {
    for (const [key, b] of Object.entries(saved.bests)) {
      if (b && [b.grade, b.ms, b.at].every((v) => typeof v === 'number' && Number.isFinite(v))) bests[key] = b;
    }
  }
  const d = saved.daily;
  const daily =
    d && /^\d{4}-\d{2}-\d{2}$/.test(String(d.date)) && Number.isFinite(d.grade) && Number.isInteger(d.streak) && d.streak > 0
      ? { date: d.date, grade: d.grade, streak: d.streak }
      : null;
  return { progress: sanitizeProgress(saved.progress), bests, daily };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      bests: {},
      daily: null,
      recordDailyGame: (key, grade) => set((s) => ({ daily: recordDaily(s.daily, key, grade) })),
      recordAnswer: (country, mode, outcome) => set((s) => ({ progress: record(s.progress, country, mode, outcome, Date.now()) })),
      recordGame: (config, grade, ms) => {
        const key = bestKey(config);
        const best = get().bests[key];
        const improved = !best || grade > best.grade + 1e-9 || (Math.abs(grade - best.grade) < 1e-9 && ms < best.ms);
        if (improved) set((s) => ({ bests: { ...s.bests, [key]: { grade, ms, at: Date.now() } } }));
        // La primera partida de un reto no se anuncia como récord.
        return improved && !!best;
      },
      absorb: (remote) =>
        set((s) => {
          const theirs = cleanSaved(remote);
          const bests = { ...s.bests };
          for (const [key, b] of Object.entries(theirs.bests)) {
            const mine = bests[key];
            if (!mine || b.grade > mine.grade + 1e-9 || (Math.abs(b.grade - mine.grade) < 1e-9 && b.ms < mine.ms)) bests[key] = b;
          }
          // Reto del día: el día más reciente; si es el mismo, la racha más larga.
          const daily =
            !s.daily || (theirs.daily && (theirs.daily.date > s.daily.date || (theirs.daily.date === s.daily.date && theirs.daily.streak > s.daily.streak)))
              ? (theirs.daily ?? s.daily)
              : s.daily;
          return { progress: mergeProgress(s.progress, theirs.progress), bests, daily };
        }),
      reset: (atlas) =>
        set((s) => {
          // Una marca es del mapa que tiene su zona; las de las listas de estudio, del mundo.
          const mapOf = (best: string) => (Object.values(MAPS).find((m) => m.filters.some((f) => f.id === best.split('/')[2])) ?? MAPS.world).id;
          // Solo lo que se pregunta en este mapa: los países de alrededor del mapa de España llevan
          // el mismo código que en el mundo, y su progreso es del mundo.
          const asked = new Set(atlas.quizzable.map((i) => atlas.countries[i].id));
          return {
            progress: Object.fromEntries(Object.entries(s.progress).filter(([id]) => !asked.has(id))),
            bests: Object.fromEntries(Object.entries(s.bests).filter(([key]) => mapOf(key) !== atlas.map)),
            daily: MAPS[atlas.map].extras ? null : s.daily,
          };
        }),
    }),
    {
      name: 'mapamundi:progreso',
      version: 2,
      // Versión 2: el reto «Población» deja de preguntar la densidad y pregunta la población total.
      // Lo aprendido y las marcas de ese reto eran de otra pregunta: se descartan (solo las suyas).
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as { progress?: Progress; bests?: Record<string, Best> };
        if (version >= 2) return saved as ProgressState;
        const progress = Object.fromEntries(Object.entries(saved.progress ?? {}).map(([id, modes]) => [id, Object.fromEntries(Object.entries(modes ?? {}).filter(([mode]) => mode !== 'population'))]));
        const bests = Object.fromEntries(Object.entries(saved.bests ?? {}).filter(([key]) => !key.startsWith('population/')));
        return { ...saved, progress, bests } as unknown as ProgressState;
      },
      partialize: ({ progress, bests, daily }) => ({ progress, bests, daily }),
      // Igual que con los ajustes: lo guardado se valida antes de usarlo.
      merge: (persisted, current) => ({ ...current, ...cleanSaved(persisted) }),
    },
  ),
);

export const bestFor = (bests: Record<string, Best>, config: GameConfig): Best | undefined => bests[bestKey(config)];

// ───────────────────────── Aplicación ─────────────────────────

export type Screen = 'home' | 'play' | 'results' | 'explore' | 'progress' | 'lists' | 'ranking';
export type Tone = 'ok' | 'help' | 'bad' | 'info';

/** Rótulo temporal clavado sobre un país del mapa. */
export interface MapLabel {
  key: number;
  country: number;
  text: string;
  tone: Tone;
}

/** Dónde está el usuario. Solo vive en memoria: ni se guarda ni sale del navegador. */
export interface UserLocation {
  lon: number;
  lat: number;
  /** País en el que cae (−1 si no se sabe). */
  country: number;
  /** true si viene del GPS o la red; false si se ha deducido de la zona horaria del dispositivo. */
  exact: boolean;
}

/** `asking`: esperando el permiso · `denied`: el usuario no lo ha dado · `unavailable`: no se puede saber. */
export type LocatingState = 'idle' | 'asking' | 'denied' | 'unavailable';

const NO_PADDING: Padding = { left: 0, right: 0, top: 0, bottom: 0 };

interface AppState {
  atlas: Atlas | null;
  /**
   * El país que ofrece el selector de mapas: el último cuyo mapa se abrió o, si no se ha abierto
   * ninguno, el del visitante. null si no se sabe o su país no tiene mapa: se ofrece «País» a secas.
   */
  country: CountryMapId | null;
  error: string | null;
  screen: Screen;
  session: Session | null;
  /** Partida de repaso de fallos: no cuenta para récords. */
  reviewOnly: boolean;
  newBest: boolean;
  /** Fecha del reto del día en curso (null en una partida normal). */
  daily: string | null;
  labels: MapLabel[];
  /** País seleccionado en el explorador (−1 = ninguno). */
  selected: number;
  /** Países que se están estudiando en el explorador: un filtro de región o una lista. */
  exploreScope: string;
  /** Reto cuyo progreso se está viendo. */
  progressMode: ModeId;
  /** Lista en edición en la pantalla de listas. */
  draft: StudyList | null;
  /** Zonas del mapa tapadas por la interfaz. */
  pad: Padding;
  location: UserLocation | null;
  locating: LocatingState;

  load(): Promise<void>;
  /** Cambia de mapa (el mundo o un país por provincias): carga su atlas y vuelve a la portada. */
  setMap(map: MapId): Promise<void>;
  go(screen: Screen): void;
  start(only?: number[]): void;
  /** Empieza el reto del día: las mismas preguntas para todos, sin tocar la partida elegida. */
  startDaily(): void;
  answer(answer: Answer): void;
  next(): void;
  select(index: number, fly?: boolean): void;
  setExploreScope(scope: string): void;
  mapClick(hit: PointerInfo): void;
  setProgressMode(mode: ModeId): void;
  setDraft(draft: StudyList | null): void;
  toggleDraftCountry(id: string): void;
  setPad(side: keyof Padding, value: number): void;
  toggleRealTime(): void;
  /** Huevo de pascua: el planeta y el espacio, de dibujos animados. No se guarda. */
  toon: boolean;
  toggleToon(): void;
  /** Pide al navegador la ubicación precisa (muestra su aviso de permiso). */
  locateExact(): void;
}

let labelKey = 0;
let advanceTimer: ReturnType<typeof setTimeout> | undefined;
const labelTimers = new Set<ReturnType<typeof setTimeout>>();

function clearTimers() {
  clearTimeout(advanceTimer);
  for (const t of labelTimers) clearTimeout(t);
  labelTimers.clear();
}

const OUTCOME_TONE: Record<Outcome, Tone> = { first: 'ok', later: 'help', failed: 'bad' };

/** Color del destello al pulsar un país equivocado (a juego con --bad de cada tema). */
const WRONG_FLASH = '#e2695a';

/**
 * Ubicación aproximada sin pedir permiso: la ciudad de referencia de la zona horaria del
 * dispositivo («Europe/Madrid» → Madrid). Suficiente para saber en qué parte del mundo se está.
 */
function approximateLocation(atlas: Atlas): UserLocation | null {
  const zone = deviceZone();
  const entry = zone ? atlas.zones[zone] : undefined;
  if (!entry) return null;
  const [lon, lat, id] = entry;
  return { lon, lat, country: atlas.indexOf(id), exact: false };
}

/**
 * El país que ofrece el selector de mapas: el que está abierto; si no, el que ya se ofrecía; y si
 * aún no hay ninguno, el del visitante, cuando tiene mapa. Sale de la zona horaria del dispositivo,
 * como la ubicación aproximada (lo sabe el atlas del mundo): no se pregunta ni se envía nada.
 */
function offeredCountry(atlas: Atlas, current: CountryMapId | null): CountryMapId | null {
  if (isCountryMap(atlas.map)) return atlas.map;
  if (current) return current;
  const iso = atlas.zones[deviceZone() ?? '']?.[2];
  return COUNTRY_IDS.find((id) => COUNTRY_MAPS[id].iso === iso) ?? null;
}

/** Vista general: el globo o el mapa entero o, en el mapa de un país, el país. */
export function showWhole(atlas: Atlas | null) {
  const engine = getEngine();
  if (atlas?.frame) engine?.frame(atlas.frame);
  else engine?.home();
}

/**
 * Encuadra un país con algo de contexto alrededor (`wide`: con más, para situarlo). En el mapa de un
 * país todo es más pequeño: una provincia se enseña con su región, no con medio continente; y en
 * el de un país pequeño (Suiza), menos aún: que alrededor de un cantón no quepa el país entero.
 */
export function showCountry(atlas: Atlas, index: number, wide = false) {
  const own = atlas.frame ? Math.max(atlas.frame[2] - atlas.frame[0], atlas.frame[3] - atlas.frame[1]) * 0.35 : Infinity;
  const minSpan = atlas.frame ? Math.min(wide ? 7 : 4, own) : wide ? 30 : 16;
  getEngine()?.frameCountry(index, { minSpan });
}

export const useApp = create<AppState>()((set, get) => {
  /** Añade un rótulo al mapa; si `ms` está definido, desaparece solo. */
  const addLabel = (country: number, text: string, tone: Tone, ms?: number) => {
    const key = ++labelKey;
    // un rótulo nuevo sobre el mismo país sustituye al anterior
    set((s) => ({ labels: [...s.labels.filter((l) => l.country !== country), { key, country, text, tone }] }));
    if (ms) {
      const timer = setTimeout(() => {
        labelTimers.delete(timer);
        set((s) => ({ labels: s.labels.filter((l) => l.key !== key) }));
      }, ms);
      labelTimers.add(timer);
    }
  };

  /** Coloca la cámara para la pregunta actual (o para el conjunto del cuestionario). */
  const frameQuestion = (session: Session, first: boolean) => {
    const { atlas } = get();
    const engine = getEngine();
    const question = currentQuestion(session);
    if (!atlas || !engine || !question) return;
    if (showsTarget(session.config)) {
      showCountry(atlas, question.country);
    } else if (first) {
      const scope = resolveScope(atlas, session.config.scope, useSettings.getState().lists);
      if (scope.frame) engine.frame(scope.frame);
      else engine.home();
    }
  };

  const finish = (session: Session) => {
    const { atlas, reviewOnly, daily } = get();
    const result = score(session);
    // El reto del día lleva su propia cuenta (nota y racha) y no compite con las marcas normales.
    if (daily) useProgress.getState().recordDailyGame(daily, result.grade);
    const newBest = !reviewOnly && !daily && useProgress.getState().recordGame(session.config, result.grade, result.ms);
    set({ session, screen: 'results', newBest, labels: [] });
    const engine = getEngine();
    if (atlas && engine) {
      const scope = resolveScope(atlas, session.config.scope, useSettings.getState().lists);
      if (scope.frame) engine.frame(scope.frame);
      else engine.home();
    }
  };

  return {
    atlas: null,
    country: COUNTRY_IDS.find((id) => useSettings.getState().configs[id]) ?? null,
    error: null,
    screen: 'home',
    session: null,
    reviewOnly: false,
    daily: null,
    newBest: false,
    labels: [],
    selected: -1,
    exploreScope: 'mundo',
    progressMode: 'locate',
    draft: null,
    pad: NO_PADDING,
    location: null,
    locating: 'idle',

    load: async () => {
      try {
        const atlas = await loadAtlas(lang, useSettings.getState().config.map);
        // Mientras se monta la interfaz y se carga el motor, se adelanta lo que este va a necesitar:
        // la malla (en un hilo aparte) y las imágenes del mapa (descarga y decodificación).
        void warmMesh(atlas);
        const { layers } = useSettings.getState();
        const images = ['/data/depth.webp', '/data/seabed.webp', '/data/currents.png'];
        if (layers.relief) images.push('/data/relief.webp');
        if (layers.stars && document.documentElement.dataset.theme === 'night') images.push('/data/milkyway.webp');
        for (const url of images) void warmBitmap(url).catch(() => {});
        set({ atlas, error: null, location: approximateLocation(atlas), country: offeredCountry(atlas, get().country) });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : t('No se pudo cargar el mapa.') });
      }
    },

    setMap: async (map) => {
      if (get().atlas?.map === map) return;
      try {
        const atlas = await loadAtlas(lang, map);
        void warmMesh(atlas);
        clearTimers();
        // El reto y la zona del otro mapa no valen en este: la configuración se ajusta al cambiar.
        useSettings.getState().setConfig({ map });
        // La ubicación guardaba un índice del otro atlas: se vuelve a deducir (o se queda sin ella).
        set({ atlas, error: null, screen: 'home', session: null, labels: [], selected: -1, draft: null, location: approximateLocation(atlas), country: offeredCountry(atlas, get().country) });
      } catch (e) {
        // Sin el atlas nuevo (p. ej. sin conexión) no hay mapa que enseñar: «Reintentar» recarga el anterior.
        set({ atlas: null, error: e instanceof Error ? e.message : t('No se pudo cargar el mapa.') });
      }
    },

    go: (screen) => {
      clearTimers();
      set({
        screen,
        labels: [],
        session: screen === 'play' || screen === 'results' ? get().session : null,
        selected: screen === 'explore' ? get().selected : -1,
        draft: null,
      });
      if (screen === 'home' || screen === 'progress' || screen === 'lists') showWhole(get().atlas);
      if (screen === 'progress') set({ progressMode: useSettings.getState().config.mode });
      // El explorador se abre con los países que se habían elegido para jugar.
      if (screen === 'explore') set({ exploreScope: useSettings.getState().config.scope });
    },

    start: (only) => {
      const { atlas, session: last } = get();
      if (!atlas) return;
      clearTimers();
      const { config: chosen, lists } = useSettings.getState();
      // El repaso de fallos repite el reto y la zona de la partida que acaba de terminar (también la
      // del reto del día), no los elegidos en la portada.
      const base = only && last ? last.config : chosen;
      const scope = resolveScope(atlas, base.scope, lists);
      // La forma de responder elegida puede no tener nada que preguntar en esta zona (la capital de
      // una provincia que se llama como ella): se pasa a la primera que sí.
      const answers = answersOf(atlas, modeDef(base.mode, atlas.map), scope.countries);
      const config = answers.length && !answers.includes(base.answer) ? { ...base, answer: answers[0] } : base;
      if (base === chosen && config !== chosen) useSettings.getState().setConfig({ answer: config.answer });
      const session = createSession(atlas, config, scope, useProgress.getState().progress, Date.now(), { only });
      // Sin preguntas la partida nacería terminada y la pantalla de juego se quedaría vacía y sin salida.
      if (!session.total) return;
      set({ session, screen: 'play', reviewOnly: !!only, newBest: false, daily: null, labels: [], selected: -1 });
      frameQuestion(session, true);
    },

    startDaily: () => {
      const { atlas } = get();
      if (!atlas) return;
      clearTimers();
      const key = dailyKey(new Date());
      const config = dailyConfig(key);
      const scope = resolveScope(atlas, config.scope, []);
      // Sin el progreso del jugador: así el sorteo solo depende de la fecha y es igual para todos.
      const session = createSession(atlas, config, scope, {}, Date.now(), { rng: dailyRng(key) });
      set({ session, screen: 'play', reviewOnly: false, newBest: false, daily: key, labels: [], selected: -1 });
      frameQuestion(session, true);
    },

    answer: (answer) => {
      const { atlas, session } = get();
      if (!atlas || !session) return;
      const question = currentQuestion(session);
      if (!question) return;
      const engine = getEngine();
      const { session: next, verdict, resolved } = submit(atlas, session, answer, Date.now());

      if (verdict === 'ignored') {
        // Pulsar fuera del cuestionario no penaliza, pero se explica por qué no cuenta.
        if (answer.kind === 'country' && session.status === 'asking' && !session.pool.includes(answer.index)) {
          addLabel(answer.index, t('{country} no entra en esta partida', { country: atlas.countries[answer.index].name }), 'info', 1600);
        }
        return;
      }

      if (verdict === 'wrong') {
        // Cada fallo enseña algo: se dice qué país era el que se ha pulsado o elegido.
        const chosen =
          answer.kind === 'country'
            ? answer.index
            : answer.kind === 'option'
              ? (question.options.find((o) => o.id === answer.id)?.country ?? -1)
              : -1;
        if (chosen >= 0 && chosen !== question.country) {
          engine?.flash(chosen, WRONG_FLASH);
          addLabel(chosen, atlas.countries[chosen].name, 'bad', 1900);
        }
      }

      set({ session: next });
      if (!resolved) return;

      const outcome = next.outcome!;
      const country = atlas.countries[question.country];
      if (!question.review) useProgress.getState().recordAnswer(country.id, session.config.mode, outcome);
      addLabel(question.country, country.name, OUTCOME_TONE[outcome]);
      if (outcome !== 'failed') engine?.pop(question.country);
      // Si el país no estaba a la vista (había que recordarlo o no se ha encontrado), se enseña.
      const hidden = !showsTarget(session.config);
      if (hidden && (outcome === 'failed' || inputOf(session.config.answer) !== 'map')) {
        showCountry(atlas, question.country, true);
      }
      // Los aciertos pasan solos a la siguiente; un fallo espera a que se lea la solución.
      if (outcome !== 'failed') {
        clearTimeout(advanceTimer);
        // Si la solución trae un dato que leer (habitantes, clima, la nota de una capital), se deja algo más.
        const reading = session.config.mode === 'population' || session.config.mode === 'inhabitants' || session.config.mode === 'climate' || (session.config.mode === 'capital' && !!country.capitalNote);
        advanceTimer = setTimeout(() => get().next(), (outcome === 'first' ? 1100 : 1500) + (reading ? 900 : 0));
      }
    },

    next: () => {
      clearTimeout(advanceTimer);
      const { session } = get();
      if (!session || session.status !== 'resolved') return;
      const next = advance(session, Date.now());
      if (next.status === 'finished') {
        finish(next);
        return;
      }
      set({ session: next, labels: [] });
      frameQuestion(next, false);
    },

    select: (index, fly = false) => {
      set({ selected: index });
      const { atlas } = get();
      if (atlas && index >= 0 && fly) showCountry(atlas, index);
    },

    setExploreScope: (exploreScope) => {
      const { atlas } = get();
      set({ exploreScope, selected: -1 });
      if (!atlas) return;
      const { frame } = resolveScope(atlas, exploreScope, useSettings.getState().lists);
      if (frame) getEngine()?.frame(frame);
      else getEngine()?.home();
    },

    mapClick: (hit) => {
      const { screen, session, atlas, draft } = get();
      if (!atlas) return;
      // El decorado (los países de alrededor en el mapa de un país) no responde.
      const country = hit.index >= 0 && atlas.countries[hit.index].kind !== 'context' ? atlas.countries[hit.index] : null;
      switch (screen) {
        case 'play':
          if (country && session && inputOf(session.config.answer) === 'map') get().answer({ kind: 'country', index: hit.index });
          break;
        case 'home':
          if (country) {
            get().go('explore');
            get().select(hit.index);
          }
          break;
        case 'explore':
          get().select(country ? hit.index : -1);
          break;
        case 'lists':
          if (draft && country?.kind === 'country') get().toggleDraftCountry(country.id);
          break;
        case 'results':
        case 'progress':
          // En pantallas táctiles no hay cursor que diga el nombre: se enseña al tocar.
          if (country) addLabel(hit.index, country.name, 'info', 2200);
          break;
      }
    },

    setProgressMode: (progressMode) => set({ progressMode }),

    setDraft: (draft) => set({ draft }),

    toggleDraftCountry: (id) =>
      set((s) => {
        if (!s.draft) return s;
        const has = s.draft.countries.includes(id);
        return { draft: { ...s.draft, countries: has ? s.draft.countries.filter((c) => c !== id) : [...s.draft.countries, id] } };
      }),

    setPad: (side, value) =>
      set((s) => (Math.abs(s.pad[side] - value) < 1 ? s : { pad: { ...s.pad, [side]: value } })),

    toon: false,
    toggleToon: () => set((s) => ({ toon: !s.toon })),

    toggleRealTime: () => {
      const settings = useSettings.getState();
      const on = !settings.realTime;
      settings.setRealTime(on);
      // Al activarlo fuera de una partida, el globo gira hasta donde está el usuario.
      const { location, screen } = get();
      if (on && location && screen !== 'play' && screen !== 'results') getEngine()?.lookAt(location.lon, location.lat);
    },

    locateExact: () => {
      const { atlas } = get();
      if (!atlas) return;
      if (!('geolocation' in navigator)) {
        set({ locating: 'unavailable' });
        return;
      }
      set({ locating: 'asking' });
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          // Con dos decimales (≈1 km) basta para situar un punto en un mapamundi.
          const lon = Math.round(coords.longitude * 100) / 100;
          const lat = Math.round(coords.latitude * 100) / 100;
          set({ location: { lon, lat, country: atlas.locate(lon, lat), exact: true }, locating: 'idle' });
          const { screen } = get();
          if (screen !== 'play' && screen !== 'results') getEngine()?.lookAt(lon, lat);
        },
        (error) => set({ locating: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable' }),
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
      );
    },
  };
});

/** El mapa que se está estudiando: sus retos, sus zonas y sus textos. */
export const useMapDef = (): MapDef => MAPS[useApp((s) => s.atlas?.map ?? 'world')];
