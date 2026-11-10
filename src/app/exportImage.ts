// La vista del mapa como imagen PNG, para estudiar o imprimir. Se compone a mano en un lienzo 2D:
// el mapa (el lienzo WebGL), los rótulos que hay encima y, si se piden, una cabecera con el título
// y un pie con la leyenda y el progreso. Sin bibliotecas: lo que hay sobre el mapa es solo texto.

export interface ExportLegend {
  title?: string;
  items: { color: string; text: string }[];
}

export interface ExportRequest {
  /** El lienzo del mapa, recién dibujado (ver MapEngine.snapshot). */
  map: HTMLCanvasElement;
  /** Lo que tapan los paneles, en píxeles CSS: se recorta. */
  pad: { left: number; right: number; top: number; bottom: number };
  /** Rótulos y chinchetas que hay sobre el mapa. */
  labels: boolean;
  /** Cabecera: título a la izquierda y dos líneas pequeñas a la derecha. */
  header?: { title: string; lines: string[] };
  legends: ExportLegend[];
  /** Línea de progreso, bajo la leyenda. */
  progress?: string;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Dibuja el texto de los elementos tal como está en pantalla (misma fuente, color y sitio). */
function drawLabels(ctx: CanvasRenderingContext2D, roots: Element[], scale: number, dx: number, dy: number, halo: string) {
  for (const root of roots) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const el = node.parentElement;
      const text = node.textContent?.trim();
      if (!el || !text || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const box = range.getBoundingClientRect();
      if (!box.width) continue;
      const style = getComputedStyle(el);
      // Las chinchetas llevan fondo: se dibuja su píldora antes que el texto.
      if (!/rgba?\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor)) {
        const pill = el.getBoundingClientRect();
        ctx.fillStyle = style.backgroundColor;
        ctx.beginPath();
        ctx.roundRect((pill.left - dx) * scale, (pill.top - dy) * scale, pill.width * scale, pill.height * scale, 8 * scale);
        ctx.fill();
      } else {
        ctx.strokeStyle = halo;
      }
      ctx.font = `${style.fontStyle} ${style.fontWeight} ${parseFloat(style.fontSize) * scale}px ${style.fontFamily}`;
      ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : `${parseFloat(style.letterSpacing) * scale}px`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const shown = style.textTransform === 'uppercase' ? text.toUpperCase() : text;
      const [x, y] = [(box.left - dx) * scale, (box.top + box.height / 2 - dy) * scale];
      if (/rgba?\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor)) {
        // Un borde del color del papel alrededor de las letras, para que se lean sobre el mapa.
        ctx.lineWidth = 3 * scale;
        ctx.lineJoin = 'round';
        ctx.strokeText(shown, x, y);
      }
      ctx.fillStyle = style.color;
      ctx.fillText(shown, x, y);
    }
  }
  ctx.letterSpacing = '0px';
}

/** Compone la imagen. Hay que llamarla en la misma tarea en que se ha dibujado el mapa. */
export function composeImage(request: ExportRequest): HTMLCanvasElement {
  const { map, pad } = request;
  const scale = map.width / map.clientWidth;
  const rect = map.getBoundingClientRect();
  const width = Math.max(1, map.clientWidth - pad.left - pad.right);
  const height = Math.max(1, map.clientHeight - pad.bottom);
  const [paper, ink, soft, rule] = [css('--paper'), css('--ink'), css('--ink-soft'), css('--rule-strong')];
  const body = getComputedStyle(document.body).fontFamily;

  // El pie se mide antes de crear el lienzo: las leyendas se reparten en columnas.
  const row = 22;
  const columns = Math.max(1, Math.floor((width - 40) / 230));
  const legendRows = request.legends.reduce((sum, legend) => sum + (legend.title ? 1 : 0) + Math.ceil(legend.items.length / columns), 0);
  const footer = legendRows || request.progress ? 28 + legendRows * row + (request.progress ? row + 4 : 0) : 0;
  const header = request.header ? 60 : 0;

  const out = document.createElement('canvas');
  out.width = Math.round(width * scale);
  out.height = Math.round((header + height + footer) * scale);
  const ctx = out.getContext('2d')!;
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.drawImage(map, pad.left * scale, 0, width * scale, height * scale, 0, header * scale, width * scale, height * scale);

  if (request.labels) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, header * scale, out.width, height * scale);
    ctx.clip();
    drawLabels(ctx, [...document.querySelectorAll('.feature-labels, .map-pin')], scale, rect.left + pad.left, rect.top - header, paper);
    ctx.restore();
  }

  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';
  if (request.header) {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, width, header);
    ctx.fillStyle = ink;
    ctx.font = `600 22px ${getComputedStyle(document.querySelector('.display') ?? document.body).fontFamily}`;
    ctx.fillText(request.header.title, 20, header / 2, width * 0.6);
    ctx.textAlign = 'right';
    ctx.fillStyle = soft;
    ctx.font = `600 12px ${body}`;
    request.header.lines.forEach((line, i, all) => ctx.fillText(line, width - 20, header / 2 + (i - (all.length - 1) / 2) * 16));
    ctx.textAlign = 'left';
    ctx.fillStyle = rule;
    ctx.fillRect(0, header - 1, width, 1);
  }
  if (footer) {
    const top = header + height;
    ctx.fillStyle = paper;
    ctx.fillRect(0, top, width, footer);
    ctx.fillStyle = rule;
    ctx.fillRect(0, top, width, 1);
    let y = top + 14 + row / 2;
    for (const legend of request.legends) {
      if (legend.title) {
        ctx.fillStyle = soft;
        ctx.font = `700 12px ${body}`;
        ctx.fillText(legend.title, 20, y);
        y += row;
      }
      ctx.font = `600 13px ${body}`;
      legend.items.forEach((item, i) => {
        const x = 20 + (i % columns) * ((width - 40) / columns);
        const line = y + Math.floor(i / columns) * row;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(x, line - 7, 14, 14, 3);
        ctx.fill();
        ctx.strokeStyle = rule;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = ink;
        ctx.fillText(item.text, x + 22, line, (width - 40) / columns - 30);
      });
      y += Math.ceil(legend.items.length / columns) * row;
    }
    if (request.progress) {
      ctx.fillStyle = ink;
      ctx.font = `700 14px ${body}`;
      ctx.fillText(request.progress, 20, y + 4, width - 40);
    }
  }
  return out;
}

export function downloadCanvas(canvas: HTMLCanvasElement, name: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }, 'image/png');
}
