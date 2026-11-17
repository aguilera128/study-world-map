# Auditoría completa — 14 de noviembre de 2026

Sobre el commit `52ca7b7` (`main`, árbol limpio). Es una auditoría de solo lectura: no se cambió ningún fichero, ni la base de datos, ni Vercel.

## Cómo se hizo

- **Diez auditores**, uno por área: seguridad, privacidad y legal, juego y estado, motor gráfico, interfaz y accesibilidad, datos y generadores, traducciones, rendimiento/SEO/PWA, satélites y tiempo, y calidad/CI/documentación.
- **Verificación adversarial:** cada hallazgo lo revisaron 2 verificadores (3 si era grave) con el encargo de refutarlo. Uno comprobaba si el problema existe de verdad en el código; otro, si importa en el uso real. Solo queda lo que sostuvo la mayoría, con la gravedad que le dieron ellos.
- **Crítico de cobertura:** buscó zonas y problemas que nadie había mirado; lo que encontró pasó por la misma verificación.
- En total, 250 agentes. Además, los tres primeros hallazgos (A1, A2 y A9) los he comprobado a mano en el código.

## Resumen

- **96 hallazgos confirmados** (103 antes de juntar los que vieron varios auditores): 0 críticos, 2 altos, 8 medios, 71 bajos y 15 informativos. Los verificadores descartaron otros 13.
- **No hay fallos de seguridad explotables graves.** Lo más serio son dos pérdidas o cortes de progreso (A1, A9) y un botón que deja la partida colgada (A2).
- **Lo que está bien, comprobado:**
  - **Funciones:** consultas a Neon parametrizadas; sin proxy abierto ni SSRF en `/api/tiempo` y `/api/satelites`; errores genéricos hacia fuera; solo las cuatro rutas reales bajo `api/`.
  - **Código de sincronización:** unos 58 bits generados con `crypto.getRandomValues`, sin sesgo. Enumerarlo no es viable.
  - **CSP:** la huella del script en línea coincide en todas las portadas y no hay atributos `on*`. En producción están HSTS, `nosniff` y `Referrer-Policy`.
  - **Secretos:** no hay ninguno en el historial de git.
  - **Privacidad:** Google Analytics solo se carga tras aceptar; lo guardado en el navegador coincide con la tabla de cookies; NOAA, NASA y CelesTrak no reciben nada del visitante.
  - **Créditos:** casi todos están en `legales.mjs` (faltan los de A15 y A19).
  - **Juego:** la lógica de sesión, nota, repetición espaciada, reto del día y listas compartidas es correcta salvo lo indicado. `pnpm typecheck` sale limpio y las pruebas de `src/game` y `src/app` pasan, 237 de 237.

## Estado

**Arreglados el 14-nov-2026: los 2 altos y los 8 medios** (A1–A10). Cada arreglo pasó por un revisor independiente, que los aprobó todos. Pasan `pnpm typecheck`, las 323 pruebas y `VERCEL=1 pnpm build`.

- **A1:** `ENTITY_ID` admite los ids del mapa físico. Una prueba recorre los 314 del atlas.
- **A3:** la parte pura del progreso está en `src/game/progressData.ts`. `/api/sync` guarda solo `{progress, bests, daily}` limpio (`cleanSyncData`) y mide el tamaño en bytes. Lo que mandan los clientes ya desplegados se conserva.
- **A9:** `keepalive` solo con la pestaña oculta y por debajo de 60.000 bytes.
- **A2:** el repaso usa la configuración y la zona de la partida anterior, y no se entra a jugar con 0 preguntas.
- **A5 y A6:** tokens `--on-tone` y `--tone-shade`, y `--ink-faint` más contrastado en los dos temas. Una prueba calcula los ratios.
- **A7:** la tarjeta de la hora ya no es región viva; solo se anuncia el resultado de «Usar mi ubicación exacta».
- **A8:** `build-pages.mjs` genera un manifiesto por idioma en `/<idioma>/manifest.webmanifest`.
- **A10:** `isCategory` (leer) y `isPublishable` (publicar, con la ventana de ±2 días) están separadas.
- **A4:** la ficha y los rótulos de los satélites usan la misma posición con la que se dibuja el icono.

**Pendiente que salió al arreglarlos:**

- ~~**Límite por IP**~~ **Hecho el 14-nov-2026:** regla «Limite crear codigo sync» en el firewall de Vercel. Solo afecta a `POST /api/sync` y deja 40 por IP cada 10 minutos (ventana fija); a partir de ahí devuelve 429. Probada en producción con POST inválidos, que no llegan a la base: 40 respuestas 400 y después 429, mientras el GET sigue respondiendo. Una IP sola ya no puede agotar el cupo global (como mucho 240 por hora); dos sí. GET, PUT y DELETE no se limitan porque un aula entera sale por la misma IP.
- **Tamaño máximo de `/api/sync`:** `MAX_BYTES = 300.000` se queda corto en el peor caso: con todas las unidades de los 40 atlas en todos los retos, unos 333 KB (ver A95). Subirlo amplía el margen de abuso; hay que decidirlo.
- **Validación duplicada:** `cleanSaved` en `store.ts` repite parte de `cleanSyncData`. Se podría unificar.
- **Comentario desfasado:** `api/sync.ts` sigue diciendo «Es la única función del proyecto».

## Por dónde empezaría

1. **A1. El progreso de «Geografía física» se borra al recargar.** Una expresión regular en `progress.ts` descarta los ids del mapa físico. Es una línea más una prueba, y lo ya perdido no se recupera: cuanto antes, mejor.
2. **A2. «Repasar fallos» tras el reto del día.** Arranca otro reto con la configuración guardada y puede dejar la pantalla sin salida.
3. **A9. La sincronización deja de subir con mucho progreso.** Todos los PUT van con `keepalive`, que el navegador limita a 64 KiB. Afecta justo a quien más juega.
4. **A3. `/api/sync` guarda cualquier JSON.** Hay que validar la forma en el servidor y medir el tamaño en bytes. Hoy alguien podría llenar Neon y agotar el cupo de códigos de todos.
5. **A5 y A6. Contraste en el tema nocturno (el de serie).** Los rótulos de acierto y fallo, texto blanco sobre verde, ámbar o rojo claro, no se leen.
6. **A10. Rankings diarios antiguos.** Salen en la lista pero dan error al abrirlos.
7. **A4. Ficha de los satélites de navegación.** Sale lejos de su icono.
8. **Legal, de una sentada:** A12 (base legal de la sincronización y Neon como encargado), A13 (aviso a menores al publicar en el ranking), A15 y A19 (créditos que faltan) y A18 (licencias MIT en el JavaScript publicado). La revisión profesional de los textos legales sigue pendiente, como dice `AGENTS.md`.

El resto son mejoras de accesibilidad, traducciones, documentación desfasada y casos límite, cada uno con su arreglo propuesto.

## Lo que no cubre

- **Navegador y móvil reales:** no se usó ninguno, así que el contraste se ha medido con los colores del CSS, no en pantalla.
- **Contenedor de Google Tag Manager:** no se pudo ver qué etiquetas dispara.
- **Lighthouse en producción:** no se pasó.
- **Revisión nativa de las traducciones:** sigue pendiente.
- **Datos:** se señalan solo errores claros, no una revisión fila a fila.

## Hallazgos confirmados

| Gravedad | Cuántos |
|---|---|
| Crítico | 0 |
| Alto | 2 |
| Medio | 8 |
| Bajo | 71 |
| Información | 15 |

### Alto

#### A1. El progreso de «Geografía física» se borra en cada recarga (y del servidor si hay sincronización)

- **Dónde:** [src/game/progress.ts:48](../src/game/progress.ts:48)
- **Visto por:** calidad y CI, juego y estado, seguridad (verificadores a favor: 3/3, 3/3, 3/3)
- **Evidencia:** const ENTITY_ID = /^([A-Z]{3}|[A-Z]{2}-[A-Z0-9]{1,3})$/; … if (!ENTITY_ID.test(country) …) continue; — los 314 ids preguntables de public/data/fisico/atlas.json («lago-baikal», «cordillera-alps»…) no casan. Prueba: record({}, 'lago-baikal','locate','first') → guardado {"lago-baikal":{…}} → sanitizeProgress(...) = {}
- **Impacto:** store.ts:248 pasa todo lo leído del navegador y lo bajado del servidor por sanitizeProgress. Quien juega al mapa de geografía física pierde al recargar las cajas de Leitner, la repetición espaciada y el mapa de Progreso. Con código de sincronización, tras recargar el PUT sube el progreso ya sin esas fichas y desaparecen también del servidor
- **Arreglo:** Aceptar también los ids del mapa físico, p. ej. /^([A-Z]{3}|[A-Z]{2}-[A-Z0-9]{1,3}|[a-z]+(-[a-z0-9]+)+)$/ (comprobado: casa con los 314), y añadir a game.test.ts un caso con un id de fisico

#### A2. «Repasar fallos» después del reto del día juega otro reto y otra zona, y puede dejar la pantalla vacía sin salida

- **Dónde:** [src/app/store.ts:570](../src/app/store.ts:570)
- **Visto por:** juego y estado (verificadores a favor: 3/3)
- **Evidencia:** start(only) usa `const { config: chosen, lists } = useSettings.getState()` y `resolveScope(atlas, chosen.scope, lists)`, no la configuración de la partida que acaba de terminar (ResultsPanel.tsx:184 llama a start(toReview)). Simulado con la configuración por defecto (Europa, localizar): 2026-11-14, reto «climate» con 10 fallos → repaso de «locate» en Europa con 5 preguntas; 2026-11-15, reto «locate» → 0 preguntas, status 'finished'
- **Impacto:** Lo ven casi todos los que juegan el reto del día y pulsan el botón principal de resultados. El repaso pregunta otro reto, solo los fallos que caen en la zona elegida, y apunta el progreso en ese otro reto. Si no queda ninguno, la sesión nace terminada: PlayHud devuelve null, durante 'play' el logo está deshabilitado y la navegación oculta, así que solo sale recargando la página
- **Arreglo:** En start(only), partir de la configuración de la sesión anterior (`const base = only && get().session ? get().session.config : chosen`) y resolver la zona con ella. Además, no entrar en 'play' si createSession devuelve total 0

### Medio

#### A3. /api/sync guarda JSON arbitrario sin autenticar: cualquiera puede llenar Neon y bloquear la creación de códigos para todos

- **Dónde:** [api/sync.ts:88](../api/sync.ts:88), [api/sync.ts:51](../api/sync.ts:51)
- **Visto por:** privacidad y legal, seguridad (verificadores a favor: 3/3, 2/2)
- **Evidencia:** `const MAX_BYTES = 300_000; const MAX_NEW_PER_HOUR = 400;` (l. 26-27); `if (text.length > MAX_BYTES)` cuenta unidades UTF-16, no bytes (l. 54); `isData` acepta cualquier objeto (l. 63); `insert into progress_sync (code, data) values (${code}, ${JSON.stringify(body.data)}::jsonb)` (l. 88); el tope es global: `count(*) ... created_at > now() - interval '1 hour'` (l. 85-86). No hay límite por IP ni en el código ni en vercel.json.
- **Impacto:** Un script sin credenciales puede hacer 400 POST por hora con 300.000 caracteres CJK (unos 0,9 MB en UTF-8 por fila): del orden de cientos de MB por hora, que se conservan 365 días porque solo se borra lo que no se actualiza en un año. Si el plan de Neon tiene tope de almacenamiento, las escrituras empiezan a fallar para todos: tanto la sincronización como el ranking, que comparten base. Si no lo tiene, el coste sube. Además, esas 400 peticiones por hora agotan el cupo global, y cualquier usuario legítimo recibe un 429 al crear código.
- **Arreglo:** 1) En el servidor, validar y reducir `data` a la forma real (progress/bests/daily) antes de guardarlo. Hay que sacar `sanitizeProgress`/`cleanSaved` a un módulo puro, porque `progress.ts` importa `../i18n`. Rechazar el resto y poner un tope de entradas. 2) Medir el tamaño en bytes (`new TextEncoder().encode(text).length`).

#### A4. La ficha de un satélite de órbita alta (GPS, Galileo) aparece a 70–200 px de su icono por el tope de altura de place()

- **Dónde:** [src/engine/MapEngine.ts:1823](../src/engine/MapEngine.ts:1823)
- **Visto por:** motor gráfico, satélites y tiempo (verificadores a favor: 2/2, 2/2)
- **Evidencia:** place(): `rig.project(item.lon, item.lat, ALT.marker + Math.min(alt, rig.h * 0.5), this.screen, alt > 0)`. SatelliteCard: `<Tracked engine={engine} lon={card.now.lon} lat={card.now.lat} alt={card.now.altitudeKm / 6371}>`. Lo medí con el CameraRig real en vitest, desde el scratchpad: vista general a 1920×1000 con un panel de 480 px, h = 4,20, así que el tope queda en 2,10 radios.
- **Impacto:** Al pasar el ratón o tocar un satélite de navegación con la vista general, el icono se resalta y su órbita se dibuja, pero la ficha (una caja de 20 px centrada en el punto) sale en otra parte del cielo. Pasa siempre que la altura del satélite supera la mitad de la altura de la cámara. El tope se pensó para el Sol y la Luna, que con el globo formado ya van por placeFar.
- **Arreglo:** No aplicar el tope a los satélites. Por ejemplo, en place() usar `Math.min(alt, rig.h * 0.5)` solo cuando `item.alt > 10` (los astros fuera del globo formado) y `ALT.marker + alt` en el resto. Si el satélite queda detrás de la cámara, project() ya lo marca como no visible.

#### A5. Texto blanco sobre verde, ámbar y rojo claros en el tema nocturno (el de serie): rótulos de acierto y fallo ilegibles

- **Dónde:** [src/ui/MapCanvas.tsx:33](../src/ui/MapCanvas.tsx:33)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 3/3)
- **Evidencia:** TONE_CLASS = { ok: 'bg-ok text-white', help: 'bg-help text-white', bad: 'bg-bad text-white' } y PlayHud.tsx:166 "border-ok! bg-ok! text-white!". En el tema nocturno --ok #5ccb8d, --help #f1bd57 y --bad #f37e6b dan con blanco 2,02:1, 1,73:1 y 2,62:1. En el claro, el blanco sobre --help da 3,59:1 y sobre --ok 4,30:1. Todo es texto de 14 px en negrita y necesita 4,5:1.
- **Impacto:** Afecta a todo el que juega con el tema de serie (quien no ha elegido tema ve el nocturno). Son ilegibles el nombre del país que se acaba de acertar o de pulsar por error, que sale en el mapa como rótulo, y la opción correcta en las preguntas de elegir. Justo es la información con la que se aprende.
- **Arreglo:** Añadir un token --on-tone: #fff en el tema claro y #0d1520 en el nocturno (#0d1520 sobre los tres tonos da 9,07, 10,62 y 6,99:1), y usarlo en TONE_CLASS y en la opción acertada de PlayHud. En el tema claro, oscurecer el fondo de los rótulos 'help' (color-mix(in srgb, var(--help) 75%, black) ≈ #8f5e06 da 5,57:1 con blanco).

