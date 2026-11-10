import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadAtlas, type Atlas } from '../atlas/atlas';
import type { Padding } from '../engine/camera';
import type { PointerInfo, ViewMode } from '../engine/MapEngine';
import {
  DEFAULT_CONFIG,
  inputOf,
  resolveScope,
  SAMPLE_LIST,
  sanitizeConfig,
  showsTarget,
  type GameConfig,
  type ModeId,
  type StudyList,
} from '../game/config';
import { record, type Outcome, type Progress } from '../game/progress';
import { advance, createSession, currentQuestion, score, submit, type Answer, type Session } from '../game/session';
import { getEngine } from './engineRef';
import { deviceZone } from './time';

// Estado de la aplicación en tres almacenes:
//   useSettings  preferencias y listas de estudio          (se guardan en el navegador)
//   useProgress  lo aprendido y los récords                 (se guarda en el navegador)
//   useApp       pantalla actual, partida en curso, etc.    (se pierde al recargar)

// ───────────────────────── Ajustes ─────────────────────────

export type ThemeChoice = 'auto' | 'paper' | 'night';

interface SettingsState {
  theme: ThemeChoice;
  viewMode: ViewMode;
  /** Día y noche en tiempo real sobre el mapa. */
  realTime: boolean;
  config: GameConfig;
  lists: StudyList[];
  setTheme(theme: ThemeChoice): void;
  setViewMode(mode: ViewMode): void;
  setRealTime(on: boolean): void;
  setConfig(patch: Partial<GameConfig>): void;
  saveList(list: StudyList): void;
  deleteList(id: string): void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'auto',
      viewMode: 'globe',
      realTime: false,
      config: DEFAULT_CONFIG,
      lists: [SAMPLE_LIST],
      setTheme: (theme) => set({ theme }),
      setViewMode: (viewMode) => set({ viewMode }),
      setRealTime: (realTime) => set({ realTime }),
      setConfig: (patch) => set({ config: sanitizeConfig({ ...get().config, ...patch }, get().lists) }),
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
      name: 'mapamundi:ajustes',
      version: 1,
      partialize: ({ theme, viewMode, realTime, config, lists }) => ({ theme, viewMode, realTime, config, lists }),
      // Lo guardado puede venir de una versión anterior: se valida antes de usarlo.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        const lists = Array.isArray(saved.lists) ? saved.lists : current.lists;
        return {
          ...current,
          theme: saved.theme === 'paper' || saved.theme === 'night' ? saved.theme : 'auto',
          viewMode: saved.viewMode === 'flat' ? 'flat' : 'globe',
          realTime: saved.realTime === true,
          lists,
          config: sanitizeConfig(saved.config, lists),
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
  recordAnswer(country: string, mode: ModeId, outcome: Outcome): void;
  /** Guarda el resultado de una partida; devuelve true si mejora la marca anterior. */
  recordGame(config: GameConfig, grade: number, ms: number): boolean;
  reset(): void;
}

const bestKey = (c: GameConfig) => `${c.mode}/${c.answer}/${c.scope}/${c.length}`;

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      bests: {},
      recordAnswer: (country, mode, outcome) => set((s) => ({ progress: record(s.progress, country, mode, outcome, Date.now()) })),
      recordGame: (config, grade, ms) => {
        const key = bestKey(config);
        const best = get().bests[key];
        const improved = !best || grade > best.grade + 1e-9 || (Math.abs(grade - best.grade) < 1e-9 && ms < best.ms);
        if (improved) set((s) => ({ bests: { ...s.bests, [key]: { grade, ms, at: Date.now() } } }));
        // La primera partida de un reto no se anuncia como récord.
        return improved && !!best;
      },
      reset: () => set({ progress: {}, bests: {} }),
    }),
    { name: 'mapamundi:progreso', version: 1 },
  ),
);

export const bestFor = (bests: Record<string, Best>, config: GameConfig): Best | undefined => bests[bestKey(config)];

// ───────────────────────── Aplicación ─────────────────────────

export type Screen = 'home' | 'play' | 'results' | 'explore' | 'progress' | 'lists';
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
  error: string | null;
  screen: Screen;
  session: Session | null;
  /** Partida de repaso de fallos: no cuenta para récords. */
  reviewOnly: boolean;
  newBest: boolean;
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
  go(screen: Screen): void;
  start(only?: number[]): void;
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
      engine.frameCountry(question.country);
    } else if (first) {
      const scope = resolveScope(atlas, session.config.scope, useSettings.getState().lists);
      if (scope.frame) engine.frame(scope.frame);
      else engine.home();
    }
  };

  const finish = (session: Session) => {
    const { atlas, reviewOnly } = get();
    const result = score(session);
    const newBest = !reviewOnly && useProgress.getState().recordGame(session.config, result.grade, result.ms);
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
    error: null,
    screen: 'home',
    session: null,
    reviewOnly: false,
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
        const atlas = await loadAtlas();
        set({ atlas, error: null, location: approximateLocation(atlas) });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : 'No se pudo cargar el mapa.' });
      }
    },

    go: (screen) => {
      clearTimers();
      const engine = getEngine();
      set({
        screen,
        labels: [],
        session: screen === 'play' || screen === 'results' ? get().session : null,
        selected: screen === 'explore' ? get().selected : -1,
        draft: null,
      });
      if (screen === 'home' || screen === 'progress' || screen === 'lists') engine?.home();
      if (screen === 'progress') set({ progressMode: useSettings.getState().config.mode });
      // El explorador se abre con los países que se habían elegido para jugar.
      if (screen === 'explore') set({ exploreScope: useSettings.getState().config.scope });
    },

    start: (only) => {
      const { atlas } = get();
      if (!atlas) return;
      clearTimers();
      const { config, lists } = useSettings.getState();
      const scope = resolveScope(atlas, config.scope, lists);
      const session = createSession(atlas, config, scope, useProgress.getState().progress, Date.now(), { only });
      set({ session, screen: 'play', reviewOnly: !!only, newBest: false, labels: [], selected: -1 });
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
          addLabel(answer.index, `${atlas.countries[answer.index].name} no entra en esta partida`, 'info', 1600);
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
        engine?.frameCountry(question.country, { minSpan: 30 });
      }
      // Los aciertos pasan solos a la siguiente; un fallo espera a que se lea la solución.
      if (outcome !== 'failed') {
        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(() => get().next(), outcome === 'first' ? 1100 : 1500);
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
      if (index >= 0 && fly) getEngine()?.frameCountry(index);
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
      const country = hit.index >= 0 ? atlas.countries[hit.index] : null;
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
          get().select(hit.index);
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
