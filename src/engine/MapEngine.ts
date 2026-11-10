import {
  DataTexture,
  DoubleSide,
  LineLoop,
  Mesh,
  NearestFilter,
  Points,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type IUniform,
  type Object3D,
} from 'three';
import type { Atlas } from '../atlas/atlas';
import type { MeshData } from '../atlas/mesh';
import type { Bounds } from '../atlas/types';
import { CameraRig, type Padding, type Pose, type ScreenPoint } from './camera';
import { fillGeometry, frameGeometry, lineGeometry, markerGeometry, oceanGeometry, quadGeometry, wallGeometry } from './geometry';
import { rgb, Style, STYLE_COUNT, type Palette } from './palette';
import { DEG, wrapLon } from './projection';
import {
  FILL_FRAG,
  FILL_VERT,
  HALO_FRAG,
  HALO_VERT,
  LINE_FRAG,
  LINE_VERT,
  MARKER_FRAG,
  MARKER_VERT,
  OCEAN_FRAG,
  OCEAN_VERT,
  SHEET_FRAG,
  SHEET_VERT,
  WALL_VERT,
} from './shaders';

export type ViewMode = 'globe' | 'flat';

/** Lo que hay bajo el cursor. `index` es −1 sobre el mar; lon/lat en grados. */
export interface PointerInfo {
  x: number;
  y: number;
  index: number;
  lon: number;
  lat: number;
}

export interface ViewInfo {
  lon: number;
  lat: number;
  /** 0 = lo más lejos posible, 1 = lo más cerca. */
  zoom: number;
  morph: number;
}

interface EngineEvents {
  /** El cursor se mueve sobre el mapa (null al salir o si no hay mapa debajo). */
  pointer: PointerInfo | null;
  /** Cambia el país bajo el cursor (−1 = ninguno). */
  hover: number;
  /** Pulsación o toque sin arrastre. */
  click: PointerInfo;
  /** La cámara se ha movido. */
  view: ViewInfo;
  /** Empieza un cambio entre globo y plano. */
  mode: ViewMode;
}

type Listener<T> = (payload: T) => void;

export interface FlyOptions {
  /** Milisegundos; por defecto depende de la distancia. 0 = sin animación. */
  duration?: number;
}

export interface EngineOptions {
  palette: Palette;
  mode: ViewMode;
  reducedMotion?: boolean;
}

/** Elevación máxima de un país, en radios del globo. */
const LIFT = 0.024;
/** Altura de cada capa sobre el océano (evita que parpadeen unas sobre otras). */
const ALT = { fill: 0.002, line: 0.0027, frame: 0.003, marker: 0.004, shadow: -0.004 };
const HOVER_LIFT = 0.34;
/** Un país más pequeño que esto en pantalla (px) se señala con un marcador. */
const MARKER_THRESHOLD = 8;
const MARKER_DIAMETER = 13;
const LINE_WIDTH = 1.15;
const LINE_WIDTH_EMPH = 2.4;

/** Velocidad máxima de la inercia tras soltar un arrastre, en píxeles por segundo. */
const MAX_FLING = 1300;

const COLOR_TAU = 0.085;
const SPRING_STIFFNESS = 380;
const SPRING_DAMPING = 26;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const vec3 = (hex: string) => new Vector3(...rgb(hex));

interface Flight {
  from: Pose;
  to: Pose;
  dLon: number;
  morphFrom: number;
  morphTo: number;
  /** Salto de altura a mitad de un vuelo largo. */
  hop: number;
  t0: number;
  duration: number;
}

interface Tracked {
  el: HTMLElement;
  lon: number;
  lat: number;
  /** Altura sobre el globo, en radios (0 = pegado al mapa). */
  alt: number;
}

interface ResolvedStyle {
  r: number;
  g: number;
  b: number;
  lift: number;
  emph: number;
}

/**
 * Motor del mapa: dibuja el atlas con three.js, mueve la cámara y traduce el puntero a países.
 * No sabe nada del juego: la aplicación le dice con qué estilo pintar cada país y escucha sus eventos.
 */
export class MapEngine {
  readonly rig = new CameraRig();
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly canvas: HTMLCanvasElement;
  private readonly atlas: Atlas;
  private readonly count: number;
  private palette: Palette;
  private mode: ViewMode;
  private reducedMotion: boolean;

  // ── estado por país ──
  private readonly styleOf: Uint8Array;
  /** Países que responden al cursor. */
  private readonly active: Uint8Array;
  /** Países que, si son diminutos en pantalla, se señalan con un marcador. */
  private readonly marked: Uint8Array;
  /** Por país: r, g, b, elevación, énfasis (0–1). */
  private readonly cur: Float32Array;
  private readonly tgt: Float32Array;
  private readonly vel: Float32Array;
  private readonly tau: Float32Array;
  private readonly animating = new Set<number>();
  private readonly stateData: Uint8Array<ArrayBuffer>;
  private readonly auxData: Uint8Array<ArrayBuffer>;
  private readonly stateTex: DataTexture;
  private readonly auxTex: DataTexture;
  private styles: ResolvedStyle[] = [];
  private hoverColor: [number, number, number] = [1, 1, 1];
  private pulseColor: [number, number, number] = [1, 1, 1];
  private hovered = -1;
  private pulseIndex = -1;
  private pulseStart = 0;
  private nightTarget = 0;
  private showGrid = true;
  private showGlint = true;

