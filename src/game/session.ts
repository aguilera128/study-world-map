import type { Atlas } from '../atlas/atlas';
import type { ClimateKey, ContinentKey, Country } from '../atlas/types';
import { CLIMATE_KEYS, climateLabel } from './climate';
import { inputOf, MAX_ATTEMPTS, type AnswerKind, type GameConfig, type ModeDef, type Scope } from './config';
import { isCountryMap } from './maps';
import { selectionWeight, type Outcome, type Progress } from './progress';
import { matchesAnswer, normalize } from './text';
import { LEVEL_KEYS, levelLabel, levelOf, levelRange } from './population';
import { t } from '../i18n';

// Lógica de una partida, sin interfaz ni mapa: funciones puras sobre un objeto `Session`.
//
// Cómo ayuda a aprender:
//   · Respuesta inmediata y varios intentos: cada fallo enseña algo antes de dar la solución.
//   · Los países no acertados a la primera vuelven a salir unas preguntas después («repaso»):
//     no puntúan, pero obligan a recuperar el dato cuando aún está fresco.
//   · Los países se sortean dando más peso a los que peor se saben (ver ./progress.ts).

export interface Option {
  /** Lo que se responde: id del país o clave del continente, del clima o de la región. */
  id: string;
  label: string;
  /** País al que corresponde la opción (−1 en las opciones de continente, clima o región). */
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

/** Un país se considera claramente menos poblado que otro si no llega a dos tercios de su población. */
const CLEAR_GAP = 1.5;

/** Países de `pool` claramente menos poblados que `country`, del más al menos poblado. */
function clearlySmaller(atlas: Atlas, pool: number[], country: number): number[] {
  const own = atlas.countries[country].population ?? 0;
  return pool
    .filter((i) => i !== country && (atlas.countries[i].population ?? 0) * CLEAR_GAP <= own)
    .sort((a, b) => (atlas.countries[b].population ?? 0) - (atlas.countries[a].population ?? 0));
}

/**
 * Países por los que se puede preguntar «¿cuál tiene más habitantes?»: los que tienen dato y al
 * menos otros tres claramente menos poblados entre los que elegir.
 */
function mostPopulated(atlas: Atlas, countries: number[]): number[] {
  const known = countries.filter((i) => atlas.countries[i].population);
  const askable = new Set(known.filter((i) => clearlySmaller(atlas, known, i).length >= 3));
  // Los demás siguen en el conjunto para servir de opciones, pero no se preguntan: van al final.
  return [...known.filter((i) => askable.has(i)), ...known.filter((i) => !askable.has(i))];
}

function makeOptions(atlas: Atlas, config: GameConfig, pool: number[], country: number, rng: Rng): Option[] {
  if (inputOf(config.answer) !== 'choice') return [];
  if (config.mode === 'continent') {
    // Siempre los mismos continentes y en el mismo orden: aquí no hay que buscar la respuesta.
    return (Object.keys(atlas.continents) as ContinentKey[]).map((key) => ({ id: key, label: atlas.continents[key], country: -1 }));
  }
  if (config.mode === 'inhabitants') {
    // El país preguntado y tres bastante menos poblados, de los más cercanos a él en tamaño: así
    // hay que saber cuál es mayor, sin que la diferencia sea dudosa.
    const smaller = clearlySmaller(atlas, pool, country).slice(0, 8);
    return shuffle([country, ...shuffle(smaller, rng).slice(0, 3)], rng).map((i) => ({ id: atlas.countries[i].id, label: atlas.countries[i].name, country: i }));
  }
  if (config.mode === 'population') {
    // Siempre los tres niveles, de menos a más, con su tramo a la vista.
    return LEVEL_KEYS.map((key) => ({ id: key, label: `${levelLabel(key)} · ${levelRange(key)}`, country: -1 }));
  }
  if (config.mode === 'climate') {
    // El clima más extendido del país y tres que no tiene: cualquiera de los suyos vale como respuesta,
    // así que entre las opciones no puede haber dos correctas.
    const own = atlas.countries[country].climate;
    const others = shuffle(
      CLIMATE_KEYS.filter((key) => !own.includes(key)),
      rng,
    ).slice(0, 3);
    const picked = new Set([own[0], ...others]);
    // En el orden de la leyenda (de la zona cálida a la fría), no al azar: ayuda a comparar.
    return CLIMATE_KEYS.filter((key) => picked.has(key)).map((key) => ({ id: key, label: climateLabel(key), country: -1 }));
  }
  if (config.mode === 'region') {
    // Su región y otras tres de las cinco más cercanas (las de las provincias vecinas, que son las
    // que se confunden), en el orden del atlas: con diecinueve comunidades no caben todas.
    const own = atlas.countries[country].regions[0];
    const near = atlas.quizzable
      .filter((i) => i !== country)
      .map((i) => ({ i, d: distance(atlas, country, i) }))
      .sort((a, b) => a.d - b.d)
      .map((c) => atlas.countries[c.i].regions[0]);
    const others = [...new Set(near)].filter((key) => key !== own).slice(0, 5);
    const picked = new Set([own, ...shuffle(others, rng).slice(0, 3)]);
    return Object.keys(atlas.regions)
      .filter((key) => picked.has(key))
      .map((key) => ({ id: key, label: atlas.regions[key].name, country: -1 }));
  }
  // Tres distractores entre los países más cercanos: son los que de verdad se confunden. En las
  // capitales no vale el que tiene la misma (Praga lo es de dos regiones): saldría dos veces.
  const other = (i: number) => i !== country && !(config.mode === 'capital' && sameCapital(atlas, i, country));
  let candidates = pool.filter(other);
  if (candidates.length < 6) candidates = atlas.quizzable.filter(other);
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

/** ¿Dice ya el nombre de la unidad cuál es su capital? («Sevilla», «Provincia de Sofía».) */
export function namesItsCapital(country: Pick<Country, 'name' | 'capital'>): boolean {
  if (!country.capital) return false;
  const words = new Set(normalize(country.name).split(' '));
  return normalize(country.capital)
    .split(' ')
    .every((word) => words.has(word));
}

/** Los países de una zona que entran en la partida de este reto: de ellos salen también las opciones. */
function poolOf(atlas: Atlas, config: Pick<GameConfig, 'mode'>, countries: number[]): number[] {
  // En el reto de población solo entran los países con dato de población.
  if (config.mode === 'population') return countries.filter((i) => levelOf(atlas.countries[i]) !== null);
  if (config.mode === 'inhabitants') return mostPopulated(atlas, countries);
  return countries;
}

/**
 * De los países de una zona, por cuáles se pregunta en este reto y con esta forma de responder.
 * En el mapa de un país, eligiendo o escribiendo la capital no se pregunta la de la unidad que se
 * llama como ella (la de Sevilla es Sevilla): la respuesta iría en la pregunta. Buscándola en el
 * mapa sí, porque ahí lo que hay que saber es dónde está.
 */
export function askableOf(atlas: Atlas, config: Pick<GameConfig, 'mode' | 'answer'>, countries: number[]): number[] {
  const pool = poolOf(atlas, config, countries);
  if (config.mode === 'inhabitants') return pool.filter((i) => clearlySmaller(atlas, pool, i).length >= 3);
  if (config.mode === 'capital' && config.answer !== 'map' && isCountryMap(atlas.map)) return pool.filter((i) => !namesItsCapital(atlas.countries[i]));
  return pool;
}

/** Las formas de responder de un reto que tienen algo que preguntar en esa zona. */
export function answersOf(atlas: Atlas, mode: Pick<ModeDef, 'id' | 'answers'>, countries: number[]): AnswerKind[] {
  return mode.answers.filter((answer) => askableOf(atlas, { mode: mode.id, answer }, countries).length > 0);
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
  const pool = poolOf(atlas, config, scope.countries);
  const askable = askableOf(atlas, config, scope.countries);
  const source = only ? only.filter((i) => askable.includes(i)) : askable;
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

/** ¿Tienen estas dos unidades la misma capital? (Praga lo es de la ciudad y de Bohemia Central.) */
const sameCapital = (atlas: Atlas, a: number, b: number): boolean => !!atlas.countries[a].capital && atlas.countries[a].capital === atlas.countries[b].capital;

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
      others.filter((c) => c.capital !== target.capital).map((c) => c.capital!),
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
      // Buscando de quién es una capital, vale cualquiera que la tenga.
      right = answer.index === question.country || (session.config.mode === 'capital' && sameCapital(atlas, answer.index, question.country));
      break;
    }
    case 'option': {
      const option = question.options.find((o) => o.id === answer.id);
      if (input !== 'choice' || !option) return ignored;
      key = option.id;
      right =
        session.config.mode === 'continent'
          ? target.continents.includes(option.id as ContinentKey)
          : session.config.mode === 'climate'
            ? target.climate.includes(option.id as ClimateKey)
            : session.config.mode === 'region'
              ? target.regions.includes(option.id)
              : session.config.mode === 'population'
                ? levelOf(target) === option.id
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
  if (grade >= 9) return t('Sobresaliente');
  if (grade >= 7) return t('Notable');
  if (grade >= 6) return t('Bien');
  if (grade >= 5) return t('Suficiente');
  return t('A repasar');
}

/** Países que no salieron a la primera, en el orden en que se preguntaron. */
export function missed(session: Session): number[] {
  return session.results.filter((r) => !r.review && r.outcome !== 'first').map((r) => r.country);
}
