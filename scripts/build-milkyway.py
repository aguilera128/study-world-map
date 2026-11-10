"""Genera public/data/milkyway.webp: la Vía Láctea que se ve tras el globo.

Fuente: NASA/Goddard Space Flight Center Scientific Visualization Studio, «Deep Star Maps 2020»
(https://svs.gsfc.nasa.gov/4851), hecho con Gaia DR2 (ESA/Gaia/DPAC). Es el cielo real sin las
estrellas brillantes (esas las pone el catálogo BSC5): el brillo de la galaxia, sus nubes de polvo,
las dos Nubes de Magallanes y el grano de las estrellas débiles.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/milkyway_2020_4k.exr (35 MB)
  2. node scripts/exr-to-raw.mjs milkyway_2020_4k.exr milkyway.f32
  3. python scripts/build-milkyway.py milkyway.f32

La imagen va en coordenadas ecuatoriales J2000 (ascensión recta y declinación), 4096×2048, con la
ascensión recta 0 h en el centro y creciendo hacia la izquierda: se deja tal cual, y el sombreador
(SKY_FRAG) la coloca con la hora sidérea, igual que las estrellas. El original es lineal y de alto
rango: aquí solo se le resta el velo de fondo (para que el cielo vacío quede negro), se comprime el
brillo con una curva gamma, se igualan las filas junto a los polos y se guarda en WebP.
"""
import os
import sys

import numpy as np
from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'milkyway.webp')
W, H = 4096, 2048
FLOOR = 0.012   # por debajo de esto es velo de fondo
WHITE = 0.45    # el centro galáctico, casi blanco
GAMMA = 2.0


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('Uso: python scripts/build-milkyway.py milkyway.f32 (ver la cabecera)')
    raw = np.fromfile(sys.argv[1], dtype=np.float32).reshape(H, W, 4)[::-1, :, :3]  # venía de abajo arriba
    # Cerca de los polos celestes cada fila da la vuelta al cielo en un círculo muy pequeño: sus
    # píxeles son mucho más estrechos que altos y el grano se vería como rayas hacia el polo. Se
    # promedia cada fila a lo ancho, tanto como se estrecha (1/cos de la declinación).
    raw = raw.copy()
    for y in range(H):
        width = min(W // 4, round(1 / max(np.cos(np.pi * ((y + 0.5) / H - 0.5)), 1e-3)))
        if width < 2:
            continue
        row = np.concatenate([raw[y, -width:], raw[y], raw[y, :width]])
        total = np.cumsum(row, axis=0)
        raw[y] = (total[width + width // 2 : width + width // 2 + W] - total[width // 2 : width // 2 + W]) / width
    level = np.clip((raw - FLOOR) / (WHITE - FLOOR), 0, 1) ** (1 / GAMMA)
    Image.fromarray((level * 255 + 0.5).astype(np.uint8)).save(OUT, 'WEBP', quality=72, method=6)
    print(f'{OUT}: {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    main()