  // ── uniformes compartidos por todos los materiales ──
  private readonly uniforms = {
    uMorph: { value: 1 },
    uState: { value: null as DataTexture | null },
    uAux: { value: null as DataTexture | null },
    uCount: { value: 1 },
    uLift: { value: LIFT },
    uLight: { value: new Vector3(-0.42, 0.56, 0.72).normalize() },
    uShadow: { value: 1 },
    uRim: { value: new Vector3() },
    uRimAmount: { value: 0 },
    uRimPower: { value: 2 },
    uViewport: { value: new Vector2(1, 1) },
    uLine: { value: new Vector3() },
    uLineEmph: { value: new Vector3() },
    uSun: { value: new Vector3(0, 0, 1) },
    uNight: { value: 0 },
    uNightTint: { value: new Vector3() },
    uNightDim: { value: 0.5 },
  };
  private readonly own = {
    ocean: { uOcean: { value: new Vector3() }, uGrid: { value: new Vector3() }, uGridAlpha: { value: 0 }, uGlint: { value: 0 } },
    wall: { uWallTint: { value: 0.7 } },
    line: { uWidth: { value: 1 }, uEmphWidth: { value: 2 }, uOpacity: { value: 1 } },
    marker: { uPxPerRad: { value: 1 }, uThreshold: { value: MARKER_THRESHOLD }, uMarkerPx: { value: 16 } },
    halo: {
      uExtent: { value: 2 },
      uOffset: { value: new Vector2() },
      uColor: { value: new Vector3() },
      uAlpha: { value: 0 },
      uFalloff: { value: 8 },
      uOutline: { value: new Vector3() },
      uOutlineAlpha: { value: 0 },
      uSilhouette: { value: 1 },
    },
    shadow: { uOffset: { value: new Vector2(0.03, -0.045) }, uColor: { value: new Vector3() }, uAlpha: { value: 0 } },
    frame: { uOffset: { value: new Vector2() }, uColor: { value: new Vector3() }, uAlpha: { value: 0 } },
  };
  private readonly halo: Mesh;
  private readonly sheetShadow: Mesh;
  private readonly frameLine: LineLoop;
  private readonly disposables: { dispose(): void }[] = [];

  // ── cámara e interacción ──
  private flight: Flight | null = null;
  /** Lo último que se pidió encuadrar; se olvida en cuanto el usuario mueve el mapa. */
  private intent: (() => Pose) | null = null;
  private padTarget: Padding = { left: 0, right: 0, top: 0, bottom: 0 };
  private inertia: { vx: number; vy: number } | null = null;
  private autoRotate = false;
  private idleUntil = 0;
  private readonly pointers = new Map<number, { x: number; y: number }>();
  private drag: { id: number; startX: number; startY: number; moved: boolean; coarse: boolean } | null = null;
  private pinch: { distance: number; x: number; y: number } | null = null;
  private readonly samples: { t: number; dx: number; dy: number }[] = [];
  private lastPointer: { x: number; y: number } | null = null;

  private raf = 0;
  private lastFrame = 0;
  private readonly tracked = new Set<Tracked>();
  private readonly screen: ScreenPoint = { x: 0, y: 0, visible: false };
  private readonly listeners = new Map<keyof EngineEvents, Set<Listener<never>>>();
  private readonly resizeObserver: ResizeObserver;
  private readonly abort = new AbortController();
  private disposed = false;

  constructor(canvas: HTMLCanvasElement, atlas: Atlas, mesh: MeshData, options: EngineOptions) {
    this.canvas = canvas;
    this.atlas = atlas;
    this.count = atlas.countries.length;
    this.palette = options.palette;
    this.mode = options.mode;
    this.reducedMotion = options.reducedMotion ?? false;
    this.rig.morph = options.mode === 'globe' ? 1 : 0;

    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const n = this.count;
    this.styleOf = new Uint8Array(n);
    this.active = new Uint8Array(n).fill(1);
    this.marked = new Uint8Array(n).fill(1);
    this.cur = new Float32Array(n * 5);
    this.tgt = new Float32Array(n * 5);
    this.vel = new Float32Array(n);
    this.tau = new Float32Array(n).fill(COLOR_TAU);
    this.stateData = new Uint8Array(n * 4);
    this.auxData = new Uint8Array(n * 4);
    this.stateTex = this.dataTexture(this.stateData);
    this.auxTex = this.dataTexture(this.auxData);
    this.uniforms.uState.value = this.stateTex;
    this.uniforms.uAux.value = this.auxTex;
    this.uniforms.uCount.value = n;

    // ── capas, de abajo arriba ──
    const ocean = oceanGeometry();
    this.add(new Mesh(ocean, this.material(OCEAN_VERT, OCEAN_FRAG, 0, this.own.ocean)), 0);
    this.add(new Mesh(fillGeometry(mesh), this.material(FILL_VERT, FILL_FRAG, ALT.fill)), 1);
    this.add(new Mesh(wallGeometry(mesh), this.material(WALL_VERT, FILL_FRAG, ALT.fill, this.own.wall)), 2);

    const blended = { transparent: true, depthWrite: false };
    this.halo = new Mesh(quadGeometry(), this.material(HALO_VERT, HALO_FRAG, 0, this.own.halo, blended));
    this.add(this.halo, 3);
    this.sheetShadow = new Mesh(ocean, this.material(SHEET_VERT, SHEET_FRAG, ALT.shadow, this.own.shadow, blended));
    this.add(this.sheetShadow, 3, false);
    this.frameLine = new LineLoop(frameGeometry(), this.material(SHEET_VERT, SHEET_FRAG, ALT.frame, this.own.frame, blended));
    this.add(this.frameLine, 4);
    this.add(new Mesh(lineGeometry(mesh), this.material(LINE_VERT, LINE_FRAG, ALT.line, this.own.line, blended)), 5);
    this.add(
      new Points(
        markerGeometry(atlas),
        this.material(MARKER_VERT, MARKER_FRAG, ALT.marker, this.own.marker, { ...blended, depthTest: false }),
      ),
      6,
    );

    this.applyPalette();
    this.setStyles(this.styleOf, this.active, { instant: true });

    // ── entrada ──
    const signal = this.abort.signal;
    canvas.addEventListener('pointerdown', this.onPointerDown, { signal });
    canvas.addEventListener('pointermove', this.onPointerMove, { signal });
    canvas.addEventListener('pointerup', this.onPointerUp, { signal });
    canvas.addEventListener('pointercancel', this.onPointerUp, { signal });
    canvas.addEventListener('pointerleave', this.onPointerLeave, { signal });
    canvas.addEventListener('wheel', this.onWheel, { signal, passive: false });
    canvas.addEventListener('keydown', this.onKeyDown, { signal });
    canvas.addEventListener('blur', this.onPointerLeave, { signal });
    canvas.addEventListener(
      'focus',
      () => {
        // Solo con teclado: al pulsar con el ratón ya manda el puntero.
        if (!canvas.matches(':focus-visible')) return;
        const c = this.aim();
        this.hoverAt(c.x, c.y);
      },
      { signal },
    );
    canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    // En móvil el sistema puede retirar el contexto WebGL (otra app, poca memoria). three.js vuelve a
    // subir mallas y texturas al recuperarlo, pero el motor solo pinta si algo cambia: hay que pedirlo.
    canvas.addEventListener('webglcontextrestored', () => this.invalidate(), { signal });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    // Arranca en la vista general; resize() la ajusta al tamaño real del lienzo.
    this.intent = () => this.homePose();
    this.resize();
    this.invalidate();
  }

