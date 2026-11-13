import { eciToGeodetic, gstime, propagate } from 'satellite.js';
import { describe, expect, it } from 'vitest';
import { fitsOnMap, isSatRow, periodMinutes, toRow, type SatRow } from './format';
import { geoOf, positionAt, satrecOf } from './orbit';

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
    expect(row).toEqual(['ISS (ZARYA)', 25544, '2026-11-13T04:57:32.119200', 15.4934692, 0.00073498, 51.6325, 282.6584, 20.2588, 339.869, 0.00016131939, 0.00008559, 0]);
    expect(isSatRow(row)).toBe(true);
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
