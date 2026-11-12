// Suiza por cantones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Los veintiséis cantones no se agrupan en nada: no hay «comunidades».

/**
 * @param {string} iso      ISO 3166-2 del cantón
 * @param {string} nombre   Nombre en español
 * @param {string} capital
 * @param {{ alias?: string[], capAlias?: string[] }} [extra]  otros nombres aceptados al escribir
 */
const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'ch',
  adm0: 'CHE',
  prefijo: 'CH-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  /** Los cantones pequeños (Basilea-Ciudad, 37 km²) piden algo más de detalle que una provincia. */
  detalle: 5e-6,

  contexto: ['FRA', 'DEU', 'AUT', 'LIE', 'ITA'],
  ventana: [-6, 35, 19, 56],

  comunidades: {},

  provincias: [
    c('CH-AG', 'Argovia', 'Aarau', { alias: ['Aargau'] }),
    c('CH-AR', 'Appenzell Rodas Exteriores', 'Herisau', { alias: ['Appenzell Ausserrhoden', 'Appenzell Exterior'] }),
    c('CH-AI', 'Appenzell Rodas Interiores', 'Appenzell', { alias: ['Appenzell Innerrhoden', 'Appenzell Interior'] }),
    c('CH-BL', 'Basilea-Campiña', 'Liestal', { alias: ['Basel-Landschaft', 'Basilea Campiña'] }),
    c('CH-BS', 'Basilea-Ciudad', 'Basilea', { alias: ['Basel-Stadt', 'Basilea Ciudad'], capAlias: ['Basel'] }),
    c('CH-BE', 'Berna', 'Berna', { alias: ['Bern'], capAlias: ['Bern'] }),
    c('CH-FR', 'Friburgo', 'Friburgo', { alias: ['Fribourg', 'Freiburg'], capAlias: ['Fribourg', 'Freiburg'] }),
    c('CH-GE', 'Ginebra', 'Ginebra', { alias: ['Genève', 'Geneve'], capAlias: ['Genève', 'Geneve'] }),
    c('CH-GL', 'Glaris', 'Glaris', { alias: ['Glarus'], capAlias: ['Glarus'] }),
    c('CH-GR', 'Grisones', 'Coira', { alias: ['Graubünden', 'Los Grisones'], capAlias: ['Chur'] }),
    c('CH-JU', 'Jura', 'Delémont'),
    c('CH-LU', 'Lucerna', 'Lucerna', { alias: ['Luzern'], capAlias: ['Luzern'] }),
    c('CH-NE', 'Neuchâtel', 'Neuchâtel'),
    c('CH-NW', 'Nidwalden', 'Stans', { alias: ['Nidwaldo'] }),
    c('CH-OW', 'Obwalden', 'Sarnen', { alias: ['Obwaldo'] }),
    c('CH-SG', 'San Galo', 'San Galo', { alias: ['Sankt Gallen', 'St. Gallen'], capAlias: ['Sankt Gallen', 'St. Gallen'] }),
    c('CH-SH', 'Schaffhausen', 'Schaffhausen', { alias: ['Escafusa'], capAlias: ['Escafusa'] }),
    c('CH-SZ', 'Schwyz', 'Schwyz'),
    c('CH-SO', 'Soleura', 'Soleura', { alias: ['Solothurn'], capAlias: ['Solothurn'] }),
    c('CH-TG', 'Turgovia', 'Frauenfeld', { alias: ['Thurgau'] }),
    c('CH-TI', 'Tesino', 'Bellinzona', { alias: ['Ticino'] }),
    c('CH-UR', 'Uri', 'Altdorf'),
    c('CH-VS', 'Valais', 'Sion', { alias: ['Wallis'], capAlias: ['Sión'] }),
    c('CH-VD', 'Vaud', 'Lausana', { capAlias: ['Lausanne'] }),
    c('CH-ZG', 'Zug', 'Zug'),
    c('CH-ZH', 'Zúrich', 'Zúrich', { alias: ['Zürich'], capAlias: ['Zürich'] }),
  ],

  correcciones: {
    // El cantón toma el nombre de su capital, que en alemán lleva apellido para no confundirla con la de Alemania.
    de: { provincias: { 'CH-FR': { nombre: 'Freiburg', capital: 'Freiburg', capAlias: ['Freiburg im Üechtland'] } } },
    // Caracteres simplificados.
    zh: { provincias: { 'CH-GL': { nombre: '格拉鲁斯', capital: '格拉鲁斯' } } },
  },
};
