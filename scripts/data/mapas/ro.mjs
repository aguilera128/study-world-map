// Rumanía por distritos (județe): datos en español, escritos a mano. Qué lleva cada fichero de un
// mapa está explicado en ./es.mjs. Son los 41 distritos y el municipio de Bucarest, que no es un
// distrito pero se estudia con ellos; no se agrupan aquí en nada (las regiones históricas no entran).
//
// La capital del distrito de Ilfov es Bucarest, que no pertenece a él: la comparte con el municipio.

const d = (iso, nombre, capital, extra = {}) => ({ iso, nombre, capital, ...extra });

export default {
  id: 'ro',
  adm0: 'ROU',
  prefijo: 'RO-',
  fuente: 'Natural Earth 1:10m (admin 1) · nombres y capitales: elaboración propia',
  wikidata: { tipo: { de: [/^Kreis /], it: [/^Distretto di /], eu: [/ konderria$/] } },

  contexto: ['HUN', 'SRB', 'BGR', 'MDA', 'UKR'],
  ventana: [15.5, 40.5, 41, 53],

  comunidades: {},

  provincias: [
    d('RO-AB', 'Alba', 'Alba Iulia'),
    d('RO-AR', 'Arad', 'Arad'),
    d('RO-AG', 'Argeș', 'Pitești', { alias: ['Arges'], capAlias: ['Pitesti'] }),
    d('RO-BC', 'Bacău', 'Bacău', { alias: ['Bacau'], capAlias: ['Bacau'] }),
    d('RO-BH', 'Bihor', 'Oradea'),
    d('RO-BN', 'Bistrița-Năsăud', 'Bistrița', { alias: ['Bistrita-Nasaud'], capAlias: ['Bistrita'] }),
    d('RO-BT', 'Botoșani', 'Botoșani', { alias: ['Botosani'], capAlias: ['Botosani'] }),
    d('RO-BR', 'Brăila', 'Brăila', { alias: ['Braila'], capAlias: ['Braila'] }),
    d('RO-BV', 'Brașov', 'Brașov', { alias: ['Brasov'], capAlias: ['Brasov'] }),
    d('RO-B', 'Bucarest', 'Bucarest', { alias: ['București', 'Bucuresti'], capAlias: ['București', 'Bucuresti'] }),
    d('RO-BZ', 'Buzău', 'Buzău', { alias: ['Buzau'], capAlias: ['Buzau'] }),
    d('RO-CL', 'Călărași', 'Călărași', { alias: ['Calarasi'], capAlias: ['Calarasi'] }),
    d('RO-CS', 'Caraș-Severin', 'Reșița', { alias: ['Caras-Severin'], capAlias: ['Resita'] }),
    d('RO-CJ', 'Cluj', 'Cluj-Napoca', { capAlias: ['Cluj'] }),
    d('RO-CT', 'Constanța', 'Constanța', { alias: ['Constanta', 'Constanza'], capAlias: ['Constanta', 'Constanza'] }),
    d('RO-CV', 'Covasna', 'Sfântu Gheorghe', { capAlias: ['Sfantu Gheorghe'] }),
    d('RO-DB', 'Dâmbovița', 'Târgoviște', { alias: ['Dambovita'], capAlias: ['Targoviste'] }),
    d('RO-DJ', 'Dolj', 'Craiova'),
    d('RO-GL', 'Galați', 'Galați', { alias: ['Galati'], capAlias: ['Galati'] }),
    d('RO-GR', 'Giurgiu', 'Giurgiu'),
    d('RO-GJ', 'Gorj', 'Târgu Jiu', { capAlias: ['Targu Jiu'] }),
    d('RO-HR', 'Harghita', 'Miercurea Ciuc'),
    d('RO-HD', 'Hunedoara', 'Deva'),
    d('RO-IL', 'Ialomița', 'Slobozia', { alias: ['Ialomita'] }),
    d('RO-IS', 'Iași', 'Iași', { alias: ['Iasi', 'Jassy'], capAlias: ['Iasi', 'Jassy'] }),
    d('RO-IF', 'Ilfov', 'Bucarest', { capAlias: ['București', 'Bucuresti'] }),
    d('RO-MM', 'Maramureș', 'Baia Mare', { alias: ['Maramures'] }),
    d('RO-MH', 'Mehedinți', 'Drobeta-Turnu Severin', { alias: ['Mehedinti'], capAlias: ['Drobeta Turnu Severin', 'Turnu Severin'] }),
    d('RO-MS', 'Mureș', 'Târgu Mureș', { alias: ['Mures'], capAlias: ['Targu Mures'] }),
    d('RO-NT', 'Neamț', 'Piatra Neamț', { alias: ['Neamt'], capAlias: ['Piatra Neamt'] }),
    d('RO-OT', 'Olt', 'Slatina'),
    d('RO-PH', 'Prahova', 'Ploiești', { capAlias: ['Ploiesti'] }),
    d('RO-SJ', 'Sălaj', 'Zalău', { alias: ['Salaj'], capAlias: ['Zalau'] }),
    d('RO-SM', 'Satu Mare', 'Satu Mare'),
    d('RO-SB', 'Sibiu', 'Sibiu'),
    d('RO-SV', 'Suceava', 'Suceava'),
    d('RO-TR', 'Teleorman', 'Alexandria'),
    d('RO-TM', 'Timiș', 'Timișoara', { alias: ['Timis'], capAlias: ['Timisoara'] }),
    d('RO-TL', 'Tulcea', 'Tulcea'),
    d('RO-VL', 'Vâlcea', 'Râmnicu Vâlcea', { alias: ['Valcea'], capAlias: ['Ramnicu Valcea'] }),
    d('RO-VS', 'Vaslui', 'Vaslui'),
    d('RO-VN', 'Vrancea', 'Focșani', { capAlias: ['Focsani'] }),
  ],

  correcciones: {},
};
