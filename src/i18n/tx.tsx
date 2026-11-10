import { Fragment, type ReactNode } from 'react';
import { t } from './index';

/**
 * Como `t()`, pero los huecos pueden ser elementos: `tx('Dominas {n} de {total}', { n: <b>3</b>, total })`.
 * Cada idioma coloca los huecos donde le corresponde por su gramática.
 */
export function tx(text: string, slots: Record<string, ReactNode>): ReactNode {
  return t(text)
    .split(/\{(\w+)\}/)
    .map((part, i) => (i % 2 ? <Fragment key={i}>{slots[part]}</Fragment> : part));
}
