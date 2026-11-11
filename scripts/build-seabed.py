"""Genera public/data/seabed.webp: el relieve del fondo del mar (dorsales, fosas, taludes, montes
submarinos) como sombreado, para dar volumen al color del océano.

Fuente: ETOPO2v2 (NOAA National Geophysical Data Center, 2006), modelo global de relieve de 2
minutos de arco; el fondo marino procede de la altimetría por satélite de Smith y Sandwell. Dominio
público.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar y descomprimir
     https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO2/ETOPO2v2-2006/ETOPO2v2c/raw_binary/ETOPO2v2c_i2_LSB.zip (73 MB)
  2. python scripts/build-seabed.py ruta/a/ETOPO2v2c_i2_LSB.bin

La imagen va en longitud/latitud (2048×1024), en grises: 128 es fondo llano (o tierra), más claro
las laderas que miran al noroeste y más oscuro las que le dan la espalda, como el sombreado del
relieve de tierra. El sombreador del océano (OCEAN_FRAG) multiplica el color del mar por ella. Lo
único que no viene tal cual de los datos es la exageración vertical: el fondo del mar es muy
tendido y sin ella no se vería nada.
"""
import os
import sys

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'seabed.webp')
COLS, ROWS = 10800, 5400  # la rejilla de ETOPO2v2, de norte a sur y desde 180° O
W, H = 2048, 1024
EXAGGERATION = 14.0       # veces que se exagera la altura
GAIN = 1.5                # contraste del sombreado alrededor del gris medio
AZIMUTH, ALTITUDE = np.radians(315.0), np.radians(45.0)  # luz del noroeste, a media altura


def main(path: str) -> None:
    z = np.fromfile(path, dtype='<i2').reshape(ROWS, COLS).astype(np.float32)
    # A media resolución (4 minutos de arco): es el doble de la de salida, y quita el grano del sondeo.
    z = z.reshape(ROWS // 2, 2, COLS // 2, 2).mean(axis=(1, 3))
    rows, cols = z.shape
    sea = z < 0
    lat = np.radians(90 - (np.arange(rows) + 0.5) * 180 / rows)[:, None]
    cell = 6_371_000 * np.radians(180 / rows)  # metros por celda de norte a sur
    # Pendiente hacia el este (dando la vuelta al antimeridiano) y hacia el norte. Cerca de los polos
    # las celdas se estrechan hasta nada: se acota para que la pendiente no se dispare.
    east = (np.roll(z, -1, axis=1) - np.roll(z, 1, axis=1)) / (2 * cell * np.maximum(np.cos(lat), 0.2))
    north = np.zeros_like(z)
    north[1:-1] = (z[:-2] - z[2:]) / (2 * cell)
    p, q = east * EXAGGERATION, north * EXAGGERATION
    light = (np.cos(ALTITUDE) * np.sin(AZIMUTH), np.cos(ALTITUDE) * np.cos(AZIMUTH), np.sin(ALTITUDE))
    shade = (-p * light[0] - q * light[1] + light[2]) / np.sqrt(1 + p * p + q * q)
    level = 0.5 + (shade - light[2]) * GAIN
    level = np.where(sea, level, 0.5)
    img = Image.fromarray(np.clip(level, 0, 1).astype(np.float32), 'F').resize((W, H), Image.LANCZOS)
    out = Image.fromarray((np.clip(np.asarray(img), 0, 1) * 255 + 0.5).astype(np.uint8), 'L')
    out.save(OUT, 'WEBP', quality=62, method=6)
    print(f'{OUT}: {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Uso: python scripts/build-seabed.py ruta/a/ETOPO2v2c_i2_LSB.bin (ver la cabecera)')
    main(sys.argv[1])
