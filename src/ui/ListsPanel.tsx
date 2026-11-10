import { useMemo, useState, type CSSProperties } from 'react';
import { plural } from '../app/format';
import { newListId, shareUrl } from '../app/share';
import { useApp, useSettings } from '../app/store';
import type { Atlas } from '../atlas/atlas';
import type { ContinentKey, Country } from '../atlas/types';
import type { StudyList } from '../game/config';
import { normalize } from '../game/text';
import { Icon } from './Icon';
import { Flag, Panel, Segmented } from './primitives';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

/** Continente bajo el que se agrupa cada país en el selector (los repartidos, donde se suelen estudiar). */
const groupOf = (country: Country): ContinentKey => (country.continents[0] === 'europa-asia' ? (country.regions[0] as ContinentKey) : country.continents[0]);

const GROUPS: ContinentKey[] = ['europa', 'asia', 'africa', 'america', 'oceania'];

function ListRow({ list }: { list: StudyList }) {
  const go = useApp((s) => s.go);
  const setDraft = useApp((s) => s.setDraft);
  const setConfig = useSettings((s) => s.setConfig);
  const deleteList = useSettings((s) => s.deleteList);
  const [state, setState] = useState<'idle' | 'copied' | 'link' | 'deleting'>('idle');
  const url = shareUrl(list);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      setTimeout(() => setState('idle'), 2200);
    } catch {
      // Sin permiso para el portapapeles: se enseña el enlace para copiarlo a mano.
      setState('link');
    }
  };

  return (
    <li className="rounded-[10px] border border-rule-strong bg-surface p-3">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{list.name}</p>
          <p className="text-sm text-ink-soft">{plural(list.countries.length, 'país', 'países')}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setConfig({ scope: list.id });
            go('home');
          }}
          className="btn btn-primary min-h-9 px-3 text-sm"
        >
          Practicar
        </button>
      </div>
      <div className="-ml-1.5 mt-2 flex flex-wrap items-center gap-x-0.5 text-sm">
        {state === 'deleting' ? (
          <>
            <span className="mr-1 text-ink-soft">¿Eliminar esta lista?</span>
            <button type="button" onClick={() => deleteList(list.id)} className="btn min-h-8 px-2.5 text-sm text-bad">
              Sí, eliminar
            </button>
            <button type="button" onClick={() => setState('idle')} className="btn min-h-8 px-2.5 text-sm">
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setDraft({ ...list, countries: [...list.countries] })} className="btn btn-ghost min-h-8 gap-1.5 px-1.5 text-sm">
              <Icon name="pencil" size={15} />
              Editar
            </button>
            <button type="button" onClick={share} className="btn btn-ghost min-h-8 gap-1.5 px-1.5 text-sm">
              <Icon name={state === 'copied' ? 'check' : 'link'} size={15} />
              {state === 'copied' ? 'Enlace copiado' : 'Compartir'}
            </button>
            <button type="button" onClick={() => setState('deleting')} className="btn btn-ghost min-h-8 gap-1.5 px-1.5 text-sm">
              <Icon name="trash" size={15} />
              Eliminar
            </button>
          </>
        )}
      </div>
      {state === 'link' && (
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label="Enlace para compartir la lista"
          className="mt-2 w-full rounded-md border border-rule-strong bg-sunken px-2 py-1.5 text-xs"
        />
      )}
    </li>
  );
}

