# Study World Map

Mapamundi interactivo para **estudiar los países del mundo jugando**: un globo 3D que se desenrolla
hasta convertirse en un mapa plano 2D, cinco retos con corrección inmediata y un sistema de repaso
que insiste en lo que todavía no te sabes.

Todo funciona en el navegador: no hay cuentas, servidor ni base de datos. El progreso se guarda en
el propio dispositivo.

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
- **Listas de estudio.** En «Países → Elegir países» se crea una selección con justo los países que
  entran en un examen (marcándolos en la lista, filtrando por nombre o continente, o tocándolos en
  el mapa). La lista se usa en cualquier reto y se puede **compartir con un enlace**. Viene una de
  ejemplo, «50 países principales», que se puede editar o borrar.
- **Explorar y estudiar.** La tabla de los países elegidos con su continente y su capital, un
  buscador y la ficha de cada país (bandera, capital, hora local, superficie, vecinos).
- **Hora de cada país.** Al pasar el cursor por un país se ve qué hora es allí ahora mismo (en los
  que tienen varios husos, la de la capital); en la ficha, además, la diferencia con la tuya.
- **Tiempo real.** Un botón pinta sobre el mapa dónde es de día y dónde de noche en este instante,
  marca el punto donde el Sol está en lo más alto y sitúa al usuario. La ubicación se deduce de la
  zona horaria del dispositivo, sin pedir nada; si se quiere exacta, hay un botón que usa el permiso
  de ubicación del navegador. En ningún caso se guarda ni se envía a ningún sitio.
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

No necesita variables de entorno.

## Tecnología

- **Vite + React 19 + TypeScript**, estado con **Zustand**, estilos con **Tailwind CSS 4** y
  transiciones de interfaz con **Motion**.
- **three.js** para el mapa, con sombreadores propios. No hay texturas ni teselas: los países son
  geometría vectorial, nítida a cualquier zoom.
- Tipografías autoalojadas (Besley y Atkinson Hyperlegible Next): la página no hace ninguna
  petición a terceros.

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
5. El día y la noche se calculan en el sombreador a partir de la dirección del Sol
   (`src/engine/sun.ts`, fórmulas del Astronomical Almanac). La hora de cada país sale de la base
   de zonas horarias del propio navegador (`Intl`), así que respeta los cambios de hora sin
   librerías ni tablas; el atlas solo guarda qué zona corresponde a cada capital.

### Estructura

```
scripts/
  build-atlas.mjs        generador del atlas
  data/paises.mjs        nombres, capitales, regiones y continentes en español (editable a mano)
src/
  atlas/                 carga del atlas, búsqueda del país de un punto y triangulación
  engine/                motor del mapa: cámara, sombreadores, paletas, entrada
  game/                  lógica pura: retos, partida, progreso, comparación de respuestas
  app/                   estado de la aplicación y enlace con el motor
  ui/                    componentes de React
```

`src/game/` y `src/atlas/` no dependen de React ni de three.js y están cubiertos por pruebas.

## Decisiones sobre los datos

- **197 países**: los 193 miembros de la ONU, sus dos Estados observadores (Ciudad del Vaticano y
  Palestina) y dos Estados de reconocimiento limitado que suelen entrar en los temarios (Taiwán y
  Kosovo). El resto de territorios (Groenlandia, Puerto Rico, Sáhara Occidental, la Antártida…) se
  ven en el mapa y en el explorador, pero no se preguntan.
- **Fronteras**: Crimea se dibuja como parte de Ucrania, Somalilandia dentro de Somalia y el norte
  de Chipre dentro de Chipre. Tuvalu no existe en la cartografía a esta escala y se añade a mano.
- **Continentes**: Rusia y Turquía cuentan como «Europa y Asia». En los países del Cáucaso,
  Kazajistán y Chipre se aceptan varias respuestas.
- **Capitales** con matices (Bolivia, Sudáfrica, Países Bajos, Sri Lanka…) llevan una nota en la
  ficha y aceptan la alternativa al escribir. Guinea Ecuatorial figura con Ciudad de la Paz, su
  capital oficial desde enero de 2026 (también se acepta Malabo).

Para corregir un nombre o una capital, o cambiar qué países se preguntan, edita
`scripts/data/paises.mjs`: el generador comprueba que la lista sea coherente y avisa si no.

## Créditos

- Cartografía: [Natural Earth](https://www.naturalearthdata.com) (dominio público), vía
  [world-atlas](https://github.com/topojson/world-atlas).
- Códigos ISO y superficies: [mledoze/countries](https://github.com/mledoze/countries) (ODbL).
- Zonas horarias: base de datos de la IANA, vía
  [moment-timezone](https://github.com/moment/moment-timezone) (solo al generar el atlas).
- Banderas: [flag-icons](https://github.com/lipis/flag-icons) (MIT).
- Tipografías: Besley y Atkinson Hyperlegible Next (SIL Open Font License).
