import type { Bounds, MapId, RegionKey } from '../atlas/types';
import type { ModeId } from './config';
import { COUNTRY_IDS, COUNTRY_MAPS, countryModes, type CountryMap, type CountryMapId, type GroupKind, type UnitKind } from './countryMaps';
import { t, tc } from '../i18n';

// Los mapas que se pueden estudiar: el mundo por países y cada país por sus subdivisiones. Los datos
// de un mapa están en su atlas (scripts/build-maps.mjs); aquí va lo que cambia en la aplicación:
// qué retos se ofrecen, cómo se agrupan las zonas y los textos que hablan de «países» o «provincias».
//
// Para añadir un país: su atlas (scripts/data/mapas/) y su entrada en ./countryMaps.ts. Sus textos no
// se escriben país a país: salen del tipo de sus unidades («provincia», «estado»…), más abajo.

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

// ───────────────────────── textos del mapa de un país ─────────────────────────
// Un juego de frases por tipo de unidad, no por país: las frases enteras, porque el género y los
// artículos cambian en cada idioma y no se pueden componer («la provincia», «el estado», «der
// Staat»). Al añadir un tipo hay que mirar que las dos frases compartidas con el mapa del mundo
// («Estúdialos…», «Practicar estos…») concuerden con su género en todos los diccionarios.

interface UnitText extends Omit<MapText, 'count' | 'headline' | 'askRegion' | 'solution' | 'modes'> {
  /** «{n} provincias», para el rótulo «España · 52 provincias». */
  count: string;
  /** Segunda línea del titular: «provincia a provincia.» */
  each: string;
  /** Resumen de los retos, que en el mundo hablan de «países». */
  locate: string;
  name: string;
  capital: string;
}

