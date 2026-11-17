# Revisión para publicar el código — 17 de noviembre de 2026

Preparación de `study-world-map` para hacerlo público en GitHub. Todo lo de este informe está hecho
**en local**: no se ha hecho push, ni cambiado la visibilidad, ni tocado Vercel ni GitHub.

## Decisiones tomadas

| Decisión | Elegido |
| --- | --- |
| Licencia | AGPL-3.0 |
| Historial | Reescrito: correo `noreply` de GitHub en todos los commits |
| README | Inglés (`README.md`) y copia en español (`README.es.md`) |
| Nombre, NIF y domicilio del titular | Fuera del repositorio y del historial; salen de variables de entorno |
| Servicios propios (dominio, correo, PayPal, Tag Manager, Blob) | Configurables por variables de entorno; sin valor, se apagan |

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
  - No hay IPs reales, teléfonos, matrículas, rutas de la máquina (`C:\Users\…`), nombres de
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
- En local, `.env.local` tiene ya tus valores (sitio y titular), y `git config user.email` de este
  repositorio es el `noreply`, para que los commits nuevos no vuelvan a llevar el Gmail.

## Verificación

- `pnpm typecheck`, `pnpm test` (323 pruebas) y `VERCEL=1 pnpm build`: pasan.
- **Build sin ninguna variable** (como lo haría quien clona): compila; no queda ningún `%VITE_…%` sin
  sustituir, ni tu dominio, tu correo, tu contenedor ni tu Blob en `dist/`.
- **Build con tus valores:** `dist/index.html` es igual al de producción salvo la etiqueta de
  `consent.js`, que ahora lleva `data-gtm`.

## Qué queda sin verificar

- **En navegador:** no se ha probado en pantalla la portada sin variables (sin botón de donar, sin
  «Configurar cookies») ni que el aviso de cookies y Tag Manager sigan cargando con `data-gtm`.
- **Licencias de datos de terceros** para redistribuirlos en un repositorio público. Lo que hay en el
  repositorio viene de fuentes de dominio público o con licencia abierta (Natural Earth, NASA, NOAA,
  Wikidata, CC BY de Finlandia, Noruega y Moldavia), pero conviene revisar tres:
  - Distritos de Chipre (Department of Lands and Surveys): no consta una licencia explícita.
  - `mledoze/countries` es ODbL, que obliga a compartir igual la base derivada.
  - Rejilla de Köppen-Geiger (Kottek et al.): en el repositorio solo están los porcentajes derivados.
- **Compatibilidad de la AGPL con las dependencias:** no se ha hecho una revisión formal. Son MIT, BSD,
  ISC, Apache-2.0 u OFL, en principio compatibles.
- **Commits antiguos en GitHub:** tras forzar el push, GitHub puede conservar los commits viejos
  accesibles por su SHA. Ver «Antes de publicar».

## Decisiones que son tuyas

1. **`AGPL-3.0-only` o `-or-later`.** He puesto `only`. Con `or-later` aceptas de antemano versiones
   futuras de la licencia.
2. **`docs/auditoria-completa-2026-11-14.md`** lista 86 hallazgos menores sin arreglar, algunos de
   seguridad y de privacidad (A11–A19). Publicarlo enseña por dónde flojea el sitio. Se puede dejar,
   recortar o sacar del repositorio. Los otros tres documentos de `docs/` no tienen nada privado.
3. **`AGENTS.md`** se queda: es la guía para contribuir. Menciona la regla del firewall de Vercel
   (40 por IP cada 10 min), que es información útil para quien quiera abusar justo por debajo.
4. **Identificadores públicos que siguen en el historial:** el contenedor `GTM-TW2XCZJM` y el dominio
   del Blob de teselas. Ya son visibles en la web; no los he borrado del historial.
5. **Textos legales** (`scripts/data/legales.mjs`): siguen siendo los de studyworldmap.com. Quien
   despliegue una copia tiene que cambiarlos; está avisado en el README y en `.env.example`.
6. **Enlace al código en la web.** La AGPL pide ofrecer el código a quien usa el sitio. Como titular
   no te obliga, pero un enlace «Código fuente» en el pie ayudaría a los forks a cumplir. Son diez
   traducciones; no lo he añadido.

## Antes de publicar (nada de esto está hecho)

1. **Variables en Vercel.** Hay que crear las ocho (`VITE_SITE_URL`, `VITE_CONTACT_EMAIL`,
   `VITE_DONATE_URL`, `VITE_GTM_ID`, `VITE_TILE_STORE`, `TITULAR_NOMBRE`, `TITULAR_NIF`,
   `TITULAR_DOMICILIO`) **antes del push**. Sin las del titular el build falla a propósito; sin las
   demás, producción se quedaría sin analítica, sin teselas y sin donar.
2. **Push forzado** de `main` (el historial es otro). Hay copia del historial anterior en
   `%USERPROFILE%\AppData\Local\Temp\claude\bfdb7f6fa8524afc\388306e9-5959-4d11-a695-cdf117b11651\scratchpad\study-world-map-antes-de-reescribir.bundle`
   (carpeta temporal: muévela si quieres conservarla; contiene el NIF y el correo).
3. **Commits antiguos en GitHub.** Para que no queden accesibles por SHA, lo más seguro es borrar el
   repositorio y crearlo de nuevo con el mismo nombre (y volver a conectarlo a Vercel), o pedir a
   GitHub Support que purgue los objetos huérfanos antes de hacerlo público.
4. **Hacer público** el repositorio.
5. **Activar** private vulnerability reporting, secret scanning y push protection.
6. **Release:** no hace falta; si quieres, una `v0.1.0` con el estado actual.
