import type { ClimateKey } from '../atlas/types';
import { t } from '../i18n';

// Los climas que se estudian en la ESO. Qué climas tiene cada país lo decide el generador del atlas
// (scripts/data/climas.mjs), a partir del mapa de Köppen-Geiger.
const LABELS: Record<ClimateKey, string> = {
  ecuatorial: t('Ecuatorial'),
  tropical: t('Tropical'),
  desertico: t('Desértico'),
  semiarido: t('Semiárido'),
  mediterraneo: t('Mediterráneo'),
  oceanico: t('Oceánico'),
  subtropical: t('Subtropical húmedo'),
  continental: t('Continental'),
  polar: t('Polar'),
  montana: t('De alta montaña'),
};

/** Todos los climas, en el orden de la leyenda: de la zona cálida a la fría. */
export const CLIMATE_KEYS = Object.keys(LABELS) as ClimateKey[];

export const climateLabel = (key: ClimateKey) => LABELS[key];

/** «Mediterráneo, Oceánico»: los `max` climas más extendidos de un país. */
export const climateText = (climate: ClimateKey[], max = climate.length) =>
  climate
    .slice(0, max)
    .map((key) => LABELS[key])
    .join(', ');
