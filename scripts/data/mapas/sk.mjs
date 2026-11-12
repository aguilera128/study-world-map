// Eslovaquia por regiones: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Las ocho regiones llevan el nombre de su capital y no se agrupan en nada.

const r = (iso, nombre, extra = {}) => ({ iso, nombre, capital: nombre, ...extra });

export default {
  id: 'sk',
  adm0: 'SVK',
  prefijo: 'SK-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},

  contexto: ['CZE', 'POL', 'UKR', 'HUN', 'AUT'],
  ventana: [11, 44, 41, 55.5],

  comunidades: {},

  provincias: [
    r('SK-BL', 'Bratislava'),
    r('SK-TA', 'Trnava'),
    r('SK-TC', 'Trenčín', { alias: ['Trencin'], capAlias: ['Trencin'] }),
    r('SK-NI', 'Nitra'),
    r('SK-ZI', 'Žilina', { alias: ['Zilina'], capAlias: ['Zilina'] }),
    r('SK-BC', 'Banská Bystrica', { alias: ['Banska Bystrica'], capAlias: ['Banska Bystrica'] }),
    r('SK-PV', 'Prešov', { alias: ['Presov'], capAlias: ['Presov'] }),
    r('SK-KI', 'Košice', { alias: ['Kosice'], capAlias: ['Kosice'] }),
  ],

  correcciones: {},
};
