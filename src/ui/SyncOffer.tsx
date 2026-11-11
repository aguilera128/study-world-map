import { useState, type CSSProperties } from 'react';
import { useApp } from '../app/store';
import { createCode, formatCode, syncLink, useSync } from '../app/sync';
import { Icon } from './Icon';
import { t } from '../i18n';

const DISMISSED_KEY = 'swm:sin-oferta';

const dismissed = () => {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * Al terminar una partida, a quien no tiene código se le pregunta si quiere uno para seguir más
 * tarde o en otro dispositivo, y se crea ahí mismo. Nada se envía hasta que pulsa el botón. Quien
 * dice que no deja de ver la pregunta: se queda la nota de una línea, que lleva a «Progreso».
 */
export function SyncOffer({ style }: { style?: CSSProperties }) {
  const code = useSync((s) => s.code);
  const go = useApp((s) => s.go);
  // Solo se ofrece a quien llegó aquí sin código; si lo crea, la tarjeta se queda para enseñárselo.
  const [offered] = useState(() => code === null);
  const [hidden, setHidden] = useState(dismissed);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  if (!offered) return null;

  if (hidden && !code) {
    return (
      <p className="mt-5 text-sm text-ink-soft" style={style}>
        {t('Tu progreso se guarda solo en este dispositivo.')}{' '}
        <button type="button" onClick={() => go('progress')} className="font-semibold text-ink underline decoration-rule-strong underline-offset-4 hover:text-accent">
          {t('Crea un código para seguir en el móvil o en otro ordenador')}
        </button>
      </p>
    );
  }

  return (
    <section className="mt-5 rounded-[12px] border border-rule-strong bg-surface px-3.5 py-3" style={style} aria-live="polite">
      <h2 className="flex items-center gap-1.5 text-sm font-bold">
        <Icon name="link" size={16} className="shrink-0 text-accent" />
        {t('¿Quieres seguir más tarde o en otro dispositivo?')}
      </h2>
      {code ? (
        <>
          <p className="display tabular mt-2 text-xl tracking-wide">{formatCode(code)}</p>
          <p className="mt-1 text-sm text-ink-soft">{t('Sincronizado. Escribe este código en el otro dispositivo o abre allí el enlace.')}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button type="button" className="btn min-h-10 px-3 text-sm" onClick={() => void navigator.clipboard?.writeText(syncLink(code)).then(() => setCopied(true))}>
              <Icon name="link" size={16} />
              {copied ? t('Enlace copiado') : t('Copiar enlace')}
            </button>
          </div>
          <p className="mt-2.5 text-xs text-ink-faint">{t('Quien tenga el código puede ver y cambiar este progreso. No guardamos ningún dato personal.')}</p>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">{t('Crea un código y úsalo en el móvil, la tableta o el ordenador para seguir donde lo dejaste. Sin cuentas ni correo.')}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              className="btn btn-accent min-h-10 px-3.5 text-sm"
              onClick={async () => {
                setBusy(true);
                setError(await createCode());
                setBusy(false);
              }}
            >
              {t('Crear mi código')}
            </button>
            <button
              type="button"
              className="btn btn-ghost min-h-10 px-3 text-sm"
              onClick={() => {
                try {
                  localStorage.setItem(DISMISSED_KEY, '1');
                } catch {
                  // sin almacenamiento: se volverá a preguntar en la próxima partida
                }
                setHidden(true);
              }}
            >
              {t('Ahora no')}
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-semibold text-bad">{error}</p>}
        </>
      )}
    </section>
  );
}
