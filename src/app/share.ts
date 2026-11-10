import { modeDef, REGION_FILTERS, type GameConfig, type ModeId, type StudyList } from '../game/config';
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
const RETOS: Record<string, ModeId> = {
  localizar: 'locate',
  continentes: 'continent',
  nombrar: 'name',
  capitales: 'capital',
  banderas: 'flag',
};

/** Reto y zona pedidos en la dirección, o null si no hay ninguno válido. */
export function parsePreset(search: string): Partial<GameConfig> | null {
  const params = new URLSearchParams(search);
  const mode = RETOS[params.get('reto') ?? ''];
  const zona = params.get('zona');
  const scope = REGION_FILTERS.some((r) => r.id === zona) ? zona! : undefined;
  if (!mode && !scope) return null;
  return { ...(mode && { mode, answer: modeDef(mode).answers[0] }), ...(scope && { scope }) };
}
