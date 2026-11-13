import { eciToGeodetic, gstime, propagate } from 'satellite.js';
import { describe, expect, it } from 'vitest';
import { fitsOnMap, isSatRow, launchYear, periodMinutes, toRow, type SatRow } from './format';
import { iconGlsl, iconSvg } from './icons';
import { geoOf, orbitPath, positionAt, satNow, satrecOf, toGlobe } from './orbit';
import { hiddenByEarth, nearestOnScreen } from './pick';

// La ISS tal como la dio CelesTrak (grupo «stations», formato JSON) el 13 de noviembre de 2026.
const ISS_OMM = {
  OBJECT_NAME: 'ISS (ZARYA)',
  OBJECT_ID: '1998-067A',
  EPOCH: '2026-11-13T04:57:32.119200',
  MEAN_MOTION: 15.4934692,
  ECCENTRICITY: 0.00073498,
  INCLINATION: 51.6325,
  RA_OF_ASC_NODE: 282.6584,
  ARG_OF_PERICENTER: 20.2588,
  MEAN_ANOMALY: 339.869,
  EPHEMERIS_TYPE: 0,
  CLASSIFICATION_TYPE: 'U',
  NORAD_CAT_ID: 25544,
  ELEMENT_SET_NO: 999,
  REV_AT_EPOCH: 59485,
  BSTAR: 0.00016131939,
  MEAN_MOTION_DOT: 0.00008559,
  MEAN_MOTION_DDOT: 0,
};
const EPOCH = Date.parse('2026-11-13T04:57:32Z');

describe('formato', () => {
  it('se queda con lo que necesita SGP4 y nada más', () => {
    const row = toRow(ISS_OMM);
    expect(row).toEqual(['ISS (ZARYA)', 25544, '2026-11-13T04:57:32.119200', 15.4934692, 0.00073498, 51.6325, 282.6584, 20.2588, 339.869, 0.00016131939, 0.00008559, 0, '1998-067A']);
    expect(isSatRow(row)).toBe(true);
    // Las filas de antes, sin designador, siguen valiendo.
    expect(isSatRow(row!.slice(0, 12))).toBe(true);
    expect(launchYear(row![12])).toBe(1998);
    expect(launchYear('')).toBeNull();
    expect(launchYear(undefined)).toBeNull();
  });

  it('descarta registros incompletos o raros', () => {
    expect(toRow({ ...ISS_OMM, MEAN_MOTION: undefined })).toBeNull();
    expect(toRow({ ...ISS_OMM, EPOCH: 'ayer' })).toBeNull();
    expect(toRow({ ...ISS_OMM, OBJECT_NAME: '' })).toBeNull();
    expect(isSatRow(['ISS', 1, 'x', 1, 1, 1, 1, 1, 1, 1, 1])).toBe(false);
    expect(isSatRow(['ISS', 1, 'x', 1, 1, 1, 1, 1, 1, 1, 1, 'uno'])).toBe(false);
  });

  it('dibuja hasta las órbitas de navegación, no las geoestacionarias', () => {
    const iss = toRow(ISS_OMM)!;
    const withMotion = (n: number, e = 0): SatRow => [iss[0], iss[1], iss[2], n, e, ...iss.slice(5)] as SatRow;
    expect(fitsOnMap(iss)).toBe(true);
    expect(fitsOnMap(withMotion(2.0056))).toBe(true); // GPS
    expect(fitsOnMap(withMotion(1.7048))).toBe(true); // Galileo
    expect(fitsOnMap(withMotion(1.0027))).toBe(false); // geoestacionario
    expect(fitsOnMap(withMotion(2.006, 0.72))).toBe(false); // Mólniya
  });
});

describe('órbita de la ISS', () => {
  const row = toRow(ISS_OMM)!;
  const rec = satrecOf(row)!;
  const out = new Float32Array(3);

  it('da una vuelta cada unos 92 minutos', () => {
    expect(periodMinutes(row[3])).toBeGreaterThan(91);
    expect(periodMinutes(row[3])).toBeLessThan(94);
  });

  it('va entre 370 y 460 km de altura y nunca más al norte o al sur que su inclinación', () => {
    // Un día entero desde la época, cada 5 minutos.
    for (let m = 0; m < 1440; m += 5) {
      const date = new Date(EPOCH + m * 60_000);
      expect(positionAt(rec, date, gstime(date), out)).toBe(true);
      const { lat, alt } = geoOf(out[0], out[1], out[2]);
      expect(alt * 6371).toBeGreaterThan(370);
      expect(alt * 6371).toBeLessThan(460);
      expect(Math.abs(lat)).toBeLessThanOrEqual(51.7);
    }
  });

  it('cae sobre la longitud y la latitud que da satellite.js', () => {
    for (let m = 0; m < 180; m += 20) {
      const date = new Date(EPOCH + m * 60_000);
      const gmst = gstime(date);
      positionAt(rec, date, gmst, out);
      const mine = geoOf(out[0], out[1], out[2]);
      const pv = propagate(rec, date)!;
      const ref = eciToGeodetic(pv.position, gmst);
      const dLon = ((((mine.lon - (ref.longitude * 180) / Math.PI) % 360) + 540) % 360) - 180;
      expect(Math.abs(dLon)).toBeLessThan(0.01);
      // Latitud geocéntrica (la del globo) frente a geodésica: difieren como mucho 0,2°.
      expect(Math.abs(mine.lat - (ref.latitude * 180) / Math.PI)).toBeLessThan(0.25);
    }
  });

  it('no inventa posición con elementos imposibles', () => {
    expect(satrecOf([...row.slice(0, 4), 1.5, ...row.slice(5)] as SatRow)).toBeNull();
  });
});

