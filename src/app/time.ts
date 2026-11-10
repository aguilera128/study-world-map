import { t } from '../i18n';

// Hora local de cada país. Todo se apoya en la base de datos de zonas horarias del propio navegador
// (Intl), que ya conoce los cambios de hora de verano: aquí no hay tablas ni librerías.

const formatters = new Map<string, Intl.DateTimeFormat | null>();

/** Formateador de una zona (se guarda: crearlo es lento), o null si el navegador no la conoce. */
function formatterFor(zone: string): Intl.DateTimeFormat | null {
  let formatter = formatters.get(zone);
  if (formatter === undefined) {
    try {
      formatter = new Intl.DateTimeFormat('es-ES', {
        timeZone: zone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      formatter = null;
    }
    formatters.set(zone, formatter);
  }
  return formatter;
}

function parts(zone: string, date: Date): Record<string, number> | null {
  const formatter = formatterFor(zone);
  if (!formatter) return null;
  const out: Record<string, number> = {};
  for (const part of formatter.formatToParts(date)) out[part.type] = Number(part.value);
  return out;
}

const two = (n: number) => String(n).padStart(2, '0');

/** Hora de reloj en una zona, «14:05», o null si el navegador no conoce la zona. */
export function clockIn(zone: string, date: Date): string | null {
  const p = parts(zone, date);
  return p ? `${two(p.hour)}:${two(p.minute)}` : null;
}

/** Minutos de adelanto de una zona respecto a UTC en ese instante (negativo = atraso). */
export function offsetMinutes(zone: string, date: Date): number | null {
  const p = parts(zone, date);
  if (!p) return null;
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((wall - date.getTime()) / 60000);
}

/** Minutos de adelanto de la hora del propio dispositivo respecto a UTC. */
export const localOffsetMinutes = (date: Date): number => -date.getTimezoneOffset();

/** 60 → «UTC+1» · −210 → «UTC−3:30» · 0 → «UTC» */
export function offsetLabel(minutes: number): string {
  if (minutes === 0) return 'UTC';
  const abs = Math.abs(minutes);
  const rest = abs % 60;
  return `UTC${minutes > 0 ? '+' : '−'}${Math.floor(abs / 60)}${rest ? `:${two(rest)}` : ''}`;
}

/** Diferencia con la hora del usuario, en palabras: «6 h más que tú», «misma hora que tú». */
export function differenceLabel(minutes: number): string {
  if (minutes === 0) return t('misma hora que tú');
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const rest = abs % 60;
  const amount = [hours ? `${hours} h` : '', rest ? `${rest} min` : ''].filter(Boolean).join(' ');
  return t(minutes > 0 ? '{amount} más que tú' : '{amount} menos que tú', { amount });
}

/** Zona horaria del dispositivo («Europe/Madrid»), o null si no se puede saber. */
export function deviceZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
