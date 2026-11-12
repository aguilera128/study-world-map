// Francia por regiones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Son las trece regiones metropolitanas (las de 2016); las cinco de ultramar
// quedan fuera de la ventana. No se agrupan en nada.
//
// Natural Earth trae los 96 departamentos, cada uno con el código de su región (`region_cod`):
// `fundir` los reúne por ese campo. A Córcega le da un código que ya no es el de ISO 3166-2.

const r = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'fr',
  adm0: 'FRA',
  prefijo: 'FR-',
  fuente: 'Natural Earth 1:10m (admin 1, departamentos fundidos por región) · nombres y capitales: elaboración propia',
  wikidata: {},
  fundir: 'region_cod',
  renombrar: { 'FR-COR': 'FR-20R' },

  contexto: ['ESP', 'AND', 'ITA', 'CHE', 'DEU', 'LUX', 'BEL', 'MCO'],
  ventana: [-10.5, 35, 19, 56],

  comunidades: {},

  provincias: [
    r('FR-ARA', 'Auvernia-Ródano-Alpes', 'Lyon', { alias: ['Auvergne-Rhône-Alpes', 'Auvernia Ródano Alpes'], capAlias: ['Lion'] }),
    r('FR-BFC', 'Borgoña-Franco Condado', 'Dijon', { alias: ['Bourgogne-Franche-Comté', 'Borgoña Franco Condado'] }),
    r('FR-BRE', 'Bretaña', 'Rennes', { alias: ['Bretagne'] }),
    r('FR-CVL', 'Centro-Valle de Loira', 'Orleans', { alias: ['Centre-Val de Loire', 'Centro-Valle del Loira', 'Centro Valle de Loira'], capAlias: ['Orléans'] }),
    r('FR-20R', 'Córcega', 'Ajaccio', { alias: ['Corse', 'Corcega'], capAlias: ['Ayacio'] }),
    r('FR-GES', 'Gran Este', 'Estrasburgo', { alias: ['Grand Est'], capAlias: ['Strasbourg'] }),
    r('FR-HDF', 'Alta Francia', 'Lille', { alias: ['Hauts-de-France', 'Altos de Francia'], capAlias: ['Lila'] }),
    r('FR-IDF', 'Isla de Francia', 'París', { alias: ['Île-de-France', 'Ile-de-France'], capAlias: ['Paris'] }),
    r('FR-NOR', 'Normandía', 'Ruan', { alias: ['Normandie'], capAlias: ['Rouen'] }),
    r('FR-NAQ', 'Nueva Aquitania', 'Burdeos', { alias: ['Nouvelle-Aquitaine'], capAlias: ['Bordeaux'] }),
    r('FR-OCC', 'Occitania', 'Toulouse', { alias: ['Occitanie'], capAlias: ['Tolosa'] }),
    r('FR-PDL', 'Países del Loira', 'Nantes', { alias: ['Pays de la Loire'] }),
    r('FR-PAC', 'Provenza-Alpes-Costa Azul', 'Marsella', { alias: ['Provence-Alpes-Côte d’Azur', 'Provenza Alpes Costa Azul', 'PACA'], capAlias: ['Marseille'] }),
  ],

  correcciones: {
    // Wikidata da las formas de Portugal; aquí el portugués es el de Brasil.
    pt: { provincias: { 'FR-CVL': { capital: 'Orléans' }, 'FR-NOR': { capital: 'Rouen' }, 'FR-NAQ': { capital: 'Bordeaux' } } },
    zh: { provincias: { 'FR-BRE': { capital: '雷恩' } } },
  },
};
