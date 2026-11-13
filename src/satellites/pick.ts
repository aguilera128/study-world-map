// Qué satélite hay bajo el cursor: el más cercano en pantalla dentro de un radio, sin contar los que
// tapa la Tierra. Solo cuentas, sin three.js: el motor le pasa cómo proyectar cada punto.

/**
 * ¿Tapa la Tierra (esfera de radio 1 en el origen) el punto `p` visto desde `eye`? Lo tapa si la
 * recta entre los dos pasa por dentro de la esfera antes de llegar al punto.
 */
export function hiddenByEarth(eye: readonly [number, number, number], p: readonly [number, number, number]): boolean {
  const d = [p[0] - eye[0], p[1] - eye[1], p[2] - eye[2]];
  const len2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  if (len2 === 0) return false;
  const t = Math.max(0, Math.min(1, -(eye[0] * d[0] + eye[1] * d[1] + eye[2] * d[2]) / len2));
  return Math.hypot(eye[0] + d[0] * t, eye[1] + d[1] * t, eye[2] + d[2] * t) < 1;
}

/**
 * El índice del punto más cercano a (x, y) en pantalla, a menos de `radius` píxeles, o −1.
 * `screenOf(i, out)` escribe la posición en pantalla del punto i y dice si se ve. Con miles de
 * puntos (Starlink) son unas pocas cuentas por punto: no hace falta rejilla.
 */
export function nearestOnScreen(count: number, screenOf: (i: number, out: { x: number; y: number }) => boolean, x: number, y: number, radius: number): number {
  const out = { x: 0, y: 0 };
  let best = -1;
  let bestD = radius * radius + 1e-9;
  for (let i = 0; i < count; i++) {
    if (!screenOf(i, out)) continue;
    const d = (out.x - x) ** 2 + (out.y - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}