  // ───────────────────────── construcción ─────────────────────────

  private dataTexture(data: Uint8Array<ArrayBuffer>): DataTexture {
    const tex = new DataTexture(data, this.count, 1, RGBAFormat, UnsignedByteType);
    tex.minFilter = NearestFilter;
    tex.magFilter = NearestFilter;
    tex.needsUpdate = true;
    this.disposables.push(tex);
    return tex;
  }

  private material(
    vertexShader: string,
    fragmentShader: string,
    baseAlt: number,
    own: Record<string, IUniform> = {},
    params: { transparent?: boolean; depthWrite?: boolean; depthTest?: boolean } = {},
  ): ShaderMaterial {
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { ...this.uniforms, ...own, uBaseAlt: { value: baseAlt } },
      side: DoubleSide,
      ...params,
    });
    this.disposables.push(material);
    return material;
  }

  private add(object: Object3D & { geometry: BufferGeometry }, renderOrder: number, ownsGeometry = true) {
    // Las posiciones reales las calcula el sombreador: three no puede saber qué queda fuera de plano.
    object.frustumCulled = false;
    object.renderOrder = renderOrder;
    if (ownsGeometry) this.disposables.push(object.geometry);
    this.scene.add(object);
  }

  // ───────────────────────── eventos ─────────────────────────

  /** Suscribe a un evento del motor; devuelve la función para darse de baja. */
  on<K extends keyof EngineEvents>(event: K, listener: Listener<EngineEvents[K]>): () => void {
    let set = this.listeners.get(event);
    if (!set) this.listeners.set(event, (set = new Set()));
    set.add(listener as Listener<never>);
    return () => set.delete(listener as Listener<never>);
  }

  private emit<K extends keyof EngineEvents>(event: K, payload: EngineEvents[K]) {
    const set = this.listeners.get(event) as Set<Listener<EngineEvents[K]>> | undefined;
    if (set) for (const listener of set) listener(payload);
  }

  // ───────────────────────── aspecto ─────────────────────────

  setPalette(palette: Palette) {
    this.palette = palette;
    this.applyPalette();
    for (let i = 0; i < this.count; i++) this.retarget(i);
  }

  private applyPalette() {
    const p = this.palette;
    const u = this.uniforms;
    u.uShadow.value = p.shadow;
    u.uRim.value.copy(vec3(p.rim));
    u.uRimAmount.value = p.rimAmount;
    u.uRimPower.value = p.rimPower;
    u.uLine.value.copy(vec3(p.line));
    u.uLineEmph.value.copy(vec3(p.lineEmph));
    u.uNightTint.value.copy(vec3(p.nightTint));
    u.uNightDim.value = p.nightDim;
    this.own.ocean.uOcean.value.copy(vec3(p.ocean));
    this.own.ocean.uGrid.value.copy(vec3(p.grid));
    this.own.ocean.uGridAlpha.value = this.showGrid ? p.gridAlpha : 0;
    this.own.ocean.uGlint.value = this.showGlint ? p.glint : 0;
    this.own.wall.uWallTint.value = p.wallTint;
    this.own.halo.uColor.value.copy(vec3(p.halo));
    this.own.halo.uFalloff.value = p.haloFalloff;
    this.own.halo.uOffset.value.set(...p.haloOffset);
    this.own.halo.uOutline.value.copy(vec3(p.outline));
    this.own.shadow.uColor.value.copy(vec3(p.sheetShadow));
    this.own.frame.uColor.value.copy(vec3(p.line));
    this.hoverColor = rgb(p.hover);
    this.pulseColor = rgb(p.pulse);
    if (p.styles.length !== STYLE_COUNT) throw new Error('La paleta no define todos los estilos.');
    this.styles = p.styles.map((def) => {
      const [r, g, b] = rgb(def.color);
      return { r, g, b, lift: def.lift, emph: def.emph };
    });
  }

  /**
   * Estilo de cada país (ver `Style`) y cuáles responden al cursor. `markers` indica cuáles llevan
   * marcador cuando son diminutos (por defecto, los activos); con `instant` no hay transición.
   */
  setStyles(styles: Uint8Array, active: Uint8Array, { markers = active, instant = false }: { markers?: Uint8Array; instant?: boolean } = {}) {
    this.styleOf.set(styles);
    this.active.set(active);
    this.marked.set(markers);
    if (this.hovered >= 0 && !active[this.hovered]) this.hovered = -1;
    for (let i = 0; i < this.count; i++) {
      this.retarget(i);
      if (instant) {
        this.cur.set(this.tgt.subarray(i * 5, i * 5 + 5), i * 5);
        this.vel[i] = 0;
        this.write(i);
      }
    }
    if (instant) this.animating.clear();
    this.invalidate();
  }

  /** Recalcula el aspecto final de un país a partir de su estilo y del cursor. */
  private retarget(i: number) {
    const style = this.styles[this.styleOf[i]];
    let { r, g, b, lift, emph } = style;
    if (i === this.hovered && this.active[i]) {
      // Un país ya resuelto conserva su color: el cursor solo lo aclara un poco.
      const resolved = this.styleOf[i] >= Style.ok && this.styleOf[i] <= Style.target;
      const k = this.palette.hoverMix * (resolved ? 0.3 : 1);
      r += (this.hoverColor[0] - r) * k;
      g += (this.hoverColor[1] - g) * k;
      b += (this.hoverColor[2] - b) * k;
      lift += HOVER_LIFT;
      emph = Math.max(emph, 0.85);
    }
    const o = i * 5;
    this.tgt[o] = r;
    this.tgt[o + 1] = g;
    this.tgt[o + 2] = b;
    this.tgt[o + 3] = lift;
    this.tgt[o + 4] = emph;
    this.animating.add(i);
    this.invalidate();
  }

  private write(i: number) {
    const o = i * 5;
    const p = i * 4;
    const c = this.cur;
    this.stateData[p] = clamp(c[o], 0, 1) * 255 + 0.5;
    this.stateData[p + 1] = clamp(c[o + 1], 0, 1) * 255 + 0.5;
    this.stateData[p + 2] = clamp(c[o + 2], 0, 1) * 255 + 0.5;
    this.stateData[p + 3] = clamp(c[o + 3], 0, 1) * 255 + 0.5;
    this.auxData[p] = clamp(c[o + 4], 0, 1) * 255 + 0.5;
    this.auxData[p + 1] = this.marked[i] ? 255 : 0;
    this.stateTex.needsUpdate = true;
    this.auxTex.needsUpdate = true;
  }

  /** Destello de color que se desvanece hacia el estilo del país (p. ej. al fallar). */
  flash(index: number, color: string, seconds = 0.55) {
    const [r, g, b] = rgb(color);
    const o = index * 5;
    this.cur[o] = r;
    this.cur[o + 1] = g;
    this.cur[o + 2] = b;
    this.cur[o + 4] = 1;
    this.tau[index] = seconds;
    this.vel[index] += 2.4;
    this.animating.add(index);
    this.invalidate();
  }

  /** Pequeño salto hacia arriba (p. ej. al acertar). */
  pop(index: number) {
    this.vel[index] += 7.5;
    this.animating.add(index);
    this.invalidate();
  }

  /** Hace latir un país (−1 para parar). */
  setPulse(index: number) {
    if (index === this.pulseIndex) return;
    if (this.pulseIndex >= 0) this.animating.add(this.pulseIndex);
    this.pulseIndex = index;
    this.pulseStart = performance.now();
    this.invalidate();
  }

  /** Muestra u oculta la retícula y el reflejo del agua. */
  setOcean(grid: boolean, glint: boolean) {
    this.showGrid = grid;
    this.showGlint = glint;
    this.own.ocean.uGridAlpha.value = grid ? this.palette.gridAlpha : 0;
    this.own.ocean.uGlint.value = glint ? this.palette.glint : 0;
    this.invalidate();
  }

  /** Intensidad del día y la noche: 0 = oculto, 1 = pleno (se funde poco a poco). */
  setDaylight(strength: number) {
    this.nightTarget = clamp(strength, 0, 1);
    this.invalidate();
  }

  /** Punto de la Tierra que tiene el Sol en el cénit, en grados. */
  setSun(lon: number, lat: number) {
    const cos = Math.cos(lat * DEG);
    this.uniforms.uSun.value.set(cos * Math.sin(lon * DEG), Math.sin(lat * DEG), cos * Math.cos(lon * DEG));
    this.invalidate();
  }

  // ───────────────────────── cámara ─────────────────────────

  get viewMode(): ViewMode {
    return this.mode;
  }

  /** ¿Está la vista asentada (ni volando entre globo y plano)? */
  private get settled(): boolean {
    return this.rig.morph === (this.mode === 'globe' ? 1 : 0);
  }

  private get targetMorph(): number {
    return this.mode === 'globe' ? 1 : 0;
  }

  /** Ejecuta `fn` con el margen de interfaz definitivo (no el que está a medio animar). */
  private withTargetPadding<T>(fn: () => T): T {
    const current = this.rig.pad;
    this.rig.pad = this.padTarget;
    try {
      return fn();
    } finally {
      this.rig.pad = current;
    }
  }

  /** Vista general: el globo o el mapa entero. */
  homePose(): Pose {
    return this.withTargetPadding(() =>
      this.mode === 'globe'
        ? { lon: -12 * DEG, lat: 24 * DEG, h: this.rig.globeMaxHeight() }
        : { lon: 0, lat: 0, h: this.rig.flatMaxHeight() },
    );
  }

  home(options?: FlyOptions) {
    this.intent = () => this.homePose();
    this.fly(this.intent(), options);
  }

  /** Vuela hasta una pose (radianes). Los campos omitidos conservan su valor actual. */
  flyTo(pose: Partial<Pose>, options: FlyOptions = {}) {
    this.intent = null;
    this.fly(pose, options);
  }

  private fly(pose: Partial<Pose>, options: FlyOptions = {}) {
    const rig = this.rig;
    const morph = this.targetMorph;
    const to = this.withTargetPadding(() =>
      rig.clampPose({ lon: pose.lon ?? rig.lon, lat: pose.lat ?? rig.lat, h: pose.h ?? rig.h }, morph),
    );
    const from: Pose = { lon: rig.lon, lat: rig.lat, h: rig.h };
    const dLon = this.mode === 'globe' && rig.morph === 1 ? wrapLon(to.lon - from.lon) : to.lon - from.lon;
    const distance = Math.hypot(dLon * Math.cos((from.lat + to.lat) / 2), to.lat - from.lat);
    const zoomChange = Math.abs(Math.log(to.h / from.h));
    let duration = options.duration ?? clamp(420 + 520 * distance + 380 * zoomChange, 520, 1800);
    if (this.reducedMotion) duration = 0;
    this.inertia = null;
    if (duration <= 0 || (distance < 1e-4 && zoomChange < 1e-3 && rig.morph === morph)) {
      rig.lon = to.lon;
      rig.lat = to.lat;
      rig.h = to.h;
      rig.morph = morph;
      this.flight = null;
    } else {
      this.flight = {
        from,
        to,
        dLon,
        morphFrom: rig.morph,
        morphTo: morph,
        hop: rig.morph === morph ? clamp((distance - 0.5) * 0.3, 0, 0.45) : 0,
        t0: performance.now(),
        duration,
      };
    }
    this.invalidate();
  }

  /** Encuadra un rectángulo geográfico [oeste, sur, este, norte] en grados. */
  frame(bounds: Bounds, options: FlyOptions & { minSpan?: number } = {}) {
    this.intent = () => this.withTargetPadding(() => this.rig.fit(bounds, this.targetMorph, options.minSpan ?? 0));
    this.fly(this.intent(), options);
  }

  /** Encuadra un país dejando ver su entorno. */
  frameCountry(index: number, options: FlyOptions & { minSpan?: number } = {}) {
    const country = this.atlas.countries[index];
    this.frame(country.frame, { minSpan: 16, ...options });
  }

  /**
   * Vista general centrada en un punto (grados): gira el globo hasta ponerlo delante. En el mapa
   * plano la vista general ya lo incluye, así que no se mueve.
   */
  lookAt(lon: number, lat: number, options?: FlyOptions) {
    this.intent = () =>
      this.mode === 'flat'
        ? this.homePose()
        : this.withTargetPadding(() => ({ lon: lon * DEG, lat: clamp(lat, -50, 50) * DEG, h: this.rig.globeMaxHeight() }));
    this.fly(this.intent(), options);
  }

  zoomBy(factor: number) {
    this.flyTo({ h: this.rig.h * factor }, { duration: 320 });
  }

  /** Cambia entre globo y mapa plano desenrollando la superficie. */
  setMode(mode: ViewMode, animate = true) {
    if (mode === this.mode) return;
    const rig = this.rig;
    this.mode = mode;
    this.emit('mode', mode);
    const duration = animate ? 1500 : 0;
    // Si la cámara estaba encuadrando algo, lo sigue encuadrando en la nueva vista; si no,
    // conserva lo que el usuario estaba mirando.
    if (this.intent) this.fly(this.intent(), { duration });
    else this.fly({ h: this.withTargetPadding(() => rig.convertHeight(rig.h, mode === 'flat')) }, { duration });
  }

  /**
   * Zonas del lienzo tapadas por la interfaz. Si la cámara estaba encuadrando algo (y el usuario
   * no la ha movido desde entonces), se vuelve a encuadrar en el hueco que queda libre.
   */
  setPadding(padding: Padding, animate = true) {
    const p = this.padTarget;
    const change = Math.max(
      Math.abs(p.left - padding.left),
      Math.abs(p.right - padding.right),
      Math.abs(p.top - padding.top),
      Math.abs(p.bottom - padding.bottom),
    );
    if (change === 0) return;
    this.padTarget = { ...padding };
    if (!animate || this.reducedMotion) this.rig.pad = { ...padding };
    // Un retoque pequeño (un rótulo que ocupa una línea más) no justifica mover el mapa.
    if (this.intent && !this.drag && change > 56) this.fly(this.intent(), { duration: animate ? 700 : 0 });
    this.invalidate();
  }

  /** Giro lento del globo mientras nadie lo toca. */
  setAutoRotate(on: boolean) {
    this.autoRotate = on && !this.reducedMotion;
    this.invalidate();
  }

  setReducedMotion(on: boolean) {
    this.reducedMotion = on;
    if (on) this.autoRotate = false;
  }

  // ───────────────────────── consulta ─────────────────────────

  /** Posición en pantalla de un punto del mapa (grados). */
  project(lon: number, lat: number): ScreenPoint {
    return this.rig.project(lon * DEG, lat * DEG, ALT.marker, { x: 0, y: 0, visible: false });
  }

  /**
   * Ancla un elemento HTML a un punto del mapa: en cada fotograma se le aplica un `transform` con
   * su posición y el atributo `data-hidden` si queda en la cara oculta. Con `alt` flota sobre el
   * globo, a esa altura en radios. Devuelve cómo soltarlo.
   */
  track(el: HTMLElement, lon: number, lat: number, alt = 0): () => void {
    const item: Tracked = { el, lon: lon * DEG, lat: lat * DEG, alt };
    this.tracked.add(item);
    this.place(item);
    return () => this.tracked.delete(item);
  }

  private place(item: Tracked) {
    // Lo que flota (el Sol, la Luna) solo se separa en el globo, y nunca más allá de media altura de
    // la cámara: al acercarse baja hasta su punto del mapa en vez de quedar detrás del observador.
    const rig = this.rig;
    const alt = item.alt * rig.morph;
    const p = rig.project(item.lon, item.lat, ALT.marker + Math.min(alt, rig.h * 0.5), this.screen, alt > 0);
    item.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    item.el.toggleAttribute('data-hidden', !p.visible);
  }

  /** País (y coordenadas) bajo un píxel, teniendo en cuenta los marcadores de países pequeños. */
  pick(x: number, y: number, coarse = false): PointerInfo | null {
    if (!this.settled) return null;
    const rig = this.rig;
    const geo = rig.screenToGeo(x, y);
    const pxPerRad = 1 / rig.worldPerPixel;
    const reach = MARKER_DIAMETER / 2 + (coarse ? 12 : 3);
    let best = -1;
    let bestDist = reach * reach;
    for (const i of this.atlas.quizzable) {
      if (!this.active[i] || !this.marked[i]) continue;
      const c = this.atlas.countries[i];
      if (c.size * pxPerRad > MARKER_THRESHOLD) continue;
      const p = rig.project(c.anchor[0] * DEG, c.anchor[1] * DEG, ALT.marker, this.screen);
      if (!p.visible) continue;
      const d = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    if (best >= 0) {
      const [lon, lat] = this.atlas.countries[best].anchor;
      return { x, y, index: best, lon: geo ? geo.lon / DEG : lon, lat: geo ? geo.lat / DEG : lat };
    }
    if (!geo) return null;
    const lon = geo.lon / DEG;
    const lat = geo.lat / DEG;
    return { x, y, index: this.atlas.locate(lon, lat), lon, lat };
  }

  // ───────────────────────── puntero ─────────────────────────

  private local(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private setHovered(index: number) {
    const next = index >= 0 && this.active[index] ? index : -1;
    if (next === this.hovered) return;
    const previous = this.hovered;
    this.hovered = next;
    if (previous >= 0) this.retarget(previous);
    if (next >= 0) this.retarget(next);
    this.canvas.style.cursor = next >= 0 ? 'pointer' : '';
    this.emit('hover', next);
  }

  private onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const p = this.local(e);
    try {
      // Con la captura, el arrastre sigue aunque el puntero salga del lienzo.
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      // Algunos punteros sintéticos no se pueden capturar: el arrastre funciona igual dentro del lienzo.
    }
    this.pointers.set(e.pointerId, p);
    this.inertia = null;
    this.idleUntil = performance.now() + 4000;
    if (this.pointers.size === 1) {
      this.drag = { id: e.pointerId, startX: p.x, startY: p.y, moved: false, coarse: e.pointerType !== 'mouse' };
      this.samples.length = 0;
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (this.drag) this.drag.moved = true; // dos dedos nunca son un toque
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const p = this.local(e);
    const previous = this.pointers.get(e.pointerId);
    if (!previous) {
      // Ratón sin botón pulsado: solo resalta lo que hay debajo.
      if (e.pointerType === 'mouse') this.hoverAt(p.x, p.y);
      return;
    }
    this.pointers.set(e.pointerId, p);
    this.idleUntil = performance.now() + 4000;
    // Durante el cambio de vista la cámara va sola.
    const locked = !this.settled;

    if (this.pinch && this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      if (!locked) {
        this.flight = null;
        this.intent = null;
        this.rig.panBy(cx - this.pinch.x, cy - this.pinch.y);
        this.rig.zoomBy(this.pinch.distance / Math.max(distance, 1), cx, cy);
        this.invalidate();
      }
      this.pinch = { distance, x: cx, y: cy };
      return;
    }

    const drag = this.drag;
    if (!drag || drag.id !== e.pointerId) return;
    const dx = p.x - previous.x;
    const dy = p.y - previous.y;
    if (!drag.moved && Math.hypot(p.x - drag.startX, p.y - drag.startY) > (drag.coarse ? 9 : 4)) {
      drag.moved = true;
      this.setHovered(-1);
      this.canvas.style.cursor = 'grabbing';
      this.emit('pointer', null);
    }
    if (drag.moved && !locked) {
      this.flight = null;
      this.intent = null;
      this.rig.panBy(dx, dy);
      const now = performance.now();
      this.samples.push({ t: now, dx, dy });
      while (this.samples.length && now - this.samples[0].t > 90) this.samples.shift();
      this.invalidate();
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const p = this.local(e);
    if (!this.pointers.delete(e.pointerId)) return;
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    const drag = this.drag;
    if (!drag || drag.id !== e.pointerId) return;
    this.drag = null;
    this.canvas.style.cursor = '';
    if (e.type === 'pointercancel') return;
    if (!drag.moved) {
      const hit = this.pick(p.x, p.y, drag.coarse);
      if (hit) this.emit('click', hit);
      return;
    }
    // Inercia: el mapa sigue deslizándose con la velocidad de los últimos instantes del arrastre.
    const now = performance.now();
    const recent = this.samples.filter((s) => now - s.t < 90);
    if (recent.length >= 2 && this.settled && !this.reducedMotion) {
      const span = Math.max(16, now - recent[0].t) / 1000;
      const vx = recent.reduce((sum, s) => sum + s.dx, 0) / span;
      const vy = recent.reduce((sum, s) => sum + s.dy, 0) / span;
      const speed = Math.hypot(vx, vy);
      if (speed > 60) {
        // Con tope: un gesto muy brusco no debe mandar el mapa a la otra punta.
        const k = Math.min(1, MAX_FLING / speed);
        this.inertia = { vx: vx * k, vy: vy * k };
        this.invalidate();
      }
    }
    if (e.pointerType === 'mouse') this.hoverAt(p.x, p.y);
  };

  private onPointerLeave = () => {
    if (this.drag) return;
    this.lastPointer = null;
    this.setHovered(-1);
    this.emit('pointer', null);
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (!this.settled) return;
    const p = this.local(e);
    const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? 400 : 1;
    // ctrl + rueda es el gesto de pellizco de los paneles táctiles: deltas pequeños, más sensibilidad
    const speed = e.ctrlKey ? 0.012 : 0.0016;
    this.flight = null;
    this.intent = null;
    this.inertia = null;
    this.idleUntil = performance.now() + 4000;
    this.rig.zoomBy(Math.exp(clamp(e.deltaY * unit, -240, 240) * speed), p.x, p.y);
    this.invalidate();
    this.hoverAt(p.x, p.y);
  };

  /** Centro del hueco que deja libre la interfaz: el punto de mira del teclado. */
  private aim(): { x: number; y: number } {
    const p = this.padTarget;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return { x: p.left + (w - p.left - p.right) / 2, y: p.top + (h - p.top - p.bottom) / 2 };
  }

  /**
   * Teclado (con el lienzo enfocado): flechas para mover el mapa, + y − para el zoom, e Intro o
   * espacio para elegir el país que queda en el punto de mira, igual que si se pulsara.
   */
  private onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const step = 70;
    const pan: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const c = this.aim();
    if (pan[e.key]) {
      if (!this.settled) return;
      this.flight = null;
      this.intent = null;
      this.inertia = null;
      this.idleUntil = performance.now() + 4000;
      this.rig.panBy(...pan[e.key]);
    } else if (e.key === '+' || e.key === '=' || e.key === '-') {
      if (!this.settled) return;
      this.flight = null;
      this.intent = null;
      this.rig.zoomBy(e.key === '-' ? 1 / 0.75 : 0.75, c.x, c.y);
    } else if (e.key === 'Enter' || e.key === ' ') {
      const hit = this.pick(c.x, c.y, true);
      if (hit) this.emit('click', hit);
      if (e.key === ' ') e.preventDefault();
      return;
    } else {
      return;
    }
    e.preventDefault();
    this.invalidate();
    // pick() lee la cámara: se actualiza ya, sin esperar al fotograma, para resaltar el país correcto.
    this.rig.apply();
    this.hoverAt(c.x, c.y);
  };

  private hoverAt(x: number, y: number) {
    this.lastPointer = { x, y };
    const hit = this.pick(x, y);
    this.setHovered(hit ? hit.index : -1);
    this.emit('pointer', hit);
  }

  // ───────────────────────── bucle ─────────────────────────

  /** Pide un fotograma. El motor solo dibuja cuando algo ha cambiado. */
  invalidate() {
    if (this.raf || this.disposed) return;
    this.lastFrame = 0;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const dt = this.lastFrame ? clamp((now - this.lastFrame) / 1000, 0, 0.05) : 1 / 60;
    const busyCamera = this.stepCamera(dt, now);
    const busyState = this.stepState(dt, now);
    this.render();
    if (busyCamera || busyState) {
      this.raf = requestAnimationFrame(this.tick);
      this.lastFrame = now;
    }
  };

  private stepCamera(dt: number, now: number): boolean {
    const rig = this.rig;
    let busy = false;

    // márgenes de la interfaz
    const pad = rig.pad;
    const k = 1 - Math.exp(-dt / 0.16);
    for (const side of ['left', 'right', 'top', 'bottom'] as const) {
      const d = this.padTarget[side] - pad[side];
      if (Math.abs(d) > 0.5) {
        pad[side] += d * k;
        busy = true;
      } else {
        pad[side] = this.padTarget[side];
      }
    }

    const f = this.flight;
    if (f) {
      const t = clamp((now - f.t0) / f.duration, 0, 1);
      const e = easeInOutCubic(t);
      rig.morph = f.morphFrom + (f.morphTo - f.morphFrom) * e;
      rig.lon = f.from.lon + f.dLon * e;
      rig.lat = f.from.lat + (f.to.lat - f.from.lat) * e;
      const h = Math.exp(Math.log(f.from.h) + (Math.log(f.to.h) - Math.log(f.from.h)) * e);
      rig.h = Math.min(h * (1 + f.hop * Math.sin(Math.PI * e)), Math.max(h, rig.maxHeight()));
      if (t >= 1) {
        rig.morph = f.morphTo;
        rig.lon = f.morphTo === 1 ? wrapLon(f.to.lon) : f.to.lon;
        rig.h = f.to.h;
        this.flight = null;
        if (this.lastPointer) this.hoverAt(this.lastPointer.x, this.lastPointer.y);
      }
      return true;
    }

    if (this.inertia) {
      const v = this.inertia;
      rig.panBy(v.vx * dt, v.vy * dt);
      const decay = Math.exp(-dt / 0.22);
      v.vx *= decay;
      v.vy *= decay;
      if (Math.hypot(v.vx, v.vy) < 12) this.inertia = null;
      return true;
    }

    if (this.autoRotate && this.mode === 'globe' && this.settled && !this.drag) {
      if (now > this.idleUntil) rig.lon = wrapLon(rig.lon + 0.045 * dt);
      return true;
    }
    return busy;
  }

  private stepState(dt: number, now: number): boolean {
    const { cur, tgt } = this;
    // fundido del día y la noche
    const night = this.uniforms.uNight;
    let fading = false;
    if (Math.abs(this.nightTarget - night.value) > 0.004) {
      night.value += (this.nightTarget - night.value) * (1 - Math.exp(-dt / 0.3));
      fading = true;
    } else {
      night.value = this.nightTarget;
    }

    for (const i of this.animating) {
      if (i === this.pulseIndex) continue;
      const o = i * 5;
      const k = 1 - Math.exp(-dt / this.tau[i]);
      let done = true;
      for (const c of [0, 1, 2, 4]) {
        const d = tgt[o + c] - cur[o + c];
        if (Math.abs(d) > 0.003) {
          cur[o + c] += d * k;
          done = false;
        } else {
          cur[o + c] = tgt[o + c];
        }
      }
      // La elevación va con un muelle amortiguado: rebota un poco al subir.
      let x = cur[o + 3];
      let v = this.vel[i];
      const steps = dt > 0.02 ? 2 : 1;
      for (let s = 0; s < steps; s++) {
        v += (SPRING_STIFFNESS * (tgt[o + 3] - x) - SPRING_DAMPING * v) * (dt / steps);
        x += v * (dt / steps);
      }
      if (Math.abs(tgt[o + 3] - x) < 0.002 && Math.abs(v) < 0.02) {
        x = tgt[o + 3];
        v = 0;
      } else {
        done = false;
      }
      cur[o + 3] = Math.max(0, x);
      this.vel[i] = v;
      this.write(i);
      if (done) {
        this.animating.delete(i);
        this.tau[i] = COLOR_TAU;
      }
    }

    if (this.pulseIndex >= 0) {
      const i = this.pulseIndex;
      const o = i * 5;
      const phase = 0.5 - 0.5 * Math.cos(((now - this.pulseStart) / 1000) * ((2 * Math.PI) / 1.3));
      const base = this.styles[Style.target];
      const k = phase * 0.8;
      cur[o] = base.r + (this.pulseColor[0] - base.r) * k;
      cur[o + 1] = base.g + (this.pulseColor[1] - base.g) * k;
      cur[o + 2] = base.b + (this.pulseColor[2] - base.b) * k;
      cur[o + 3] = base.lift * (0.8 + 0.2 * phase);
      cur[o + 4] = 1;
      this.vel[i] = 0;
      this.write(i);
      return true;
    }
    return fading || this.animating.size > 0;
  }

  private render() {
    const rig = this.rig;
    rig.apply();
    const morph = rig.morph;
    const dpr = this.renderer.getPixelRatio();
    this.uniforms.uMorph.value = morph;
    this.uniforms.uViewport.value.set(rig.width * dpr, rig.height * dpr);
    this.own.line.uWidth.value = LINE_WIDTH * dpr;
    this.own.line.uEmphWidth.value = LINE_WIDTH_EMPH * dpr;
    this.own.marker.uPxPerRad.value = 1 / rig.worldPerPixel;
    this.own.marker.uMarkerPx.value = MARKER_DIAMETER * dpr;

    // El halo solo tiene sentido con el globo formado; la sombra y el marco, con la hoja plana.
    const d = rig.camera.position.length();
    const silhouette = d / Math.sqrt(Math.max(d * d - 1, 1e-3));
    this.own.halo.uSilhouette.value = silhouette;
    this.own.halo.uExtent.value = silhouette * 1.9;
    const formed = smoothstep(0.88, 1, morph);
    this.own.halo.uAlpha.value = this.palette.haloAlpha * formed;
    this.own.halo.uOutlineAlpha.value = this.palette.outlineAlpha * formed;
    this.halo.visible = formed > 0.003;
    this.own.shadow.uAlpha.value = this.palette.sheetShadowAlpha * (1 - smoothstep(0, 0.4, morph));
    this.sheetShadow.visible = this.own.shadow.uAlpha.value > 0.003;
    this.own.frame.uAlpha.value = 0.9 * (1 - smoothstep(0, 0.5, morph));
    this.frameLine.visible = this.own.frame.uAlpha.value > 0.003;

    this.renderer.render(this.scene, rig.camera);

    for (const item of this.tracked) this.place(item);
    this.emit('view', {
      lon: rig.lon / DEG,
      lat: rig.lat / DEG,
      zoom: clamp(1 - Math.log(rig.h / 0.09) / Math.log(rig.maxHeight() / 0.09), 0, 1),
      morph,
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width === this.rig.width && height === this.rig.height) return;
    this.rig.width = width;
    this.rig.height = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    // Lo que se estaba encuadrando sigue encuadrado con el nuevo tamaño.
    if (this.intent && !this.drag) {
      if (this.flight) this.fly(this.intent(), { duration: 400 });
      else Object.assign(this.rig, this.intent());
    }
    this.rig.clampPose();
    this.invalidate();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.tracked.clear();
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }
}
