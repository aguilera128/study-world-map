// Datos del sitio y de su titular para las páginas estáticas, legales y de donaciones
// (scripts/build-pages.mjs). No van en el repositorio: salen de variables de entorno, las mismas que
// lee Vite (.env.local en local, las del proyecto en Vercel). Ver .env.example.
//
// Los del titular son públicos por ley (LSSI, art. 10): aparecen en /aviso-legal/ y /privacidad/.
// Mientras falte alguno, el build de Vercel falla a propósito: no se publica un aviso legal a
// medias. En local se genera igual, con el texto pendiente a la vista.

import { existsSync } from 'node:fs';

// Como Vite: lo que ya esté en el entorno manda, y .env.local manda sobre .env.
for (const file of ['.env.local', '.env']) if (existsSync(file)) process.loadEnvFile(file);

const env = (name) => (process.env[name] ?? '').trim();
const pendiente = (name) => env(name) || `PENDIENTE: ${name}`;

/** Dirección pública del sitio, sin barra final. */
export const SITE = (env('VITE_SITE_URL') || 'http://localhost:5173').replace(/\/+$/, '');

export const TITULAR = {
  nombre: pendiente('TITULAR_NOMBRE'),
  nif: pendiente('TITULAR_NIF'),
  domicilio: pendiente('TITULAR_DOMICILIO'),
  email: pendiente('VITE_CONTACT_EMAIL'),
};

/** Enlace de donación (paypal.me/… o similar). Vacío: no hay página ni enlaces de donación. */
export const DONAR_URL = env('VITE_DONATE_URL');

/** Contenedor de Google Tag Manager (GTM-…). Vacío: no hay analítica ni aviso de cookies. */
export const GTM_ID = env('VITE_GTM_ID');

/** Fecha de la última revisión de los textos legales (se muestra al pie de cada uno). */
export const REVISION_LEGAL = '17 de noviembre de 2026';