#### A6. Texto en --ink-faint por debajo de 4,5:1: avisos de privacidad, enlaces legales y fuentes

- **Dónde:** [src/index.css:20](../src/index.css:20)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** --ink-faint: #848b8c (tema claro) da 2,90:1 sobre --paper, 3,21:1 sobre --surface y 2,62:1 sobre --sunken. En el nocturno (#76828f) da 4,10:1 sobre --surface. Se usa para texto pequeño en HomePanel.tsx:297 (enlaces Aviso legal, Privacidad y Cookies a 11 px), ProgressPanel.tsx:93 y SyncOffer.tsx:66 («Quien tenga el código puede ver y cambiar este progreso»), MapControls.tsx:210-228 (fuentes de las capas), Ranking.tsx:62 y 137, RankingPanel.tsx:102, PlanetDialog.tsx:354, RealTime.tsx:294-295 y en…
- **Impacto:** Con el tema claro, todos estos textos quedan por debajo del mínimo de WCAG 1.4.3. Con el nocturno, los que van sobre --surface (menú de capas, tarjetas de sincronización, ranking y ventana del planeta) también. Entre ellos están los enlaces legales y el aviso de que el código da acceso al progreso.
- **Arreglo:** --ink-faint: #5f6667 en el tema claro (4,89 sobre papel y 5,43 sobre surface) y #86919e en el nocturno (5,73 y 5,02). Para lo que va sobre --sunken, usar --ink-soft.

#### A7. La tarjeta de «Tiempo real» es role="status" y lleva un reloj: el lector de pantalla la lee entera cada minuto

- **Dónde:** [src/ui/RealTime.tsx:249](../src/ui/RealTime.tsx:249)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** <motion.div … role="status"> envuelve el botón con clock.format(now), y now = useNow(15_000). role=status implica aria-live=polite y aria-atomic=true. realTime viene encendido de serie (store.ts:129, realTime: true).
- **Impacto:** Fuera de la partida, a todo usuario de lector de pantalla se le interrumpe cada minuto con la tarjeta completa: hora, fecha, «Donde estás es de día…» y «Usar mi ubicación exacta». También mientras estudia en Explorar o en Progreso.
- **Arreglo:** Quitar role="status" de la tarjeta. Si se quiere anunciar algo, que sea solo el resultado de pedir la ubicación (denied o unavailable), en un <p role="status"> aparte.

#### A8. El manifiesto de la PWA es uno solo, en español, con start_url "/", y lo enlazan todas las portadas de idioma

- **Dónde:** [public/manifest.webmanifest:2](../public/manifest.webmanifest:2), [public/manifest.webmanifest:6](../public/manifest.webmanifest:6)
- **Visto por:** rendimiento, SEO y PWA, traducciones (verificadores a favor: 2/2, 2/2)
- **Evidencia:** manifest: "name": "Study World Map · Aprende los países del mundo", "lang": "es", "start_url": "/". index.html:40 <link rel="manifest" href="/manifest.webmanifest" /> y build-pages.mjs:804-819 no lo sustituye en los pares de reemplazo. En producción, GET /en/ devuelve <html lang="en"> … <link rel="manifest" href="/manifest.webmanifest" /> y ese manifiesto viene en español.
- **Impacto:** Quien instala la app desde /en/, /fr/, /zh/… ve el nombre y la descripción en español. Además, como el idioma sale de la ruta (pathLang), la app instalada siempre arranca en «/»: en español, sea cual sea la portada desde la que se instaló.
- **Arreglo:** Generar en build-pages.mjs un /<idioma>/manifest.webmanifest con name, description y lang traducidos, start_url y scope «/<idioma>/», y añadir a `pairs` el cambio del href del <link rel="manifest">.

#### A9. Con un progreso de más de 64 KiB la sincronización deja de subir nada: todos los PUT van con keepalive, y el navegador rechaza esos cuerpos

- **Dónde:** [src/app/sync.ts:64](../src/app/sync.ts:64)
- **Visto por:** crítico de cobertura (verificadores a favor: 3/3)
- **Evidencia:** `keepalive: method === 'PUT',` en request(), que usa syncNow() en cada subida (línea 111: `request('PUT', { code, data: local() })`). La norma Fetch (HTTP-network-or-cache fetch) devuelve un error de red si un cuerpo keepalive, sumado a los que ya están en vuelo, pasa de 64 KiB. Medido en el scratchpad, con fichas como las de progress.ts: 197 países × 4 retos = 48.531 B; × 5 = 59.760 B; × 9 = 108.222 B. Con 197 × 5 más las 52 provincias × 3 retos se pasa de 65.536 B.
- **Impacto:** Afecta justo a quien más ha jugado y tiene código de sincronización. El POST de createCode no lleva keepalive, así que el código se crea bien con todo el progreso. A partir de ahí, cada PUT (tras cada respuesta, al cambiar de pestaña y al abrir la web) falla con TypeError, el estado pasa a 'offline' y la tarjeta dice para siempre «Sin conexión: se sincronizará cuando vuelva». Lo guardado en el servidor se queda en la foto del momento de crear el código. Lo que se aprenda en un ordenador compartido o con almacenamiento que se borra se pierde, aunque el usuario crea que está sincronizado.
- **Arreglo:** Usar keepalive solo en la subida al ocultar la pestaña y solo si cabe. Por ejemplo, serializar una vez (`const text = JSON.stringify(body)`) y pasar `keepalive: method === 'PUT' && text.length < 60_000`. Las subidas normales no necesitan keepalive.

#### A10. Los rankings del reto del día de hace más de dos días salen en la lista pero no se pueden abrir (la API responde 400)

- **Dónde:** [api/ranking.ts:72](../api/ranking.ts:72)
- **Visto por:** crítico de cobertura (verificadores a favor: 2/2)
- **Evidencia:** En GET, `if (!isCategory(category)) return fail(400, 'categoría no válida')`, e isCategory solo admite 'dia/' con `Math.abs(day - now) < 2 * 86_400_000` (src/game/ranking.ts:53). En cambio, boardsOf devuelve todas las categorías, las diarias se guardan 45 días (KEEP_DAILY_DAYS) y RankingPanel.tsx:74 enseña «los tres últimos» retos del día. En producción, el 14-nov a las 10:01 UTC: `?c=dia/2026-11-14` → 200, `dia/2026-11-12` → 200, `dia/2026-11-11` → 400.
- **Impacto:** En la pantalla Ranking del mapa del mundo, al abrir el tercer reto del día (o el segundo y el tercero, si no hubo partidas en días seguidos) sale «No se ha podido cargar el ranking.». Lo guardado durante 45 días no se puede leer en la web.
- **Arreglo:** Aplicar la ventana de ±2 días solo al publicar (POST). En la lectura basta con aceptar cualquier 'dia/AAAA-MM-DD' con formato válido. Otra opción: que RankingPanel solo muestre los diarios dentro de la ventana.

### Bajo

#### A11. /api/tiempo y /api/satelites se pueden invocar sin límite saltándose la caché: llamadas a NOAA, NASA y CelesTrak a voluntad

