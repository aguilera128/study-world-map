import type { Bounds } from '../atlas/types';
import type { ModeId } from './config';

// Los países que se estudian por sus subdivisiones (provincias, estados…). Aquí va lo que distingue a
// un país de otro; los textos salen de su tipo de unidad (./maps.ts) y los datos, de su atlas
// (scripts/data/mapas/<país>.mjs). Para añadir un país basta una entrada aquí, además de su atlas.
//
// Este fichero solo lleva datos y no importa nada que se ejecute: lo carga también el servidor
// (./ranking.ts), que no debe arrastrar los diccionarios. Por eso los nombres van en español, que es
// la clave de su traducción, y se traducen al usarlos.

/** Cómo se llaman las unidades de un país. De ello dependen las frases de la interfaz (./maps.ts). */
export type UnitKind = 'provincia' | 'estado' | 'estadoFederado' | 'canton' | 'region' | 'condado' | 'nacion' | 'voivodato' | 'distrito';
/** En qué se agrupan: las comunidades autónomas de España o, en general, regiones. */
export type GroupKind = 'comunidad' | 'region';

export interface CountryZone {
  id: string;
  /** En español. Si falta, el nombre de su única región en el atlas. */
  label?: string;
  /** Regiones del atlas que agrupa. */
  keys: string[];
}

export interface CountryMap {
  /** Nombre del país, en español. */
  title: string;
  /** Su código en el atlas del mundo (ISO alfa-3): para ofrecer a cada visitante el mapa de su país. */
  iso: string;
  unit: UnitKind;
  /**
   * Si sus unidades se llaman, en algún idioma, de otra forma que las del tipo (el condado de Suecia
   * es «Provinz» en alemán): la clave con la que un diccionario les da su traducción («texto|se»).
   */
  context?: string;
  /** Si sus unidades se agrupan en algo que se estudia; sin ello no hay reto de «región». */
  group?: GroupKind;
  /** Encuadre del país entero, si no vale el de todas sus unidades juntas (el del atlas). */
  frame?: Bounds;
  /** Zonas entre las que elegir, además del país entero (cuyo identificador es el del mapa). */
  zones: CountryZone[];
}

