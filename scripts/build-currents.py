"""Genera public/data/currents.png: la velocidad media de las corrientes oceánicas de superficie.

Fuente: OSCAR (Ocean Surface Current Analyses Real-time, Earth & Space Research), velocidad a 15 m
de profundidad calculada con datos de satélite, rejilla de 1/3°. Se lee del servidor ERDDAP de NOAA
CoastWatch (conjunto `jplOscar`), que permite usar y redistribuir los datos libremente. Ese servidor
solo guarda de diciembre de 2011 a septiembre de 2014: lo que sale es la media de ese periodo, no
una climatología larga.

Se ejecuta a mano, solo si se quiere regenerar la imagen (que sí va en el repositorio):
  python scripts/build-currents.py <carpeta de trabajo>
Descarga unos 80 MB a la carpeta (un fichero por fecha; si ya están, no los vuelve a pedir).

Se toma una fecha de cada tres (39 de 117) y un punto de cada dos (rejilla de 2/3°) y se promedia.
La imagen va en longitud/latitud, de 180° O a 180° E y de 90° N a 90° S:
  rojo  = velocidad hacia el este,  de −1 a 1 m/s  (128 = quieto)
  verde = velocidad hacia el norte, de −1 a 1 m/s
  azul  = 255 donde hay dato, 0 en tierra y cerca de los polos
"""
import os
import sys
import time
import urllib.request

import numpy as np
from PIL import Image
from scipy.io import netcdf_file

BASE = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/jplOscar.nc'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'currents.png')
TIMES = range(0, 117, 3)
# latitud: 481 valores de 80 a −80; longitud: de 20 a 380 (una vuelta), de dos en dos
GRID = '[(15.0)][0:2:480][0:2:1078]'


def main(folder):
    os.makedirs(folder, exist_ok=True)
    total_u = total_v = count = None
    for t in TIMES:
        path = os.path.join(folder, f'oscar-{t:03d}.nc')
        if not os.path.exists(path):
            for attempt in range(6):
                try:
                    urllib.request.urlretrieve(f'{BASE}?u[{t}]{GRID},v[{t}]{GRID}', path + '.part')
                    os.replace(path + '.part', path)
                    break
                except OSError as error:  # el servidor devuelve 503 cuando está ocupado
                    print(t, error, '· reintento')
                    time.sleep(20 * (attempt + 1))
            else:
                raise SystemExit(f'no se pudo descargar la fecha {t}')
        with netcdf_file(path, mmap=False) as nc:
            u = np.array(nc.variables['u'][0, 0], dtype=np.float64)
            v = np.array(nc.variables['v'][0, 0], dtype=np.float64)
            lat = np.array(nc.variables['latitude'][:])
            lon = np.array(nc.variables['longitude'][:])
        ok = np.isfinite(u) & np.isfinite(v)
        if total_u is None:
            total_u, total_v, count = np.zeros(u.shape), np.zeros(u.shape), np.zeros(u.shape)
        total_u[ok] += u[ok]
        total_v[ok] += v[ok]
        count += ok
        print(t, int(ok.sum()), 'puntos con dato')

    # con dato en al menos la mitad de las fechas
    valid = count >= len(TIMES) / 2
    mean_u = np.where(valid, total_u / np.maximum(count, 1), 0)
    mean_v = np.where(valid, total_v / np.maximum(count, 1), 0)

    # de 20°…380° a −180°…180°
    order = np.argsort(((lon + 180) % 360) - 180)
    mean_u, mean_v, valid = mean_u[:, order], mean_v[:, order], valid[:, order]

    step = abs(lat[1] - lat[0])
    rows = int(round(180 / step))
    top = int(round((90 - lat.max()) / step))
    image = np.zeros((rows, mean_u.shape[1], 3), dtype=np.uint8)
    image[..., 0] = image[..., 1] = 128
    band = slice(top, top + mean_u.shape[0])
    image[band, :, 0] = np.clip(np.round(128 + mean_u * 127), 0, 255)
    image[band, :, 1] = np.clip(np.round(128 + mean_v * 127), 0, 255)
    image[band, :, 2] = valid * 255
    Image.fromarray(image).save(OUT, optimize=True)
    speed = np.hypot(mean_u, mean_v)[valid]
    print(OUT, image.shape, os.path.getsize(OUT), 'bytes · velocidad media', round(float(speed.mean()), 3), 'm/s, máxima', round(float(speed.max()), 2))


if __name__ == '__main__':
    main(sys.argv[1])
