"""Genera public/data/milkyway.webp: el resplandor de la Vía Láctea que se ve tras el globo.

Fuente: NASA/Goddard Space Flight Center Scientific Visualization Studio, «Deep Star Maps 2020»
(https://svs.gsfc.nasa.gov/4851), hecho con Gaia DR2 (ESA/Gaia/DPAC). Es el cielo real, sin las
estrellas sueltas (esas las pone el catálogo BSC5): solo el brillo difuso de la galaxia y sus nubes
de polvo, más las dos Nubes de Magallanes.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/milkyway_2020_4k_print.jpg
  2. python scripts/build-milkyway.py <ruta al .jpg>

La imagen va en coordenadas ecuatoriales J2000 (ascensión recta y declinación), 1024×512, con la
ascensión recta 0 h en el centro y creciendo hacia la izquierda: se deja tal cual, y el sombreador
(SKY_FRAG) la coloca con la hora sidérea, igual que las estrellas. Lo único que se toca es el
fondo: el original no llega al negro (gris ~20/255 con ruido de compresión), así que se resta ese
suelo para que el cielo vacío quede transparente.
"""
import os
import sys

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'milkyway.webp')
FLOOR = 26  # por debajo de esto es fondo, no galaxia


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit('Uso: python scripts/build-milkyway.py ruta/a/milkyway_2020_4k_print.jpg')
    image = Image.open(sys.argv[1]).convert('RGB')
    assert image.size == (1024, 512), image.size
    scale = 255 / (255 - FLOOR)
    image = image.point(lambda v: max(0, round((v - FLOOR) * scale)))
    image.save(OUT, 'WEBP', quality=82, method=6)
    print(f'{OUT}: {os.path.getsize(OUT) / 1024:.0f} KB')


if __name__ == '__main__':
    main()
