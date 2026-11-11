"""Genera public/data/satellite.webp: la Tierra vista desde el espacio, para la capa «Imagen de
satélite».

Fuente: Blue Marble Next Generation (NASA Earth Observatory, Reto Stöckli), mosaico sin nubes del
sensor MODIS de julio de 2004, sin sombreado del relieve (ese lo pone el mapa). Dominio público.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar
     https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/july/world.200407.3x5400x2700.jpg (1,6 MB)
  2. tener también el relieve ETOPO2v2 de NOAA (ver scripts/build-seabed.py), que dice qué es tierra
  3. python scripts/build-satellite.py ruta/a/world.200407.3x5400x2700.jpg ruta/a/ETOPO2v2c_i2_LSB.bin

La imagen va en longitud/latitud (4096×2048), con transparencia: opaco donde hay tierra fotografiada,
transparente en el mar. El mapa solo la usa dentro de los países, y donde es transparente (islas más
pequeñas que un píxel de la foto, que en ella son mar) deja el color del país.

La costa del mapa (Natural Earth 1:50m) y la de la foto no coinciden al píxel: para que no asome una
franja de mar oscuro dentro de un país, el color de la tierra se extiende unos píxeles mar adentro.
Es lo único que no viene tal cual de la foto.
"""
import os
import sys

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'satellite.webp')
W, H = 4096, 2048
GROW = 12  # píxeles de la foto original (unos 90 km) que la tierra se extiende mar adentro


def main(path: str, relief: str) -> None:
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    # Qué es tierra no se deduce del color de la foto (el agua somera y los bosques oscuros se
    # confunden): sale del modelo de relieve, que tiene el doble de resolución. Es tierra la celda
    # cuyos cuatro puntos están sobre el nivel del mar; los lagos quedan como tierra, con su foto.
    z = np.fromfile(relief, dtype='<i2').reshape(2700, 2, 5400, 2)
    land = (z >= 0).all(axis=(1, 3))
    assert land.shape == rgb.shape[:2], 'la foto y el relieve no casan'
    # La compresión de la foto mancha de mar el primer píxel de la costa: se descarta (y luego se
    # rellena con el color de la tierra de al lado).
    inner = land.copy()
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        inner &= np.roll(land, (dy, dx), axis=(0, 1))
    land = inner
    for _ in range(GROW):
        total = np.zeros_like(rgb)
        count = np.zeros(land.shape, np.float32)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                near = np.roll(land, dx, axis=1)  # da la vuelta por el antimeridiano
                color = np.roll(rgb, dx, axis=1)
                if dy:
                    near = np.roll(near, dy, axis=0)
                    color = np.roll(color, dy, axis=0)
                    edge = 0 if dy == 1 else -1  # los polos no dan la vuelta
                    near[edge] = False
                total += color * near[..., None]
                count += near
        grow = ~land & (count > 0)
        rgb[grow] = total[grow] / count[grow][:, None]
        land |= grow
    rgba = np.dstack([np.where(land[..., None], rgb, 0), land * 255.0]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').resize((W, H), Image.LANCZOS).save(OUT, 'WEBP', quality=80, method=6)
    print(f'{OUT}: {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit('Uso: python scripts/build-satellite.py world.200407.3x5400x2700.jpg ETOPO2v2c_i2_LSB.bin (ver la cabecera)')
    main(sys.argv[1], sys.argv[2])
