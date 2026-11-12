# Study World Map — guía para agentes y colaboradores

Atlas interactivo para estudiar geografía jugando (países, capitales, banderas, climas, población,
geografía física, el planeta por dentro y por fuera). Producción: https://www.studyworldmap.com.
El README cuenta qué hace y cómo está hecho el mapa; el diseño visual está en [DESIGN.md](DESIGN.md).
Este fichero recoge lo que hay que saber para tocar el proyecto sin romper nada.

## Lo esencial

- **Stack:** Vite 8, React 19, TypeScript estricto, Zustand, Tailwind CSS 4, three.js con sombreadores
  GLSL propios, Motion. Node 24. Pruebas con Vitest.
- **Gestor de paquetes: pnpm.** Nunca npm ni npx.
- **Despliegue:** Vercel, automático con cada push a `main`. CI en GitHub Actions (`.github/workflows/ci.yml`).
  Antes de `git push` se pregunta siempre.
- **Commits:** Conventional Commits, en español, sin firmas de agentes ni `Co-Authored-By`.
- **Antes de dar algo por terminado:** `pnpm typecheck`, `pnpm test` y `VERCEL=1 pnpm build`
  (el build de Vercel falla si faltan los datos del titular en `scripts/data/sitio.mjs`).
- **No añadir dependencias sin preguntar.** Casi todo se resuelve con lo que hay.

## Comandos

```bash
pnpm dev        # genera atlas y páginas y arranca en http://localhost:5173
pnpm build      # atlas + páginas + tsc + vite build
pnpm test       # vitest
pnpm typecheck
pnpm atlas      # solo regenera public/data (atlas del mundo, de España y de geografía física)
```

## Estructura

```
api/sync.ts            función de Vercel: sincronización del progreso por código (Neon)
api/ranking.ts         función de Vercel: los diez mejores resultados de cada reto (Neon)
scripts/               generadores de datos y de páginas estáticas (se ejecutan a mano o en el build)
scripts/data/          fuentes editables: países, idiomas, legales, temario físico, correcciones
public/data/           datos generados que sí van al repositorio (texturas, capas, atlas físico)
src/atlas/             carga del atlas y triangulación (sin React ni three.js, con pruebas)
src/game/              lógica pura: retos, partida, progreso, población, clima (con pruebas)
src/game/countryMaps.ts  los países que se estudian por dentro (España, EE. UU.): solo datos
src/engine/            motor del mapa: MapEngine, cámara, sombreadores, paletas, rótulos
src/app/               estado (Zustand), sincronización, exportar imagen, hora
src/ui/                componentes de React
src/i18n/              un diccionario por idioma; el texto en español es la clave
docs/                  planes y propuestas con fecha
```

## Reglas que no se ven en el código

### Traducciones
- La clave de cada texto es la frase en español: `t('Texto en español')`. Hay nueve diccionarios
  (`src/i18n/<idioma>.ts`) y una prueba falla si a alguno le falta o le sobra una clave, o si no
  conserva las variables `{n}`.
- Los textos que llegan a `t()` en una variable hay que añadirlos a la lista de `src/i18n/i18n.test.ts`.
- Las páginas estáticas tienen sus textos aparte, un fichero por idioma con las mismas claves:
  `scripts/data/idiomas/<idioma>.mjs` (portada, países, juegos) y `scripts/data/temas/<idioma>.mjs`
  (geografía física, climas, población y «El planeta»). Los nombres de climas y capas de esas
  páginas salen del diccionario de la aplicación: `scripts/build-pages.mjs` falla si falta alguno.
- El catalán usa formas valencianas (aprén, meua, eixir) y el portugués es el de Brasil.
- Los nombres de países, accidentes, corrientes y placas no están en los diccionarios sino en los
  datos (`public/data/**/names.<idioma>.json`, `corrientes.json`, `tectonica.json`).
- Las traducciones las ha escrito un modelo: están pendientes de revisión por hablantes nativos.

### Mapas de un país
- Un país es una entrada en `src/game/countryMaps.ts` y sus tres ficheros en `scripts/data/mapas/`
  (pasos en el README). `countryMaps.ts` **solo lleva datos y no importa nada que se ejecute**: lo
  carga también el servidor a través de `ranking.ts`.
- Los textos no van por país sino por tipo de unidad (`UNITS` en `src/game/maps.ts`): frases
  enteras, porque el género y los artículos cambian en cada idioma. Al añadir un tipo hay que mirar
  que «Estúdialos…» y «Practicar estos…» (o sus femeninos) concuerden en los nueve diccionarios.
