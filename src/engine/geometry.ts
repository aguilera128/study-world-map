import { BufferAttribute, BufferGeometry, InstancedBufferAttribute, InstancedBufferGeometry } from 'three';
import type { Atlas } from '../atlas/atlas';
import type { MeshData } from '../atlas/mesh';
import { DEG } from './projection';

// En todas las geometrías el atributo `position` no es una posición en el espacio, sino
// (longitud, latitud, país): la posición real la calcula el sombreador según la vista.

/** Rejilla de longitud/latitud que cubre todo el planeta: el océano (y la hoja del mapa plano). */
export function oceanGeometry(nx = 180, ny = 90): BufferGeometry {
  const position = new Float32Array((nx + 1) * (ny + 1) * 3);
  let p = 0;
  for (let j = 0; j <= ny; j++) {
    const lat = -Math.PI / 2 + (Math.PI * j) / ny;
    for (let i = 0; i <= nx; i++) {
      position[p++] = -Math.PI + (2 * Math.PI * i) / nx;
      position[p++] = lat;
      position[p++] = 0;
    }
  }
  const index = new Uint16Array(nx * ny * 6);
  let q = 0;
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      const b = a + 1;
      const c = a + nx + 1;
      const d = c + 1;
      // sentido antihorario visto desde fuera del globo
      index[q++] = a;
      index[q++] = b;
      index[q++] = d;
      index[q++] = a;
      index[q++] = d;
      index[q++] = c;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setIndex(new BufferAttribute(index, 1));
  return geometry;
}

export function fillGeometry(mesh: MeshData): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(mesh.fill, 3));
  geometry.setIndex(new BufferAttribute(mesh.fillIndex, 1));
  return geometry;
}

/**
 * Paredes laterales de los países. Cada vértice de contorno se duplica (arriba y abajo) y cada
 * arista se convierte en un rectángulo entre las dos alturas.
 */
export function wallGeometry(mesh: MeshData): BufferGeometry {
  const n = mesh.ring.length / 3;
  const position = new Float32Array(n * 6);
  position.set(mesh.ring, 0);
  position.set(mesh.ring, n * 3);
  const top = new Float32Array(n * 2);
  top.fill(1, 0, n);

  const edges = mesh.edges.length / 2;
  const index = new Uint32Array(edges * 6);
  for (let e = 0; e < edges; e++) {
    const a = mesh.edges[2 * e];
    const b = mesh.edges[2 * e + 1];
    index.set([a, a + n, b + n, a, b + n, b], e * 6);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setAttribute('aTop', new BufferAttribute(top, 1));
  geometry.setIndex(new BufferAttribute(index, 1));
  return geometry;
}

/** Fronteras y costas: un rectángulo instanciado por cada arista real de los contornos. */
export function lineGeometry(mesh: MeshData): InstancedBufferGeometry {
  let count = 0;
  for (let e = 0; e < mesh.edgeIsBorder.length; e++) count += mesh.edgeIsBorder[e];
  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 2);
  let k = 0;
  for (let e = 0; e < mesh.edgeIsBorder.length; e++) {
    if (!mesh.edgeIsBorder[e]) continue;
    const a = mesh.edges[2 * e] * 3;
    const b = mesh.edges[2 * e + 1] * 3;
    start[3 * k] = mesh.ring[a];
    start[3 * k + 1] = mesh.ring[a + 1];
    start[3 * k + 2] = mesh.ring[a + 2];
    end[2 * k] = mesh.ring[b];
    end[2 * k + 1] = mesh.ring[b + 1];
    k++;
  }
  const geometry = new InstancedBufferGeometry();
  // plantilla: x = extremo del tramo (0 o 1), y = lado (−1 o +1)
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3));
  geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));
  geometry.setAttribute('aStart', new InstancedBufferAttribute(start, 3));
  geometry.setAttribute('aEnd', new InstancedBufferAttribute(end, 2));
  geometry.instanceCount = count;
  return geometry;
}

/** Un punto por país del cuestionario, en su ancla: el sombreador decide cuáles se ven. */
export function markerGeometry(atlas: Atlas): BufferGeometry {
  const list = atlas.quizzable;
  const position = new Float32Array(list.length * 3);
  const size = new Float32Array(list.length);
  list.forEach((index, k) => {
    const c = atlas.countries[index];
    position[3 * k] = c.anchor[0] * DEG;
    position[3 * k + 1] = c.anchor[1] * DEG;
    position[3 * k + 2] = index;
    size[k] = c.size;
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setAttribute('aSize', new BufferAttribute(size, 1));
  return geometry;
}

/** Contorno del mapa plano: el marco de la hoja (en el globo coincide con el antimeridiano). */
export function frameGeometry(step = 2): BufferGeometry {
  const pts: number[] = [];
  const push = (lon: number, lat: number) => pts.push(lon * DEG, lat * DEG, 0);
  for (let lat = -90; lat < 90; lat += step) push(-180, lat);
  for (let lon = -180; lon < 180; lon += step) push(lon, 90);
  for (let lat = 90; lat > -90; lat -= step) push(180, lat);
  for (let lon = 180; lon > -180; lon -= step) push(lon, -90);
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(Float32Array.from(pts), 3));
  return geometry;
}

export function quadGeometry(): BufferGeometry {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));
  return geometry;
}
