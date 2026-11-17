# Study World Map

[English](README.md) · **Español**

Mapamundi interactivo para **estudiar los países del mundo jugando**: un globo 3D que se desenrolla
hasta convertirse en un mapa plano 2D, cinco retos con corrección inmediata y un sistema de repaso
que insiste en lo que todavía no te sabes.

Casi todo funciona en el navegador y no hay cuentas: el progreso se guarda en el propio dispositivo.
Solo si se crea un código para seguir en otro dispositivo, se guarda también en una base de datos
(una función de Vercel, `api/sync.ts`); otra guarda los rankings, una tercera sirve el tiempo de ahora
y una cuarta, las órbitas de los satélites.

En producción: <https://www.studyworldmap.com>. Código abierto bajo [AGPL-3.0](LICENSE).

Para tocar el proyecto: [AGENTS.md](AGENTS.md) (reglas y estructura) y [DESIGN.md](DESIGN.md) (diseño).

## Qué incluye

- **El tiempo de ahora.** Cuatro capas de meteorología, apagadas de entrada: temperatura, nubes y
  viento según el modelo GFS de la NOAA (un dato por grado, del paso de tres horas más cercano) y
  la lluvia y la nieve que ha medido la misión GPM de la NASA (cada media hora, con entre cinco
  y ocho horas de retraso). La leyenda dice de qué hora es cada dato. Los pide una función propia
  (`api/tiempo.ts`): el navegador no habla con ningún tercero.
- **Satélites.** Una capa, apagada de entrada, con los satélites en su posición de ahora alrededor del
  globo (estaciones espaciales, GPS y Galileo, meteorológicos y, si se enciende, Starlink), calculada
  en el navegador con SGP4 (`satellite.js`) a partir de los elementos orbitales de CelesTrak, que
  sirve `api/satelites.ts`.
- **Dos vistas del mismo mapa.** Globo 3D y mapa plano (proyección Natural Earth), con una
  transición animada entre ambos. Se arrastra, se hace zoom con la rueda o pellizcando, y los
  países se levantan al pasar el cursor.
- **Cinco retos**, cada uno con su propio progreso:
  | Reto | Qué se pregunta | Cómo se responde |
  | --- | --- | --- |
  | Localizar | Se da el nombre del país | Pulsándolo en el mapa |
  | Continentes | «¿En qué continente está…?» | Con opciones (solo con el nombre o viéndolo en el mapa) |
  | Nombrar | Se señala un país en el mapa | Con opciones o escribiendo |
  | Capitales | País ↔ capital | Con opciones, buscando el país en el mapa o escribiendo |
  | Banderas | Se enseña una bandera | Pulsando el país en el mapa o con opciones |
- **Reto de climas y mapa de climas.** Un sexto reto, «¿Qué clima tiene?», y una capa que colorea el
  mapa por clima, con su leyenda.
- **España por provincias.** Un segundo mapa, que se elige en la portada: las 50 provincias, Ceuta y
  Melilla, con retos de localizar, nombrar, capitales y «¿a qué comunidad autónoma pertenece?». Las
  zonas son agrupaciones de comunidades y su progreso se guarda aparte del de los países. Las listas
  de estudio y el reto del día son, de momento, solo del mapa del mundo.
- **Más países por dentro.** Estados Unidos (los 50 estados con sus capitales y las cuatro regiones
  del censo), Alemania y Austria (estados federados), Suiza (cantones), Países Bajos, Bélgica,
  Turquía y Bulgaria (provincias), Francia, Italia, Chequia, Eslovaquia, Grecia, Bielorrusia, Ucrania y Finlandia (regiones), Suecia, Irlanda,
  Lituania, Croacia, Albania, Hungría, Noruega y Estonia (condados), Reino Unido (naciones), Polonia (voivodatos) y
  Portugal, Rumanía, Serbia, Chipre y Moldavia (distritos). El país se elige en un
  desplegable de la portada, que ofrece primero el del visitante; se irán añadiendo más: ver
  `docs/mapas-por-pais-inventario-2026-11-12.md`.
- **Reto del día.** Las mismas diez preguntas para todo el mundo cada día (salen de la fecha, sin
  servidor), con racha de días seguidos y botón para compartir el resultado.