- Solo se añade un país si sus fronteras y su nivel administrativo son los vigentes y los que se
  estudian. Qué trae Natural Earth para cada uno y qué falta está en
  `docs/mapas-por-pais-inventario-2026-11-12.md`.

### Sombreadores (`src/engine/shaders.ts`)
- Son plantillas de texto: **nada de comillas invertidas dentro de un comentario GLSL** (rompen la
  plantilla). Para citar un nombre se usan «comillas latinas».
- Las constantes que se interpolan (`${NOISE3}`, `${SHADE}`…) tienen que estar declaradas **antes**
  en el fichero.
- La proyección de la cámara está descentrada para apartar el globo de los paneles: cualquier
  cálculo de pantalla ↔ dirección tiene que contar `projectionMatrix[2][0]` y `[2][1]`.
- El océano se compila dos veces: sin «WAVES» (mar liso, con el que arranca el mapa y se dibuja de lejos) y con «WAVES»
  (oleaje y vetas de las corrientes, que entra al acercarse o con la capa de corrientes). Lo que tenga ruido va dentro de `#ifdef WAVES`:
  cada uso del ruido alarga la compilación, que es lo que retrasa el primer fotograma.
- Los radios de las capas del interior están en dos sitios que deben coincidir: `SHELL_RADIUS` en
  `MapEngine.ts` y los números de `CUT_FRAG`.

### Motor
- Dibuja a demanda (`invalidate()`); con algo animado a la vista (agua, corrientes, estrellas,
  interior del planeta) redibuja a unos 10 fotogramas por segundo.
- Para probar algo del motor en el navegador de desarrollo:
  `(await import('/src/app/engineRef.ts')).getEngine()`. No importar así `store.ts`: crea otra copia.
- La malla de los países se construye en un hilo aparte (`src/atlas/meshAsync.ts`) y las imágenes de
  las texturas se decodifican fuera del hilo principal (`src/engine/bitmaps.ts`); las dos cosas se
  piden en cuanto llega el atlas (`load` en `store.ts`), antes de que exista el motor. Una textura
  de imagen nueva se crea con `image()` en `MapEngine.ts`, no con `TextureLoader`: decodificar en
  el hilo principal bloquea la página hasta un segundo en un móvil.
- En desarrollo, tras editar un módulo puede salir en consola
  «Cannot read properties of null (reading 'countries')»: es de la recarga en caliente, no un fallo.

### Datos: de dónde sale cada cosa
Todo dato que ve un estudiante tiene que ser real y tener fuente. Cada generador lleva en su
cabecera la fuente, la licencia y cómo se vuelve a ejecutar.

| Dato | Generador | Fuente |
|---|---|---|
| Países, fronteras, banderas | `scripts/build-atlas.mjs` | Natural Earth, flag-icons, mledoze/countries |
| Provincias de España y estados de EE. UU. | `scripts/build-maps.mjs` (datos en `scripts/data/mapas/`) | Natural Earth, Wikidata; regiones de EE. UU.: Oficina del Censo |
| Geografía física | `scripts/build-physical.py` + `build-fisico.mjs` | Natural Earth, Wikidata |
| Correcciones de geografía física | `scripts/data/fisico-correcciones.json` | a mano, cada una con su motivo |
| Climas | `scripts/build-climate.mjs` | Köppen-Geiger (Kottek et al. 2006) |
| Población | `scripts/data/poblacion.worldbank.json` | Banco Mundial SP.POP.TOTL |
| Relieve y profundidad del mar | `build-relief.py`, `build-depth.py` | Natural Earth |
| Relieve del fondo marino | `build-seabed.py` | ETOPO2v2 (NOAA) |
| Luces nocturnas de las ciudades | `build-nightlights.py` | Black Marble 2016 (NASA) |
| Imagen de satélite | `build-satellite.py` | Blue Marble Next Generation (NASA), con ETOPO2v2 como máscara de tierra |
| Corrientes | `build-currents.py` | OSCAR (NOAA) |
| Ficha de cada corriente | `build-current-info.py` | OSCAR (velocidad), Wikipedia en inglés (rumbo general) |
| Placas y volcanes | `build-tectonics.py` | Bird 2003 (vía H. Ahlenius), NOAA NCEI |
| Estrellas | `build-stars.mjs`, `build-stars-faint.mjs` | Yale Bright Star Catalogue (brillantes), Hipparcos de la ESA (débiles) |
| Vía Láctea | `exr-to-raw.mjs` + `build-milkyway.py` | NASA Deep Star Maps 2020 (Gaia DR2) |
| Continentes de la ilustración | `build-planet-land.mjs` | Natural Earth |
| Ilustraciones del huevo de pascua (`public/toon/`) | a mano, sin generador | diseños originales generados con IA (imágenes de Codex) a partir de una descripción propia; no son de ninguna serie |
| Interior de la Tierra, atmósfera, Sol y Luna | `src/ui/planetLayers.ts`, `RealTime.tsx` | USGS, IGN, PREM, artículos citados, NASA |

