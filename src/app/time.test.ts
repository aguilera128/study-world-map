import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { dayPhase, moonPhase, siderealAngle, sublunarPoint, subsolarPoint, sunAltitude } from '../engine/sun';
import { clockIn, differenceLabel, offsetLabel, offsetMinutes } from './time';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);
const winter = new Date('2026-01-15T12:00:00Z');
const summer = new Date('2026-07-15T12:00:00Z');

describe('hora local', () => {
  it('da la hora de reloj de una zona', () => {
    expect(clockIn('Europe/Madrid', winter)).toBe('13:00');
    expect(clockIn('Europe/Madrid', summer)).toBe('14:00'); // horario de verano
    expect(clockIn('Asia/Tokyo', winter)).toBe('21:00');
    expect(clockIn('America/New_York', winter)).toBe('07:00');
    expect(clockIn('Asia/Kolkata', winter)).toBe('17:30');
    expect(clockIn('Pacific/Auckland', winter)).toBe('01:00'); // ya es el día siguiente
  });

  it('calcula el desfase con UTC, también con medias horas y cuartos', () => {
    expect(offsetMinutes('Europe/Madrid', winter)).toBe(60);
    // en cualquier segundo del minuto, no solo en el :00
    expect(offsetMinutes('Europe/Madrid', new Date(winter.getTime() + 45_000))).toBe(60);
    expect(offsetMinutes('Africa/Nouakchott', new Date(winter.getTime() + 59_000))).toBe(0);
    expect(offsetMinutes('Europe/Madrid', summer)).toBe(120);
    expect(offsetMinutes('America/St_Johns', winter)).toBe(-210);
    expect(offsetMinutes('Asia/Kathmandu', winter)).toBe(345);
    expect(offsetMinutes('Pacific/Kiritimati', winter)).toBe(840);
    expect(offsetMinutes('Europe/London', winter)).toBe(0);
  });

  it('una zona desconocida no rompe nada', () => {
    expect(clockIn('Marte/Olympus', winter)).toBeNull();
    expect(offsetMinutes('Marte/Olympus', winter)).toBeNull();
  });

  it('escribe desfases y diferencias', () => {
    expect(offsetLabel(0)).toBe('UTC');
    expect(offsetLabel(60)).toBe('UTC+1');
    expect(offsetLabel(-210)).toBe('UTC−3:30');
    expect(offsetLabel(345)).toBe('UTC+5:45');
    expect(differenceLabel(0)).toBe('misma hora que tú');
    expect(differenceLabel(480)).toBe('8 h más que tú');
    expect(differenceLabel(-90)).toBe('1 h 30 min menos que tú');
    expect(differenceLabel(30)).toBe('30 min más que tú');
  });

  it('todos los países del atlas tienen una zona horaria que este entorno conoce', () => {
    for (const i of atlas.quizzable) {
      const c = atlas.countries[i];
      expect(c.tz, c.id).toBeTruthy();
      expect(clockIn(c.tz!, winter), `${c.id} ${c.tz}`).toMatch(/^\d\d:\d\d$/);
    }
    expect(atlas.byIdOrThrow('ESP').tz).toBe('Europe/Madrid');
    expect(atlas.byIdOrThrow('USA').tz).toBe('America/New_York');
    expect(atlas.byIdOrThrow('USA').tzMulti).toBe(true);
    expect(atlas.byIdOrThrow('FRA').tzMulti).toBe(false);
    expect(atlas.byIdOrThrow('CHN').tzMulti).toBe(false);
  });

  it('sitúa cada zona horaria en su país', () => {
    expect(atlas.zones['Europe/Madrid'][2]).toBe('ESP');
    expect(atlas.zones['Atlantic/Canary'][2]).toBe('ESP');
    expect(atlas.zones['America/Los_Angeles'][2]).toBe('USA');
    // nombres antiguos que algunos navegadores siguen dando
    expect(atlas.zones['Asia/Calcutta'][2]).toBe('IND');
    expect(atlas.zones['America/Buenos_Aires'][2]).toBe('ARG');
    // las coordenadas caen cerca de la ciudad de referencia (Madrid: 40,4° N, 3,7° O)
    const [lon, lat] = atlas.zones['Europe/Madrid'];
    expect(lon).toBeCloseTo(-3.68, 1);
    expect(lat).toBeCloseTo(40.4, 1);
    const [lonNy, latNy] = atlas.zones['America/New_York'];
    expect(lonNy).toBeCloseTo(-74.0, 1);
    expect(latNy).toBeCloseTo(40.7, 1);
    // y dentro del país o junto a su costa (salvo alguna isla remota que el mapa no dibuja)
    const outside = Object.entries(atlas.zones).filter(([, [zLon, zLat, id]]) => {
      const [w, s, e, n] = atlas.byIdOrThrow(id).bbox;
      return zLon < w - 1 || zLon > e + 1 || zLat < s - 1 || zLat > n + 1;
    });
    expect(outside.length, outside.map(([zone]) => zone).join(', ')).toBeLessThan(8);
  });
});

