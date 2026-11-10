import type { Country } from '../atlas/types';
import { t } from '../i18n';

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

// Para el reto «Población»: la densidad de un país, en tres niveles. Los cortes (25 y 100 hab./km²)
// son una elección de esta web, no una norma: si el examen usa otros, se cambian aquí.

export type LevelKey = 'baja' | 'media' | 'alta';
export const LEVEL_KEYS: LevelKey[] = ['baja', 'media', 'alta'];
export const LEVEL_LIMITS = [25, 100];

/** Nivel de densidad de un país, o null si no hay dato. */
export function levelOf(country: Pick<Country, 'population' | 'areaKm2'>): LevelKey | null {
  const value = density(country);
  return value === null ? null : LEVEL_KEYS[LEVEL_LIMITS.filter((limit) => value >= limit).length];
}

export const levelLabel = (key: LevelKey): string => ({ baja: t('Baja'), media: t('Media'), alta: t('Alta') })[key];

/** «menos de 25 hab./km²» */
export const levelRange = (key: LevelKey): string =>
  ({
    baja: t('menos de {n} hab./km²', { n: LEVEL_LIMITS[0] }),
    media: t('de {a} a {b} hab./km²', { a: LEVEL_LIMITS[0], b: LEVEL_LIMITS[1] }),
    alta: t('más de {n} hab./km²', { n: LEVEL_LIMITS[1] }),
  })[key];
