// Lectura de un mensaje GRIB2 de los que publica el modelo GFS de la NOAA: una rejilla regular de
// latitud y longitud con sus valores. Solo entiende lo que usan esos ficheros: rejilla 3.0 y datos
// con empaquetado simple (5.0) o complejo, con o sin diferencias espaciales (5.2 y 5.3), sin mapa de
// bits. Sin dependencias: lo carga la función de Vercel (api/tiempo.ts) y tiene pruebas.
//
// Referencia: OMM, Manual de claves, volumen I.2, FM 92 GRIB edición 2 (plantillas 3.0, 5.0, 5.2,
// 5.3, 7.0, 7.2 y 7.3).

export interface Grid {
  /** Columnas (de oeste a este) y filas (de norte a sur). */
  ni: number;
  nj: number;
  /** Latitud y longitud del primer punto y paso entre puntos, en grados. */
  lat0: number;
  lon0: number;
  dLat: number;
  dLon: number;
  /** Valores por filas, empezando por (lat0, lon0). */
  values: Float32Array;
}

/** Lector de bits de un bloque de bytes, del más significativo al menos. */
class Bits {
  // (Sin «propiedades de parámetro»: este fichero lo carga Node quitándole solo los tipos.)
  private readonly bytes: Uint8Array;
  private pos: number;
  constructor(bytes: Uint8Array, start: number) {
    this.bytes = bytes;
    this.pos = start * 8;
  }
  read(n: number): number {
    let value = 0;
    for (let left = n; left > 0; ) {
      const byte = this.bytes[this.pos >> 3];
      const free = 8 - (this.pos & 7);
      const take = Math.min(free, left);
      value = value * 2 ** take + ((byte >> (free - take)) & ((1 << take) - 1));
      this.pos += take;
      left -= take;
    }
    return value;
  }
  /** Salta al principio del byte siguiente, si no se está ya en uno. */
  align() {
    this.pos = (this.pos + 7) & ~7;
  }
}

/** Entero con signo en «signo y magnitud» (el bit alto es el signo), como los escribe GRIB. */
const signed = (value: number, bits: number) => (value >= 2 ** (bits - 1) ? -(value - 2 ** (bits - 1)) : value);

export function decodeGrib2(bytes: Uint8Array): Grid {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 16 || String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) !== 'GRIB' || bytes[7] !== 2) {
    throw new Error('No es un mensaje GRIB de la edición 2.');
  }
  let grid: Omit<Grid, 'values'> | null = null;
  let rep: { template: number; at: number; points: number } | null = null;
  let values: Float32Array | null = null;

  for (let at = 16; at + 5 <= bytes.length; ) {
    if (bytes[at] === 0x37 && bytes[at + 1] === 0x37 && bytes[at + 2] === 0x37 && bytes[at + 3] === 0x37) break;
    const length = view.getUint32(at);
    const section = bytes[at + 4];
    if (length < 5) throw new Error('Sección GRIB de longitud imposible.');
    if (section === 3) {
      if (view.getUint16(at + 12) !== 0) throw new Error('Solo se lee la rejilla regular de latitud y longitud (3.0).');
      const ni = view.getUint32(at + 30);
      const nj = view.getUint32(at + 34);
      const micro = (offset: number) => signed(view.getUint32(at + offset), 32) / 1e6;
      const scan = bytes[at + 71];
      // Bit 1: de este a oeste; bit 2: de sur a norte; bit 3: por columnas. GFS va de oeste a este y de norte a sur.
      if (scan & 0b1010_0000) throw new Error('Orden de la rejilla no previsto.');
      grid = { ni, nj, lat0: micro(46), lon0: micro(50), dLon: micro(63), dLat: (scan & 0b0100_0000 ? 1 : -1) * micro(67) };
    } else if (section === 5) {
      rep = { template: view.getUint16(at + 9), at, points: view.getUint32(at + 5) };
    } else if (section === 6) {
      if (bytes[at + 5] !== 255) throw new Error('No se leen mensajes con mapa de bits.');
    } else if (section === 7) {
      if (!rep) throw new Error('Faltan los datos de empaquetado.');
      values = unpack(bytes, view, rep, at + 5);
    }
    at += length;
  }
  if (!grid || !values) throw new Error('Mensaje GRIB incompleto.');
  if (values.length !== grid.ni * grid.nj) throw new Error('La rejilla y los datos no coinciden.');
  return { ...grid, values };
}

