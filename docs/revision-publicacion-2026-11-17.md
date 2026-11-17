# Revisión para publicar el código — 17 de noviembre de 2026

Preparación y publicación de `study-world-map` como código abierto en GitHub. El repositorio es
público desde el 17 de noviembre de 2026: <https://github.com/aguilera128/study-world-map>.

Las primeras secciones describen la preparación, hecha en local antes de publicar. Lo que vino
después está en «Publicación» y «Después de publicar».

## Decisiones tomadas

| Decisión | Elegido |
| --- | --- |
| Licencia | AGPL-3.0 |
| Historial | Reescrito: correo `noreply` de GitHub en todos los commits |
| README | Inglés (`README.md`) y copia en español (`README.es.md`) |
| Nombre, NIF y domicilio del titular | Fuera del repositorio y del historial; salen de variables de entorno |
| Servicios propios (dominio, correo, PayPal, Tag Manager, Blob) | Configurables por variables de entorno; sin valor, se apagan |
| Commits antiguos en GitHub | Repositorio nuevo con el historial limpio; el antiguo, renombrado y privado |
| Páginas legales en otros idiomas | Traducidas a los nueve, a título informativo |

## Qué se comprobó

Sobre los 160 commits que había (10 a 14 de noviembre de 2026), con `git log --all -p` y
`git rev-list --objects --all`: 1.776 objetos y 325 rutas distintas.

- **Secretos: ninguno.** Se buscaron claves de API (`sk-`, `sk-ant-`, `AKIA`, `ghp_`, `github_pat_`,
  `AIza`, `xox…`), tokens de Vercel y de Blob, JWT, claves privadas, `service_role`, contraseñas de
  Neon (`npg_`), DSN de Sentry, cadenas de conexión (`postgres://`, `mongodb://`…) y asignaciones del
  tipo `password = "…"`. Ningún `.env*` se ha subido nunca.
- **Bundle del cliente:** los valores de `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
  `BLOB_READ_WRITE_TOKEN` y `VERCEL_OIDC_TOKEN` no aparecen en ninguno de los 1.325 ficheros de texto
  de `dist/`. El cliente solo lee las cinco `VITE_*` públicas.
- **Datos personales:**
  - El correo personal estaba en los 160 commits (autor y confirmador). Corregido.
  - `scripts/data/sitio.mjs` llevaba nombre completo, NIF y domicilio desde el primer commit que lo añadió (`5f98e55` tras la reescritura). Corregido.
  - No hay IPs reales, teléfonos, matrículas, rutas de la máquina, nombres de
    dispositivos ni datos de clientes. Las pruebas usan datos inventados (`ana@correo.es`, `666123456`).
- **Ficheros subidos alguna vez:** solo cuatro rutas ya no están en el árbol (`public/sitemap.xml`,
  `scripts/data/nombres.mjs`, `scripts/data/paginas.mjs`, `src/app/climate.ts`), ninguna con nada privado.
  No hay `.db`, `.zip`, volcados ni claves. El mayor fichero es `public/data/milkyway.webp` (1,4 MB).
- **Despliegue:** bajo `api/` solo están las cuatro rutas y ninguna ejecuta nada al importarse.
  `vercel.json` no lleva identificadores de proyecto ni de equipo.
- **Carpetas de agentes:** solo estaba versionado `.claude/launch.json` (el arranque de `pnpm dev`, sin
  rutas propias).

## Qué se corrigió

- **Historial** (`git filter-repo`): autor y confirmador pasan a
  `Javier Aguilera <56610642+aguilera128@users.noreply.github.com>`; NIF, domicilio y nombre completo
  se sustituyen por `PENDIENTE` en todas las versiones de `sitio.mjs`; se quitan dos líneas
  `Co-Authored-By` de dos commits antiguos. Comprobado después: 0 apariciones del correo, del NIF y del
  domicilio en contenido y mensajes. **Cambian todos los SHA.** El que citaba la auditoría del 14-nov
  (`f0f28d2`) está actualizado a `52ca7b7`.
- **Variables de entorno** (`.env.example`): `VITE_SITE_URL`, `VITE_CONTACT_EMAIL`, `VITE_DONATE_URL`,
  `VITE_GTM_ID`, `VITE_TILE_STORE`, `TITULAR_NOMBRE`, `TITULAR_NIF`, `TITULAR_DOMICILIO`. Sin valor: sin
  analítica ni aviso de cookies, sin teselas de detalle, sin página ni botón de donar, sin enlaces de contacto.
- `index.html` y `llms.txt` llevan `%VITE_SITE_URL%`; `public/robots.txt` y `public/llms.txt` se generan
  en el build (la plantilla del segundo está en `scripts/data/llms.txt`).
- `public/consent.js` recibe el contenedor de Tag Manager en el atributo `data-gtm` de su etiqueta.
- **CSP:** `connect-src` admite `https://*.public.blob.vercel-storage.com` en vez del almacén concreto,
  porque `vercel.json` no puede leer variables. Es algo más abierta que antes.
