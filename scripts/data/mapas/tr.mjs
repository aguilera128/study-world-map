// Turquía por provincias: datos en español, escritos a mano. Qué lleva cada fichero de un mapa está
// explicado en ./es.mjs. Las 81 provincias llevan el nombre de su capital, salvo tres (Hatay, Kocaeli
// y Sakarya). No se agrupan aquí en nada: sus siete regiones geográficas no vienen en Natural Earth
// y repartir a mano 81 provincias sin una fuente con la que contrastarlo no es de fiar.
//
// Los nombres van con la grafía turca, salvo los dos que tienen forma española asentada (Estambul y
// Esmirna); al escribir vale también sin los signos turcos (ı, ğ, ş, ç, ö, ü).

/** «Diyarbakır» → «Diyarbakir»: para aceptar la respuesta escrita con un teclado sin esas letras. */
const llano = (s) => s.replace(/ı/g, 'i').replace(/İ/g, 'I').normalize('NFD').replace(/[̀-ͯ]/g, '');
const sinRepetir = (lista, propio) => [...new Set(lista.filter((x) => x && x !== propio))];
/** @param {string} n número de la provincia (el de su código ISO 3166-2) */
const p = (n, nombre, { capital = nombre, alias = [], capAlias = [] } = {}) => {
  const a = sinRepetir([...alias, llano(nombre)], nombre);
  const ca = sinRepetir([...capAlias, llano(capital)], capital);
  return { iso: `TR-${n}`, nombre, capital, ...(a.length && { alias: a }), ...(ca.length && { capAlias: ca }) };
};

export default {
  id: 'tr',
  adm0: 'TUR',
  prefijo: 'TR-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: {},
  /** Un país mayor que España y con 81 piezas: pide menos detalle. */
  detalle: 6e-5,
  islote: 2e-3,

  contexto: ['GRC', 'BGR', 'GEO', 'ARM', 'AZE', 'IRN', 'IRQ', 'SYR'],
  ventana: [18, 24, 64, 48],

  comunidades: {},

  provincias: [
    p('01', 'Adana'),
    p('02', 'Adıyaman'),
    p('03', 'Afyonkarahisar', { alias: ['Afyon'], capAlias: ['Afyon'] }),
    p('04', 'Ağrı'),
    p('05', 'Amasya'),
    p('06', 'Ankara'),
    p('07', 'Antalya'),
    p('08', 'Artvin'),
    p('09', 'Aydın'),
    p('10', 'Balıkesir'),
    p('11', 'Bilecik'),
    p('12', 'Bingöl'),
    p('13', 'Bitlis'),
    p('14', 'Bolu'),
    p('15', 'Burdur'),
    p('16', 'Bursa'),
    p('17', 'Çanakkale'),
    p('18', 'Çankırı'),
    p('19', 'Çorum'),
    p('20', 'Denizli'),
    p('21', 'Diyarbakır'),
    p('22', 'Edirne', { alias: ['Adrianópolis'], capAlias: ['Adrianópolis'] }),
    p('23', 'Elazığ'),
    p('24', 'Erzincan'),
    p('25', 'Erzurum'),
    p('26', 'Eskişehir'),
    p('27', 'Gaziantep', { alias: ['Antep'], capAlias: ['Antep'] }),
    p('28', 'Giresun'),
    p('29', 'Gümüşhane'),
    p('30', 'Hakkâri'),
    p('31', 'Hatay', { capital: 'Antakya', capAlias: ['Antioquía', 'Antioquia'] }),
    p('32', 'Isparta'),
    p('33', 'Mersin'),
    p('34', 'Estambul', { alias: ['İstanbul', 'Istanbul'], capAlias: ['İstanbul', 'Istanbul'] }),
    p('35', 'Esmirna', { alias: ['İzmir', 'Izmir'], capAlias: ['İzmir', 'Izmir'] }),
    p('36', 'Kars'),
    p('37', 'Kastamonu'),
    p('38', 'Kayseri'),
    p('39', 'Kırklareli'),
    p('40', 'Kırşehir'),
    p('41', 'Kocaeli', { capital: 'İzmit', capAlias: ['Izmit', 'Kocaeli'] }),
    p('42', 'Konya'),
    p('43', 'Kütahya'),
    p('44', 'Malatya'),
    p('45', 'Manisa'),
    p('46', 'Kahramanmaraş', { alias: ['Maraş', 'Maras'], capAlias: ['Maraş', 'Maras'] }),
    p('47', 'Mardin'),
    p('48', 'Muğla'),
    p('49', 'Muş'),
    p('50', 'Nevşehir'),
    p('51', 'Niğde'),
    p('52', 'Ordu'),
    p('53', 'Rize'),
    p('54', 'Sakarya', { capital: 'Adapazarı', capAlias: ['Sakarya'] }),
    p('55', 'Samsun'),
    p('56', 'Siirt'),
    p('57', 'Sinop', { alias: ['Sinope'], capAlias: ['Sinope'] }),
    p('58', 'Sivas'),
    p('59', 'Tekirdağ'),
    p('60', 'Tokat'),
    p('61', 'Trabzon', { alias: ['Trebisonda'], capAlias: ['Trebisonda'] }),
    p('62', 'Tunceli'),
    p('63', 'Şanlıurfa', { alias: ['Urfa'], capAlias: ['Urfa'] }),
    p('64', 'Uşak'),
    p('65', 'Van'),
    p('66', 'Yozgat'),
    p('67', 'Zonguldak'),
    p('68', 'Aksaray'),
    p('69', 'Bayburt'),
    p('70', 'Karaman'),
    p('71', 'Kırıkkale'),
    p('72', 'Batman'),
    p('73', 'Şırnak'),
    p('74', 'Bartın'),
    p('75', 'Ardahan'),
    p('76', 'Iğdır'),
    p('77', 'Yalova'),
    p('78', 'Karabük'),
    p('79', 'Kilis'),
    p('80', 'Osmaniye'),
    p('81', 'Düzce'),
  ],

  correcciones: {},
};
