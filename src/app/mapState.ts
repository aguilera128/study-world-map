import type { Atlas } from '../atlas/atlas';
import { Style } from '../engine/palette';
import { CLIMATE_KEYS } from '../game/climate';
import { inputOf, resolveScope, showsTarget, type ModeId, type StudyList } from '../game/config';
import { mastery, type Outcome, type Progress } from '../game/progress';
import { currentQuestion, type Session } from '../game/session';
import type { Screen } from './store';
import { offsetMinutes } from './time';
import { density, densityClass } from '../game/population';

const offsets = new Map<string, number | null>();
/** Minutos respecto a UTC de una zona horaria, ahora. Se calcula una vez por zona. */
function zoneOffset(zone: string): number | null {
  if (!offsets.has(zone)) offsets.set(zone, offsetMinutes(zone, new Date()));
  return offsets.get(zone)!;
}

/** Cómo debe pintarse el mapa: un estilo por país, cuáles responden al cursor y cuál late. */
export interface MapState {
  styles: Uint8Array;
  active: Uint8Array;
  /** Países que llevan marcador cuando son diminutos en pantalla. */
  markers: Uint8Array;
  pulse: number;
}

export interface MapInput {
  atlas: Atlas;
  screen: Screen;
  session: Session | null;
  selected: number;
  exploreScope: string;
  lists: StudyList[];
  progressMode: ModeId;
  draft: StudyList | null;
  progress: Progress;
  /** Capa de climas: el mapa político se colorea por clima. */
  byClimate?: boolean;
  /** Capa de husos horarios: cada país, del color de su hora actual. */
  byZone?: boolean;
  /** Capa de población: cada país, del color de su densidad. */
  byDensity?: boolean;
}

const MARK_STYLE: Record<Outcome, number> = { first: Style.ok, later: Style.help, failed: Style.fail };

/**
 * Traduce el estado de la aplicación al aspecto del mapa. Es la única regla que decide qué se ve:
 * mapa político para explorar, mapa mudo durante el juego, colores de dominio en el progreso…
 */
export function computeMapState(input: MapInput): MapState {
  const { atlas, screen, session, selected, progressMode, draft, progress, byClimate, byZone, byDensity } = input;
  const n = atlas.countries.length;
  const styles = new Uint8Array(n).fill(Style.muted);
  const active = new Uint8Array(n);
  const markers = new Uint8Array(n);
  let pulse = -1;
  // En el mapa de geografía física los países son el fondo: tierra lisa, para que se lea el relieve.
  if (atlas.map === 'fisico') {
    for (let i = 0; i < n; i++) if (atlas.countries[i].kind === 'context') styles[i] = atlas.countries[i].id === 'ATA' ? Style.ice : Style.land;
  }
  // Con la capa de climas, el mapa político se pinta por el clima más extendido de cada país.
  const political = (i: number) => {
    const country = atlas.countries[i];
    if (byClimate && country.climate.length) return Style.climate + CLIMATE_KEYS.indexOf(country.climate[0]);
    if (byDensity) {
      const value = density(country);
      if (value !== null) return Style.density + densityClass(value);
    }
    // Husos: seis colores que se repiten de hora en hora, así dos husos seguidos nunca coinciden.
    // Es la hora oficial de hoy en la capital (con el horario de verano, si lo hay).
    if (byZone && country.tz) {
      const minutes = zoneOffset(country.tz);
      if (minutes !== null) return Style.political + ((((Math.round(minutes / 60) % 6) + 6) % 6));
    }
    return country.id === 'ATA' ? Style.ice : Style.political + country.color;
  };

  switch (screen) {
    case 'home':
      // En la portada el mapa es sobre todo decorado: político y sin marcadores.
      for (let i = 0; i < n; i++) {
        if (atlas.countries[i].kind === 'context') continue;
        styles[i] = political(i);
        active[i] = 1;
      }
      break;

    case 'explore': {
      // Se colorean los países que se están estudiando; el resto queda apagado, pero se puede tocar.
      const scope = resolveScope(atlas, input.exploreScope, input.lists);
      const whole = scope.countries.length === atlas.quizzable.length;
      // (El decorado del mapa de un país ni se colorea ni se toca.)
      for (let i = 0; i < n; i++) {
        if (atlas.countries[i].kind === 'context') continue;
        active[i] = 1;
        if (whole) styles[i] = political(i);
      }
      for (const i of scope.countries) {
        styles[i] = political(i);
        markers[i] = 1;
      }
      if (selected >= 0) styles[selected] = Style.target;
      break;
    }

    case 'lists': {
      const chosen = new Set(draft?.countries ?? []);
      for (const i of atlas.quizzable) {
        styles[i] = chosen.has(atlas.countries[i].id) ? political(i) : Style.blank;
        active[i] = draft ? 1 : 0;
        markers[i] = 1;
      }
      break;
    }

    case 'progress':
      for (const i of atlas.quizzable) {
        styles[i] = Style.mastery + mastery(progress[atlas.countries[i].id]?.[progressMode]);
        active[i] = 1;
        markers[i] = 1;
      }
      break;

    case 'play':
    case 'results': {
      if (!session) break;
      const byMap = inputOf(session.config.answer) === 'map';
      for (const i of session.pool) {
        styles[i] = Style.blank;
        markers[i] = 1;
        active[i] = screen === 'results' || byMap ? 1 : 0;
      }
      for (const [country, outcome] of Object.entries(session.marks)) styles[Number(country)] = MARK_STYLE[outcome];
      if (screen === 'results') break;

      const question = currentQuestion(session);
      if (!question) break;
      if (session.status === 'asking') {
        if (showsTarget(session.config)) {
          styles[question.country] = Style.target;
          pulse = question.country;
        } else if (question.review) {
          // En un repaso el país vuelve a quedar en blanco: hay que encontrarlo de nuevo.
          styles[question.country] = Style.blank;
        }
      } else if (session.outcome) {
        styles[question.country] = MARK_STYLE[session.marks[question.country] ?? session.outcome];
      }
      break;
    }
  }
  return { styles, active, markers, pulse };
}
