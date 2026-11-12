import { useEffect } from 'react';
import { create } from 'zustand';
import type { MapEngine } from '../engine/MapEngine';
import { RAIN_COLS, RAIN_HEIGHT, RAIN_ROWS, RAIN_TILE, RAIN_WIDTH, VALID_HEADER } from '../weather/format';

// El tiempo de ahora, del lado de la aplicación: pide los datos a nuestra propia función
// (/api/tiempo, que es quien habla con la NOAA y la NASA), los prepara para el motor del mapa y
// guarda de cuándo son, para decirlo junto a la leyenda. Solo se piden con alguna de sus capas
// encendida, y se renuevan cada media hora mientras siga así.

/** Cada cuánto se vuelve a preguntar si hay datos más recientes. */
const REFRESH = 30 * 60_000;

interface WeatherInfo {
  /** A qué hora corresponde lo que se ve de cada fuente (ISO 8601), o null si aún no hay nada. */
  model: string | null;
  rain: string | null;
  /** La última petición ha fallado: no hay datos que enseñar (o se siguen viendo los anteriores). */
  failed: boolean;
}

/** De cuándo es lo que pintan las capas del tiempo. Lo lee la leyenda de las capas. */
export const useWeatherInfo = create<WeatherInfo>(() => ({ model: null, rain: null, failed: false }));

const canvasOf = (width: number, height: number) => Object.assign(document.createElement('canvas'), { width, height });

/** Temperatura, viento y nubosidad del modelo, en los píxeles que espera el motor. */
async function loadModel(): Promise<{ pixels: Uint8Array; width: number; height: number; valid: string }> {
  const res = await fetch('/api/tiempo?capa=modelo');
  const valid = res.headers.get(VALID_HEADER);
  if (!res.ok || !valid) throw new Error(`Sin modelo (${res.status}).`);
  // Los canales son datos: que el navegador no les aplique perfiles de color.
  const bitmap = await createImageBitmap(await res.blob(), { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const canvas = canvasOf(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Sin lienzo.');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { pixels: new Uint8Array(data.buffer), width, height, valid };
}

/** La lluvia medida más reciente: las teselas de la NASA, juntas en un lienzo con el mundo entero. */
async function loadRain(): Promise<{ canvas: HTMLCanvasElement; valid: string }> {
  const res = await fetch('/api/tiempo?capa=lluvia');
  if (!res.ok) throw new Error(`Sin lluvia (${res.status}).`);
  const { valid } = (await res.json()) as { valid: string };
  const canvas = canvasOf(RAIN_WIDTH, RAIN_HEIGHT);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Sin lienzo.');
  const tiles: Promise<void>[] = [];
  for (let y = 0; y < RAIN_ROWS; y++) {
    for (let x = 0; x < RAIN_COLS; x++) {
      tiles.push(
        fetch(`/api/tiempo?capa=lluvia&t=${encodeURIComponent(valid)}&x=${x}&y=${y}`).then(async (tile) => {
          if (!tile.ok) throw new Error(`Sin tesela de lluvia (${tile.status}).`);
          const bitmap = await createImageBitmap(await tile.blob());
          // La última fila de teselas se sale del mapa por abajo: el lienzo recorta lo que sobra.
          ctx.drawImage(bitmap, x * RAIN_TILE, y * RAIN_TILE);
          bitmap.close();
        }),
      );
    }
  }
  await Promise.all(tiles);
  return { canvas, valid };
}

/** Repite `load` ahora y cada media hora mientras `on`; devuelve cómo parar. */
function keepFresh(on: boolean, load: () => Promise<void>, clear: () => void): () => void {
  if (!on) {
    clear();
    return () => {};
  }
  let stopped = false;
  const run = () =>
    load().then(
      () => !stopped && useWeatherInfo.setState({ failed: false }),
      () => !stopped && useWeatherInfo.setState({ failed: true }),
    );
  void run();
  const timer = window.setInterval(run, REFRESH);
  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

/** Mantiene las capas del tiempo de ahora en el motor: qué se ve y, mientras se vea, sus datos al día. */
export function useWeather(engine: MapEngine | null, shown: { temp: boolean; cloud: boolean; rain: boolean; wind: boolean }) {
  const { temp, cloud, rain, wind } = shown;
  const model = temp || cloud || wind;

  useEffect(() => engine?.setWeather({ temp, cloud, rain, wind }), [engine, temp, cloud, rain, wind]);

  useEffect(() => {
    if (!engine) return;
    let current = true;
    const stop = keepFresh(
      model,
      async () => {
        const data = await loadModel();
        if (!current) return;
        engine.setWeatherModel(data.pixels, data.width, data.height);
        useWeatherInfo.setState({ model: data.valid });
      },
      () => {
        engine.setWeatherModel(null);
        useWeatherInfo.setState({ model: null });
      },
    );
    return () => {
      current = false;
      stop();
    };
  }, [engine, model]);

  useEffect(() => {
    if (!engine) return;
    let current = true;
    const stop = keepFresh(
      rain,
      async () => {
        const data = await loadRain();
        if (!current) return;
        engine.setWeatherRain(data.canvas);
        useWeatherInfo.setState({ rain: data.valid });
      },
      () => {
        engine.setWeatherRain(null);
        useWeatherInfo.setState({ rain: null });
      },
    );
    return () => {
      current = false;
      stop();
    };
  }, [engine, rain]);
}
