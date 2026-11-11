// Hilo aparte que triangula el atlas (ver ./meshAsync.ts). Recibe los polígonos de cada país y
// devuelve los búferes de la malla, cedidos (sin copiarlos).
import { buildMesh, type MeshInput } from './mesh';

interface Request {
  id: number;
  countries: MeshInput['countries'];
}

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage(message: unknown, transfer: Transferable[]): void;
};

scope.onmessage = (event) => {
  const mesh = buildMesh(event.data);
  scope.postMessage({ id: event.data.id, mesh }, [mesh.fill.buffer, mesh.fillIndex.buffer, mesh.ring.buffer, mesh.edges.buffer, mesh.edgeIsBorder.buffer]);
};
