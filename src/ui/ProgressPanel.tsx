import { useMemo, useState, type CSSProperties } from 'react';
import { useApp, useMapDef, useProgress, useSettings } from '../app/store';
import { createCode, deleteRemote, formatCode, joinCode, leaveSync, syncLink, useSync } from '../app/sync';
import { PALETTES, Style } from '../engine/palette';
import { modesOf, resolveScope } from '../game/config';
import { MASTERY_LABELS, summarize } from '../game/progress';
import { MODE_ICONS } from './modeIcons';
import { useTheme } from './hooks';
import { Icon } from './Icon';
import { Panel, Segmented } from './primitives';
import { QrCode } from './QrCode';
import { t } from '../i18n';
import { tx } from '../i18n/tx';

const order = (i: number) => ({ '--i': i }) as CSSProperties;

/** Barra apilada con cuántos países hay en cada nivel de dominio. */
function LevelBar({ levels, total, colors }: { levels: number[]; total: number; colors: string[] }) {
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-sunken">
      {[4, 3, 2, 1].map((level) => (
        <div
          key={level}
          className="transition-[width] duration-700"
          style={{ width: `${total ? (levels[level] / total) * 100 : 0}%`, background: colors[level] }}
        />
      ))}
    </div>
  );
}

/** Llevar el progreso a otro dispositivo con un código, sin cuentas. */
function SyncCard() {
  const { code, status, at } = useSync();
  const [entry, setEntry] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const run = async (action: () => Promise<string | null>) => {
    setBusy(true);
    setError(await action());
    setBusy(false);
  };

  return (
    <section className="mt-6 rounded-[12px] border border-rule-strong bg-surface p-4" aria-label={t('Seguir en otro dispositivo')}>
      <h2 className="label">{t('Seguir en otro dispositivo')}</h2>
      {code ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <QrCode text={syncLink(code)} label={t('Código QR para abrir este progreso en otro dispositivo')} />
            <div className="min-w-0">
              <p className="display tabular text-2xl tracking-wide">{formatCode(code)}</p>
              <p className="mt-1 text-sm text-ink-soft">{t('Escanéalo con la cámara del móvil o escribe el código.')}</p>
            </div>
          </div>
          {/* Una vez sincronizado, el texto no cambia cada vez que se vuelve a sincronizar (parpadeaba y
              movía los botones); y ocupa siempre dos líneas, que es lo que mide el más largo. */}
          <p className="mt-1 min-h-10 text-sm text-ink-soft">
            {status === 'offline'
              ? t('Sin conexión: se sincronizará cuando vuelva.')
              : !at
                ? t('Sincronizando…')
                : t('Sincronizado. Escribe este código en el otro dispositivo o abre allí el enlace.')}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn min-h-10 px-3 text-sm"
              onClick={() => {
                void navigator.clipboard?.writeText(syncLink(code)).then(() => setCopied(true));
              }}
            >
              <Icon name="link" size={16} />
              {copied ? t('Enlace copiado') : t('Copiar enlace')}
            </button>
            {/* Abre el correo del propio usuario con el código ya escrito: no pasa por nuestro servidor. */}
            <a
              className="btn min-h-10 px-3 text-sm no-underline"
              href={`mailto:?subject=${encodeURIComponent(t('Mi código de Study World Map'))}&body=${encodeURIComponent(
                `${t('Mi código para seguir en otro dispositivo: {code}', { code: formatCode(code) })}\n\n${syncLink(code)}`,
              )}`}
            >
              {t('Enviarme el código')}
            </a>
            <button type="button" className="btn btn-ghost min-h-10 px-3 text-sm" onClick={leaveSync}>
              {t('Dejar de sincronizar')}
            </button>
            <button type="button" disabled={busy} className="btn btn-ghost min-h-10 px-3 text-sm text-bad" onClick={() => void run(deleteRemote)}>
              {t('Borrar lo guardado con este código')}
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-faint">{t('Quien tenga el código puede ver y cambiar este progreso. No guardamos ningún dato personal.')}</p>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-soft">{t('Crea un código y úsalo en el móvil, la tableta o el ordenador para seguir donde lo dejaste. Sin cuentas ni correo.')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button type="button" disabled={busy} className="btn btn-accent min-h-10 px-3 text-sm" onClick={() => void run(createCode)}>
              {t('Crear mi código')}
            </button>
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void run(() => joinCode(entry));
            }}
          >
            <input
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder={t('Ya tengo un código')}
              aria-label={t('Ya tengo un código')}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="tabular min-h-10 min-w-0 flex-1 rounded-[10px] border border-rule-strong bg-paper px-3 text-sm uppercase placeholder:normal-case"
            />
            <button type="submit" disabled={busy || !entry.trim()} className="btn min-h-10 px-3 text-sm">
              {t('Usar')}
            </button>
          </form>
        </>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-bad">
          {error}
        </p>
      )}
    </section>
  );
}

