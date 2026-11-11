"""Pasa a WebP las teselas de detalle que scripts/download-tiles.mjs dejó en teselas/, para que pesen
menos de la mitad. Cada .webp se escribe junto a su original, que se conserva: es de donde se puede
volver a convertir con otra calidad. Los que se suben al Blob son los .webp (scripts/upload-tiles.mjs).

  foto   JPEG de la NASA -> WebP con pérdida, calidad 80. Es una segunda compresión; medida sobre
         una muestra, la diferencia con el JPEG queda por encima de 45 dB de media.
  luces  PNG gris con transparencia -> WebP sin pérdida: la misma imagen, píxel a píxel.

Se ejecuta a mano (un cuarto de hora con todos los núcleos):
  python scripts/convert-tiles.py           todo lo que aún no esté convertido
  python scripts/convert-tiles.py foto/3    solo lo que cuelga de esa carpeta
Se puede interrumpir y volver a lanzar: lo ya convertido no se repite.
"""
import os
import sys
from concurrent.futures import ProcessPoolExecutor

from PIL import Image

TILES = os.path.join(os.path.dirname(__file__), '..', 'teselas')
PHOTO_QUALITY = 80


def convert(src: str) -> int:
    """Convierte una tesela y devuelve los bytes del .webp (0 si ya estaba)."""
    out = os.path.splitext(src)[0] + '.webp'
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return 0
    part = out + '.part'  # si se interrumpe a medias no queda un .webp roto
    if src.endswith('.png'):
        Image.open(src).convert('RGBA').save(part, format='WEBP', lossless=True, method=6)
    else:
        Image.open(src).convert('RGB').save(part, format='WEBP', quality=PHOTO_QUALITY, method=6)
    os.replace(part, out)
    return os.path.getsize(out)


def main() -> None:
    root = os.path.join(TILES, sys.argv[1] if len(sys.argv) > 1 else '')
    sources = [os.path.join(d, f) for d, _, fs in os.walk(root) for f in fs if f.endswith(('.jpeg', '.png'))]
    before = sum(os.path.getsize(p) for p in sources)
    done = size = 0
    with ProcessPoolExecutor() as pool:
        for n, written in enumerate(pool.map(convert, sources, chunksize=64), 1):
            done += written > 0
            size += written
            if n % 2000 == 0:
                print(f'{n} de {len(sources)}', flush=True)
    after = sum(os.path.getsize(os.path.splitext(p)[0] + '.webp') for p in sources)
    print(f'Hecho: {len(sources)} teselas, {done} convertidas ahora ({size / 1e6:.0f} MB). '
          f'Originales {before / 1e6:.0f} MB, WebP {after / 1e6:.0f} MB ({after / before * 100:.0f} %).')


if __name__ == '__main__':
    main()
