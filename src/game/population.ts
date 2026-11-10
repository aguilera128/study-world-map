import type { Country } from '../atlas/types';

// Densidad de población: cinco tramos, los de un mapa escolar. Los datos (habitantes del Banco
// Mundial y superficie) van en el atlas; aquí solo se reparten en tramos.

/** Límites entre tramos, en habitantes por km². */
export const DENSITY_LIMITS = [10, 50, 100, 300];
export const DENSITY_LABELS = ['< 10', '10 – 50', '50 – 100', '100 – 300', '> 300'];

/** Habitantes por km², o null si falta la población o la superficie. */
export function density(country: Pick<Country, 'population' | 'areaKm2'>): number | null {
  return country.population && country.areaKm2 ? country.population / country.areaKm2 : null;
}

/** Tramo (0…4) de una densidad. */
export const densityClass = (value: number): number => DENSITY_LIMITS.filter((limit) => value >= limit).length;
