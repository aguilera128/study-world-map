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

// Para el reto «Población»: la población total de un país (no su densidad), en tres niveles. No hay
// un criterio oficial; se usan los cortes con los que se da en clase: baja por debajo de 40 millones
// de habitantes, media de 40 a 100 y alta a partir de 100. En clase la alta se da como «de 100 a
// 350 millones»; los dos países que pasan de ahí (China e India) cuentan también como alta. Si el
// examen usa otros cortes, se cambian aquí.

export type LevelKey = 'baja' | 'media' | 'alta';
export const LEVEL_KEYS: LevelKey[] = ['baja', 'media', 'alta'];
/** Límites entre niveles, en millones de habitantes. */
export const LEVEL_LIMITS = [40, 100];

/** Nivel de población de un país, o null si no hay dato. */
export function levelOf(country: Pick<Country, 'population'>): LevelKey | null {
  const people = country.population;
  return people ? LEVEL_KEYS[LEVEL_LIMITS.filter((limit) => people >= limit * 1e6).length] : null;
}

export const levelLabel = (key: LevelKey): string => ({ baja: t('Baja'), media: t('Media'), alta: t('Alta') })[key];

/** «menos de 40 millones» */
export const levelRange = (key: LevelKey): string =>
  ({
    baja: t('menos de {n} millones', { n: LEVEL_LIMITS[0] }),
    media: t('de {a} a {b} millones', { a: LEVEL_LIMITS[0], b: LEVEL_LIMITS[1] }),
    alta: t('más de {n} millones', { n: LEVEL_LIMITS[1] }),
  })[key];
