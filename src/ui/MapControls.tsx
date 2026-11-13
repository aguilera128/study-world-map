import { DENSITY_LABELS } from '../game/population';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getEngine } from '../app/engineRef';
import { LAYERS, offInGame, showWhole, useApp, useSettings, type LayerId } from '../app/store';
import { useWeatherInfo } from '../app/weather';
import { useSatelliteInfo } from '../app/satellites';
import { SAT_COLORS, SAT_GROUPS, type SatGroup } from '../satellites/format';
import { PALETTES, Style } from '../engine/palette';
import { CLIMATE_KEYS, climateLabel } from '../game/climate';
import { resolveScope } from '../game/config';
import { useTheme, useWide } from './hooks';
import { ExportMenu } from './ExportMenu';
import { Icon, type IconName } from './Icon';
import { LayerIcon, PortalIcon } from './LayerIcon';
import { LOCALE, t } from '../i18n';
import { TEMP_STOPS } from '../weather/format';

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
  { title: t('Meteorología'), ids: ['weatherTemp', 'weatherCloud', 'weatherRain', 'weatherWind'] },
  { title: t('Espacio'), ids: ['satellites'] },
  { title: t('Líneas'), ids: ['grid', 'guides'] },
  { title: t('Aspecto'), ids: ['satellite', 'glint', 'stars'] },
];
const REAL_TIME_LAYERS: LayerId[] = ['dayNight', 'sun', 'moon', 'you'];