describe('sol', () => {
  it('la declinación sigue las estaciones', () => {
    expect(subsolarPoint(new Date('2026-06-21T08:00:00Z')).lat).toBeCloseTo(23.44, 1);
    expect(subsolarPoint(new Date('2026-12-21T20:00:00Z')).lat).toBeCloseTo(-23.44, 1);
    expect(subsolarPoint(new Date('2026-03-20T14:46:00Z')).lat).toBeCloseTo(0, 1);
    expect(subsolarPoint(new Date('2026-09-23T00:05:00Z')).lat).toBeCloseTo(0, 1);
  });

  it('a mediodía UTC el Sol está sobre Greenwich, salvo por la ecuación del tiempo', () => {
    // 3 de noviembre: el Sol va 16,4 min adelantado → ya ha pasado Greenwich (4,1° al oeste)
    expect(subsolarPoint(new Date('2026-11-03T12:00:00Z')).lon).toBeCloseTo(-4.1, 0);
    // 11 de febrero: va 14,2 min atrasado → aún está 3,6° al este
    expect(subsolarPoint(new Date('2026-02-11T12:00:00Z')).lon).toBeCloseTo(3.6, 0);
    // a mediados de abril casi no hay diferencia
    expect(Math.abs(subsolarPoint(new Date('2026-04-15T12:00:00Z')).lon)).toBeLessThan(0.3);
  });

  it('el Sol recorre 15° de longitud por hora, hacia el oeste', () => {
    const a = subsolarPoint(new Date('2026-05-01T06:00:00Z')).lon;
    const b = subsolarPoint(new Date('2026-05-01T07:00:00Z')).lon;
    expect(a - b).toBeCloseTo(15, 1);
    expect(subsolarPoint(new Date('2026-05-01T00:00:00Z')).lon).toBeCloseTo(180 - 0.7, 0);
  });

  it('distingue el día de la noche', () => {
    const sun = subsolarPoint(new Date('2026-06-21T12:00:00Z'));
    expect(sunAltitude(sun, sun.lon, sun.lat)).toBeCloseTo(90, 5);
    expect(dayPhase(sunAltitude(sun, -3.7, 40.4))).toBe('day'); // Madrid a mediodía
    expect(dayPhase(sunAltitude(sun, 174.8, -41.3))).toBe('night'); // Wellington, medianoche
    expect(dayPhase(sunAltitude(sun, 0, 80))).toBe('day'); // sol de medianoche en el Ártico
    expect(dayPhase(-3)).toBe('twilight');
    expect(dayPhase(-10)).toBe('night');
  });
});

describe('luna', () => {
  const phaseAt = (iso: string) => {
    const date = new Date(iso);
    return moonPhase(subsolarPoint(date), sublunarPoint(date));
  };

  it('en un eclipse de Sol la Luna está delante del Sol', () => {
    // Eclipse total del 8 de abril de 2024, máximo a las 18:17 UTC.
    const date = new Date('2024-04-08T18:17:00Z');
    const sun = subsolarPoint(date);
    const moon = sublunarPoint(date);
    expect(Math.abs(moon.lon - sun.lon)).toBeLessThan(1);
    expect(Math.abs(moon.lat - sun.lat)).toBeLessThan(1);
    expect(phaseAt('2024-04-08T18:17:00Z').name).toBe('Luna nueva');
  });

  it('en un eclipse de Luna está llena', () => {
    // Eclipse total del 14 de marzo de 2025, máximo a las 06:59 UTC.
    const phase = phaseAt('2025-03-14T06:59:00Z');
    expect(phase.lit).toBeGreaterThan(0.995);
    expect(phase.name).toBe('Luna llena');
  });

  it('los cuartos están a medio iluminar, creciendo o menguando', () => {
    // Cuarto creciente el 6 de marzo de 2025 (16:32 UTC) y menguante el 22 (11:29 UTC).
    const first = phaseAt('2025-03-06T16:32:00Z');
    expect(first.lit).toBeCloseTo(0.5, 1);
    expect(first.waxing).toBe(true);
    const last = phaseAt('2025-03-22T11:29:00Z');
    expect(last.lit).toBeCloseTo(0.5, 1);
    expect(last.waxing).toBe(false);
    expect(last.name).toBe('Cuarto menguante');
  });
});

describe('estrellas', () => {
  it('Sirio pasa por el meridiano de Greenwich a medianoche de Año Nuevo', () => {
    // Longitud del punto que tiene la estrella en el cénit = ascensión recta − hora sidérea.
    const sirius = 101.29;
    expect(Math.abs(sirius - siderealAngle(new Date('2026-01-01T00:00:00Z')))).toBeLessThan(1.5);
  });

  it('el cielo da una vuelta cada día sidéreo (23 h 56 min 4 s)', () => {
    const t0 = new Date('2026-11-10T00:00:00Z');
    const t1 = new Date(t0.getTime() + (23 * 3600 + 56 * 60 + 4.09) * 1000);
    expect(siderealAngle(t1)).toBeCloseTo(siderealAngle(t0), 2);
  });
});