function Editor({ atlas, draft }: { atlas: Atlas; draft: StudyList }) {
  const setDraft = useApp((s) => s.setDraft);
  const toggle = useApp((s) => s.toggleDraftCountry);
  const saveList = useSettings((s) => s.saveList);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<'all' | 'on' | 'off'>('all');

  const groups = useMemo(() => {
    const sorted = atlas.quizzable.map((i) => atlas.countries[i]).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return GROUPS.map((key) => ({ key, countries: sorted.filter((c) => groupOf(c) === key) }));
  }, [atlas]);
  const chosen = useMemo(() => new Set(draft.countries), [draft.countries]);
  const q = normalize(query);

  const setMany = (ids: string[], on: boolean) => {
    const next = new Set(draft.countries);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    setDraft({ ...draft, countries: [...next] });
  };

  const save = () => {
    saveList({ ...draft, name: draft.name.trim() || 'Mi lista' });
    setDraft(null);
  };

  return (
    <>
      <p className="label" style={order(0)}>
        Lista de estudio
      </p>
      <input
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        placeholder="Nombre de la lista (p. ej. Examen del martes)"
        aria-label="Nombre de la lista"
        maxLength={60}
        className="display mt-3 w-full border-b-2 border-rule-strong bg-transparent pb-1 text-[1.6rem] outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-faint focus:border-ink"
        style={order(1)}
      />
      <p className="mt-3 text-sm text-ink-soft" style={order(2)}>
        Marca los países que entran en el examen. También puedes <strong className="text-ink">tocarlos en el mapa</strong>.
      </p>

      <div className="relative mt-4" style={order(3)}>
        <Icon name="search" size={17} className="pointer-events-none absolute left-3 top-3 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar países…"
          aria-label="Filtrar países"
          className="min-h-10 w-full rounded-[10px] border border-rule-strong bg-surface pl-9 pr-3 text-sm font-semibold outline-none placeholder:font-normal placeholder:text-ink-faint focus:border-ink"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2" style={order(3)}>
        <Segmented
          label="Qué países se ven"
          value={show}
          onChange={setShow}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'on', label: `Marcados (${draft.countries.length})` },
            { value: 'off', label: 'Sin marcar' },
          ]}
        />
        {draft.countries.length > 0 && (
          <button
            type="button"
            onClick={() => setDraft({ ...draft, countries: [] })}
            className="text-xs font-bold text-ink-soft underline decoration-rule-strong underline-offset-4 hover:text-ink"
          >
            Vaciar la lista
          </button>
        )}
      </div>

      <div className="mt-3 space-y-4" style={order(4)}>
        {groups.map(({ key, countries }) => {
          const visible = countries.filter(
            (c) =>
              (show === 'all' || chosen.has(c.id) === (show === 'on')) &&
              (!q || [c.name, ...c.aliases].some((n) => normalize(n).includes(q))),
          );
          if (!visible.length) return null;
          const ids = visible.map((c) => c.id);
          const all = ids.every((id) => chosen.has(id));
          return (
            <section key={key}>
              <div className="mb-1.5 flex items-center justify-between">
                <h2 className="label">
                  {atlas.continents[key]} · {countries.filter((c) => chosen.has(c.id)).length}/{countries.length}
                </h2>
                <button type="button" onClick={() => setMany(ids, !all)} className="text-xs font-bold text-ink-soft underline decoration-rule-strong underline-offset-4 hover:text-ink">
                  {all ? 'Quitar todos' : 'Marcar todos'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visible.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={chosen.has(c.id)}
                    onClick={() => toggle(c.id)}
                    className="tile flex min-h-8 items-center gap-1.5 px-2 text-sm font-semibold"
                  >
                    <Flag a2={c.a2} height={12} />
                    {c.name}
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-5 flex items-center gap-2.5 border-t border-rule bg-[var(--surface)] px-5 py-3 wide:-ml-10 wide:-mr-6 wide:bg-[var(--paper)] wide:pl-10 wide:pr-0" style={order(5)}>
        <button type="button" onClick={save} disabled={!draft.countries.length} className="btn btn-accent min-h-11 px-5">
          Guardar · {plural(draft.countries.length, 'país', 'países')}
        </button>
        <button type="button" onClick={() => setDraft(null)} className="btn btn-ghost min-h-11 px-3">
          Cancelar
        </button>
      </div>
    </>
  );
}

/** Listas de estudio: selecciones de países para preparar un examen concreto. */
export function ListsPanel() {
  const atlas = useApp((s) => s.atlas)!;
  const draft = useApp((s) => s.draft);
  const setDraft = useApp((s) => s.setDraft);
  const go = useApp((s) => s.go);
  const lists = useSettings((s) => s.lists);

  return (
    <Panel label="Mis listas de estudio">
      {draft ? (
        <Editor atlas={atlas} draft={draft} />
      ) : (
        <>
          <p className="label" style={order(0)}>
            Mis listas
          </p>
          <h1 className="display mt-3 text-[2rem] wide:text-[2.5rem]" style={order(1)}>
            Estudia justo lo que entra en el examen
          </h1>
          <p className="mt-2 text-ink-soft" style={order(2)}>
            Crea una lista con los países que te han pedido y úsala en cualquier reto. Puedes compartirla con tu clase
            con un enlace.
          </p>

          <ul className="mt-5 space-y-2" style={order(3)}>
            {lists.map((list) => (
              <ListRow key={list.id} list={list} />
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2.5" style={order(4)}>
            <button type="button" onClick={() => setDraft({ id: newListId(), name: '', countries: [] })} className="btn btn-accent min-h-12 px-5">
              <Icon name="plus" size={18} />
              Nueva lista
            </button>
            <button type="button" onClick={() => go('home')} className="btn btn-ghost min-h-12 px-4">
              Volver
            </button>
          </div>
        </>
      )}
    </Panel>
  );
}
