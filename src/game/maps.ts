import type { Bounds, MapId, RegionKey } from '../atlas/types';
import type { ModeId } from './config';
import { t } from '../i18n';

// Los mapas que se pueden estudiar: el mundo por países y cada país por sus subdivisiones. Los datos
// de un mapa están en su atlas (scripts/build-maps.mjs); aquí va lo que cambia en la aplicación:
// qué retos se ofrecen, cómo se agrupan las zonas y los textos que hablan de «países» o «provincias».
//
// Para añadir un país: su atlas (scripts/data/mapas/), su clave en `MapId` y su entrada en `MAPS`.

export interface RegionFilterDef {
  id: string;
  /** Si falta, el nombre de su única región en el atlas (una comunidad autónoma). */
  label?: string;
  /** Regiones del atlas que agrupa; vacío = todas. */
  keys: RegionKey[];
  /** Encuadre de cámara; si falta se usa el de sus regiones en el atlas (o la vista general). */
  frame?: Bounds;
}

/** Textos que dependen de qué se estudia. Los que llevan huecos se rellenan al usarlos. */
export interface MapText {
  /** «Atlas interactivo · {n} países» */
  count: string;
  headline: [string, string];
  /** Título del paso «qué entra» y su descripción para lectores de pantalla. */
  units: string;
  scopeAria: string;
  /** Singular y plural, para contar. */
  unit: [string, string];
  /** «Dominas {n} de {total} países» */
  mastered: string;
  study: string;
  practice: string;
  search: string;
  searchAria: string;
  notFound: string;
  /** Preguntas de la partida. */
  askName: string;
  askCapitalOwner: string;
  askRegion: string;
  tap: string;
  type: string;
  /** Forma de responder a las capitales buscando en el mapa de quién es. */
  findOwner: string;
  /** «Es {country}, en {region}.» */
  solution: string;
  /** Título y resumen de los retos que no se llaman o no se explican igual que en el mundo. */
  modes: Partial<Record<ModeId, { title?: string; summary?: string }>>;
}

export interface MapDef {
  id: MapId;
  title: string;
  /** Retos que se ofrecen, en orden. */
  modes: ModeId[];
  /** Zonas entre las que elegir; la primera es el mapa entero. */
  filters: RegionFilterDef[];
  /** Zona con la que se empieza. */
  scope: string;
  /** Listas de estudio y reto del día: de momento solo existen para el mundo. */
  extras: boolean;
  text: MapText;
}

