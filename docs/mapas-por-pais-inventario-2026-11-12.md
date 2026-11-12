# Mapas por país: inventario de datos (12-nov-2026)

Qué trae la capa de subdivisiones de Natural Earth (`ne_10m_admin_1_states_provinces`, 1:10m,
dominio público) para Estados Unidos y cada país de Europa, y qué se puede hacer con ello. Es la
lista de trabajo para ir añadiendo países; cómo se añade uno está en el README («Añadir otro país»).

**Hecho:** España (provincias) y Estados Unidos (estados, con las regiones del censo).

## Cómo leer la tabla

- **NE**: unidades que trae Natural Earth y de qué tipo (campo `type_en`), contadas con un script
  sobre la capa descargada el 12-nov-2026. Es un dato medido.
- **Nivel propuesto**: lo que se estudia en el colegio. **Es de memoria y hay que comprobarlo contra
  una fuente oficial (ISO 3166-2 o el instituto de estadística del país) al añadir cada país**, igual
  que el número de unidades vigente.
- **Veredicto**:
  - *directo*: las unidades de NE son las que se estudian; basta escribir el fichero de datos.
  - *fundir*: NE trae un nivel más fino con el superior en el campo `region` (o repite código ISO):
    hay que fundir polígonos en `build-subdivisions.mjs`, que hoy no lo hace.
  - *desfasado*: NE no recoge una reforma territorial; hace falta otra fuente de fronteras.
  - *no apto*: NE trae municipios o una mezcla de niveles; hace falta otra fuente.
  - *decisión*: depende de una decisión que no es técnica.

## Inventario

| País | NE: unidades y tipo | Nivel propuesto | Veredicto |
|---|---|---|---|
| Estados Unidos | 51: 50 estados + distrito federal; 4 regiones | estados | **hecho** |
| España | 52: 50 provincias + 2 ciudades; 19 regiones | provincias | **hecho** |
| Alemania | 16 estados | estados federados | directo |
| Austria | 9 estados | estados federados | directo |
| Suiza | 26 cantones | cantones | directo |
| Países Bajos | 12 provincias + 3 municipios especiales (Caribe) | provincias | directo (sin los 3 del Caribe) |
| Bélgica | 10 provincias + Bruselas; 3 regiones | provincias, agrupadas en regiones | directo |
| Polonia | 16 voivodatos | voivodatos | directo |
| Chequia | 14 regiones | regiones | directo |
| Eslovaquia | 8 regiones | regiones | directo |
| Dinamarca | 5 regiones | regiones | directo |
| Suecia | 21 condados | condados | directo |
| Portugal | 18 distritos + 2 regiones autónomas | distritos | directo |
| Grecia | 13 regiones + Monte Athos | regiones | directo (Athos como decorado) |
| Rumanía | 41 condados + Bucarest | condados | directo |
| Bulgaria | 28 provincias | provincias | directo |
| Lituania | 10 condados | condados | directo |
| Estonia | 14 condados + 1 «municipio» (15 códigos) | condados | directo, revisar la unidad suelta |
| Turquía | 81 provincias | provincias | directo (son muchas: pide zonas) |
| Albania | 12 condados | condados | directo |
| Bielorrusia | 6 regiones + Minsk | regiones | directo |
| Croacia | 20 condados + Zagreb (20 códigos distintos) | condados | directo, revisar el código repetido |
| Islandia | 8 regiones + 1 «ciudad independiente» | regiones | directo, revisar la unidad suelta |
| Chipre | 5 distritos | distritos | revisar: falta un distrito (el norte va aparte en NE) |
| Francia | 101 departamentos; 18 regiones en `region` | regiones (13 + ultramar) | fundir |
| Italia | 110 provincias; 20 regiones en `region` | regiones | fundir |
| Irlanda | 34 unidades, 26 códigos ISO | condados | fundir por código |
| Reino Unido | 232 unidades de una docena de tipos | las 4 naciones | fundir (por `geonunit`) |
| Hungría | 19 condados + 23 «condados urbanos» + Budapest | condados | fundir las ciudades en su condado |
| Finlandia | 18 unidades (14 «provincias» + 4 «regiones») | regiones | revisar: no cuadra con las regiones vigentes |
| Serbia | 24 distritos + Belgrado | distritos | decisión (Kosovo va aparte en NE) |
| Noruega | 19 condados + 2 | condados | desfasado (reformas de 2020 y 2024) |
| Letonia | 110 municipios + 9 ciudades | — | no apto / desfasado |
| Eslovenia | 193 unidades (municipios) | regiones estadísticas en `region` (12) | fundir, y no es un nivel que se estudie |
| Macedonia del Norte | 84 unidades | — | no apto |
| Malta | 68 consejos locales | — | no apto (y demasiado pequeño) |
| Montenegro | 21 municipios | — | no apto |
| Moldavia | 40 unidades de 4 tipos | — | no apto |
| Bosnia y Herzegovina | 18 unidades, 7 sin código | entidades | no apto |
| Kosovo | 30 distritos sin código ISO | — | decisión + no apto |
| Ucrania | 25 (Crimea y Sebastopol van con Rusia en NE) | óblasts | decisión |
| Rusia | 86 sujetos (incluye Crimea y Sebastopol) | sujetos federales | decisión |
| Andorra, Liechtenstein, Luxemburgo, Mónaco, San Marino, Vaticano | 7, 11, 3, 1, 9, 1 | — | no merece mapa propio |

## Lo que falta para seguir

1. **Fundir** (Francia, Italia, Irlanda, Reino Unido, Hungría): `build-subdivisions.mjs` tiene que
   poder reunir varias unidades de NE en una por un campo (`region`, código ISO o `geonunit`).
2. **Tipos de unidad nuevos** en `src/game/maps.ts`: hoy hay «provincia» y «estado». Cada tipo son
   unas veinte frases en nueve idiomas. Hacen falta, al menos: región, cantón, condado, voivodato,
   distrito y nación.
3. **Países sin agrupación** (Alemania, Austria…): el generador y la aplicación ya lo admiten (no se
   ofrece el reto de «región»), pero no se ha probado con ningún país real.
4. **Páginas estáticas**: Estados Unidos no tiene todavía (tres páginas en diez idiomas por país).
5. **Decisiones**: Ucrania y Rusia (Crimea), Serbia y Kosovo.
