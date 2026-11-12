# Mapas por país: inventario de datos (12-nov-2026)

Qué trae la capa de subdivisiones de Natural Earth (`ne_10m_admin_1_states_provinces`, 1:10m,
dominio público) para Estados Unidos y cada país de Europa, y qué se puede hacer con ello. Es la
lista de trabajo para ir añadiendo países; cómo se añade uno está en el README («Añadir otro país»).

**Hecho (30):** España (provincias), Estados Unidos (estados, con las regiones del censo), Alemania
y Austria (estados federados), Suiza (cantones), Países Bajos y Bélgica (provincias), Francia,
Italia, Chequia, Eslovaquia, Grecia, Bielorrusia, Ucrania y Finlandia (regiones), Suecia, Irlanda, Lituania, Croacia, Albania,
Hungría, Noruega y Estonia (condados), Reino Unido (naciones), Polonia (voivodatos), Portugal (distritos, con las
Azores y Madeira), Rumanía y Serbia (distritos) y Turquía y Bulgaria (provincias).

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
| Polonia | 16 voivodatos (con los códigos ISO anteriores a 2018) | voivodatos | **hecho** |
| Chequia | 14 regiones (con los códigos ISO anteriores a 2016) | regiones | **hecho** |
| Eslovaquia | 8 regiones | regiones | **hecho** |
| Dinamarca | 5 regiones | regiones | **esperar**: NE y Wikidata coinciden hoy, pero el 1-ene-2027 la Región Capital y Selandia se funden en «Østdanmark» y quedan cuatro (ley de 20-jun-2025). Hacerlo ya con cuatro, fundiendo DK-84 y DK-85, cuando entre en vigor |
| Suecia | 21 condados | condados | **hecho** |
| Portugal | 18 distritos + 2 regiones autónomas | distritos | **hecho** (nombres a mano: Wikidata los tiene a medias) |
| Grecia | 13 regiones + Monte Athos (el Ática, con un código que no es el suyo) | regiones | **hecho** (Athos como decorado) |
| Rumanía | 41 distritos + Bucarest | distritos | **hecho** |
| Bulgaria | 28 provincias | provincias | **hecho** (las 28 y sus códigos coinciden con Wikidata; la ciudad y la provincia de Sofía, distinguidas en cada idioma; transliteración oficial búlgara) |
| Lituania | 10 condados | condados | **hecho** |
| Estonia | 15 condados | condados | **desfasado, comprobado**: la reforma de 2017 pasó Lihula, Hanila, Koonga y Varbla al municipio de Lääneranna (condado de Pärnu) y NE sigue poniendo Lihula en Lääne; además lleva los códigos ISO antiguos (EE-67 por EE-68…). **Hecho con otra fuente**: la división administrativa oficial (EHAK) de la Junta de Tierras estonia, con datos del 1-nov-2026, que ya viene sin el mar; se descarga en GeoJSON del servicio WFS de la Agencia de Medio Ambiente de Estonia, que la redistribuye |
| Turquía | 81 provincias | provincias | **hecho**, sin zonas: sus siete regiones geográficas no vienen en NE y repartirlas a mano sin fuente no es de fiar |
| Albania | 12 condados | condados | **hecho** |
| Bielorrusia | 6 regiones + Minsk | regiones | **hecho** (coincide con Wikidata; NE trae cambiado el tipo de la ciudad y de la región de Minsk, pero los códigos están bien) |
| Croacia | 20 condados + Zagreb (20 códigos distintos) | condados | **hecho** (NE daba a Požega-Eslavonia el código de su vecina: corregido) |
| Islandia | 8 regiones + 1 «ciudad independiente» | regiones | **desfasado, comprobado**: Hornafjörður pasó de Austurland a Suðurland (en la clasificación de Statistics Iceland, desde el 1-dic-2020) y NE lo deja en Austurland. Además las regiones no tienen capital oficial (son agrupaciones estadísticas): si se hace, con otra fuente y sin reto de capitales |
| Chipre | 5 distritos | distritos | **no apto con NE**: los distritos de derecho son seis (falta Kyrenia) y el norte viene como un solo bloque. El mapa del mundo trata la isla como un solo país, así que tocarían los seis: hace falta otra fuente (geoBoundaries los trae, pero de OpenStreetMap, con licencia ODbL) |
| Francia | 101 departamentos; 18 regiones en `region` | las 13 regiones metropolitanas | **hecho** (fundiendo; sin ultramar) |
| Italia | 110 provincias; 20 regiones en `region` | regiones | **hecho** (fundiendo) |
| Irlanda | 34 unidades, 26 códigos ISO | los 26 condados tradicionales | **hecho** (fundiendo por código) |
| Reino Unido | 232 unidades de una docena de tipos | las 4 naciones | **hecho** (fundiendo por `geonunit`) |
| Hungría | 19 condados + 23 «condados urbanos» + Budapest | condados | **hecho** (cada ciudad, fundida con su condado) |
| Finlandia | 18 regiones (Åland va aparte en NE, como `ALD` y por municipios) | regiones | **hecho con otra fuente**: el 1-ene-2021 cambiaron de región Heinävesi, Joroinen, Iitti, Kuhmoinen e Isokyrö, y NE los deja en la antigua. Las 19 regiones salen de Statistics Finland (capa de 2026, 1:1 000 000, CC BY 4.0); los vecinos, de NE |
| Serbia | 24 distritos + Belgrado | distritos | **hecho** (Kosovo va aparte, como en el mapa del mundo) |
| Noruega | 19 condados + 2 | condados | **hecho con otra fuente**: NE trae los condados anteriores a 2018 y desde el 1-ene-2024 son 15. Salen de Kartverket («Administrative enheter fylker», edición de julio de 2026, CC BY 4.0), recortados por la costa de NE porque la capa llega hasta el límite del mar territorial |
| Letonia | 110 municipios + 9 ciudades | — | no apto / desfasado: desde 2021 son municipios y ciudades estatales (43; 42 desde el 1-jul-2025, al unirse Varakļāni a Madona, según Wikipedia: falta fuente oficial) |
| Eslovenia | 193 unidades (municipios) | regiones estadísticas en `region` (12) | fundir, y no es un nivel que se estudie |
| Macedonia del Norte | 84 unidades | — | no apto |
| Malta | 68 consejos locales | — | no apto (y demasiado pequeño) |
| Montenegro | 21 municipios | — | no apto |
| Moldavia | 40 unidades de 4 tipos | — | no apto |
| Bosnia y Herzegovina | 18 unidades, 7 sin código | entidades | no apto |
| Kosovo | 30 distritos sin código ISO | — | no apto |
| Ucrania | 25 (Crimea y Sebastopol van con Rusia en NE) | óblasts | **hecho**, con las fronteras reconocidas (resolución 68/262 de la Asamblea General de la ONU): 24 regiones, Crimea, Kiev y Sebastopol, como ya hacía el mapa del mundo |
| Rusia | 86 sujetos (incluye Crimea y Sebastopol) | sujetos federales | **no se hace**: la propia lista está en disputa (Rusia cuenta como suyos Crimea, Sebastopol y cuatro regiones ucranianas), contradiría el mapa de Ucrania, y son más de ochenta piezas a ambos lados del antimeridiano |
| Andorra, Liechtenstein, Luxemburgo, Mónaco, San Marino, Vaticano | 7, 11, 3, 1, 9, 1 | — | no merece mapa propio |

