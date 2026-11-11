import { DENSITY_LABELS } from '../game/population';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getEngine } from '../app/engineRef';
import { LAYERS, showWhole, useApp, useSettings, type LayerId } from '../app/store';
import { PALETTES, Style } from '../engine/palette';
import { CLIMATE_KEYS, climateLabel } from '../game/climate';
import { resolveScope } from '../game/config';
import { useTheme, useWide } from './hooks';
import { ExportMenu } from './ExportMenu';
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

/** Las capas, por grupos: así se repasan y se marcan de un vistazo. */
const LAYER_GROUPS: { title: string; ids: LayerId[] }[] = [
  { title: t('Relieve y mar'), ids: ['relief', 'features', 'depth', 'currents', 'tectonics'] },
  { title: t('Datos por país'), ids: ['climate', 'population', 'timezones'] },
  { title: t('Líneas'), ids: ['grid', 'guides'] },
  { title: t('Aspecto'), ids: ['glint', 'stars'] },
];
const REAL_TIME_LAYERS: LayerId[] = ['dayNight', 'sun', 'moon', 'you'];

/** Botón de capas: qué se dibuja sobre el mapa. */
function LayersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const wide = useWide();
  const layers = useSettings((s) => s.layers);
  const setLayer = useSettings((s) => s.setLayer);
  const realTime = useSettings((s) => s.realTime);
  const theme = useTheme();

  // Se cierra con Escape o al pulsar fuera.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && !sheetRef.current?.contains(e.target as Node) && setOpen(false);
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
        // Interruptor: toda la fila se pulsa y mide 44 px de alto, para el dedo. Sigue siendo una
        // casilla nativa (con teclado y lector de pantalla), solo que dibujada como interruptor.
        <label key={id} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
          {LAYERS[id]}
          <input type="checkbox" role="switch" checked={layers[id]} onChange={(e) => setLayer(id, e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden="true"
            className="relative h-6 w-10 shrink-0 rounded-full border border-rule-strong bg-paper transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[1.125rem] after:w-[1.125rem] after:rounded-full after:bg-ink-faint after:transition-transform peer-checked:border-transparent peer-checked:bg-(--accent) peer-checked:after:translate-x-4 peer-checked:after:bg-(--on-accent) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)"
          />
        </label>
      ))}
    </fieldset>
  );

  const legends = (
    <>
      {layers.climate && (
        // Leyenda del mapa de climas, con los mismos colores con los que se pinta.
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-semibold text-ink-soft wide:grid-cols-1" aria-label={t('Clima')}>
          {CLIMATE_KEYS.map((key, i) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className="h-3 w-3 shrink-0 rounded-[3px] border border-rule-strong" style={{ background: PALETTES[theme].styles[Style.climate + i].color }} />
              {climateLabel(key)}
            </li>
          ))}
        </ul>
      )}
      {layers.population && (
        // Leyenda del mapa de densidad, con los mismos colores con los que se pinta.
        <div className="text-xs font-semibold text-ink-soft">
          <p className="mb-1">{t('Habitantes por km²')}</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 wide:grid-cols-1">
            {DENSITY_LABELS.map((label, i) => (
              <li key={label} className="tabular flex items-center gap-1.5">
                <span className="h-3 w-3 shrink-0 rounded-[3px] border border-rule-strong" style={{ background: PALETTES[theme].styles[Style.density + i].color }} />
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 font-normal text-ink-faint">{t('Fuente: Banco Mundial')}</p>
        </div>
      )}
      {layers.tectonics && <p className="text-xs text-ink-faint">{t('Placas: P. Bird (2003), vía H. Ahlenius. Volcanes: NOAA.')}</p>}
    </>
  );
  const content = (
    <>
      {LAYER_GROUPS.map((g) => (
        <div key={g.title}>{group(g.title, g.ids)}</div>
      ))}
      {legends}
      {realTime ? (
        group(t('Tiempo real'), REAL_TIME_LAYERS)
      ) : (
        <p className="text-xs text-ink-faint">{t('Activa «Tiempo real» para ver el día y la noche, el Sol y la Luna.')}</p>
      )}
    </>
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
      {open && wide && (
        <div
          // Con el tiempo real encendido, su tarjeta ocupa la esquina de arriba: el menú acaba antes de llegar a ella.
          className={`float absolute bottom-0 right-12 flex w-60 flex-col gap-3 overflow-y-auto bg-surface! px-3.5 py-3 ${realTime ? 'max-h-[calc(100dvh-18.5rem)]' : 'max-h-[calc(100dvh-7rem)]'}`}
          role="group"
          aria-label={t('Capas del mapa')}
        >
          {content}
        </div>
      )}
      {open &&
        !wide &&
        // En el móvil, una hoja que sube desde abajo: caben todas las capas con interruptores grandes.
        // Va en <body> porque los controles del mapa se mueven con `transform` y la sacarían de sitio.
        createPortal(
          <div ref={sheetRef} className="fixed inset-0 z-50 flex flex-col justify-end">
            <button type="button" aria-label={t('Cerrar')} onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgb(var(--shadow)/0.45)]" />
            <div className="relative max-h-[78dvh] overflow-y-auto overscroll-contain rounded-t-[20px] border-t border-rule-strong bg-surface px-5 pb-6 pt-3" role="dialog" aria-label={t('Capas del mapa')}>
              <div className="sticky top-0 z-10 -mx-5 mb-2 flex items-center justify-between bg-surface px-5 py-2">
                <h2 className="display text-xl">{t('Capas del mapa')}</h2>
                <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost min-h-10 px-3 text-sm">
                  {t('Cerrar')}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4">{content}</div>
            </div>
          </div>,
          document.body,
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
    else showWhole(atlas);
  };

  // Los botones suben con suavidad cuando un panel les quita sitio, pero no al aparecer: en el
  // móvil nacían pegados abajo y subían 250 px hasta su sitio delante del usuario.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`float fixed right-3 z-30 flex flex-col divide-y divide-rule wide:right-8 ${settled ? 'transition-[bottom] duration-300' : ''}`}
      style={{ bottom: Math.max(16, pad.bottom + 12) }}
    >
      {/* En pantallas táctiles el zoom se hace pellizcando: solo queda la vuelta a la vista general. */}
      <span className="flex flex-col divide-y divide-rule pointer-coarse:hidden">
        <Control icon="plus" label={t('Acercar')} onClick={() => getEngine()?.zoomBy(0.6)} />
        <Control icon="minus" label={t('Alejar')} onClick={() => getEngine()?.zoomBy(1 / 0.6)} />
      </span>
      <Control icon="target" label={t('Vista general')} onClick={reset} />
      <LayersMenu />
      <ExportMenu />
    </div>
  );
}
