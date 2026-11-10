import { t } from '../i18n';

// Las capas del interior de la Tierra y de la atmósfera: las usan el diálogo «El planeta» y el aviso del mapa.
export const EARTH_KM = 6371;

/**
 * Radio exterior de cada capa, en km desde el centro, de dentro afuera. Profundidades contrastadas
 * (USGS «The Interior of the Earth», Wikipedia «Internal structure of Earth», IGN): corteza oceánica
 * de 5 a 10 km y continental de 30 a 70; manto superior hasta 660 km; núcleo externo de 2900 a
 * 5150 km; núcleo interno de 1221 km de radio.
 */
export const INTERIOR = [
  { id: 'inner', radius: 1221, color: '#ffe08a', name: t('Núcleo interno'), detail: t('Hierro y níquel sólidos · de 5150 a 6371 km') },
  { id: 'outer', radius: 3471, color: '#f4a23a', name: t('Núcleo externo'), detail: t('Hierro y níquel líquidos; su movimiento crea el campo magnético · de 2900 a 5150 km') },
  { id: 'lower', radius: 5711, color: '#d2562a', name: t('Manto inferior'), detail: t('Roca sólida, más densa y caliente · de 660 a 2900 km') },
  { id: 'upper', radius: 6336, color: '#b5643a', name: t('Manto superior'), detail: t('Roca sólida que fluye muy despacio (peridotita) · hasta 660 km') },
  { id: 'crust', radius: EARTH_KM, color: '#8a6a48', name: t('Corteza'), detail: t('Roca sólida · oceánica (basalto) de 5 a 10 km, continental (granito) de 30 a 70 km') },
];

/** Las superficies que separan una capa de la siguiente, de fuera adentro. */
export const DISCONTINUITIES = [
  { id: 'moho', color: '#3a2c20', name: t('Discontinuidad de Mohorovičić (Moho)'), detail: t('Separa la corteza del manto · a unos 7 km bajo los océanos y 35 km bajo los continentes') },
  { id: 'd660', color: '#7a3a22', name: t('Discontinuidad de 660 km'), detail: t('Separa el manto superior del inferior · algunos libros la llaman de Repetti') },
  { id: 'gutenberg', color: '#ffb45a', name: t('Discontinuidad de Gutenberg'), detail: t('Separa el manto del núcleo · a unos 2900 km') },
  { id: 'lehmann', color: '#fff0b0', name: t('Discontinuidad de Lehmann'), detail: t('Separa el núcleo externo del interno · a unos 5150 km') },
];

/** De arriba abajo. */
export const ATMOSPHERE = [
  { id: 'exo', color: '#0f1a33', name: t('Exosfera'), detail: t('Más de 700 km · se va diluyendo en el espacio') },
  { id: 'thermo', color: '#1d3566', name: t('Termosfera'), detail: t('De 80 a 700 km · auroras y Estación Espacial') },
  { id: 'meso', color: '#2f5c9c', name: t('Mesosfera'), detail: t('De 50 a 80 km · aquí se desintegran los meteoros') },
  { id: 'strato', color: '#5b93cf', name: t('Estratosfera'), detail: t('De 12 a 50 km · contiene la capa de ozono') },
  { id: 'tropo', color: '#a9d2f0', name: t('Troposfera'), detail: t('Hasta unos 12 km · aquí están las nubes y el tiempo') },
];
