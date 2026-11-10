import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getEngine } from '../app/engineRef';
import { useSettings } from '../app/store';
import { t } from '../i18n';
import { Icon } from './Icon';
import { LAND_GLOBE, LAND_LIMB } from './planetLand';
import { ATMOSPHERE, EARTH_KM, INTERIOR } from './planetLayers';

// «El planeta»: el interior de la Tierra y las capas de la atmósfera, para estudiarlas.
//
// Interior: radio de la Tierra 6371 km; corteza de 5 a 70 km; manto hasta 2900 km; núcleo externo
// hasta unos 5100 km; núcleo interno (1220 km de radio) hasta el centro. Contrastado con la
// Enciclopedia Británica («Earth's layers») y el USGS; el límite entre los dos núcleos varía entre
// 5100 y 5150 km según la fuente. Atmósfera, según NASA («Earth's Atmosphere: A Multi-layered
// Cake»): troposfera hasta unos 12 km, estratosfera hasta 50, mesosfera hasta 80, termosfera hasta
// 700 y exosfera por encima. El interior va a escala (menos la corteza, que no se vería); la atmósfera
// no, y se dice. El movimiento del manto y del núcleo es una ilustración, no un dato.

/**
 * El gajo abierto tal como se ve en el globo: un triángulo esférico con un vértice en el polo y dos
 * en el ecuador. Con el centro de la Tierra en el origen y radio 1, cada capa es este mismo contorno
 * reducido a su radio, así que el dibujo guarda la escala.
 */
const WEDGE = 'M0 -0.914 Q0.74 -0.6 0.707 0.287 Q0 0.56 -0.707 0.287 Q-0.74 -0.6 0 -0.914 Z';
/** Dos de las tres caras del corte, para sombrearlas: la izquierda y la del ecuador. */
const FACE_LEFT = 'M0 0 L0 -0.914 Q-0.74 -0.6 -0.707 0.287 Z';
const FACE_FLOOR = 'M0 0 L-0.707 0.287 Q0 0.56 0.707 0.287 Z';

function Interior() {
  const R = 128;
  const k = (km: number) => km / EARTH_KM;
  // La corteza mediría menos de un píxel: se dibuja con el 3 % del radio.
  const mantle = 0.97;
  const outer = k(3471);
  const inner = k(1221);
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={t('Interior')} className="mx-auto w-full max-w-[13rem] wide:max-w-[19rem]">
      <defs>
        <radialGradient id="pi-sea" cx="34%" cy="28%" r="80%">
          <stop offset="0" stopColor="#7db9e6" />
          <stop offset="0.45" stopColor="#2f6fa6" />
          <stop offset="1" stopColor="#0d2b4a" />
        </radialGradient>
        <radialGradient id="pi-mantle" cx="50%" cy="56%" r="62%">
          <stop offset="0.5" stopColor="#f6862a" />
          <stop offset="0.78" stopColor="#c8431a" />
          <stop offset="1" stopColor="#6b1c10" />
        </radialGradient>
        <radialGradient id="pi-outer" cx="50%" cy="56%" r="60%">
          <stop offset="0.3" stopColor="#ffe08a" />
          <stop offset="0.7" stopColor="#f7a12a" />
          <stop offset="1" stopColor="#d9601a" />
        </radialGradient>
        <radialGradient id="pi-inner" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="1" stopColor="#ffd974" />
        </radialGradient>
        {/* textura de roca: ruido que oscurece a manchas lo que tiene debajo */}
        <filter id="pi-rock" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="7" result="noise" />
          <feColorMatrix in="noise" values="0 0 0 0 0.22  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 1.6 -0.6" result="spots" />
          <feComposite in="spots" in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="pi-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <radialGradient id="pi-limb" cx="38%" cy="32%" r="68%">
          <stop offset="0.55" stopColor="#04121f" stopOpacity="0" />
          <stop offset="1" stopColor="#04121f" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id="pi-globe">
          <circle cx="150" cy="150" r={R} />
        </clipPath>
      </defs>

      {/* sombra bajo el globo y halo de atmósfera */}
      <ellipse cx="150" cy="288" rx="92" ry="7" fill="#000" opacity="0.28" filter="url(#pi-blur)" />
      <circle cx="150" cy="150" r={R + 5} fill="none" stroke="#7fc0f5" strokeWidth="6" opacity="0.28" filter="url(#pi-blur)" />

      {/* la Tierra por fuera */}
      <circle cx="150" cy="150" r={R} fill="url(#pi-sea)" />
      {/* continentes reales (Natural Earth), vistos desde el mismo lado que abre el globo 3D */}
      <path d={LAND_GLOBE} transform={`translate(150 150) scale(${R})`} fill="#6f9a5c" stroke="#4d7443" strokeWidth={0.5 / R} opacity="0.92" />
      {/* la esfera se oscurece hacia el borde, también sobre la tierra */}
      <circle cx="150" cy="150" r={R} fill="url(#pi-limb)" />
      <circle cx="150" cy="150" r={R} fill="none" stroke="#0a1e33" strokeOpacity="0.35" />

      {/* el gajo: cada capa es el mismo contorno a su radio */}
      <g transform={`translate(150 150) scale(${R})`}>
        <path d={WEDGE} fill="#6f573d" />
        <g transform={`scale(${mantle})`}>
          <path d={WEDGE} fill="url(#pi-mantle)" />
        </g>
        <g transform={`scale(${outer})`}>
          <path d={WEDGE} fill="url(#pi-outer)" />
        </g>
        {/* cada cara recibe una luz distinta, para que se lea el volumen */}
        <path d={FACE_LEFT} fill="#000" opacity="0.2" />
        <path d={FACE_FLOOR} fill="#000" opacity="0.1" />
        {/* el núcleo interno es una bola: no se corta, asoma entera */}
        <circle r={inner} fill="url(#pi-inner)" />
      </g>
      {/* Lo que sigue va en píxeles (sin la escala del grupo anterior): filtros y trazos se comportan mejor. */}
      <g transform="translate(150 150)">
        <path d={WEDGE} transform={`scale(${R * mantle})`} fill="#000" filter="url(#pi-rock)" />
        <g fill="none" strokeLinecap="round">
          {/* convección del manto y metal líquido del núcleo externo, en movimiento */}
          {[0.66, 0.78, 0.9].map((r, i) => (
            <path key={r} d={WEDGE} transform={`scale(${R * r})`} stroke="#ffcf8f" strokeWidth="1.3" vectorEffect="non-scaling-stroke" strokeDasharray="6 18" opacity="0.5" className={i % 2 ? 'planet-flow' : 'planet-flow-back'} />
          ))}
          {[0.3, 0.38, 0.46].map((r, i) => (
            <path key={r} d={WEDGE} transform={`scale(${R * r})`} stroke="#fff4c8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="9 11" opacity="0.8" className={i % 2 ? 'planet-flow-back' : 'planet-flow'} />
          ))}
          <g stroke="#2a1208" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <path d="M0 0 L0 -0.914 M0 0 L0.707 0.287 M0 0 L-0.707 0.287" transform={`scale(${R})`} vectorEffect="non-scaling-stroke" />
            <path d={WEDGE} transform={`scale(${R})`} vectorEffect="non-scaling-stroke" />
            <path d={WEDGE} transform={`scale(${R * outer})`} vectorEffect="non-scaling-stroke" />
          </g>
        </g>
        {/* el núcleo interno, al rojo blanco */}
        <circle r={R * inner * 0.9} cy={-2} fill="#fff7d0" opacity="0.55" filter="url(#pi-blur)" className="planet-glow" />
      </g>
      {/* brillo en el lado iluminado */}
      <ellipse cx="104" cy="92" rx="46" ry="28" fill="#fff" opacity="0.12" filter="url(#pi-blur)" transform="rotate(-32 104 92)" />
    </svg>
  );
}

