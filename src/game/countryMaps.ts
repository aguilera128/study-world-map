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
export type UnitKind = 'provincia' | 'estado';
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
  unit: UnitKind;
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
} satisfies Record<string, CountryMap>;

export type CountryMapId = keyof typeof COUNTRY_MAPS;

export const COUNTRY_IDS = Object.keys(COUNTRY_MAPS) as CountryMapId[];

/** Los retos del mapa de un país, en su orden. */
export const countryModes = (map: CountryMap): ModeId[] => (map.group ? ['locate', 'region', 'name', 'capital'] : ['locate', 'name', 'capital']);

/** Las zonas del mapa de un país, en su orden: el país entero y las suyas. */
export const countryScopes = (id: CountryMapId): string[] => [id, ...COUNTRY_MAPS[id].zones.map((zone) => zone.id)];
