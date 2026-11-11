// Triangular el atlas tarda (décimas de segundo en un móvil) y, hecho en el hilo principal, deja la
// página sin responder justo antes de que aparezca el mapa. Aquí se hace en un hilo aparte, que
// además arranca en cuanto llega el atlas, sin esperar a que el motor del mapa esté cargado.
import type { Atlas } from './atlas';
import { buildMesh, type MeshData } from './mesh';

let worker: Worker | null = null;
try {
  // El hilo se crea ya, al cargar este módulo: cuando llegue el atlas, su código estará descargado.
  if (typeof Worker !== 'undefined') worker = new Worker(new URL('./meshWorker.ts', import.meta.url), { type: 'module' });
} catch {
  worker = null;
}

const pending = new WeakMap<Atlas, Promise<MeshData>>();
let nextId = 0;

function inWorker(atlas: Atlas): Promise<MeshData> {
  const w = worker;
  if (!w) return Promise.reject(new Error('sin hilos'));
  return new Promise((resolve, reject) => {
    const id = nextId++;
    const off = () => {
      w.removeEventListener('message', done);
      w.removeEventListener('error', fail);
    };
    const done = (event: MessageEvent<{ id: number; mesh: MeshData }>) => {
      if (event.data.id !== id) return;
      off();
      resolve(event.data.mesh);
    };
    const fail = () => {
      off();
      worker = null;
      reject(new Error('el hilo de la malla ha fallado'));
    };
    w.addEventListener('message', done);
    w.addEventListener('error', fail);
    w.postMessage({ id, countries: atlas.countries.map((c) => ({ index: c.index, polygons: c.polygons })) });
  });
}

/** Empieza a construir la malla de un atlas. Si no hay hilos (o fallan), se hace aquí mismo. */
export function warmMesh(atlas: Atlas): Promise<MeshData> {
  let mesh = pending.get(atlas);
  if (!mesh) {
    mesh = inWorker(atlas).catch(() => buildMesh(atlas));
    pending.set(atlas, mesh);
  }
  return mesh;
}

/** La malla de un atlas, para quien la va a usar: no se guarda copia (son varios megas). */
export function takeMesh(atlas: Atlas): Promise<MeshData> {
  const mesh = warmMesh(atlas);
  pending.delete(atlas);
  return mesh;
}
