import { useMemo, type CSSProperties } from 'react';
import { formatGrade, plural } from '../app/format';
import { bestFor, useApp, useMapDef, useProgress, useSettings } from '../app/store';
import type { MapId } from '../atlas/types';
import { answerLabel, modeDef, modesOf, resolveScope, type ModeId } from '../game/config';
import { MAPS } from '../game/maps';
import { currentStreak, dailyConfig, dailyKey } from '../game/daily';
import { summarize } from '../game/progress';
import { Icon } from './Icon';
import { homeOf, lang, preferredLang, VIEW_IN } from '../i18n';
import { ANSWER_ICONS, MODE_ICONS } from './modeIcons';
import { Panel, Segmented, Step } from './primitives';
import { ScopeChips } from './ScopeChips';
import { t } from '../i18n';
import { tx } from '../i18n/tx';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * Quien llega a una versión que no es la del idioma de su navegador puede no saber que hay otras:
 * se le ofrece la suya, en su idioma, una sola vez. No redirige sola: la dirección manda.
 */
function LangHint() {
  const seen = useSettings((s) => s.langHintSeen);
  const dismiss = useSettings((s) => s.dismissLangHint);
  const other = typeof navigator === 'undefined' ? null : preferredLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
  if (seen || !other || other === lang) return null;
  return (
    <p className="mb-3 flex max-w-[26rem] items-center gap-2 text-sm" style={order(0)}>
      <Icon name="globe" size={16} className="shrink-0 text-ink-soft" />
      <a href={homeOf(other)} hrefLang={other} lang={other} onClick={dismiss} className="font-semibold underline hover:text-accent">
        {VIEW_IN[other]}
      </a>
      <button type="button" onClick={dismiss} aria-label={t('Cerrar')} className="btn btn-ghost ml-auto min-h-8 px-1.5 text-ink-soft">
        <Icon name="close" size={14} />
      </button>
    </p>
  );
}

/** Qué pregunta cada reto: sirve para agruparlos en la portada. */
const MODE_GROUPS: { title: string; ids: ModeId[] }[] = [
  { title: t('Dónde está'), ids: ['locate', 'continent', 'region', 'coords'] },
  { title: t('Cómo se llama'), ids: ['name', 'capital', 'flag'] },
  { title: t('Cómo es'), ids: ['climate', 'population', 'inhabitants'] },
];

/** Reto del día: el mismo para todos; enseña la racha y, si ya se ha jugado hoy, la nota. */
function DailyCard() {
  const startDaily = useApp((s) => s.startDaily);
  const record = useProgress((s) => s.daily);
  const today = dailyKey(new Date());
  const mode = modeDef(dailyConfig(today).mode);
  const streak = currentStreak(record, today);
  const done = record?.date === today;
  return (
    <button
      type="button"
      onClick={startDaily}
      className="tile mt-4 flex w-full max-w-[26rem] items-center gap-3 px-3 py-2.5 text-left"
      style={order(3)}
    >
      <Icon name="flame" size={22} className="shrink-0 text-accent" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-tight">
          {t('Reto del día')} · {mode.title}
        </span>
        <span className="block text-xs text-ink-soft">
          {done ? t('Hecho hoy: {grade} sobre 10', { grade: formatGrade(record.grade) }) : t('Las mismas 10 preguntas para todo el mundo')}
        </span>
      </span>
      {streak > 0 && (
        <span className="shrink-0 text-xs font-bold text-ink-soft" title={t('Días seguidos jugando el reto del día')}>
          {t('Racha')}: {plural(streak, t('día'), t('días'))}
        </span>
      )}
    </button>
  );
}

