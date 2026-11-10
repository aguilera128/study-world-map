import type { ReactNode } from 'react';
import { plural } from '../app/format';
import { useSettings } from '../app/store';
import { REGION_FILTERS } from '../game/config';
import { Icon } from './Icon';
import { t } from '../i18n';

/** Selector de qué países entran: las regiones del mundo y las listas de estudio guardadas. */
export function ScopeChips({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (scope: string) => void;
  /** Botones extra al final (p. ej. «Elegir países»). */
  children?: ReactNode;
}) {
  const lists = useSettings((s) => s.lists);
  return (
    <div role="radiogroup" aria-label={t('Países que entran')} className="flex flex-wrap gap-1.5">
      {REGION_FILTERS.map((r) => (
        <button
          key={r.id}
          type="button"
          role="radio"
          aria-checked={value === r.id}
          onClick={() => onChange(r.id)}
          className="tile min-h-9 px-3 text-sm font-semibold"
        >
          {r.label}
        </button>
      ))}
      {lists.map((list) => (
        <button
          key={list.id}
          type="button"
          role="radio"
          aria-checked={value === list.id}
          onClick={() => onChange(list.id)}
          className="tile flex min-h-9 items-center gap-1.5 px-3 text-sm font-semibold"
          title={`${t('Lista de estudio')}: ${plural(list.countries.length, t('país'), t('países'))}`}
        >
          <Icon name="list" size={15} />
          {t(list.name)}
        </button>
      ))}
      {children}
    </div>
  );
}
