import { useMemo, type CSSProperties } from 'react';
import { formatGrade, plural } from '../app/format';
import { bestFor, useApp, useProgress, useSettings } from '../app/store';
import { answerLabel, modeDef, MODES, resolveScope } from '../game/config';
import { summarize } from '../game/progress';
import { Icon } from './Icon';
import { ANSWER_ICONS, MODE_ICONS } from './modeIcons';
import { Panel, Segmented, Step } from './primitives';
import { ScopeChips } from './ScopeChips';
import { t } from '../i18n';
import { tx } from '../i18n/tx';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

/** Pantalla de inicio: se elige el reto, qué países entran y cuántas preguntas. */
export function HomePanel() {
  const atlas = useApp((s) => s.atlas)!;
  const start = useApp((s) => s.start);
  const go = useApp((s) => s.go);
  const config = useSettings((s) => s.config);
  const lists = useSettings((s) => s.lists);
  const setConfig = useSettings((s) => s.setConfig);
  const progress = useProgress((s) => s.progress);
  const bests = useProgress((s) => s.bests);

  const mode = modeDef(config.mode);
  const scope = useMemo(() => resolveScope(atlas, config.scope, lists), [atlas, config.scope, lists]);
  const summary = useMemo(
    () =>
      summarize(
        progress,
        scope.countries.map((i) => atlas.countries[i].id),
        config.mode,
      ),
    [progress, scope, atlas, config.mode],
  );
  const total = scope.countries.length;
  const questions = config.length === 'all' ? total : Math.min(config.length, total);
  const best = bestFor(bests, config);

  return (
    <Panel label={t('Elegir partida')}>
      <p className="label" style={order(0)}>
        {t('Atlas interactivo · {n} países', { n: atlas.quizzable.length })}
      </p>
      <h1 className="display mt-2.5 text-[clamp(1.6rem,8vw,2.1rem)] wide:text-[clamp(1.9rem,4.4vh,2.3rem)]" style={order(1)}>
        <span className="block whitespace-nowrap">{t('Aprende el mundo,')}</span>
        <em className="block whitespace-nowrap font-semibold text-accent">{t('país a país.')}</em>
      </h1>
      <p className="mt-2.5 max-w-[26rem] text-ink-soft" style={order(2)}>
        {t('Elige un reto, responde sobre el mapa y repasa lo que falles hasta que te lo sepas.')}
      </p>

      <section className="mt-5" style={order(3)}>
        <Step n={1}>{t('Reto')}</Step>
        <div role="radiogroup" aria-label={t('Reto')} className="grid grid-cols-2 gap-1.5 min-[26rem]:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === config.mode}
              onClick={() => setConfig({ mode: m.id })}
              className="tile flex min-w-0 items-center gap-1.5 px-2 py-2 text-left"
            >
              <Icon name={MODE_ICONS[m.id]} size={16} className="shrink-0" />
              <span className="truncate text-[0.8125rem] font-bold leading-tight">{m.title}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => go('explore')}
            className="tile flex min-w-0 items-center gap-1.5 border-dashed px-2 py-2 text-left text-ink-soft"
          >
            <Icon name="compass" size={16} className="shrink-0" />
            <span className="truncate text-[0.8125rem] font-bold leading-tight">{t('Explorar')}</span>
          </button>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{mode.summary}</p>
        {mode.answers.length > 1 && (
          <Segmented
            label={t('Cómo responder')}
            value={config.answer}
            onChange={(answer) => setConfig({ answer })}
            options={mode.answers.map((a) => ({
              value: a,
              label: (
                <>
                  <Icon name={ANSWER_ICONS[a]} size={16} />
                  {answerLabel(mode.id, a)}
                </>
              ),
            }))}
          />
        )}
      </section>

      <section className="mt-4" style={order(4)}>
        <Step n={2}>{t('Países')}</Step>
        <ScopeChips value={config.scope} onChange={(scope) => setConfig({ scope })}>
          <button
            type="button"
            onClick={() => go('lists')}
            className="tile flex min-h-9 items-center gap-1.5 border-dashed px-3 text-sm font-semibold text-ink-soft"
          >
            <Icon name="pencil" size={15} />
            {t('Elegir países')}
          </button>
        </ScopeChips>
      </section>

      <section className="mt-4" style={order(5)}>
        <Step n={3}>{t('Preguntas')}</Step>
        <Segmented
          label={t('Número de preguntas')}
          value={config.length}
          onChange={(length) => setConfig({ length })}
          options={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 'all', label: t('Todos ({n})', { n: total }) },
          ]}
        />
      </section>

      {/* En el móvil el botón de empezar se queda pegado al borde de la hoja, siempre a mano. */}
      <div
        className="sticky bottom-0 z-10 -mx-5 mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule bg-surface px-5 py-3 wide:static wide:mx-0 wide:mt-6 wide:border-0 wide:bg-transparent wide:p-0"
        style={order(6)}
      >
        <button type="button" onClick={() => start()} disabled={!total} className="btn btn-accent min-h-12 px-7 text-lg wide:min-h-13">
          {t('Empezar')}
          <Icon name="arrow" size={20} />
        </button>
        <p className="text-sm text-ink-soft">
          {plural(questions, t('pregunta'), t('preguntas'))}
          {best && (
            <>
              {' '}
              · {t('tu mejor nota')}: <strong className="text-ink">{formatGrade(best.grade)}</strong>
            </>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => go('progress')}
        className="group mt-4 block w-full max-w-[26rem] text-left wide:mt-6"
        style={order(7)}
        title={t('Ver mi progreso')}
      >
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-ink-soft">
            {tx('Dominas {n} de {total} en «{mode}»', {
              n: <strong className="text-ink">{summary.mastered}</strong>,
              total: summary.total,
              mode: mode.title,
            })}
          </span>
          <span className="label transition-colors group-hover:text-accent">{t('Ver progreso →')}</span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-sunken">
          <div className="bg-ok transition-[width] duration-700" style={{ width: `${summary.ratio * 100}%` }} />
        </div>
      </button>

      <a
        href="/donar/"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-accent"
        style={order(8)}
      >
        <Icon name="heart" size={16} />
        {t('Gratis y sin anuncios. ¿Te ayuda? Apoya el proyecto')}
      </a>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-faint" style={order(8)}>
        {t('Cartografía: Natural Earth · Banderas: flag-icons · Datos de países: mledoze/countries (ODbL)')}
        <br />
        {[
          [t('/paises-y-capitales/'), t('Países y capitales')],
          ['/aviso-legal/', t('Aviso legal')],
          ['/privacidad/', t('Privacidad')],
          ['/cookies/', t('Cookies')],
        ].map(([href, label]) => (
          <span key={href}>
            <a href={href} className="underline hover:text-ink">
              {label}
            </a>
            {' · '}
          </span>
        ))}
        <button
          type="button"
          onClick={() => (window as Window & { swmConsent?: { open(): void } }).swmConsent?.open()}
          className="underline hover:text-ink"
        >
          {t('Configurar cookies')}
        </button>
      </p>
    </Panel>
  );
}
