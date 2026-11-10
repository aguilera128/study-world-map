"""Genera public/data/fisico.json: los accidentes geográficos que se rotulan y se preguntan.

Fuente: Natural Earth 1:10m (dominio público): geography_regions_polys, geography_marine_polys,
geography_regions_elevation_points, rivers_lake_centerlines y lakes. De ahí salen la posición, la
altitud, el trazado de los ríos y los nombres en español, inglés, francés, alemán, italiano,
portugués y chino. Los nombres en catalán, gallego y euskera vienen de Wikidata por el identificador
que trae cada elemento (scripts/data/fisico.wikidata.json; se rellena con --wikidata).

Se ejecuta a mano, solo si se quiere regenerar el fichero (que sí va en el repositorio):
  1. descargar y descomprimir en una carpeta los seis zip de
     https://naciscdn.org/naturalearth/10m/physical/ne_10m_<nombre>.zip
     (los cinco de abajo y rivers_europe)
  2. python scripts/build-physical.py <carpeta> [--wikidata]

Lo único que se decide aquí es qué entra: para rotular, los elementos más importantes de cada clase
según el `scalerank` de Natural Earth (ver CLASES); para el reto de geografía física (`quiz`), los
de scripts/data/fisico-temario.json.
"""
import json
import os
import re
import struct
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'public', 'data', 'fisico.json')
WIKIDATA = os.path.join(HERE, 'data', 'fisico.wikidata.json')
LANGS = ['es', 'en', 'fr', 'de', 'it', 'pt', 'zh']
LANGS_WIKIDATA = ['ca', 'gl', 'eu']

# clase de Natural Earth → (clase nuestra, scalerank máximo que se rotula; −1 = solo si está en el temario)
CLASES = {
    'Range/mtn': ('cordillera', 3),
    'Desert': ('desierto', 3),
    'Plateau': ('meseta', 2),
    'Plain': ('llanura', 2),
    'Lowland': ('llanura', -1),
    'Basin': ('llanura', -1),
    'Geoarea': ('llanura', -1),
    'Pen/cape': ('peninsula', 3),
    'Peninsula': ('peninsula', 3),
    'cape': ('peninsula', -1),
    'Island': ('isla', 2),
    'Island group': ('isla', 1),
    'island': ('isla', -1),
    'ocean': ('oceano', 0),
    'sea': ('mar', 2),
    'gulf': ('golfo', 2),
    'bay': ('golfo', 2),
    'strait': ('estrecho', 4),
    'channel': ('estrecho', 4),
    'mountain': ('pico', 4),
    'Lake': ('lago', 1),
    'Alkaline Lake': ('lago', 1),
}
RIOS_RANK = 4
# Nombres en español de la fuente que no son los que se usan en clase.
NOMBRES_ES = {
    'Cordillera de Los Andes': 'Andes',
    'Mediterráneo': 'Mar Mediterráneo',
    'Jaya': 'Puncak Jaya',
    'Citlaltépetl': 'Pico de Orizaba',
    'Cocibolca': 'Lago de Nicaragua',
    'Lemán': 'Lago Lemán',
    'Bravo': 'Río Bravo',
    'Alpes escandinavos': 'Montes Escandinavos',
    'Arabia': 'Península arábiga',
    'Escandinavia': 'Península escandinava',
    'Florida': 'Península de Florida',
}
# Brazos de delta y tramos con nombre local que Natural Earth separa del río principal.
RIOS_FUERA = re.compile(r'Protoka|Branch|Bratul|Delta|Canal|Borcea')
# Lo que entra en el reto de geografía física (selección editorial, ver el propio fichero).
TEMARIO = os.path.join(HERE, 'data', 'fisico-temario.json')
EXTRA = os.path.join(HERE, 'data', 'fisico-extra.json')


def dbf(path):
    d = open(path, 'rb').read()
    n, hl, rl = struct.unpack('<IHH', d[4:12])
    fields, i = [], 32
    while d[i] != 0x0D:
        fields.append((d[i:i + 11].split(b'\0')[0].decode().lower(), d[i + 16]))
        i += 32
    for r in range(n):
        rec, o, row = d[hl + r * rl:hl + (r + 1) * rl], 1, {}
        for name, ln in fields:
            row[name] = rec[o:o + ln].decode('utf8', 'replace').replace('\0', '').strip()
            o += ln
        yield row