- **Listas de estudio.** En «Países → Elegir países» se crea una selección con justo los países que
  entran en un examen (marcándolos en la lista, filtrando por nombre o continente, o tocándolos en
  el mapa). La lista se usa en cualquier reto y se puede **compartir con un enlace**. Viene una de
  ejemplo, «50 países principales», que se puede editar o borrar.
- **Explorar y estudiar.** La tabla de los países elegidos con su continente y su capital, un
  buscador y la ficha de cada país (bandera, capital, hora local, superficie, vecinos).
- **Clima de cada país.** Al pasar el cursor y en la ficha: los climas que se estudian en la ESO
  (ecuatorial, tropical, desértico, mediterráneo, oceánico, continental, polar…), calculados sobre el
  territorio de cada país.
- **Hora de cada país.** Al pasar el cursor por un país se ve qué hora es allí ahora mismo (en los
  que tienen varios husos, la de la capital); en la ficha, además, la diferencia con la tuya.
- **Tiempo real.** Un botón pinta sobre el mapa dónde es de día y dónde de noche en este instante,
  marca el punto donde el Sol está en lo más alto y sitúa al usuario. La ubicación se deduce de la
  zona horaria del dispositivo, sin pedir nada; si se quiere exacta, hay un botón que usa el permiso
  de ubicación del navegador. En ningún caso se guarda ni se envía a ningún sitio.
- **Sol, Luna y capas.** En tiempo real también se marca dónde está la Luna en el cénit, con su fase.
  El botón de capas (junto al zoom) oculta la retícula, el reflejo del agua, el día y la noche, el Sol,
  la Luna o la ubicación.
- **Cielo real.** Con el tema oscuro, alrededor del globo se ven las 8404 estrellas visibles a simple vista
  (magnitud ≤ 6,5), cada una en su sitio para la hora actual, con su brillo y su color.
- **Progreso.** El mapa coloreado según lo bien que te sabes cada país, por reto y por zona.
- Tema claro («papel») y oscuro, diseño adaptado a móvil, y respeto de la preferencia de
  movimiento reducido del sistema.
- **Teclado.** Con el mapa enfocado (Tab), las flechas lo mueven, `+` y `−` acercan y alejan, e
  Intro elige el país que queda bajo el punto de mira, igual que si se pulsara.
- **Instalable y sin conexión.** Tras la primera visita, un service worker (`public/sw.js`) guarda
  la aplicación y el atlas, así que funciona sin red y se puede instalar como app.

## Cómo ayuda a aprender

- **Respuesta inmediata y varios intentos.** Cada fallo dice qué país era el que se ha pulsado; tras
  agotar los intentos se enseña la solución.
- **Repaso dentro de la partida.** Un país que no sale a la primera vuelve a preguntarse tres
  preguntas después. Ese repaso no puntúa, pero obliga a recuperar el dato cuando aún está fresco.
- **Repaso entre partidas.** Cada país lleva, por reto, una «caja» de Leitner (1–5): acertar a la
  primera lo sube de caja y fallar lo devuelve a la primera. Los países de las cajas bajas se
  sortean con más frecuencia, así que el tiempo de estudio se va a lo que peor se lleva.
- **Nota escolar.** Cada partida termina con una nota sobre 10 (un acierto a la primera vale 1; con
  ayuda, medio) y la lista de países para repasar, con un botón para jugar solo con ellos.

## Puesta en marcha

