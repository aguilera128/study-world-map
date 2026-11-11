import { SAMPLE_LIST, type GameConfig, type StudyList } from '../game/config';
import { categoryOf, cleanNick, dailyCategory, suggestNick, type RankBoard, type RankResult, type RankRow } from '../game/ranking';

// Ranking de resultados (función api/ranking.ts): los diez mejores de cada categoría. Publicar es
// siempre una decisión de quien juega: nada se envía hasta que pulsa el botón.

const STORAGE_KEY = 'swm:apodo';

/**
 * El ranking al que va una partida, o null si no se clasifica: los repasos (no son una partida
 * entera), las listas propias y la lista de ejemplo si se ha cambiado (ya no es la misma para todos).
 */
export function rankingOf(config: GameConfig, game: { daily: string | null; review: boolean; lists: StudyList[] }): string | null {
  if (game.review) return null;
  if (game.daily) return dailyCategory(game.daily);
  if (config.scope === SAMPLE_LIST.id) {
    const list = game.lists.find((l) => l.id === SAMPLE_LIST.id);
    if (!list || list.countries.join(' ') !== SAMPLE_LIST.countries.join(' ')) return null;
  }
  return categoryOf(config);
}

/** El apodo con el que se publicó la última vez o, si no hay, uno propuesto. */
export function startingNick(): string {
  try {
    return cleanNick(localStorage.getItem(STORAGE_KEY)) ?? suggestNick();
  } catch {
    return suggestNick();
  }
}

export async function loadTop(category: string, signal?: AbortSignal): Promise<RankRow[]> {
  const res = await fetch(`/api/ranking?c=${encodeURIComponent(category)}`, { signal });
  if (!res.ok) throw new Error(String(res.status));
  return ((await res.json()) as { top: RankRow[] }).top;
}

/** Todos los rankings que tienen algún resultado. */
export async function loadBoards(signal?: AbortSignal): Promise<RankBoard[]> {
  const res = await fetch('/api/ranking', { signal });
  if (!res.ok) throw new Error(String(res.status));
  return ((await res.json()) as { boards: RankBoard[] }).boards;
}

export type Published = { ok: true; entered: boolean; top: RankRow[] } | { ok: false; reason: 'nick' | 'later' };

export async function publish(category: string, nick: string, result: RankResult): Promise<Published> {
  try {
    const res = await fetch('/api/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, nick, grade: result.grade, ms: result.ms, total: result.total }),
    });
    if (res.status === 422) return { ok: false, reason: 'nick' };
    if (!res.ok) return { ok: false, reason: 'later' };
    const body = (await res.json()) as { entered: boolean; top: RankRow[] };
    try {
      localStorage.setItem(STORAGE_KEY, nick);
    } catch {
      // sin almacenamiento (modo privado): la próxima vez se propondrá otro apodo
    }
    return { ok: true, entered: body.entered, top: body.top };
  } catch {
    return { ok: false, reason: 'later' };
  }
}
