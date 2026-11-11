import { useEffect, useState, type FormEvent } from 'react';
import { formatGrade, formatTime } from '../app/format';
import { loadTop, publish, startingNick } from '../app/ranking';
import { cleanNick, NICK_MAX, qualifies, suggestNick, type RankResult, type RankRow } from '../game/ranking';
import { Icon } from './Icon';
import { Flag } from './primitives';
import { t } from '../i18n';

type Notice = 'published' | 'kept' | 'nick' | 'later' | null;

/**
 * Los diez mejores de una categoría. Con `result` (el de la partida que se acaba de terminar), si
 * entra entre ellos se ofrece publicarlo con un apodo: uno propuesto, que se puede cambiar.
 */
export function Ranking({ category, result }: { category: string; result?: RankResult }) {
  const [top, setTop] = useState<RankRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [nick, setNick] = useState(startingNick);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  /** El apodo con el que se ha publicado, para señalar la fila propia. */
  const [mine, setMine] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    setTop(null);
    setFailed(false);
    setNotice(null);
    setMine(null);
    loadTop(category, abort.signal)
      .then(setTop)
      .catch(() => !abort.signal.aborted && setFailed(true));
    return () => abort.abort();
  }, [category]);

  const canPublish = !!result && !!top && !mine && notice !== 'kept' && qualifies(result, top);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!result || busy) return;
    const clean = cleanNick(nick);
    if (!clean) return setNotice('nick');
    setBusy(true);
    const sent = await publish(category, clean, result);
    setBusy(false);
    if (!sent.ok) return setNotice(sent.reason);
    setTop(sent.top);
    if (sent.entered) setMine(clean);
    setNotice(sent.entered ? 'published' : 'kept');
  };

  return (
    <section className="rounded-[12px] border border-rule-strong bg-surface px-3.5 py-3">
      <h2 className="label flex items-center gap-1.5">
        <Icon name="chart" size={14} />
        {t('Ranking · los 10 mejores')}
      </h2>

      {failed ? (
        <p className="mt-2 text-sm text-ink-soft">{t('No se ha podido cargar el ranking.')}</p>
      ) : !top ? (
        <p className="mt-2 text-sm text-ink-faint">{t('Cargando el ranking…')}</p>
      ) : top.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">
          {t('Todavía no hay resultados.')} {canPublish && t('El primero puede ser el tuyo.')}
        </p>
      ) : (
        <ol className="mt-2 text-sm" aria-label={t('Ranking · los 10 mejores')}>
          {top.map((row, i) => {
            const own = mine !== null && row.nick === mine;
            return (
              <li key={`${row.nick}-${row.at}`} className={`flex min-h-8 items-center gap-2.5 rounded-md px-1.5 ${own ? 'bg-highlight font-bold text-[#1b2a3a]' : ''}`}>
                <span className={`tabular w-5 shrink-0 text-right ${own ? '' : 'text-ink-faint'}`}>{i + 1}</span>
                <Flag a2={row.country} height={15} />
                <span className="min-w-0 flex-1 truncate font-semibold">{row.nick}</span>
                <span className="tabular shrink-0 font-bold">{formatGrade(row.grade)}</span>
                <span className={`tabular w-12 shrink-0 text-right ${own ? '' : 'text-ink-soft'}`}>{formatTime(row.ms)}</span>
              </li>
            );
          })}
        </ol>
      )}

      {canPublish && (
        <form onSubmit={submit} className="mt-3 border-t border-rule pt-3">
          <p className="text-sm font-bold">{t('¡Tu resultado entra en el ranking!')}</p>
          <div className="mt-2 flex gap-2">
            <input
              value={nick}
              onChange={(e) => {
                setNick(e.target.value);
                setNotice(null);
              }}
              maxLength={NICK_MAX}
              aria-label={t('Tu apodo')}
              placeholder={t('Tu apodo')}
              autoComplete="off"
              spellCheck={false}
              className="min-h-10 min-w-0 flex-1 rounded-[10px] border border-rule-strong bg-paper px-3 text-sm font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                setNick(suggestNick());
                setNotice(null);
              }}
              title={t('Sugerir otro apodo')}
              aria-label={t('Sugerir otro apodo')}
              className="btn btn-ghost min-h-10 px-2.5"
            >
              <Icon name="replay" size={16} />
            </button>
            <button type="submit" disabled={busy || !nick.trim()} className="btn btn-accent min-h-10 px-3.5 text-sm">
              {busy ? t('Publicando…') : t('Publicar')}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            {t('No pongas tu nombre, apellidos ni otros datos personales. Se publicará con tu nota, tu tiempo y la bandera del país desde el que te conectas.')}
          </p>
        </form>
      )}

      <div aria-live="polite">
        {notice === 'nick' && <p className="mt-2 text-sm font-semibold text-bad">{t('Ese apodo no vale. Usa de 2 a 16 letras o cifras, sin datos personales.')}</p>}
        {notice === 'later' && <p className="mt-2 text-sm font-semibold text-bad">{t('No se ha podido publicar. Prueba más tarde.')}</p>}
        {notice === 'kept' && <p className="mt-2 text-sm text-ink-soft">{t('Ese apodo ya tiene un resultado mejor en este ranking.')}</p>}
        {notice === 'published' && <p className="mt-2 text-sm font-semibold text-ok">{t('Publicado. ¡Enhorabuena!')}</p>}
      </div>
      {result && top && top.length > 0 && !canPublish && !notice && (
        <p className="mt-2 text-sm text-ink-soft">{t('Tu resultado no entra entre los diez mejores.')}</p>
      )}

      {top && top.length > 0 && (
        <p className="mt-2 text-xs">
          <a
            href={`mailto:hola@studyworldmap.com?subject=${encodeURIComponent('Study World Map: ranking')}`}
            className="text-ink-faint underline decoration-rule-strong underline-offset-4 hover:text-accent"
          >
            {t('Avisar de un apodo inadecuado')}
          </a>
        </p>
      )}
    </section>
  );
}
