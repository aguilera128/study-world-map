import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { formatArea, plural } from '../app/format';
import { useApp, useSettings } from '../app/store';
import { clockIn, differenceLabel, localOffsetMinutes, offsetLabel, offsetMinutes } from '../app/time';
import type { Atlas } from '../atlas/atlas';
import type { Country } from '../atlas/types';
import { resolveScope } from '../game/config';
import { normalize } from '../game/text';
import { useNow } from './hooks';
import { Icon } from './Icon';
import { Flag, Panel } from './primitives';
import { ScopeChips } from './ScopeChips';
import { LOCALE, t } from '../i18n';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-rule py-2.5">
      <dt className="label w-24 shrink-0">{label}</dt>
      <dd className="min-w-0 font-semibold">{children}</dd>
    </div>
  );
}

function CountryCard({ atlas, country }: { atlas: Atlas; country: Country }) {
  const select = useApp((s) => s.select);
  const sovereign = country.sovereign ? atlas.byIdOrThrow(country.sovereign) : null;
  const neighbors = country.neighbors.map((i) => atlas.countries[i]).sort((a, b) => a.name.localeCompare(b.name, LOCALE));
  const now = useNow(20_000);
  const time = country.tz ? clockIn(country.tz, now) : null;
  const offset = country.tz ? offsetMinutes(country.tz, now) : null;
  const kind =
    country.kind === 'country'
      ? null
      : sovereign
        ? t('Territorio de {x}', { x: sovereign.name })
        : country.kind === 'disputed'
          ? t('Territorio especial')
          : t('Territorio');

  return (
    <div style={{ animation: 'rise 0.4s var(--ease-out-soft) both' }}>
      <button type="button" onClick={() => select(-1)} className="btn btn-ghost -ml-3 mt-3 min-h-9 px-3 text-sm">
        <Icon name="back" size={16} />
        {t('Volver a la lista')}
      </button>
      <article className="cartouche mt-2 p-5">
        <div className="flex items-start gap-4">
          <Flag a2={country.a2} height={54} className="mt-1 rounded-md" />
          <div className="min-w-0">
            {kind && <p className="label">{kind}</p>}
            <h2 className="display text-[1.75rem]">{country.name}</h2>
          </div>
        </div>
        <dl className="mt-4">
          {country.capital && (
            <Fact label={t('Capital')}>
              {country.capital}
              {country.capitalNote && <span className="font-normal text-ink-soft"> ({country.capitalNote})</span>}
            </Fact>
          )}
          {country.continents.length > 0 && <Fact label={t('Continente')}>{atlas.continents[country.continents[0]]}</Fact>}
          {country.regions.length > 0 && country.regions[0].startsWith('am-') && (
            <Fact label={t('Región')}>{atlas.regions[country.regions[0]].name}</Fact>
          )}
          {time && offset !== null && (
            <Fact label={t('Hora local')}>
              <span className="tabular">{time}</span>
              <span className="font-normal text-ink-soft">
                {country.tzMulti && country.capital ? ` ${t('en {place}', { place: country.capital })}` : ''} · {offsetLabel(offset)} ·{' '}
                {differenceLabel(offset - localOffsetMinutes(now))}
              </span>
            </Fact>
          )}
          {country.areaKm2 && <Fact label={t('Superficie')}>{formatArea(country.areaKm2)}</Fact>}
          {neighbors.length > 0 && (
            <Fact label={t('Vecinos')}>
              <span className="flex flex-wrap gap-1.5">
                {neighbors.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => select(n.index, true)}
                    className="tile px-2 py-0.5 text-sm font-semibold"
                    title={t('Ver {x}', { x: n.name })}
                  >
                    {n.name}
                  </button>
                ))}
              </span>
            </Fact>
          )}
        </dl>
        {country.note && <p className="mt-3 border-t border-rule pt-3 text-sm text-ink-soft">{country.note}</p>}
      </article>
    </div>
  );
}

/**
 * Para estudiar antes de jugar: la tabla de los países elegidos (con su continente y su capital)
 * y la ficha de cualquiera que se toque en el mapa o en la lista.
 */