/** «jue, 19:00»: la hora local de un dato del tiempo, con el día por si es de ayer. */
const weatherTime = (iso: string) => new Date(iso).toLocaleString(LOCALE, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
const TEMP_FROM = TEMP_STOPS[0][0];
const TEMP_TO = TEMP_STOPS[TEMP_STOPS.length - 1][0];
/** La escala de temperatura, con los mismos colores y en los mismos puntos que el mapa. */
const TEMP_GRADIENT = `linear-gradient(to right, ${TEMP_STOPS.map(([celsius, color]) => `${color} ${((celsius - TEMP_FROM) / (TEMP_TO - TEMP_FROM)) * 100}%`).join(', ')})`;

/** Leyenda de las capas del tiempo de ahora: la escala, de dónde sale cada dato y de qué hora es. */
function WeatherLegend({ model, rain, temp }: { model: boolean; rain: boolean; temp: boolean }) {
  const info = useWeatherInfo();
  const waiting = (model && !info.model) || (rain && !info.rain);
  return (
    <div className="flex flex-col gap-1.5 text-xs text-ink-faint">
      {temp && info.model && (
        <div className="font-semibold text-ink-soft" aria-hidden="true">
          <div className="h-2.5 rounded-[3px] border border-rule-strong" style={{ background: TEMP_GRADIENT }} />
          <div className="tabular mt-0.5 flex justify-between">
            {[TEMP_FROM, -20, 0, 20, TEMP_TO].map((celsius) => (
              <span key={celsius}>{celsius} °C</span>
            ))}
          </div>
        </div>
      )}
      {model && info.model && <p>{t('Temperatura, nubes y viento: modelo GFS (NOAA), previsión para {time}.', { time: weatherTime(info.model) })}</p>}
      {rain && info.rain && <p>{t('Lluvia y nieve: satélites GPM (NASA), medido {time}. Verde, débil; rojo, fuerte; azul, nieve.', { time: weatherTime(info.rain) })}</p>}
      {waiting && <p role="status">{info.failed ? t('No se ha podido cargar el tiempo de ahora.') : t('Cargando el tiempo de ahora…')}</p>}
    </div>
  );
}

const SAT_NAMES: Record<SatGroup, string> = {
  estaciones: t('Estaciones espaciales'),
  navegacion: t('Navegación (GPS y Galileo)'),
  meteorologicos: t('Meteorológicos'),
  starlink: t('Starlink'),
};

/** Leyenda de la capa de satélites: cuántos hay, de dónde salen sus órbitas y de cuándo son. */
function SatelliteLegend() {
  const info = useSatelliteInfo();
  const flat = useSettings((s) => s.viewMode === 'flat');
  const total = Object.values(info.counts).reduce((a, b) => a + b, 0);
  return (
    <div className="flex flex-col gap-1.5 text-xs text-ink-faint">
      {info.fetched && (
        <p>
          {t('{n} satélites, en su posición de ahora. Órbitas: CelesTrak, datos de {time}.', { n: total.toLocaleString(LOCALE), time: weatherTime(info.fetched) })}
        </p>
      )}
      {info.fetched && info.beyond > 0 && <p>{t('Los geoestacionarios, a 36 000 km, no caben en la vista y no se dibujan.')}</p>}
      {flat && <p>{t('Los satélites solo se ven en el globo.')}</p>}
      {!info.fetched && !flat && <p role="status">{info.failed ? t('No se han podido cargar los satélites.') : t('Cargando los satélites…')}</p>}
    </div>
  );
}

/** Botón de capas: qué se dibuja sobre el mapa. */
function LayersMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const wide = useWide();
  const layers = useSettings((s) => s.layers);
  const setLayer = useSettings((s) => s.setLayer);
  const resetLayers = useSettings((s) => s.resetLayers);
  const satGroups = useSettings((s) => s.satGroups);
  const setSatGroup = useSettings((s) => s.setSatGroup);
  // Durante una partida hay capas que se apartan: su interruptor se ve apagado y no se puede tocar.
  const playing = useApp((s) => s.screen === 'play' || s.screen === 'results');
  const map = useApp((s) => s.atlas?.map ?? 'world');
  const parked = (id: LayerId) => playing && offInGame(map).includes(id);
  const realTime = useSettings((s) => s.realTime);
  const theme = useTheme();
  const toon = useApp((s) => s.toon);
  const toggleToon = useApp((s) => s.toggleToon);

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

  // Interruptor: toda la fila se pulsa y mide 44 px de alto, para el dedo. Sigue siendo una casilla
  // nativa (con teclado y lector de pantalla), solo que dibujada como interruptor.
  const row = (key: string, icon: ReactNode, label: string, on: boolean, change: (on: boolean) => void, off = false) => (
        <label key={key} className={`flex min-h-11 items-center gap-2.5 text-sm ${off ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'}`}>
          {icon}
          <span className="flex-1">{label}</span>
          <input type="checkbox" role="switch" checked={on} disabled={off} onChange={(e) => change(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden="true"
            className="relative h-6 w-10 shrink-0 rounded-full border border-rule-strong bg-paper transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[1.125rem] after:w-[1.125rem] after:rounded-full after:bg-ink-faint after:transition-transform peer-checked:border-transparent peer-checked:bg-(--accent) peer-checked:after:translate-x-4 peer-checked:after:bg-(--on-accent) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)"
          />
        </label>
  );
  const group = (title: string, ids: LayerId[], extra?: ReactNode) => (
    <fieldset>
      <legend className="label mb-1">{title}</legend>
      {ids.map((id) =>
        // El icono se entinta al encender la capa; el estado lo sigue diciendo el interruptor.
        row(id, <LayerIcon id={id} className={`shrink-0 transition-colors ${layers[id] && !parked(id) ? 'text-ink' : 'text-ink-faint'}`} />, LAYERS[id], layers[id] && !parked(id), (on) => setLayer(id, on), parked(id)),
      )}
      {extra}
    </fieldset>
  );
  // El planeta de dibujos (el huevo de pascua, que también sale con cinco toques en «Globo 3D») no es
  // una capa: cambia el aspecto de todo el mapa y no se guarda. Va con las de aspecto.
  const toonRow = row('toon', <PortalIcon className={`shrink-0 transition-[filter,opacity] ${toon ? '' : 'opacity-70 saturate-50'}`} />, t('Planeta de dibujos'), toon, (on) => on !== toon && toggleToon());

  // Durante una partida las capas del tiempo están apartadas: tampoco se enseña su leyenda.
  const weatherModel = (['weatherTemp', 'weatherCloud', 'weatherWind'] as const).some((id) => layers[id] && !parked(id));
  const weatherRain = layers.weatherRain && !parked('weatherRain');
  const weatherLegend = (weatherModel || weatherRain) && <WeatherLegend model={weatherModel} rain={weatherRain} temp={layers.weatherTemp && !parked('weatherTemp')} />;
  // Con la capa de satélites encendida, un interruptor por grupo, con su color.
  const satelliteLegend = layers.satellites && !parked('satellites') && (
    <div className="pl-3">
      {SAT_GROUPS.map((g) =>
        row(`sat-${g}`, <span aria-hidden="true" className="mx-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SAT_COLORS[g] }} />, SAT_NAMES[g], satGroups[g], (on) => setSatGroup(g, on)),
      )}
      <SatelliteLegend />
    </div>
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
      {layers.satellite && <p className="text-xs text-ink-faint">{t('Imagen: Blue Marble (NASA).')}</p>}
    </>
  );
  const content = (
    <>
      {playing && <p className="text-xs text-ink-faint">{t('Durante la partida algunas capas se apartan para que el mapa se lea mejor. Al terminar vuelven como estaban.')}</p>}
      {LAYER_GROUPS.map((g, i) => (
        // La leyenda del tiempo va con sus interruptores: dice de qué hora es lo que se acaba de encender.
        <div key={g.title}>{group(g.title, g.ids, i === LAYER_GROUPS.length - 1 ? toonRow : g.ids.includes('weatherTemp') ? weatherLegend : g.ids.includes('satellites') ? satelliteLegend : undefined)}</div>
      ))}
      {legends}
      {realTime ? (
        group(t('Tiempo real'), REAL_TIME_LAYERS)
      ) : (
        <p className="text-xs text-ink-faint">{t('Activa «Tiempo real» para ver el día y la noche, el Sol y la Luna.')}</p>
      )}
      <button type="button" onClick={resetLayers} className="btn btn-ghost min-h-10 justify-center gap-1.5 text-sm">
        <Icon name="replay" size={15} />
        {t('Restablecer capas')}
      </button>
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
        // La tarjeta no se desplaza: lo hace una caja interior, separada del borde. Así la barra de
        // desplazamiento no pisa el borde ni las esquinas redondeadas.
        <div className="float absolute bottom-0 right-12 w-[17rem] bg-surface! py-2 pr-1" role="group" aria-label={t('Capas del mapa')}>
          <div
            // Con el tiempo real encendido, su tarjeta ocupa la esquina de arriba: el menú acaba antes de llegar a ella.
            className={`thin-scroll flex flex-col gap-3 overflow-y-auto py-1 pl-3.5 pr-2.5 ${realTime ? 'max-h-[calc(100dvh-21.5rem)]' : 'max-h-[calc(100dvh-10rem)]'}`}
          >
            {content}
          </div>
        </div>
      )}
      {open &&
        !wide &&
        // En el móvil, una hoja que sube desde abajo: caben todas las capas con interruptores grandes.
        // Va en <body> porque los controles del mapa se mueven con `transform` y la sacarían de sitio.
        createPortal(
          <div ref={sheetRef} className="fixed inset-0 z-50 flex flex-col justify-end">
            <button type="button" aria-label={t('Cerrar')} onClick={() => setOpen(false)} className="absolute inset-0 bg-[rgb(var(--shadow)/0.45)]" />
            <div className="thin-scroll relative max-h-[78dvh] overflow-y-auto overscroll-contain rounded-t-[20px] border-t border-rule-strong bg-surface px-5 pb-6 pt-3" role="dialog" aria-label={t('Capas del mapa')}>
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

  // En la portada y con pantalla ancha, el enlace para apoyar el proyecto va en la esquina, bajo los
  // controles (en el móvil esa esquina es de la hoja inferior y el enlace se queda en el panel).
  const donate = useWide() && screen === 'home';

  return (
    <>
      <div
        // Por encima de la tarjeta de la hora (z-30): si el menú de capas llega hasta ella, la tapa él.
        className={`float fixed right-3 z-[31] flex flex-col divide-y divide-rule wide:right-8 ${settled ? 'transition-[bottom] duration-300' : ''}`}
        style={{ bottom: Math.max(donate ? 44 : 16, pad.bottom + 12) }}
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
      {donate && (
        <a href="/donar/" className="fixed bottom-3 right-8 z-30 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-soft transition-colors hover:text-accent">
          <Icon name="heart" size={15} />
          {t('Gratis y sin anuncios. ¿Te ayuda? Apoya el proyecto')}
        </a>
      )}
    </>
  );
}
