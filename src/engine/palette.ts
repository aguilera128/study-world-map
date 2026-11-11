// Estilos con los que se pinta cada país y paletas del mapa para los dos temas de la interfaz.

/** Identificador de estilo de un país (se guarda en un Uint8Array, uno por país). */
export const Style = {
  /** País en blanco, a la espera de respuesta: el "mapa mudo". */
  blank: 0,
  /** País o territorio que no entra en el cuestionario actual. */
  muted: 1,
  /** Acertado a la primera. */
  ok: 2,
  /** Acertado tras algún fallo. */
  help: 3,
  /** No acertado (se muestra la solución). */
  fail: 4,
  /** País señalado por la pregunta o por el explorador. */
  target: 5,
  /** Colores del mapa político: political + (0…5). */
  political: 6,
  /** Niveles de dominio en la vista de progreso: mastery + (0…4). */
  mastery: 12,
  /** La Antártida en el mapa político: hielo, no un color del reparto. */
  ice: 17,
  /** Mapa de climas: climate + (0…9), en el orden de CLIMATE_KEYS. */
  climate: 18,
  /** Tierra sin más, de fondo en el mapa de geografía física: deja ver el relieve. */
  land: 28,
  /** Mapa de densidad de población: density + (0…4), de menos a más. */
  density: 29,
} as const;

export const STYLE_COUNT = 34;

export interface StyleDef {
  color: string;
  /** Elevación sobre el mapa (0–1, relativa a la elevación máxima). */
  lift: number;
  /** Énfasis del contorno (0–1). */
  emph: number;
}

export interface Palette {
  ocean: string;
  grid: string;
  gridAlpha: number;
  /** Fuerza del reflejo del agua (0 = mate). */
  glint: number;
  /** Cuánto se distinguen el mar profundo y las aguas someras (0 = color plano). */
  seaDepth: number;
  /** Cuánto se nota el relieve del fondo del mar (0 = liso). Va con la capa «Profundidad del mar». */
  seaRelief: number;
  /** Fuerza del sombreado del relieve sobre la tierra (0 = plano). */
  relief: number;
  /** Brillo de las estrellas alrededor del globo (0 = sin estrellas: sobre papel no pegan). */
  stars: number;
  /** Color y fuerza del borde claro del globo. */
  rim: string;
  rimAmount: number;
  rimPower: number;
  /** Luz mínima en la cara en sombra del globo (1 = sin sombreado). */
  shadow: number;
  halo: string;
  haloAlpha: number;
  haloFalloff: number;
  /** Desplazamiento del halo, en radios (una sombra proyectada sobre el papel). */
  haloOffset: [number, number];
  /** Contorno fino del globo. */
  outline: string;
  outlineAlpha: number;
  /** Cara nocturna en el modo de tiempo real: se oscurece (`nightDim`) y se tiñe hacia `nightTint`. */
  nightTint: string;
  nightDim: number;
  /** Sombra de la hoja en el mapa plano. */
  sheetShadow: string;
  sheetShadowAlpha: number;
  line: string;
  /** Fronteras durante una partida: en el mapa mudo son lo único que separa un país de otro. */
  linePlay: string;
  lineEmph: string;
  /** Color de los ríos. */
  river: string;
  /** Color de los límites de las placas tectónicas. */
  plate: string;
  /** Color de las líneas imaginarias (ecuador, trópicos…). */
  guide: string;
  /** Oscurecimiento de las paredes de un país levantado. */
  wallTint: number;
  /** Color al pasar el cursor sobre un país del mapa mudo (en blanco o ya resuelto): se mezcla con el suyo. */
  hover: string;
  hoverMix: number;
  /**
   * Al pasar el cursor sobre un país del mapa político no se tiñe: se aclara su mismo color, en esta
   * proporción. En los mapas de datos (dominio, climas, densidad) el color no cambia.
   */
  hoverOwn: number;
  /** El país señalado late entre `target` y este color. */
  pulse: string;
  styles: StyleDef[];
}

const s = (color: string, lift = 0, emph = 0): StyleDef => ({ color, lift, emph });

export const PAPER: Palette = {
  ocean: '#a8cbd6',
  grid: '#5f8fa3',
  gridAlpha: 0.22,
  glint: 0.3,
  seaDepth: 0.85,
  seaRelief: 0.55,
  relief: 0.9,
  stars: 0,
  rim: '#dcecf0',
  rimAmount: 0.3,
  rimPower: 2.8,
  shadow: 0.78,
  halo: '#1b2a3a',
  haloAlpha: 0.17,
  haloFalloff: 8,
  haloOffset: [0.03, -0.055],
  outline: '#1b2a3a',
  outlineAlpha: 0.5,
  nightTint: '#1f3352',
  nightDim: 0.5,
  sheetShadow: '#1b2a3a',
  sheetShadowAlpha: 0.16,
  line: '#8f897a',
  linePlay: '#6f6a5e',
  lineEmph: '#1b2a3a',
  river: '#4f86ab',
  guide: '#b4492f',
  plate: '#8a3ba8',
  wallTint: 0.7,
  hover: '#ffd95a',
  hoverMix: 0.62,
  hoverOwn: 0.5,
  pulse: '#4f7fb5',
  styles: [
    s('#fbf7ec'), // blank
    s('#d9dfd6'), // muted
    s('#5cb87e', 0.3, 0.6), // ok
    s('#f1bb4e', 0.24, 0.6), // help
    s('#e2695a', 0.18, 0.6), // fail
    s('#22364e', 0.62, 1), // target
    // mapa político
    s('#e9b4a2'),
    s('#efd58b'),
    s('#bcd7a5'),
    s('#cfc0dd'),
    s('#f5cba0'),
    s('#d9c9ae'),
    // dominio: sin ver → dominado
    s('#fbf7ec'),
    s('#f0a896'),
    s('#f3d27e'),
    s('#c3dc94'),
    s('#62b77c'),
    s('#eef3f4'), // hielo
    // mapa de climas (los colores habituales de los atlas escolares)
    s('#4f9a5e'), // ecuatorial
    s('#a9cf7e'), // tropical
    s('#f0d77a'), // desértico
    s('#e8b877'), // semiárido
    s('#e58a5a'), // mediterráneo
    s('#7fb9c9'), // oceánico
    s('#b9b565'), // subtropical húmedo
    s('#b497c9'), // continental
    s('#dfeaf2'), // polar
    s('#a8927d'), // alta montaña
    s('#e7dfc8'), // tierra (mapa físico)
    s('#f4ecd2'), // densidad 0
    s('#f0d596'), // densidad 1
    s('#e7ab5b'), // densidad 2
    s('#cf7534'), // densidad 3
    s('#93401f'), // densidad 4
  ],
};

