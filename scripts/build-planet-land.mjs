// Contorno real de los continentes para la ilustración de «El planeta» (src/ui/PlanetDialog.tsx):
// tierra de Natural Earth 1:110m en proyección ortográfica, en un círculo de radio 1.
// Se lanza a mano (node scripts/build-planet-land.mjs); el resultado va al repositorio.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { presimplify, simplify } from 'topojson-simplify';

const require = createRequire(import.meta.url);

function main() {
  const world = JSON.parse(readFileSync(require.resolve('world-atlas/land-110m.json'), 'utf8'));
  // A este tamaño (128 px de radio) sobra detalle: se quitan los vértices que no se verían.
  const slim = simplify(presimplify(world), 1);
  const land = feature(slim, slim.objects.land);
  // La misma vista que abre el motor: de frente al gajo (25° E) y algo desde arriba.
  const view = (rotate, extent) => {
    const projection = geoOrthographic().scale(1).translate([0, 0]).clipAngle(90).rotate(rotate);
    if (extent) projection.clipExtent(extent);
    return geoPath(projection).digits(3)(land);
  };
  const out = [
    '// Generado por scripts/build-planet-land.mjs: no editar a mano.',
    '// Tierra de Natural Earth 1:110m (dominio público), proyección ortográfica, radio 1.',
    `export const LAND_GLOBE = '${view([-25, -24])}';`,
    '// La misma, solo el casquete de arriba (el Caribe, entre las dos Américas): el horizonte de la vista de la atmósfera.',
    `export const LAND_LIMB = '${view([80, 72], [[-0.45, -1.01], [0.45, -0.84]])}';`,
    '',
  ].join('\n');
  writeFileSync(new URL('../src/ui/planetLand.ts', import.meta.url), out);
  console.log(`planetLand.ts: ${(out.length / 1024).toFixed(1)} KB`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
