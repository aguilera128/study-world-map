import { PlanetButton } from './PlanetDialog';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getEngine } from '../app/engineRef';
import { useApp, useSettings, type Screen, useMapDef } from '../app/store';
import { useTheme, useWide } from './hooks';
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
      className={`btn btn-ghost min-h-10! w-10 px-0! text-sm min-[64rem]:w-auto min-[64rem]:px-[1.1rem]! ${active ? 'bg-ink! text-paper!' : ''}`}
    >
      <Icon name={icon} size={19} />
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

/** Menú «más» de la barra en el móvil. Su contenido sigue montado al cerrarse (solo se oculta). */
function MoreMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
      <button type="button" onClick={() => setOpen(!open)} title={t('Más opciones')} aria-label={t('Más opciones')} aria-expanded={open} className="btn btn-ghost min-h-10! w-10 px-0!">
        <Icon name="list" size={19} />
      </button>
      <div className={`float absolute right-0 top-full mt-1.5 w-60 flex-col gap-1 bg-surface! p-2 ${open ? 'flex' : 'hidden'}`} onClick={() => setOpen(false)}>
        {children}
      </div>
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

  const wide = useWide();
  const atlas = useApp((s) => s.atlas);
  const def = useMapDef();
  const tagline = atlas ? t(def.text.count, { n: atlas.quizzable.length }).split(/\s*·\s*/) : [];
  const toggleTheme = () => setTheme(theme === 'night' ? 'paper' : 'night');
  const themeButton = (
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'night' ? t('Cambiar a tema claro') : t('Cambiar a tema oscuro')}
          aria-label={theme === 'night' ? t('Cambiar a tema claro') : t('Cambiar a tema oscuro')}
          className="btn btn-ghost min-h-10! w-10 px-0!"
        >
          <Icon name={theme === 'night' ? 'sun' : 'moon'} size={19} />
        </button>
  );

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
        <span className={`display whitespace-nowrap text-[1.35rem] ${playing ? 'hidden wide:inline' : 'hidden sm:inline'}`}>Study World Map</span>
        {/* Qué mapa es y cuánto tiene, en dos líneas junto a la marca: así no ocupa una línea del panel. */}
        {wide && !playing && tagline.length > 0 && (
          <span className="label ml-1 hidden border-l border-rule-strong pl-3 text-left leading-[1.35] min-[82rem]:block">
            {tagline.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </span>
        )}
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
            {wide && <PlanetButton labels={labels} />}
          </nav>
        )}

        <button
          type="button"
          onClick={toggleRealTime}
          aria-pressed={realTime}
          title={t('Tiempo real: dónde es de día y dónde de noche ahora mismo')}
          aria-label={t('Tiempo real')}
          className={`btn btn-ghost min-h-10! w-10 px-0! text-sm min-[64rem]:w-auto min-[64rem]:px-[1.1rem]! ${realTime ? 'bg-ink! text-paper!' : ''}`}
        >
          <Icon name="daynight" size={19} />
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
              className={`flex h-9 w-9 items-center justify-center gap-1.5 rounded-[9px] text-sm font-bold transition-colors min-[64rem]:w-auto min-[64rem]:px-2.5 ${
                viewMode === mode ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon name={icon} size={19} />
              <span className={labels}>{label}</span>
            </button>
          ))}
        </div>

        {wide ? (
          <>
            {!playing && <LangMenu />}
            {themeButton}
          </>
        ) : (
          // En el móvil no cabe todo: el planeta, el idioma y el tema van en un menú.
          <MoreMenu>
            {!playing && <PlanetButton labels="" />}
            <button type="button" onClick={toggleTheme} className="btn btn-ghost min-h-11 justify-start px-2.5 text-sm">
              <Icon name={theme === 'night' ? 'sun' : 'moon'} size={18} />
              {theme === 'night' ? t('Cambiar a tema claro') : t('Cambiar a tema oscuro')}
            </button>
            {!playing && (
              <nav aria-label={t('Idioma')} className="grid grid-cols-5 gap-1 border-t border-rule pt-2">
                {(Object.keys(LANGS) as Lang[]).map((id) => (
                  <a
                    key={id}
                    href={homeOf(id)}
                    hrefLang={id}
                    lang={id}
                    title={LANGS[id]}
                    aria-current={id === lang ? 'true' : undefined}
                    className={`grid min-h-11 place-items-center rounded-lg text-sm font-bold uppercase no-underline ${id === lang ? 'bg-ink text-paper' : 'text-ink'}`}
                  >
                    {id}
                  </a>
                ))}
              </nav>
            )}
          </MoreMenu>
        )}
      </div>
    </header>
  );
}