function Atmosphere() {
  // La Tierra vista desde la órbita: el horizonte curvo abajo y las capas como arcos por encima.
  const cx = 150;
  const cy = 620;
  const ground = 372;
  const top = cy - ground;
  const shells = [
    { r: ground + 178, fill: 'url(#pa-exo)' },
    { r: ground + 122, fill: '#16284f' },
    { r: ground + 76, fill: '#274f8f' },
    { r: ground + 46, fill: '#4a86c8' },
    { r: ground + 20, fill: '#9fd0f4' },
  ];
  const stars = [
    [22, 18, 0.9],
    [64, 40, 0.6],
    [118, 14, 0.8],
    [176, 30, 0.5],
    [232, 12, 0.9],
    [274, 44, 0.6],
    [44, 62, 0.5],
    [206, 56, 0.7],
    [140, 48, 0.4],
    [286, 70, 0.5],
  ];
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={t('Atmósfera')} className="mx-auto w-full max-w-[13rem] overflow-hidden rounded-xl wide:max-w-[19rem]">
      <defs>
        <radialGradient id="pa-exo" cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stopColor="#101c3a" />
          <stop offset="1" stopColor="#05070f" />
        </radialGradient>
        <radialGradient id="pa-earth" cx="38%" cy="8%" r="70%">
          <stop offset="0" stopColor="#6fb0e2" />
          <stop offset="0.5" stopColor="#2a68a0" />
          <stop offset="1" stopColor="#0c2947" />
        </radialGradient>
        <linearGradient id="pa-aurora" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#5df2a6" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#6ad7ff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#b98cff" stopOpacity="0" />
        </linearGradient>
        <filter id="pa-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="pa-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="300" height="300" fill="#05070f" />
      <g fill="#fff">
        {stars.map(([x, y, o]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.9" opacity={o} />
        ))}
      </g>
      {/* las capas, de fuera adentro */}
      {shells.map((shell) => (
        <circle key={shell.r} cx={cx} cy={cy} r={shell.r} fill={shell.fill} />
      ))}
      <g fill="none" stroke="#dbeeff" strokeOpacity="0.28">
        {shells.slice(1).map((shell) => (
          <circle key={shell.r} cx={cx} cy={cy} r={shell.r} />
        ))}
      </g>
      {/* termosfera: aurora y Estación Espacial */}
      <g className="planet-glow">
        <path d={`M34 ${top - 82} q30 -30 60 -8 t60 -8 t60 -4 q22 6 50 -6 v30 q-28 12 -50 6 t-60 4 t-60 8 q-30 -22 -60 8 z`} fill="url(#pa-aurora)" filter="url(#pa-soft)" />
      </g>
      <g transform={`translate(226 ${top - 106}) rotate(-8)`}>
        <rect x="-2.5" y="-2.5" width="5" height="5" fill="#e6edf7" />
        <rect x="-13" y="-1.6" width="9" height="3.2" fill="#8fb4e6" />
        <rect x="4" y="-1.6" width="9" height="3.2" fill="#8fb4e6" />
      </g>
      {/* mesosfera: un meteoro que se desintegra */}
      <line x1="98" y1={top - 72} x2="64" y2={top - 52} stroke="#fff1c4" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="60" className="planet-meteor" />
      {/* estratosfera: la capa de ozono */}
      <circle cx={cx} cy={cy} r={ground + 33} fill="none" stroke="#ffffff" strokeWidth="1.6" strokeDasharray="2 7" opacity="0.75" />
      {/* la Tierra, con el resplandor del aire en el horizonte */}
      <circle cx={cx} cy={cy} r={ground + 6} fill="#bfe3ff" opacity="0.55" filter="url(#pa-glow)" />
      <circle cx={cx} cy={cy} r={ground} fill="url(#pa-earth)" />
      <path d={LAND_LIMB} transform={`translate(${cx} ${cy}) scale(${ground})`} fill="#6f9a5c" opacity="0.9" />
      {/* troposfera: nubes pegadas al suelo */}
      <g fill="#ffffff" opacity="0.92" filter="url(#pa-soft)">
        <ellipse cx="96" cy={top - 7} rx="26" ry="5" />
        <ellipse cx="170" cy={top - 10} rx="34" ry="5.5" />
        <ellipse cx="238" cy={top - 3} rx="22" ry="4.5" />
      </g>
    </svg>
  );
}

