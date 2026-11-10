import type { Atlas } from '../atlas/atlas';
import type { ContinentKey } from '../atlas/types';
import { inputOf, MAX_ATTEMPTS, type GameConfig, type Scope } from './config';
import { selectionWeight, type Outcome, type Progress } from './progress';
import { matchesAnswer } from './text';

// Lógica de una partida, sin interfaz ni mapa: funciones puras sobre un objeto `Session`.
//
// Cómo ayuda a aprender:
//   · Respuesta inmediata y varios intentos: cada fallo enseña algo antes de dar la solución.
//   · Los países no acertados a la primera vuelven a salir unas preguntas después («repaso»):
//     no puntúan, pero obligan a recuperar el dato cuando aún está fresco.
//   · Los países se sortean dando más peso a los que peor se saben (ver ./progress.ts).

export interface Option {
  /** Lo que se responde: id del país o clave del continente. */
  id: string;
  label: string;
  /** País al que corresponde la opción (−1 en las opciones de continente). */
  country: number;
}

export interface Question {
  country: number;
  /** Repetición de un país fallado antes en esta misma partida: no puntúa. */
  review: boolean;
  /** Opciones entre las que elegir (vacío si se responde en el mapa o escribiendo). */
  options: Option[];
}

export interface Result {
  country: number;
  outcome: Outcome;
  /** Respuestas dadas, contando la correcta. */
  attempts: number;
  ms: number;
  review: boolean;
}

export interface Session {
  config: GameConfig;
  scopeLabel: string;
  /** Países que entran en el cuestionario (los que se pueden pulsar y de donde salen las opciones). */
  pool: number[];
  /** Preguntas pendientes; la primera es la actual. */
  queue: Question[];
  /** Preguntas que puntúan (sin contar los repasos). */
  total: number;
  /** De las que puntúan, cuántas están resueltas. */
  answered: number;
  status: 'asking' | 'resolved' | 'finished';
  /** Respuestas erróneas dadas a la pregunta actual (id de país u opción; '' si fue texto). */
  wrong: string[];
  /** Resultado de la pregunta actual, una vez resuelta. */
  outcome: Outcome | null;
  results: Result[];
  /** Cómo ha quedado en el mapa cada país ya preguntado. */
  marks: Record<number, Outcome>;
  /** Países que ya han vuelto a la cola como repaso. */
  requeued: number[];
  streak: number;
  bestStreak: number;
  startedAt: number;
  questionAt: number;
  finishedAt: number | null;
}

export type Answer =
  | { kind: 'country'; index: number }
  | { kind: 'option'; id: string }
  | { kind: 'text'; text: string }
  | { kind: 'giveUp' };

export interface Verdict {
  session: Session;
  /** `ignored`: la respuesta no cuenta (fuera del cuestionario, repetida, vacía…). */
  verdict: 'right' | 'wrong' | 'ignored';
  /** La pregunta ha quedado resuelta con esta respuesta. */
  resolved: boolean;
}

export type Rng = () => number;

/** Preguntas que deben pasar antes de repetir un país fallado. */
const REVIEW_GAP = 3;

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Sorteo ponderado sin repetición (Efraimidis–Spirakis): n países, más probables los de más peso. */
function weightedSample(items: number[], n: number, weight: (item: number) => number, rng: Rng): number[] {
  if (n >= items.length) return shuffle(items, rng);
  const keyed = items.map((item) => ({ item, key: Math.pow(Math.max(rng(), 1e-12), 1 / Math.max(weight(item), 1e-6)) }));
  keyed.sort((a, b) => b.key - a.key);
  return shuffle(
    keyed.slice(0, n).map((k) => k.item),
    rng,
  );
}