- **Dónde:** [api/tiempo.ts:52](../api/tiempo.ts:52)
- **Visto por:** calidad y CI, seguridad (verificadores a favor: 2/2, 2/2)
- **Evidencia:** `isRainTime` solo exige la forma ISO y una fecha válida (src/weather/format.ts:53), así que cualquier segundo de cualquier año genera una clave de caché distinta, y cada fallo de caché pide una tesela a GIBS (model.ts:159). Ningún endpoint rechaza parámetros desconocidos: `?capa=modelo&x=N` o `?grupo=starlink&x=N` es una entrada nueva para la CDN, que usa la URL con su query como clave.
- **Impacto:** Un bucle con parámetros variables convierte cada petición en una invocación de la función con descargas de terceros: coste de CPU, memoria y tráfico en Vercel. La política de CelesTrak, citada en el propio fichero, pide no descargar más de una vez por renovación, así que puede bloquear la IP de salida de la función y dejar la capa de satélites caída para todos. Además el 502 se cachea 10 minutos. La pausa de 30 minutos no lo evita porque es por instancia. Si NOAA o NASA se cuelgan, la función espera hasta su duración máxima.
- **Arreglo:** Rechazar con 400 cualquier parámetro distinto de los esperados (`capa,t,x,y` y `grupo`). Exigir que `t` caiga en :00 o :30 y esté dentro de las últimas ~72 h, sin fecha futura. Añadir `signal: AbortSignal.timeout(20_000)` a los fetch de src/weather/model.ts. Opcionalmente, una regla de rate limiting por IP en /api/* desde el firewall de Vercel.

#### A12. La política de privacidad no da base legal para la sincronización ni para el alojamiento, y no identifica a Neon como encargado ni sus transferencias

- **Dónde:** [scripts/data/legales.mjs:97](../scripts/data/legales.mjs:97)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** Las secciones «Seguir en otro dispositivo» (líneas 97-100) y «Alojamiento» (131-132) no tienen «Base legal», a diferencia de Ranking (105) y Analítica (119). Línea 99: «La base de datos está en la Unión Europea (Fráncfort), en el servicio Neon» sin rol (encargado) ni garantías de transferencia; Vercel solo «con las garantías del RGPD para las transferencias internacionales».
- **Impacto:** Incumple el art. 13.1.c, e y f del RGPD (base jurídica, destinatarios y transferencias) para los dos tratamientos que se hacen sin consentimiento de cookies. AGENTS.md lo tiene como pendiente («bases legales… transferencias de Neon y Vercel»), pero sigue publicado así en producción (comprobado en /privacidad/, revisión del 13-nov-2026).
- **Arreglo:** Añadir «Base legal» a sync (consentimiento al pulsar «Crear mi código», 6.1.a) y al alojamiento (interés legítimo, 6.1.f); nombrar a Neon Inc. como encargado, con datos en Fráncfort, e indicar el mecanismo de transferencia (DPF y cláusulas tipo) de Neon y Vercel.

#### A13. Al publicar en el ranking no se avisa a los menores de 14 años ni se enlaza la privacidad, aunque la política exige que decida un adulto

- **Dónde:** [src/ui/Ranking.tsx:117](../src/ui/Ranking.tsx:117)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** Ranking.tsx:117-119 solo dice «No pongas tu nombre… Se publicará con tu nota, tu tiempo y la bandera del país…». legales.mjs:135: «Si tienes menos de 14 años, pide a tu madre, a tu padre… que decida… si puedes publicar tus resultados en el ranking (art. 7 LOPDGDD)». El aviso de menores solo está en el banner de cookies (consent.js:163-174).
- **Impacto:** La base legal del ranking es el consentimiento (legales.mjs:105), pero quien publica (una web para estudiantes) no recibe el aviso de edad ni la información del art. 13 (no hay enlace a /privacidad/) en el momento de dar ese consentimiento. Quien rechazó las cookies no ha visto nunca el aviso de menores.
- **Arreglo:** Añadir al texto del formulario «Si tienes menos de 14 años, pide permiso a un adulto antes de publicar» y un enlace a /privacidad/ (texto nuevo en los nueve diccionarios).

#### A14. Las páginas de privacidad, cookies y aviso legal solo existen en español, aunque la aplicación se ofrece en nueve idiomas más

- **Dónde:** [scripts/build-pages.mjs:9](../scripts/build-pages.mjs:9)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** build-pages.mjs:9 «public/aviso-legal/, privacidad/, cookies/, donar/ textos de scripts/data/legales.mjs (solo en español)»; consent.js:80 «More about cookies (in Spanish)», y lo mismo en fr/de/it/pt/ca/gl/eu/zh. HomePanel.tsx:301 enlaza /privacidad/ desde todos los idiomas.
- **Impacto:** A quien usa la web en inglés, francés, alemán, chino, etc. (con hreflang y portada propios) no se le informa en un idioma que entienda. Eso choca con el art. 12 del RGPD y con las directrices de transparencia del CEPD (WP260, §13: traducir cuando se dirige a hablantes de esos idiomas). El consentimiento a la analítica y al ranking de esos usuarios queda peor informado.
- **Arreglo:** Generar al menos un resumen por capas de privacidad y cookies en cada idioma (/en/privacy/…) con el texto completo en español enlazado, igual que se hace con las demás páginas de idiomas.

#### A15. La Vía Láctea (NASA SVS «Deep Star Maps 2020», con Gaia DR2 de ESA/Gaia/DPAC) no se acredita en ninguna parte

- **Dónde:** [scripts/data/legales.mjs:67](../scripts/data/legales.mjs:67)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** legales.mjs:67 solo «Estrellas: Yale Bright Star Catalogue… y catálogo Hipparcos». La cabecera del generador (build-milkyway.py:3-4) dice «Fuente: NASA/Goddard Space Flight Center Scientific Visualization Studio, «Deep Star Maps 2020»…, hecho con Gaia DR2 (ESA/Gaia/DPAC)». Buscando en src/ y scripts/data/ no hay ningún crédito visible; solo un comentario en shaders.ts:915.
- **Impacto:** La imagen public/data/milkyway.webp se distribuye a todos los visitantes sin la atribución que piden NASA SVS y ESA para los productos de Gaia (licencia con atribución obligatoria). Es la única fuente gráfica del proyecto sin crédito en el aviso legal ni en la aplicación.
- **Arreglo:** Añadir en legales.mjs una línea: «Vía Láctea: NASA/Goddard Space Flight Center Scientific Visualization Studio, Deep Star Maps 2020; Gaia DR2: ESA/Gaia/DPAC».

#### A16. El código de sincronización del enlace QR (?codigo=) sigue en la dirección mientras GTM ya se está cargando: puede llegar a Google Analytics

- **Dónde:** [src/main.tsx:7](../src/main.tsx:7)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** index.html:42 carga consent.js (defer), que se ejecuta antes que el módulo y llama a loadGtm() si hay 'granted' (consent.js:225). main.tsx solo llama a initSync(), que quita ?codigo= (sync.ts:185-189), después de await initI18n() y de los import() dinámicos (main.tsx:7-18). La política (legales.mjs:99) solo dice que el código queda en la dirección para el alojamiento.
- **Impacto:** En un dispositivo que ya aceptó la analítica, o si se pulsa «Aceptar» antes de que carguen los chunks, el page_view de GA4 puede llevar page_location con el código, que funciona como contraseña del progreso. Google lo recibiría sin que la política lo diga. Es una carrera que no he reproducido.
- **Arreglo:** Leer y quitar ?codigo= al principio de consent.js (guardándolo en sessionStorage para initSync) antes de cargar GTM, o pasar el código en el fragmento (#codigo=) y quitarlo igual.

#### A17. La elección de cookies no caduca nunca: una aceptación vale indefinidamente

- **Dónde:** [public/consent.js:22](../public/consent.js:22)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** save(value) guarda solo 'granted'/'denied' en swm:consent, sin fecha (22-28). Al cargar, si es 'granted' se carga GTM sin más (225). La política de cookies (legales.mjs:170) dice «Hasta que la borres».
- **Impacto:** La guía de cookies de la AEPD recomienda que el consentimiento no dure más de 24 meses. Aquí GA se sigue cargando y renovando _ga años después de la aceptación.
- **Arreglo:** Guardar la fecha junto a la elección (p. ej. 'granted:<ms>') y volver a mostrar el aviso pasados 24 meses; ajustar la duración en la tabla de cookies.

#### A18. El JavaScript publicado no incluye ningún aviso de licencia de las librerías MIT, y las banderas de flag-icons se sirven sin su licencia

- **Dónde:** [scripts/data/legales.mjs:61](../scripts/data/legales.mjs:61)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** `grep -c "@license\|Copyright\|MIT License" dist/assets/*.js` da 0 en todos los ficheros (build del 13-nov, último commit), aunque node_modules/react-dom/cjs/react-dom-client.production.js empieza por «@license React… MIT». Dependencias de cliente: react, react-dom, three, zustand, motion, satellite.js, qrcode-generator, flag-icons (MIT) y earcut (ISC). legales.mjs:61/63 solo enlaza satellite.js y flag-icons. public/flags (237 ficheros) no trae LICENSE.
- **Impacto:** La licencia MIT exige incluir el aviso de copyright y de permiso en las copias distribuidas, y servir el bundle lo es. Es un incumplimiento técnico de licencias, aunque de riesgo práctico bajo.
- **Arreglo:** Publicar un /licencias.txt (o una sección en el aviso legal) con los avisos de las dependencias que llegan al navegador y de flag-icons, o conservar los comentarios legales en el build.

#### A19. El aviso legal omite fuentes de datos que la aplicación usa y que sí acredita en otros sitios: OSCAR, PB2002/Ahlenius (ODC-By), volcanes NOAA NCEI y Banco Mundial (CC BY 4.0)

- **Dónde:** [scripts/data/legales.mjs:51](../scripts/data/legales.mjs:51)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** legales.mjs:51 «Los datos de terceros se usan conforme a sus licencias:» y luego una lista sin estas fuentes. Sí aparecen en la tabla de AGENTS.md y en leyendas de capa: MapControls.tsx:210 «Fuente: Banco Mundial», :213 «Placas: P. Bird (2003), vía H. Ahlenius. Volcanes: NOAA.», MapCanvas.tsx:464 «(OSCAR)». build-tectonics.py:6 indica «licencia Open Data Commons Attribution (ODC-By 1.0)».
- **Impacto:** Los créditos solo se ven con la capa encendida, y en el caso del Banco Mundial sin la licencia. El inventario legal del sitio queda incompleto frente a la regla del proyecto («si se añade un servicio externo, va a legales.mjs»), y public/data/tectonica.json se redistribuye sin el aviso ODC-By.
- **Arreglo:** Añadir a la lista de legales.mjs: corrientes OSCAR (Earth & Space Research, vía NOAA CoastWatch ERDDAP); placas PB2002 de P. Bird (2003), conversión de H. Ahlenius (ODC-By 1.0); volcanes NOAA NCEI (dominio público); población Banco Mundial SP.POP.TOTL (CC BY 4.0).

#### A20. La migración v2 (descartar el reto «Población» antiguo) se deshace en la primera sincronización

- **Dónde:** [src/app/store.ts:267](../src/app/store.ts:267)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** migrate (l. 301-307) quita 'population' de progress y las marcas 'population/…', pero absorb → cleanSaved → sanitizeProgress las conserva (MODE_IDS incluye 'population'). La carga de /api/sync no lleva versión. Prueba: mergeProgress({ESP:{locate}}, sanitizeProgress({ESP:{locate, population:{box:5,…}}})) → vuelve ESP.population
- **Impacto:** Afecta a quien tenía código de sincronización y jugó «Población» antes del 12-nov (o a cualquier dispositivo que siga en la versión antigua por el service worker). Reaparecen en el reto nuevo las cajas y marcas de la pregunta antigua (densidad): el progreso sale falso y las preguntas se sortean con esos pesos
- **Arreglo:** Incluir una versión en local() y, al absorber datos sin versión o con versión menor que 2, aplicar el mismo filtro que migrate (en cleanSaved o en absorb) a progress y a bests

#### A21. Banderas de Indonesia y Mónaco indistinguibles en el reto de banderas en el mapa (por defecto, y en el reto del día)

- **Dónde:** [src/game/session.ts:375](../src/game/session.ts:375)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** Para banderas solo vale `answer.index === question.country` (la equivalencia solo existe para capitales: sameCapital). public/flags/id.svg y mc.svg son los dos rojo arriba (#e70011 / #f31830) y blanco abajo con la misma geometría, y Flag (primitives.tsx:7) los pinta a 4:3 con object-cover, así que se borra la única diferencia real, la proporción. MCO e IDN son kind 'country' y están los dos en 'mundo'
- **Impacto:** En «Banderas · En el mapa» con una zona que tenga los dos países (Mundo, y por tanto el reto del día de banderas, que usa 'map'), la pregunta tiene dos respuestas visualmente correctas y solo se acepta una. Quita puntos y afecta al ranking
- **Arreglo:** Una tabla pequeña de banderas equivalentes (como sameCapital) que acepte cualquiera de las dos en el mapa y no las ponga juntas como opciones, o no preguntar una de ellas en el reto de banderas cuando las dos están en el conjunto

#### A22. «Borrar mi progreso» no se mantiene con la sincronización: otro dispositivo o una sincronización en curso lo restauran

- **Dónde:** [src/app/sync.ts:113](../src/app/sync.ts:113)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** mergeProgress (progress.ts:75) no tiene marcas de borrado: lo que tenga el otro dispositivo vuelve en su próxima sincronización. Además, si se borra mientras syncNow espera al PUT, la línea 113 `replaceRemote = false` anula el replaceRemote=true que acaba de poner el subscribe. Si se borra mientras espera al GET, absorb vuelve a meter lo bajado antes del PUT
- **Impacto:** Con dos dispositivos sincronizados, el progreso y las marcas borrados reaparecen. El comentario de la l. 72 («lo de este dispositivo sustituye a lo guardado») promete otra cosa, y el usuario no se entera de que no se ha borrado
- **Arreglo:** Guardar en el progreso sincronizado una marca `resetAt` por mapa y descartar al mezclar las fichas con last < resetAt. Para la carrera: capturar replaceRemote al empezar syncNow y ponerlo a false solo si no cambió durante la petición

#### A23. Capitales «buscando en el mapa»: la misma capital se pregunta dos veces y la segunda basta con repetir el clic

- **Dónde:** [src/game/session.ts:231](../src/game/session.ts:231)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** askableOf solo filtra namesItsCapital si answer !== 'map'. Con answer 'map' entran las dos unidades con la misma capital, y submit acepta cualquiera de ellas (l. 375). Simulación en cz (partida completa): capitales repetidas ['Praga']. Pasa también con Sofía, Minsk, Zagreb, Budapest, Oslo, Bucarest y Kiev
- **Impacto:** En 8 mapas de país, una partida completa repite la pregunta «¿De qué … es la capital X?» y la segunda vez es un punto regalado (y una ficha de progreso para una unidad que no se ha localizado)
- **Arreglo:** En askableOf para capital+map, dejar una sola unidad por capital (p. ej. la que no se llama como ella), o quitar los duplicados de la cola en createSession

#### A24. La pista de las respuestas escritas no separa las palabras

- **Dónde:** [src/game/text.ts:76](../src/game/text.ts:76)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** .replace(/ {3}/g, ' ') sustituye tres espacios ASCII por tres espacios ASCII (no hace nada). PlayHud.tsx:239 pinta la pista en un <span> sin white-space: pre, así que «E l _ _ _ _ _» se ve «E l _ _ _ _ _»
- **Impacto:** En nombres de varias palabras (Costa Rica, Buenos Aires, El Cairo…) la pista sugiere una sola palabra y despista justo después de un fallo
- **Arreglo:** Sustituir por un espacio que no se colapse (' ' o ' ') o añadir whitespace-pre al span de la pista

#### A25. Habitantes: países que nunca se pueden preguntar cuentan en el total del progreso

- **Dónde:** [src/game/progress.ts:142](../src/game/progress.ts:142)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** summarize recibe scope.countries (HomePanel.tsx:102-129, ProgressPanel.tsx:152-160), pero askableOf('inhabitants') excluye a quien no tiene 3 países claramente menos poblados. Calculado: mundo 197 en el total y 193 preguntables (VAT, NRU, PLW, TUV); Europa 50/46 (LIE, MCO, SMR, VAT); Oceanía 14/11; Sudamérica 12/9 (GUY, SUR, URY)
- **Impacto:** «Dominas n de 197» y la barra de dominio del reto Habitantes nunca llegan al 100 %, y esos países salen siempre como «Sin practicar» en el mapa de progreso
- **Arreglo:** Resumir sobre askableOf(atlas, {mode, answer}, scope.countries) (o sobre la unión de las formas de responder) en lugar de sobre todos los países de la zona

#### A26. El artículo elidido no se quita: en italiano «Avana» se marca como fallo para «L'Avana»

- **Dónde:** [src/game/text.ts:16](../src/game/text.ts:16)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** La regex de artículos solo quita palabras completas (el|la|…|il|lo) seguidas de espacio. «L'Avana» se normaliza a «l avana». Prueba: matchesAnswer('Avana', ["L'Avana"]) = false, mientras matchesAnswer('Libano', ['El Líbano']) = true. En catalán se tapó con el alias «Havana»; names.it.json CUB no tiene alias
- **Impacto:** Un alumno que juega en italiano y escribe la capital de Cuba sin el artículo pierde el intento. Incoherente con el trato a «El Líbano»
- **Arreglo:** Quitar también los artículos elididos al principio (p. ej. /^(l|d) /, ya que el apóstrofo se convierte en espacio) o añadir el alias «Avana» en los datos

#### A27. Giro automático de la portada: durante los 2 minutos de espera tras tocar el globo, el motor sigue dibujando a la frecuencia de la pantalla sin que nada se mueva

- **Dónde:** [src/engine/MapEngine.ts:2236](../src/engine/MapEngine.ts:2236)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** stepCamera: `if (this.autoRotate && this.mode === 'globe' && this.settled && !this.drag) { if (now > this.idleUntil) rig.lon = wrapLon(...); return true; }` y en tick: `if (busyCamera || busyState || flying) { this.raf = requestAnimationFrame(this.tick); ... }`. Además IDLE_AFTER_TOUCH = 120_000, y onPointerDown, la rueda, zoomBy y el teclado fijan idleUntil = now + 120 s.
- **Impacto:** En la portada del mapa del mundo (setAutoRotate(screen === 'home' && !atlas.frame)), cada clic, toque, rueda o tecla deja el globo quieto 2 minutos, pero el bucle pide requestAnimationFrame en cada fotograma (60–120 fps) y redibuja una imagen idéntica en vez de parar o bajar a 10 fps. Gasta CPU, GPU y batería en móviles y portátiles en la pantalla que más se visita.
- **Arreglo:** Devolver true solo cuando el globo gira. Mientras espera, devolver `busy` y programar un único `setTimeout(() => this.invalidate(), this.idleUntil - now)` (y limpiarlo en dispose), para que el giro se reanude solo.

#### A28. Si el script del hilo de la malla falla al cargar, takeMesh nunca termina y el mapa no aparece, sin pasar a construirla en el hilo principal

- **Dónde:** [src/atlas/meshAsync.ts:10](../src/atlas/meshAsync.ts:10)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** El hilo se crea al cargar el módulo (`worker = new Worker(new URL('./meshWorker.ts', import.meta.url), { type: 'module' })`), y store.ts:4 lo importa al arrancar. El listener de 'error' solo se añade dentro de inWorker, en cada petición (líneas 37-38), y la petición llega después, con el atlas (store.ts:523).
- **Impacto:** Si falla la red solo al descargar el chunk del hilo (móvil con mala cobertura, un bloqueo puntual), MapCanvas no llega a crear el motor: el lienzo se queda con opacidad 0 y `failed` nunca se activa. El usuario ve la aplicación sin mapa y sin ningún aviso.
- **Arreglo:** Al crear el hilo, añadir un listener permanente: `worker.addEventListener('error', () => { worker = null; })`. Así inWorker rechaza y warmMesh pasa a buildMesh. También sirve un timeout en inWorker que haga lo mismo.

#### A29. El sombreador de la lámina del tiempo, lleno de ruido e invisible, se compila antes del primer fotograma

- **Dónde:** [src/engine/MapEngine.ts:543](../src/engine/MapEngine.ts:543)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** `this.weather = new Mesh(ocean, this.material(WEATHER_VERT, WEATHER_FRAG, ...)); this.weather.visible = false; this.add(this.weather, 4, false);` se añade antes de `this.renderer.compileAsync(this.scene, this.rig.camera).then(ready, ready)` (línea 614), y `compiled` bloquea tick hasta que termina. En three r187, compile() recorre los materiales con `scene.traverse` y no con traverseVisible (three.module.js:17287), así que también compila los objetos ocultos.
- **Impacto:** Todos los usuarios esperan, antes de ver el mapa, a que compile un sombreador que solo usan las capas del tiempo, apagadas por defecto. Contradice la regla de AGENTS.md de no meter ruido en lo que retrasa el primer fotograma. No lo he medido (sin navegador).
- **Arreglo:** No añadir la lámina a la escena hasta que se encienda alguna capa del tiempo, o hacerlo después de que resuelva la compilación inicial, y compilarla con `compileAsync(this.weather, camera, this.scene)` como hace fullOcean().

#### A30. Si cambia devicePixelRatio sin cambiar el tamaño CSS, el lienzo conserva la resolución anterior

- **Dónde:** [src/engine/MapEngine.ts:2414](../src/engine/MapEngine.ts:2414)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** resize(): `if (width === this.rig.width && height === this.rig.height) return;` va antes de `this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))` (línea 2419). Solo se llama desde un ResizeObserver del tamaño CSS del lienzo (601-602). No hay ningún listener de devicePixelRatio en src/: solo aparece en las líneas 467 y 2419 y en Celebration.tsx.
- **Impacto:** Al llevar la ventana de una pantalla con un factor de escala a otra (portátil y monitor externo), el mapa se ve borroso en la de más densidad, o en la de menos dibuja hasta 4 veces los píxeles necesarios, hasta que cambie el tamaño de la ventana.
- **Arreglo:** En resize(), salir pronto solo si coinciden también el ancho, el alto y el pixelRatio. Además, escuchar `matchMedia(`(resolution: ${devicePixelRatio}dppx)`)` (volviendo a suscribirse en cada cambio) o observar 'device-pixel-content-box', y llamar a resize().

#### A31. Los sombreadores del interior del planeta, los que más ruido llevan, se compilan en el hilo principal al abrir el gajo

- **Dónde:** [src/engine/MapEngine.ts:1052](../src/engine/MapEngine.ts:1052)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** setPlanetView('interior') crea `this.cutFaces = new Mesh(geometry, this.material(CUT_VERT, CUT_FRAG, ...))` y `this.core = new Mesh(..., this.material(CORE_VERT, CORE_FRAG, ...))` y los dibuja en el fotograma siguiente sin compileAsync, cuando para el océano completo sí se usa (fullOcean). CUT_FRAG llama a fbm() 9 veces y a noise() 2 veces: 38 ruidos en línea (shaders.ts:797-839).
- **Impacto:** La primera vez que alguien abre «El planeta por dentro», la página se congela mientras el navegador compila esos programas en el hilo principal, justo cuando arranca el vuelo de la cámara. No lo he medido.
- **Arreglo:** Compilar antes de mostrarlo: `this.renderer.compileAsync(this.cutFaces, this.rig.camera, this.scene)` y lo mismo con el núcleo, dejándolos ocultos (uCut = 0) hasta que resuelva, como hace fullOcean().

#### A32. Durante la partida el lector de pantalla no anuncia la pregunta; al pasar a la siguiente solo dice «intentos»

- **Dónde:** [src/ui/PlayHud.tsx:349](../src/ui/PlayHud.tsx:349)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** La única región viva es <span aria-live="polite">{resolved ? <Solution/> : <span>…{session.wrong.length ? t('Casi… prueba otra vez') : t('intentos')}</span>}</span>. La pregunta (Prompt, líneas 86-100) no es región viva y el foco no se mueve. El sello (líneas 388-396) no se anuncia. Del segundo fallo en adelante el texto no cambia, así que no se vuelve a leer. El nombre del país pulsado por error solo sale en un rótulo visual (store.ts:621, addLabel; MapCanvas.tsx:131).
- **Impacto:** En cada pregunta nueva, el usuario de lector de pantalla (en los modos de elegir o escribir, que podría jugar) oye «intentos» en vez de la pregunta. Tampoco se entera de qué país eligió mal, de que ha vuelto a fallar ni de si ha acertado a la primera o con ayuda. Incumple WCAG 4.1.3 (Mensajes de estado).
- **Arreglo:** Poner un <p className="sr-only" aria-live="polite"> propio del marcador. Al cambiar de pregunta escribe «{position}/{total}. {label}: {main}». En cada fallo, «No: {país}. Te quedan {n} intentos», con una clave que cambie para forzar la lectura. Al resolverse, «{stamp.text}. {solución}». Quitar aria-live del contador de intentos. Los textos nuevos van a los nueve diccionarios.

#### A33. El foco del teclado se pierde al responder y al cambiar de pantalla

- **Dónde:** [src/ui/PlayHud.tsx:162](../src/ui/PlayHud.tsx:162)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** Las opciones llevan disabled={resolved || wrong}, así que la opción enfocada se desactiva y el foco cae a <body>. «Siguiente» lleva autoFocus (línea 413): le quita el foco al lienzo, y al desmontarse con next() el foco vuelve a <body>. Al pasar de pantalla (go/start/finish, con AnimatePresence en App.tsx:94) se desmonta el botón pulsado y ningún panel enfoca nada. El único .focus() del código es el del campo de respuesta (PlayHud.tsx:199).
- **Impacto:** Quien juega con teclado o lector de pantalla vuelve al principio del documento tras cada fallo con opciones, tras cada «Siguiente» y al empezar o terminar una partida. No se entera de que ha llegado a la pantalla de resultados, con la nota. Incumple WCAG 2.4.3 (Orden del foco).
- **Arreglo:** En las opciones falladas, aria-disabled y no hacer nada al pulsar, en vez de disabled. Antes de enfocar «Siguiente», guardar document.activeElement y devolverle el foco tras next(); con opciones, enfocar la primera de la pregunta nueva. En Panel, enfocar al montarse el h1 con tabIndex={-1}, o el propio aside.

#### A34. Las fichas de las corrientes, del Sol y de la Luna solo se ven con el ratón y desaparecen al ir a leerlas

- **Dónde:** [src/index.css:790](../src/index.css:790)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** .sky-marker:hover .sky-tip { opacity: 1 } con .sky-tip { pointer-events: none } (línea 755). SkyMarker es un <div role="img"> sin tabIndex. La ficha de la corriente se abre con pointerover sobre .feature-label[data-id] (MapCanvas.tsx:288-305), dentro de un contenedor aria-hidden (labels.ts:32), y es un role="tooltip" con pointer-events-none (MapCanvas.tsx:437).
- **Impacto:** Con teclado no se puede abrir ninguna de estas fichas (dirección y velocidad de cada corriente, distancias y datos del Sol y de la Luna), y no salen en ningún otro sitio: incumple WCAG 2.1.1. Con ratón, la ficha no se puede señalar sin que se cierre ni cerrar con Escape: incumple 1.4.13.
- **Arreglo:** Hacer los marcadores y los rótulos con ficha enfocables (button o tabIndex=0 con aria-describedby a la ficha) y mostrar la ficha también con :focus-visible. Dejar que la ficha reciba el puntero (quitar pointer-events:none o abrirla al hacer clic) y cerrarla con Escape.

#### A35. En un móvil en horizontal, la tarjeta de la pregunta y el panel de respuestas se pisan

- **Dónde:** [src/ui/PlayHud.tsx:303](../src/ui/PlayHud.tsx:303)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** La tarjeta va en "fixed … top-16" y mide unos 150 px (contando relleno, la fila del reto, la pregunta en display de 1,75 rem y la fila de intentos), así que acaba hacia los 217 px. El panel de respuestas (línea 405) va en "fixed bottom-4 … flex-col gap-2": 2×min-h-13 + gap + min-h-12 ≈ 168 px más 16 px de margen. No hay ninguna media query de altura en PlayHud.
- **Impacto:** Con unos 400 px de alto útil o menos (casi cualquier móvil en horizontal con la barra del navegador), las respuestas tapan la fila de intentos y de la solución, y en parte la pregunta. Al responder en el mapa quedan unos 60-80 px de mapa para buscar el país.
- **Arreglo:** Con @media (max-height: 30rem), compactar: tarjeta en top-2, sin la fila del reto y con la pregunta a 1,25 rem, y opciones en una sola fila (grid-cols-4). Otra opción es llevar el panel de respuestas a un lateral cuando la pantalla es más ancha que alta.

#### A36. La hoja de capas del móvil es role="dialog" pero no mueve ni retiene el foco

- **Dónde:** [src/ui/MapControls.tsx:268](../src/ui/MapControls.tsx:268)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** createPortal(<div className="fixed inset-0 z-50">… <div role="dialog" aria-label={t('Capas del mapa')}>), sin aria-modal, sin focus() al abrir y sin devolver el foco al cerrar. Cerrar con el botón «Cerrar» desmonta el portal con el foco dentro, y el foco cae a <body>.
- **Impacto:** En el móvil con lector de pantalla o teclado, la hoja se abre al final del documento sin que se anuncie. El foco sigue en el botón de capas, por debajo del velo, y con Tab se recorre el resto de la página antes de llegar a ella. Incumple WCAG 2.4.3 y el patrón de diálogo modal.
- **Arreglo:** Hacerla con <dialog> y showModal(), como PlanetDialog: atrapa el foco, cierra con Escape, deja inerte el fondo y devuelve el foco. Si no, aria-modal="true", enfocar el h2 o «Cerrar» al abrir y devolver el foco al botón al cerrar.

#### A37. viewport-fit=cover sin ningún env(safe-area-inset-*): la muesca y la barra de inicio tapan controles

- **Dónde:** [index.html:5](../index.html:5)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** <meta name="viewport" content="…, viewport-fit=cover" /> y ni src/ ni index.html contienen env( ni safe-area (búsqueda vacía). La cabecera usa px-3/py-3, el pie de la hoja inferior bottom-0 con py-3 y el panel de respuestas bottom-4. El manifiesto declara "display": "standalone".
- **Impacto:** En un iPhone con muesca en horizontal, el logotipo y el borde izquierdo de la hoja quedan bajo la muesca. Con la web instalada en vertical, «Empezar», «Siguiente» y «No lo sé» caen sobre la zona del gesto de inicio, de unos 34 px, y un toque ahí puede cerrar la app.
- **Arreglo:** Añadir padding con env(safe-area-inset-top/left/right) en la cabecera, env(safe-area-inset-bottom) en .panel y en el pie fijo, y bottom: calc(1rem + env(safe-area-inset-bottom)) en el panel de respuestas y en MapControls. O quitar viewport-fit=cover si no se busca el efecto.

#### A38. En el tema claro, los textos de acierto, ayuda, fallo y acento no llegan a 4,5:1

- **Dónde:** [src/ui/PlayHud.tsx:21](../src/ui/PlayHud.tsx:21)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** Sello '¡Bien!' en text-ok sobre bg-surface: 3,99:1. 'Con ayuda' en text-help: 3,33:1 (text-lg con peso 800 son 13,5 pt, no cuenta como texto grande). La etiqueta «Repaso» (línea 326, text-help sobre bg-help-soft): 2,93:1. Opción fallada (línea 168, text-bad sobre bad-soft): 3,91:1. Racha en text-accent (línea 368): 4,11:1.
- **Impacto:** Quien elige el tema claro lee con poco contraste la respuesta del juego y varias etiquetas pequeñas. El sello, además, lleva una máscara de «tinta irregular» que le quita trazo a las letras.
- **Arreglo:** Para texto en el tema claro, una variante oscura de cada tono: color-mix(in srgb, var(--ok) 80%, black) da 5,74:1 sobre surface, el de --help al 70% 5,98:1 y el de --accent al 85% 5,35:1. Los fondos y los puntos de color se quedan como están.

#### A39. Durante la partida, Escape cierra el menú abierto y a la vez abre «¿Salir de la partida?»; el menú de descarga no se cierra con Escape

- **Dónde:** [src/ui/PlayHud.tsx:269](../src/ui/PlayHud.tsx:269)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** PlayHud: window keydown con if (e.key === 'Escape') { setQuitting((q) => !q); return; }. LayersMenu (MapControls.tsx:126) y MoreMenu (TopBar.tsx:98) escuchan también Escape en window y ninguno llama a stopPropagation. ExportMenu (líneas 32-39) solo escucha pointerdown.
- **Impacto:** Con el menú de capas (o el menú «más» del móvil) abierto en una partida, Escape lo cierra y además cambia la cabecera a la confirmación de salida. El menú de descarga solo se cierra con el ratón o volviendo a pulsar su botón.
- **Arreglo:** En los menús, cerrar y llamar a e.stopImmediatePropagation(), escuchando en captura, o que PlayHud ignore Escape si hay un menú abierto (e.defaultPrevented tras e.preventDefault() en el menú). Añadir Escape a ExportMenu.

#### A40. Los bordes de los campos de texto y el interruptor apagado no llegan a 3:1 (contraste de elementos no textuales)

- **Dónde:** [src/index.css:22](../src/index.css:22)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** --rule-strong es rgb(27 42 58 / 0.34). Sobre --surface sale a 2,00:1 en el tema claro y a 2,73:1 en el nocturno. Es el único contorno de los campos (PlayHud.tsx:232, ExplorePanel.tsx:205, ListsPanel.tsx:154, MapPicker.tsx:45, Ranking.tsx:99), y el fondo del campo (surface) frente al del panel (paper) da 1,11:1. El botón del interruptor apagado (after:bg-ink-faint sobre bg-paper, MapControls.tsx:145) da 2,90:1 en el tema claro.
- **Impacto:** Quien ve poco no distingue bien dónde está el campo de búsqueda o el de respuesta, ni si un interruptor está apagado con el tema claro. Incumple WCAG 1.4.11.
- **Arreglo:** Usar un borde más marcado solo en los campos, p. ej. rgb(27 42 58 / 0.55), que da 3,43:1 en el tema claro (y algo más de opacidad en el nocturno). El botón del interruptor, con el --ink-faint corregido.

#### A41. La ventana «El planeta» no tiene nombre accesible y sus pestañas y grupos de opciones no siguen el patrón ARIA

- **Dónde:** [src/ui/PlanetDialog.tsx:263](../src/ui/PlanetDialog.tsx:263)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** <dialog ref={ref} …> sin aria-labelledby, aunque el h2 está dentro. <div role="tablist"> con <button role="tab" aria-selected>, pero sin aria-controls, sin role="tabpanel" y sin manejo de flechas. Lo mismo en los role="radiogroup" (Segmented, TopBar.tsx:219, ScopeChips): cada radio es una parada de Tab y las flechas no hacen nada.
- **Impacto:** El lector de pantalla anuncia «diálogo» sin decir cuál. Anuncia «pestaña 1 de 2», pero las flechas, que es lo que se espera, no cambian de pestaña.
- **Arreglo:** aria-labelledby con un id en el h2. Para las pestañas: role="tabpanel" con aria-labelledby, aria-controls, y cambio con flechas e índice de tabulación móvil. Si no se quiere eso, quitar los roles tab/tablist y dejarlas como botones con aria-pressed.

#### A42. Nombres accesibles que no casan con lo que se ve: botón de idioma y lienzo del mapa

- **Dónde:** [src/ui/TopBar.tsx:65](../src/ui/TopBar.tsx:65)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** El botón de idioma muestra «ES» ({lang} en mayúsculas) y su aria-label es «Idioma: Español». El lienzo (MapCanvas.tsx:402) se llama siempre «Mapa del mundo interactivo…», también en los mapas de España, de los demás países y de geografía física.
- **Impacto:** Quien maneja la web por voz no puede activar el botón diciendo lo que ve (WCAG 2.5.3, Etiqueta en el nombre). El lector de pantalla dice «mapa del mundo» estando en el de un país.
- **Arreglo:** aria-label={`${lang.toUpperCase()} · ${t('Idioma')}: ${LANGS[lang]}`}, o quitar el aria-label y dejar el title. El aria-label del lienzo, con el título del mapa (def.title).

#### A43. La sacudida del campo de respuesta no respeta «reducir movimiento»

- **Dónde:** [src/ui/PlayHud.tsx:207](../src/ui/PlayHud.tsx:207)
- **Visto por:** interfaz y accesibilidad (verificadores a favor: 2/2)
- **Evidencia:** rowRef.current?.animate([0, -7, 6, -4, 3, 0].map(…), { duration: 360 }). La API de animaciones del navegador no la frenan ni la regla CSS de prefers-reduced-motion (index.css:848) ni MotionConfig reducedMotion="user", y aquí no se consulta useReducedMotion().
- **Impacto:** Quien ha pedido reducir el movimiento ve igualmente el campo sacudirse en cada fallo al escribir. Contradice la decisión del proyecto de respetar esa preferencia (App.tsx:78).
- **Arreglo:** const reduced = useReducedMotion(); y no animar si reduced es true (el campo ya se vacía, que basta como señal).

#### A44. La superficie de Serbia incluye Kosovo, que además tiene su propia superficie

- **Dónde:** [scripts/build-atlas.mjs:447](../scripts/build-atlas.mjs:447)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** `areaKm2: Math.round(wcByIso3.get(codigo)?.area ?? 0) || undefined` toma la superficie de world-countries. Resultado en public/data/atlas.json: SRB = 88 361 km² (con Kosovo) y XKX = 10 908 km². En cambio, la población de SRB del Banco Mundial (6 549 143) es sin Kosovo, y XKX tiene la suya (1 576 876).
- **Impacto:** La ficha y la página de Serbia dan una superficie que cuenta Kosovo dos veces. La densidad sale en unos 74 hab/km² cuando son unos 84,5 (77 474 km² sin Kosovo). Afecta también a las clasificaciones por superficie y por densidad.
- **Arreglo:** Para SRB, usar la superficie sin Kosovo: un campo de superficie en scripts/data/paises.mjs que tenga prioridad sobre world-countries, con su fuente, o restar en build-atlas la superficie de XKX a la de SRB. Comentar el motivo.

#### A45. El Vaticano se queda sin superficie porque el redondeo convierte 0,44 km² en undefined

- **Dónde:** [scripts/build-atlas.mjs:447](../scripts/build-atlas.mjs:447)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** world-countries da al Vaticano `area: 0.44`. `Math.round(0.44)` da 0, y `0 || undefined` deja `areaKm2` en undefined. scripts/build-pages.mjs:368 lo atribuye a la fuente («al Vaticano le falta en la fuente»), pero la fuente sí trae el dato.
- **Impacto:** El país más pequeño del mundo aparece sin superficie en su ficha y en su página. Las páginas estáticas renuncian a decir cuál es el país más pequeño (build-pages.mjs:368).
- **Arreglo:** No redondear a entero por debajo de 10 km², p. ej. `const a = wc?.area; areaKm2: a ? (a < 10 ? red(a, 2) : Math.round(a)) : undefined`. Antes, comprobar que quien formatea `areaKm2` admite decimales, y corregir el comentario de build-pages.mjs:368.

#### A46. Altitudes y nombres de Natural Earth sin corregir en geografía física (Monte Stanley, Everest, «Cero Raya»)

- **Dónde:** [scripts/data/fisico-correcciones.json:724](../scripts/data/fisico-correcciones.json:724)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** fisico-correcciones.json corrige Aoraki (L724), Denali (L731), Teide y Olimpo, pero no estos tres, que public/data/fisico.json conserva tal como vienen de Natural Earth: (1) Monte Stanley, 4979 m; la cifra aceptada es 5109 m. (2) Everest, 8848 m; está en el temario, y la medición oficial conjunta de China y Nepal de 2020 da 8848,86 m. (3) pico-cerro-la-raya, de rank 2, se rotula «Cero Raya» en es, fr, de, it y pt.
- **Impacto:** El mapa físico enseña una altitud errónea (Stanley, unos 130 m de menos) y otra desfasada en un pico del temario (Everest), y rotula un nombre con errata. Va en contra de la regla del proyecto: «todo dato que ve un estudiante tiene que ser real y tener fuente».
- **Arreglo:** Añadir tres entradas a fisico-correcciones.json con su `why` y su fuente: elev 5109 para Stanley, elev 8849 para el Everest (o el valor que se decida mostrar de la medición de 2020) y el nombre corregido de Cerro La Raya en los idiomas afectados.

#### A47. La FAQ promete aceptar La Haya como capital de los Países Bajos, pero no está entre los alias

- **Dónde:** [scripts/data/idiomas/es.mjs:55](../scripts/data/idiomas/es.mjs:55)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** La FAQ dice «En el juego se acepta cualquiera de ellas al escribir la respuesta» y nombra a los Países Bajos (también en en.mjs:54). Sin embargo, NLD en scripts/data/paises.mjs:63-66 solo tiene `nota`, sin `capAlias: ['La Haya']`, y ningún names.<idioma>.json trae `ca` para NLD.
- **Impacto:** Quien escribe «La Haya» (o «The Hague») en el reto de capitales recibe un fallo, aunque la página de ayuda dice que vale.
- **Arreglo:** Añadir `capAlias: ['La Haya']` a NLD en paises.mjs y su equivalente en cada scripts/data/idiomas/<idioma>.mjs (The Hague, La Haye, Den Haag, L'Aia, Haia, L'Haia, A Haia, Haga, 海牙), o quitar los Países Bajos de la FAQ.

#### A48. Los alias de capital de Israel, Palestina y Kazajistán solo valen en español

- **Dónde:** [scripts/build-atlas.mjs:568](../scripts/build-atlas.mjs:568)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** Los demás idiomas toman los alias con `entry.ca = extra.capAlias`, que solo sale de idiomas/<idioma>.mjs. En español, paises.mjs define capAlias para ISR (['Tel Aviv']), PSE (['Ramallah','Jerusalén Este']) y KAZ (['Nursultán','Nur-Sultán']), pero los otros ocho idiomas no los definen.
- **Impacto:** La misma respuesta («Tel Aviv», «Ramallah», «Nur-Sultan») es correcta en español y fallo en inglés, francés y el resto. La nota cambia según el idioma, y el ranking es común a todos.
- **Arreglo:** Añadir esos capAlias en los ocho scripts/data/idiomas/<idioma>.mjs, o que build-atlas avise cuando un país tiene capitalAliases en español y no en otro idioma.

#### A49. En el mapa de Croacia, el chino muestra en letras latinas dos capitales (Zagreb y Gospić)

- **Dónde:** [scripts/data/mapas/hr.mjs:59](../scripts/data/mapas/hr.mjs:59)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** `zh: { provincias: { 'HR-21': { nombre: '萨格勒布市' }, 'HR-01': { nombre: '萨格勒布县' } } }` corrige solo nombres. public/data/hr/names.zh.json conserva las capitales de HR-21 («Zagreb») y HR-09 («Gospić») en alfabeto latino; las demás están en caracteres chinos.
- **Impacto:** En chino, el reto de capitales de Croacia mezcla escrituras: esas dos preguntas o respuestas salen en latín.
- **Arreglo:** Añadir en `correcciones.zh` la capital en caracteres chinos de HR-21 (萨格勒布) y de HR-09 (戈斯皮奇), con la misma clave de capital que use build-maps para las correcciones.

#### A50. La página de población pone a todos los países el año del primero

- **Dónde:** [scripts/build-pages.mjs:635](../scripts/build-pages.mjs:635)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** `const year = poblados[0].populationYear;`. En build-atlas.mjs:455 el año cambia por país: 2025 para el Banco Mundial, 2026 para Taiwán y 2024 para el Vaticano (poblacion.extra.json, Wikidata).
- **Impacto:** La tabla de población atribuye a Taiwán y al Vaticano el año de otro dato. Es un error pequeño, pero la página dice datar el dato y no lo hace bien.
- **Arreglo:** Indicar el año en las filas cuyo `populationYear` no coincide con el general, o anotarlo al pie: «Taiwán, 2026; Vaticano, 2024 (Wikidata)».

#### A51. En el índice de juegos, los encabezados por continente usan la forma con preposición o genitivo (de, it, eu, en)

- **Dónde:** [scripts/build-pages.mjs:762](../scripts/build-pages.mjs:762)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** `<h2>${esc(z.name)}</h2>` con z.name = T.zonas[z.id]; it.mjs:15 zonas: 'd’Europa', 'dell’Asia'…; de.mjs:15 'Europas', 'Asiens'…; eu.mjs:17 'Europako'…; en.mjs:14 'the Americas'. En producción, /it/gioco/ tiene <h2>d’Europa</h2><h2>dell’Asia</h2> y /de/spiel/ tiene <h2>Europas</h2><h2>Asiens</h2>.
- **Impacto:** En las páginas índice de juegos (indexables) de alemán, italiano y euskera, los títulos de sección salen mal construidos («d’Europa», «Asiens», «Europako»). En inglés aparece «the Americas» en minúscula como encabezado.
- **Arreglo:** Usar para el encabezado el nombre del continente en nominativo, el de `continents` de worldIn(lang) que ya está a mano en la línea 745 (hoy se descarta con `void continents`), o añadir a cada idioma un campo `zonasTitulo`.

#### A52. La frase de solución del mundo pega el nombre de la región sin artículo: «Es Cuba, en Caribe.» / «It is Cuba, in Caribbean.»

- **Dónde:** [src/game/maps.ts:360](../src/game/maps.ts:360)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** solution: t('Es {country}, en {region}.'), y PlayHud.tsx:145 lo rellena con atlas.regions[...].name = «Caribe» (es), «Caribbean» (en), «Caribe» (gl): en.ts:109 'It is {country}, in {region}.', gl.ts:109 'É {country}, en {region}.'. 13 países tienen am-caribe como primera región. Igual con en.ts:106 '{country} is in {where}.' más el continente «The Americas» → «Brazil is in The Americas.»
- **Impacto:** En los retos Localizar, Nombrar y Coordenadas del mapa del mundo, la solución de los 13 países caribeños queda mal escrita en español (la lengua principal), en inglés y en gallego. En el reto Continentes en inglés, los 35 países de América muestran «The» con mayúscula en mitad de la frase.
- **Arreglo:** Hacer como los demás diccionarios: 'Es {country} ({region}).' en es/en/gl, o poner el nombre de la región con su artículo en un campo aparte. En inglés, para el continente dentro de frase, «the Americas».

#### A53. La página 404 está solo en español y se sirve para cualquier ruta inexistente de cualquier idioma

- **Dónde:** [scripts/build-pages.mjs:775](../scripts/build-pages.mjs:775)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** writeFileSync('public/404.html', page({ path: '/404.html', title: 'Página no encontrada · Study World Map', … body: `<h1>Esta página no existe</h1>…` })) con el idioma por defecto 'es'. En producción, GET /en/game/does-not-exist/ → 404 con <html lang="es"> y <h1>Esta página no existe</h1>.
- **Impacto:** Quien llega a un enlace roto desde /en/, /de/, /zh/… ve una página en español, con enlaces solo a las páginas en español.
- **Arreglo:** Una 404 bilingüe o neutra con enlaces a la portada de cada idioma, o elegir en el navegador el texto según el primer tramo de location.pathname (como ya hace public/consent.js).

#### A54. Si falla la carga del atlas, la pantalla de error muestra un mensaje fijo en español o el del navegador

- **Dónde:** [src/atlas/atlas.ts:177](../src/atlas/atlas.ts:177)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** throw new Error(`No se pudo cargar el atlas (${res.status})`); store.ts:531 set({ error: e instanceof Error ? e.message : t('No se pudo cargar el mapa.') }); App.tsx:30 <p className="mt-2 text-ink-soft">{error}</p>. Un fallo de red lanza un TypeError («Failed to fetch», «Load failed»…) que también es Error, así que el t() de reserva no se usa nunca.
- **Impacto:** Con una caída o sin conexión, los usuarios de los otros nueve idiomas ven «No se pudo cargar el atlas (500)». Y todos, también en español, pueden ver el texto del navegador en inglés.
- **Arreglo:** Guardar en `error` siempre un texto traducido (t('No se pudo cargar el mapa.')) y dejar e.message solo para la consola.

#### A55. El hueco de la pregunta usa el «¿…?» español en todos los idiomas

- **Dónde:** [src/ui/PlayHud.tsx:51](../src/ui/PlayHud.tsx:51)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** main = resolved ? country.name : <span className="text-ink-faint">¿…?</span>; (también en la línea 69, reto Nombrar)
- **Impacto:** En inglés, francés, alemán, chino, etc., el marcador de los retos Nombrar y Habitantes enseña un signo de apertura que en esos idiomas no se usa.
- **Arreglo:** Pasarlo por t() (t('¿…?') con «…?» en los diccionarios que no lo usan) o poner un símbolo neutro como «…» o «?».

#### A56. Al editar la lista de ejemplo, el campo del nombre enseña la clave en español; los nombres de usuario también pasan por t()

- **Dónde:** [src/ui/ListsPanel.tsx:71](../src/ui/ListsPanel.tsx:71)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** onClick={() => setDraft({ ...list, countries: [...list.countries] })} y el input en la línea 133: value={draft.name}. SAMPLE_LIST.name = '50 países principales' (config.ts:158). En la lista: ListsPanel.tsx:44 {t(list.name)}, config.ts:181 label: t(list.name).
- **Impacto:** Un usuario en inglés pulsa «Edit» en «50 major countries» y el campo muestra «50 países principales». Además, si alguien llama a su lista «Europa» o «Mundo», en otro idioma se le muestra traducida («Europe», «World»), cosa que no ha escrito él.
- **Arreglo:** Al abrir el editor, rellenar el nombre con t(list.name) solo si es la lista de ejemplo (list.id === SAMPLE_LIST.id), y no pasar por t() los nombres de las demás listas.

#### A57. Chino: los tramos de población se dan en «百万», en contra de la regla del propio código (万/亿)

- **Dónde:** [src/i18n/zh.ts:323](../src/i18n/zh.ts:323)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** 'menos de {n} millones': '少于 {n} 百万', 'de {a} a {b} millones': '{a} 至 {b} 百万', 'más de {n} millones': '多于 {n} 百万' (con n = 40 y 100). RealTime.tsx:90 dice: «En chino no se cuenta en millones sino en 万 (diez mil) y 亿», y así lo hace allí.
- **Impacto:** Las opciones del reto Población en chino salen como «少于 40 百万», «40 至 100 百万», forma poco natural. Lo natural sería «少于 4000 万», «4000 万至 1 亿».
- **Arreglo:** Pasar el número ya formateado (como millions() en RealTime.tsx) o escribir en zh.ts las frases con 万/亿 a partir de {n}·100.

#### A58. Unidades y porcentajes con formato fijo, sin pasar por el idioma

- **Dónde:** [src/ui/SatelliteLabels.tsx:137](../src/ui/SatelliteLabels.tsx:137)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** [t('Altura'), `${integer.format(now.altitudeKm)} km`]; RealTime.tsx:86 const percent = (lit) => `${Math.round(lit * 100)} %`; time.ts:73 `${hours} h` / `${rest} min`. En el resto de la interfaz, el chino traduce '{n} km' → '{n} 千米' (zh.ts:407).
- **Impacto:** En la ficha de un satélite, en chino sale «km» mientras el resto de la interfaz dice «千米». El porcentaje sale «45 %» también en inglés y chino (lo habitual es «45%»), y la diferencia horaria sale «6 h 30 min» en todos los idiomas.
- **Arreglo:** Usar t('{n} km', …) también en SatelliteLabels y Intl.NumberFormat(LOCALE, { style: 'percent' }) para la fase lunar. Para horas y minutos, Intl.NumberFormat con style 'unit' (hour/minute).

#### A59. Sin conexión, la app no arranca tras una sola visita en los 9 idiomas que no son español (ni en un mapa de país abierto desde una página estática)

- **Dónde:** [public/sw.js:9](../public/sw.js:9)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** sw.js:9 `const PRECACHE = ['/', '/data/atlas.json'];` y el SW se registra en main.tsx:24 solo tras «load». En /en/ el `<link rel="preload" ... href="/data/names.en.json">` (dist/en/index.html:101) se descarga antes de que exista el SW, así que nunca entra en la caché `swm-v3`. Sin conexión, atlas.ts:206 `lang === 'es' ? null : getJson(`${dir}/names.${lang}.json`)` no lleva catch, y Promise.all rechaza.
- **Impacto:** Afecta a quien abre /en/, /fr/… (o un mapa de país desde Google) con conexión una sola vez y vuelve sin conexión pasada la caché HTTP (max-age 1 h + SWR 24 h). La SWR de sw.js no encuentra el fichero en la caché, el fetch falla y load() muestra el error «No se pudo cargar el mapa». La promesa de funcionar sin conexión solo se cumple en español con el mapa del mundo.
- **Arreglo:** En main.tsx, cuando el SW toma el control por primera vez, volver a pedir a través de él los /data/*.json ya cargados (llegan de la caché HTTP, sin coste de red): `navigator.serviceWorker.addEventListener('controllerchange', () => { for (const { name } of performance.getEntriesByType('resource')) if (new URL(name).pathname.startsWith('/data/') && name.endsWith('.json')) void fetch(name).catch(() => {}); }, { once: true });`.

#### A60. La Vía Láctea (1,46 MB) y stars.bin (338 KB br) se descargan y decodifican también en el mapa plano, donde el cielo no se dibuja

- **Dónde:** [src/engine/MapEngine.ts:1556](../src/engine/MapEngine.ts:1556)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** loadSky: `if (this.skyTexture.value || !this.showStars || this.palette.stars <= 0) return;` no mira la vista. store.ts:527 precarga `/data/milkyway.webp` con solo `layers.stars && theme === 'night'`. En cambio, SKY_FRAG (shaders.ts) multiplica el alfa por `smoothstep(0.7, 1.0, uMorph)`, que vale 0 en el plano, y `twinkling` (MapEngine.ts:2312) también exige `morph > 0.7`.
- **Impacto:** Quien tiene guardada la vista plana con el tema de noche y las estrellas (los dos vienen así de serie) baja unos 1,8 MB en la primera visita. En cada arranque decodifica y sube a la GPU una textura de 4096×2048 (unos 32 MB) que no se ve. En un móvil eso pesa en memoria y en datos.
- **Arreglo:** En loadSky, salir también si `this.rig.morph <= 0.7` y llamarlo de nuevo desde setMode/tick cuando el globo pase de 0.7. En store.ts:527, añadir `&& useSettings.getState().viewMode === 'globe'`.

#### A61. En las portadas que no son la española, el diccionario del idioma no se precarga y se descarga en cadena antes de pintar la app

- **Dónde:** [vite.config.ts:31](../vite.config.ts:31)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** preloadCritical solo añade los chunks App/MapCanvas, `names.${lang}.json` y las fuentes. dist/en/index.html (líneas 85-104) no tiene `en-CPHYP-L4.js`. main.tsx:7 hace `await initI18n();` antes de `import('./App')`, e initI18n hace `await loaders[`./${lang}.ts`]()`.
- **Impacto:** En los 9 idiomas, la petición del diccionario (12-16 KB br) solo empieza cuando main.js (66 KB br) ya se ha descargado y ejecutado: un viaje de ida y vuelta más antes del primer render de React. Hasta entonces la página queda en blanco, porque el texto estático tiene opacity 0 durante 2 s.
- **Arreglo:** En preloadCritical, si hay `lang`, añadir `<link rel="modulepreload" crossorigin href="/${chunk.fileName}">` para el chunk con `chunk.name === lang`.

#### A62. llms.txt dice cosas falsas o desfasadas: «no hay cuentas ni servidor», física «solo en español», «cinco retos»

- **Dónde:** [public/llms.txt:13](../public/llms.txt:13)
- **Visto por:** calidad y CI, rendimiento, SEO y PWA (verificadores a favor: 2/2, 2/2)
- **Evidencia:** Línea 13: «El progreso se guarda en el propio dispositivo: no hay cuentas ni servidor.» Pero api/sync.ts guarda el progreso en Neon cuando el usuario crea un código, y api/ranking.ts guarda apodo y país. Línea 33: «Geografía física, climas y población (solo en español)», cuando el sitemap trae esas páginas en los 10 idiomas (p. ej. dist/en/layers-of-the-earth/index.html). Línea 5: «Tiene cinco retos», cuando HomePanel.tsx:44-48 ofrece 10 modos.
- **Impacto:** Los asistentes de IA, que son el público de este fichero, reciben una descripción equivocada de qué datos salen del dispositivo y de qué contenidos hay en otros idiomas. Lo primero choca con lo que dicen los textos legales.
- **Arreglo:** Corregir esas tres frases: el progreso queda en el dispositivo y, solo si se crea un código, también en un servidor en la UE; el ranking es opcional; la física existe en todos los idiomas; hay 10 retos. De paso, citar los mapas de país además de España.

#### A63. El índice de juegos (/juego/, /en/game/…) repite la meta description de «países y capitales» en los 10 idiomas

- **Dónde:** [scripts/build-pages.mjs:758](../scripts/build-pages.mjs:758)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** La línea 758, `description: T.paises.description(nPaises)`, es la misma función que usa la línea 269 para /paises-y-capitales/. Al recorrer dist salen 10 pares duplicados, p. ej. «Lista completa de los 197 países del mundo y sus capitales…» en ['/juego/', '/paises-y-capitales/'].
- **Impacto:** Dos páginas distintas de cada idioma comparten snippet en el buscador. El hub de juegos queda descrito como la lista de capitales y puede competir con ella.
- **Arreglo:** Añadir en scripts/data/idiomas/<idioma>.mjs una description propia para el índice de juegos (p. ej. `T.juego.description`) y usarla en la línea 758.

#### A64. Los colores del manifest son los del tema claro, pero la app arranca de serie en el de noche

- **Dónde:** [public/manifest.webmanifest:9](../public/manifest.webmanifest:9)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** `"background_color": "#f1eadb"`, `"theme_color": "#f1eadb"`. En cambio, index.html:11 tiene `<meta name="theme-color" content="#0d1520" />` y el script de tema dice que «quien no ha elegido tema ve el de noche».
- **Impacto:** Al abrir la PWA instalada se ven la pantalla de bienvenida y la barra en crema claro y, al pintar la app, salta a azul noche: un destello en cada arranque para la mayoría de usuarios, que no cambian el tema.
- **Arreglo:** Poner `background_color` y `theme_color` a `#0d1520` en el manifest (y en los manifests por idioma, si se crean).

#### A65. La pausa ante errores de CelesTrak no se cumple: el 502 no se guarda en la red de Vercel y pausedUntil vive en cada instancia por separado

- **Dónde:** [api/satelites.ts:26](../api/satelites.ts:26)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** `const fail = (status, error) => json({ error }, status, status === 502 ? 'public, s-maxage=600' : 'no-store')`, con el comentario «Un fallo también se guarda un rato en la red de Vercel». Pero la documentación de Vercel (CDN cache, «Cacheable response criteria») dice que solo se guardan las respuestas con estado 200, 404, 410, 301, 302, 307 o 308, nunca un 502. `let pausedUntil = 0` (línea 21) es una variable del módulo, propia de cada instancia.
- **Impacto:** Mientras CelesTrak falle, cada visita que encienda la capa llega a la función. Cualquier instancia nueva u otra que no haya visto el error vuelve a preguntar a CelesTrak al momento. Eso contradice lo que promete AGENTS.md («la función se calla media hora tras un error»). CelesTrak bloquea las IP que siguen insistiendo, y la salida de Vercel es compartida: si la bloquean, la capa de satélites se queda sin datos para todo el mundo.
- **Arreglo:** Guardar la pausa y la última respuesta buena en un almacén compartido: la Runtime Cache de Vercel (dependencia nueva, @vercel/functions) o el Blob que ya se usa. Como mínimo: activar la pausa también en el catch (tiempo agotado, JSON inválido) y corregir el comentario, porque la cabecera s-maxage del 502 no tiene ningún efecto.

#### A66. Starlink se reconstruye entero en el hilo principal: unos 180 ms de bloqueo en un escritorio cada vez que se toca un interruptor o se renuevan los datos

- **Dónde:** [src/app/satellites.ts:224](../src/app/satellites.ts:224)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** El efecto depende de `[engine, key, showOrbits]` y cada vez llama a `build(wanted)`, que vuelve a crear con `orbit.satrecOf(row)` cada satrec (línea 90). Después, setSatellites hace `set.update(new Date(), …, 0, set.count)` (MapEngine.ts:1234). Medido en Node con los 11.191 Starlink que da hoy producción: json2satrec tarda 80–114 ms y la primera pasada completa de SGP4, 62 ms. Cada tanda de 1500 por fotograma tarda 1,7 ms. Todo va en el hilo principal.
- **Impacto:** Con Starlink encendido, encender o apagar «Órbitas» (que ni siquiera afecta a Starlink), cambiar cualquier grupo o la renovación cada seis horas (aunque los datos salgan de la caché `loaded`) congela la página unos 0,2 s en escritorio. En un móvil, varias veces más. El trabajo por fotograma en el móvil también puede costar fotogramas mientras se arrastra el globo.
- **Arreglo:** Guardar los satrec por grupo junto a las filas de `loaded`, para no volver a crearlos si los datos no han cambiado. Sacar `showOrbits` del efecto que construye el conjunto: un efecto aparte que solo llame a setSatelliteOrbits. Si hace falta más, propagar en un hilo aparte.

#### A67. Las capas del tiempo comparten un solo «failed»: si falla una fuente y la otra va bien, la leyenda se queda en «Cargando…»

- **Dónde:** [src/app/weather.ts:78](../src/app/weather.ts:78)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** Las dos llamadas a keepFresh, la del modelo y la de la lluvia, escriben en el mismo campo: `() => !stopped && useWeatherInfo.setState({ failed: false })` y `({ failed: true })`. Al apagar una capa, clear() tampoco lo pone a false. La leyenda (MapControls.tsx:55,70) muestra el aviso de error solo si `info.failed`, y si no, «Cargando el tiempo de ahora…» mientras `model && !info.model`.
- **Impacto:** Con la temperatura y la lluvia encendidas, si el modelo falla y la lluvia carga después, la leyenda dice «Cargando el tiempo de ahora…» durante 30 minutos, hasta el siguiente intento, en vez de avisar del fallo. Al revés también: un fallo antiguo hace que una capa que acaba de encenderse muestre el error mientras todavía está cargando.
- **Arreglo:** Separar el estado por fuente (`failedModel` y `failedRain`) y ponerlo a false en clear().

#### A68. Si falla un grupo de satélites recién encendido no se avisa, y no se reintenta hasta seis horas después

- **Dónde:** [src/ui/MapControls.tsx:96](../src/ui/MapControls.tsx:96)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** La leyenda muestra el error solo cuando `!info.fetched && !flat`. En satellites.ts:214, un fallo hace `useSatelliteInfo.setState({ failed: true })` pero deja `fetched` y `counts` como estaban, y build() cae entero por el Promise.all. El siguiente intento lo hace el setInterval de REFRESH, que son seis horas.
- **Impacto:** Si ya había satélites cargados y la petición del grupo nuevo falla (por ejemplo, Starlink), el interruptor queda encendido, siguen viéndose los de antes, la leyenda enseña la hora y el número antiguos, y no aparece ningún aviso.
- **Arreglo:** Enseñar el aviso siempre que `info.failed` sea true, y reintentar antes (por ejemplo, a los pocos minutos) tras un fallo.

#### A69. Con la capa encendida y todos sus grupos apagados, la leyenda dice «Cargando los satélites…» para siempre

- **Dónde:** [src/app/satellites.ts:198](../src/app/satellites.ts:198)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** Si no queda ningún grupo, el efecto hace `useSatelliteInfo.setState({ fetched: null, counts: {}, beyond: 0, failed: false })`. SatelliteLegend (MapControls.tsx:96) muestra entonces `<p role="status">Cargando los satélites…</p>` porque `!info.fetched && !flat`. setSatGroup (store.ts:142) deja apagar los cuatro grupos.
- **Impacto:** Aparece un mensaje de carga falso que, además, se anuncia a los lectores de pantalla (role=status).
- **Arreglo:** Pasar a la leyenda si hay algún grupo encendido y no enseñar «Cargando» cuando no hay ninguno, o no dejar apagar el último grupo.

#### A70. Con movimiento reducido, la ficha se aleja del icono, que no se mueve mientras el mapa está quieto

- **Dónde:** [src/engine/MapEngine.ts:2179](../src/engine/MapEngine.ts:2179)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** La animación en reposo a 10 fps exige `!this.reducedMotion`, así que con el mapa quieto stepSatellites no se ejecuta y el icono no se mueve. SatelliteCard, en cambio, se vuelve a dibujar cada segundo (`setInterval(() => tick(...), 1000)`, SatelliteLabels.tsx:99) con satNow(new Date()), y Tracked la recoloca directamente en el DOM.
- **Impacto:** Para quien tiene activado «reducir movimiento» en el sistema, al dejar el cursor quieto sobre la ISS la ficha avanza unos 460 km por minuto mientras el icono se queda donde estaba. Pasado un minuto, se separan unas decenas de píxeles. La leyenda dice «en su posición de ahora».
- **Arreglo:** Con movimiento reducido, que la ficha use la misma posición congelada que el icono (sin el tick de un segundo), o que el motor pida un fotograma al actualizar la ficha.

#### A71. La ficha de un satélite no se recoloca junto a los bordes de la pantalla y se corta, sobre todo en el móvil

- **Dónde:** [src/ui/SatelliteLabels.tsx:121](../src/ui/SatelliteLabels.tsx:121)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** La ficha reutiliza .sky-tip/.sky-card (index.css:741-768: `min-width: 15rem`, debajo del punto y centrada) pero no va dentro de SkyMarker. Es SkyMarker quien calcula `--shift` y `data-up` para que la ficha de un astro no se salga de la pantalla (RealTime.tsx:117-130).
- **Impacto:** En un móvil de 375 px, la ficha de un satélite que esté a menos de ~128 px de un lado se corta. Si está en la mitad de abajo, sus 8–9 filas se salen por abajo. Al tocar satélites en el móvil esto pasa a menudo.
- **Arreglo:** Aplicar el mismo cálculo de SkyMarker (`place`) a .sat-card cada vez que cambia su posición.

#### A72. packageManager fija pnpm 8.11.0, una rama que ya no recibe mantenimiento

- **Dónde:** [package.json:7](../package.json:7)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** "packageManager": "pnpm@8.11.0"; pnpm-lock.yaml: `lockfileVersion: '6.0'`; `pnpm --version` en el repo → 8.11.0 (el pnpm global se cambia a esa versión: npm avisa de `manage-package-manager-versions`). En el registro: latest-8 = 8.15.9, latest = 12.18.0. CI hereda la misma versión (ci.yml:13-14, action-setup sin `version`).
- **Impacto:** Local, CI y Vercel instalan con un gestor sin parches de seguridad, que además ejecuta los scripts de instalación de todas las dependencias. Desde pnpm 10 esos scripts están bloqueados por defecto. Cualquier dependencia transitiva comprometida ejecutaría código en CI y en el build de Vercel.
- **Arreglo:** Subir packageManager a la versión actual de pnpm (`corepack use pnpm@<actual>`), regenerar el lockfile (pasa a lockfileVersion 9) y declarar en pnpm-workspace.yaml solo los `onlyBuiltDependencies` que de verdad hagan falta.

#### A73. Las pruebas no frenan el despliegue a producción

- **Dónde:** [vercel.json:4](../vercel.json:4)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** "buildCommand": "pnpm build" (atlas + páginas + tsc + vite build, sin vitest). CI (.github/workflows/ci.yml) corre en `push: main` en paralelo al despliegue automático de Vercel. csp.test.ts avisa de lo que protege: «el navegador lo bloquea en producción sin avisar».
- **Impacto:** Un push a main con pruebas en rojo llega igual a producción: una huella CSP desfasada, claves que faltan en un diccionario o un fallo de lógica de juego que vitest sí detecta. CI solo lo avisa después. No he comprobado el panel de Vercel: si hay Deployment Checks configurados allí, este riesgo baja.
- **Arreglo:** `"buildCommand": "pnpm build && pnpm test"` en vercel.json, o activar en Vercel que el despliegue de producción espere al check de GitHub.

#### A74. El cliente acepta códigos que el servidor rechaza y responde «Comprueba la conexión»

- **Dónde:** [src/app/sync.ts:13](../src/app/sync.ts:13)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** Cliente: `const CODE = /^[A-Z0-9]{12}$/;`. Servidor (api/sync.ts:22-24): `ALPHABET = 'ABCDEFGHJKMNPQRSTWXYZ23456789'`, sin 0, O, 1, I, L, U ni V. En joinCode, un 400 cae en `if (remote.status !== 200) return t('No se ha podido leer ese código. Comprueba la conexión.')`.
- **Impacto:** Quien copia mal a mano un código, metiendo una O o un 0, recibe un mensaje de red en vez de «Ese código no es válido», que es justo el caso para el que se eligió el alfabeto.
- **Arreglo:** Usar en el cliente la misma regex que el servidor (llevar ALPHABET y CODE a un módulo compartido sin efectos, como src/game/ranking.ts) o tratar el 400 como código no válido.

#### A75. Las cuatro funciones de api/ no tienen pruebas

- **Dónde:** [vite.config.ts:90](../vite.config.ts:90)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** `include: ['src/**/*.test.ts']`. En api/ hay lógica propia sin prueba: cleanCode/newCode/readBody/MAX_BYTES (api/sync.ts), tileIndex (api/tiempo.ts:34), la validación y el borrado del ranking (api/ranking.ts:100-113) y la pausa tras un error de CelesTrak (api/satelites.ts:20-44). La lógica compartida (src/game/ranking.ts, src/weather/format.ts) sí se prueba.
- **Impacto:** Un cambio en la validación de entrada o en los límites contra abusos de una función pública solo se detecta a mano con db-init.mjs --probar, contra la base real.
- **Arreglo:** Pruebas que llamen a `handler.fetch(new Request(...))` con fetch y neon simulados para los caminos de validación (400, 405, 413 y 429).