export function ExplorePanel() {
  const atlas = useApp((s) => s.atlas)!;
  const selected = useApp((s) => s.selected);
  const select = useApp((s) => s.select);
  const scopeId = useApp((s) => s.exploreScope);
  const setScope = useApp((s) => s.setExploreScope);
  const go = useApp((s) => s.go);
  const lists = useSettings((s) => s.lists);
  const setConfig = useSettings((s) => s.setConfig);
  const [query, setQuery] = useState('');

  const scope = useMemo(() => resolveScope(atlas, scopeId, lists), [atlas, scopeId, lists]);
  const q = normalize(query);
  // Con texto en el buscador se busca en todo el mapa (territorios incluidos); sin él, se ve la lista elegida.
  const rows = useMemo(() => {
    const pool = q ? atlas.countries : scope.countries.map((i) => atlas.countries[i]);
    const sorted = [...pool].sort((a, b) => a.name.localeCompare(b.name, LOCALE));
    if (!q) return sorted;
    const keys = (c: Country) => [c.name, ...c.aliases, c.capital ?? ''].map(normalize).filter(Boolean);
    const starts = sorted.filter((c) => keys(c).some((k) => k.startsWith(q)));
    const contains = sorted.filter((c) => !starts.includes(c) && keys(c).some((k) => k.includes(q)));
    return [...starts, ...contains];
  }, [atlas, scope, q]);

  const pick = (country: Country) => {
    select(country.index, true);
    setQuery('');
  };

  return (
    <Panel label={t('Explorar el mapa')}>
      <p className="label" style={order(0)}>
        {t('Explorar y estudiar')}
      </p>
      <h1 className="display mt-2.5 text-[1.75rem] wide:text-[2.1rem]" style={order(1)}>
        {t('Estúdialos antes de jugar')}
      </h1>

      <form
        className="relative mt-4"
        style={order(2)}
        onSubmit={(e) => {
          e.preventDefault();
          if (q && rows[0]) pick(rows[0]);
        }}
      >
        <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-3 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected >= 0) select(-1);
          }}
          placeholder={t('Buscar país o capital…')}
          aria-label={t('Buscar país o capital')}
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full rounded-[10px] border border-rule-strong bg-surface pl-10 pr-4 font-semibold outline-none placeholder:font-normal placeholder:text-ink-faint focus:border-ink"
        />
      </form>

      {selected >= 0 ? (
        <CountryCard key={selected} atlas={atlas} country={atlas.countries[selected]} />
      ) : (
        <>
          {!q && (
            <div className="mt-4" style={order(3)}>
              <ScopeChips value={scope.id} onChange={setScope} />
            </div>
          )}

          <div className="mt-4 flex items-baseline justify-between gap-3" style={order(4)}>
            <h2 className="label">{q ? `${t('Resultados')} · ${rows.length}` : plural(rows.length, t('país'), t('países'))}</h2>
            {!q && (
              <button
                type="button"
                onClick={() => {
                  setConfig({ scope: scope.id });
                  go('home');
                }}
                className="label transition-colors hover:text-accent"
              >
                {t('Practicar estos →')}
              </button>
            )}
          </div>
          <ul className="mt-1.5" style={order(5)}>
            {rows.map((country) => (
              <li key={country.id} className="border-t border-rule">
                <button
                  type="button"
                  onClick={() => pick(country)}
                  className="flex w-full items-center gap-3 px-1 py-2 text-left transition-colors hover:bg-[rgb(var(--shadow)/0.06)]"
                >
                  <Flag a2={country.a2} height={16} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold leading-tight">{country.name}</span>
                    {country.capital && <span className="block truncate text-xs text-ink-soft">{country.capital}</span>}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-ink-soft">
                    {country.continents.length ? atlas.continents[country.continents[0]] : t('Territorio')}
                  </span>
                </button>
              </li>
            ))}
            {rows.length === 0 && <li className="border-t border-rule py-4 text-sm text-ink-soft">{t('No hay ningún país con ese nombre.')}</li>}
          </ul>
        </>
      )}

      <button type="button" onClick={() => go('home')} className="btn btn-ghost -ml-3 mt-5 min-h-10 px-3 text-sm" style={order(6)}>
        <Icon name="back" size={16} />
        {t('Volver a los retos')}
      </button>
    </Panel>
  );
}
