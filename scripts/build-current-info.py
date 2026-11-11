"""Añade a public/data/corrientes.json, para la ficha de cada corriente, su velocidad y hacia dónde va.

  speed  velocidad media en superficie, en m/s: la media, en un radio de 3° alrededor del punto del
         rótulo, del mismo campo de velocidades que dibuja la capa (public/data/currents.png, la
         media de OSCAR de diciembre de 2011 a septiembre de 2014: ver scripts/build-currents.py).
         Es una media de casi tres años y de toda la zona: mucho menos que las puntas que da el eje
         de una corriente un día concreto, pero sirve para compararlas entre sí (las del borde
         oeste de los océanos, estrechas y rápidas; las del borde este, anchas y lentas).
  dir    rumbo general, en octavos de vuelta desde el norte y en el sentido del reloj (0 = norte,
         1 = noreste, 2 = este … 7 = noroeste). NO sale del campo de velocidades: junto al rótulo
         de las corrientes lentas (Canarias, Benguela, Humboldt, Australia Occidental) y de la de
         Oyashio lo medido no coincide con el rumbo de la corriente entera. Es el que da el
         artículo de cada una en la Wikipedia en inglés (consultados el 11-11-2026), llevado al
         octavo más cercano; en 17 de las 22 coincide además con lo medido.

Se ejecuta a mano, después de cambiar las corrientes o de regenerar currents.png:
  python scripts/build-current-info.py
"""
import json
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(__file__)
FLOW = os.path.join(HERE, '..', 'public', 'data', 'currents.png')
OUT = os.path.join(HERE, '..', 'public', 'data', 'corrientes.json')
RADIUS = 3.0  # grados alrededor del rótulo
N, NE, E, SE, S, SW, W, NW = range(8)
# Rumbo general de cada corriente (por su identificador de Wikidata), según su artículo de Wikipedia.
DIRECTION = {
    'Q130905': NE,   # del Golfo: al norte por la costa de EE. UU. y luego al este
    'Q211798': NE,   # del Atlántico Norte
    'Q213197': SW,   # de las Islas Canarias
    'Q47954': S,     # del Labrador
    'Q677292': S,    # del Brasil
    'Q59676': N,     # de Benguela
    'Q398548': SW,   # de las Agujas: al sur, pegada a la costa sudeste de África
    'Q53842': NE,    # Kuroshio
    'Q58440': S,     # de Oyashio
    'Q281655': S,    # de California
    'Q143888': N,    # de Humboldt
    'Q143917': S,    # de Australia Oriental
    'Q924509': N,    # de Australia Occidental
    'Q55828': E,     # Circumpolar Antártica
    'Q867775': W,    # Ecuatorial del Norte
    'Q1072306': W,   # Ecuatorial del Sur
    'Q1902975': NW,  # de Alaska: al norte por la costa y luego al oeste
    'Q143920': N,    # de las Malvinas
    'Q143660': S,    # de Groenlandia Oriental
    'Q1126449': NE,  # noruega
    'Q1257727': E,   # de Guinea
    'Q58708': S,     # de Mozambique
}


def main() -> None:
    rgb = np.asarray(Image.open(FLOW).convert('RGB')).astype(np.float64)
    rows, cols = rgb.shape[:2]
    valid = rgb[..., 2] > 127
    east = (rgb[..., 0] - 128) / 127
    north = (rgb[..., 1] - 128) / 127
    speed = np.hypot(east, north) * valid
    lat = 90 - (np.arange(rows) + 0.5) * 180 / rows
    lon = -180 + (np.arange(cols) + 0.5) * 360 / cols

    data = json.load(open(OUT, encoding='utf8'))
    for feature in data['features']:
        at_lon, at_lat = feature['at']
        dlon = (lon[None, :] - at_lon + 180) % 360 - 180
        near = (np.hypot(dlon * np.cos(np.radians(at_lat)), lat[:, None] - at_lat) <= RADIUS) & valid
        if not near.any():
            raise SystemExit(f"{feature['names']['es']}: sin datos de corriente junto al rótulo")
        wd = feature['wd']
        if wd not in DIRECTION:
            raise SystemExit(f"{feature['names']['es']} ({wd}): falta su rumbo en DIRECTION")
        feature['speed'] = round(float(speed[near].mean()), 2)
        feature['dir'] = DIRECTION[wd]
        print(f"{feature['names']['es']:38s} {feature['speed']:.2f} m/s  rumbo {feature['dir']}")
    data['source'] = (
        'Nombres: Wikidata (CC0). Cálida o fría y punto del rótulo: elección editorial sobre el campo de velocidades de OSCAR. '
        'Velocidad: media de ese mismo campo (2011 a 2014) en 3° alrededor del rótulo. Rumbo general: artículo de cada corriente en la Wikipedia en inglés (scripts/build-current-info.py).'
    )
    with open(OUT, 'w', encoding='utf8', newline='\n') as out:
        json.dump(data, out, ensure_ascii=False, separators=(',', ':'))
        out.write('\n')


if __name__ == '__main__':
    main()
