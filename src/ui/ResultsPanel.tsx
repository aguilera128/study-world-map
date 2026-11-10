import type { CSSProperties } from 'react';
import { getEngine } from '../app/engineRef';
import { formatGrade, formatTime, plural } from '../app/format';
import { useApp } from '../app/store';
import type { Country } from '../atlas/types';
import { modeDef, type GameConfig } from '../game/config';
import type { Outcome } from '../game/progress';
import { gradeLabel, missed, score } from '../game/session';
import { useLast } from './hooks';
import { Icon } from './Icon';
import { Flag, Panel } from './primitives';
import { t } from '../i18n';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

const TONE: Record<Outcome, string> = { first: 'bg-ok', later: 'bg-help', failed: 'bg-bad' };

/** Lo que había que saber de un país en este reto, para la lista de repaso. */
function answerFor(country: Country, config: GameConfig, continents: Record<string, string>): string | null {
  if (config.mode === 'capital') return country.capital ?? null;
  if (config.mode === 'continent') return continents[country.continents[0]];
  return null;
}

function Tile({ value, label, tone }: { value: number | string; label: string; tone?: string }) {
  return (
    <div className="flex-1 rounded-[10px] border border-rule-strong bg-surface px-3 py-2.5">
      <div className="display tabular flex items-center gap-2 text-2xl">
        {tone && <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />}
        {value}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-ink-soft">{label}</div>
    </div>
  );
}

/** Final de la partida: nota, resumen y los países que conviene repasar. */
export function ResultsPanel() {
  const atlas = useApp((s) => s.atlas)!;
  const session = useLast(useApp((s) => s.session))!;
  const newBest = useApp((s) => s.newBest);
  const reviewOnly = useApp((s) => s.reviewOnly);
  const start = useApp((s) => s.start);
  const go = useApp((s) => s.go);

  const result = score(session);
  const toReview = missed(session);
  const mode = modeDef(session.config.mode);
  const perfect = result.first === result.total;

  return (
    <Panel label={t('Resultado')}>
      <p className="label" style={order(0)}>
        {reviewOnly ? t('Repaso') : t('Resultado')} · {mode.title} · {session.scopeLabel}
      </p>

      <div className="mt-5 flex items-center gap-5" style={order(1)}>
        <div
          className={`stamp stamp-in flex-col gap-0! px-5! py-3! ${result.grade >= 5 ? 'text-ok' : 'text-bad'}`}
          style={{ '--tilt': '-5deg', animationDelay: '0.45s' } as CSSProperties}
        >
          <span className="tabular text-[3.25rem] leading-none tracking-normal">{formatGrade(result.grade)}</span>
          <span className="text-sm">{gradeLabel(result.grade)}</span>
        </div>
        <div className="min-w-0">
          <h1 className="display text-[1.75rem]">
            {perfect ? t('¡Pleno!') : result.grade >= 7 ? t('¡Muy bien!') : result.grade >= 5 ? t('Vas por buen camino') : t('Toca repasar')}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {perfect
              ? t('Has acertado todo a la primera.')
              : t('Has acertado a la primera {n} de {total}.', { n: result.first, total: plural(result.total, t('pregunta'), t('preguntas')) })}
          </p>
          {newBest && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-highlight px-2 py-0.5 text-sm font-bold text-[#1b2a3a]">
              <Icon name="star" size={15} />
              {t('Nueva mejor marca')}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-2" style={order(2)}>
        <Tile value={result.first} label={t('A la primera')} tone={TONE.first} />
        <Tile value={result.later} label={t('Con ayuda')} tone={TONE.later} />
        <Tile value={result.failed} label={t('Sin acertar')} tone={TONE.failed} />
      </div>
      <div className="mt-2 flex gap-2" style={order(3)}>
        <Tile value={formatTime(result.ms)} label={t('Tiempo')} />
        <Tile value={result.bestStreak} label={t('Mejor racha')} />
      </div>

      {toReview.length > 0 && (
        <section className="mt-6" style={order(4)}>
          <h2 className="label mb-2">
            {t('Para repasar')} · {toReview.length}
          </h2>
          <ul className="thin-scroll -mx-1 max-h-56 overflow-y-auto px-1">
            {toReview.map((index) => {
              const country = atlas.countries[index];
              const extra = answerFor(country, session.config, atlas.continents);
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => getEngine()?.frameCountry(index)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-[rgb(var(--shadow)/0.07)]"
                    title={t('Ver en el mapa')}
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${TONE[session.marks[index] ?? 'failed']}`} />
                    <Flag a2={country.a2} height={18} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{country.name}</span>
                    {extra && <span className="shrink-0 text-sm text-ink-soft">{extra}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-7 flex flex-wrap gap-2.5" style={order(5)}>
        {toReview.length > 0 && (
          <button type="button" onClick={() => start(toReview)} className="btn btn-accent min-h-12 px-5">
            <Icon name="replay" size={18} />
            {t('Repasar {n}', { n: plural(toReview.length, t('fallo'), t('fallos')) })}
          </button>
        )}
        <button type="button" onClick={() => start()} className={`btn min-h-12 px-5 ${toReview.length ? '' : 'btn-accent'}`}>
          {t('Otra partida')}
        </button>
        <button type="button" onClick={() => go('home')} className="btn btn-ghost min-h-12 px-4">
          {t('Cambiar de reto')}
        </button>
      </div>
    </Panel>
  );
}
