# Study World Map

Mapamundi interactivo para **estudiar los países del mundo jugando**: un globo 3D que se desenrolla
hasta convertirse en un mapa plano 2D, cinco retos con corrección inmediata y un sistema de repaso
que insiste en lo que todavía no te sabes.

Casi todo funciona en el navegador y no hay cuentas: el progreso se guarda en el propio dispositivo.
Solo si se crea un código para seguir en otro dispositivo, se guarda también en una base de datos
(una única función de Vercel, `api/sync.ts`).

Para tocar el proyecto: [AGENTS.md](AGENTS.md) (reglas y estructura) y [DESIGN.md](DESIGN.md) (diseño).

## Qué incluye

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
  Turquía y Bulgaria (provincias), Francia, Italia, Chequia, Eslovaquia, Grecia, Bielorrusia y Ucrania (regiones), Suecia, Irlanda,
  Lituania, Croacia, Albania y Hungría (condados), Reino Unido (naciones), Polonia (voivodatos) y
  Portugal, Rumanía y Serbia (distritos). El país se elige en un
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

Requiere Node 24 y [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # genera el atlas y arranca en http://localhost:5173
```

Otros comandos:

```bash
pnpm build      # genera el atlas, comprueba tipos y compila a dist/
pnpm preview    # sirve dist/ en local
pnpm test       # pruebas (vitest): atlas, malla, proyección y lógica del juego
pnpm typecheck
pnpm atlas --audit      # regenera el atlas y lista nombres y capitales frente a la fuente
```

## Despliegue en Vercel

El proyecto es un sitio estático (Vite). `vercel.json` ya indica el comando de compilación, la
carpeta de salida y las cabeceras de caché, así que basta con importar el repositorio en Vercel, o
desde la terminal:

```bash
pnpm dlx vercel          # despliegue de vista previa
pnpm dlx vercel --prod   # producción
```

La sincronización por código necesita `DATABASE_URL` (Neon), definida en Vercel como variable
*Sensitive* y, en local, en `.env.local`. Sin ella, el resto de la web funciona igual.

## Tecnología

- **Vite + React 19 + TypeScript**, estado con **Zustand**, estilos con **Tailwind CSS 4** y
  transiciones de interfaz con **Motion**.
- **three.js** para el mapa, con sombreadores propios. No hay texturas ni teselas: los países son
  geometría vectorial, nítida a cualquier zoom.
- Tipografías autoalojadas (Besley y Atkinson Hyperlegible Next).
- **Analítica con consentimiento.** `public/consent.js` muestra un aviso de cookies y solo carga
  Google Tag Manager (`GTM-TW2XCZJM`, con GA4) si la persona acepta; con modo de consentimiento,
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
  data/sitio.mjs         datos del titular y enlace de donación (el build de Vercel falla si faltan)
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

Hay veintisiete (ver `src/game/countryMaps.ts`); el resto se añade sobre todo con datos:

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
- Códigos ISO y superficies: [mledoze/countries](https://github.com/mledoze/countries) (ODbL).
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
