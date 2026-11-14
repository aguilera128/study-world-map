import type { GameConfig } from './config';
import { COUNTRY_IDS, COUNTRY_MAPS, countryModes, countryScopes } from './countryMaps.ts';

// Ranking de resultados: lo que comparten la aplicación y la función del servidor (api/ranking.ts).
// Este fichero no importa nada que se ejecute, salvo los datos de los mapas de un país (que tampoco
// importan nada): el servidor lo carga tal cual, y no debe arrastrar los diccionarios ni nada que
// necesite un navegador.
//
// Cada «categoría» tiene su ranking: el mismo mapa, reto, forma de responder, zona y número de
// preguntas. Solo entran las partidas que cualquiera puede repetir igual: las zonas que vienen de
// serie, no las listas propias ni una selección hecha a mano.

/** Cuántos resultados se guardan y se enseñan por categoría. */
export const TOP = 10;
/** Nota mínima para publicarse: un suspenso no es una marca. */
export const MIN_GRADE = 5;

/**
 * Qué se puede clasificar en cada mapa. Tiene que coincidir con los retos y las zonas de
 * src/game/maps.ts (lo comprueba ranking.test.ts); la última zona del mundo es la lista de ejemplo.
 */
export const RANKED: Record<string, { modes: readonly string[]; scopes: readonly string[] }> = {
  world: {
    modes: ['locate', 'continent', 'name', 'capital', 'flag', 'climate', 'population', 'inhabitants', 'coords'],
    scopes: ['mundo', 'europa', 'asia', 'africa', 'america', 'america-nc', 'america-sur', 'oceania', 'lista-50-principales'],
  },
  fisico: {
    modes: ['locate', 'name'],
    scopes: ['fisico', 'fisico-montanas', 'fisico-rios', 'fisico-mares', 'fisico-tierras'],
  },
  // Los mapas de un país: sus retos y sus zonas salen de ./countryMaps.ts.
  ...Object.fromEntries(COUNTRY_IDS.map((id) => [id, { modes: countryModes(COUNTRY_MAPS[id]), scopes: countryScopes(id) }])),
};
const ANSWERS: readonly string[] = ['map', 'choice', 'guided', 'type'];
const LENGTHS: readonly string[] = ['10', '20', 'all'];

/** La categoría de una partida normal, o null si no es de las que se clasifican. */
export function categoryOf(config: GameConfig): string | null {
  const category = `${config.map}/${config.mode}/${config.answer}/${config.scope}/${config.length}`;
  return isCategory(category) ? category : null;
}

/** La categoría del reto del día: las mismas diez preguntas para todos, un ranking por fecha. */
export const dailyCategory = (key: string) => `dia/${key}`;

/** Mediodía (UTC) de una fecha «AAAA-MM-DD» que existe, o NaN. */
function noonOf(date: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return Number.NaN;
  const day = Date.parse(`${date}T12:00:00Z`);
  // Date.parse admite el 31 de noviembre (lo pasa al 1 de diciembre): la fecha tiene que volver igual.
  return Number.isFinite(day) && new Date(day).toISOString().startsWith(date) ? day : Number.NaN;
}

/** ¿Es una categoría que existe? Las del reto del día, con una fecha que exista: así se leen. */
export function isCategory(category: string): boolean {
  const parts = category.split('/');
  if (parts[0] === 'dia') return parts.length === 2 && Number.isFinite(noonOf(parts[1]));
  if (parts.length !== 5) return false;
  const [map, mode, answer, scope, length] = parts;
  const ranked = Object.hasOwn(RANKED, map) ? RANKED[map] : null;
  return !!ranked && ranked.modes.includes(mode) && ranked.scopes.includes(scope) && ANSWERS.includes(answer) && LENGTHS.includes(length);
}

/** ¿Se puede publicar en ella? Las del reto del día, solo con una fecha de estos días. */
export function isPublishable(category: string, now = Date.now()): boolean {
  if (!isCategory(category)) return false;
  // La fecha es la del dispositivo de quien juega: se admite un día de margen por los husos.
  return !category.startsWith('dia/') || Math.abs(noonOf(category.slice(4)) - now) < 2 * 86_400_000;
}

/** Un resultado, como se envía y como se guarda. */
export interface RankResult {
  /** Nota sobre 10. */
  grade: number;
  /** Tiempo de la partida, en milisegundos. */
  ms: number;
  /** Preguntas de la partida. */
  total: number;
}

/** Fila del ranking, como la devuelve el servidor. */
export interface RankRow {
  nick: string;
  /** País desde el que se publicó (dos letras, en minúsculas), si se supo. */
  country: string | null;
  grade: number;
  ms: number;
  /** Cuándo se publicó (fecha ISO). */
  at: string;
}

