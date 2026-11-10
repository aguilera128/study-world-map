import { useMemo, useState, type CSSProperties } from 'react';
import { useApp, useProgress, useSettings } from '../app/store';
import { PALETTES, Style } from '../engine/palette';
import { MODES, REGION_FILTERS, resolveScope } from '../game/config';
import { MASTERY_LABELS, summarize } from '../game/progress';
import { MODE_ICONS } from './modeIcons';
import { useTheme } from './hooks';
import { Icon } from './Icon';
import { Panel, Segmented } from './primitives';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

/** Barra apilada con cuántos países hay en cada nivel de dominio. */
function LevelBar({ levels, total, colors }: { levels: number[]; total: number; colors: string[] }) {
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-sunken">
      {[4, 3, 2, 1].map((level) => (
        <div
          key={level}
          className="transition-[width] duration-700"
          style={{ width: `${total ? (levels[level] / total) * 100 : 0}%`, background: colors[level] }}
        />
      ))}
    </div>
  );
}

/** Lo aprendido hasta ahora, por reto y por zona. El mapa se colorea según el dominio de cada país. */
export function ProgressPanel() {
  const atlas = useApp((s) => s.atlas)!;
  const mode = useApp((s) => s.progressMode);
  const setMode = useApp((s) => s.setProgressMode);
  const start = useApp((s) => s.start);
  const go = useApp((s) => s.go);
  const progress = useProgress((s) => s.progress);
  const reset = useProgress((s) => s.reset);
  const lists = useSettings((s) => s.lists);
  const setConfig = useSettings((s) => s.setConfig);
  const [confirming, setConfirming] = useState(false);
  // Los mismos colores con los que el mapa pinta cada nivel de dominio.
  const theme = useTheme();
  const colors = MASTERY_LABELS.map((_, level) => PALETTES[theme].styles[Style.mastery + level].color);

  const rows = useMemo(() => {
    const scopes = [...REGION_FILTERS.map((r) => r.id), ...lists.map((l) => l.id)].map((id) => resolveScope(atlas, id, lists));
    return scopes.map((scope) => ({
      scope,
      summary: summarize(
        progress,
        scope.countries.map((i) => atlas.countries[i].id),
        mode,
      ),
    }));
  }, [atlas, lists, progress, mode]);
  const world = rows[0].summary;
  const hasProgress = Object.keys(progress).length > 0;

  const practice = (scope: string) => {
    setConfig({ mode, scope, length: 20 });
    start();
  };

  return (
    <Panel label="Mi progreso">
      <p className="label" style={order(0)}>
        Mi progreso
      </p>
      <h1 className="display mt-3 text-[2rem] wide:text-[2.5rem]" style={order(1)}>
        {world.mastered > 0 ? (
          <>
            Dominas <span className="text-ok">{world.mastered}</span> de {world.total} países
          </>
        ) : (
          'Tu mapa de lo aprendido'
        )}
      </h1>
      <p className="mt-2 text-ink-soft" style={order(2)}>
        Cada acierto a la primera sube un país de nivel; un fallo lo devuelve al principio. Lo que peor llevas sale más
        a menudo en las partidas.
      </p>

      <div className="mt-5" style={order(3)}>
        <Segmented
          label="Reto"
          value={mode}
          onChange={setMode}
          options={MODES.map((m) => ({
            value: m.id,
            label: (
              <>
                <Icon name={MODE_ICONS[m.id]} size={15} />
                {m.title}
              </>
            ),
          }))}
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-ink-soft" style={order(4)}>
        {MASTERY_LABELS.map((label, level) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-rule-strong" style={{ background: colors[level] }} />
            {label}
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-1" style={order(5)}>
        {rows.map(({ scope, summary }) => (
          <li key={scope.id}>
            <button
              type="button"
              onClick={() => practice(scope.id)}
              className="group block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-[rgb(var(--shadow)/0.07)]"
              title={`Practicar ${scope.label}`}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-1.5 font-semibold">
                  {scope.isList && <Icon name="list" size={14} />}
                  {scope.label}
                </span>
                <span className="tabular text-sm text-ink-soft">
                  <span className="group-hover:hidden">
                    {summary.mastered} / {summary.total}
                  </span>
                  <span className="hidden font-bold text-accent group-hover:inline">Practicar →</span>
                </span>
              </div>
              <LevelBar levels={summary.levels} total={summary.total} colors={colors} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-2.5" style={order(6)}>
        <button type="button" onClick={() => practice('mundo')} className="btn btn-accent min-h-12 px-5">
          Practicar lo que peor llevo
          <Icon name="arrow" size={18} />
        </button>
        <button type="button" onClick={() => go('home')} className="btn btn-ghost min-h-12 px-4">
          Volver
        </button>
      </div>

      {hasProgress && (
        <div className="mt-6 text-sm text-ink-soft" style={order(7)}>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-2">
              ¿Borrar todo lo aprendido y los récords?
              <button
                type="button"
                onClick={() => {
                  reset();
                  setConfirming(false);
                }}
                className="btn min-h-8 px-3 text-sm text-bad"
              >
                Sí, borrar
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn min-h-8 px-3 text-sm">
                Cancelar
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="underline decoration-rule-strong underline-offset-4 hover:text-ink">
              Borrar mi progreso
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}
