"""Genera public/data/nightlights.webp: las luces de las ciudades de noche, que el mapa enciende en
la cara nocturna cuando se ve el día y la noche en tiempo real.

Fuente: «Black Marble 2016» (NASA Earth Observatory, imágenes de Joshua Stevens con datos del
sensor VIIRS del satélite Suomi NPP, cortesía de Miguel Román, NASA GSFC). Dominio público.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar
     https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_3km.jpg (8 MB)
  2. python scripts/build-nightlights.py ruta/a/BlackMarble_2016_3km.jpg

La imagen original es una foto para mirar: la tierra va en un azul grisáceo oscuro y el mar casi en
negro, con las luces encima en blanco cálido. Aquí se quita ese fondo y se deja solo la luz, en
grises (0 = a oscuras, 255 = el centro de una gran ciudad), en longitud/latitud y a 4096×2048. El
color lo pone el sombreador (FILL_FRAG).
"""
import os
import sys

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'nightlights.webp')
W, H = 4096, 2048
FLOOR = 62   # el fondo más claro de la foto (el hielo de la Antártida) no pasa de 51 en rojo y verde
GAIN = 1.25  # al reducir, un pueblo de un píxel se reparte entre varios: se compensa un poco


def main(path: str) -> None:
    Image.MAX_IMAGE_PIXELS = None  # 13500 × 6750: PIL avisa a partir de 89 millones de píxeles
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    # La luz es cálida: tiene rojo y verde. El fondo azulado, casi nada de los dos.
    light = np.clip((np.minimum(rgb[..., 0], rgb[..., 1]) - FLOOR) / (255 - FLOOR), 0, 1)
    img = Image.fromarray(light, 'F').resize((W, H), Image.LANCZOS)
    out = Image.fromarray((np.clip(np.asarray(img) * GAIN, 0, 1) * 255 + 0.5).astype(np.uint8), 'L')
    out.save(OUT, 'WEBP', quality=70, method=6)
    print(f'{OUT}: {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python scripts/build-nightlights.py ruta/a/BlackMarble_2016_3km.jpg (ver la cabecera)')
    main(sys.argv[1])
