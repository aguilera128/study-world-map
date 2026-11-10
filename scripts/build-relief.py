"""Genera public/data/relief.webp y relief-hd.webp: el sombreado del relieve que se pinta sobre la tierra.

Fuente: Natural Earth 1:50m «Shaded Relief» (SR_50M, dominio público), derivado de SRTM Plus.
En la imagen, 206 es terreno llano; más oscuro es ladera en sombra y más claro, ladera iluminada.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar y descomprimir https://naciscdn.org/naturalearth/50m/raster/SR_50M.zip
  2. python scripts/build-relief.py <ruta de SR_50M.tif>

Solo se reduce de 10800×5400 y se guarda en WebP: a 4096×2048 la normal y a 8192×4096 la de
detalle, que el mapa pide al acercarse.
"""
import os
import sys

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
DATA = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')

if __name__ == '__main__':
    source = Image.open(sys.argv[1])
    for name, width in (('relief.webp', 4096), ('relief-hd.webp', 8192)):
        out = os.path.join(DATA, name)
        source.resize((width, width // 2), Image.LANCZOS).save(out, quality=60, method=6)
        print(out, os.path.getsize(out), 'bytes')
