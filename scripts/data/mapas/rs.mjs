// Serbia por distritos (okruzi): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los veinticuatro distritos y la ciudad de Belgrado, que tiene
// rango de distrito; no se agrupan aquí en nada. Kosovo va entre los vecinos, como en el mapa del mundo.
//
// Natural Earth llama «Pomoravski» a dos distritos (el RS-19 es Rasina): los códigos están bien.

const d = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'rs',
  adm0: 'SRB',
  prefijo: 'RS-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {
    tipo: {
      en: [/ District$/i],
      fr: [/^district (de la |de |du |des |d[’'])/i],
      de: [/^(Okrug|Bezirk) /i],
      it: [/^distretto (di |del |della |dello |d[’'])/i],
      pt: [/^distrito (de |do |da )/i],
      ca: [/^districte (de |del |d[’'])/i],
      gl: [/^distrito (de |do |da )/i],
      eu: [/ barrutia$/i],
    },
  },

  contexto: ['HUN', 'ROU', 'BGR', 'MKD', 'KOS', 'MNE', 'BIH', 'HRV'],
  ventana: [13, 40, 30.5, 49],

  comunidades: {},

  provincias: [
    d('RS-00', 'Belgrado', 'Belgrado', { alias: ['Beograd'], capAlias: ['Beograd'] }),
    d('RS-01', 'Bačka del Norte', 'Subotica', { alias: ['Backa del Norte', 'Severnobački'] }),
    d('RS-02', 'Banato Central', 'Zrenjanin', { alias: ['Srednjebanatski'] }),
    d('RS-03', 'Banato del Norte', 'Kikinda', { alias: ['Severnobanatski'] }),
    d('RS-04', 'Banato del Sur', 'Pančevo', { alias: ['Južnobanatski'], capAlias: ['Pancevo'] }),
    d('RS-05', 'Bačka del Oeste', 'Sombor', { alias: ['Backa del Oeste', 'Zapadnobački'] }),
    d('RS-06', 'Bačka del Sur', 'Novi Sad', { alias: ['Backa del Sur', 'Južnobački'] }),
    d('RS-07', 'Sirmia', 'Sremska Mitrovica', { alias: ['Srem', 'Sremski'] }),
    d('RS-08', 'Mačva', 'Šabac', { alias: ['Macva'], capAlias: ['Sabac'] }),
    d('RS-09', 'Kolubara', 'Valjevo'),
    d('RS-10', 'Podunavlje', 'Smederevo'),
    d('RS-11', 'Braničevo', 'Požarevac', { alias: ['Branicevo'], capAlias: ['Pozarevac'] }),
    d('RS-12', 'Šumadija', 'Kragujevac', { alias: ['Sumadija'] }),
    d('RS-13', 'Pomoravlje', 'Jagodina'),
    d('RS-14', 'Bor', 'Bor'),
    d('RS-15', 'Zaječar', 'Zaječar', { alias: ['Zajecar'], capAlias: ['Zajecar'] }),
    d('RS-16', 'Zlatibor', 'Užice', { capAlias: ['Uzice'] }),
    d('RS-17', 'Moravica', 'Čačak', { capAlias: ['Cacak'] }),
    d('RS-18', 'Raška', 'Kraljevo', { alias: ['Raska'] }),
    d('RS-19', 'Rasina', 'Kruševac', { capAlias: ['Krusevac'] }),
    d('RS-20', 'Nišava', 'Niš', { alias: ['Nisava'], capAlias: ['Nis'] }),
    d('RS-21', 'Toplica', 'Prokuplje'),
    d('RS-22', 'Pirot', 'Pirot'),
    d('RS-23', 'Jablanica', 'Leskovac'),
    d('RS-24', 'Pčinja', 'Vranje', { alias: ['Pcinja'] }),
  ],

  correcciones: {
    de: { provincias: { 'RS-20': { nombre: 'Nišava' } } },
    // Wikidata lo da con el orden del inglés («Distrito Norte de Backa»).
    pt: {
      provincias: {
        'RS-01': { nombre: 'Bačka do Norte' },
        'RS-02': { nombre: 'Banato Central' },
        'RS-03': { nombre: 'Banato do Norte' },
        'RS-04': { nombre: 'Banato do Sul' },
        'RS-06': { nombre: 'Bačka do Sul' },
      },
    },
  },
};
