import { AnimatePresence, MotionConfig } from 'motion/react';
import { lazy, Suspense, useEffect } from 'react';
import { parsePreset, parseSharedList } from './app/share';
import { useApp, useSettings } from './app/store';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { ExplorePanel } from './ui/ExplorePanel';
import { HomePanel } from './ui/HomePanel';
import { Logo } from './ui/Icon';
import { ListsPanel } from './ui/ListsPanel';
import { MapControls } from './ui/MapControls';
import { PlayHud } from './ui/PlayHud';
import { ProgressPanel } from './ui/ProgressPanel';
import { RealTimeStatus } from './ui/RealTime';
import { ResultsPanel } from './ui/ResultsPanel';
import { TopBar } from './ui/TopBar';
import { useTheme } from './ui/hooks';

// El lienzo arrastra three.js: se descarga aparte, en paralelo con los datos del atlas.
const mapCanvas = import('./ui/MapCanvas');
const MapCanvas = lazy(() => mapCanvas);

function Loading({ error }: { error: string | null }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-paper p-8 text-center">
      {error ? (
        <div className="max-w-sm">
          <p className="display text-2xl">No se ha podido cargar el mapa</p>
          <p className="mt-2 text-ink-soft">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-5">
            Reintentar
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-ink">
          <div className="animate-[spin_2.4s_cubic-bezier(0.6,0,0.4,1)_infinite]">
            <Logo size={52} />
          </div>
          <p className="label">Desplegando el atlas…</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const atlas = useApp((s) => s.atlas);
  const error = useApp((s) => s.error);
  const screen = useApp((s) => s.screen);
  const session = useApp((s) => s.session);
  const load = useApp((s) => s.load);
  const realTime = useSettings((s) => s.realTime);
  useTheme();

  useEffect(() => {
    void load();
  }, [load]);

  // Lista de estudio o reto recibidos por enlace: se guardan, se dejan elegidos y se limpia la dirección.
  useEffect(() => {
    const shared = parseSharedList(window.location.search);
    const preset = parsePreset(window.location.search);
    if (!shared && !preset) return;
    const settings = useSettings.getState();
    if (shared) {
      settings.saveList(shared);
      settings.setConfig({ scope: shared.id });
    }
    if (preset) settings.setConfig(preset);
    window.history.replaceState(null, '', window.location.pathname);
  }, []);

  return (
    <ErrorBoundary>
      {/* reducedMotion="user": las transiciones respetan la preferencia del sistema */}
      <MotionConfig reducedMotion="user">
        <div className="backdrop" />
        {atlas && (
          <Suspense fallback={null}>
            <MapCanvas />
          </Suspense>
        )}
        <div className="grain" />

        {atlas ? (
          <>
            <TopBar />
            <MapControls />
            <AnimatePresence>{realTime && <RealTimeStatus key="real-time" />}</AnimatePresence>
            <AnimatePresence mode="wait">
              {screen === 'home' && <HomePanel key="home" />}
              {screen === 'explore' && <ExplorePanel key="explore" />}
              {screen === 'progress' && <ProgressPanel key="progress" />}
              {screen === 'lists' && <ListsPanel key="lists" />}
              {screen === 'results' && session && <ResultsPanel key="results" />}
              {screen === 'play' && session && <PlayHud key="play" />}
            </AnimatePresence>
          </>
        ) : (
          <Loading error={error} />
        )}
      </MotionConfig>
    </ErrorBoundary>
  );
}