/** Un ranking que tiene resultados, en el resumen de todos: su mejor resultado y cuántos hay. */
export interface RankBoard {
  category: string;
  count: number;
  best: RankRow;
}

/**
 * ¿Puede ser el resultado de una partida de verdad? No evita las trampas (la nota la calcula el
 * navegador), pero sí lo imposible: una nota que no sale de ninguna combinación de aciertos o una
 * partida más rápida de lo que se tarda en leer las preguntas.
 */
export function plausible(result: RankResult): boolean {
  const { grade, ms, total } = result;
  if (![grade, ms, total].every((v) => typeof v === 'number' && Number.isFinite(v))) return false;
  if (!Number.isInteger(total) || total < 1 || total > 400) return false;
  if (grade < 0 || grade > 10) return false;
  // Cada pregunta vale un punto a la primera y medio con ayuda: la nota sale de medios puntos.
  const halves = (grade * total) / 5;
  if (Math.abs(halves - Math.round(halves)) > 1e-6) return false;
  return Number.isInteger(ms) && ms >= total * 600 && ms <= 6 * 3_600_000;
}

/** Orden del ranking: mejor nota y, a igual nota, menos tiempo. Negativo si «a» va delante. */
export function compare(a: { grade: number; ms: number }, b: { grade: number; ms: number }): number {
  return Math.abs(a.grade - b.grade) > 1e-9 ? b.grade - a.grade : a.ms - b.ms;
}

/** ¿Entraría este resultado entre los mejores, visto el ranking actual (ya ordenado)? */
export function qualifies(result: { grade: number; ms: number }, top: readonly { grade: number; ms: number }[]): boolean {
  return result.grade >= MIN_GRADE && (top.length < TOP || compare(result, top[TOP - 1]) < 0);
}

// ───────────────────────── Apodos ─────────────────────────

const NICK_MIN = 2;
export const NICK_MAX = 16;
/** Con más cifras cabe un teléfono. */
const NICK_DIGITS = 4;

// Insultos inequívocos, sin tildes. Los largos se buscan dentro de cada palabra; los cortos, solo al
// principio, para no vetar «computadora» o «disputa». No pretende ser completo: lo que se cuele se
// borra a mano (scripts/ranking.mjs).
const BANNED_INSIDE = ['mierda', 'cabron', 'gilipolla', 'maricon', 'subnormal', 'hitler', 'faggot', 'pendej', 'imbecil', 'retrasad'];
const BANNED_START = ['puta', 'puto', 'fuck', 'shit', 'nazi', 'cunt', 'porn', 'verga', 'nigg', 'bitch', 'polla', 'whore', 'pussy', 'idiota'];

/**
 * El apodo tal como se publica, o null si no vale: de 2 a 16 caracteres, solo letras (de cualquier
 * alfabeto), cifras, espacios, guiones y guiones bajos. Sin arrobas ni puntos, para que no quepa un
 * correo ni una dirección.
 */
export function cleanNick(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const nick = raw.normalize('NFC').replace(/\s+/g, ' ').trim();
  const length = [...nick].length;
  if (length < NICK_MIN || length > NICK_MAX) return null;
  if (!/^[\p{L}\p{N} _-]+$/u.test(nick) || !/\p{L}/u.test(nick)) return null;
  if ((nick.match(/\p{N}/gu) ?? []).length > NICK_DIGITS) return null;
  const words = nick
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}]+/u);
  if (words.some((word) => BANNED_INSIDE.some((bad) => word.includes(bad)) || BANNED_START.some((bad) => word.startsWith(bad)))) return null;
  return nick;
}

// Lugares del mapa que se llaman igual, o casi, en todos los idiomas de la aplicación: el apodo
// sugerido no necesita traducción.
const PLACES = (
  'Everest Sahara Gobi Kalahari Atacama Andes Himalaya Titicaca Baikal Congo Mekong Ganges Volga Yukon Orinoco ' +
  'Etna Fuji Teide Aconcagua Denali Elbrus Krakatoa Borneo Sumatra Tasmania Madagascar Java Patagonia Siberia ' +
  'Sahel Tundra Taiga Pampa Amazonas Kilimanjaro Vesubio Bering Yucatan Sinai Tigris Zambeze Mackenzie Altai Ural'
).split(' ');

/** Un apodo para proponer: un lugar y un número («Atacama 42»). Quien juega lo puede cambiar. */
export function suggestNick(random: () => number = Math.random): string {
  return `${PLACES[Math.floor(random() * PLACES.length)]} ${10 + Math.floor(random() * 90)}`;
}
