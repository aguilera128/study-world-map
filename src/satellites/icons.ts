import { SAT_GROUPS, type SatGroup } from './format';

// La silueta de cada grupo de satélites, como unas pocas piezas (rectángulos y círculos) en un
// cuadrado de −1 a 1 con el norte arriba. De aquí salen las dos versiones, para que sean la misma:
// la del mapa (una función GLSL que el sombreador de los puntos evalúa con gl_PointCoord) y la de la
// leyenda (SVG). Dibujos propios, sin relación con logotipos ni iconos de terceros.

export type IconPart = { box: [x: number, y: number, halfWidth: number, halfHeight: number, degrees?: number] } | { disc: [x: number, y: number, r: number] };

export const SAT_ICONS: Record<SatGroup, readonly IconPart[]> = {
  // Estación espacial: módulo central, una viga larga y dos paneles anchos a los lados.
  estaciones: [{ box: [0, 0, 0.92, 0.07] }, { box: [0, 0, 0.2, 0.26] }, { box: [-0.66, 0, 0.26, 0.5] }, { box: [0.66, 0, 0.26, 0.5] }],
  // Navegación: cuerpo cuadrado y dos paneles largos y estrechos en diagonal.
  navegacion: [{ box: [0, 0, 0.27, 0.27, 45] }, { box: [-0.5, 0.5, 0.42, 0.16, -45] }, { box: [0.5, -0.5, 0.42, 0.16, -45] }],
  // Meteorológico: cuerpo redondo, un único panel a un lado y la antena hacia la Tierra (abajo).
  meteorologicos: [{ disc: [0.18, 0.08, 0.34] }, { box: [-0.58, 0.08, 0.36, 0.2] }, { box: [0.18, -0.48, 0.07, 0.24] }],
  // Starlink: son miles y en el mapa van como un punto pequeño; en la leyenda, el mismo punto.
  starlink: [{ disc: [0, 0, 0.6] }],
};

const f = (n: number) => (Number.isInteger(n) ? `${n}.0` : String(n));

/** Distancia (negativa dentro) de `p` a una pieza, en GLSL. */
function partGlsl(part: IconPart): string {
  if ('disc' in part) {
    const [x, y, r] = part.disc;
    return `length(p - vec2(${f(x)}, ${f(y)})) - ${f(r)}`;
  }
  const [x, y, hw, hh, deg = 0] = part.box;
  const a = (-deg * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return `box(mat2(${f(c)}, ${f(s)}, ${f(-s)}, ${f(c)}) * (p - vec2(${f(x)}, ${f(y)})), vec2(${f(hw)}, ${f(hh)}))`;
}

/**
 * La función GLSL `float satIcon(vec2 p, float kind)`: distancia con signo de `p` a la silueta del
 * grupo `kind` (su índice en SAT_GROUPS), negativa dentro.
 */
export function iconGlsl(): string {
  const branches = SAT_GROUPS.map((g, k) => {
    const parts = SAT_ICONS[g].map(partGlsl);
    const body = parts.slice(1).reduce((acc, d) => `min(${acc}, ${d})`, parts[0]);
    return `  if (kind < ${f(k + 0.5)}) return ${body};`;
  });
  return `float box(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float satIcon(vec2 p, float kind) {
${branches.join('\n')}
  return 1.0;
}
`;
}

/** Las piezas de una silueta como elementos SVG (viewBox «−1 −1 2 2», el norte arriba). */
export function iconSvg(group: SatGroup): { tag: 'rect' | 'circle'; attrs: Record<string, number | string> }[] {
  return SAT_ICONS[group].map((part): { tag: 'rect' | 'circle'; attrs: Record<string, number | string> } => {
    if ('disc' in part) {
      const [x, y, r] = part.disc;
      return { tag: 'circle', attrs: { cx: x, cy: -y, r } };
    }
    const [x, y, hw, hh, deg = 0] = part.box;
    // En SVG la y crece hacia abajo: el giro cambia de sentido.
    return { tag: 'rect', attrs: { x: x - hw, y: -y - hh, width: 2 * hw, height: 2 * hh, transform: deg ? `rotate(${-deg} ${x} ${-y})` : '' } };
  });
}
