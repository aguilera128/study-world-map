// Climas que se muestran de cada país. Los porcentajes salen de scripts/data/climas.koppen.json
// (scripts/build-climate.mjs); aquí están la lista de climas, el criterio y las correcciones a mano.

/** Los climas que se estudian en la ESO, por zonas (cálida, templada y fría), y su nombre en español. */
export const CLIMAS = {
  ecuatorial: 'Ecuatorial',
  tropical: 'Tropical',
  desertico: 'Desértico',
  semiarido: 'Semiárido',
  mediterraneo: 'Mediterráneo',
  oceanico: 'Oceánico',
  subtropical: 'Subtropical húmedo',
  continental: 'Continental',
  polar: 'Polar',
  montana: 'De alta montaña',
};

/** Se enseñan el clima con más territorio y los que ocupan al menos este porcentaje, hasta `MAX`. */
export const MINIMO = 8;
export const MAX = 4;

/**
 * Países en los que la rejilla (una celda cada medio grado, es decir, unos 50 km) no refleja lo
 * que se estudia: microestados de montaña, costas mediterráneas estrechas y el caso de Italia.
 */
export const CORRECCIONES = {
  AND: ['montana'], // Pirineos: la celda más cercana cae en la vertiente francesa (oceánico)
  LIE: ['montana', 'continental'], // Alpes
  CHE: ['montana', 'continental'], // los Alpes ocupan más de la mitad; la meseta es de transición
  SMR: ['mediterraneo'], // dentro de la Italia peninsular
  ITA: ['mediterraneo', 'continental', 'montana'], // el mediterráneo es el de la península y las islas; el continental, el del valle del Po
  FRA: ['oceanico', 'mediterraneo', 'montana'], // la costa mediterránea y los Alpes y Pirineos ocupan pocas celdas
  HRV: ['continental', 'mediterraneo'], // la costa dálmata es mediterránea
  MNE: ['continental', 'mediterraneo'], // ídem, la costa adriática
};

/** Climas de un país, de más a menos extendido. */
export function climasDe(id, porcentajes) {
  if (CORRECCIONES[id]) return CORRECCIONES[id];
  if (!porcentajes) return undefined;
  return Object.entries(porcentajes)
    .filter(([, pct], i) => i === 0 || pct >= MINIMO)
    .slice(0, MAX)
    .map(([clima]) => clima);
}
