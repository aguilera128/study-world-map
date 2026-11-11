import { PlanetButton } from './PlanetDialog';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getEngine } from '../app/engineRef';
import { useApp, useSettings, type Screen, useMapDef } from '../app/store';
import { useTheme, useWide } from './hooks';
import { Icon, Logo, type IconName } from './Icon';
import { homeOf, lang, LANGS, t, type Lang } from '../i18n';

// Los rótulos de los botones aparecen algo más tarde que el resto del diseño ancho, y no todos a la
// vez: con la marca delante no cabe ninguno hasta los 64rem, y todos juntos, hasta los 80. Entran por
// orden de falta que hacen: primero los de las secciones, luego «Tiempo real» y al final los de la
// vista (el globo y el mapa se entienden solos). Las medidas están tomadas con el idioma más largo.
const LABELS = 'hidden min-[64rem]:inline';
const WHEN = {
  realTime: ['hidden min-[72rem]:inline', 'min-[72rem]:w-auto min-[72rem]:px-[1.1rem]!'],
  view: ['hidden min-[80rem]:inline', 'min-[80rem]:w-auto min-[80rem]:px-2.5'],
} as const;

/** Quien elige idioma a mano ya sabe que hay varios: no hace falta el aviso de la portada. */
const langChosen = () => useSettings.getState().dismissLangHint();

function NavButton({ screen, icon, children, late = false }: { screen: Screen; icon: IconName; children: string; late?: boolean }) {
  const current = useApp((s) => s.screen);
  const go = useApp((s) => s.go);
  const active = current === screen;
  return (
    <button
      type="button"
      onClick={() => go(active ? 'home' : screen)}
      aria-pressed={active}
      title={children}
      // «late»: el botón se queda en icono hasta que la cabecera tiene sitio de sobra para su rótulo.
      className={`btn btn-ghost min-h-10! w-10 px-0! text-sm ${late ? 'min-[100rem]:w-auto min-[100rem]:px-[1.1rem]!' : 'min-[64rem]:w-auto min-[64rem]:px-[1.1rem]!'} ${active ? 'bg-ink! text-paper!' : ''}`}
    >
      <Icon name={icon} size={19} />
      <span className={late ? 'hidden min-[100rem]:inline' : LABELS}>{children}</span>
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
              onClick={langChosen}
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
  // Huevo de pascua: cinco clics seguidos en «Globo 3D» cambian el planeta y el espacio (ToonSky).
  const toggleToon = useApp((s) => s.toggleToon);
  const globeClicks = useRef<number[]>([]);
  const countGlobeClick = () => {
    const now = performance.now();
    globeClicks.current = [...globeClicks.current.filter((at) => now - at < 2500), now];
    if (globeClicks.current.length >= 5) {
      globeClicks.current = [];
      toggleToon();
    }
  };
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
        className="pointer-events-auto flex shrink-0 items-center gap-2.5 rounded-lg pr-2 text-ink"
        aria-label={t('Study World Map: volver al inicio')}
      >
        <Logo />
        {/* Con prioridad: «display» reparte el texto en líneas parejas y deshacía el «no partir». */}
        <span className={`display whitespace-nowrap! text-[1.35rem] ${playing ? 'hidden wide:inline' : 'hidden sm:inline'}`}>Study World Map</span>
        {/* Qué mapa es y cuánto tiene, en dos líneas junto a la marca: así no ocupa una línea del panel. */}
        {/* Solo desde 92 rem: antes no cabe con los botones en los idiomas de rótulos largos (euskera, alemán) y */}
        {/* el panel ya no lo enseña, así que en esa franja no sale. */}
        {wide && !playing && tagline.length > 0 && (
          <span className="label ml-1 hidden border-l border-rule-strong pl-3 text-left leading-[1.35] min-[92rem]:block">
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
            {/* En el móvil no cabe otro botón: el ranking va en el menú. */}
            {wide && (
              <NavButton screen="ranking" icon="trophy" late>
                {t('Ranking')}
              </NavButton>
            )}
            {wide && <PlanetButton labels={labels} />}
          </nav>
        )}

        <button
          type="button"
          onClick={toggleRealTime}
          aria-pressed={realTime}
          title={t('Tiempo real: dónde es de día y dónde de noche ahora mismo')}
          aria-label={t('Tiempo real')}
          className={`btn btn-ghost min-h-10! w-10 px-0! text-sm ${WHEN.realTime[1]} ${realTime ? 'bg-ink! text-paper!' : ''}`}
        >
          <Icon name="daynight" size={19} />
          <span className={playing ? 'sr-only' : WHEN.realTime[0]}>{t('Tiempo real')}</span>
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
                if (mode === 'globe') countGlobeClick();
              }}
              className={`flex h-9 w-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] text-sm font-bold transition-colors ${WHEN.view[1]} ${
                viewMode === mode ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              <Icon name={icon} size={19} />
              <span className={playing ? 'sr-only' : WHEN.view[0]}>{label}</span>
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
            {!playing && (
              <button type="button" onClick={() => go('ranking')} className="btn btn-ghost min-h-11 justify-start px-2.5 text-sm">
                <Icon name="trophy" size={18} />
                {t('Ranking')}
              </button>
            )}
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
                    onClick={langChosen}
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
