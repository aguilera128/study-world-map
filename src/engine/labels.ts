import type { CameraRig, ScreenPoint } from './camera';

/** Un accidente geográfico (cordillera, río, mar…) listo para rotular. Ver scripts/build-physical.py. */
export interface MapFeature {
  kind: string;
  /** Importancia: 0 es lo más destacado. */
  rank: number;
  lon: number;
  lat: number;
  text: string;
  /** Trazado de un río: tramos [lon0, lat0, lon1, lat1, …] en grados. */
  lines?: number[][];
}

const DEG = Math.PI / 180;
const MAX_LABELS = 46;
const WATER = new Set(['oceano', 'mar', 'golfo', 'estrecho', 'rio', 'lago']);

/**
 * Rótulos de los accidentes geográficos. Son elementos HTML que el motor recoloca en cada
 * fotograma: salen primero los más importantes, entran más al acercarse y nunca se pisan.
 */
export class FeatureLabels {
  private readonly root = document.createElement('div');
  private items: { feature: MapFeature; el: HTMLSpanElement; width: number; shown: boolean }[] = [];
  private readonly point: ScreenPoint = { x: 0, y: 0, visible: false };

  constructor(parent: HTMLElement) {
    this.root.className = 'feature-labels';
    this.root.setAttribute('aria-hidden', 'true');
    parent.appendChild(this.root);
  }

  set(features: MapFeature[]) {
    this.root.replaceChildren();
    this.items = [...features]
      .sort((a, b) => a.rank - b.rank)
      .map((feature) => {
        const el = document.createElement('span');
        el.className = `feature-label ${WATER.has(feature.kind) ? 'water' : 'land'} ${feature.kind}`;
        el.textContent = feature.text;
        el.hidden = true;
        this.root.appendChild(el);
        return { feature, el, width: 0, shown: false };
      });
  }

  place(rig: CameraRig, alt: number) {
    if (!this.items.length) return;
    // Con el globo entero en pantalla solo lo más destacado; cada vez que se dobla el zoom, un nivel más.
    const maxRank = Math.floor(Math.log2(Math.max(1 / rig.worldPerPixel, 1) / 220)) + 1;
    const taken: number[] = [];
    let count = 0;
    for (const item of this.items) {
      const f = item.feature;
      let show = f.rank <= maxRank && count < MAX_LABELS;
      if (show) {
        const p = rig.project(f.lon * DEG, f.lat * DEG, alt, this.point);
        show = p.visible && p.x > 0 && p.y > 0 && p.x < rig.width && p.y < rig.height;
        if (show) {
          // ponytail: ancho estimado por número de letras; medir cada rótulo saldría más exacto y más caro
          item.width ||= f.text.length * 6.6 + 14;
          const x0 = p.x - item.width / 2;
          const y0 = p.y - 9;
          for (let k = 0; k < taken.length; k += 2) {
            if (Math.abs(taken[k] - x0) < item.width && Math.abs(taken[k + 1] - y0) < 18) {
              show = false;
              break;
            }
          }
          if (show) {
            taken.push(x0, y0);
            count++;
            item.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
        }
      }
      if (show !== item.shown) {
        item.shown = show;
        item.el.hidden = !show;
      }
    }
  }

  dispose() {
    this.root.remove();
  }
}
