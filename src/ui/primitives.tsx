import { motion } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { usePad, useWide } from './hooks';

export function Flag({ a2, height = 24, className = '' }: { a2: string | null; height?: number; className?: string }) {
  const width = Math.round((height * 4) / 3);
  if (!a2) return <span style={{ width, height }} className={`inline-block shrink-0 rounded-[3px] bg-sunken ${className}`} />;
  return (
    <img
      src={`/flags/${a2}.svg`}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`inline-block shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_var(--rule-strong)] ${className}`}
    />
  );
}

interface SegmentedOption<T> {
  value: T;
  label: ReactNode;
  title?: string;
}

/** Grupo de opciones excluyentes en fila. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  className = '',
}: {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          title={option.title}
          onClick={() => onChange(option.value)}
          className="tile flex min-h-9 items-center gap-1.5 px-3 text-sm font-semibold"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Columna de contenido que acompaña al mapa: a la izquierda en pantallas anchas (fundida con el
 * papel) y como hoja inferior en el móvil. Reserva su hueco para que la cámara no encuadre debajo.
 */
export function Panel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const wide = useWide();
  usePad(ref, wide ? 'left' : 'bottom', wide ? 0.68 : 1);
  return (
    <motion.aside
      ref={ref}
      aria-label={label}
      initial={{ opacity: 0, x: wide ? -28 : 0, y: wide ? 0 : 40 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: wide ? -28 : 0, y: wide ? 0 : 40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="panel fixed inset-x-0 bottom-0 z-30 max-h-[60dvh] overflow-y-auto overscroll-contain wide:inset-y-0 wide:right-auto wide:max-h-none wide:w-[40rem] wide:overflow-hidden"
    >
      <div className="panel-body stagger wide:max-w-[30rem] px-5 pb-7 pt-5 wide:pb-8 wide:pl-10 wide:pr-[4.5rem] wide:pt-[clamp(4.75rem,10vh,6rem)]">{children}</div>
    </motion.aside>
  );
}

/** Título de sección numerado, como los apartados de una leyenda. */
export function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="label mb-2 flex items-center gap-2">
      <span className="display grid h-5 w-5 place-items-center rounded-full border border-rule-strong text-[0.6875rem] tracking-normal text-ink">
        {n}
      </span>
      {children}
    </div>
  );
}
