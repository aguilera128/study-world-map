import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { t } from '../i18n';
import { Icon } from './Icon';

// «El planeta»: el interior de la Tierra y las capas de la atmósfera, para estudiarlas.
//
// Interior: radio de la Tierra 6371 km; corteza de 5 a 70 km; manto hasta 2900 km; núcleo externo
// hasta unos 5100 km; núcleo interno (1220 km de radio) hasta el centro. Contrastado con la
// Enciclopedia Británica («Earth's layers») y el USGS; el límite entre los dos núcleos varía entre
// 5100 y 5150 km según la fuente. Atmósfera, según NASA («Earth's Atmosphere: A Multi-layered
// Cake»): troposfera hasta unos 12 km, estratosfera hasta 50, mesosfera hasta 80, termosfera hasta
// 700 y exosfera por encima. El interior va a escala (menos la corteza, que no se vería); la atmósfera
// no, y se dice. El movimiento del manto y del núcleo es una ilustración, no un dato.

const EARTH_KM = 6371;
/** Radio exterior de cada capa, en km desde el centro, de dentro afuera. */
const INTERIOR = [
  { id: 'inner', radius: 1221, color: '#ffe08a', name: t('Núcleo interno'), detail: t('Hierro y níquel sólidos · de 5100 a 6371 km') },
  { id: 'outer', radius: 3471, color: '#f4a23a', name: t('Núcleo externo'), detail: t('Hierro y níquel líquidos · de 2900 a 5100 km') },
  { id: 'mantle', radius: 6336, color: '#d2562a', name: t('Manto'), detail: t('Roca que fluye muy despacio · hasta 2900 km de profundidad') },
  { id: 'crust', radius: EARTH_KM, color: '#8a6a48', name: t('Corteza'), detail: t('Roca sólida · de 5 a 70 km de grosor') },
];

/** De arriba abajo. */
const ATMOSPHERE = [
  { id: 'exo', color: '#0f1a33', name: t('Exosfera'), detail: t('Más de 700 km · se va diluyendo en el espacio') },
  { id: 'thermo', color: '#1d3566', name: t('Termosfera'), detail: t('De 80 a 700 km · auroras y Estación Espacial') },
  { id: 'meso', color: '#2f5c9c', name: t('Mesosfera'), detail: t('De 50 a 80 km · aquí se desintegran los meteoros') },
  { id: 'strato', color: '#5b93cf', name: t('Estratosfera'), detail: t('De 12 a 50 km · contiene la capa de ozono') },
  { id: 'tropo', color: '#a9d2f0', name: t('Troposfera'), detail: t('Hasta unos 12 km · aquí están las nubes y el tiempo') },
];

const CX = 150;
const CY = 150;
const R = 130;

/** Sector del cuadrante superior derecho, de radio `r`: lo que deja ver el corte. */
const sector = (r: number) => `M ${CX} ${CY} L ${CX} ${CY - r} A ${r} ${r} 0 0 1 ${CX + r} ${CY} Z`;

function Interior() {
  const px = (km: number) => (km / EARTH_KM) * R;
  // La corteza mediría menos de un píxel: se dibuja de 4 px.
  const mantle = R - 4;
  const outer = px(3471);
  const inner = px(1221);
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={t('Interior')} className="mx-auto w-full max-w-[13rem] wide:max-w-[19rem]">
      <defs>
        <clipPath id="planet-cut">
          <path d={sector(R)} />
        </clipPath>
        <radialGradient id="planet-sea" cx="38%" cy="34%">
          <stop offset="0" stopColor="#5fa3d6" />
          <stop offset="1" stopColor="#1f4f7d" />
        </radialGradient>
      </defs>
      {/* la Tierra por fuera, con unas manchas de tierra sin pretensión de mapa */}
      <circle cx={CX} cy={CY} r={R} fill="url(#planet-sea)" />
      <path d="M95 70c18-12 40-8 46 6s-10 30-26 34-34-22-20-40z M70 150c14-6 30 2 34 20s-6 44-18 52-26-58-16-72z M150 200c16-4 34 6 30 24s-22 30-34 22-10-40 4-46z" fill="#6f9a5c" opacity="0.85" />
      {/* el corte */}
      <path d={sector(R)} fill={INTERIOR[3].color} />
      <path d={sector(mantle)} fill={INTERIOR[2].color} />
      <path d={sector(outer)} fill={INTERIOR[1].color} />
      <path d={sector(inner)} fill={INTERIOR[0].color} />
      <g clipPath="url(#planet-cut)" fill="none" strokeLinecap="round">
        {/* convección del manto: la roca caliente sube, se enfría y vuelve a bajar */}
        {[18, 45, 72].map((angle) => (
          <ellipse
            key={angle}
            cx={CX}
            cy={CY - (mantle + outer) / 2}
            rx={(mantle - outer) * 0.2}
            ry={(mantle - outer) * 0.36}
            transform={`rotate(${angle} ${CX} ${CY})`}
            stroke="#ffd9a0"
            strokeWidth="1.6"
            strokeDasharray="5 7"
            opacity="0.75"
            className="planet-flow"
          />
        ))}
        {/* el hierro líquido del núcleo externo, en movimiento */}
        {[0.42, 0.62, 0.82].map((k, i) => (
          <circle
            key={k}
            cx={CX}
            cy={CY}
            r={inner + (outer - inner) * k}
            stroke="#fff1c2"
            strokeWidth="1.4"
            strokeDasharray="9 11"
            opacity="0.7"
            className={i % 2 ? 'planet-flow-back' : 'planet-flow'}
          />
        ))}
      </g>
      <path d={sector(inner)} fill="#fff6d6" className="planet-glow" />
      <path d={`M ${CX} ${CY - R} L ${CX} ${CY} L ${CX + R} ${CY}`} fill="none" stroke="#1b2a3a" strokeOpacity="0.35" />
    </svg>
  );
}

