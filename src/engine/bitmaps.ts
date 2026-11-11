// Imágenes de las texturas del mapa, decodificadas fuera del hilo principal.
//
// Una textura hecha con un <img> se decodifica al subirla a la tarjeta gráfica, en el hilo principal:
// con las grandes (relieve y Vía Láctea, 4096 × 2048) la página se queda sin responder un cuarto de
// segundo o más por imagen, y varias veces eso en un móvil. «createImageBitmap» las decodifica en
// segundo plano y la subida pasa a ser casi instantánea.
//
// Este módulo no depende de three.js: así se pueden pedir las imágenes antes de que el motor del
// mapa esté cargado (ver «load» en app/store.ts).

// La imagen ya volteada, como la espera WebGL, y sin tocar sus valores: son datos, no fotos.
const OPTIONS: ImageBitmapOptions = { imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none' };

const pending = new Map<string, Promise<ImageBitmap>>();
let flips: Promise<boolean> | undefined;

/** ¿El navegador voltea la imagen cuando se le pide? Alguno acepta la opción y no hace nada. */
function canFlip(): Promise<boolean> {
  return (flips ??= (async () => {
    try {
      // Un píxel rojo encima de uno azul: volteada, el de arriba es el azul.
      const probe = await createImageBitmap(new ImageData(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]), 1, 2), OPTIONS);
      const ctx = document.createElement('canvas').getContext('2d');
      if (!ctx) return false;
      ctx.drawImage(probe, 0, 0);
      probe.close();
      return ctx.getImageData(0, 0, 1, 1).data[2] > 128;
    } catch {
      return false;
    }
  })());
}

/** Empieza a descargar y decodificar una imagen. Falla si el navegador no puede hacerlo así. */
export function warmBitmap(url: string): Promise<ImageBitmap> {
  let image = pending.get(url);
  if (!image) {
    image = canFlip().then(async (ok) => {
      if (!ok) throw new Error('createImageBitmap no voltea la imagen');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
      return createImageBitmap(await res.blob(), OPTIONS);
    });
    // Quien la pidió por adelantado no espera el resultado: que un fallo no quede sin atender.
    image.catch(() => pending.delete(url));
    pending.set(url, image);
  }
  return image;
}

/** La imagen, para quien la va a usar: no se guarda copia (decodificada ocupa decenas de megas). */
export function takeBitmap(url: string): Promise<ImageBitmap> {
  const image = warmBitmap(url);
  pending.delete(url);
  return image;
}
