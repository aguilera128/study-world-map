"""Genera public/data/tectonica.json: límites de las placas tectónicas, sus nombres y los volcanes.

Fuentes:
  · Límites de placas: modelo PB2002 de Peter Bird («An updated digital model of plate boundaries»,
    Geochemistry Geophysics Geosystems, 2003), en la conversión a GeoJSON de Hugo Ahlenius (Nordpil),
    https://github.com/fraxen/tectonicplates · licencia Open Data Commons Attribution (ODC-By 1.0).
  · Volcanes: base de datos de volcanes de NOAA NCEI (servicio «hazel», dominio público). Entran
    los que han tenido una erupción desde 1964 (código D1 de la base; comprobado con casos
    conocidos: Etna D1, Vesubio D2, Fuji D4). La base no está al día: no recoge, por ejemplo, la
    erupción del Cotopaxi de 2015.

Se ejecuta a mano, solo si se quiere regenerar el fichero (que sí va en el repositorio):
  1. descargar a una carpeta
       https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json
       https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/volcanolocs?itemsPerPage=200&page=N
       (páginas 1 a 9, como volc1.json … volc9.json)
  2. python scripts/build-tectonics.py <carpeta>

El formato es el de fisico.json (ver build-physical.py): elementos con clase, importancia, posición,
nombres y, los límites, su trazado en milésimas de grado y en diferencias. Lo único que no sale de
los datos es dónde se rotula cada placa (PLACAS): un punto elegido a mano dentro de ella, y su nombre
en español e inglés. Los nombres en los demás idiomas son de Wikidata (scripts/data/placas.wikidata.json).
"""
import glob
import json
import os
import sys

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'tectonica.json')
NOMBRES = os.path.join(os.path.dirname(__file__), 'data', 'placas.wikidata.json')

# Las placas principales: nombre en español, en inglés y punto donde se rotulan.
PLACAS = [
    ('Placa del Pacífico', 'Pacific Plate', -150, 5),
    ('Placa Norteamericana', 'North American Plate', -100, 50),
    ('Placa Sudamericana', 'South American Plate', -55, -15),
    ('Placa Africana', 'African Plate', 20, 5),
    ('Placa Euroasiática', 'Eurasian Plate', 80, 55),
    ('Placa Antártica', 'Antarctic Plate', 60, -75),
    ('Placa Australiana', 'Australian Plate', 135, -28),
    ('Placa India', 'Indian Plate', 78, 18),
    ('Placa Arábiga', 'Arabian Plate', 46, 23),
    ('Placa de Nazca', 'Nazca Plate', -90, -18),
    ('Placa del Caribe', 'Caribbean Plate', -72, 15),
    ('Placa de Cocos', 'Cocos Plate', -98, 9),
    ('Placa Filipina', 'Philippine Sea Plate', 135, 18),
    ('Placa de Scotia', 'Scotia Plate', -50, -58),
    ('Placa Somalí', 'Somali Plate', 48, -5),
    ('Placa de Juan de Fuca', 'Juan de Fuca Plate', -128, 46),
]


def simplify(line, tol):
    """Douglas-Peucker."""
    if len(line) < 3:
        return line
    (x0, y0), (x1, y1) = line[0], line[-1]
    dx, dy = x1 - x0, y1 - y0
    norm = (dx * dx + dy * dy) ** 0.5 or 1e-12
    best, where = 0.0, 0
    for i in range(1, len(line) - 1):
        d = abs(dy * (line[i][0] - x0) - dx * (line[i][1] - y0)) / norm
        if d > best:
            best, where = d, i
    if best <= tol:
        return [line[0], line[-1]]
    return simplify(line[:where + 1], tol)[:-1] + simplify(line[where:], tol)


def deltas(line):
    out, px, py = [], 0, 0
    for lon, lat in line:
        x, y = round(lon * 1000), round(lat * 1000)
        if out and x == px and y == py:
            continue
        out += [x - px, y - py]
        px, py = x, y
    return out


def main(folder):
    features = []
    boundaries = json.load(open(os.path.join(folder, 'boundaries.json'), encoding='utf8'))
    lines = []
    for f in boundaries['features']:
        geometry = f['geometry']
        parts = [geometry['coordinates']] if geometry['type'] == 'LineString' else geometry['coordinates']
        for part in parts:
            # un tramo que salta de un lado a otro del antimeridiano se corta ahí
            piece = [part[0]]
            for a, b in zip(part, part[1:]):
                if abs(b[0] - a[0]) > 180:
                    lines.append(piece)
                    piece = []
                piece.append(b)
            lines.append(piece)
    features.append({'id': 'limites', 'kind': 'limite', 'rank': 0, 'at': [0, 0], 'names': {}, 'lines': [deltas(simplify([tuple(p[:2]) for p in line], 0.02)) for line in lines if len(line) > 1]})
    translated = json.load(open(NOMBRES, encoding='utf8'))['names']
    for es, en, lon, lat in PLACAS:
        # el español y el inglés, los de aquí; los demás idiomas, de Wikidata
        names = {**translated.get(en, {}), 'es': es, 'en': en}
        features.append({'id': 'placa-' + en.lower().replace(' ', '-'), 'kind': 'placa', 'rank': 0, 'at': [lon, lat], 'names': names})

    volcanoes = []
    for path in sorted(glob.glob(os.path.join(folder, 'volc*.json'))):
        volcanoes += json.load(open(path, encoding='utf8'))['items']
    recent = [v for v in volcanoes if v.get('timeErupt') == 'D1' and v.get('latitude') is not None]
    # Los más altos primero: son los que se rotulan con el mapa alejado.
    recent.sort(key=lambda v: -(v.get('elevation') or 0))
    for i, v in enumerate(recent):
        rank = 1 if i < 25 else 2 if i < 80 else 3
        feature = {'id': f"volcan-{v['id']}", 'kind': 'volcan', 'rank': rank, 'at': [round(v['longitude'], 2), round(v['latitude'], 2)], 'names': {'en': v['name']}}
        if v.get('elevation'):
            feature['elev'] = v['elevation']
        features.append(feature)

    source = 'Límites de placas: Bird (2003), PB2002, vía Hugo Ahlenius/Nordpil (ODC-By 1.0). Volcanes: NOAA NCEI (dominio público).'
    json.dump({'source': source, 'features': features}, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print(len(lines), 'tramos de límite ·', len(PLACAS), 'placas ·', len(recent), 'volcanes ·', os.path.getsize(OUT), 'bytes')


if __name__ == '__main__':
    main(sys.argv[1])