function Atmosphere() {
  const band = 46;
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={t('Atmósfera')} className="mx-auto w-full max-w-[13rem] wide:max-w-[19rem]">
      {ATMOSPHERE.map((layer, i) => (
        <rect key={layer.id} x="0" y={10 + i * band} width="300" height={band} fill={layer.color} />
      ))}
      {/* el suelo */}
      <path d="M0 240 Q 60 232 120 240 T 240 238 T 300 240 V 300 H 0 Z" fill="#6f9a5c" />
      <path d="M0 262 Q 80 254 150 262 T 300 258 V 300 H 0 Z" fill="#3f6f9c" />
      {/* exosfera: un satélite */}
      <g transform="translate(228 30)" fill="#dfe8f5">
        <rect x="-3" y="-3" width="6" height="6" />
        <rect x="-13" y="-2" width="8" height="4" />
        <rect x="5" y="-2" width="8" height="4" />
      </g>
      {/* termosfera: la aurora */}
      <path d="M20 96 Q 60 66 100 90 T 180 84 T 280 92" fill="none" stroke="#7df0b4" strokeWidth="6" strokeLinecap="round" opacity="0.6" className="planet-glow" />
      {/* mesosfera: un meteoro */}
      <line x1="215" y1="106" x2="175" y2="140" stroke="#ffe9b0" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="60" className="planet-meteor" />
      {/* estratosfera: la capa de ozono */}
      <line x1="0" y1="176" x2="300" y2="176" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 6" opacity="0.7" />
      {/* troposfera: nubes */}
      <g fill="#ffffff" opacity="0.95">
        <ellipse cx="70" cy="214" rx="26" ry="9" />
        <ellipse cx="84" cy="207" rx="16" ry="9" />
        <ellipse cx="205" cy="222" rx="22" ry="8" />
        <ellipse cx="194" cy="216" rx="13" ry="8" />
      </g>
    </svg>
  );
}

/** Botón de la barra superior y su ventana. */
export function PlanetButton({ labels }: { labels: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'interior' | 'atmosphere'>('interior');

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const layers = tab === 'interior' ? [...INTERIOR].reverse() : ATMOSPHERE;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title={t('El planeta por dentro y por fuera')} aria-label={t('El planeta')} className="btn btn-ghost min-h-10 justify-start px-2.5 text-sm">
        <Icon name="target" size={18} />
        <span className={labels}>{t('El planeta')}</span>
      </button>
      {createPortal(
      <dialog
        ref={ref}
        onClose={() => setOpen(false)}
        // un clic dentro no debe llegar al menú que contiene el botón (lo cerraría)
        onClick={(e) => {
          e.stopPropagation();
          if (e.target === ref.current) setOpen(false);
        }}
        className="planet-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[min(44rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-rule-strong bg-surface p-0 text-ink"
      >
        {open && (
          <div className="p-5 wide:p-7">
            <div className="flex items-start justify-between gap-4">
              <h2 className="display text-2xl">{t('El planeta por dentro y por fuera')}</h2>
              <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost min-h-10 px-3 text-sm">
                {t('Cerrar')}
              </button>
            </div>
            <div role="tablist" className="float mt-4 inline-flex p-0.5">
              {(
                [
                  ['interior', t('Interior')],
                  ['atmosphere', t('Atmósfera')],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={`min-h-10 rounded-[9px] px-4 text-sm font-bold transition-colors ${tab === id ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-5 grid items-center gap-6 wide:grid-cols-[19rem_1fr]">
              {tab === 'interior' ? <Interior /> : <Atmosphere />}
              <ul className="grid gap-3">
                {layers.map((layer) => (
                  <li key={layer.id} className="flex items-start gap-3">
                    <span className="mt-1 h-4 w-4 shrink-0 rounded-[4px] border border-rule-strong" style={{ background: layer.color }} />
                    <span>
                      <strong className="block">{layer.name}</strong>
                      <span className="text-sm text-ink-soft">{layer.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 border-t border-rule pt-3 text-sm text-ink-soft">
              {tab === 'interior'
                ? t('Los grosores están a escala, salvo la corteza, que se ha engrosado para que se vea. El movimiento del manto y del núcleo es una ilustración.')
                : t('Las alturas son aproximadas y el dibujo no está a escala: la troposfera sería una línea finísima.')}
            </p>
          </div>
        )}
      </dialog>,
        document.body,
      )}
    </>
  );
}