const UNITS: Record<UnitKind, UnitText> = {
  provincia: {
    count: t('{n} provincias'),
    each: t('provincia a provincia.'),
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
    tap: t('Toca la provincia en el mapa'),
    type: t('Escribe la provincia…'),
    findOwner: t('Buscando la provincia'),
    locate: t('Te damos el nombre de una provincia y la buscas en el mapa.'),
    name: t('Señalamos una provincia en el mapa y dices cuál es.'),
    capital: t('Une cada provincia con su capital.'),
  },
  estado: {
    count: t('{n} estados'),
    each: t('estado a estado.'),
    units: t('Estados'),
    scopeAria: t('Estados que entran'),
    unit: [t('estado'), t('estados')],
    mastered: t('Dominas {n} de {total} estados'),
    study: t('Estúdialos antes de jugar'),
    practice: t('Practicar estos →'),
    search: t('Buscar estado o capital…'),
    searchAria: t('Buscar estado o capital'),
    notFound: t('No hay ningún estado con ese nombre.'),
    askName: t('¿Qué estado es el señalado?'),
    askCapitalOwner: t('¿De qué estado es la capital?'),
    tap: t('Toca el estado en el mapa'),
    type: t('Escribe el estado…'),
    findOwner: t('Buscando el estado'),
    locate: t('Te damos el nombre de un estado y lo buscas en el mapa.'),
    name: t('Señalamos un estado en el mapa y dices cuál es.'),
    capital: t('Une cada estado con su capital.'),
  },
  // Los de Alemania y Austria: en alemán no se llaman como los de Estados Unidos («Bundesland»,
  // no «Bundesstaat»), así que llevan sus propias frases.
  estadoFederado: {
    count: t('{n} estados federados'),
    each: t('sus estados federados.'),
    units: t('Estados federados'),
    scopeAria: t('Estados federados que entran'),
    unit: [t('estado federado'), t('estados federados')],
    mastered: t('Dominas {n} de {total} estados federados'),
    study: t('Estúdialos antes de jugar'),
    practice: t('Practicar estos →'),
    search: t('Buscar estado federado o capital…'),
    searchAria: t('Buscar estado federado o capital'),
    notFound: t('No hay ningún estado federado con ese nombre.'),
    askName: t('¿Qué estado federado es el señalado?'),
    askCapitalOwner: t('¿De qué estado federado es la capital?'),
    tap: t('Toca el estado federado en el mapa'),
    type: t('Escribe el estado federado…'),
    findOwner: t('Buscando el estado federado'),
    locate: t('Te damos el nombre de un estado federado y lo buscas en el mapa.'),
    name: t('Señalamos un estado federado en el mapa y dices cuál es.'),
    capital: t('Une cada estado federado con su capital.'),
  },
  canton: {
    count: t('{n} cantones'),
    each: t('cantón a cantón.'),
    units: t('Cantones'),
    scopeAria: t('Cantones que entran'),
    unit: [t('cantón'), t('cantones')],
    mastered: t('Dominas {n} de {total} cantones'),
    study: t('Estúdialos antes de jugar'),
    practice: t('Practicar estos →'),
    search: t('Buscar cantón o capital…'),
    searchAria: t('Buscar cantón o capital'),
    notFound: t('No hay ningún cantón con ese nombre.'),
    askName: t('¿Qué cantón es el señalado?'),
    askCapitalOwner: t('¿De qué cantón es la capital?'),
    tap: t('Toca el cantón en el mapa'),
    type: t('Escribe el cantón…'),
    findOwner: t('Buscando el cantón'),
    locate: t('Te damos el nombre de un cantón y lo buscas en el mapa.'),
    name: t('Señalamos un cantón en el mapa y dices cuál es.'),
    capital: t('Une cada cantón con su capital.'),
  },
  region: {
    count: t('{n} regiones'),
    each: t('región a región.'),
    units: t('Regiones'),
    scopeAria: t('Regiones que entran'),
    unit: [t('región'), t('regiones')],
    mastered: t('Dominas {n} de {total} regiones'),
    study: t('Estúdialas antes de jugar'),
    practice: t('Practicar estas →'),
    search: t('Buscar región o capital…'),
    searchAria: t('Buscar región o capital'),
    notFound: t('No hay ninguna región con ese nombre.'),
    askName: t('¿Qué región es la señalada?'),
    askCapitalOwner: t('¿De qué región es la capital?'),
    tap: t('Toca la región en el mapa'),
    type: t('Escribe la región…'),
    findOwner: t('Buscando la región'),
    locate: t('Te damos el nombre de una región y la buscas en el mapa.'),
    name: t('Señalamos una región en el mapa y dices cuál es.'),
    capital: t('Une cada región con su capital.'),
  },
  // Con sus propias frases de «estudiar» y «practicar»: en italiano «contea» es femenino y las
  // compartidas («Studiali…») no concordarían.
  condado: {
    count: t('{n} condados'),
    each: t('condado a condado.'),
    units: t('Condados'),
    scopeAria: t('Condados que entran'),
    unit: [t('condado'), t('condados')],
    mastered: t('Dominas {n} de {total} condados'),
    study: t('Estudia los condados antes de jugar'),
    practice: t('Practicar estos condados →'),
    search: t('Buscar condado o capital…'),
    searchAria: t('Buscar condado o capital'),
    notFound: t('No hay ningún condado con ese nombre.'),
    askName: t('¿Qué condado es el señalado?'),
    askCapitalOwner: t('¿De qué condado es la capital?'),
    tap: t('Toca el condado en el mapa'),
    type: t('Escribe el condado…'),
    findOwner: t('Buscando el condado'),
    locate: t('Te damos el nombre de un condado y lo buscas en el mapa.'),
    name: t('Señalamos un condado en el mapa y dices cuál es.'),
    capital: t('Une cada condado con su capital.'),
  },
  // Los «län» de Suecia: las mismas frases que «condado», con contexto, porque en alemán no se
  // llaman «Grafschaft» sino «Provinz» (ver `tc` en src/i18n).
  condadoSueco: {
    count: tc('se', '{n} condados'),
    each: tc('se', 'condado a condado.'),
    units: tc('se', 'Condados'),
    scopeAria: tc('se', 'Condados que entran'),
    unit: [tc('se', 'condado'), tc('se', 'condados')],
    mastered: tc('se', 'Dominas {n} de {total} condados'),
    study: tc('se', 'Estudia los condados antes de jugar'),
    practice: tc('se', 'Practicar estos condados →'),
    search: tc('se', 'Buscar condado o capital…'),
    searchAria: tc('se', 'Buscar condado o capital'),
    notFound: tc('se', 'No hay ningún condado con ese nombre.'),
    askName: tc('se', '¿Qué condado es el señalado?'),
    askCapitalOwner: tc('se', '¿De qué condado es la capital?'),
    tap: tc('se', 'Toca el condado en el mapa'),
    type: tc('se', 'Escribe el condado…'),
    findOwner: tc('se', 'Buscando el condado'),
    locate: tc('se', 'Te damos el nombre de un condado y lo buscas en el mapa.'),
    name: tc('se', 'Señalamos un condado en el mapa y dices cuál es.'),
    capital: tc('se', 'Une cada condado con su capital.'),
  },
  nacion: {
    count: t('{n} naciones'),
    each: t('nación a nación.'),
    units: t('Naciones'),
    scopeAria: t('Naciones que entran'),
    unit: [t('nación'), t('naciones')],
    mastered: t('Dominas {n} de {total} naciones'),
    study: t('Estúdialas antes de jugar'),
    practice: t('Practicar estas →'),
    search: t('Buscar nación o capital…'),
    searchAria: t('Buscar nación o capital'),
    notFound: t('No hay ninguna nación con ese nombre.'),
    askName: t('¿Qué nación es la señalada?'),
    askCapitalOwner: t('¿De qué nación es la capital?'),
    tap: t('Toca la nación en el mapa'),
    type: t('Escribe la nación…'),
    findOwner: t('Buscando la nación'),
    locate: t('Te damos el nombre de una nación y la buscas en el mapa.'),
    name: t('Señalamos una nación en el mapa y dices cuál es.'),
    capital: t('Une cada nación con su capital.'),
  },
  // Con sus propias frases de «estudiar» y «practicar»: en francés, alemán y portugués es femenino.
  voivodato: {
    count: t('{n} voivodatos'),
    each: t('voivodato a voivodato.'),
    units: t('Voivodatos'),
    scopeAria: t('Voivodatos que entran'),
    unit: [t('voivodato'), t('voivodatos')],
    mastered: t('Dominas {n} de {total} voivodatos'),
    study: t('Estudia los voivodatos antes de jugar'),
    practice: t('Practicar estos voivodatos →'),
    search: t('Buscar voivodato o capital…'),
    searchAria: t('Buscar voivodato o capital'),
    notFound: t('No hay ningún voivodato con ese nombre.'),
    askName: t('¿Qué voivodato es el señalado?'),
    askCapitalOwner: t('¿De qué voivodato es la capital?'),
    tap: t('Toca el voivodato en el mapa'),
    type: t('Escribe el voivodato…'),
    findOwner: t('Buscando el voivodato'),
    locate: t('Te damos el nombre de un voivodato y lo buscas en el mapa.'),
    name: t('Señalamos un voivodato en el mapa y dices cuál es.'),
    capital: t('Une cada voivodato con su capital.'),
  },
  distrito: {
    count: t('{n} distritos'),
    each: t('distrito a distrito.'),
    units: t('Distritos'),
    scopeAria: t('Distritos que entran'),
    unit: [t('distrito'), t('distritos')],
    mastered: t('Dominas {n} de {total} distritos'),
    study: t('Estúdialos antes de jugar'),
    practice: t('Practicar estos →'),
    search: t('Buscar distrito o capital…'),
    searchAria: t('Buscar distrito o capital'),
    notFound: t('No hay ningún distrito con ese nombre.'),
    askName: t('¿Qué distrito es el señalado?'),
    askCapitalOwner: t('¿De qué distrito es la capital?'),
    tap: t('Toca el distrito en el mapa'),
    type: t('Escribe el distrito…'),
    findOwner: t('Buscando el distrito'),
    locate: t('Te damos el nombre de un distrito y lo buscas en el mapa.'),
    name: t('Señalamos un distrito en el mapa y dices cuál es.'),
    capital: t('Une cada distrito con su capital.'),
  },
};

