import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// Contraste de texto (WCAG 2.2 AA, 4,5:1) de los colores de index.css en los dos temas: las notas en
// --ink-faint y el texto --on-tone sobre los tonos de acierto, ayuda y fallo (rótulos del mapa y
// opción acertada), que se oscurecen --tone-shade como hace color-mix(in srgb, …, black).

const css = readFileSync('src/index.css', 'utf8');
const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)));
const THEMES = { paper: block("[data-theme='paper'] {"), night: block("[data-theme='night'] {") };

const token = (theme: string, name: string) => {
  const m = theme.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!m) throw new Error(`falta --${name}`);
  return m[1].trim();
};
const rgb = (hex: string) => {
  const h = hex.length === 4 ? hex.replace(/\w/g, (c) => c + c) : hex;
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const luminance = (c: number[]) => {
  const [r, g, b] = c.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [name, theme] of Object.entries(THEMES)) {
  test(`--ink-faint llega a 4,5:1 sobre el papel y la superficie (${name})`, () => {
    for (const bg of ['paper', 'surface']) {
      expect(ratio(rgb(token(theme, 'ink-faint')), rgb(token(theme, bg)))).toBeGreaterThanOrEqual(4.5);
    }
  });

  test(`--on-tone llega a 4,5:1 sobre ok, help y bad (${name})`, () => {
    const shade = 1 - parseFloat(token(theme, 'tone-shade')) / 100;
    for (const tone of ['ok', 'help', 'bad']) {
      const bg = rgb(token(theme, tone)).map((v) => v * shade);
      expect(ratio(rgb(token(theme, 'on-tone')), bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
}