#### A76. `pnpm atlas --audit` no pasa --audit a build-atlas.mjs

- **Dónde:** [README.md:107](../README.md:107)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** README: `pnpm atlas --audit # regenera el atlas y lista nombres y capitales frente a la fuente`. Script: `"atlas": "node scripts/build-atlas.mjs && node scripts/build-maps.mjs && node scripts/build-fisico.mjs"`. pnpm añade el argumento al final, así que llega a build-fisico.mjs, que no lo lee. Solo build-atlas.mjs:42 lo lee (`process.argv.includes('--audit')`).
- **Impacto:** La auditoría de nombres y capitales que documenta el README no se ejecuta nunca y no avisa de nada.
- **Arreglo:** Documentar `node scripts/build-atlas.mjs --audit` o añadir un script `"atlas:audit": "node scripts/build-atlas.mjs --audit"`.

#### A77. Afirmaciones desfasadas en README, AGENTS.md y comentarios

- **Dónde:** [README.md:128](../README.md:128)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** README.md:128 «No hay texturas ni teselas: los países son geometría vectorial», pero hay texturas (public/data/satellite.webp, relief.webp…) y teselas del Blob (MapEngine.ts:187 TILE_STORE). AGENTS.md:27 «pnpm atlas # solo regenera public/data (atlas del mundo, de España y de geografía física)», pero build-maps.mjs genera los 32 países. api/sync.ts:3 «Es la única función del proyecto.», pero hay cuatro.
- **Impacto:** Quien se guíe por la documentación tendrá una idea equivocada de cómo se dibuja el mapa y de qué regenera cada comando.
- **Arreglo:** Corregir esas tres frases.

