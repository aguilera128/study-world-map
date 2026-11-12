import { useEffect, useState } from 'react';

interface QrMaker {
  addData(data: string): void;
  make(): void;
  getModuleCount(): number;
  isDark(row: number, col: number): boolean;
}

/**
 * Código QR de un texto, dibujado como SVG. La librería solo se descarga cuando hace falta. `size`
 * son las clases de su lado (por defecto, 9rem).
 */
export function QrCode({ text, label, size = 'h-36 w-36' }: { text: string; label: string; size?: string }) {
  const [path, setPath] = useState<{ d: string; size: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import('qrcode-generator').then((mod) => {
      if (cancelled) return;
      // el paquete exporta la función con `export =`: según el empaquetador llega tal cual o en `default`
      const make = ((mod as { default?: unknown }).default ?? mod) as (type: 0, level: 'M') => QrMaker;
      const qr = make(0, 'M');
      qr.addData(text);
      qr.make();
      const n = qr.getModuleCount();
      let d = '';
      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
      }
      setPath({ d, size: n });
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  if (!path) return <div className={`${size} shrink-0 rounded-lg bg-sunken`} aria-hidden="true" />;
  // Siempre negro sobre blanco y con margen: es lo que leen bien las cámaras, también en tema oscuro.
  return (
    <svg viewBox={`-3 -3 ${path.size + 6} ${path.size + 6}`} role="img" aria-label={label} className={`${size} shrink-0 rounded-lg bg-white`} shapeRendering="crispEdges">
      <path d={path.d} fill="#000" />
    </svg>
  );
}