- `LICENSE` (texto de la AGPL-3.0, de la API de licencias de GitHub: gnu.org no respondía) y
  `"license": "AGPL-3.0-only"` en `package.json`.
- `README.md` en inglés y `README.es.md` en español: requisitos, puesta en marcha, variables,
  despliegue de una copia propia, cómo contribuir, aviso privado de fallos de seguridad y licencia.
- **CI:** `permissions: contents: read`, `persist-credentials: false` y acciones fijadas por SHA
  (comprobadas hoy): `actions/checkout` v7.0.1, `pnpm/action-setup` v6.1.1, `actions/setup-node` v7.1.0.
  El proyecto no tiene linter: la CI pasa build (con `tsc`) y pruebas.
- `.gitignore`: `.claude/`, `.agents/`, `skills-lock.json`, `.vscode/`; `.env.example` sí se versiona.
- En local, `.env.local` tiene los valores del sitio y del titular, y `git config user.email` de este
  repositorio es el `noreply`, para que los commits nuevos no vuelvan a llevar el correo personal.

## Verificación

- `pnpm typecheck`, `pnpm test` (323 pruebas) y `VERCEL=1 pnpm build`: pasan.
- **Build sin ninguna variable** (como lo haría quien clona): compila; no queda ningún `%VITE_…%` sin
  sustituir, ni tu dominio, tu correo, tu contenedor ni tu Blob en `dist/`.
- **Build con tus valores:** `dist/index.html` es igual al de producción salvo la etiqueta de
  `consent.js`, que ahora lleva `data-gtm`.

## Publicación

Hecho el 17 de noviembre de 2026, cada paso con el visto bueno del titular.

1. **Variables en Vercel.** Las ocho, en producción y en preview. Las cinco `VITE_*` van como
   legibles y las tres del titular como secretas.
2. **Push forzado** de `main` con el historial reescrito.
3. **Repositorio nuevo.** Tras el push, el commit antiguo seguía accesible por su SHA en GitHub, con
   el correo personal. En vez de borrar el repositorio, el antiguo se renombró a
   `study-world-map-antiguo` (sigue privado) y se creó uno nuevo con el mismo nombre, al que se subió
   solo el historial limpio. Comprobado: en el nuevo, GitHub responde «No commit found» para el SHA
   antiguo. El antiguo no tenía incidencias, PR, releases, etiquetas, secretos ni webhooks.
4. **Vercel** reconectado al repositorio nuevo, rama `main`.
5. **Repositorio público.** Antes de abrirlo: 0 commits con el correo personal, 0 apariciones del
   NIF, una sola rama. GitHub detecta la licencia como AGPL-3.0.
6. **Seguridad en GitHub:** activados el aviso privado de vulnerabilidades, secret scanning (0
   alertas) y push protection.
7. **Release `v0.1.0`**, con las notas en inglés.

## Después de publicar

- **Aviso legal:** dice que el código es libre, con su licencia y el enlace al repositorio. Se
  añadieron las fuentes de datos que faltaban (Wikidata, Banco Mundial, Oficina del Censo de EE. UU.,
  OSCAR, PB2002 de Bird, NOAA NCEI, Deep Star Maps, IANA y el origen de las ilustraciones) y se
  corrigió el enlace de Statistics Finland, que daba 404. «Objeto» describe todo lo que hoy enseña la web.
- **Privacidad (borrador, pendiente de revisión profesional):** base legal de la sincronización
  (consentimiento, art. 6.1.a) y del alojamiento (interés legítimo, art. 6.1.f), y Neon como encargado
  del tratamiento. No se ha comprobado el contrato de encargo de Neon.