/** El reto de «¿a qué … pertenece?»: su título (si no es «Región»), su pregunta y su resumen. */
const GROUPS: Record<GroupKind, { title?: string; ask: string; summary: string }> = {
  comunidad: { title: t('Comunidad'), ask: t('¿A qué comunidad autónoma pertenece?'), summary: t('Di a qué comunidad autónoma pertenece cada provincia.') },
  region: { ask: t('¿A qué región pertenece?'), summary: t('Te damos un nombre y dices a qué región del país pertenece.') },
};

function countryMap(id: CountryMapId): MapDef {
  const data: CountryMap = COUNTRY_MAPS[id];
  const { count, each, locate, name, capital, ...unit } = UNITS[data.unit];
  const group = data.group ? GROUPS[data.group] : null;
  const title = t(data.title);
  return {
    id,
    title,
    modes: countryModes(data),
    filters: [
      { id, label: title, keys: [], ...(data.frame && { frame: data.frame }) },
      ...data.zones.map((zone) => ({ id: zone.id, keys: zone.keys, ...(zone.label && { label: t(zone.label) }) })),
    ],
    scope: id,
    extras: false,
    text: {
      ...unit,
      count: `${title} · ${count}`,
      headline: [t('{country},', { country: title }), each],
      askRegion: group?.ask ?? '',
      solution: group ? t('Es {country} ({region}).') : t('Es {country}.'),
      modes: {
        locate: { summary: locate },
        name: { summary: name },
        capital: { summary: capital },
        ...(group && { region: { ...(group.title && { title: group.title }), summary: group.summary } }),
      },
    },
  };
}

const WORLD_AND_PHYSICAL: Record<Exclude<MapId, CountryMapId>, MapDef> = {
  world: {
    id: 'world',
    title: t('Mundo'),
    modes: ['locate', 'continent', 'name', 'capital', 'flag', 'climate', 'population', 'inhabitants', 'coords'],
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

export const MAPS: Record<MapId, MapDef> = {
  ...WORLD_AND_PHYSICAL,
  ...(Object.fromEntries(COUNTRY_IDS.map((id) => [id, countryMap(id)])) as Record<CountryMapId, MapDef>),
};

export const isMapId = (id: unknown): id is MapId => typeof id === 'string' && Object.hasOwn(MAPS, id);
export const isCountryMap = (id: unknown): id is CountryMapId => typeof id === 'string' && Object.hasOwn(COUNTRY_MAPS, id);
