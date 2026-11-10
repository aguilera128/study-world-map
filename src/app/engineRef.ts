import type { MapEngine } from '../engine/MapEngine';

// El motor del mapa es único y vive fuera de React: lo crea <MapCanvas> y lo usan las acciones
// del juego para mover la cámara o lanzar destellos sin pasar por el ciclo de renderizado.

let engine: MapEngine | null = null;

export function setEngine(instance: MapEngine | null) {
  engine = instance;
}

export function getEngine(): MapEngine | null {
  return engine;
}
