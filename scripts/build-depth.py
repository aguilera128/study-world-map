"""Genera public/data/depth.webp: la profundidad del mar que usa el sombreador del océano.

Fuente: Natural Earth 1:10m «Bathymetry» v4.1.0 (dominio público), polígonos anidados por
profundidad (0, 200, 1000, 2000 … 10 000 m) derivados de SRTM30 Plus.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  1. descargar y descomprimir https://naciscdn.org/naturalearth/10m/physical/ne_10m_bathymetry_all.zip
  2. python scripts/build-depth.py <carpeta con los .shp>

La imagen va en longitud/latitud (2048×1024). Cada píxel vale el escalón de profundidad más hondo
que lo cubre: 0 = tierra, 1 = 0–200 m, 2 = 200–1000 m, 3 = 1000–2000 m … 12 = más de 10 000 m,
multiplicado por 21 para ocupar el rango de grises. Después se suaviza un píxel para que el paso de
un escalón a otro no dibuje una línea, y se guarda en WebP con pérdida (el PNG pesa cinco veces más): es lo único
que no viene tal cual de los datos.
"""
import glob
import os
import struct
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

W, H = 2048, 1024
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'depth.webp')


def rings(path):
    """Anillos de todos los polígonos de un .shp (tipo 5), como listas de (lon, lat)."""
    data = open(path, 'rb').read()
    pos = 100
    while pos < len(data):
        (length,) = struct.unpack('>i', data[pos + 4:pos + 8])
        rec = data[pos + 8:pos + 8 + length * 2]
        pos += 8 + length * 2
        if struct.unpack('<i', rec[:4])[0] != 5:
            continue
        nparts, npoints = struct.unpack('<2i', rec[36:44])
        parts = list(struct.unpack(f'<{nparts}i', rec[44:44 + 4 * nparts])) + [npoints]
        pts = struct.unpack(f'<{npoints * 2}d', rec[44 + 4 * nparts:44 + 4 * nparts + 16 * npoints])
        yield [[(pts[2 * i], pts[2 * i + 1]) for i in range(parts[k], parts[k + 1])] for k in range(nparts)]


def mask(path):
    """Máscara del .shp con relleno par-impar, para que los huecos (islas, montes) queden fuera."""
    m = Image.new('1', (W, H), 0)
    for shape in rings(path):
        for ring in shape:
            xy = [((lon + 180) / 360 * W, (90 - lat) / 180 * H) for lon, lat in ring]
            x0 = max(0, int(min(x for x, _ in xy)) - 1)
            y0 = max(0, int(min(y for _, y in xy)) - 1)
            x1 = min(W, int(max(x for x, _ in xy)) + 2)
            y1 = min(H, int(max(y for _, y in xy)) + 2)
            if x1 <= x0 or y1 <= y0 or len(xy) < 3:
                continue
            tile = Image.new('1', (x1 - x0, y1 - y0), 0)
            ImageDraw.Draw(tile).polygon([(x - x0, y - y0) for x, y in xy], fill=1)
            box = (x0, y0, x1, y1)
            m.paste(ImageChops.logical_xor(m.crop(box), tile), box)
    return m


def main(folder):
    # De menos a más hondo: L_0, K_200, J_1000 … A_10000.
    files = sorted(glob.glob(os.path.join(folder, 'ne_10m_bathymetry_*.shp')), reverse=True)
    assert len(files) == 12, f'esperaba 12 capas, hay {len(files)}'
    img = Image.new('L', (W, H), 0)
    for level, path in enumerate(files, start=1):
        img.paste(level * 21, mask=mask(path))
        print(level, os.path.basename(path))
    img.filter(ImageFilter.GaussianBlur(1)).save(OUT, quality=85, method=6)
    print(OUT, os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    main(sys.argv[1])
