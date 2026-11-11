// Idioma de la interfaz. Lo decide la dirección de la página (`/` español, `/en/` inglés…) y no
// cambia mientras está abierta: cambiar de idioma es ir a otra dirección. Así cada idioma tiene su
// propia página para los buscadores y `t()` puede ser una función normal, sin estado de React.
//
// Los textos del código están en español y son su propia clave: `t('Explorar')` devuelve la
// traducción del diccionario del idioma (./en.ts…) o, si no hay, el mismo texto. Las variables van
// entre llaves: `t('Dominas {n} de {total}', { n, total })`.

export const LANGS = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ca: 'Valencià / Català',
  gl: 'Galego',
  eu: 'Euskara',
  zh: '中文',
} as const;

export type Lang = keyof typeof LANGS;

const LOCALES: Record<Lang, string> = { zh: 'zh-CN', eu: 'eu-ES', gl: 'gl-ES', ca: 'ca-ES', pt: 'pt-BR', it: 'it-IT', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', en: 'en-GB' };

/** Idioma de una dirección: el primer tramo de la ruta, si es uno de los disponibles. */
export function pathLang(pathname: string): Lang {
  const first = pathname.split('/')[1];
  return first !== 'es' && first in LANGS ? (first as Lang) : 'es';
}

export const lang: Lang = typeof location === 'undefined' ? 'es' : pathLang(location.pathname);

/** Para `Intl` y `localeCompare`: números, fechas y orden alfabético del idioma. */
export const LOCALE = LOCALES[lang];

/** Dirección de la aplicación en un idioma. */
export const homeOf = (l: Lang) => (l === 'es' ? '/' : `/${l}/`);

/**
 * «Ver en …», dicho en cada idioma. No pasa por `t()`: lo lee quien ha llegado a una versión que no
 * es la de su navegador, así que tiene que estar en su idioma y no en el de la página.
 */
export const VIEW_IN: Record<Lang, string> = {
  es: 'Ver en español',
  en: 'View in English',
  fr: 'Voir en français',
  de: 'Auf Deutsch ansehen',
  it: 'Vedi in italiano',
  pt: 'Ver em português',
  ca: 'Veure-ho en valencià / català',
  gl: 'Ver en galego',
  eu: 'Euskaraz ikusi',
  zh: '查看中文版',
};

/**
 * Idioma que prefiere el navegador entre los disponibles: el primero de su lista que haya. Si no hay
 * ninguno se propone el inglés, que es el que más probablemente entienda quien no lee los otros.
 */
export function preferredLang(languages: readonly string[]): Lang | null {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0];
    if (base in LANGS) return base as Lang;
  }
  return languages.length ? 'en' : null;
}

let dict: Record<string, string> = {};

const loaders = import.meta.glob<{ default: Record<string, string> }>('./[a-z][a-z].ts');

/** Carga el diccionario del idioma. Hay que esperarlo antes de importar nada que llame a `t()`. */
export async function initI18n(): Promise<void> {
  if (lang === 'es') return;
  dict = (await loaders[`./${lang}.ts`]()).default;
  document.documentElement.lang = lang;
}

export function t(text: string, vars?: Record<string, string | number>): string {
  let out = dict[text] ?? text;
  if (vars) for (const key in vars) out = out.replaceAll(`{${key}}`, String(vars[key]));
  return out;
}
