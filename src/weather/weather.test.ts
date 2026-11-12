import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { byteToTemp, byteToWind, cloudToByte, GRID_ROWS, GRID_WIDTH, isRainTime, isWeatherKind, TEMP_STOPS, tempToByte, windToByte } from './format';
import { decodeGrib2, type Grid } from './grib2';
import { encodePng, fieldRanges, modelRuns, modelUrl, packModel } from './model';

// Un mensaje real del modelo GFS (NOAA, dominio público): temperatura a 2 m, pasada de las 12 UTC
// del 12 de noviembre de 2026, previsión a 6 horas, rejilla de un grado.
const sample = decodeGrib2(new Uint8Array(readFileSync('src/weather/fixtures/gfs-tmp2m.grib2')));
/** Temperatura en °C en un punto de la rejilla. */
const at = (lat: number, lon: number) => sample.values[(90 - lat) * sample.ni + ((lon + 360) % 360)] - 273.15;

describe('lectura de un mensaje GRIB2 del modelo', () => {
  it('saca la rejilla de un grado, de norte a sur y desde Greenwich', () => {
    expect([sample.ni, sample.nj]).toEqual([GRID_WIDTH, GRID_ROWS]);
    expect([sample.lat0, sample.lon0, sample.dLat, sample.dLon]).toEqual([90, 0, -1, 1]);
    expect(sample.values.length).toBe(360 * 181);
  });

  it('da las temperaturas que da otra lectura del mismo modelo', () => {
    // Contrastadas el mismo día con Open-Meteo (modelo GFS, a 0,25°): Madrid 13,7 °C, Moscú 0,2 °C,
    // Reikiavik 2,5 °C y Singapur 26,4 °C.
    expect(at(40, -4)).toBeCloseTo(13.6, 0);
    expect(at(56, 38)).toBeCloseTo(0.4, 0);
    expect(at(64, -22)).toBeCloseTo(2.2, 0);
    expect(at(1, 104)).toBeCloseTo(27.0, 0);
    // Y es un campo con sentido de punta a punta: frío en los polos, calor en el desierto.
    expect(at(-90, 0)).toBeLessThan(-30);
    expect(at(23, 10)).toBeGreaterThan(20);
    const values = [...sample.values];
    expect(Math.min(...values)).toBeGreaterThan(200);
    expect(Math.max(...values)).toBeLessThan(330);
  });

  it('rechaza lo que no es un mensaje de la edición 2', () => {
    expect(() => decodeGrib2(new Uint8Array(40))).toThrow();
    expect(() => decodeGrib2(new TextEncoder().encode('GRIB' + '\0'.repeat(30)))).toThrow();
  });
});

describe('qué fichero del modelo toca', () => {
  it('prueba de la pasada más reciente a la más antigua, en el paso de tres horas más cercano a ahora', () => {
    const runs = modelRuns(Date.UTC(2026, 10, 12, 19, 8));
    expect(runs.map((r) => [r.cycle.toISOString().slice(0, 13), r.hour])).toEqual([
      // La de las 18 aún no está publicada a las 19:08, pero se prueba primero: nunca la hora 0.
      ['2026-11-12T18', 3],
      ['2026-11-12T12', 6],
      ['2026-11-12T06', 12],
      ['2026-11-12T00', 18],
    ]);
    expect(modelUrl(runs[1])).toBe('https://noaa-gfs-bdp-pds.s3.amazonaws.com/gfs.20261112/12/atmos/gfs.t12z.pgrb2.1p00.f006');
    // Al cambiar de día, la pasada anterior es la de las 18 de la víspera.
    expect(modelRuns(Date.UTC(2026, 0, 1, 1, 0))[1].cycle.toISOString()).toBe('2025-12-31T18:00:00.000Z');
  });

  it('saca del índice el tramo de bytes de cada campo, y solo el valor del momento', () => {
    const index = [
      '580:34300000:d=2026111212:TMP:surface:6 hour fcst:',
      '581:34390507:d=2026111212:TMP:2 m above ground:6 hour fcst:',
      '582:34464742:d=2026111212:SPFH:2 m above ground:6 hour fcst:',
      '588:34900172:d=2026111212:UGRD:10 m above ground:6 hour fcst:',
      '589:34978101:d=2026111212:VGRD:10 m above ground:6 hour fcst:',
      '590:35056570:d=2026111212:CPOFP:surface:6 hour fcst:',
      '635:36900000:d=2026111212:TCDC:entire atmosphere:0-6 hour ave fcst:',
      '636:36921511:d=2026111212:TCDC:entire atmosphere:6 hour fcst:',
    ].join('\n');
    expect(fieldRanges(index)).toEqual({
      temp: 'bytes=34390507-34464741',
      u: 'bytes=34900172-34978100',
      v: 'bytes=34978101-35056569',
      // El último mensaje del fichero llega hasta el final.
      cloud: 'bytes=36921511-',
    });
    expect(() => fieldRanges('1:0:d=2026111212:TMP:surface:6 hour fcst:')).toThrow();
  });
});