## Lo que falta para seguir

1. **Fundir**: hecho (`fundir` en el fichero del mapa: el campo de NE que dice a qué unidad pertenece
   cada pieza). En Hungría, `renombrar` da antes a cada ciudad el código de su condado.
   Irlanda se funde por código ISO. Dos de sus capitales no son inequívocas y se acepta la segunda
   al escribir: Tipperary (Clonmel y Nenagh) y Waterford (Waterford y Dungarvan).
2. **Tipos de unidad nuevos** en `src/game/maps.ts`: hoy hay «provincia», «estado», «estado
   federado», «cantón», «región», «condado», «nación», «voivodato» y «distrito». Cada tipo son unas
   veinte frases en nueve idiomas. Un mismo «condado» no se llama igual en cada país en todos los
   idiomas (el de Suecia es «Provinz» en alemán; el de Irlanda, «Grafschaft»; el de Croacia,
   «Gespanschaft»): el país lleva un `context` y solo el idioma que difiere añade sus claves
   «texto|contexto». Hoy lo usan Suecia, Rumanía, Lituania, Croacia y Albania, en alemán, francés,
   italiano, inglés y chino.
3. **Páginas estáticas**: todos las tienen. Las de España están escritas a mano; las demás salen de
   plantillas por idioma (`scripts/data/mapas/plantillas.mjs`), dos por país y una tercera si sus
   unidades se agrupan. Un país nuevo solo necesita su nombre con preposición en cada idioma.