export const MAPS: Record<MapId, MapDef> = {
  world: {
    id: 'world',
    title: t('Mundo'),
    modes: ['locate', 'continent', 'name', 'capital', 'flag', 'climate', 'population', 'coords'],
    filters: [
      { id: 'mundo', label: t('Mundo'), keys: [] },
      { id: 'europa', label: t('Europa'), keys: ['europa'] },
      { id: 'asia', label: t('Asia'), keys: ['asia'] },
      { id: 'africa', label: t('África'), keys: ['africa'] },
      { id: 'america', label: t('América'), keys: ['am-norte', 'am-central', 'am-caribe', 'am-sur'], frame: [-125, -56, -35, 62] },
      { id: 'america-nc', label: t('Norte y Centroamérica'), keys: ['am-norte', 'am-central', 'am-caribe'], frame: [-128, 6, -58, 58] },
      { id: 'america-sur', label: t('Sudamérica'), keys: ['am-sur'] },
      { id: 'oceania', label: t('Oceanía'), keys: ['oceania'] },
    ],
    scope: 'europa',
    extras: true,
    text: {
      count: t('Atlas interactivo · {n} países'),
      headline: [t('Aprende el mundo,'), t('país a país.')],
      units: t('Países'),
      scopeAria: t('Países que entran'),
      unit: [t('país'), t('países')],
      mastered: t('Dominas {n} de {total} países'),
      study: t('Estúdialos antes de jugar'),
      practice: t('Practicar estos →'),
      search: t('Buscar país o capital…'),
      searchAria: t('Buscar país o capital'),
      notFound: t('No hay ningún país con ese nombre.'),
      askName: t('¿Qué país es el señalado?'),
      askCapitalOwner: t('¿De qué país es la capital?'),
      askRegion: '',
      tap: t('Toca el país en el mapa'),
      type: t('Escribe el país…'),
      findOwner: t('Buscando el país'),
      solution: t('Es {country}, en {region}.'),
      modes: {},
    },
  },

  es: {
    id: 'es',
    title: t('España'),
    modes: ['locate', 'region', 'name', 'capital'],
    // Las comunidades de una sola provincia no dan para una partida: van en agrupaciones.
    filters: [
      { id: 'es', label: t('España'), keys: [] },
      { id: 'es-norte', label: t('Norte'), keys: ['ES-GA', 'ES-AS', 'ES-CB', 'ES-PV', 'ES-NC', 'ES-RI'] },
      { id: 'es-centro', label: t('Centro'), keys: ['ES-CL', 'ES-MD', 'ES-CM', 'ES-EX'] },
      { id: 'es-este', label: t('Este y Baleares'), keys: ['ES-CT', 'ES-AR', 'ES-VC', 'ES-MC', 'ES-IB'] },
      { id: 'es-sur', label: t('Sur y Canarias'), keys: ['ES-AN', 'ES-CN', 'ES-CE', 'ES-ML'] },
      { id: 'es-an', keys: ['ES-AN'] },
      { id: 'es-cl', keys: ['ES-CL'] },
      { id: 'es-cm', keys: ['ES-CM'] },
      { id: 'es-ct', keys: ['ES-CT'] },
      { id: 'es-ga', keys: ['ES-GA'] },
    ],
    scope: 'es',
    extras: false,
    text: {
      count: t('Mapa de España · {n} provincias'),
      headline: [t('Aprende España,'), t('provincia a provincia.')],
      units: t('Provincias'),
      scopeAria: t('Provincias que entran'),
      unit: [t('provincia'), t('provincias')],
      mastered: t('Dominas {n} de {total} provincias'),
      study: t('Estúdialas antes de jugar'),
      practice: t('Practicar estas →'),
      search: t('Buscar provincia o capital…'),
      searchAria: t('Buscar provincia o capital'),
      notFound: t('No hay ninguna provincia con ese nombre.'),
      askName: t('¿Qué provincia es la señalada?'),
      askCapitalOwner: t('¿De qué provincia es la capital?'),
      askRegion: t('¿A qué comunidad autónoma pertenece?'),
      tap: t('Toca la provincia en el mapa'),
      type: t('Escribe la provincia…'),
      findOwner: t('Buscando la provincia'),
      solution: t('Es {country} ({region}).'),
      modes: {
        locate: { summary: t('Te damos el nombre de una provincia y la buscas en el mapa.') },
        region: { title: t('Comunidad'), summary: t('Di a qué comunidad autónoma pertenece cada provincia.') },
        name: { summary: t('Señalamos una provincia en el mapa y dices cuál es.') },
        capital: { summary: t('Une cada provincia con su capital.') },
      },
    },
  },

  // Geografía física: cordilleras, ríos, mares… Cada accidente es un punto en el mapa (su atlas no
  // lleva polígonos, ver scripts/build-fisico.mjs) y sus «regiones» son las clases de accidente.
  fisico: {
    id: 'fisico',
    title: t('Geografía física'),
    modes: ['locate', 'name'],
    filters: [
      { id: 'fisico', label: t('Todo'), keys: [] },
      { id: 'fisico-montanas', keys: ['montanas'] },
      { id: 'fisico-rios', keys: ['rios'] },
      { id: 'fisico-mares', keys: ['mares'] },
      { id: 'fisico-tierras', keys: ['tierras'] },
    ],
    scope: 'fisico-montanas',
    extras: false,
    text: {
      count: t('Geografía física · {n} accidentes'),
      headline: [t('Aprende el relieve,'), t('montañas, ríos y mares.')],
      units: t('Qué entra'),
      scopeAria: t('Accidentes geográficos que entran'),
      unit: [t('lugar'), t('lugares')],
      mastered: t('Dominas {n} de {total} lugares'),
      study: t('Estúdialos antes de jugar'),
      practice: t('Practicar estos →'),
      search: t('Buscar montaña, río, mar…'),
      searchAria: t('Buscar un accidente geográfico'),
      notFound: t('No hay nada con ese nombre.'),
      askName: t('¿Qué es lo señalado?'),
      askCapitalOwner: '',
      askRegion: '',
      tap: t('Tócalo en el mapa'),
      type: t('Escribe su nombre…'),
      findOwner: '',
      solution: t('Es {country} ({region}).'),
      modes: {
        locate: { summary: t('Te damos un nombre (una cordillera, un río, un mar…) y lo buscas en el mapa.') },
        name: { summary: t('Señalamos un punto del mapa y dices qué es.') },
      },
    },
  },
};

export const isMapId = (id: unknown): id is MapId => typeof id === 'string' && Object.hasOwn(MAPS, id);