export const COUNTRY_MAPS = {
  es: {
    title: 'España',
    iso: 'ESP',
    unit: 'provincia',
    group: 'comunidad',
    // Las comunidades de una sola provincia no dan para una partida: van en agrupaciones.
    zones: [
      { id: 'es-norte', label: 'Norte', keys: ['ES-GA', 'ES-AS', 'ES-CB', 'ES-PV', 'ES-NC', 'ES-RI'] },
      { id: 'es-centro', label: 'Centro', keys: ['ES-CL', 'ES-MD', 'ES-CM', 'ES-EX'] },
      { id: 'es-este', label: 'Este y Baleares', keys: ['ES-CT', 'ES-AR', 'ES-VC', 'ES-MC', 'ES-IB'] },
      { id: 'es-sur', label: 'Sur y Canarias', keys: ['ES-AN', 'ES-CN', 'ES-CE', 'ES-ML'] },
      { id: 'es-an', keys: ['ES-AN'] },
      { id: 'es-cl', keys: ['ES-CL'] },
      { id: 'es-cm', keys: ['ES-CM'] },
      { id: 'es-ct', keys: ['ES-CT'] },
      { id: 'es-ga', keys: ['ES-GA'] },
    ],
  },
  us: {
    title: 'Estados Unidos',
    iso: 'USA',
    unit: 'estado',
    group: 'region',
    // Los 48 estados contiguos: con Alaska y Hawái en el encuadre, los demás quedan a la mitad de
    // tamaño. Esos dos se buscan girando el globo (y la zona «Oeste» sí los encuadra).
    frame: [-125, 24.5, -66.9, 49.4],
    // Las cuatro regiones de la Oficina del Censo.
    zones: [
      { id: 'us-noreste', keys: ['us-noreste'] },
      { id: 'us-medio-oeste', keys: ['us-medio-oeste'] },
      { id: 'us-sur', keys: ['us-sur'] },
      { id: 'us-oeste', keys: ['us-oeste'] },
    ],
  },
  // Los estados federados de Alemania y Austria y los cantones de Suiza no se agrupan en nada que se
  // estudie: sin zonas ni reto de «región».
  de: { title: 'Alemania', iso: 'DEU', unit: 'estadoFederado', zones: [] },
  at: { title: 'Austria', iso: 'AUT', unit: 'estadoFederado', zones: [] },
  ch: { title: 'Suiza', iso: 'CHE', unit: 'canton', zones: [] },
  nl: { title: 'Países Bajos', iso: 'NLD', unit: 'provincia', zones: [] },
  be: {
    title: 'Bélgica',
    iso: 'BEL',
    unit: 'provincia',
    group: 'region',
    // Flandes y Valonia; la tercera región, Bruselas-Capital, es una sola unidad y no da para una zona.
    zones: [
      { id: 'be-vlg', keys: ['BE-VLG'] },
      { id: 'be-wal', keys: ['BE-WAL'] },
    ],
  },
  // Las trece regiones metropolitanas de Francia y las veinte de Italia.
  fr: { title: 'Francia', iso: 'FRA', unit: 'region', zones: [] },
  it: { title: 'Italia', iso: 'ITA', unit: 'region', zones: [] },
  // Las cuatro naciones del Reino Unido, los voivodatos de Polonia y los distritos de Portugal (con las
  // Azores y Madeira, que son regiones autónomas).
  gb: { title: 'Reino Unido', iso: 'GBR', unit: 'nacion', zones: [] },
  pl: { title: 'Polonia', iso: 'POL', unit: 'voivodato', zones: [] },
  pt: { title: 'Portugal', iso: 'PRT', unit: 'distrito', zones: [] },
  cz: { title: 'Chequia', iso: 'CZE', unit: 'region', zones: [] },
  sk: { title: 'Eslovaquia', iso: 'SVK', unit: 'region', zones: [] },
  gr: { title: 'Grecia', iso: 'GRC', unit: 'region', zones: [] },
  // Los «län» de Suecia: condados en español, pero en alemán no se llaman como los de Irlanda.
  se: { title: 'Suecia', iso: 'SWE', unit: 'condado', context: 'se', zones: [] },
  // Los veintiséis condados tradicionales de Irlanda.
  ie: { title: 'Irlanda', iso: 'IRL', unit: 'condado', zones: [] },
  // Distritos de Rumanía y condados de Lituania, Croacia y Albania: cada uno con su contexto, porque
  // en alemán, francés, italiano o chino no se llaman como el tipo («Kreis», «comitat», «prefettura»…).
  ro: { title: 'Rumanía', iso: 'ROU', unit: 'distrito', context: 'ro', zones: [] },
  lt: { title: 'Lituania', iso: 'LTU', unit: 'condado', context: 'lt', zones: [] },
  hr: { title: 'Croacia', iso: 'HRV', unit: 'condado', context: 'hr', zones: [] },
  al: { title: 'Albania', iso: 'ALB', unit: 'condado', context: 'al', zones: [] },
  // Distritos de Serbia («Bezirk» en alemán), condados de Hungría («Komitat», «comitat») y las 81
  // provincias de Turquía.
  rs: { title: 'Serbia', iso: 'SRB', unit: 'distrito', context: 'rs', zones: [] },
  hu: { title: 'Hungría', iso: 'HUN', unit: 'condado', context: 'hu', zones: [] },
  tr: { title: 'Turquía', iso: 'TUR', unit: 'provincia', zones: [] },
  // Provincias de Bulgaria: «Oblast» en alemán y en francés, «distretto» en italiano.
  bg: { title: 'Bulgaria', iso: 'BGR', unit: 'provincia', context: 'bg', zones: [] },
  // Regiones (vóblasts, óblasts) de Bielorrusia y de Ucrania; esta, con Crimea, como en el mapa del mundo.
  // Comparten contexto: en chino son «州», no «大区».
  by: { title: 'Bielorrusia', iso: 'BLR', unit: 'region', context: 'oblast', zones: [] },
  ua: { title: 'Ucrania', iso: 'UKR', unit: 'region', context: 'oblast', zones: [] },
} satisfies Record<string, CountryMap>;

export type CountryMapId = keyof typeof COUNTRY_MAPS;

export const COUNTRY_IDS = Object.keys(COUNTRY_MAPS) as CountryMapId[];

/** Los retos del mapa de un país, en su orden. */
export const countryModes = (map: CountryMap): ModeId[] => (map.group ? ['locate', 'region', 'name', 'capital'] : ['locate', 'name', 'capital']);

/** Las zonas del mapa de un país, en su orden: el país entero y las suyas. */
export const countryScopes = (id: CountryMapId): string[] => [id, ...COUNTRY_MAPS[id].zones.map((zone) => zone.id)];
