# Cuentas, sincronización y clases: cómo hacerlo bien

**Decisión (10-nov-2026): aplazado.** La web sigue sin cuentas; el progreso se guarda solo en el
navegador. Este documento queda como punto de partida si se retoma.

Propuesta del 10 de noviembre de 2026. No hay nada implementado. Antes de publicar cualquier parte
que trate datos de alumnos, los textos legales los tiene que revisar un profesional de protección de
datos: aquí se recoge lo que dicen las fuentes, no un dictamen.

## Qué dicen las fuentes

### AEPD, «Principios básicos para la contratación y uso de plataformas educativas digitales» (marzo de 2026)

Leído entero. Lo que afecta a este proyecto:

- **Quién responde.** Las administraciones educativas y los centros «deben asumir de forma proactiva y
  efectiva su condición de responsables del tratamiento». El proveedor es encargado respecto de los
  datos que aportan o generan los usuarios, y pasa a ser responsable cuando decide fines propios.
- **Base jurídica.** La función educativa se apoya en la misión de interés público (art. 6.1.e RGPD) y
  solo ampara lo que deriva de esa función.
- **Fines propios del proveedor.** Con menores, el interés legítimo «difícilmente puede constituir una
  base adecuada» para fines comerciales, mejora de producto, publicidad, perfilado o analítica propia.
- **Contrato.** El uso debe regirse por un contrato de encargo conforme al art. 28 RGPD, con los
  subencargados autorizados por el responsable.
- **Por defecto, lo mínimo.** Solo los datos «estrictamente necesarios para la finalidad educativa»;
  lo ajeno a la función educativa, desactivado.
- También exige evaluación de impacto al responsable, análisis de transferencias internacionales,
  información clara a familias y alumnado, y garantizar los derechos de acceso, supresión, etc.

### AEPD, «Guía para centros educativos»

Consultada por búsqueda de pasajes, no leída entera.

- Los centros y administraciones «deben conocer las aplicaciones que vayan a utilizar, su política de
  privacidad y sus condiciones de uso» antes de usarlas, y rechazar las que no informen.
- El consentimiento lo da el menor a partir de los 14 años; por debajo, sus padres o tutores (art. 7
  LOPDGDD).
- Cita un informe de 2018 sobre el uso por profesores y alumnos de aplicaciones en la nube ajenas a
  las plataformas del centro. No lo he leído.

### Supabase (documentación y precios, consultados hoy)

- **Usuarios anónimos:** `signInAnonymously()` crea un usuario sin correo ni teléfono. Usa el rol
  `authenticated`, así que las políticas de acceso tienen que distinguirlo con el dato `is_anonymous`
  del token. Se puede convertir en permanente después (correo o `linkIdentity()` con Google)
  conservando el mismo identificador.
- **Plan gratuito:** 50 000 usuarios activos al mes; dos proyectos gratuitos por persona; un proyecto
  gratuito **se pausa tras una semana con poca actividad** (avisa por correo y conserva los datos).
  El plan Pro cuesta 25 $ al mes y no se pausa.
- No he comprobado si los usuarios anónimos cuentan como usuarios activos, ni las condiciones del
  contrato de encargo (DPA) de Supabase.

### Google (inicio de sesión)

- Una aplicación que solo pide los permisos básicos de identidad (correo y perfil) no está obligada a
  pasar la verificación completa de Google. Lo de la verificación de marca y la política de privacidad
  obligatoria no lo he podido confirmar en fuente oficial.

## Qué implica

Hay dos situaciones distintas y conviene no mezclarlas.

**1. Una persona usa la web por su cuenta y quiere conservar su progreso.** Aquí el responsable es
el proyecto. Si se piden datos personales, hace falta consentimiento, y por debajo de 14 años el de
los padres, que no hay forma práctica de comprobar.

**2. Un profesor usa la web con su clase.** Según la AEPD, el responsable es el centro (o la
administración), el proyecto sería encargado y haría falta un contrato de encargo con cada centro.
Un profesor que la adopta por su cuenta, con datos de alumnos, es justo lo que la AEPD desaconseja.

