import { getEngine } from '../app/engineRef';
import { useApp, useSettings } from '../app/store';
import { resolveScope } from '../game/config';
import { Icon, type IconName } from './Icon';

function Control({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-10 w-10 place-items-center text-ink-soft transition-colors hover:text-ink"
    >
      <Icon name={icon} size={19} />
    </button>
  );
}

/** Zoom y vuelta a la vista general, para quien no tiene rueda ni pantalla táctil. */
export function MapControls() {
  const screen = useApp((s) => s.screen);
  const pad = useApp((s) => s.pad);

  const reset = () => {
    const engine = getEngine();
    const { atlas, session } = useApp.getState();
    if (!engine || !atlas) return;
    // Durante una partida, «vista general» es la zona del cuestionario.
    const frame = session && (screen === 'play' || screen === 'results')
      ? resolveScope(atlas, session.config.scope, useSettings.getState().lists).frame
      : null;
    if (frame) engine.frame(frame);
    else engine.home();
  };

  return (
    <div
      className="float fixed right-3 z-30 flex flex-col divide-y divide-rule transition-[bottom] duration-300 wide:right-8"
      style={{ bottom: Math.max(16, pad.bottom + 12) }}
    >
      {/* En pantallas táctiles el zoom se hace pellizcando: solo queda la vuelta a la vista general. */}
      <span className="flex flex-col divide-y divide-rule pointer-coarse:hidden">
        <Control icon="plus" label="Acercar" onClick={() => getEngine()?.zoomBy(0.6)} />
        <Control icon="minus" label="Alejar" onClick={() => getEngine()?.zoomBy(1 / 0.6)} />
      </span>
      <Control icon="target" label="Vista general" onClick={reset} />
    </div>
  );
}