/** Botón de la barra superior y su ventana. */
export function PlanetButton({ labels }: { labels: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'interior' | 'atmosphere'>('interior');
  // Lo mismo, sobre el propio globo: null mientras no se está viendo.
  const [onGlobe, setOnGlobe] = useState<'interior' | 'atmosphere' | null>(null);
  const viewMode = useSettings((s) => s.viewMode);
  const setViewMode = useSettings((s) => s.setViewMode);
  const show = (view: 'interior' | 'atmosphere' | null) => {
    if (view) setViewMode('globe');
    getEngine()?.setPlanetView(view);
    setOnGlobe(view);
    if (view) setOpen(false);
  };
  // Al pasar al mapa plano o al desmontarse el botón (empieza una partida), el globo vuelve a su aspecto normal.
  useEffect(() => {
    if (onGlobe && viewMode !== 'globe') show(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);
  useEffect(() => () => getEngine()?.setPlanetView(null), []);

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
            <button type="button" onClick={() => show(tab)} className="btn btn-accent mt-5 min-h-11 px-4 text-sm">
              <Icon name="globe" size={18} />
              {t('Verlo en el globo 3D')}
            </button>
            <p className="mt-4 border-t border-rule pt-3 text-sm text-ink-soft">
              {tab === 'interior'
                ? t('Los grosores están a escala, salvo la corteza, que se ha engrosado para que se vea. El movimiento del manto y del núcleo es una ilustración.')
                : t('Las alturas son aproximadas y el dibujo no está a escala: la troposfera sería una línea finísima.')}
            </p>
          </div>
        )}
      </dialog>,
        document.body,
      )}
      {onGlobe &&
        // Leyenda de lo que se está viendo en el globo, con la salida a mano.
        createPortal(
          <div className="float fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-[44rem] flex-wrap items-center gap-x-4 gap-y-2 bg-surface! px-4 py-3 wide:bottom-6 wide:left-[31rem] wide:right-20">
            {(onGlobe === 'interior' ? [...INTERIOR].reverse() : [...ATMOSPHERE].reverse()).map((layer) => (
              <span key={layer.id} className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="h-3.5 w-3.5 shrink-0 rounded-[4px] border border-rule-strong" style={{ background: layer.color }} />
                {layer.name}
              </span>
            ))}
            <span className="w-full text-xs text-ink-soft wide:w-auto wide:flex-1">
              {onGlobe === 'interior' ? t('Gira el globo para verlo desde otro lado.') : t('La altura de las capas está muy exagerada.')}
            </span>
            <button type="button" onClick={() => show(null)} className="btn min-h-10 px-3 text-sm">
              {t('Cerrar vista')}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