/** Pantalla de inicio: se elige el mapa, el reto, qué países entran y cuántas preguntas. */
export function HomePanel() {
  const atlas = useApp((s) => s.atlas)!;
  const def = useMapDef();
  const setMap = useApp((s) => s.setMap);
  const start = useApp((s) => s.start);
  const go = useApp((s) => s.go);
  const config = useSettings((s) => s.config);
  const lists = useSettings((s) => s.lists);
  const setConfig = useSettings((s) => s.setConfig);
  const progress = useProgress((s) => s.progress);
  const bests = useProgress((s) => s.bests);

  const mode = modeDef(config.mode, atlas.map);
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
  // Los retos del mapa del mundo, que son muchos, se agrupan por lo que preguntan.
  const groups = useMemo(() => {
    const modes = modesOf(atlas.map);
    if (modes.length < 6) return [{ title: null as string | null, modes }];
    return MODE_GROUPS.map((group) => ({ title: group.title, modes: modes.filter((m) => group.ids.includes(m.id)) })).filter((group) => group.modes.length);
  }, [atlas.map]);
  // Dominio de cada reto en la zona elegida, de 0 a 1.
  const mastered = useMemo(() => {
    const ids = scope.countries.map((i) => atlas.countries[i].id);
    return Object.fromEntries(modesOf(atlas.map).map((m) => [m.id, summarize(progress, ids, m.id).ratio])) as Record<ModeId, number>;
  }, [progress, scope, atlas]);
  const played = Object.keys(progress).length > 0;
  const questions = config.length === 'all' ? total : Math.min(config.length, total);
  const best = bestFor(bests, config);

  return (
    <Panel label={t('Elegir partida')}>
      <LangHint />
      {/* En pantallas anchas este rótulo va en la cabecera, junto a la marca. */}
      {/* En el móvil la hoja es corta: quien ya ha jugado no necesita el rótulo ni el titular. */}
      <p className={`label min-[82rem]:hidden ${played ? 'hidden wide:block' : ''}`} style={order(0)}>
        {t(def.text.count, { n: atlas.quizzable.length })}
      </p>
      <h1 className={`display mt-2.5 text-[clamp(1.45rem,7vw,2.1rem)] wide:mt-2 wide:block min-[82rem]:mt-0 wide:text-[clamp(1.5rem,3.4vh,1.85rem)] ${played ? 'hidden' : ''}`} style={order(1)}>
        <span className="block whitespace-nowrap">{def.text.headline[0]}</span>
        <em className="block whitespace-nowrap font-semibold text-accent">{def.text.headline[1]}</em>
      </h1>
      {/* en el móvil la hoja es corta: la frase de presentación solo se enseña en pantallas anchas */}
      {/* y solo la primera vez: quien ya ha jugado sabe cómo va */}
      <p className={`mt-2 hidden max-w-[26rem] text-sm text-ink-soft ${played ? '' : 'wide:block'}`} style={order(2)}>
        {t('Elige un reto, responde sobre el mapa y repasa lo que falles hasta que te lo sepas.')}
      </p>

      <Segmented
        label={t('Mapa')}
        // en el móvil, los tres mapas en una fila que se desliza, no en dos
        className={`flex-nowrap! overflow-x-auto wide:flex-wrap! wide:overflow-visible [scrollbar-width:none] [&>*]:shrink-0 ${played ? 'wide:mt-4' : 'mt-4'}`}
        value={atlas.map}
        onChange={(map) => void setMap(map)}
        options={(Object.keys(MAPS) as MapId[]).map((id) => ({
          value: id,
          label: (
            <>
              <Icon name={id === 'world' ? 'globe' : 'map'} size={16} />
              {MAPS[id].title}
            </>
          ),
        }))}
      />

      {def.extras && <DailyCard />}

      <section className="mt-5" style={order(3)}>
        <Step n={1}>{t('Reto')}</Step>
        <div role="radiogroup" aria-label={t('Reto')} className="grid gap-2">
          {groups.map((group) => (
            <div key={group.title ?? 'all'}>
              {group.title && <p className="mb-1 text-xs font-semibold text-ink-soft">{group.title}</p>}
              <div className="grid grid-cols-3 gap-1.5">
                {group.modes.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={m.id === config.mode}
                    onClick={() => setConfig({ mode: m.id })}
                    className="tile relative flex min-w-0 items-center gap-1.5 overflow-hidden px-1.5 py-2 text-left"
                  >
                    {/* tres por fila también en el móvil: ahí el icono cede su sitio al nombre */}
                    <Icon name={MODE_ICONS[m.id]} size={16} className="hidden shrink-0 min-[26rem]:block" />
                    <span className="truncate text-[0.8125rem] font-bold leading-tight tracking-[-0.01em]">{m.title}</span>
                    {/* cuánto se domina este reto en la zona elegida: orienta qué practicar */}
                    {mastered[m.id] > 0 && <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] bg-ok" style={{ width: `${mastered[m.id] * 100}%` }} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {mode.summary}{' '}
          <button type="button" onClick={() => go('explore')} className="font-semibold text-ink underline decoration-rule-strong underline-offset-4 hover:text-accent">
            {def.text.study}
          </button>
        </p>
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
                  {answerLabel(mode.id, a, atlas.map)}
                </>
              ),
            }))}
          />
        )}
      </section>

      <section className="mt-4" style={order(4)}>
        <Step n={2}>{def.text.units}</Step>
        <ScopeChips value={scope.id} onChange={(scope) => setConfig({ scope })}>
          {def.extras && (
            <button
              type="button"
              onClick={() => go('lists')}
              className="tile flex min-h-9 items-center gap-1.5 border-dashed px-3 text-sm font-semibold text-ink-soft"
            >
              <Icon name="pencil" size={15} />
              {t('Elegir países')}
            </button>
          )}
        </ScopeChips>
      </section>

      {/* En el móvil el botón de empezar se queda pegado al borde de la hoja, siempre a mano. */}
      <div
        data-sheet-foot
        className="sticky bottom-0 z-10 -mx-5 mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-rule bg-surface px-5 py-3 wide:static wide:mx-0 wide:mt-6 wide:border-0 wide:bg-transparent wide:p-0"
        style={order(6)}
      >
        <button type="button" onClick={() => start()} disabled={!total} className="btn btn-accent min-h-12 shrink-0 px-3.5 text-base wide:min-h-13 wide:px-7 wide:text-lg">
          {t('Empezar')}
          <Icon name="arrow" size={20} />
        </button>
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
        {/* el número de preguntas ya se ve en el selector: aquí solo la mejor nota, si la hay */}
        {best && (
          <p className="w-full text-sm text-ink-soft first-letter:uppercase">
            {t('tu mejor nota')}: <strong className="text-ink">{formatGrade(best.grade)}</strong> · {plural(questions, t('pregunta'), t('preguntas'))}
          </p>
        )}
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

      {/* En pantallas anchas este enlace va abajo a la derecha, bajo los controles del mapa (MapControls). */}
      <a
        href="/donar/"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-accent wide:hidden"
        style={order(8)}
      >
        <Icon name="heart" size={16} />
        {t('Gratis y sin anuncios. ¿Te ayuda? Apoya el proyecto')}
      </a>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-faint" style={order(8)}>
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
        {' · '}
        <a
          href={`mailto:hola@studyworldmap.com?subject=${encodeURIComponent('Study World Map: error')}`}
          title={t('Informar de un error')}
          aria-label={t('Informar de un error')}
          className="inline-block translate-y-[3px] hover:text-ink"
        >
          <Icon name="bug" size={14} />
        </a>
      </p>
    </Panel>
  );
}
