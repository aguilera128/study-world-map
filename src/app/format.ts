import { LOCALE, t } from '../i18n';

const integer = new Intl.NumberFormat(LOCALE);
const decimal = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });

/** 505992 → «505.992 km²» */
export const formatArea = (km2: number) => `${integer.format(km2)} km²`;

/** 83500 ms → «1:23» */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** 8.5 → «8,5» · 10 → «10» */
export function formatGrade(grade: number): string {
  return decimal.format(Math.round(grade * 10) / 10);
}

/** 40.4168, −3.7038 → «40°25′N 3°42′O» */
export function formatCoords(lon: number, lat: number): string {
  const part = (value: number, positive: string, negative: string) => {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = Math.floor((abs - deg) * 60);
    return `${deg}°${String(min).padStart(2, '0')}′${value >= 0 ? positive : negative}`;
  };
  return `${part(lat, 'N', 'S')} ${part(lon, 'E', t('O'))}`;
}

/** «1 país» / «3 países» */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
