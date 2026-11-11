import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { formatGrade, formatTime, plural } from '../app/format';
import { loadBoards } from '../app/ranking';
import { useApp, useMapDef, useSettings } from '../app/store';
import type { MapId } from '../atlas/types';
import { answerLabel, modeDef, resolveScope, SAMPLE_LIST, type AnswerKind, type ModeId, type SessionLength } from '../game/config';
import { MAPS } from '../game/maps';
import type { RankBoard } from '../game/ranking';
import { Icon } from './Icon';
import { MODE_ICONS } from './modeIcons';
import { Flag, Panel, Segmented } from './primitives';
import { Ranking } from './Ranking';
import { LOCALE, t } from '../i18n';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

interface Entry {
  board: RankBoard;
  title: string;
  detail: string;
  mode: ModeId | null;
  /** Para ordenar: el reto del día primero y lo demás como en la portada. */
  rank: number;
  /** Lo que hay que elegir en la portada para jugar este reto (el reto del día no se elige). */
  config: { mode: ModeId; answer: AnswerKind; scope: string; length: SessionLength } | null;
}

/** Todos los rankings con algún resultado, del mapa que se está viendo: el primero de cada uno y, al abrirlo, los diez. */
export function RankingPanel() {
  const atlas = useApp((s) => s.atlas)!;
  const def = useMapDef();
  const go = useApp((s) => s.go);
  const setMap = useApp((s) => s.setMap);
  const setConfig = useSettings((s) => s.setConfig);
  const lists = useSettings((s) => s.lists);
  const [boards, setBoards] = useState<RankBoard[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const abort = new AbortController();
    loadBoards(abort.signal)
      .then(setBoards)
      .catch(() => !abort.signal.aborted && setFailed(true));
    return () => abort.abort();
  }, []);

  const entries = useMemo(() => {
    const out: Entry[] = [];
    for (const board of boards ?? []) {
      const parts = board.category.split('/');
      if (parts[0] === 'dia') {
        if (!def.extras) continue;
        const date = new Date(`${parts[1]}T12:00:00`).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' });
        out.push({ board, title: `${t('Reto del día')} · ${date}`, detail: plural(10, t('pregunta'), t('preguntas')), mode: null, rank: -Date.parse(parts[1]) / 1e13, config: null });
        continue;
      }
      const [map, mode, answer, scope, length] = parts as [MapId, ModeId, AnswerKind, string, string];
      if (map !== atlas.map) continue;
      const modes = MAPS[map].modes;
      const scopes = MAPS[map].filters.map((f) => f.id);
      const zone = scope === SAMPLE_LIST.id ? t(SAMPLE_LIST.name) : resolveScope(atlas, scope, lists).label;
      const questions = length === 'all' ? t('partida completa') : plural(Number(length), t('pregunta'), t('preguntas'));
      out.push({
        board,
        title: `${modeDef(mode, map).title} · ${zone}`,
        detail: `${answerLabel(mode, answer, map)} · ${questions}`,
        mode,
        rank: 1 + modes.indexOf(mode) * 1e4 + (scopes.indexOf(scope) + 1 || 99) * 100 + ['10', '20', 'all'].indexOf(length) * 10 + ['map', 'choice', 'guided', 'type'].indexOf(answer),
        config: { mode, answer, scope, length: length === 'all' ? 'all' : (Number(length) as SessionLength) },
      });
    }
    // Del reto del día, solo los tres últimos.
    const daily = out.filter((e) => !e.config).sort((a, b) => a.rank - b.rank).slice(0, 3);
    return [...daily, ...out.filter((e) => e.config).sort((a, b) => a.rank - b.rank)];
  }, [boards, atlas, def.extras, lists]);

  return (
    <Panel label={t('Ranking')}>
      <p className="label" style={order(0)}>
        {t('Ranking')} · {def.title}
      </p>
      <h1 className="display mt-3 text-[2rem] wide:text-[2.5rem]" style={order(1)}>
        {t('Ranking')}
      </h1>
      <p className="mt-2 max-w-[26rem] text-sm text-ink-soft" style={order(2)}>
        {t('Los diez mejores resultados de cada reto. Juega y publica el tuyo.')}
      </p>

      <Segmented
        label={t('Mapa')}
        className="mt-4 flex-nowrap! overflow-x-auto wide:flex-wrap! wide:overflow-visible [scrollbar-width:none] [&>*]:shrink-0"
        value={atlas.map}
        onChange={(map) => {
          // Cambiar de mapa lleva a la portada: se vuelve aquí en cuanto está cargado.
          void setMap(map).then(() => go('ranking'));
        }}
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

      <div className="mt-5 grid max-w-[26rem] grid-cols-1 gap-2" style={order(3)}>
        {failed ? (
          <p className="text-sm text-ink-soft">{t('No se ha podido cargar el ranking.')}</p>
        ) : !boards ? (
          <p className="text-sm text-ink-faint">{t('Cargando el ranking…')}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-ink-soft">{t('Todavía no hay resultados publicados en este mapa.')}</p>
        ) : (
          entries.map((entry) => <Board key={entry.board.category} entry={entry} onPlay={entry.config ? () => (setConfig(entry.config!), go('home')) : undefined} />)
        )}
      </div>

      <button type="button" onClick={() => go('home')} className="btn btn-ghost mt-6 min-h-11 px-4" style={order(4)}>
        {t('Volver')}
      </button>
    </Panel>
  );
}

/** Un ranking en la lista: quién va primero; al abrirlo, los diez mejores. */
function Board({ entry, onPlay }: { entry: Entry; onPlay?: () => void }) {
  const [open, setOpen] = useState(false);
  const { best, count } = entry.board;
  return (
    <details className="min-w-0 rounded-[12px] border border-rule-strong bg-surface" onToggle={(e) => setOpen(e.currentTarget.open)}>
      {/* Dos líneas: el reto y la marca del primero; debajo, cómo se juega y quién es. */}
      <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2.5 [&::-webkit-details-marker]:hidden">
        <Icon name={entry.mode ? MODE_ICONS[entry.mode] : 'flame'} size={18} className={`row-span-2 ${entry.mode ? 'text-ink-soft' : 'text-accent'}`} />
        <span className="truncate text-sm font-bold">{entry.title}</span>
        <span className="tabular text-right text-sm">
          <strong>{formatGrade(best.grade)}</strong> <span className="text-ink-soft">{formatTime(best.ms)}</span>
        </span>
        <span className="truncate text-xs text-ink-soft">
          {entry.detail} · {plural(count, t('resultado'), t('resultados'))}
        </span>
        <span className="flex min-w-0 max-w-32 items-center justify-end gap-1.5 text-xs font-semibold">
          <Flag a2={best.country} height={11} />
          <span className="truncate">{best.nick}</span>
        </span>
      </summary>
      {open && (
        <div className="px-2 pb-2">
          <Ranking category={entry.board.category} />
          {onPlay && (
            <button type="button" onClick={onPlay} className="btn mt-2 min-h-10 px-3 text-sm">
              <Icon name="arrow" size={16} />
              {t('Jugar este reto')}
            </button>
          )}
        </div>
      )}
    </details>
  );
}