/** Distancia angular aproximada entre las anclas de dos países. */
function distance(atlas: Atlas, a: number, b: number): number {
  const [lonA, latA] = atlas.countries[a].anchor;
  const [lonB, latB] = atlas.countries[b].anchor;
  const rad = Math.PI / 180;
  const dLat = (latB - latA) * rad;
  const dLon = (lonB - lonA) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(latA * rad) * Math.cos(latB * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function makeOptions(atlas: Atlas, config: GameConfig, pool: number[], country: number, rng: Rng): Option[] {
  if (inputOf(config.answer) !== 'choice') return [];
  if (config.mode === 'continent') {
    // Siempre los mismos continentes y en el mismo orden: aquí no hay que buscar la respuesta.
    return (Object.keys(atlas.continents) as ContinentKey[]).map((key) => ({ id: key, label: atlas.continents[key], country: -1 }));
  }
  // Tres distractores entre los países más cercanos: son los que de verdad se confunden.
  let candidates = pool.filter((i) => i !== country);
  if (candidates.length < 6) candidates = atlas.quizzable.filter((i) => i !== country);
  const nearest = candidates
    .map((i) => ({ i, d: distance(atlas, country, i) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 8)
    .map((c) => c.i);
  const picked = shuffle([country, ...shuffle(nearest, rng).slice(0, 3)], rng);
  return picked.map((i) => {
    const c = atlas.countries[i];
    return { id: c.id, label: config.mode === 'capital' ? c.capital! : c.name, country: i };
  });
}

function makeQuestion(atlas: Atlas, config: GameConfig, pool: number[], country: number, review: boolean, rng: Rng): Question {
  return { country, review, options: makeOptions(atlas, config, pool, country, rng) };
}

export interface SessionOptions {
  /** Preguntar solo estos países (p. ej. para repasar los fallos de la partida anterior). */
  only?: number[];
  rng?: Rng;
}

export function createSession(
  atlas: Atlas,
  config: GameConfig,
  scope: Scope,
  progress: Progress,
  now: number,
  { only, rng = Math.random }: SessionOptions = {},
): Session {
  const pool = scope.countries;
  const source = only ?? pool;
  const n = only || config.length === 'all' ? source.length : Math.min(config.length, source.length);
  const chosen = weightedSample(source, n, (i) => selectionWeight(progress, atlas.countries[i].id, config.mode, now), rng);
  return {
    config,
    scopeLabel: scope.label,
    pool,
    queue: chosen.map((country) => makeQuestion(atlas, config, pool, country, false, rng)),
    total: chosen.length,
    answered: 0,
    status: chosen.length ? 'asking' : 'finished',
    wrong: [],
    outcome: null,
    results: [],
    marks: {},
    requeued: [],
    streak: 0,
    bestStreak: 0,
    startedAt: now,
    questionAt: now,
    finishedAt: chosen.length ? null : now,
  };
}

export const currentQuestion = (session: Session): Question | null =>
  session.status === 'finished' ? null : (session.queue[0] ?? null);

export const attemptsLeft = (session: Session): number =>
  MAX_ATTEMPTS[inputOf(session.config.answer)] - session.wrong.length;

function isRightText(atlas: Atlas, session: Session, question: Question, text: string): boolean {
  const target = atlas.countries[question.country];
  const others = atlas.quizzable.filter((i) => i !== question.country).map((i) => atlas.countries[i]);
  if (session.config.mode === 'capital') {
    return matchesAnswer(
      text,
      [target.capital!, ...target.capitalAliases],
      others.map((c) => c.capital!),
    );
  }
  return matchesAnswer(
    text,
    [target.name, ...target.aliases],
    others.flatMap((c) => [c.name, ...c.aliases]),
  );
}

function resolve(atlas: Atlas, session: Session, outcome: Outcome, now: number, rng: Rng): Session {
  const question = session.queue[0];
  const { country, review } = question;
  const marks = { ...session.marks };
  if (!review) marks[country] = outcome;
  // Un repaso superado deja constancia en el mapa: el país pasa de «fallado» a «con ayuda».
  else if (outcome !== 'failed' && marks[country] === 'failed') marks[country] = 'later';

  let queue = session.queue;
  let requeued = session.requeued;
  if (outcome !== 'first' && !review && !requeued.includes(country)) {
    const at = Math.min(queue.length, 1 + REVIEW_GAP);
    queue = [...queue.slice(0, at), makeQuestion(atlas, session.config, session.pool, country, true, rng), ...queue.slice(at)];
    requeued = [...requeued, country];
  }
  const streak = outcome === 'first' ? session.streak + 1 : 0;
  return {
    ...session,
    queue,
    requeued,
    marks,
    status: 'resolved',
    outcome,
    answered: session.answered + (review ? 0 : 1),
    results: [
      ...session.results,
      { country, outcome, attempts: session.wrong.length + (outcome === 'failed' ? 0 : 1), ms: now - session.questionAt, review },
    ],
    streak,
    bestStreak: Math.max(session.bestStreak, streak),
  };
}

/** Procesa una respuesta a la pregunta actual. */
export function submit(atlas: Atlas, session: Session, answer: Answer, now: number, rng: Rng = Math.random): Verdict {
  const ignored: Verdict = { session, verdict: 'ignored', resolved: false };
  const question = currentQuestion(session);
  if (!question || session.status !== 'asking') return ignored;
  const input = inputOf(session.config.answer);
  const target = atlas.countries[question.country];

  let right: boolean;
  let key = '';
  switch (answer.kind) {
    case 'giveUp':
      return { session: resolve(atlas, session, 'failed', now, rng), verdict: 'wrong', resolved: true };
    case 'country': {
      if (input !== 'map' || !session.pool.includes(answer.index)) return ignored;
      key = atlas.countries[answer.index].id;
      right = answer.index === question.country;
      break;
    }
    case 'option': {
      const option = question.options.find((o) => o.id === answer.id);
      if (input !== 'choice' || !option) return ignored;
      key = option.id;
      right =
        session.config.mode === 'continent'
          ? target.continents.includes(option.id as ContinentKey)
          : option.country === question.country;
      break;
    }
    case 'text': {
      if (input !== 'type' || !answer.text.trim()) return ignored;
      right = isRightText(atlas, session, question, answer.text);
      break;
    }
  }
  // Repetir un fallo ya cometido no gasta otro intento.
  if (!right && key && session.wrong.includes(key)) return ignored;

  if (right) {
    const outcome: Outcome = session.wrong.length === 0 ? 'first' : 'later';
    return { session: resolve(atlas, session, outcome, now, rng), verdict: 'right', resolved: true };
  }
  const wrong = [...session.wrong, key];
  const next = { ...session, wrong };
  if (wrong.length >= MAX_ATTEMPTS[input]) {
    return { session: resolve(atlas, next, 'failed', now, rng), verdict: 'wrong', resolved: true };
  }
  return { session: next, verdict: 'wrong', resolved: false };
}

/** Pasa a la siguiente pregunta (o termina la partida). */
export function advance(session: Session, now: number): Session {
  if (session.status !== 'resolved') return session;
  const queue = session.queue.slice(1);
  if (!queue.length) return { ...session, queue, status: 'finished', finishedAt: now };
  return { ...session, queue, status: 'asking', wrong: [], outcome: null, questionAt: now };
}

export interface Score {
  total: number;
  first: number;
  later: number;
  failed: number;
  /** Nota sobre 10: un acierto a la primera vale 1 y uno con ayuda, medio. */
  grade: number;
  ms: number;
  bestStreak: number;
}

export function score(session: Session): Score {
  const main = session.results.filter((r) => !r.review);
  const first = main.filter((r) => r.outcome === 'first').length;
  const later = main.filter((r) => r.outcome === 'later').length;
  const failed = main.length - first - later;
  const total = session.total;
  return {
    total,
    first,
    later,
    failed,
    grade: total ? ((first + later * 0.5) / total) * 10 : 0,
    ms: (session.finishedAt ?? session.questionAt) - session.startedAt,
    bestStreak: session.bestStreak,
  };
}

/** Calificación escolar española para una nota sobre 10. */
export function gradeLabel(grade: number): string {
  if (grade >= 9) return 'Sobresaliente';
  if (grade >= 7) return 'Notable';
  if (grade >= 6) return 'Bien';
  if (grade >= 5) return 'Suficiente';
  return 'A repasar';
}

/** Países que no salieron a la primera, en el orden en que se preguntaron. */
export function missed(session: Session): number[] {
  return session.results.filter((r) => !r.review && r.outcome !== 'first').map((r) => r.country);
}
