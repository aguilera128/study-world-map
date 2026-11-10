import { t } from '../i18n';

// Las capas del interior de la Tierra: las usan el diálogo «El planeta» y el aviso del mapa.
export const EARTH_KM = 6371;

/** Radio exterior de cada capa, en km desde el centro, de dentro afuera. */
export const INTERIOR = [
  { id: 'inner', radius: 1221, color: '#ffe08a', name: t('Núcleo interno'), detail: t('Hierro y níquel sólidos · de 5100 a 6371 km') },
  { id: 'outer', radius: 3471, color: '#f4a23a', name: t('Núcleo externo'), detail: t('Hierro y níquel líquidos · de 2900 a 5100 km') },
  { id: 'mantle', radius: 6336, color: '#d2562a', name: t('Manto'), detail: t('Roca que fluye muy despacio · hasta 2900 km de profundidad') },
  { id: 'crust', radius: EARTH_KM, color: '#8a6a48', name: t('Corteza'), detail: t('Roca sólida · de 5 a 70 km de grosor') },
];