describe('la imagen que viaja al mapa', () => {
  it('guarda cada dato en un byte y lo devuelve con poco error', () => {
    expect(byteToTemp(tempToByte(13.6))).toBeCloseTo(13.6, 0);
    expect(byteToTemp(tempToByte(-80))).toBe(-60);
    expect(byteToTemp(tempToByte(70))).toBe(60);
    expect(windToByte(0)).toBe(128);
    expect(byteToWind(windToByte(-8.4))).toBeCloseTo(-8.4, 0);
    expect(cloudToByte(100)).toBe(255);
    // La escala de la leyenda va de menos a más, sin saltos atrás.
    expect(TEMP_STOPS.every(([celsius], i) => i === 0 || celsius > TEMP_STOPS[i - 1][0])).toBe(true);
  });

  it('pone el antimeridiano a la izquierda, la temperatura arriba y la nubosidad abajo', () => {
    const flat = (value: number): Grid => ({ ni: 360, nj: 181, lat0: 90, lon0: 0, dLat: -1, dLon: 1, values: new Float32Array(360 * 181).fill(value) });
    const rgb = packModel({ temp: sample, u: flat(8), v: flat(-8), cloud: flat(50) });
    expect(rgb.length).toBe(360 * 362 * 3);
    // Madrid (40° N, 4° O) cae en la columna 176 de la fila 50.
    const madrid = (50 * 360 + 176) * 3;
    expect(byteToTemp(rgb[madrid])).toBeCloseTo(13.6, 0);
    expect(byteToWind(rgb[madrid + 1])).toBeCloseTo(8, 0);
    expect(byteToWind(rgb[madrid + 2])).toBeCloseTo(-8, 0);
    expect(rgb[((50 + 181) * 360 + 176) * 3]).toBe(cloudToByte(50));
    // Otra rejilla (un cuarto de grado, por ejemplo) no vale.
    expect(() => packModel({ temp: { ...sample, ni: 1440 }, u: flat(0), v: flat(0), cloud: flat(0) })).toThrow();
  });

  it('se codifica como un PNG que se puede volver a leer', () => {
    const rgb = Uint8Array.from({ length: 4 * 3 * 3 }, (_, i) => i * 7);
    const png = encodePng(4, 3, rgb);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
    expect([view.getUint32(16), view.getUint32(20), png[24], png[25]]).toEqual([4, 3, 8, 2]);
    // Tras la cabecera (33 bytes) va el bloque de datos: su longitud, «IDAT» y los píxeles comprimidos.
    const length = view.getUint32(33);
    const raw = inflateSync(png.subarray(41, 41 + length));
    expect(raw.length).toBe((4 * 3 + 1) * 3);
    expect([...raw.subarray(1, 13)]).toEqual([...rgb.subarray(0, 12)]);
    expect([...raw.subarray(14, 26)]).toEqual([...rgb.subarray(12, 24)]);
  });
});

describe('lo que acepta la función', () => {
  it('solo las dos capas y horas bien escritas', () => {
    expect(isWeatherKind('modelo')).toBe(true);
    expect(isWeatherKind('lluvia')).toBe(true);
    expect(isWeatherKind('otra')).toBe(false);
    expect(isRainTime('2026-11-12T13:30:00Z')).toBe(true);
    expect(isRainTime('2026-11-12T13:30:00.000Z')).toBe(false);
    expect(isRainTime('../../x')).toBe(false);
    expect(isRainTime('2026-13-40T99:99:99Z')).toBe(false);
  });
});
