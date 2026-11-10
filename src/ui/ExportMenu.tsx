import { useEffect, useRef, useState } from 'react';
import { getEngine } from '../app/engineRef';
import { composeImage, downloadCanvas, type ExportLegend } from '../app/exportImage';
import { useApp, useMapDef, useProgress, useSettings } from '../app/store';
import { PALETTES, Style } from '../engine/palette';
import { CLIMATE_KEYS, climateLabel } from '../game/climate';
import { modeDef, resolveScope } from '../game/config';
import { DENSITY_LABELS } from '../game/population';
import { MASTERY_LABELS, summarize } from '../game/progress';
import { LOCALE, t } from '../i18n';
import { useTheme } from './hooks';
import { Icon } from './Icon';
import { ATMOSPHERE, INTERIOR } from './planetLayers';

const PARTS = ['labels', 'title', 'legend', 'progress'] as const;
type Part = (typeof PARTS)[number];
const PART_LABELS: Record<Part, string> = {
  labels: t('Nombres sobre el mapa'),
  title: t('Título y fecha'),
  legend: t('Leyenda'),
  progress: t('Mi progreso'),
};

/** Descarga lo que se ve en el mapa como imagen, eligiendo qué la acompaña. */
export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<Record<Part, boolean>>({ labels: true, title: true, legend: true, progress: false });
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const def = useMapDef();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const download = () => {
    const engine = getEngine();
    const { atlas, pad, screen, progressMode } = useApp.getState();
    if (!engine || !atlas) return;
    const { layers, config, lists } = useSettings.getState();
    const colors = PALETTES[theme].styles;
    const legends: ExportLegend[] = [];
    if (parts.legend) {
      const planet = engine.planet;
      if (planet) legends.push({ items: (planet === 'interior' ? [...INTERIOR].reverse() : [...ATMOSPHERE].reverse()).map((l) => ({ color: l.color, text: `${l.name} · ${l.detail}` })) });
      if (layers.climate) legends.push({ title: t('Clima'), items: CLIMATE_KEYS.map((key, i) => ({ color: colors[Style.climate + i].color, text: climateLabel(key) })) });
      if (layers.population) legends.push({ title: t('Habitantes por km²'), items: DENSITY_LABELS.map((text, i) => ({ color: colors[Style.density + i].color, text })) });
      if (screen === 'progress') legends.push({ title: t('Mi progreso'), items: MASTERY_LABELS.map((text, i) => ({ color: colors[Style.mastery + i].color, text })) });
    }
    let progress: string | undefined;
    if (parts.progress) {
      const mode = screen === 'progress' ? progressMode : config.mode;
      const ids = resolveScope(atlas, config.scope, lists).countries.map((i) => atlas.countries[i].id);
      const summary = summarize(useProgress.getState().progress, ids, mode);
      progress = t('Dominas {n} de {total} en «{mode}»', { n: summary.mastered, total: summary.total, mode: modeDef(mode, atlas.map).title });
    }
    const image = composeImage({
      map: engine.snapshot(),
      pad,
      labels: parts.labels,
      header: parts.title
        ? { title: `Study World Map · ${t(def.text.count, { n: atlas.quizzable.length }).split(/\s*·\s*/)[0]}`, lines: [new Date().toLocaleDateString(LOCALE, { dateStyle: 'long' }), 'studyworldmap.com'] }
        : undefined,
      legends,
      progress,
    });
    downloadCanvas(image, `study-world-map-${new Date().toISOString().slice(0, 10)}.png`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={t('Descargar imagen')}
        aria-label={t('Descargar imagen')}
        aria-expanded={open}
        className={`grid h-10 w-10 place-items-center transition-colors hover:text-ink ${open ? 'text-ink' : 'text-ink-soft'}`}
      >
        <Icon name="download" size={19} />
      </button>
      {open && (
        <div className="float absolute bottom-0 right-12 flex w-60 flex-col bg-surface! px-3.5 py-3" role="group" aria-label={t('Descargar imagen')}>
          <p className="label mb-1">{t('Qué lleva la imagen')}</p>
          {PARTS.map((part) => (
            <label key={part} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm">
              {PART_LABELS[part]}
              <input type="checkbox" role="switch" checked={parts[part]} onChange={(e) => setParts({ ...parts, [part]: e.target.checked })} className="peer sr-only" />
              <span
                aria-hidden="true"
                className="relative h-6 w-10 shrink-0 rounded-full border border-rule-strong bg-paper transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[1.125rem] after:w-[1.125rem] after:rounded-full after:bg-ink-faint after:transition-transform peer-checked:border-transparent peer-checked:bg-(--accent) peer-checked:after:translate-x-4 peer-checked:after:bg-(--on-accent) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)"
              />
            </label>
          ))}
          <button type="button" onClick={download} className="btn btn-accent mt-2 min-h-11 px-4 text-sm">
            <Icon name="download" size={18} />
            {t('Descargar PNG')}
          </button>
        </div>
      )}
    </div>
  );
}