- **Código del enlace QR:** `consent.js` quita `?codigo=` de la dirección antes de que pueda cargarse
  Tag Manager. Probado en navegador.
- **Consentimiento de cookies:** se guarda con su fecha y caduca a los dos años. Probado en navegador.
- **`llms.txt`:** ya no dice «no hay cuentas ni servidor» ni «cinco retos».
- **Páginas legales en los diez idiomas** (`scripts/data/legales/<idioma>.mjs`). El original es el
  español; las nueve traducciones avisan al principio de que son informativas y de que prevalece el
  original. El pie de las páginas, el aviso de cookies y la aplicación enlazan a la de cada idioma.
- **Revisión de las traducciones:** un revisor independiente por idioma las comparó con el original.
  Ninguno encontró errores de sentido; se corrigieron fallos de expresión (el más serio, en alemán:
  «Daten deiner Karte» se leía como «los datos de tu mapa»). Traductores y revisores son modelos.
- **Blob de teselas:** la clave de escritura se rotó, porque su principio había salido en la salida
  de un comando, y la conexión pasó a OIDC. `scripts/upload-tiles.mjs` acepta OIDC o la clave permanente.
- **Auditoría del 14-nov:** quedan anotados como arreglados A12, A14, A15, A16, A17, A19 y A62.

## Qué queda sin verificar

- **Con Tag Manager cargado de verdad:** los arreglos del aviso de cookies se probaron en local sin
  aceptar la analítica, para no mandar visitas de `localhost` a la propiedad real. En producción no se
  han probado con un navegador.
- **Portada sin variables** (como la vería un fork): se comprobó el HTML generado, no en pantalla.
- **Traducciones legales:** no las ha revisado un hablante nativo ni un jurista. En euskera quedan dos
  términos sin cotejar con la versión oficial: «adostasuna» (consentimiento) y el nombre de la Ley 34/2002.
- **Licencias de datos de terceros** para redistribuirlos. Lo que hay en el repositorio viene de
  fuentes de dominio público o con licencia abierta, pero conviene revisar tres:
  - Distritos de Chipre (Department of Lands and Surveys): no consta una licencia explícita.
  - `mledoze/countries` es ODbL, que obliga a compartir igual la base derivada.
  - Rejilla de Köppen-Geiger (Kottek et al.): en el repositorio solo están los porcentajes derivados.
- **Compatibilidad de la AGPL con las dependencias:** no se ha hecho una revisión formal. Son MIT, BSD,
  ISC, Apache-2.0 u OFL, en principio compatibles.

## Pendiente, en manos del titular

1. **Borrar `study-world-map-antiguo`** en GitHub, o dejarlo privado. Contiene los commits con el
   correo personal y el NIF.
2. **Copia del historial anterior:** hay un `.bundle` en la carpeta temporal de la sesión en la que se
   hizo este trabajo. Contiene el NIF y el correo: moverlo a un sitio seguro o borrarlo.
3. **`BLOB_READ_WRITE_TOKEN` en Vercel:** sigue existiendo como variable legible, aunque con OIDC ya no
   hace falta.
4. **Revisión profesional de los textos legales**, sobre todo el borrador de privacidad.
5. **Revisión nativa de las traducciones**, las legales en primer lugar.

## Decisiones que siguen abiertas

1. **`AGPL-3.0-only` o `-or-later`.** Está puesto `only`. Con `or-later` se aceptan de antemano
   versiones futuras de la licencia.
2. **`docs/auditoria-completa-2026-11-14.md`** es público y lista unos 80 hallazgos menores sin
   arreglar, algunos de seguridad y de privacidad. Se puede dejar, recortar o sacar del repositorio.
3. **`AGENTS.md`** menciona la regla del firewall de Vercel (40 por IP cada 10 min), que es
   información útil para quien quiera abusar justo por debajo.
4. **Identificadores públicos que siguen en el historial:** el contenedor de Tag Manager y el dominio
   del Blob de teselas. Ya son visibles en la web.
5. **Enlace «Código fuente» en el pie de la aplicación.** El enlace está en el aviso legal, no en la
   interfaz. La AGPL pide ofrecer el código a quien usa el sitio; como titular no obliga, pero ayudaría
   a los forks a cumplir. Son diez traducciones.
6. **Enlace a donar en «Objeto» del aviso legal:** en una copia sin enlace de donación apunta a una
   página que no existe.