/** Lo aprendido hasta ahora, por reto y por zona. El mapa se colorea según el dominio de cada país. */
export function ProgressPanel() {
  const atlas = useApp((s) => s.atlas)!;
  const def = useMapDef();
  const mode = useApp((s) => s.progressMode);
  const setMode = useApp((s) => s.setProgressMode);
  const start = useApp((s) => s.start);
  const go = useApp((s) => s.go);
  const progress = useProgress((s) => s.progress);
  const reset = useProgress((s) => s.reset);
  const lists = useSettings((s) => s.lists);
  const setConfig = useSettings((s) => s.setConfig);
  const [confirming, setConfirming] = useState(false);
  // Los mismos colores con los que el mapa pinta cada nivel de dominio.
  const theme = useTheme();
  const colors = MASTERY_LABELS.map((_, level) => PALETTES[theme].styles[Style.mastery + level].color);

  const rows = useMemo(() => {
    const scopes = [...def.filters.map((r) => r.id), ...(def.extras ? lists.map((l) => l.id) : [])].map((id) => resolveScope(atlas, id, lists));
    return scopes.map((scope) => ({
      scope,
      summary: summarize(
        progress,
        scope.countries.map((i) => atlas.countries[i].id),
        mode,
      ),
    }));
  }, [atlas, def, lists, progress, mode]);
  const world = rows[0].summary;
  const hasProgress = atlas.quizzable.some((i) => progress[atlas.countries[i].id]);

  const practice = (scope: string) => {
    setConfig({ mode, scope, length: 20 });
    start();
  };

  return (
    <Panel label={t('Mi progreso')}>
      <p className="label" style={order(0)}>
        {t('Mi progreso')}
      </p>
      <h1 className="display mt-3 text-[2rem] wide:text-[2.5rem]" style={order(1)}>
        {world.mastered > 0 ? (
          tx(def.text.mastered, { n: <span className="text-ok">{world.mastered}</span>, total: world.total })
        ) : (
          t('Tu mapa de lo aprendido')
        )}
      </h1>
      <p className="mt-2 text-ink-soft" style={order(2)}>
        {t('Cada acierto a la primera sube un país de nivel; un fallo lo devuelve al principio. Lo que peor llevas sale más a menudo en las partidas.')}
      </p>

      <div className="mt-5" style={order(3)}>
        <Segmented
          label={t('Reto')}
          value={mode}
          onChange={setMode}
          options={modesOf(atlas.map).map((m) => ({
            value: m.id,
            label: (
              <>
                <Icon name={MODE_ICONS[m.id]} size={15} />
                {m.title}
              </>
            ),
          }))}
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-ink-soft" style={order(4)}>
        {MASTERY_LABELS.map((label, level) => (
          <li key={label} className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px] border border-rule-strong" style={{ background: colors[level] }} />
            {label}
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-1" style={order(5)}>
        {rows.map(({ scope, summary }) => (
          <li key={scope.id}>
            <button
              type="button"
              onClick={() => practice(scope.id)}
              className="group block w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-[rgb(var(--shadow)/0.07)]"
              title={t('Practicar {x}', { x: scope.label })}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-1.5 font-semibold">
                  {scope.isList && <Icon name="list" size={14} />}
                  {scope.label}
                </span>
                <span className="tabular text-sm text-ink-soft">
                  <span className="group-hover:hidden">
                    {summary.mastered} / {summary.total}
                  </span>
                  <span className="hidden font-bold text-accent group-hover:inline">{t('Practicar →')}</span>
                </span>
              </div>
              <LevelBar levels={summary.levels} total={summary.total} colors={colors} />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-2.5" style={order(6)}>
        <button type="button" onClick={() => practice(def.filters[0].id)} className="btn btn-accent min-h-12 px-5">
          {t('Practicar lo que peor llevo')}
          <Icon name="arrow" size={18} />
        </button>
        <button type="button" onClick={() => go('home')} className="btn btn-ghost min-h-12 px-4">
          {t('Volver')}
        </button>
      </div>

      {hasProgress && (
        <div className="mt-6 text-sm text-ink-soft" style={order(7)}>
          {confirming ? (
            <span className="flex flex-wrap items-center gap-2">
              {t('¿Borrar todo lo aprendido y los récords?')}
              <button
                type="button"
                onClick={() => {
                  reset(atlas);
                  setConfirming(false);
                }}
                className="btn min-h-8 px-3 text-sm text-bad"
              >
                {t('Sí, borrar')}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn min-h-8 px-3 text-sm">
                {t('Cancelar')}
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="underline decoration-rule-strong underline-offset-4 hover:text-ink">
              {t('Borrar mi progreso')}
            </button>
          )}
        </div>
      )}
      <SyncCard />
    </Panel>
  );
}
