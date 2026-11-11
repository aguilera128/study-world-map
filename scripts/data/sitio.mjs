// Datos del titular y del sitio para las páginas legales y de donaciones (scripts/build-pages.mjs).
// Son públicos por ley (LSSI, art. 10): aparecen en /aviso-legal/ y /privacidad/.
//
// Mientras quede algún «PENDIENTE», el build de Vercel falla a propósito: no se publica un aviso
// legal a medias. En local se genera igual, con el texto pendiente a la vista.

export const SITE = 'https://www.studyworldmap.com';

export const TITULAR = {
  nombre: 'PENDIENTE',
  nif: 'PENDIENTE',
  domicilio: 'PENDIENTE',
  email: 'hola@studyworldmap.com',
};

/** Enlace de donación de PayPal (paypal.me/… o botón de donación). */
export const DONAR_URL = 'https://paypal.me/studyworldmap';

/** Fecha de la última revisión de los textos legales (se muestra al pie de cada uno). */
export const REVISION_LEGAL = '11 de noviembre de 2026';
