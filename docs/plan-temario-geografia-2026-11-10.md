# Temario de geografía de primaria y ESO: qué cubrimos y qué falta

Plan del 10 de noviembre de 2026, a partir del temario que pasó Javier. Regla: solo datos reales con
fuente y licencia comprobadas. «Por comprobar» significa que no he abierto todavía la fuente.

## Ya está

| Tema | Dónde |
|---|---|
| Continentes, países, capitales, banderas | retos Localizar, Continentes, Nombrar, Capitales, Banderas |
| Climas (10 tipos escolares) | reto Climas y capa de clima |
| Comunidades y provincias de España | en curso, en otra sesión |
| Globo y mapa plano | botón Globo 3D / Mapa 2D |
| Retícula, hora local, día y noche | capas y tarjeta de tiempo real |
| Relieve submarino (plataforma, llanuras abisales, fosas, dorsales) | color del mar, batimetría de Natural Earth |

## Estado a 10-nov-2026 (final del día)

Hecho: relieve, capa «Montañas, ríos y mares», líneas imaginarias, corrientes oceánicas (movimiento
del agua, capa y 22 corrientes con nombre, cálidas y frías), mapa «Geografía física» con los retos
Localizar y Nombrar sobre 305 accidentes (selección en `scripts/data/fisico-temario.json` y
`fisico-extra.json`), reto de coordenadas, husos horarios, placas y volcanes, densidad de población
y la ventana «El planeta» (interior de la Tierra y capas de la atmósfera).

Fuentes y licencias de lo añadido al final:
- Placas: Bird (2003), PB2002, conversión de Hugo Ahlenius/Nordpil, ODC-By 1.0 (pide atribución).
- Volcanes: NOAA NCEI, dominio público. Entran los 289 con erupción desde 1964.
- Población: Banco Mundial, indicador SP.POP.TOTL, año 2025, CC BY 4.0 (pide atribución).
- Corrientes con nombre y accidentes extra: nombres y posiciones de Wikidata (CC0). Qué corriente es
  cálida o fría y dónde va su rótulo es una elección editorial, sin fuente citada.
- Interior y atmósfera: cifras de libro de texto, sin fuente citada; revisarlas con una oficial.

Revisión de datos (10-nov, última tanda):
- Atmósfera: cifras de NASA («Earth's Atmosphere: A Multi-layered Cake»): 12, 50, 80 y 700 km.
- Interior: contrastado con la Enciclopedia Británica y el USGS; el límite entre núcleos, 5100 km.
- Volcanes: el código D1 («erupción desde 1964») está comprobado con casos conocidos, pero la base de
  NOAA no está al día (no recoge el Cotopaxi de 2015).
- Corrientes cálidas y frías: coinciden con varias fuentes didácticas; ninguna es de NOAA.
- Júcar y Segura tienen ya trazado (Natural Earth, ríos de Europa). Entran Jutlandia, Labrador,
  Mojave, desierto de Arabia, golfos de Cádiz y de Valencia (Wikidata) y el Cotopaxi (NOAA).
- Población de Taiwán y del Vaticano, que el Banco Mundial no da: Wikidata.
- Placas con nombre en los diez idiomas (Wikidata).

Pendiente: mapas históricos, proyecciones, flujos migratorios y comerciales (aplazados, ver abajo),
y la revisión nativa de las traducciones. Del temario ya no falta nada por fuente: el Miño y la
meseta de Irán entran con su posición de Wikidata (del Miño, solo un punto).

## Fases

### 1. Mapa físico (Natural Earth, dominio público)

- Sombreado del relieve en tierra: `SR_50M.zip` (11,4 MB).
- Cordilleras, desiertos, mesetas, llanuras, penínsulas: `ne_10m_geography_regions_polys` (2,0 MB).
- Picos con altitud: `ne_10m_geography_regions_elevation_points` (240 KB).
- Cabos, estrechos y otros puntos: `ne_10m_geography_regions_points` (87 KB).
- Ríos: `ne_10m_rivers_lake_centerlines` (2,1 MB). Lagos: `ne_10m_lakes` (2,3 MB).
- Océanos, mares, golfos y estrechos: `ne_10m_geography_marine_polys` (0,9 MB).

Entrega: capa «Relieve», nombres al pasar el ratón y retos de localizar cordilleras, picos, ríos,
desiertos, mares y océanos. Los nombres en los diez idiomas, de Wikidata (como las capitales).

### 2. Líneas y coordenadas (sin datos: son matemáticas)

- Capa con ecuador, trópicos, círculos polares y meridiano de Greenwich, con su nombre.
- Reto de coordenadas: «¿qué hay en 40° N, 3° O?» y al revés.
- Husos horarios como capa. No se usa `ne_10m_time_zones`: está desfasado (aún da −4:30 a Venezuela,
  que cambió en 2016). La capa pinta cada país con su hora oficial de hoy, calculada en el navegador
  a partir de su zona horaria, y dibuja sobre el mar las franjas teóricas de 15°.

### 3. Tierra dinámica

- Corrientes oceánicas: el agua se mueve según OSCAR (velocidad superficial por satélite, servidor
  ERDDAP de NOAA, uso y redistribución libres; solo dic-2011 a sep-2014). La capa con nombres y
  cálida/fría necesita una lista hecha a mano con fuente citada: no hay capa pública con licencia clara.
- Placas tectónicas, volcanes y terremotos: fuentes por comprobar (modelo de placas de Bird 2003,
  Smithsonian GVP, USGS).

### 3 bis. El planeta por dentro y por fuera (pedido el 10-nov)

- Capas de la atmósfera (troposfera, estratosfera, mesosfera, termosfera, exosfera): envolturas
  alrededor del globo, con la altura exagerada y dicho así, y una ficha con las altitudes reales.
- Interior de la Tierra (corteza, manto, núcleo externo e interno): corte del globo con animación
  del núcleo y de la convección del manto. Es un esquema: los grosores salen de una fuente citada
  (por comprobar), pero el movimiento del magma es ilustrativo y hay que rotularlo como tal.

### 4. Mapas temáticos por país

Población, densidad, nivel de renta y organizaciones (UE, ONU, OTAN). Se pintan como el clima: un
color por país. Fuentes por comprobar (Banco Mundial; pertenencias desde Wikidata). Caducan: hay que
anotar la fecha del dato.

## Aplazado, con motivo

- Proyecciones Mercator y Peters: obliga a rehacer la transición globo↔plano del motor.
- Mapas históricos: no conozco una fuente mundial fiable y las fronteras históricas son discutibles.
- Flujos migratorios, recursos, zonas industriales y rutas comerciales: sin datos mundiales sencillos
  y fiables; además envejecen rápido.
- Biomas: fuente por comprobar (ecorregiones de WWF); hoy lo cubre en parte el clima.

## Cómo encaja en el código

- Hoy todo gira en torno a «país». Hace falta un segundo tipo de elemento, el accidente geográfico
  (punto, línea o polígono con nombre y clase), con su fichero `public/data/fisico.json` generado por
  un script, igual que el atlas.
- Las capas visuales se añaden a `LAYERS`; los retos nuevos reutilizan el juego actual cambiando el
  conjunto de elementos, como hace la sesión de provincias con los mapas.
- Orden de trabajo: mientras la sesión de provincias tenga a medias la tienda, la configuración del
  juego y los paneles, aquí solo se tocan datos, scripts y motor.