def shp(path):
    """Una lista de partes por registro; cada parte, una lista de (lon, lat)."""
    data, pos = open(path, 'rb').read(), 100
    while pos < len(data):
        (length,) = struct.unpack('>i', data[pos + 4:pos + 8])
        rec = data[pos + 8:pos + 8 + length * 2]
        pos += 8 + length * 2
        kind = struct.unpack('<i', rec[:4])[0]
        if kind in (1, 11, 21):
            yield [[struct.unpack('<2d', rec[4:20])]]
        elif kind in (3, 5, 13, 15, 23, 25):
            nparts, npoints = struct.unpack('<2i', rec[36:44])
            parts = list(struct.unpack(f'<{nparts}i', rec[44:44 + 4 * nparts])) + [npoints]
            base = 44 + 4 * nparts
            pts = struct.unpack(f'<{npoints * 2}d', rec[base:base + 16 * npoints])
            yield [[(pts[2 * i], pts[2 * i + 1]) for i in range(parts[k], parts[k + 1])] for k in range(nparts)]
        else:
            yield []


def layer(folder, name):
    return zip(dbf(os.path.join(folder, name + '.dbf')), shp(os.path.join(folder, name + '.shp')))


def centroid(ring):
    """Centro de gravedad del anillo y su área (en grados²)."""
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:] + ring[:1]):
        f = x0 * y1 - x1 * y0
        a += f
        cx += (x0 + x1) * f
        cy += (y0 + y1) * f
    if abs(a) < 1e-12:
        return ring[0], 0.0
    return (cx / (3 * a), cy / (3 * a)), abs(a) / 2


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
    """Trazado en milésimas de grado: el primer punto y, después, la diferencia con el anterior."""
    out, px, py = [], 0, 0
    for lon, lat in line:
        x, y = round(lon * 1000), round(lat * 1000)
        if out and x == px and y == py:
            continue
        out += [x - px, y - py]
        px, py = x, y
    return out


def slug(text):
    text = unicodedata.normalize('NFD', text.lower())
    return re.sub(r'[^a-z0-9]+', '-', ''.join(c for c in text if unicodedata.category(c) != 'Mn')).strip('-')


def names(row):
    base = row.get('name_en') or row.get('name') or ''
    out = {}
    for lang in LANGS:
        text = (row.get('name_' + lang) or (base if lang in ('es', 'en') else '')).rstrip('.').strip()
        if text:
            out[lang] = text[0].upper() + text[1:]
    if out.get('es') in NOMBRES_ES:
        out['es'] = NOMBRES_ES[out['es']]
    # Natural Earth escribe algunos nombres en mayúsculas (ANDES, HIMALAYAS)
    for lang, text in out.items():
        if text.isupper() and len(text) > 3:
            out[lang] = text.title()
    return out