#### A78. `db-init.mjs --probar` puede borrar resultados reales del ranking de producción

- **Dónde:** [scripts/db-init.mjs:89](../scripts/db-init.mjs:89)
- **Visto por:** crítico de cobertura (verificadores a favor: 2/2)
- **Evidencia:** Antes y después de la prueba hace `await sql\`delete from ranking where nick like 'Prueba %'\`` (líneas 89 y 114), y publica 'Prueba uno' (nota 10) y 'Prueba dos' (9,5) en 'fisico/name/type/fisico-tierras/all' contra la base real. La función, al insertar, poda para siempre lo que sale del top 10 (api/ranking.ts:110-112: `delete ... id not in (... limit ${TOP})`).
- **Impacto:** Si esa categoría tiene diez resultados reales, los dos últimos se borran sin remedio al entrar los de prueba, y al final se borran también los de prueba. Además se borra cualquier entrada real de cualquier categoría cuyo apodo empiece por «Prueba » («Prueba 1» es un apodo válido para cleanNick). AGENTS.md presenta el script como seguro («borra las filas de prueba»).
- **Arreglo:** Guardar los id de lo que se inserta y borrar solo esos. Antes de publicar, comprobar que la categoría tiene menos de 8 entradas, y abortar si no. Usar un apodo de prueba que cleanNick no admita para usuarios reales (o prefijo con cifras que no quepan).

