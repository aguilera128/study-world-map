import { levelLabel, levelOf } from '../game/population';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { formatCoords, formatTime } from '../app/format';
import { useApp, useMapDef } from '../app/store';
import type { Atlas } from '../atlas/atlas';
import type { ClimateKey, ContinentKey, Country } from '../atlas/types';
import { climateText } from '../game/climate';
import { inputOf, MAX_ATTEMPTS, modeDef, type GameConfig } from '../game/config';
import type { Outcome } from '../game/progress';
import { currentQuestion, type Question, type Session } from '../game/session';
import { hint } from '../game/text';
import { MODE_ICONS } from './modeIcons';
import { useElapsed, useLast, usePad } from './hooks';
import { Icon } from './Icon';
import { Flag } from './primitives';
import { t, LOCALE } from '../i18n';
import { tx } from '../i18n/tx';

const STAMP: Record<Outcome, { text: string; className: string }> = {
  first: { text: t('¡Bien!'), className: 'text-ok' },
  later: { text: t('Con ayuda'), className: 'text-help' },
  failed: { text: t('A repasar'), className: 'text-bad' },
};

/** Lo que se pregunta: un rótulo pequeño y, en grande, el dato que se da como pista. */
function Prompt({ config, country, resolved }: { config: GameConfig; country: Country; resolved: boolean }) {
  const { text } = useMapDef();
  const byMap = inputOf(config.answer) === 'map';
  let label: string;
  let main: ReactNode;
  switch (config.mode) {
    case 'locate':
      label = t('Busca en el mapa');
      main = country.name;
      break;
    case 'continent':
      label = t('¿En qué continente está?');
      main = country.name;
      break;
    case 'region':
      label = text.askRegion;
      main = country.name;
      break;
    case 'climate':
      label = t('¿Qué clima tiene?');
      main = country.name;
      break;
    case 'inhabitants':
      label = t('¿Cuál de estos países tiene más habitantes?');
      main = resolved ? country.name : <span className="text-ink-faint">¿…?</span>;
      break;
    case 'population':
      label = t('¿Su población es alta, media o baja?');
      main = country.name;
      break;
    case 'coords':
      // Las coordenadas son las del punto interior del país que se usa para rotularlo.
      label = t('¿Qué país hay en estas coordenadas?');
      main = (
        <span className="flex flex-wrap items-baseline gap-x-4">
          <span className="tabular">{formatCoords(country.anchor[0], country.anchor[1])}</span>
          {resolved && <span>{country.name}</span>}
        </span>
      );
      break;
    case 'name':
      label = text.askName;
      main = resolved ? country.name : <span className="text-ink-faint">¿…?</span>;
      break;
    case 'capital':
      label = byMap ? text.askCapitalOwner : t('¿Cuál es su capital?');
      main = byMap ? country.capital : country.name;
      break;
    case 'flag':
      label = t('¿De qué país es esta bandera?');
      main = (
        <span className="flex items-center gap-4">
          <Flag a2={country.a2} height={66} className="rounded-md" />
          {resolved && <span>{country.name}</span>}
        </span>
      );
      break;
  }
  return (
    <div className="mt-2.5">
      <p className="text-sm font-semibold text-ink-soft">{label}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={country.id + (resolved ? '!' : '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="display mt-0.5 text-[1.75rem] wide:text-[2.25rem]"
        >
          {main}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/** Frase con la solución, una vez resuelta la pregunta. */
function Solution({ atlas, config, country }: { atlas: Atlas; config: GameConfig; country: Country }) {
  const { text } = useMapDef();
  const strong = (content: ReactNode) => <strong className="text-ink">{content}</strong>;
  switch (config.mode) {
    case 'region':
      return <>{tx('{country}: {where}.', { country: country.name, where: strong(atlas.regions[country.regions[0]].name) })}</>;
    case 'continent':
      return (
        <>{tx('{country} está en {where}.', { country: country.name, where: strong(atlas.continents[country.continents[0]]) })}</>
      );
    case 'climate':
      return <>{tx('Clima de {country}: {climate}.', { country: country.name, climate: strong(climateText(country.climate)) })}</>;
    case 'inhabitants':
      return <>{tx('{country} tiene {n} habitantes.', { country: strong(country.name), n: (country.population ?? 0).toLocaleString(LOCALE) })}</>;
    case 'population': {
      const level = levelOf(country);
      return (
        <>
          {tx('{country}: {n} habitantes. Población {level}.', {
            country: country.name,
            n: (country.population ?? 0).toLocaleString(LOCALE),
            level: strong(level ? levelLabel(level).toLowerCase() : ''),
          })}
        </>
      );
    }
    case 'capital':
      return (
        <>
          {tx('La capital de {country} es {capital}{note}.', {
            country: country.name,
            capital: strong(country.capital),
            note: country.capitalNote ? ` (${country.capitalNote})` : '',
          })}
        </>
      );
    case 'flag':
      return <>{tx('Es la bandera de {country}.', { country: strong(country.name) })}</>;
    default:
      return (
        <>{tx(text.solution, { country: strong(country.name), region: country.regions.length ? atlas.regions[country.regions[0]].name : '' })}</>
      );
  }
}

function Options({ session, question, country }: { session: Session; question: Question; country: Country }) {
  const answer = useApp((s) => s.answer);
  const resolved = session.status === 'resolved';
  const isRight = (id: string, optionCountry: number) =>
    session.config.mode === 'continent'
      ? country.continents.includes(id as ContinentKey)
      : session.config.mode === 'climate'
        ? country.climate.includes(id as ClimateKey)
        : session.config.mode === 'region'
          ? country.regions.includes(id)
          : session.config.mode === 'population'
            ? levelOf(country) === id
          : optionCountry === question.country;
  return (
    <div className={`grid gap-2 ${question.options.length > 4 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
      {question.options.map((option, i) => {
        const wrong = session.wrong.includes(option.id);
        const right = resolved && isRight(option.id, option.country);
        return (
          <button
            key={option.id}
            type="button"
            disabled={resolved || wrong}
            onClick={() => answer({ kind: 'option', id: option.id })}
            className={`tile flex min-h-13 items-center gap-2.5 px-3 py-2 text-left font-bold leading-tight disabled:opacity-100 ${
              right
                ? 'border-ok! bg-ok! text-white!'
                : wrong
                  ? 'border-bad! bg-bad-soft! text-bad! line-through'
                  : resolved
                    ? 'opacity-55!'
                    : ''
            }`}
          >
            <span
              aria-hidden="true"
              className="tabular grid h-6 w-6 shrink-0 place-items-center rounded-md border border-current text-xs opacity-60"
            >
              {right ? <Icon name="check" size={14} /> : wrong ? <Icon name="close" size={14} /> : i + 1}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function TypeAnswer({ session, country }: { session: Session; country: Country }) {
  const answer = useApp((s) => s.answer);
  const { text: mapText } = useMapDef();
  const [text, setText] = useState('');
  const rowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expected = session.config.mode === 'capital' ? country.capital! : country.name;
  const resolved = session.status === 'resolved';

  useEffect(() => {
    setText('');
    inputRef.current?.focus({ preventScroll: true });
  }, [country.id, session.results.length]);

  // Un intento fallido sacude el campo y lo vacía para volver a probar.
  const wrongCount = session.wrong.length;
  useEffect(() => {
    if (wrongCount === 0) return;
    setText('');
    rowRef.current?.animate(
      [0, -7, 6, -4, 3, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 360, easing: 'ease-in-out' },
    );
  }, [wrongCount]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) answer({ kind: 'text', text });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div ref={rowRef} className="flex gap-2">
        <input
          ref={inputRef}
          value={resolved ? expected : text}
          onChange={(e) => setText(e.target.value)}
          disabled={resolved}
          placeholder={session.config.mode === 'capital' ? t('Escribe la capital…') : mapText.type}
          aria-label={t('Tu respuesta')}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="done"
          className="min-h-13 w-full min-w-0 rounded-[10px] border border-rule-strong bg-surface px-4 text-lg font-bold outline-none placeholder:font-normal placeholder:text-ink-faint focus:border-ink disabled:text-ink-soft"
        />
        <button type="submit" disabled={resolved || !text.trim()} className="btn btn-primary min-h-13 shrink-0">
          {t('Comprobar')}
        </button>
      </div>
      <p className="float mx-auto min-h-7 px-3 py-0.5 text-center text-sm text-ink-soft" style={{ visibility: !resolved && wrongCount > 0 ? 'visible' : 'hidden' }}>
        {t('Pista')}: <span className="tabular font-bold tracking-[0.12em] text-ink">{hint(expected, Math.max(1, wrongCount))}</span>
      </p>
    </form>
  );
}

/** Marcador y controles de una partida: la pregunta arriba y la forma de responder abajo. */
export function PlayHud() {
  const atlas = useApp((s) => s.atlas)!;
  const { text } = useMapDef();
  const session = useLast(useApp((s) => s.session))!;
  const answer = useApp((s) => s.answer);
  const next = useApp((s) => s.next);
  const go = useApp((s) => s.go);
  const [quitting, setQuitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  usePad(topRef, 'top');
  usePad(dockRef, 'bottom');

  // Al terminar la partida, mientras el marcador se retira, se queda con la última pregunta.
  const question = useLast(currentQuestion(session));
  const elapsed = useElapsed(session.startedAt, session.status !== 'finished');
  const input = inputOf(session.config.answer);
  const resolved = session.status === 'resolved';
  const failed = resolved && session.outcome === 'failed';

  // Teclado: números para las opciones, Intro para continuar, Escape para salir.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuitting((q) => !q);
        return;
      }
      if (e.target instanceof HTMLInputElement && e.key !== 'Enter') return;
      if (resolved && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        next();
        return;
      }
      if (!resolved && input === 'choice' && question && /^[1-9]$/.test(e.key)) {
        const option = question.options[Number(e.key) - 1];
        if (option) answer({ kind: 'option', id: option.id });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resolved, input, question, answer, next]);

  if (!question) return null;
  const country = atlas.countries[question.country];
  const mode = modeDef(session.config.mode, session.config.map);
  const attempts = MAX_ATTEMPTS[input];
  const position = Math.min(session.total, session.answered + (question.review || resolved ? 0 : 1));
  const stamp = resolved && session.outcome ? STAMP[session.outcome] : null;

  return (
    <>
      <motion.div
        ref={topRef}
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-16 z-30 w-[min(38rem,calc(100vw-1.5rem))] -translate-x-1/2 min-[80rem]:top-5"
      >
        <div className="cartouche overflow-hidden px-5 pb-4 pt-3.5">
          <div className="flex min-h-7 items-center justify-between gap-3">
            {quitting ? (
              <div className="flex w-full items-center justify-between gap-3">
                <span className="text-sm font-semibold">{t('¿Salir de la partida?')}</span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => go('home')} className="btn min-h-8 px-3 text-sm">
                    {t('Sí, salir')}
                  </button>
                  <button type="button" onClick={() => setQuitting(false)} className="btn btn-primary min-h-8 px-3 text-sm">
                    {t('Seguir')}
                  </button>
                </span>
              </div>
            ) : (
              <>
                <span className="label flex min-w-0 items-center gap-1.5">
                  <Icon name={MODE_ICONS[mode.id]} size={14} />
                  <span className="truncate">
                    {mode.title} · {session.scopeLabel}
                  </span>
                  {question.review && <span className="rounded bg-help-soft px-1.5 py-0.5 text-help">{t('Repaso')}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="label tabular">
                    {position} / {session.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuitting(true)}
                    className="btn btn-ghost -mr-2 min-h-7 gap-1 px-2 text-xs"
                    title={t('Salir de la partida (Esc)')}
                  >
                    <Icon name="close" size={14} />
                    {t('Salir')}
                  </button>
                </span>
              </>
            )}
          </div>

          <Prompt config={session.config} country={country} resolved={resolved} />

          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-ink-soft">
            <span className="min-w-0" aria-live="polite">
              {resolved ? (
                <Solution atlas={atlas} config={session.config} country={country} />
              ) : (
                <span className="flex items-center gap-1.5" title={t('Intentos: te quedan {n}', { n: attempts - session.wrong.length })}>
                  {Array.from({ length: attempts }, (_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                        i < session.wrong.length ? 'border-bad bg-bad' : 'border-rule-strong'
                      }`}
                    />
                  ))}
                  <span className="ml-1">{session.wrong.length ? t('Casi… prueba otra vez') : t('intentos')}</span>
                </span>
              )}
            </span>
            <span className="tabular flex shrink-0 items-center gap-3 font-semibold">
              {session.streak >= 2 && (
                <span className="flex items-center gap-1 text-accent" title={t('Aciertos seguidos a la primera')}>
                  <Icon name="flame" size={16} />
                  {session.streak}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Icon name="clock" size={15} />
                {formatTime(elapsed)}
              </span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1 bg-sunken">
            <div
              className="h-full bg-accent transition-[width] duration-500"
              style={{ width: `${(session.answered / session.total) * 100}%` }}
            />
          </div>
        </div>

        {stamp && (
          <div
            key={session.results.length}
            className={`stamp stamp-in absolute right-4 top-[3.1rem] bg-surface text-lg ${stamp.className}`}
            style={{ '--tilt': session.outcome === 'first' ? '7deg' : '-6deg' } as CSSProperties}
          >
            {stamp.text}
          </div>
        )}
      </motion.div>

      <motion.div
        ref={dockRef}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-4 left-1/2 z-30 flex w-[min(38rem,calc(100vw-1.5rem))] -translate-x-1/2 flex-col gap-2 wide:bottom-9"
      >
        {input === 'choice' && <Options session={session} question={question} country={country} />}
        {input === 'type' && <TypeAnswer session={session} country={country} />}

        {/* Altura fija: lo que aparece y desaparece aquí no debe mover el encuadre del mapa. */}
        <div className="flex min-h-12 items-center justify-center gap-3">
          {failed ? (
            <button type="button" onClick={next} autoFocus className="btn btn-primary min-h-12 px-6">
              {t('Siguiente')}
              <Icon name="arrow" size={18} />
            </button>
          ) : resolved ? null : (
            <>
              {input === 'map' && (
                <span className="float flex min-h-10 items-center gap-2 px-3.5 text-sm font-semibold">
                  <Icon name="pin" size={16} />
                  {text.tap}
                </span>
              )}
              <button
                type="button"
                onClick={() => answer({ kind: 'giveUp' })}
                className="float flex min-h-10 items-center gap-1.5 px-3.5 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <Icon name="help" size={16} />
                {t('No lo sé')}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