Los ficheros grandes de origen (Natural Earth, EXR de la NASA, rejilla de Köppen) **no** van al
repositorio: se descargan a una carpeta temporal cuando hay que regenerar.

### Vercel
- Bajo `api/` solo puede haber rutas reales: todo `.ts`/`.js` que haya ahí se despliega como función
  y Vercel la arranca sin que nadie la llame. Los scripts van en `scripts/`, con guarda de módulo
  principal (`if (process.argv[1] === fileURLToPath(import.meta.url)) main()`).
- Hoy hay **dos** funciones (`api/sync.ts` y `api/ranking.ts`). Si en *Resources* aparecen más, algo
  se despliega de más.
- `vercel.json` manda una política de contenido (cabecera `Content-Security-Policy`): solo se carga
  lo propio, el Blob de las teselas y Google Tag Manager. Consecuencias al tocar las páginas:
  - Nada de `onclick` ni otros atributos con código: se escucha desde un `.js` (así abre el aviso de
    cookies `public/consent.js` con los enlaces a `#cookies`).
  - El único script en línea permitido es el del tema, en `index.html`, por su huella. Si se cambia,
    `src/app/csp.test.ts` falla hasta que se actualice la huella en `vercel.json`.
  - Un servicio externo nuevo hay que añadirlo a la política, además de a `legales.mjs`.
  - No lleva `frame-ancestors` a propósito: la web se puede incrustar (aulas virtuales).

### Sincronización y datos personales
- No hay cuentas. El progreso vive en el navegador y, solo si el usuario crea un código, también en
  Neon (PostgreSQL, Fráncfort), tabla `progress_sync(code, data, created_at, updated_at)`.
- La cadena de conexión está en `.env.local` (ignorado por git) y en Vercel como variable *Sensitive*.
  **No se imprime ni se copia nunca**: solo se revisan nombres y forma.
- El código de sincronización viaja en la cabecera `X-Sync-Code`, no en la dirección.
- **Ranking:** tabla `ranking(id, category, nick, country, grade, ms, created_at)`, con los diez
  mejores de cada categoría (mapa/reto/respuesta/zona/preguntas, o `dia/<fecha>`). Solo se publica si
  quien juega pulsa «Publicar»; el apodo es texto libre con aviso y filtro (`cleanNick`), y el país
  sale de la cabecera `x-vercel-ip-country`: la IP no se guarda. La nota la calcula el navegador, así
  que no hay garantía contra trampas. Lo que comparten la aplicación y la función está en
  `src/game/ranking.ts`, que **no puede importar nada que se ejecute** (lo carga el servidor): la
  función lo importa con su extensión `.ts`.
- `node scripts/ranking.mjs` enseña lo publicado y borra una entrada (`--borrar <id>`): es la
  moderación de apodos.
- `node scripts/db-init.mjs --probar` pasa las dos funciones por un ciclo completo contra la base
  real y borra las filas de prueba.
- **Si cambia lo que la aplicación guarda o envía, hay que cambiar `scripts/data/legales.mjs`** y la
  fecha de revisión de `scripts/data/sitio.mjs`.
- Google Analytics solo se carga con consentimiento (`public/consent.js`).
- La aplicación no pide nada a terceros (salvo Google Analytics, con consentimiento). Las teselas de
  detalle de la imagen de satélite y de las luces nocturnas son de la NASA, pero se sirven desde
  nuestro Blob de Vercel `study-world-map-teselas` (público, Fráncfort): `scripts/download-tiles.mjs`
  las baja a `teselas/` (fuera del repositorio), `scripts/convert-tiles.py` las pasa a WebP (la foto
  con pérdida, las luces sin ella) y `scripts/upload-tiles.mjs` sube los `.webp`. Si se añade
  un servicio externo, va a `legales.mjs`.

## Pendiente conocido

- Revisión nativa de las traducciones y revisión profesional de los textos legales (bases legales,
  menores de 14 años, transferencias de Neon y Vercel).
- Pruebas en móvil real.
- Aparcado a propósito: cuentas con correo, mapas históricos, otras proyecciones, flujos de
  migración y comercio. Ver `docs/`.
