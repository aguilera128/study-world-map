import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../app/engineRef';
import { LAYERS, useApp, useSettings, type LayerId } from '../app/store';
import { resolveScope } from '../game/config';
import { Icon, type IconName } from './Icon';
import { t } from '../i18n';

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

const MAP_LAYERS: LayerId[] = ['grid', 'glint', 'stars'];
const REAL_TIME_LAYERS: LayerId[] = ['dayNight', 'sun', 'moon', 'you'];

/** Botón de capas: qué se dibuja sobre el mapa. */
function LayersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const layers = useSettings((s) => s.layers);
  const setLayer = useSettings((s) => s.setLayer);
  const realTime = useSettings((s) => s.realTime);

  // Se cierra con Escape o al pulsar fuera.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  const group = (title: string, ids: LayerId[]) => (
    <fieldset>
      <legend className="label mb-1">{title}</legend>
      {ids.map((id) => (
        <label key={id} className="flex min-h-8 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={layers[id]} onChange={(e) => setLayer(id, e.target.checked)} className="accent-(--accent)" />
          {LAYERS[id]}
        </label>
      ))}
    </fieldset>
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('Capas del mapa')}
        aria-label={t('Capas del mapa')}
        aria-expanded={open}
        className={`grid h-10 w-10 place-items-center transition-colors hover:text-ink ${open ? 'text-ink' : 'text-ink-soft'}`}
      >
        <Icon name="layers" size={19} />
      </button>
      {open && (
        <div className="float absolute bottom-0 right-12 flex w-52 flex-col gap-3 bg-surface! px-3.5 py-3" role="group" aria-label={t('Capas del mapa')}>
          {group(t('Mapa'), MAP_LAYERS)}
          {realTime ? (
            group(t('Tiempo real'), REAL_TIME_LAYERS)
          ) : (
            <p className="text-xs text-ink-faint">{t('Activa «Tiempo real» para ver el día y la noche, el Sol y la Luna.')}</p>
          )}
        </div>
      )}
    </div>
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
        <Control icon="plus" label={t('Acercar')} onClick={() => getEngine()?.zoomBy(0.6)} />
        <Control icon="minus" label={t('Alejar')} onClick={() => getEngine()?.zoomBy(1 / 0.6)} />
      </span>
      <Control icon="target" label={t('Vista general')} onClick={reset} />
      <LayersMenu />
    </div>
  );
}
