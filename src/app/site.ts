// Lo que cambia de un despliegue a otro: sale de variables de entorno de compilación (.env.example).
// Sin valor, lo que depende de él no se enseña.

const env = (value: string | undefined) => (value ?? '').trim();

/** Correo de contacto: para informar de un error o de un apodo inadecuado. */
export const CONTACT_EMAIL = env(import.meta.env.VITE_CONTACT_EMAIL);

/** Hay analítica (Google Tag Manager) y, por tanto, aviso de cookies que configurar. */
export const ANALYTICS = env(import.meta.env.VITE_GTM_ID) !== '';

/** Hay enlace de donación y, por tanto, página /donar/. */
export const DONATE = env(import.meta.env.VITE_DONATE_URL) !== '';

/** El dominio del sitio, para firmar las imágenes exportadas. */
export const SITE_HOST = (env(import.meta.env.VITE_SITE_URL) || globalThis.location?.origin || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '');