La forma de que las dos sean viables para un proyecto de una sola persona es la misma: **no tratar
datos identificativos de los alumnos**.

## Propuesta

### A. Sincronización sin datos personales (para todo el mundo)

- La web crea un usuario anónimo de Supabase la primera vez que alguien pulsa «Guardar mi progreso».
  No se pide correo, nombre ni edad.
- Se le da un **código de recuperación** (unas pocas palabras al azar). Con ese código recupera su
  progreso en otro dispositivo.
- Se guarda solo: identificador aleatorio, progreso, racha y listas.
- Pega: quien pierde el código pierde el acceso. Se avisa al crearlo y se puede regenerar desde un
  dispositivo que siga conectado.

Esto da a los alumnos lo que querían de una cuenta sin que exista una cuenta en el sentido legal.

### B. Cuentas de profesor

- Los profesores son adultos: inicio de sesión con Google o con enlace por correo.
- Se guarda: correo (lo exige la autenticación), nombre para mostrar opcional y sus clases.
- Al registrarse aceptan unas condiciones en las que declaran que su centro conoce y autoriza el uso.
- Para los centros que lo pidan, un contrato de encargo tipo (art. 28) listo para firmar.

### C. Clases sin identificar a los alumnos

- El profesor crea una clase y recibe un enlace o código.
- Cada alumno entra con el enlace y elige un **puesto** de una lista que genera la web («Alumno 7»,
  o un apodo al azar tipo «Zorro Azul»). No hay campo de texto libre, para que nadie escriba su nombre.
- El profesor sabe quién es cada puesto porque lo apunta él, fuera de la web.
- El profesor asigna retos o listas y ve la nota de cada puesto.
- **Sin analítica en el modo clase:** no se carga Google Tag Manager ni se enseña el aviso de cookies.
  Es lo que pide la AEPD sobre la analítica propia del proveedor con menores.
- **Caducidad:** la clase y sus resultados se borran solos al acabar el curso o tras un periodo sin
  uso, y el profesor puede borrarlos cuando quiera.

### Lo que no haría

- Cuentas de alumno con correo o con Google.
- Nombres reales de alumnos en ningún campo.
- Guardar direcciones IP o cualquier registro propio de actividad por alumno más allá de la nota.

## Diseño técnico (resumen)

- Tablas: `progreso (usuario, datos)`, `clases (id, profesor, nombre, código, caduca)`,
  `puestos (clase, número, apodo, usuario)`, `tareas (clase, reto, lista)`,
  `resultados (tarea, puesto, nota, tiempo, fecha)`.
- Seguridad a nivel de fila en todas: cada usuario solo lee y escribe lo suyo; el profesor, lo de sus
  clases. Las políticas distinguen a los usuarios anónimos. Tests de esas políticas antes de publicar.
- Proyecto en una región de la UE. La clave de servicio nunca en el navegador.
- La web sigue funcionando entera sin cuenta y sin conexión; lo nuevo es un añadido opcional.

## Coste y límites

- El plan gratuito basta por número de usuarios, pero **se pausa tras una semana sin actividad**. En
  vacaciones escolares eso pasará. Opciones: plan Pro (25 $ al mes) o reactivarlo a mano.
- Ya hay dos proyectos gratuitos en la cuenta, que es el máximo. Para crear este hay que pausar o
  borrar uno, o pagar el plan Pro.
- No meter estos datos en el proyecto de otro cliente.

## Orden propuesto

1. **A (sincronización con código).** Es lo más útil y lo menos delicado.
2. **B y C juntas (profesores y clases).** Antes de publicarlas: revisión legal de las condiciones, el
   contrato tipo y la política de privacidad.
3. Volver a medir: si los profesores lo usan, valorar el plan Pro.

## Fuentes

- https://www.aepd.es/documento/apd-plataformas-educativas-administraciones-centros.pdf
- https://www.aepd.es/guias/guia-centros-educativos.pdf
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/guides/auth/auth-identity-linking
- https://supabase.com/kb/faqs/platform/free-project-pausing
- https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users
- https://supabase.com/pricing
- https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
