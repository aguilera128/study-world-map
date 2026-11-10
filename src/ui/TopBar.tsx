import { PlanetButton } from './PlanetDialog';
import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../app/engineRef';
import { useApp, useSettings, type Screen } from '../app/store';
import { useTheme } from './hooks';
import { Icon, Logo, type IconName } from './Icon';
import { homeOf, lang, LANGS, t, type Lang } from '../i18n';

// Los rótulos de los botones aparecen algo más tarde que el resto del diseño ancho: con la marca
// delante no caben en una línea hasta los 64rem.
const LABELS = 'hidden min-[64rem]:inline';

function NavButton({ screen, icon, children }: { screen: Screen; icon: IconName; children: string }) {
  const current = useApp((s) => s.screen);
  const go = useApp((s) => s.go);
  const active = current === screen;
  return (
    <button
      type="button"
      onClick={() => go(active ? 'home' : screen)}
      aria-pressed={active}
      title={children}
      className={`btn btn-ghost min-h-10 px-2.5 text-sm ${active ? 'bg-ink! text-paper!' : ''}`}
    >
      <Icon name={icon} size={18} />
      <span className={LABELS}>{children}</span>
    </button>
  );
}

/** Selector de idioma: cada idioma es una dirección distinta, así que la lista son enlaces. */
function LangMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('Idioma')}
        aria-label={`${t('Idioma')}: ${LANGS[lang]}`}
        aria-expanded={open}
        className="btn btn-ghost min-h-10 px-2 text-sm font-bold uppercase tracking-wide"
      >
        {lang}
      </button>
      {open && (
        <nav aria-label={t('Idioma')} className="float absolute right-0 top-full mt-1.5 flex min-w-36 flex-col whitespace-nowrap bg-surface! p-1">
          {(Object.keys(LANGS) as Lang[]).map((id) => (
            <a
              key={id}
              href={homeOf(id)}
              hrefLang={id}
              lang={id}
              aria-current={id === lang ? 'true' : undefined}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold no-underline hover:bg-[rgb(var(--shadow)/0.08)] ${id === lang ? 'text-accent' : 'text-ink'}`}
            >
              {LANGS[id]}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}

/** Cabecera: marca, navegación y los conmutadores globales (tiempo real, vista 3D/2D y tema). */
export function TopBar() {
  const screen = useApp((s) => s.screen);
  const go = useApp((s) => s.go);
  const viewMode = useSettings((s) => s.viewMode);
  const setViewMode = useSettings((s) => s.setViewMode);
  const setTheme = useSettings((s) => s.setTheme);
  const realTime = useSettings((s) => s.realTime);
  const toggleRealTime = useApp((s) => s.toggleRealTime);
  const theme = useTheme();
  const playing = screen === 'play';
  // Durante la partida los botones se quedan en solo icono para dejar sitio al marcador.
  const labels = playing ? 'sr-only' : LABELS;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-2 px-3 py-3 wide:px-8 wide:py-5">
      {/* Durante la partida la marca no navega: se sale con el botón «Salir» del marcador. */}
      <button
        type="button"
        disabled={playing}
        onClick={() => go('home')}
        className="pointer-events-auto flex items-center gap-2.5 rounded-lg pr-2 text-ink"
        aria-label={t('Study World Map: volver al inicio')}
      >
        <Logo />
        <span className={`display text-[1.35rem] ${playing ? 'hidden wide:inline' : 'hidden sm:inline'}`}>Study World Map</span>
      </button>

      <div className="pointer-events-auto flex items-center gap-1 wide:gap-2">
        {!playing && (
          <nav className="flex items-center gap-0.5" aria-label={t('Secciones')}>
            <NavButton screen="explore" icon="compass">
              {t('Explorar')}
            </NavButton>
            <NavButton screen="progress" icon="chart">
              {t('Progreso')}
            </NavButton>
            <PlanetButton labels={labels} />
          </nav>
        )}

        <button
          type="button"
          onClick={toggleRealTime}
          aria-pressed={realTime}
          title={t('Tiempo real: dónde es de día y dónde de noche ahora mismo')}
          aria-label={t('Tiempo real')}
          className={`btn btn-ghost min-h-10 px-2.5 text-sm ${realTime ? 'bg-ink! text-paper!' : ''}`}
        >
          <Icon name="daynight" size={18} />
          <span className={labels}>{t('Tiempo real')}</span>
        </button>

        <div role="radiogroup" aria-label={t('Vista del mapa')} className="float flex p-0.5">
          {(
            [
              ['globe', 'globe', t('Globo 3D')],
              ['flat', 'map', t('Mapa 2D')],
            ] as const
          ).map(([mode, icon, label]) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={viewMode === mode}
              title={label}
              onClick={() => {
                setViewMode(mode);
                getEngine()?.invalidate();
              }}
              className={`flex min-h-9 items-center gap-1.5 rounded-[9px] px-2.5 text-sm font-bold transition-colors ${
                viewMode === mode ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon name={icon} size={18} />
              <span className={labels}>{label}</span>
            </button>
          ))}
        </div>

        {!playing && <LangMenu />}
        <button
          type="button"
          onClick={() => setTheme(theme === 'night' ? 'paper' : 'night')}
          title={theme === 'night' ? t('Cambiar a tema claro') : t('Cambiar a tema oscuro')}
          aria-label={theme === 'night' ? t('Cambiar a tema claro') : t('Cambiar a tema oscuro')}
          className="btn btn-ghost btn-icon min-h-10 w-10"
        >
          <Icon name={theme === 'night' ? 'sun' : 'moon'} size={19} />
        </button>
      </div>
    </header>
  );
}
