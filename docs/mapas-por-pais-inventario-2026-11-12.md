# Mapas por país: inventario de datos (12-nov-2026)

Qué trae la capa de subdivisiones de Natural Earth (`ne_10m_admin_1_states_provinces`, 1:10m,
dominio público) para Estados Unidos y cada país de Europa, y qué se puede hacer con ello. Es la
lista de trabajo para ir añadiendo países; cómo se añade uno está en el README («Añadir otro país»).

**Hecho (11):** España (provincias), Estados Unidos (estados, con las regiones del censo), Alemania
y Austria (estados federados), Suiza (cantones), Países Bajos y Bélgica (provincias), Chequia,
Eslovaquia y Grecia (regiones) y Suecia (condados).

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
| Alemania | 16 estados | estados federados | **hecho** |
| Austria | 9 estados | estados federados | **hecho** |
| Suiza | 26 cantones | cantones | **hecho** |
| Países Bajos | 12 provincias + 3 municipios especiales (Caribe) | provincias | **hecho** (sin los 3 del Caribe) |
| Bélgica | 10 provincias + Bruselas; 3 regiones | provincias, agrupadas en regiones | **hecho** |
| Polonia | 16 voivodatos | voivodatos | directo |
| Chequia | 14 regiones (con los códigos ISO anteriores a 2016) | regiones | **hecho** |
| Eslovaquia | 8 regiones | regiones | **hecho** |
| Dinamarca | 5 regiones | regiones | revisar: creo recordar una reforma que funde dos regiones en 2027; comprobarlo antes |
| Suecia | 21 condados | condados | **hecho** |
| Portugal | 18 distritos + 2 regiones autónomas | distritos | directo |
| Grecia | 13 regiones + Monte Athos (el Ática, con un código que no es el suyo) | regiones | **hecho** (Athos como decorado) |
| Rumanía | 41 condados + Bucarest | condados | directo |
| Bulgaria | 28 provincias | provincias | directo, con cuidado: dos se llaman Sofía y la transliteración al español no es única |
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
| Serbia | 24 distritos + Belgrado | distritos | directo (Kosovo va aparte, como en el mapa del mundo) |
| Noruega | 19 condados + 2 | condados | desfasado (reformas de 2020 y 2024) |
| Letonia | 110 municipios + 9 ciudades | — | no apto / desfasado |
| Eslovenia | 193 unidades (municipios) | regiones estadísticas en `region` (12) | fundir, y no es un nivel que se estudie |
| Macedonia del Norte | 84 unidades | — | no apto |
| Malta | 68 consejos locales | — | no apto (y demasiado pequeño) |
| Montenegro | 21 municipios | — | no apto |
| Moldavia | 40 unidades de 4 tipos | — | no apto |
| Bosnia y Herzegovina | 18 unidades, 7 sin código | entidades | no apto |
| Kosovo | 30 distritos sin código ISO | — | no apto |
| Ucrania | 25 (Crimea y Sebastopol van con Rusia en NE) | óblasts | decisión |
| Rusia | 86 sujetos (incluye Crimea y Sebastopol) | sujetos federales | decisión |
| Andorra, Liechtenstein, Luxemburgo, Mónaco, San Marino, Vaticano | 7, 11, 3, 1, 9, 1 | — | no merece mapa propio |

## Lo que falta para seguir

1. **Fundir** (Francia, Italia, Irlanda, Reino Unido, Hungría): `build-subdivisions.mjs` tiene que
   poder reunir varias unidades de NE en una por un campo (`region`, código ISO o `geonunit`).
2. **Tipos de unidad nuevos** en `src/game/maps.ts`: hoy hay «provincia», «estado», «estado
   federado», «cantón», «región» y «condado». Cada tipo son unas veinte frases en nueve idiomas.
   Hacen falta, al menos: voivodato, distrito y nación. Ojo: el tipo lo define la palabra española,
   y en otros idiomas un mismo «condado» no se llama igual en cada país (el de Suecia es «Provinz»
   en alemán; el de Irlanda sería «Grafschaft»): un país así pide su propio tipo.
3. **Páginas estáticas**: solo España las tiene (son tres páginas en diez idiomas por país).
4. **Capitales**: las de los tres países nuevos coinciden con la capital (P36) de Wikidata, salvo
   Berlín, Hamburgo y Viena (ciudades-estado, sin capital en Wikidata) y Bregenz (sin nombre en
   español allí), que van por elaboración propia.
5. **Decisiones**: Ucrania y Rusia (Crimea). Kosovo no es una decisión pendiente: el mapa del
   mundo ya lo trata como país.
6. **Turquía** (81 provincias): directa, pero pide zonas para que las partidas tengan sentido.
