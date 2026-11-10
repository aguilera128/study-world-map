# Study World Map — diseño

Cómo se ve y se comporta la interfaz, y por qué. Los valores viven en `src/index.css` (interfaz) y
`src/engine/palette.ts` (mapa); si este documento y el código discrepan, manda el código y hay que
corregir el documento.

## Idea

Un **atlas de papel que cobra vida**. La interfaz es papel y tinta —tipografía de libro, rótulos en
versalitas como las leyendas de un mapa, un bermellón de anotación— y el mapa es el protagonista:
nada compite con él. De noche el papel se vuelve cielo: globo iluminado por el Sol real, estrellas
del catálogo y la Vía Láctea en su sitio.

Tres reglas:

1. **El mapa manda.** Los paneles se apartan, se desvanecen hacia el mapa y nunca lo tapan más de
   lo necesario.
2. **Todo lo que se enseña es real.** Posiciones, datos y cifras salen de fuentes citadas; lo que es
   ilustración (el movimiento del manto, la altura exagerada de la atmósfera) se dice.
3. **Pensado para estudiantes.** Lenguaje llano, de tú, sin jerga; objetivos táctiles grandes; nada
   de publicidad ni de trucos para retener.

## Temas

Dos temas con los mismos papeles: `paper` (claro) y `night` (oscuro). Quien no ha elegido ve el
de noche. El botón del tema solo guarda claro u oscuro.

| Papel | `paper` | `night` | Uso |
|---|---|---|---|
| `--paper` | `#f1eadb` | `#0d1520` | fondo de la página |
| `--surface` | `#faf6ec` | `#162231` | tarjetas, botones, menús |
| `--sunken` | `#e7dfcd` | `#0a111a` | pistas de barras, huecos |
| `--ink` | `#1b2a3a` | `#efe7d6` | texto |
| `--ink-soft` | `#485868` | `#b3bcc7` | texto secundario |
| `--ink-faint` | `#848b8c` | `#76828f` | notas, créditos |
| `--rule` / `--rule-strong` | tinta al 16 % / 34 % | tinta al 15 % / 34 % | líneas y bordes |
| `--accent` | `#d5462a` | `#ff7654` | la acción principal y lo que se subraya |
| `--ok` / `--help` / `--bad` | `#2c8a57` / `#b97a08` / `#c4412e` | `#5ccb8d` / `#f1bd57` / `#f37e6b` | acierto, ayuda, fallo |
| `--highlight` | `#ffd95a` | `#ffd866` | país señalado |

El acento se usa **una vez por pantalla** (el botón de empezar, el enlace activo). Los colores del
mapa (países, océano, relieve, climas, densidad, dominio) están en `palette.ts` y van a juego.

## Tipografía

- **Besley** (`--font-display`, clase `.display`): títulos y cifras grandes. Peso 700, interlineado
  1,04, `text-wrap: balance` para que ninguna palabra quede sola.
- **Atkinson Hyperlegible Next** (`--font-sans`): todo lo demás. Elegida por su legibilidad.
- **Rótulos** (`.label`): versalitas pequeñas con espaciado ancho, para encabezados de sección y
  leyendas.
- Cifras alineadas con `.tabular`. Tamaño base 16 px; el texto de interfaz no baja de 0,75 rem.
- Las dos fuentes están autoalojadas: no se pide nada a terceros.

## Componentes

| Clase | Qué es |
|---|---|
| `.panel` | Panel lateral. En móvil, hoja que sube desde abajo (máx. 60 % de alto); en ancho (≥ 60 rem), el propio papel de la página, que se desvanece hacia el mapa. Su contenido se desplaza y se difumina bajo la cabecera. |
| `.float` | Píldora o tarjeta flotante sobre el mapa (controles, leyendas, avisos): superficie al 88 %, desenfoque, borde fino. |
| `.btn`, `.btn-accent`, `.btn-ghost` | Botones. Altura mínima 44 px. Solo uno de acento por pantalla. |
| `.tile` | Opción seleccionable (retos, zonas): borde fino, relleno claro al elegirla. |
| Interruptores | Casillas nativas dibujadas como interruptor; la fila entera se pulsa y mide 44 px. |
| `.feature-label`, `.map-pin` | Rótulos sobre el mapa, colocados por el motor: cursiva para el agua, versalitas para cordilleras, píldora para las líneas imaginarias. |

Numeración de pasos (`Step`) en los paneles: 1 Reto, 2 Países, 3 Preguntas.

## Disposición

- **Móvil:** mapa arriba, hoja abajo; la cabecera se reduce al logotipo y un menú; los menús de
  capas y descarga se abren como hoja inferior.
- **Ancho (≥ 60 rem):** panel a la izquierda de 40 rem con el contenido en 30; el globo se descentra
  para quedar en el hueco libre; controles del mapa abajo a la derecha; tarjeta de tiempo real
  arriba a la derecha (se pliega al tocar la hora).
- Los paneles informan al motor del espacio que ocupan (`pad`) para encuadrar y para no rotular
  debajo de ellos.

## Movimiento

- Curva `--ease-out-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`); entradas escalonadas de los bloques de
  un panel; el globo «se desenrolla» al pasar a mapa plano.
- Animación ambiental muy lenta: agua, corrientes, parpadeo de estrellas, manto y núcleo.
- Con `prefers-reduced-motion` no hay giro automático ni animación ambiental.

## El mapa

- **Países** en seis tonos apagados que nunca coinciden entre vecinos; se levantan al señalarlos.
- **Océano** con profundidad real; reflejo del Sol y oleaje solo al acercarse.
- **Día y noche** con la posición real del Sol; el lado nocturno se atenúa, no se apaga.
- **Atmósfera:** halo que depende de dónde viene la luz (anillo fino a contraluz, ocaso en el
  terminador).
- **Cielo:** estrellas del catálogo con su color y brillo, y la Vía Láctea de la NASA, tenue para
  no competir con el globo.
- **El planeta por dentro:** corte escalonado con cada capa en su color (corteza marrón, manto
  superior pardo verdoso, manto inferior rojo, núcleo externo naranja, núcleo interno amarillo
  claro); la leyenda usa los mismos colores.

## Accesibilidad

- Se busca contraste AA en ambos temas (no hay una auditoría completa hecha); el estado nunca
  depende solo del color (icono o texto además).
- Todo se maneja con teclado: el mapa también (flechas, `+`/`−`, Intro, punto de mira visible).
- Foco visible con el color de acento. Objetivos táctiles de 44 px.
- Textos alternativos y `aria-label` en español traducidos como el resto.

## Tono de los textos

De tú, frases cortas, sin exclamaciones ni tecnicismos. Se dice qué pasa y qué hacer («Tu progreso
se guarda solo en este dispositivo»). Las cifras llevan su fuente o su año cuando importan.
