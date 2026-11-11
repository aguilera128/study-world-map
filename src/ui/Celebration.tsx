import { useEffect, useRef } from 'react';
import type { Atlas } from '../atlas/atlas';
import type { MapEngine } from '../engine/MapEngine';

// Un 10 se celebra: una ola dorada recorre los países acertados y de cada uno sale un cohete que
// estalla sobre el mapa, con una traca final. Se dibuja en un lienzo propio, encima de todo y sin
// estorbar al ratón; no toca el motor del mapa más que para iluminar los países. Dura unos siete
// segundos y no se repite. Con «reducir movimiento» no se monta (lo decide quien lo usa).

const COLORS = ['#ffd95a', '#ffd95a', '#ff7654', '#5ccb8d', '#f3ead7', '#7fb8ea', '#f58ad0'];
const GOLD = '#ffd95a';
/** Más cohetes no se distinguen y cuestan: en una partida larga se reparten entre los países. */
const MAX_ROCKETS = 18;
const WAVE_STEP = 55;
const ROCKET_STEP = 170;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Vida que le queda y la que tenía al nacer, en milisegundos. */
  life: number;
  span: number;
  size: number;
  color: string;
}

interface Rocket {
  /** Cuándo sale, en milisegundos desde el principio. */
  at: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Cuánto vuela antes de estallar. */
  fuse: number;
  color: string;
  /** Chispas del estallido. */
  sparks: number;
  fired: boolean;
}

export function Celebration({ engine, atlas, countries }: { engine: MapEngine; atlas: Atlas; countries: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const [width, height] = [window.innerWidth, window.innerHeight];
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    const random = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

    // Los países, de oeste a este: así la ola y los cohetes recorren el mapa.
    const ordered = [...new Set(countries)].sort((a, b) => atlas.countries[a].anchor[0] - atlas.countries[b].anchor[0]);
    const timers = ordered.slice(0, 60).map((index, i) =>
      setTimeout(() => {
        engine.flash(index, GOLD, 0.9);
        engine.pop(index);
      }, i * WAVE_STEP),
    );

    const rockets: Rocket[] = [];
    const step = Math.max(1, ordered.length / MAX_ROCKETS);
    for (let i = 0; i < ordered.length && rockets.length < MAX_ROCKETS; i += step) {
      const [lon, lat] = atlas.countries[ordered[Math.floor(i)]].anchor;
      const point = engine.project(lon, lat);
      // El cohete sale de su país si está a la vista; si no, del borde de abajo.
      const from = point.visible && point.x > 0 && point.x < width && point.y > 0 && point.y < height ? point : { x: random(width * 0.25, width * 0.75), y: height + 10 };
      const speed = random(0.32, 0.46);
      const tilt = random(-0.35, 0.35);
      rockets.push({ at: 250 + rockets.length * ROCKET_STEP, x: from.x, y: from.y, vx: Math.sin(tilt) * speed, vy: -Math.cos(tilt) * speed, fuse: random(420, 640), color: pick(COLORS), sparks: 72, fired: false });
    }
    // Traca final: estallidos grandes repartidos por arriba.
    const finale = 250 + rockets.length * ROCKET_STEP + 500;
    for (let i = 0; i < 8; i++) {
      rockets.push({ at: finale + i * 140, x: random(width * 0.2, width * 0.8), y: height + 10, vx: random(-0.06, 0.06), vy: -random(0.7, 0.95), fuse: random(520, 700), color: i % 2 ? GOLD : pick(COLORS), sparks: 150, fired: false });
    }

    const particles: Particle[] = [];
    const burst = (x: number, y: number, color: string, sparks: number) => {
      const power = sparks > 100 ? 0.5 : 0.3;
      for (let i = 0; i < sparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Casi todas salen a la misma velocidad: el estallido es un anillo, no una mancha.
        const speed = power * (Math.random() < 0.7 ? random(0.85, 1) : random(0.25, 0.8));
        const span = random(800, 1400);
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: span, span, size: random(1.5, 3), color: Math.random() < 0.2 ? '#fffaf0' : color });
      }
    };

    let frame = 0;
    let last = performance.now();
    const start = last;
    const draw = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const elapsed = now - start;
      // Lo ya dibujado se apaga poco a poco: deja estela sin tapar el mapa.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      let flying = 0;
      for (const rocket of rockets) {
        if (rocket.fired || elapsed < rocket.at) {
          flying += rocket.fired ? 0 : 1;
          continue;
        }
        rocket.x += rocket.vx * dt;
        rocket.y += rocket.vy * dt;
        rocket.fuse -= dt;
        ctx.fillStyle = '#fff6d8';
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (rocket.fuse <= 0) {
          rocket.fired = true;
          burst(rocket.x, rocket.y, rocket.color, rocket.sparks);
        } else {
          flying++;
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        // Frenan con el aire y caen despacio.
        const drag = Math.pow(0.9975, dt);
        p.vx *= drag;
        p.vy = p.vy * drag + 0.00016 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const fade = p.life / p.span;
        // Al final chisporrotean.
        const alpha = fade < 0.35 ? fade * 2.4 * (Math.random() < 0.5 ? 1 : 0.35) : 1;
        const radius = p.size * (0.6 + 0.4 * fade);
        ctx.fillStyle = p.color;
        // Un halo tenue alrededor de cada chispa: brilla sin emborronar.
        ctx.globalAlpha = alpha * 0.16;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (flying || particles.length) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
    // Se monta una vez por partida terminada: lo que recibe no cambia mientras está en pantalla.
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