function unpack(bytes: Uint8Array, view: DataView, rep: { template: number; at: number; points: number }, data: number): Float32Array {
  const { at, points, template } = rep;
  const reference = view.getFloat32(at + 11);
  const binary = 2 ** signed(view.getUint16(at + 15), 16);
  const decimal = 10 ** -signed(view.getUint16(at + 17), 16);
  const bitsPerValue = bytes[at + 19];
  const out = new Float32Array(points);
  const scale = (packed: number) => (reference + packed * binary) * decimal;

  if (template === 0) {
    const bits = new Bits(bytes, data);
    for (let i = 0; i < points; i++) out[i] = scale(bitsPerValue ? bits.read(bitsPerValue) : 0);
    return out;
  }
  if (template !== 2 && template !== 3) throw new Error(`Empaquetado GRIB no previsto (5.${template}).`);
  if (bytes[at + 22] !== 0) throw new Error('No se leen datos con valores ausentes.');

  const groups = view.getUint32(at + 31);
  const widthReference = bytes[at + 35];
  const widthBits = bytes[at + 36];
  const lengthReference = view.getUint32(at + 37);
  const lengthIncrement = bytes[at + 41];
  const lastLength = view.getUint32(at + 42);
  const lengthBits = bytes[at + 46];
  const order = template === 3 ? bytes[at + 47] : 0;
  const extraOctets = template === 3 ? bytes[at + 48] : 0;

  const bits = new Bits(bytes, data);
  // Con diferencias espaciales, delante van los primeros valores sin diferenciar y el mínimo de las diferencias.
  const first: number[] = [];
  let minimum = 0;
  if (order) {
    for (let i = 0; i < order; i++) first.push(signed(bits.read(extraOctets * 8), extraOctets * 8));
    minimum = signed(bits.read(extraOctets * 8), extraOctets * 8);
  }
  const references = Array.from({ length: groups }, () => (bitsPerValue ? bits.read(bitsPerValue) : 0));
  bits.align();
  const widths = Array.from({ length: groups }, () => widthReference + (widthBits ? bits.read(widthBits) : 0));
  bits.align();
  const lengths = Array.from({ length: groups }, () => lengthReference + (lengthBits ? bits.read(lengthBits) : 0) * lengthIncrement);
  if (groups) lengths[groups - 1] = lastLength;
  bits.align();

  const packed = new Float64Array(points);
  let n = 0;
  for (let g = 0; g < groups; g++) {
    for (let i = 0; i < lengths[g]; i++) {
      if (n >= points) throw new Error('Los grupos del mensaje GRIB traen más valores que la rejilla.');
      packed[n++] = references[g] + (widths[g] ? bits.read(widths[g]) : 0);
    }
  }
  if (n !== points) throw new Error('Los grupos del mensaje GRIB no cubren la rejilla.');

  // Se deshacen las diferencias: de primer orden, cada valor es el anterior más la diferencia; de
  // segundo, lo que se guarda es la diferencia de las diferencias.
  if (order === 1) {
    packed[0] = first[0];
    for (let i = 1; i < points; i++) packed[i] = packed[i] + minimum + packed[i - 1];
  } else if (order === 2) {
    packed[0] = first[0];
    packed[1] = first[1];
    for (let i = 2; i < points; i++) packed[i] = packed[i] + minimum + 2 * packed[i - 1] - packed[i - 2];
  } else if (order) {
    throw new Error('Orden de diferencias espaciales no previsto.');
  }
  for (let i = 0; i < points; i++) out[i] = scale(packed[i]);
  return out;
}