Requiere **Node 24** y [pnpm](https://pnpm.io) (la versión de `packageManager` en `package.json`).
No hace falta ninguna cuenta ni ninguna variable de entorno para arrancarlo en local.

```bash
pnpm install
pnpm dev        # genera el atlas y las páginas y arranca en http://localhost:5173
```

Otros comandos:

```bash
pnpm build      # genera el atlas y las páginas, comprueba tipos y compila a dist/
pnpm preview    # sirve dist/ en local
pnpm test       # pruebas (vitest): atlas, malla, proyección y lógica del juego
pnpm typecheck
pnpm atlas --audit      # regenera el atlas y lista nombres y capitales frente a la fuente
```

En desarrollo funcionan el mapa, los retos y las capas del tiempo y de los satélites. La
sincronización por código y los rankings necesitan la base de datos (ver abajo).

## Variables de entorno

Todas son opcionales en local. Copia `.env.example` a `.env.local` y rellena las que quieras; sin
valor, lo que depende de cada una se apaga. `.env.local` no va al repositorio.

| Variable | Para qué | Sin ella |
| --- | --- | --- |
| `VITE_SITE_URL` | Dirección pública (canonical, hreflang, sitemap, robots.txt) | `http://localhost:5173` |
| `VITE_CONTACT_EMAIL` | Correo de contacto e «informar de un error» | No salen esos enlaces |
| `VITE_DONATE_URL` | Enlace de donación | No hay página ni botón de donar |
| `VITE_GTM_ID` | Contenedor de Google Tag Manager | No hay analítica ni aviso de cookies |
| `VITE_TILE_STORE` | Almacén de las teselas de detalle (satélite y luces) | Se ve la imagen general |
| `TITULAR_NOMBRE`, `TITULAR_NIF`, `TITULAR_DOMICILIO` | Titular del sitio en el aviso legal | Salen como «PENDIENTE»; el build de Vercel falla |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED` | PostgreSQL (Neon): sincronización y rankings | Esas dos funciones no responden |
| `BLOB_READ_WRITE_TOKEN` | Subir teselas al Blob de Vercel (`scripts/upload-tiles.mjs`) | No se pueden subir |

Las `VITE_*` acaban en el HTML y en el JavaScript que recibe el navegador: no pongas secretos con ese
prefijo. Las tablas de la base se crean con `node scripts/db-init.mjs`.

## Despliegue en Vercel

El proyecto es un sitio estático (Vite) con cuatro funciones bajo `api/`. `vercel.json` ya indica el
comando de compilación, la carpeta de salida, las cabeceras de caché y la política de contenido
(CSP), así que basta con importar el repositorio en Vercel y definir las variables de arriba.

Si despliegas tu propia copia:

- Define los datos del titular: sin ellos el build falla a propósito, para no publicar un aviso
  legal a medias.
- **Revisa los textos legales** (`scripts/data/legales.mjs`): son los de studyworldmap.com y describen
  sus servicios (Vercel, Neon, Google Analytics).
- La AGPL te obliga a ofrecer el código fuente de tu versión a quien la use por la red.
- Si tu almacén de teselas no es un Blob de Vercel, añade su dominio a `connect-src` en `vercel.json`.

## Tecnología

- **Vite + React 19 + TypeScript**, estado con **Zustand**, estilos con **Tailwind CSS 4** y
  transiciones de interfaz con **Motion**.
- **three.js** para el mapa, con sombreadores propios. Los países son geometría vectorial, nítida a
  cualquier zoom.
- Tipografías autoalojadas (Besley y Atkinson Hyperlegible Next).
- **Analítica con consentimiento.** `public/consent.js` muestra un aviso de cookies y solo carga
  Google Tag Manager (el contenedor de `VITE_GTM_ID`, con GA4) si la persona acepta; con modo de consentimiento,
  solo analítica y nada de publicidad. Sin aceptar, la página no hace ninguna petición a terceros.
  La elección se cambia desde el enlace «Cookies» del pie.

### Cómo está hecho el mapa

1. `scripts/build-atlas.mjs` toma Natural Earth 1:50m (`world-atlas`), aplica unos ajustes de
   fronteras, corta los países por el antimeridiano y escribe `public/data/atlas.json` con los
   datos en español y los contornos cuantizados (≈270 kB comprimido). También copia las banderas a
   `public/flags/`. Ambas salidas se regeneran en cada `pnpm dev` y `pnpm build` y no se versionan.
2. En el navegador, `src/atlas/mesh.ts` trocea cada país por una rejilla y lo triangula (earcut):
   unos 100 000 triángulos en ~50 ms.
3. `src/engine/` dibuja esa malla. Cada vértice guarda solo (longitud, latitud, país); su posición
   la calcula el sombreador con una única función, `surface()`, que depende de un parámetro
   `morph`: con 1 es una esfera y con 0 el mapa plano. Entre medias el mapa es un trozo de una
   esfera cada vez más grande, y por eso «se desenrolla». La cámara sigue la misma función, y saber
   qué país hay bajo el cursor es un cálculo analítico (rayo–esfera o rayo–plano más un test de
   punto en polígono), sin leer píxeles.
4. El color y la elevación de cada país viven en una textura de un píxel por país: pintar o
   levantar un país es escribir 4 bytes.
5. `scripts/build-maps.mjs` genera, con ese mismo formato, el atlas de cada país por provincias
   (`public/data/es/`): la aplicación carga uno u otro y el motor no distingue. Las provincias son
   sus «países», las comunidades sus «regiones» y los países de alrededor, decorado.
6. El día y la noche se calculan en el sombreador a partir de la dirección del Sol
   (`src/engine/sun.ts`, fórmulas del Astronomical Almanac). La hora de cada país sale de la base
   de zonas horarias del propio navegador (`Intl`), así que respeta los cambios de hora sin
   librerías ni tablas; el atlas solo guarda qué zona corresponde a cada capital.

### Estructura

```
scripts/
  build-atlas.mjs        generador del atlas
  build-maps.mjs         generador de los atlas de un país por provincias (public/data/<mapa>/)
  build-subdivisions.mjs reduce la capa de subdivisiones de Natural Earth a las fronteras de un país (solo al añadir un país)
  fetch-subdivisions.mjs trae de Wikidata los nombres de provincias, comunidades y capitales (solo al añadir un país o un idioma)
  build-pages.mjs        páginas estáticas por idioma: países y capitales, juegos por continente, portadas, legales y sitemap
  fetch-capitals.mjs     trae de Wikidata los nombres de las capitales en cada idioma (solo al añadir un idioma)
  data/idiomas/          un fichero por idioma: textos de las páginas, nombres, alias y notas
  data/sitio.mjs         dirección del sitio, titular y enlace de donación, leídos de variables de entorno
  data/legales.mjs       textos legales; revisarlos si cambia lo que la app guarda o envía
  data/paises.mjs        nombres, capitales, regiones y continentes en español (editable a mano)
  data/mapas/            un país por provincias: datos en español (es.mjs), fronteras (es.topo.json) y nombres de Wikidata (es.wikidata.json)
src/
  atlas/                 carga del atlas, búsqueda del país de un punto y triangulación
  engine/                motor del mapa: cámara, sombreadores, paletas, entrada
  game/                  lógica pura: retos, partida, progreso, comparación de respuestas
  app/                   estado de la aplicación y enlace con el motor
  ui/                    componentes de React
```

`src/game/` y `src/atlas/` no dependen de React ni de three.js y están cubiertos por pruebas.

### Añadir otro país por provincias

Hay treinta y dos (ver `src/game/countryMaps.ts`); el resto se añade sobre todo con datos:

1. `scripts/data/mapas/<país>.mjs`, copiando `us.mjs` (o `es.mjs`, que además lleva páginas
   estáticas): subdivisiones con su capital y su región, países de alrededor y correcciones de
   nombres. Darlo de alta en `scripts/data/mapas/index.mjs`. Un país sin agrupaciones deja
   `comunidades` vacío; lo que se dibuja pero no se pregunta lleva `decorado: true`; un país mucho
   mayor que España baja el detalle con `detalle` e `islote`; si Natural Earth trae un código ISO
   antiguo, `renombrar` lo pasa al vigente; y si trae un nivel más fino que el que se estudia (los
   departamentos de Francia), `fundir` dice por qué campo se reúnen sus piezas; y si una pieza
   suelta trae el código de otra, `corregir` le pone el suyo. Si el encuadre de
   todas sus unidades juntas no sirve (Portugal con las Azores), `marco` lo fija a mano. En `contexto` van solo los vecinos con frontera, y la
   `ventana` tiene que abarcarlos enteros: el resto del mundo lo pone de fondo la aplicación, del
   atlas mundial.
2. Descargar `ne_10m_admin_1_states_provinces.geojson` de
   [natural-earth-vector](https://github.com/nvkelso/natural-earth-vector) (40 MB, fuera del repositorio) y
   ejecutar `node scripts/build-subdivisions.mjs <ruta> <país>`: deja `<país>.topo.json`.
3. `node scripts/fetch-subdivisions.mjs <país>`: deja `<país>.wikidata.json`, y lista lo que hay que
   revisar a mano. Las coletillas propias del país («Kreis Alba») se quitan con `wikidata.tipo`, por
   idioma, sin tocar a los demás países.
4. Para sus páginas estáticas, su nombre con preposición en cada idioma en
   `scripts/data/mapas/plantillas.mjs` (el resto sale de las plantillas).
5. En la aplicación, una entrada en `src/game/countryMaps.ts`: su nombre, el tipo de sus unidades,
   si se agrupan y sus zonas. Los textos no se escriben por país: salen del tipo de unidad
   («provincia», «estado»), en `src/game/maps.ts`. Un tipo nuevo («cantón», «región») son unas
   veinte frases, que hay que traducir a los nueve idiomas.

`build-maps.mjs` no corta por el antimeridiano: confía en que Natural Earth ya trae partido lo que
lo cruza (las Aleutianas) y falla si no es así.

## Idiomas

Español en la raíz y, cada uno en su prefijo, inglés (`/en/`), francés, alemán, italiano, portugués
de Brasil, valenciano/catalán (`/ca/`), gallego, euskera y chino simplificado (`/zh/`). Cada idioma tiene su dirección, sus páginas
estáticas y sus `hreflang`. Las traducciones no las ha revisado un hablante nativo. Para añadir un idioma:

1. `src/i18n/index.ts`: darlo de alta en `LANGS` y `LOCALES`, y crear `src/i18n/<idioma>.ts` copiando
   `en.ts`. Los textos del código están en español y son la clave; `pnpm test` avisa de los que falten.
2. `scripts/data/idiomas/<idioma>.mjs` (copiando `en.mjs`) y darlo de alta en `idiomas/index.mjs`: textos
   de las páginas estáticas y de `index.html`, regiones, continentes, notas y correcciones de nombres.
   Los países salen de CLDR (el `Intl` de Node) y las capitales de `scripts/data/capitales.wikidata.json`.
3. `index.html` (un `hreflang` más) y `public/consent.js` (aviso de cookies).

Los textos legales solo están en español.

## Decisiones sobre los datos

- **197 países**: los 193 miembros de la ONU, sus dos Estados observadores (Ciudad del Vaticano y
  Palestina) y dos Estados de reconocimiento limitado que suelen entrar en los temarios (Taiwán y
  Kosovo). El resto de territorios (Groenlandia, Puerto Rico, Sáhara Occidental, la Antártida…) se
  ven en el mapa y en el explorador, pero no se preguntan.
- **Fronteras**: Crimea se dibuja como parte de Ucrania, Somalilandia dentro de Somalia y el norte
  de Chipre dentro de Chipre. El Sáhara Occidental se dibuja entero, hasta el paralelo 27° 40′ N
  (la fuente solo llama así a la franja al este del muro). Tuvalu no existe en la cartografía a esta
  escala y se añade a mano.
- **Continentes**: Rusia y Turquía cuentan como «Europa y Asia». En los países del Cáucaso,
  Kazajistán y Chipre se aceptan varias respuestas.
- **Capitales** con matices (Bolivia, Sudáfrica, Países Bajos, Sri Lanka…) llevan una nota en la
  ficha y aceptan la alternativa al escribir. Guinea Ecuatorial figura con Ciudad de la Paz, su
  capital oficial desde enero de 2026 (también se acepta Malabo).

- **Provincias de España**: las 50 provincias más Ceuta y Melilla, que no son provincias pero se
  estudian con ellas. Los nombres van en castellano (Lérida, Gerona, La Coruña, Orense, Vizcaya…) y al
  escribir se aceptan los oficiales (Lleida, Girona, A Coruña, Ourense, Bizkaia…). En los demás
  idiomas salen de Wikidata: la provincia que se llama como su capital toma el nombre de la ciudad.
  No se da la superficie de las provincias: la fuente cartográfica está simplificada y no es un dato fiable.

Para corregir un nombre o una capital, o cambiar qué países se preguntan, edita
`scripts/data/paises.mjs` (o `scripts/data/mapas/es.mjs` para las provincias): el generador comprueba
que la lista sea coherente y avisa si no.

## Créditos

- Cartografía: [Natural Earth](https://www.naturalearthdata.com) (dominio público), vía
  [world-atlas](https://github.com/topojson/world-atlas); las provincias, de su capa 1:10m de
  subdivisiones (`ne_10m_admin_1_states_provinces`), reducida con
  [topojson](https://github.com/topojson) (`scripts/build-subdivisions.mjs`).
- Nombres de provincias, estados, comunidades y capitales en otros idiomas: [Wikidata](https://www.wikidata.org) (CC0).
- Regiones de Estados Unidos: las cuatro de la Oficina del Censo (U.S. Census Bureau, Census Regions).
- Fronteras de las regiones de Finlandia: [Statistics Finland](https://stat.fi/org/avoindata/paikkatietoaineistot_en.html),
  unidades estadísticas por municipios de 2026 (CC BY 4.0). Natural Earth es anterior a los cambios de 2021.
- Fronteras de los condados de Noruega: [Kartverket](https://kartkatalog.geonorge.no/), «Administrative enheter
  fylker» de 2026 (CC BY 4.0), recortadas por la costa de Natural Earth con
  [polyclip-ts](https://github.com/luizbarboza/polyclip-ts). Natural Earth trae los condados anteriores a 2018.
- Fronteras de los condados de Estonia: división administrativa de Estonia (EHAK), Republic of Estonia Land and
  Spatial Development Board, 01.11.2026 ([licencia de datos abiertos](https://geoportaal.maaruum.ee/opendata-licence)).
  Natural Earth es anterior a la reforma de 2017.
- Fronteras de los distritos de Chipre: Department of Lands and Surveys de la República de Chipre, unidades
  administrativas INSPIRE. Natural Earth trae cinco distritos y el norte aparte.
- Fronteras de los distritos de Moldavia: ACNUR y OCHA, 2020 (CC BY 3.0 IGO), vía
  [geoBoundaries](https://www.geoboundaries.org/). Natural Earth parte Transnistria y no trae Dubăsari.
- Códigos ISO y superficies: [mledoze/countries](https://github.com/mledoze/countries) (ODbL).
- Temperatura, nubes y viento de ahora: modelo GFS de NOAA/NCEP (dominio público), del
  [programa de datos abiertos de la NOAA](https://registry.opendata.aws/noaa-gfs-bdp-pds/).
- Lluvia y nieve de ahora: IMERG (misión GPM), NASA, vía [GIBS](https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api).
- Satélites: elementos orbitales GP de [CelesTrak](https://celestrak.org/); posiciones con
  [satellite.js](https://github.com/shashwatak/satellite-js) (MIT).
- Zonas horarias: base de datos de la IANA, vía
  [moment-timezone](https://github.com/moment/moment-timezone) (solo al generar el atlas).
- Banderas: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
- Climas: mapa mundial de Köppen-Geiger (Kottek, Grieser, Beck, Rudolf y Rubel, 2006), agrupado en los
  climas de la ESO; porcentajes por país en `scripts/data/climas.koppen.json` (`scripts/build-climate.mjs`)
  y correcciones en `scripts/data/climas.mjs`.
- Estrellas: Yale Bright Star Catalogue, 5.ª edición (dominio público); recorte en `src/engine/stars.ts`,
  generado con `scripts/build-stars.mjs`. Las débiles (magnitud 6,5 a 9), del catálogo Hipparcos de la ESA (1997): `public/data/stars.bin`,
  generado con `scripts/build-stars-faint.mjs`.
- Tipografías: Besley y Atkinson Hyperlegible Next (SIL Open Font License).

## Contribuir

Las propuestas y los avisos de errores (un nombre, una capital, una frontera, una traducción) son
bienvenidos en las [incidencias](https://github.com/aguilera128/study-world-map/issues).

- Lee antes [AGENTS.md](AGENTS.md): recoge las reglas que no se ven en el código.
- Todo dato que ve un estudiante tiene que ser real y tener fuente.
- Antes de abrir una *pull request*: `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Commits en [Conventional Commits](https://www.conventionalcommits.org/es/), en español.
- No añadas dependencias sin comentarlo antes en una incidencia.
- Las traducciones las ha escrito un modelo: las correcciones de hablantes nativos son especialmente útiles.

Al contribuir aceptas que tu aportación se publique bajo la misma licencia.

## Seguridad

No abras una incidencia pública para un fallo de seguridad. Usa el aviso privado de GitHub:
pestaña **Security → Report a vulnerability** del repositorio
([enlace directo](https://github.com/aguilera128/study-world-map/security/advisories/new)).

## Licencia

El código es software libre bajo la [GNU Affero General Public License v3.0](LICENSE). Si publicas
una versión modificada en una web, tienes que ofrecer su código fuente a quienes la usen.

Los datos de terceros (cartografía, imágenes de la NASA y la NOAA, catálogos de estrellas, banderas,
tipografías…) conservan su propia licencia: ver «Créditos». El nombre «Study World Map», el dominio
y el icono no entran en la licencia. Las ilustraciones de `public/toon/` son diseños originales
generados con IA.
