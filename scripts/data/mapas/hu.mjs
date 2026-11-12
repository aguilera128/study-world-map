// Hungría por condados (vármegyék): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los diecinueve condados y Budapest, que tiene rango propio;
// no se agrupan aquí en nada.
//
// Natural Earth trae aparte las 23 ciudades con rango de condado (Debrecen, Szeged…), que no son
// unidades del mapa: `renombrar` da a cada una el código del condado en el que está y `fundir` las
// reúne con él. La capital del condado de Pest es Budapest, que no pertenece a él.

const c = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'hu',
  adm0: 'HUN',
  prefijo: 'HU-',
  fuente: 'Natural Earth 1:10m (admin 1, ciudades fundidas con su condado) · nombres y capitales: elaboración propia',
  wikidata: { tipo: { de: [/^Komitat /], fr: [/^comitat (de |d[’'])/i], eu: [/ konderria$/i] } },
  fundir: 'iso_3166_2',
  renombrar: {
    'HU-BC': 'HU-BE', 'HU-DE': 'HU-HB', 'HU-DU': 'HU-FE', 'HU-EG': 'HU-HE', 'HU-ED': 'HU-PE', 'HU-GY': 'HU-GS', 'HU-HV': 'HU-CS', 'HU-KV': 'HU-SO',
    'HU-KM': 'HU-BK', 'HU-MI': 'HU-BZ', 'HU-NK': 'HU-ZA', 'HU-NY': 'HU-SZ', 'HU-PS': 'HU-BA', 'HU-ST': 'HU-NO', 'HU-SN': 'HU-GS', 'HU-SD': 'HU-CS',
    'HU-SF': 'HU-FE', 'HU-SS': 'HU-TO', 'HU-SK': 'HU-JN', 'HU-SH': 'HU-VA', 'HU-TB': 'HU-KE', 'HU-VM': 'HU-VE', 'HU-ZE': 'HU-ZA',
  },

  contexto: ['AUT', 'SVK', 'UKR', 'ROU', 'SRB', 'HRV', 'SVN'],
  ventana: [9, 40.5, 41, 53],

  comunidades: {},

  provincias: [
    c('HU-BU', 'Budapest', 'Budapest'),
    c('HU-BK', 'Bács-Kiskun', 'Kecskemét', { alias: ['Bacs-Kiskun'], capAlias: ['Kecskemet'] }),
    c('HU-BA', 'Baranya', 'Pécs', { capAlias: ['Pecs'] }),
    c('HU-BE', 'Békés', 'Békéscsaba', { alias: ['Bekes'], capAlias: ['Bekescsaba'] }),
    c('HU-BZ', 'Borsod-Abaúj-Zemplén', 'Miskolc', { alias: ['Borsod-Abauj-Zemplen', 'Borsod'] }),
    c('HU-CS', 'Csongrád-Csanád', 'Szeged', { alias: ['Csongrad-Csanad', 'Csongrád', 'Csongrad'] }),
    c('HU-FE', 'Fejér', 'Székesfehérvár', { alias: ['Fejer'], capAlias: ['Szekesfehervar'] }),
    c('HU-GS', 'Győr-Moson-Sopron', 'Győr', { alias: ['Gyor-Moson-Sopron'], capAlias: ['Gyor'] }),
    c('HU-HB', 'Hajdú-Bihar', 'Debrecen', { alias: ['Hajdu-Bihar'] }),
    c('HU-HE', 'Heves', 'Eger'),
    c('HU-JN', 'Jász-Nagykun-Szolnok', 'Szolnok', { alias: ['Jasz-Nagykun-Szolnok'] }),
    c('HU-KE', 'Komárom-Esztergom', 'Tatabánya', { alias: ['Komarom-Esztergom'], capAlias: ['Tatabanya'] }),
    c('HU-NO', 'Nógrád', 'Salgótarján', { alias: ['Nograd'], capAlias: ['Salgotarjan'] }),
    c('HU-PE', 'Pest', 'Budapest'),
    c('HU-SO', 'Somogy', 'Kaposvár', { capAlias: ['Kaposvar'] }),
    c('HU-SZ', 'Szabolcs-Szatmár-Bereg', 'Nyíregyháza', { alias: ['Szabolcs-Szatmar-Bereg', 'Szabolcs'], capAlias: ['Nyiregyhaza'] }),
    c('HU-TO', 'Tolna', 'Szekszárd', { capAlias: ['Szekszard'] }),
    c('HU-VA', 'Vas', 'Szombathely'),
    c('HU-VE', 'Veszprém', 'Veszprém', { alias: ['Veszprem'], capAlias: ['Veszprem'] }),
    c('HU-ZA', 'Zala', 'Zalaegerszeg'),
  ],

  correcciones: {},
};
