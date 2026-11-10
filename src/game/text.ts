// Comparación tolerante de respuestas escritas: sin distinguir mayúsculas ni tildes y perdonando
// alguna errata, pero sin dar por buena la respuesta que en realidad nombra a otro país.

/**
 * Minúsculas, sin tildes ni signos, sin artículo inicial: «El Líbano» → «libano».
 * La ñ también pierde la virgulilla («espana»): no todos los teclados la tienen a mano.
 */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(el|la|los|las|the|le|les|der|die|das|il|lo|gli|els|os|as) /, '');
}

/** Distancia de edición (Levenshtein) con corte: devuelve `max + 1` en cuanto la supera. */
export function editDistance(a: string, b: string, max = Infinity): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + cost);
      if (row[j] < best) best = row[j];
    }
    if (best > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** Erratas que se perdonan según la longitud de la respuesta correcta. */
const tolerance = (length: number) => (length <= 4 ? 0 : length <= 8 ? 1 : 2);

/**
 * ¿Vale `input` como alguna de las respuestas `accepted`?
 *
 * `others` son las respuestas correctas de las demás preguntas posibles (los otros países o
 * capitales). Si lo escrito coincide con una de ellas, o se le parece más que a la correcta, no
 * se acepta: «Austria» no puede valer como errata de «Australia». En caso de empate («Austrlia»
 * está a una letra de las dos) se da por buena.
 */
export function matchesAnswer(input: string, accepted: string[], others: string[] = []): boolean {
  const text = normalize(input);
  if (!text) return false;
  let best = Infinity;
  for (const candidate of accepted) {
    const target = normalize(candidate);
    if (text === target) return true;
    const limit = tolerance(target.length);
    if (limit === 0) continue;
    const d = editDistance(text, target, limit);
    if (d <= limit && d < best) best = d;
  }
  if (best === Infinity) return false;
  for (const other of others) {
    if (editDistance(text, normalize(other), best - 1) < best) return false;
  }
  return true;
}

/** Pista para una respuesta escrita: primeras letras y huecos, «Fr _ _ _ _ _». */
export function hint(answer: string, revealed: number): string {
  let shown = 0;
  return [...answer]
    .map((ch) => {
      if (!/\p{L}/u.test(ch)) return ch;
      return shown++ < revealed ? ch : '_';
    })
    .join(' ')
    .replace(/ {3}/g, '   ');
}