#### A79. Ranking: quien publica desde Reunión, Guadalupe, Martinica, Guayana Francesa, Mayotte o Gibraltar aparece con una bandera rota (404)

- **Dónde:** [src/ui/primitives.tsx:11](../src/ui/primitives.tsx:11)
- **Visto por:** crítico de cobertura (verificadores a favor: 2/2)
- **Evidencia:** Flag pinta `src={`/flags/${a2}.svg`}` con el país de x-vercel-ip-country, que la API acepta con `/^[A-Za-z]{2}$/` (api/ranking.ts:105). En cambio, build-atlas.mjs:590 solo copia las banderas de los territorios del atlas. Comparado con flag-icons, faltan en public/flags: re, gp, mq, gf, yt, gi, bq, sj, cx, cc, tk, um, eu, un… En producción, /flags/re.svg y /flags/gi.svg → 404.
- **Impacto:** En las filas del ranking y en el resumen de RankingPanel de esos jugadores sale un recuadro vacío o una imagen rota en lugar de la bandera, y en cada vista se hace una petición que acaba en 404.
- **Arreglo:** Copiar todas las banderas 4x3 de flag-icons o, en Flag, ocultar la imagen con onError. También vale que la API guarde null si el código no tiene bandera.

#### A80. La nota se redondea hacia arriba y contradice el veredicto: «5» en rojo con «A repasar»

