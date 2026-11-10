import { modeDef, MODES, type GameConfig } from './config';
import type { Rng } from './session';

// Reto del día: las mismas diez preguntas para todo el mundo, sin servidor. La fecha (la del
// dispositivo) hace de semilla: de ella salen el reto, los países y el orden.

/** «2026-11-10»: el día, en la hora local del jugador. */
export function dailyKey(date: Date): string {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`;
}

/** Días transcurridos desde una fecha fija, para que cada día le toque un reto distinto. */
const dayNumber = (key: string) => Math.round(Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / 86_400_000);

/** El reto que toca ese día: los retos se van turnando, siempre con todo el mundo y diez preguntas. */
export function dailyConfig(key: string): GameConfig {
  const mode = MODES[dayNumber(key) % MODES.length].id;
  return { mode, answer: modeDef(mode).answers[0], scope: 'mundo', length: 10 };
}

/** Generador pseudoaleatorio (mulberry32) sembrado con la fecha: la misma secuencia para todos. */
export function dailyRng(key: string): Rng {
  let seed = dayNumber(key) * 2654435761;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Lo que se guarda del reto del día. */
export interface DailyRecord {
  /** Último día jugado. */
  date: string;
  /** Nota de ese día (la del primer intento: repetirlo no la cambia). */
  grade: number;
  /** Días seguidos jugando, contando ese. */
  streak: number;
}

/** Resultado de jugar el reto de `key` con nota `grade`, dado lo guardado hasta ahora. */
export function recordDaily(previous: DailyRecord | null, key: string, grade: number): DailyRecord {
  if (!previous) return { date: key, grade, streak: 1 };
  if (previous.date === key) return previous;
  const consecutive = dayNumber(key) - dayNumber(previous.date) === 1;
  return { date: key, grade, streak: consecutive ? previous.streak + 1 : 1 };
}

/** Racha vigente hoy: se mantiene si se jugó hoy o ayer; si no, se ha roto. */
export function currentStreak(record: DailyRecord | null, today: string): number {
  if (!record) return 0;
  return dayNumber(today) - dayNumber(record.date) <= 1 ? record.streak : 0;
}