def build(folder):
    features = []

    def add(kind, rank, top, at, row, **extra):
        nm = names(row)
        if not nm.get('es'):
            return
        raw = {(row.get('name_en') or '').lower(), (row.get('name') or '').lower()} - {''}
        features.append({'kind': kind, 'rank': rank, 'at': [round(at[0], 2), round(at[1], 2)], 'names': nm, 'wd': row.get('wikidataid') or None, '_top': top, '_raw': raw, **extra})

    for name in ('ne_10m_geography_regions_polys', 'ne_10m_geography_marine_polys', 'ne_10m_lakes'):
        for row, parts in layer(folder, name):
            kind, top = CLASES.get(row['featurecla'], (None, -1))
            if kind is None or not parts:
                continue
            at, _ = max((centroid(p) for p in parts), key=lambda c: c[1])
            add(kind, int(row['scalerank']), top, at, row)

    for name in ('ne_10m_geography_regions_elevation_points', 'ne_10m_geography_regions_points'):
        for row, parts in layer(folder, name):
            kind, top = CLASES.get(row['featurecla'], (None, -1))
            if kind and row['name']:
                extra = {'elev': round(float(row['elevation']))} if row.get('elevation') else {}
                add(kind, int(row['scalerank']), top, parts[0][0], row, **extra)

    # Ríos: Natural Earth los trae por tramos (también los que cruzan un lago); se juntan los de un
    # mismo río (mismo identificador de Wikidata o, si no lo trae, mismo nombre).
    rivers = {}
    # El fichero de Europa trae ríos que el general no tiene (Júcar, Segura…); como su `scalerank`
    # es bajo, solo entran los que están en el temario.
    tramos = list(layer(folder, 'ne_10m_rivers_lake_centerlines')) + list(layer(folder, 'ne_10m_rivers_europe'))
    for row, parts in tramos:
        if not row['name'] or RIOS_FUERA.search(row['name']):
            continue
        river = rivers.setdefault(row.get('wikidataid') or row['name'], {'row': row, 'rank': 99, 'parts': [], 'river': False})
        river['rank'] = min(river['rank'], int(row['scalerank']))
        river['river'] |= row['featurecla'].startswith('River')
        river['parts'] += parts
    for river in rivers.values():
        if not river['river']:
            continue
        longest = max(river['parts'], key=len)
        lines = [deltas(simplify(part, 0.006)) for part in river['parts']]
        add('rio', river['rank'], RIOS_RANK, longest[len(longest) // 2], river['row'], lines=lines)

    # Temario: por cada nombre, el elemento de su clase que se llama exactamente así; si no hay, el
    # más importante de los que lo llevan en el nombre (primero los que empiezan por él).
    missing = []
    for kind, wanted in json.load(open(TEMARIO, encoding='utf8')).items():
        if kind == '_':
            continue
        own = [f for f in features if f['kind'] == kind]
        for name in wanted:
            key = name.lower()
            found = [f for f in own if key in f['_raw']]
            if kind == 'oceano':
                found = [f for f in own if any(key in raw for raw in f['_raw'])]
            elif not found:
                loose = [f for f in own if any(key in raw for raw in f['_raw'])]
                loose.sort(key=lambda f: (not any(raw.startswith(key) for raw in f['_raw']), f['rank']))
                found = loose[:1]
            if not found:
                missing.append(f'{kind}: {name}')
            for f in found:
                f['quiz'] = 1
    print('Del temario no están en los datos:', '; '.join(missing))

    # Lo que Natural Earth no trae y sí está en Wikidata (scripts/data/fisico-extra.json).
    for extra in json.load(open(EXTRA, encoding='utf8'))['features']:
        feature = {'kind': extra['kind'], 'rank': 2, 'at': extra['at'], 'names': dict(extra['names']), 'wd': None, 'quiz': 1, '_top': -1, '_raw': set()}
        if extra.get('elev'):
            feature['elev'] = extra['elev']
        features.append(feature)

    # Se queda lo que se rotula por importancia y todo lo del temario. Un mismo nombre no se repite
    # dentro de una clase (Natural Earth parte en dos el Atlántico y el Pacífico).
    kept, seen = [], set()
    for f in sorted(features, key=lambda f: (not f.get('quiz'), f['rank'])):
        top, raw = f.pop('_top'), f.pop('_raw')
        key = (f['kind'], f['names']['es'])
        if (f.get('quiz') or f['rank'] <= top) and key not in seen:
            seen.add(key)
            kept.append(f)

    # identificador estable y único
    seen = {}
    for f in kept:
        base = f['kind'] + '-' + slug(f['names'].get('en') or f['names']['es'])
        seen[base] = seen.get(base, 0) + 1
        f['id'] = base if seen[base] == 1 else f'{base}-{seen[base]}'
    return kept


def fetch_wikidata(ids):
    """Etiquetas en catalán, gallego y euskera de cada identificador."""
    out = {}
    for i in range(0, len(ids), 150):
        values = ' '.join('wd:' + q for q in ids[i:i + 150])
        langs = ', '.join(f'"{lang}"' for lang in LANGS_WIKIDATA)
        query = f'SELECT ?item ?label WHERE {{ VALUES ?item {{ {values} }} ?item rdfs:label ?label . FILTER(LANG(?label) IN ({langs})) }}'
        req = urllib.request.Request(
            'https://query.wikidata.org/sparql',
            data=urllib.parse.urlencode({'query': query, 'format': 'json'}).encode(),
            headers={'User-Agent': 'atlas-build-script/1.0'},
        )
        for attempt in range(6):
            try:
                reply = json.load(urllib.request.urlopen(req, timeout=120))
                break
            except urllib.error.HTTPError as error:  # 429: Wikidata pide ir más despacio
                if error.code != 429 or attempt == 5:
                    raise
                time.sleep(30 * (attempt + 1))
        time.sleep(2)
        for b in reply['results']['bindings']:
            out.setdefault(b['item']['value'].rsplit('/', 1)[1], {})[b['label']['xml:lang']] = b['label']['value']
    return out


def main():
    folder = sys.argv[1]
    features = build(folder)
    if '--wikidata' in sys.argv:
        labels = fetch_wikidata(sorted({f['wd'] for f in features if f['wd']}))
        json.dump(labels, open(WIKIDATA, 'w', encoding='utf8'), ensure_ascii=False, indent=0, sort_keys=True)
    labels = json.load(open(WIKIDATA, encoding='utf8')) if os.path.exists(WIKIDATA) else {}
    for f in features:
        for lang, text in labels.get(f.pop('wd') or '', {}).items():
            f['names'][lang] = text[0].upper() + text[1:]
    features.sort(key=lambda f: (f['rank'], f['id']))
    source = 'Natural Earth 1:10m (dominio público); nombres en ca, gl y eu de Wikidata (CC0)'
    json.dump({'source': source, 'features': features}, open(OUT, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    kinds = {}
    for f in features:
        kinds[f['kind']] = kinds.get(f['kind'], 0) + 1
    print(len(features), 'elementos', kinds, os.path.getsize(OUT), 'bytes ·', sum(1 for f in features if f.get('quiz')), 'en el reto')


if __name__ == '__main__':
    main()