- **Dónde:** [src/app/format.ts:17](../src/app/format.ts:17)
- **Visto por:** crítico de cobertura (verificadores a favor: 2/2)
- **Evidencia:** `decimal.format(Math.round(grade * 10) / 10)`. En cambio, el color, el título, gradeLabel (session.ts:443) y MIN_GRADE del ranking usan la nota sin redondear. En el mundo «partida completa» (197 preguntas), 98 aciertos a la primera dan 98/197×10 = 4,9746, y formatGrade devuelve «5» (comprobado con Intl es-ES).
- **Impacto:** El sello enseña un 5 en rojo con «A repasar» y «Toca repasar», y el resultado no se puede publicar en el ranking aunque la nota mostrada sea un 5. Pasa lo mismo en el límite de cada calificación (6,96 → «7» con «Bien»; 8,96 → «9» con «Notable»).
- **Arreglo:** Para mostrar, truncar en vez de redondear: `Math.floor(grade * 10 + 1e-9) / 10`.

#### A81. La regla de escala no es exacta en el mapa plano: a 65°–70° de latitud se queda un 13–18 % corta

- **Dónde:** [src/engine/MapEngine.ts:2405](../src/engine/MapEngine.ts:2405)
- **Visto por:** crítico de cobertura (verificadores a favor: 2/2)
- **Evidencia:** `kmPerPixel: rig.worldPerPixel * 6371` da por hecho que una unidad del mundo es un radián (6371 km). En el mapa plano (Natural Earth, projection.ts:24) la escala vertical es dy/dφ, y he calculado: 1,007 en el ecuador, 0,919 a 60°, 0,885 a 65° y 0,847 a 70°. Es decir, cada km de la regla son 1,13 km reales a 65° y 1,18 km a 70°.
- **Impacto:** En el mapa plano de Noruega, Finlandia, Estonia o Escandinavia, la regla (que dice valer «en el centro de la vista») da distancias entre un 9 % y un 18 % menores que las reales. Es un dato erróneo que ve el estudiante. En el globo es correcta.
- **Arreglo:** Con morph < 1, dividir kmPerPixel por la derivada de la y de naturalEarth en la latitud del centro (o mezclarla según morph).

### Información

#### A82. El código de sincronización, que hace de contraseña, viaja en la URL, al contrario de lo que fija AGENTS.md

- **Dónde:** [src/app/sync.ts:51](../src/app/sync.ts:51)
- **Visto por:** seguridad (verificadores a favor: 2/2)
- **Evidencia:** `export const syncLink = (code) => `${location.origin}${homeOf(lang)}?codigo=${formatCode(code)}`` (enlace y QR de «Llevar a otro dispositivo»). Además api/sync.ts:73 sigue aceptando `new URL(request.url).searchParams.get('code')`. AGENTS.md: «El código de sincronización viaja en la cabecera X-Sync-Code, no en la dirección»; el comentario de sync.ts:59 lo justifica con «así no queda en los registros del alojamiento».
- **Impacto:** Cada vez que se abre el enlace compartido, el código llega a Vercel en la línea de la petición de navegación, aunque `initSync` lo quite después con replaceState. La API aún admite `?code=`. Quien lea esos registros puede leer, sobrescribir o borrar ese progreso. No contiene datos personales, por eso la gravedad es baja.
- **Arreglo:** Usar el fragmento (`#codigo=…`, que no sale del navegador) y leerlo de `location.hash` en `initSync`. Retirar el `?code=` de api/sync.ts:73 cuando ya no queden clientes antiguos.

#### A83. Los plazos de conservación declarados solo se aplican cuando alguien crea un código o entra en un ranking

- **Dónde:** [api/sync.ts:84](../api/sync.ts:84)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** sync.ts:84: el borrado de lo que lleva 365 días sin uso está solo en la rama POST. ranking.ts:113: el borrado de los «dia/%» de más de 45 días solo se ejecuta tras un insert que entra en el top. boardsOf (ranking.ts:54-59) devuelve también los retos del día caducados. legales.mjs:100 y 104 los presentan como hechos («se borra», «a los 45 días»).
- **Impacto:** En periodos sin códigos nuevos o sin resultados que entren, se guardan y se muestran públicamente (apodo, país, nota) datos más allá del plazo que promete la política.
- **Arreglo:** Filtrar los caducados en las lecturas (topOf/boardsOf con created_at > now() - 45 días para 'dia/%') y ejecutar también la purga de progress_sync en PUT, o con un cron de Vercel si se acepta una función más.

#### A84. Comentarios de las funciones que afirman más de lo que es cierto sobre la IP y el número de funciones

- **Dónde:** [api/ranking.ts:13](../api/ranking.ts:13)
- **Visto por:** privacidad y legal (verificadores a favor: 2/2)
- **Evidencia:** ranking.ts:13 «la dirección IP ni se guarda ni se anota en los registros», pero Vercel registra la IP de cada petición, como reconoce legales.mjs:99 y 132. sync.ts:3 «Es la única función del proyecto» (hay cuatro).
- **Impacto:** La cabecera de legales.mjs dice que sus textos están «comprobado[s] en el código». Si alguien redacta a partir de estos comentarios, puede acabar escribiendo en la política «no se registra la IP». El texto público de hoy es correcto.
- **Arreglo:** Corregir los comentarios: «la IP no se guarda en la base de datos; los registros de Vercel sí la contienen», y quitar «Es la única función».

