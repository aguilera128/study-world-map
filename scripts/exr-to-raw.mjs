// Paso previo de scripts/build-milkyway.py: decodifica un EXR con el cargador de three (ya instalado)
// y vuelca sus píxeles RGBA en float32, de abajo arriba. Uso: node scripts/exr-to-raw.mjs entrada.exr salida.f32
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FloatType } from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

function main() {
  const [, , input, output] = process.argv;
  if (!input || !output) throw new Error('Uso: node scripts/exr-to-raw.mjs entrada.exr salida.f32');
  const file = readFileSync(input);
  const exr = new EXRLoader().setDataType(FloatType).parse(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  writeFileSync(output, Buffer.from(exr.data.buffer, exr.data.byteOffset, exr.data.byteLength));
  console.log(`${exr.width}×${exr.height}, ${exr.data.length / (exr.width * exr.height)} canales`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
