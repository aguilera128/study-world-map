import { modeDef, type GameConfig, type ModeId, type StudyList } from '../game/config';
import { isMapId, MAPS } from '../game/maps';
import { t } from '../i18n';

// Una lista de estudio se comparte dentro de la propia dirección de la página:
//   https://…/?lista=Examen%20del%20martes~ESP.FRA.ITA
// Así un profesor (o una madre) puede pasar la lista a toda la clase sin cuentas ni servidores.

const PARAM = 'lista';

/** Identificador estable a partir del contenido: abrir dos veces el mismo enlace no duplica la lista. */
function listId(name: string, countries: string[]): string {
  let hash = 0;
  for (const ch of `${name}|${[...countries].sort().join('.')}`) hash = (Math.imul(hash, 31) + ch.codePointAt(0)!) | 0;
  return `lista-${(hash >>> 0).toString(36)}`;
}

export function shareUrl(list: StudyList, base = window.location.origin + window.location.pathname): string {
  return `${base}?${PARAM}=${encodeURIComponent(list.name)}~${list.countries.join('.')}`;
}

/** Lee una lista compartida de la cadena de consulta (`location.search`), o null si no hay o no vale. */
export function parseSharedList(search: string): StudyList | null {
  const raw = new URLSearchParams(search).get(PARAM);
  if (!raw) return null;
  const cut = raw.lastIndexOf('~');
  if (cut < 0) return null;
  const name = raw.slice(0, cut).trim().slice(0, 60) || t('Lista compartida');
  const countries = [...new Set(raw.slice(cut + 1).split('.'))].filter((id) => /^[A-Z]{3}$/.test(id));
  if (!countries.length) return null;
  return { id: listId(name, countries), name, countries };
}

export const newListId = () => `lista-${Date.now().toString(36)}`;

// Las páginas por continente (/juego/…) enlazan a un reto ya elegido: /?reto=capitales&zona=europa
// Las de las provincias de un país añaden su mapa: /?mapa=es&reto=comunidades
const RETOS: Record<string, ModeId> = {
  localizar: 'locate',
  continentes: 'continent',
  comunidades: 'region',
  nombrar: 'name',
  capitales: 'capital',
  banderas: 'flag',
  climas: 'climate',
  coordenadas: 'coords',
  poblacion: 'population',
};

/** Mapa, reto y zona pedidos en la dirección, o null si no hay ninguno válido. */
export function parsePreset(search: string): Partial<GameConfig> | null {
  const params = new URLSearchParams(search);
  const mapa = params.get('mapa');
  const map = isMapId(mapa) ? mapa : undefined;
  const def = MAPS[map ?? 'world'];
  const reto = RETOS[params.get('reto') ?? ''];
  const mode = def.modes.includes(reto) ? reto : undefined;
  const zona = params.get('zona');
  const scope = def.filters.some((r) => r.id === zona) ? zona! : undefined;
  if (!map && !mode && !scope) return null;
  // Un enlace sin mapa es del mundo; con mapa y sin zona se empieza por el mapa entero.
  return { map: def.id, ...(map && { scope: def.scope }), ...(mode && { mode, answer: modeDef(mode).answers[0] }), ...(scope && { scope }) };
}