#### A85. El ranking acepta categorías que no existen y un total que no corresponde a la longitud

- **Dónde:** [src/game/ranking.ts:58](../src/game/ranking.ts:58)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** isCategory comprueba ANSWERS.includes(answer) sin mirar si el reto tiene esa forma de responder ('world/locate/type/mundo/10' es válida), y plausible no liga total con la longitud: api/ranking.ts:93 solo exige total === 10 en 'dia/'. Un POST a '…/10' con total 1 y ms 600 pasa
- **Impacto:** Se pueden crear rankings imposibles, que salen en «Ranking» con un rótulo de forma de responder que no existe. Además, en las categorías de 10 y 20 preguntas el filtro «más rápido de lo que se tarda en leer» se salta declarando menos preguntas. Contradice lo que plausible dice evitar
- **Arreglo:** Añadir a RANKED (que ya es solo datos) las formas de responder de cada reto y comprobarlas, y en el POST exigir total === Number(length) cuando la longitud es 10 o 20

#### A86. Al cerrar la pestaña no se sube lo pendiente: el PUT con keepalive va detrás de un GET

- **Dónde:** [src/app/sync.ts:102](../src/app/sync.ts:102)
- **Visto por:** juego y estado (verificadores a favor: 2/2)
- **Evidencia:** visibilitychange → syncNow() hace primero `await request('GET', …)`, que no lleva keepalive, y solo después el PUT (keepalive: method === 'PUT'). Al cerrar la pestaña la página muere antes de que resuelva el GET
- **Impacto:** Las respuestas de los últimos segundos antes de cerrar (PUSH_DELAY 4 s) no llegan al servidor hasta que se vuelve a abrir la web en ese dispositivo. No se pierden, pero el otro dispositivo no las ve
- **Arreglo:** En hidden, mandar directamente un PUT con keepalive de local() (o un sendBeacon) sin esperar al GET, y dejar el ciclo GET+PUT para cuando la página vuelve a estar visible

#### A87. uTime vuelve a 0 cada hora y el oleaje, las vetas del viento y el interior del planeta saltan de golpe

- **Dónde:** [src/engine/MapEngine.ts:2149](../src/engine/MapEngine.ts:2149)
- **Visto por:** motor gráfico (verificadores a favor: 2/2)
- **Evidencia:** `this.own.ocean.uTime.value = (now / 1000) % 3600;`. Las funciones periódicas no saltan: carried() usa fract(uTime/9), y 3600/9 es exacto. Sí saltan: swell() suma `uTime * vec3(0.05, 0.035, 0.02)` (shaders.ts:259), que pasa de (180, 126, 72) a 0; gusts() usa `fract(uTime / 7.0)` (shaders.ts:1130), y como 3600/7 no es exacto, a pasa de 0,286 a 0 y cambian los pesos de la fundida; CUT_FRAG usa `spin = t * 0.22` y los desplazamientos `t * 0.10` (shaders.ts:804-806);
- **Impacto:** Con la página abierta más de una hora, cada hora el oleaje de cerca, las vetas del viento y el núcleo y el manto del interior cambian de dibujo de golpe. Es visual y menor; la precisión es suficiente porque three usa highp.
- **Arreglo:** Usar un módulo múltiplo de todos los periodos y mucho mayor, por ejemplo `% 25200` (múltiplo de 7 y de 9; en highp la resolución sigue siendo de unos 2 ms). Así no salta la fundida del viento y el resto salta 7 veces menos. Opcionalmente, cambiar 7.0 por 7.2 en gusts().

#### A88. La descarga de Natural Earth admin-1 no fija versión: los mapas de país no se pueden reproducir

- **Dónde:** [scripts/build-subdivisions.mjs:9](../scripts/build-subdivisions.mjs:9)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** La cabecera y la descarga apuntan a la última publicación de Natural Earth 10m admin-1, sin versión ni commit. El atlas del mundo, en cambio, va fijado (world-atlas 2.0.2 / NE v4.1.0, en el lockfile).
- **Impacto:** Si alguien vuelve a generar un mapa de país tras una publicación nueva de Natural Earth, pueden cambiar las fronteras o los códigos, o fallar la validación de L161-168, sin forma de volver a los datos de origen.
- **Arreglo:** Descargar de una etiqueta o commit concreto del repositorio de Natural Earth (p. ej. v5.1.2 en GitHub) y apuntar la versión en la cabecera.

#### A89. Scripts de descarga con referencias rotas y rutas relativas al directorio de trabajo

- **Dónde:** [scripts/fetch-capitals.mjs:3](../scripts/fetch-capitals.mjs:3)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** fetch-capitals.mjs:3 remite a «scripts/data/nombres.mjs», que no existe. Además, fetch-capitals.mjs:67, fetch-subdivisions.mjs:169 y build-stars.mjs:28 ('src/engine/stars.ts') escriben con rutas relativas al cwd, no a ROOT.
- **Impacto:** Si se ejecutan desde otro directorio, escriben en el sitio equivocado o fallan. Y la cabecera manda a un fichero que no existe, lo que estorba al volver a generar los datos.
- **Arreglo:** Resolver las salidas con `join(ROOT, …)` / `new URL('..', import.meta.url)`, como build-atlas, y corregir la referencia de la cabecera.

#### A90. La corrección de coordenadas de moment-timezone no cubre los valores entre −1° y 0°

- **Dónde:** [scripts/build-atlas.mjs:521](../scripts/build-atlas.mjs:521)
- **Visto por:** datos (verificadores a favor: 2/2)
- **Evidencia:** `const coordenada = (v) => red(v < 0 ? 2 * Math.floor(v) - v : v, 2);`. moment-timezone pierde el signo cuando los grados son −0, así que el valor llega positivo y la condición `v < 0` no lo corrige. Ejemplo: en zones, Europe/London sale con long 0.13 en vez de −0.13.
- **Impacto:** La ubicación aproximada que se deduce de la zona horaria queda desplazada unos 10-25 km en Londres, Acra y Quito (lat −0°13′). Apenas se nota.
- **Arreglo:** Calcular las coordenadas desde la cadena empaquetada de moment-timezone, o mantener una pequeña lista de excepciones (Europe/London, Africa/Accra, America/Guayaquil…) con su signo correcto.

#### A91. Catalán: formas incoativas centrales mezcladas con las valencianas que el proyecto dice usar

- **Dónde:** [src/i18n/ca.ts:49](../src/i18n/ca.ts:49)
- **Visto por:** traducciones (verificadores a favor: 2/2)
- **Evidencia:** ca.ts:49 'Uneix cada país amb la seua capital.' (y las nueve variantes por unidad, líneas 512-725); idiomas/ca.mjs:83 'es repeteixen', :107 'que repeteix les que falles', :257 'uneixes', :56 'reparteixen'. En cambio plantillas.mjs:93 usa 'que repetix el que falles'.
- **Impacto:** AGENTS.md fija «formas valencianas (aprén, meua, eixir)», y el mismo texto aparece con «repetix» en unas páginas y «repeteix» en otras. Es una incoherencia visible para el público valenciano.
- **Arreglo:** Unificar en las formas valencianas: Unix, repetixen/repetix, unixes, repartixen/repartix.

#### A92. Service worker: /flags e /icons se sirven de la caché para siempre y los /assets viejos se acumulan; todo depende de subir VERSION a mano

- **Dónde:** [public/sw.js:104](../public/sw.js:104)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** `else if (/^\/(assets|flags|icons)\//.test(url.pathname)) event.respondWith(cacheFirst(request));`. cacheFirst nunca revalida. `const VERSION = 'v3';` (línea 7) sigue igual desde b6694d1, hace 146 commits. Las banderas no llevan hash: se copian de node_modules/flag-icons en build-atlas.mjs:590. El propio fichero reconoce la acumulación (comentario ponytail de la línea 85), pero su remedio de «limpiar al activar» solo se ejecuta si cambia sw.js.
- **Impacto:** Si se actualiza flag-icons o un icono, quien tiene el SW sigue viendo la versión antigua sin límite de tiempo. Además, cada despliegue añade a `swm-v3` los chunks nuevos que el usuario carga y nunca se borran: la caché de cada usuario recurrente crece con cada despliegue.
- **Arreglo:** Servir /flags e /icons con staleWhileRevalidate en lugar de cacheFirst. En la instalación o activación, borrar de `swm-v3` los /assets que no estén en la lista de discoverAssets(). Para que eso ocurra en cada despliegue, generar VERSION en el build (p. ej. con el hash del index.html) en vez de editarla a mano.

#### A93. El lastmod del sitemap es la fecha del último commit para las 930 URLs

- **Dónde:** [scripts/build-pages.mjs:850](../scripts/build-pages.mjs:850)
- **Visto por:** rendimiento, SEO y PWA (verificadores a favor: 2/2)
- **Evidencia:** `lastmod = execSync('git log -1 --format=%cs', …)` se aplica a todas las URLs (línea 857). En producción, `curl …/sitemap.xml | grep lastmod | sort | uniq -c` devuelve `930 <lastmod>2026-11-13</lastmod>`.
- **Impacto:** Cada push, aunque solo toque un sombreador, marca como modificadas las 930 páginas. Google deja de fiarse de un lastmod que no es exacto, así que no sirve para que vuelva a rastrear antes las páginas que sí cambian.
- **Arreglo:** Quitar `<lastmod>` (es opcional) o calcularlo por página con `git log -1 --format=%cs -- <ficheros de datos de esa página>`. Lo mínimo es borrarlo.

#### A94. Los satélites se renuevan cada 12 horas, no cada 6, porque el temporizador y la caché local tienen el mismo plazo

- **Dónde:** [src/app/satellites.ts:62](../src/app/satellites.ts:62)
- **Visto por:** satélites y tiempo (verificadores a favor: 2/2)
- **Evidencia:** `if (known && Date.now() - known.at < REFRESH) return known;`. `at` se apunta cuando termina el fetch, mientras que el `window.setInterval(run, REFRESH)` (línea 217) cuenta desde que arranca el efecto. Al primer disparo han pasado REFRESH − δ, menos que REFRESH, así que devuelve lo guardado.
- **Impacto:** En una visita larga, los elementos orbitales se usan hasta unas 12 horas, más lo que lleven guardados en la red de Vercel, y no 6 como dice el comentario. Además, ese primer disparo reconstruye todo sin necesidad (ver el hallazgo de rendimiento).
- **Arreglo:** Dejar margen en la comparación (por ejemplo, `REFRESH - 60_000`) o renovar con un plazo menor que el temporizador.

#### A95. El tope de 300 kB de /api/sync se calculó para tres mapas; hoy hay 34 y el margen es escaso

- **Dónde:** [api/sync.ts:26](../api/sync.ts:26)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** `/** Un progreso completo (los tres mapas, todos los retos) ocupa bastante menos. */ const MAX_BYTES = 300_000;`. Calculado con los atlas reales (197 países × 9 retos + 696 unidades de 32 países × 3–4 retos, fichas realistas): cuerpo del PUT de 241 511 a 283 271 caracteres sin el mapa físico. Los 314 rasgos físicos × 2 retos suman unos 38 kB más (hoy no cuentan solo porque se borran, ver el primer hallazgo), y las marcas (`bests`) también cuentan.
- **Impacto:** Quien complete casi todo superaría el tope: PUT → 400 → syncNow pone `status: 'offline'` y la sincronización falla en cada intento sin decir por qué. El comentario ya no describe el proyecto.
- **Arreglo:** Subir MAX_BYTES (p. ej. 1 MB) o contar el cuerpo real, actualizar el comentario y distinguir en el cliente el 400/413 de una falta de conexión.

#### A96. `pnpm test` falla en un clon limpio: las pruebas leen datos generados que no están en git

- **Dónde:** [src/game/game.test.ts:780](../src/game/game.test.ts:780)
- **Visto por:** calidad y CI (verificadores a favor: 2/2)
- **Evidencia:** `readFileSync(`public/data/${id}/atlas.json`, 'utf8')` (también en 802, 822, 844 y 861), y .gitignore ignora `public/data/*/` y `public/data/atlas.json`. CI lo resuelve corriendo antes `pnpm build` (ci.yml:20-22). AGENTS.md:16 manda `pnpm typecheck`, `pnpm test` y `VERCEL=1 pnpm build`, en ese orden, y el README (105) no dice nada.
- **Impacto:** En un clon recién hecho, o tras borrar public/data, las pruebas fallan con ENOENT y parece un fallo de código.
- **Arreglo:** Indicar en README y AGENTS.md que antes de `pnpm test` hay que ejecutar `pnpm atlas`, o hacer `"test": "pnpm atlas && vitest run"`.

## Descartados por los verificadores

Hallazgos que la mayoría de verificadores no sostuvo (no son problemas, o son teóricos):

- El tope de 300.000 caracteres ya es menor que un progreso completo legítimo (`api/sync.ts:26`, 1/2 a favor)
- Falta la cabecera Permissions-Policy, en una web que se deja incrustar a propósito (`vercel.json:22`, 0/2 a favor)
- Al retirar el consentimiento no se avisa a GA ni se vuelven a borrar sus cookies en las cargas siguientes (`public/consent.js:176`, 1/2 a favor)
- Alias compartidos: «Sofía», «Minsk» y «Kiev» valen como nombre de la ciudad y también de la provincia (`src/game/text.ts:54`, 1/2 a favor)
- Una lista de estudio mal formada en el navegador rompe la aplicación (`src/app/store.ts:183`, 0/2 a favor)
- citiesTwinkling da por visible la noche con la cámara acercada y mantiene el bucle a 10 fps con toda la pantalla de día (`src/engine/MapEngine.ts:2326`, 1/2 a favor)
- dispose() no suelta el contexto WebGL ni la escena del huevo de pascua, y la compilación inicial sigue después de desechar el motor (`src/engine/MapEngine.ts:2450`, 1/2 a favor)
- El atlas que se genera en cada build depende de la ICU de Node y de la fecha (`scripts/build-atlas.mjs:557`, 1/2 a favor)
- /en y /index.html responden 200 sin redirigir a /en/ y / (`vercel.json:1`, 1/2 a favor)
- La lista blanca de teselas de lluvia no limita la fecha: cualquiera puede hacer que la función pida a la NASA teselas de cualquier hora (`api/tiempo.ts:52`, 1/2 a favor)
- En desarrollo, cada recarga vuelve a descargar los satélites de CelesTrak, sin ninguna caché (`vite.config.ts:61`, 0/2 a favor)
- @types/node 26 con Node 24 en engines, CI y Vercel (`package.json:35`, 1/2 a favor)
- Cambiar de país con el teclado en el desplegable carga un mapa por cada tecla, y gana el que llega el último (`src/app/store.ts:538`, 0/2 a favor)