export const NIGHT: Palette = {
  ocean: '#14263a',
  grid: '#6f9cc0',
  gridAlpha: 0.14,
  glint: 0.32,
  seaDepth: 1.35,
  seaRelief: 0.9,
  relief: 1,
  stars: 1,
  rim: '#6ea6d8',
  rimAmount: 0.42,
  rimPower: 2.4,
  shadow: 0.62,
  halo: '#5fa2dc',
  haloAlpha: 0.42,
  haloFalloff: 7,
  haloOffset: [0, 0],
  outline: '#a9d2f5',
  outlineAlpha: 0.3,
  nightTint: '#03070f',
  nightDim: 0.4,
  sheetShadow: '#000000',
  sheetShadowAlpha: 0.4,
  line: '#364250',
  linePlay: '#93a3b8',
  lineEmph: '#f3ead7',
  river: '#5f9cc4',
  guide: '#f0a070',
  plate: '#d48cf0',
  wallTint: 0.6,
  hover: '#ffd866',
  hoverMix: 0.5,
  hoverOwn: 0.38,
  pulse: '#ffd866',
  styles: [
    s('#3b5169'), // blank
    s('#22354a'), // muted
    s('#4fbf7f', 0.3, 0.6), // ok
    s('#e9b24a', 0.24, 0.6), // help
    s('#e26d5c', 0.18, 0.6), // fail
    s('#f3ead7', 0.62, 1), // target
    // mapa político
    // Más claros que el océano y entre sí distintos, pero lejos del verde, ámbar y rojo de las
    // respuestas (ok, help, fail), para que un país acertado no se confunda con uno «verde».
    s('#b98a7c'),
    s('#c9b163'),
    s('#8fae7a'),
    s('#a08fc2'),
    s('#cf9a6a'),
    s('#aa9c84'),
    // dominio
    s('#3b5169'),
    s('#a05a4c'),
    s('#b0914a'),
    s('#7c9a58'),
    s('#4fa36c'),
    s('#dbe6ee'), // hielo
    // mapa de climas (los colores habituales de los atlas escolares)
    s('#4a9160'), // ecuatorial
    s('#93bd72'), // tropical
    s('#d9c268'), // desértico
    s('#d3a568'), // semiárido
    s('#d37f58'), // mediterráneo
    s('#6aa7b8'), // oceánico
    s('#a6a35c'), // subtropical húmedo
    s('#a086bb'), // continental
    s('#cfdde8'), // polar
    s('#9b8773'), // alta montaña
    s('#75806e'), // tierra (mapa físico)
    s('#3d4654'), // densidad 0
    s('#6b6748'), // densidad 1
    s('#a5873f'), // densidad 2
    s('#d8923c'), // densidad 3
    s('#f5b75a'), // densidad 4
  ],
};

export type ThemeName = 'paper' | 'night';
export const PALETTES: Record<ThemeName, Palette> = { paper: PAPER, night: NIGHT };

/** '#rrggbb' → [r, g, b] en 0–1. */
export function rgb(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

/**
 * Huevo de pascua: el planeta de unos dibujos animados. Parte de la paleta de noche (las respuestas,
 * el progreso y los mapas de datos no cambian) y sube el color del mapa: mar turquesa, países en
 * tonos chillones, contornos casi negros y un resplandor verde alrededor.
 */
const TOON_STYLES: Record<number, string> = {
  [Style.blank]: '#8fe36f',
  [Style.muted]: '#57b58a',
  [Style.political]: '#7be26b',
  [Style.political + 1]: '#ffd84d',
  [Style.political + 2]: '#ff8a5c',
  [Style.political + 3]: '#ff6fb1',
  [Style.political + 4]: '#b58cff',
  [Style.political + 5]: '#59e0c0',
  [Style.ice]: '#eaffff',
  [Style.land]: '#8fe36f',
};

export const TOON: Palette = {
  ...NIGHT,
  ocean: '#2fc4e8',
  grid: '#0e6f9c',
  gridAlpha: 0.22,
  glint: 0.12,
  seaDepth: 0,
  seaRelief: 0,
  relief: 0,
  stars: 0.5,
  rim: '#c8ff7a',
  rimAmount: 0.5,
  rimPower: 2.1,
  shadow: 0.5,
  halo: '#7dff6a',
  haloAlpha: 0.55,
  haloFalloff: 6,
  outline: '#160d22',
  outlineAlpha: 1,
  line: '#160d22',
  linePlay: '#160d22',
  lineEmph: '#fff36b',
  hover: '#fff36b',
  styles: NIGHT.styles.map((style, i) => (TOON_STYLES[i] ? { ...style, color: TOON_STYLES[i] } : style)),
};