describe('órbita dibujada de la ISS', () => {
  const rec = satrecOf(toRow(ISS_OMM)!)!;
  const start = new Date(EPOCH + 3 * 3600_000);
  const path = orbitPath(rec, start)!;
  const n = path.length / 3;
  const km = (i: number) => [path[i * 3] * 6371, path[i * 3 + 1] * 6371, path[i * 3 + 2] * 6371];

  it('es una vuelta cerrada', () => {
    expect(n).toBe(97);
    const [a, b] = [km(0), km(n - 1)];
    // En una vuelta la órbita apenas se desplaza (el nodo retrocede unos 0,35°): la elipse cierra.
    expect(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])).toBeLessThan(60);
  });

  it('va entre 370 y 460 km de altura', () => {
    for (let i = 0; i < n; i++) {
      const alt = Math.hypot(...km(i)) - 6371;
      expect(alt).toBeGreaterThan(370);
      expect(alt).toBeLessThan(460);
    }
  });

  it('el satélite va sobre su línea, también unos minutos después de trazarla', () => {
    for (const minutes of [0, 7, 15]) {
      const date = new Date(start.getTime() + minutes * 60_000);
      const gmst = gstime(date);
      const here = new Float32Array(3);
      positionAt(rec, date, gmst, here);
      const p = [here[0] * 6371, here[1] * 6371, here[2] * 6371];
      // Distancia del satélite al tramo más cercano de la línea, ya girada a esta hora.
      let best = Infinity;
      for (let i = 0; i < n - 1; i++) {
        const a = toGlobe(path[i * 3], path[i * 3 + 1], path[i * 3 + 2], gmst).map((v) => v * 6371);
        const b = toGlobe(path[i * 3 + 3], path[i * 3 + 4], path[i * 3 + 5], gmst).map((v) => v * 6371);
        const ab = b.map((v, k) => v - a[k]);
        const t = Math.max(0, Math.min(1, ab.reduce((sum, v, k) => sum + v * (p[k] - a[k]), 0) / ab.reduce((sum, v) => sum + v * v, 0)));
        best = Math.min(best, Math.hypot(...p.map((v, k) => v - (a[k] + t * ab[k]))));
      }
      expect(best).toBeLessThan(10);
    }
  });
});

describe('iconos', () => {
  it('cada grupo tiene su silueta en el sombreador y en la leyenda', () => {
    const glsl = iconGlsl();
    expect(glsl.match(/if \(kind < /g)).toHaveLength(4);
    expect(glsl).not.toContain('`');
    expect(glsl).not.toContain('NaN');
    expect(iconSvg('estaciones').length).toBeGreaterThan(1);
  });
});

describe('ficha de la ISS', () => {
  const rec = satrecOf(toRow(ISS_OMM)!)!;

  it('da datos de ahora con sentido', () => {
    const now = satNow(rec, new Date(EPOCH + 3600_000))!;
    expect(now.altitudeKm).toBeGreaterThan(370);
    expect(now.altitudeKm).toBeLessThan(460);
    // Unos 7,66 km/s.
    expect(now.speedKmh).toBeGreaterThan(27_000);
    expect(now.speedKmh).toBeLessThan(28_000);
    expect(now.periodMin).toBeCloseTo(periodMinutes(ISS_OMM.MEAN_MOTION), 1);
    expect(now.inclinationDeg).toBeCloseTo(51.63, 2);
    expect(Math.abs(now.lat)).toBeLessThanOrEqual(51.7);
    expect(Math.abs(now.lon)).toBeLessThanOrEqual(180);
  });
});

describe('satélite bajo el cursor', () => {
  it('la Tierra tapa lo que queda detrás, no lo que está a un lado ni delante', () => {
    const eye = [0, 0, 5] as const;
    expect(hiddenByEarth(eye, [0, 0, -1.1])).toBe(true);
    expect(hiddenByEarth(eye, [0, 0, 1.1])).toBe(false);
    expect(hiddenByEarth(eye, [1.5, 0, -1])).toBe(false);
  });

  it('elige el más cercano dentro del radio y se salta los que no se ven', () => {
    const pts = [
      [100, 100, true],
      [108, 100, true],
      [103, 100, false],
      [300, 300, true],
    ] as const;
    const screenOf = (i: number, out: { x: number; y: number }) => {
      out.x = pts[i][0];
      out.y = pts[i][1];
      return pts[i][2];
    };
    expect(nearestOnScreen(pts.length, screenOf, 103, 100, 12)).toBe(0);
    expect(nearestOnScreen(pts.length, screenOf, 107, 101, 12)).toBe(1);
    expect(nearestOnScreen(pts.length, screenOf, 200, 200, 12)).toBe(-1);
  });
});