4. **Wikidata se revisa siempre a ojo**: en chino, la ficha de un condado irlandés (Roscommon)
   llevaba el nombre de una batalla. Va corregido a mano.
5. **Capitales**: las de los tres países nuevos coinciden con la capital (P36) de Wikidata, salvo
   Berlín, Hamburgo y Viena (ciudades-estado, sin capital en Wikidata) y Bregenz (sin nombre en
   español allí), que van por elaboración propia.
6. **Decisiones** (12-nov-2026): Ucrania se hace con Crimea y Rusia no se hace (ver la tabla).
   Kosovo no es una decisión pendiente: el mapa del mundo ya lo trata como país. El generador de
   fronteras cuenta Crimea y Sebastopol como Ucrania en todos los mapas: antes, donde Ucrania era
   vecina (Rumanía, Eslovaquia, Hungría, Polonia), Crimea salía como mar.
7. **Lo que queda de Europa** (decidido el 12-nov-2026). Para saber si NE recoge una reforma basta
   mirar en qué unidad cae un municipio que cambió de sitio: así se comprobaron Finlandia, Estonia
   e Islandia (fuentes: Statistics Finland, clasificación de regiones de 2021; informe de Estonia
   a UNGEGN de 2019; ley danesa 699/2025; nota de Statistics Iceland de 18-nov-2020).
   - **No hay una fuente única que sirva.** geoBoundaries (consultados sus metadatos) arrastra los
     mismos desfases: Finlandia de 2017, Estonia de 2016, Noruega de 2022 (11 condados), Islandia
     de 2017, Montenegro con 23 municipios; y lo que toma de OpenStreetMap lleva licencia ODbL.
   - **Con la fuente oficial de cada país**, uno a uno. Finlandia ya está (Statistics Finland,
     unidades estadísticas por municipios: trae las 19 regiones del año, CC BY 4.0): el generador
     acepta una capa propia como tercer argumento y la frontera con los vecinos de NE casa a
     simple vista con el máximo acercamiento. Noruega también está (Kartverket, CC BY 4.0,
     recortada por la costa de NE con `polyclip-ts`) y Estonia (Junta de Tierras, licencia propia
     de datos abiertos: citar organismo, datos y fecha). Queda, desde el 1-ene-2027, Dinamarca
     con sus cuatro regiones. Hay que descargar su capa, cosa que se pregunta antes.
   - **Pendientes de fuente o de comprobar**: Chipre (seis distritos de derecho), Islandia (sin
     capitales), Letonia (42 unidades, por confirmar), Moldavia (geoBoundaries trae 37 unidades de
     ACNUR/OCHA, de 2020, CC BY 3.0 IGO: por contrastar con la lista oficial) y Montenegro.
   - **No se hacen**: Eslovenia y Macedonia del Norte (entre el Estado y los municipios solo hay
     regiones estadísticas, que no son un nivel administrativo), Malta (68 consejos locales en una
     isla que no se distingue a la escala del mapa), Bosnia y Herzegovina (dos entidades y un
     distrito: un mapa de tres piezas; los cantones solo existen en una de las entidades), Rusia
     y los microestados.
   - **Turquía sigue sin zonas**: sus siete regiones geográficas no son administrativas y hay
     provincias a caballo entre dos.
