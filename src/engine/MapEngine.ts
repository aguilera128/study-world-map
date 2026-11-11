import {
  LinearFilter,
  BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
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
  Vector4,
  WebGLRenderer,
  type IUniform,
  ImageLoader,
  Texture,
  RepeatWrapping,
  NoColorSpace,
  type Object3D,
} from 'three';
import type { Atlas } from '../atlas/atlas';
import type { MeshData } from '../atlas/mesh';
import type { Bounds } from '../atlas/types';
import { takeBitmap } from './bitmaps';
import { CameraRig, type Padding, type Pose, type ScreenPoint } from './camera';
import { faintStarGeometry, fillGeometry, frameGeometry, lineGeometry, markerGeometry, oceanGeometry, quadGeometry, starGeometry, wallGeometry } from './geometry';
import { FeatureLabels, type MapFeature } from './labels';
import { rgb, Style, STYLE_COUNT, type Palette } from './palette';
import { DEG, wrapLon } from './projection';
import {
  FILL_FRAG,
  FILL_VERT,
  CORE_FRAG,
  CORE_VERT,
  CUT_FRAG,
  CUT_VERT,
  HALO_FRAG,
  HALO_VERT,
  LINE_FRAG,
  LINE_VERT,
  MARKER_FRAG,
  MARKER_VERT,
  OCEAN_FRAG,
  OCEAN_VERT,
  SKY_FRAG,
  SKY_VERT,
  STAR_FRAG,
  STAR_VERT,
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
  /** Con el interior del planeta a la vista: la capa bajo el cursor, si hay alguna. */
  layer?: PlanetLayer | null;
}

/** Una capa del interior o, sobre la línea que separa dos, su discontinuidad. */
export type PlanetLayer = 'crust' | 'upper' | 'lower' | 'outer' | 'inner' | 'moho' | 'd660' | 'gutenberg' | 'lehmann';
const SHELL_LAYERS: PlanetLayer[] = ['crust', 'upper', 'lower', 'outer', 'inner'];
/** La discontinuidad que cierra cada capa por debajo. */
const SHELL_EDGES: PlanetLayer[] = ['moho', 'd660', 'gutenberg', 'lehmann'];
/**
 * Radio exterior de cada capa (Tierra = 1): superficie, manto superior (con la corteza engrosada,
 * que a escala no se vería), manto inferior (a 660 km de profundidad), núcleo externo (2900 km) e
 * interno (5150 km).
 */
const SHELL_RADIUS = [1, 0.972, (6371 - 660) / 6371, 3471 / 6371, 1221 / 6371];
/** Cuánto se cierra el corte de cada capa respecto al gajo de la superficie, en radianes: los escalones. */
const SHELL_STEP = [0, 5.5 * (Math.PI / 180), 11 * (Math.PI / 180), 16.5 * (Math.PI / 180)];

export interface ViewInfo {
  lon: number;
  lat: number;
  /** 0 = lo más lejos posible, 1 = lo más cerca. */
  zoom: number;
  morph: number;
  /** Kilómetros que mide un píxel de pantalla en el centro de la vista. */
  kmPerPixel: number;
  /** Altura de la cámara sobre la superficie, en kilómetros. */
  heightKm: number;
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
// Oleaje según el zoom, en radios por píxel de pantalla: nada hasta SWELL_FROM, entero desde
// SWELL_FULL. Con el globo entero en un monitor, un píxel son unos 0,002 radios.
const SWELL_FROM = 0.0015;
const SWELL_FULL = 0.0009;
/** Imagen de un píxel para una textura cuya imagen de verdad aún no ha llegado. */
const BLANK = typeof document === 'undefined' ? null : Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
/** Hasta dónde llega el resplandor de un astro desde su centro, en píxeles (con margen). */
const SKY_REACH = 500;
// Detalle de la imagen de satélite y de las luces nocturnas (ver «requestPatch»): teselas de las
// mismas imágenes de la NASA, que guardamos en WebP en nuestro propio almacén (Blob de Vercel; las
// preparan scripts/download-tiles.mjs, convert-tiles.py y upload-tiles.mjs). Rejilla en longitud/latitud: en el nivel n cada
// tesela mide 512 píxeles y cubre 288°/2ⁿ; el último nivel, el 7, da unos 500 m por píxel.
// Se piden a partir de este zoom (radios por píxel: ahí la imagen general ya se ve ampliada) y nunca
// más de 4 × 4 a la vez, que caben en una textura de 2048 píxeles de lado.
const PATCH_FROM = 0.001;
const TILE = 512;
const TILE_SPAN = 288;
const TILE_LEVELS = 7;
const TILES_ACROSS = 4;
const TILE_STORE = 'https://c8oqmmuapex66kvv.public.blob.vercel-storage.com';
const TILE_URL = `${TILE_STORE}/foto`; // Blue Marble Next Generation
const LIGHT_TILE_URL = `${TILE_STORE}/luces`; // Black Marble 2016: solo la luz, en grises
const LIFT = 0.024;
/** Altura de cada capa sobre el océano (evita que parpadeen unas sobre otras). */
const ALT = { fill: 0.002, line: 0.0027, frame: 0.003, marker: 0.004, shadow: -0.004 };
const HOVER_LIFT = 0.34;
/** Un país más pequeño que esto en pantalla (px) se señala con un marcador. */
const MARKER_THRESHOLD = 8;
const MARKER_DIAMETER = 13;
const LINE_WIDTH = 1.15;
const LINE_WIDTH_EMPH = 2.8;
const LINE_CASING = 1.2;

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

/** Tras mover el mapa a mano, el giro automático de la portada espera esto (ms) antes de volver. */
const IDLE_AFTER_TOUCH = 120_000;

interface Tracked {
  el: HTMLElement;
  lon: number;
  lat: number;
  /** Altura sobre el globo, en radios (0 = pegado al mapa). */
  alt: number;
  /** Solo los astros: su dibujo (el elemento con data-sky) y lo que mide. Ver «placeFar». */
  sky?: { body: HTMLElement | SVGElement; width: number; height: number };
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
  private seabedReady = false;
  private shadeReady = false;
  private showPhoto = false;
  private photoReady = false;
  private photoOutline = false;
  /** Detalle de la imagen de satélite: las teselas que hay puestas, la última vista y los turnos de espera. */
  private patchKey = '';
  private patchCanvas: HTMLCanvasElement | null = null;
  private lightsCanvas: HTMLCanvasElement | null = null;
  private patchId = 0;
  private patchTimer = 0;
  private patchView = '';
  private flowReady = false;
  private showCurrents = false;
  private showRelief = false;
  private showDepth = true;
  private reliefReady = false;
  private reliefHd = false;
  private seaTimer = 0;
  private starMaterial!: ShaderMaterial;
  /** El océano y sus dos materiales: el liso y el completo (nulo hasta que termina de compilarse). */
  private sea!: Mesh;
  private seaLite!: ShaderMaterial;
  private seaFull: ShaderMaterial | null = null;
  /** El agua se mueve: hay oleaje a la vista o está la capa de corrientes. */
  private wavy = false;
  private readonly overlays = new Map<string, { labels: FeatureLabels | null; mesh: Mesh | null; material: ShaderMaterial | null }>();
  private guides: Mesh | null = null;
  private graticule: Mesh | null = null;
  private graticuleLabels: FeatureLabels | null = null;
  private zoneLabels: FeatureLabels | null = null;
  private skyTexture: { value: Texture | null } = { value: null };
  private cutFaces: Mesh | null = null;
  private heightBefore = 0;
  private core: Mesh | null = null;
  private planetView: 'interior' | 'atmosphere' | null = null;
  private guideLabels: FeatureLabels | null = null;
  private showStars = true;

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
    uCut: { value: 0 },
    uCutLon: { value: new Vector2(-20 * DEG, 70 * DEG) },
  };
  private readonly own = {
    ocean: { uOcean: { value: new Vector3() }, uGrid: { value: new Vector3() }, uGridAlpha: { value: 0 }, uGlint: { value: 0 }, uSwell: { value: 0 }, uTime: { value: 0 }, uFlow: { value: null as Texture | null }, uFlowAmt: { value: 0 }, uFlowShow: { value: 0 }, uStreak: { value: 60 }, uZones: { value: 0 }, uSeabed: { value: null as Texture | null }, uDepth: { value: 0 }, uShade: { value: null as Texture | null }, uShadeAmt: { value: 0 } },
    fill: { uRelief: { value: null as Texture | null }, uReliefAmt: { value: 0 }, uPhoto: { value: null as Texture | null }, uPhotoAmt: { value: 0 }, uPatch: { value: null as Texture | null }, uPatchBox: { value: new Vector4() }, uPatchAmt: { value: 0 }, uLights: { value: null as Texture | null }, uLightsAmt: { value: 0 }, uLightsPatch: { value: null as Texture | null }, uLightsPatchAmt: { value: 0 } },
    wall: { uWallTint: { value: 0.7 } },
    stars: { uSidereal: { value: 0 }, uDpr: { value: 1 }, uStars: { value: 0 } },
    graticule: { uWidth: { value: 1 }, uEmphWidth: { value: 1 }, uOpacity: { value: 0.55 }, uFlat: { value: 1 }, uCasing: { value: 0 }, uLine: { value: new Vector3() }, uLineEmph: { value: new Vector3() } },
    guide: { uWidth: { value: 1 }, uEmphWidth: { value: 1 }, uOpacity: { value: 0.85 }, uFlat: { value: 1 }, uCasing: { value: 0 }, uLine: { value: new Vector3() }, uLineEmph: { value: new Vector3() } },
    plate: { uWidth: { value: 1 }, uEmphWidth: { value: 1 }, uOpacity: { value: 0.9 }, uFlat: { value: 1 }, uCasing: { value: 0 }, uLine: { value: new Vector3() }, uLineEmph: { value: new Vector3() } },
    river: { uWidth: { value: 1 }, uEmphWidth: { value: 1 }, uOpacity: { value: 0.9 }, uFlat: { value: 1 }, uCasing: { value: 0 }, uLine: { value: new Vector3() }, uLineEmph: { value: new Vector3() } },
    // Todas las líneas comparten programa: un uniforme que le falte a un material se queda con el
    // valor de la última línea dibujada. Sin «uFlat» aquí, las fronteras heredaban el 1 de los ríos,
    // las placas o las líneas imaginarias y dejaban de resaltar el país señalado.
    line: { uWidth: { value: 1 }, uEmphWidth: { value: 2 }, uOpacity: { value: 1 }, uFlat: { value: 0 }, uCasing: { value: 0 } },
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
      uShells: { value: 0 },
      uSunView: { value: new Vector3(0, 0, 1) },
      uSunLit: { value: 0 },
    },
    shadow: { uOffset: { value: new Vector2(0.03, -0.045) }, uColor: { value: new Vector3() }, uAlpha: { value: 0 } },
    frame: { uOffset: { value: new Vector2() }, uColor: { value: new Vector3() }, uAlpha: { value: 0 } },
  };
  private readonly halo: Mesh;
  private readonly sheetShadow: Mesh;
  private readonly frameLine: LineLoop;
  private readonly disposables: { dispose(): void }[] = [];
  /** De dónde sale cada textura de imagen, para volver a pedirla si se pierde el contexto WebGL. */
  private readonly sources = new Map<Texture, { url: string; onLoad: () => void }>();

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
  /** Dibujo por software: sin animación ambiental. */
  private weak = false;
  /** Los sombreadores ya están compilados: hasta entonces no se dibuja. */
  private compiled = false;

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
    // Sin tarjeta gráfica (dibujo por software: equipos muy modestos, navegadores automáticos como
    // el de PageSpeed) cada fotograma cuesta mucho: ahí no hay animación ambiental ni giro solo.
    const gl = this.renderer.getContext();
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    this.weak = /swiftshader|llvmpipe|software|basic render/i.test(String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : ''));
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
    // Profundidad real del mar. Hasta que llega, el mar se pinta de un solo color.
    const seabed = this.image('/data/depth.webp', () => {
      this.seabedReady = true;
      this.own.ocean.uDepth.value = this.showDepth ? this.palette.seaDepth : 0;
      this.invalidate();
    });
    // Corrientes medias reales: con ellas el oleaje avanza hacia donde va el agua.
    const flow = this.image('/data/currents.png', () => {
      this.flowReady = true;
      this.own.ocean.uFlowAmt.value = 1;
      this.own.ocean.uFlowShow.value = this.showCurrents ? 1 : 0;
      this.invalidate();
    });
    flow.colorSpace = NoColorSpace;
    flow.wrapS = RepeatWrapping;
    flow.generateMipmaps = false;
    flow.minFilter = LinearFilter;
    this.disposables.push(flow);
    this.own.ocean.uFlow.value = flow;
    seabed.colorSpace = NoColorSpace;
    seabed.wrapS = RepeatWrapping;
    this.disposables.push(seabed);
    this.own.ocean.uSeabed.value = seabed;
    // Relieve del fondo del mar: da volumen a ese color. Hasta que llega, el fondo es liso.
    const shade = this.image('/data/seabed.webp', () => {
      this.shadeReady = true;
      this.own.ocean.uShadeAmt.value = this.showDepth ? this.palette.seaRelief : 0;
      this.invalidate();
    });
    shade.colorSpace = NoColorSpace;
    shade.wrapS = RepeatWrapping;
    this.disposables.push(shade);
    this.own.ocean.uShade.value = shade;

    // ── capas, de abajo arriba ──
    const sky = { transparent: true, depthWrite: false };
    // La Vía Láctea, detrás de las estrellas: un cuadrado a pantalla completa. Su textura (casi
    // 1 MB) no se pide hasta que el cielo se ve: ver loadSky.
    const screen = new BufferGeometry();
    screen.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    this.add(new Mesh(screen, this.material(SKY_VERT, SKY_FRAG, 0, { ...this.own.stars, uSky: this.skyTexture }, sky)), -2);
    this.starMaterial = this.material(STAR_VERT, STAR_FRAG, 0, { ...this.own.stars, uTime: this.own.ocean.uTime }, sky);
    this.add(new Points(starGeometry(new Date()), this.starMaterial), -1);
    const ocean = oceanGeometry();
    this.seaLite = this.material(OCEAN_VERT, OCEAN_FRAG, 0, this.own.ocean);
    this.sea = new Mesh(ocean, this.seaLite);
    this.add(this.sea, 0);
    this.add(new Mesh(fillGeometry(mesh), this.material(FILL_VERT, FILL_FRAG, ALT.fill, this.own.fill)), 1);
    this.add(new Mesh(wallGeometry(mesh), this.material(WALL_VERT, FILL_FRAG, ALT.fill, { ...this.own.wall, ...this.own.fill })), 2);

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
    canvas.addEventListener(
      'webglcontextrestored',
      () => {
        // Las imágenes decodificadas se soltaron al subirlas (ver «image»): hay que pedirlas otra vez.
        // Mientras llegan, un píxel vacío: three no puede subir una imagen que ya se soltó.
        for (const [texture, { url, onLoad }] of this.sources) {
          if (texture.image instanceof HTMLImageElement) continue;
          texture.image = BLANK;
          texture.needsUpdate = true;
          this.image(url, onLoad, texture);
        }
        this.invalidate();
      },
      { signal },
    );

    // Una versión anterior guardaba las imágenes de satélite en una caché propia; ahora las guarda
    // el navegador por su cuenta. Se retira lo que quedara.
    if (typeof caches !== 'undefined') void caches.delete('satelite-nasa').catch(() => {});

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    // Arranca en la vista general; resize() la ajusta al tamaño real del lienzo.
    this.intent = () => this.homePose();
    this.resize();
    // Los sombreadores se compilan en segundo plano (si el navegador puede) en vez de congelar la
    // página en el primer fotograma: son grandes, y en equipos lentos tardaban varios segundos.
    const ready = () => {
      this.compiled = true;
      this.invalidate();
      this.fullOcean();
    };
    this.rig.apply();
    this.renderer.compileAsync(this.scene, this.rig.camera).then(ready, ready);
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

  /**
   * Textura de una imagen. Se decodifica fuera del hilo principal (ver ./bitmaps.ts) y, una vez en
   * la tarjeta gráfica, la copia decodificada se suelta: son hasta 32 MB por imagen. Si el navegador
   * no puede hacerlo así, se carga como una imagen normal.
   */
  private image(url: string, onLoad: () => void, texture = new Texture()): Texture {
    this.sources.set(texture, { url, onLoad });
    takeBitmap(url).then(
      (bitmap) => {
        if (this.disposed || !this.sources.has(texture)) return bitmap.close();
        // Si la textura ya tenía otra imagen en la tarjeta gráfica (el píxel vacío de después de
        // perder el contexto), se libera: three no cambia el tamaño de una textura ya creada.
        texture.dispose();
        texture.flipY = false; // ya viene volteada
        texture.image = bitmap;
        texture.onUpdate = () => {
          texture.onUpdate = null;
          bitmap.close();
        };
        texture.needsUpdate = true;
        onLoad();
      },
      () =>
        new ImageLoader().load(url, (img) => {
          if (this.disposed) return;
          texture.image = img;
          texture.needsUpdate = true;
          onLoad();
        }),
    );
    return texture;
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

  /**
   * El mapa arranca con el mar liso, que se compila enseguida. El oleaje y las vetas de las
   * corrientes son más de la mitad del tiempo de compilación de todo el mapa: se compilan aparte,
   * con el mapa ya a la vista, para que estén listos cuando hagan falta (ver «tick»).
   */
  private fullOcean() {
    const full = this.material(OCEAN_VERT, OCEAN_FRAG, 0, this.own.ocean);
    full.defines = { WAVES: '' };
    const done = () => {
      if (this.disposed) return;
      this.seaFull = full;
      this.invalidate();
    };
    this.renderer.compileAsync(new Mesh(this.sea.geometry, full), this.rig.camera, this.scene).then(done, done);
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
    this.syncEmph();
    this.own.river.uLine.value.copy(vec3(p.river));
    this.own.river.uLineEmph.value.copy(vec3(p.river));
    this.own.plate.uLine.value.copy(vec3(p.plate));
    this.own.plate.uLineEmph.value.copy(vec3(p.plate));
    this.own.guide.uLine.value.copy(vec3(p.guide));
    this.own.graticule.uLine.value.copy(vec3(p.grid));
    this.own.graticule.uLineEmph.value.copy(vec3(p.grid));
    this.own.guide.uLineEmph.value.copy(vec3(p.guide));
    u.uNightTint.value.copy(vec3(p.nightTint));
    u.uNightDim.value = p.nightDim;
    this.own.ocean.uOcean.value.copy(vec3(p.ocean));
    this.own.ocean.uGrid.value.copy(vec3(p.grid));
    this.own.ocean.uGridAlpha.value = this.showGrid ? p.gridAlpha : 0;
    this.own.ocean.uGlint.value = this.showGlint ? p.glint : 0;
    this.own.ocean.uDepth.value = this.showDepth && this.seabedReady ? p.seaDepth : 0;
    this.own.ocean.uShadeAmt.value = this.showDepth && this.shadeReady ? p.seaRelief : 0;
    this.own.fill.uReliefAmt.value = this.showRelief && this.reliefReady ? p.relief : 0;
    this.own.stars.uStars.value = this.showStars ? p.stars : 0;
    this.loadSky();
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
      if (this.styleOf[i] >= Style.mastery) {
        // En los mapas de datos (dominio, climas, densidad) el color es el dato: no se toca. El país
        // se distingue por la elevación y el contorno.
      } else if (this.styleOf[i] >= Style.political) {
        // En el mapa político se aclara su mismo color: teñirlo lo confundía con los vecinos que ya
        // son de ese tono.
        const k = this.palette.hoverOwn;
        r += (1 - r) * k;
        g += (1 - g) * k;
        b += (1 - b) * k;
      } else {
        // Un país ya resuelto conserva su color: el cursor solo lo aclara un poco.
        const resolved = this.styleOf[i] >= Style.ok && this.styleOf[i] <= Style.target;
        const k = this.palette.hoverMix * (resolved ? 0.3 : 1);
        r += (this.hoverColor[0] - r) * k;
        g += (this.hoverColor[1] - g) * k;
        b += (this.hoverColor[2] - b) * k;
      }
      lift += HOVER_LIFT;
      emph = 1;
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
    this.auxData[p + 2] = this.photoShare(i) * 255;
    this.stateTex.needsUpdate = true;
    this.auxTex.needsUpdate = true;
  }

  /**
   * Cuánto de la imagen de satélite deja ver un país cuando esa capa está puesta: entera en el mapa
   * político y en el mudo, un tercio bajo el color de una respuesta (que tiene que seguir leyéndose)
   * y nada en los mapas de datos (dominio, climas, densidad), donde el color es el dato.
   */
  private photoShare(i: number): number {
    const style = this.styleOf[i];
    if (style >= Style.ok && style <= Style.target) return 0.35;
    if (style >= Style.mastery && style !== Style.ice && style !== Style.land) return 0;
    return 1;
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

  /** Muestra u oculta la retícula, el reflejo del agua y las estrellas. */
  setLayers(grid: boolean, glint: boolean, stars: boolean) {
    this.showGrid = grid;
    this.showGlint = glint;
    this.showStars = stars;
    this.own.ocean.uGridAlpha.value = grid ? this.palette.gridAlpha : 0;
    this.own.ocean.uGlint.value = glint ? this.palette.glint : 0;
    this.own.stars.uStars.value = stars ? this.palette.stars : 0;
    this.loadSky();
    this.invalidate();
  }

  /**
   * Capa de datos sobre el mapa: rotula sus elementos y dibuja sus líneas (ríos, límites de placas…)
   * con el color `line` de la paleta. Con una lista vacía, la quita. `key` distingue unas de otras.
   */
  setOverlay(key: string, features: MapFeature[], line: 'river' | 'plate' = 'river') {
    let overlay = this.overlays.get(key);
    if (!overlay) {
      overlay = { labels: null, mesh: null, material: null };
      this.overlays.set(key, overlay);
    }
    if (!overlay.labels && features.length && this.canvas.parentElement) overlay.labels = new FeatureLabels(this.canvas.parentElement);
    overlay.labels?.set(features);
    if (overlay.mesh) {
      this.scene.remove(overlay.mesh);
      overlay.mesh.geometry.dispose();
      overlay.mesh = null;
    }
    const start: number[] = [];
    const end: number[] = [];
    for (const f of features) {
      for (const part of f.lines ?? []) {
        for (let i = 0; i + 3 < part.length; i += 2) this.segment(start, end, part[i], part[i + 1], part[i + 2], part[i + 3]);
      }
    }
    if (start.length) {
      overlay.material ??= this.material(LINE_VERT, LINE_FRAG, ALT.line, this.own[line], { transparent: true, depthWrite: false });
      overlay.mesh = this.segments(start, end, overlay.material);
    }
    this.invalidate();
  }

  /** Añade un tramo (en grados) con el país que tiene debajo, para que suba con él al levantarse. */
  private segment(start: number[], end: number[], lon0: number, lat0: number, lon1: number, lat1: number) {
    start.push(lon0 * DEG, lat0 * DEG, this.atlas.locate((lon0 + lon1) / 2, (lat0 + lat1) / 2));
    end.push(lon1 * DEG, lat1 * DEG);
  }

  /** Líneas sueltas sobre el mapa, con la misma plantilla que las fronteras (lineGeometry): un rectángulo por tramo. */
  private segments(start: number[], end: number[], material: ShaderMaterial): Mesh {
    const geometry = new InstancedBufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0]), 3));
    geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));
    geometry.setAttribute('aStart', new InstancedBufferAttribute(new Float32Array(start), 3));
    geometry.setAttribute('aEnd', new InstancedBufferAttribute(new Float32Array(end), 2));
    geometry.instanceCount = end.length / 2;
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 5;
    this.scene.add(mesh);
    return mesh;
  }

  /**
   * «El planeta por dentro y por fuera», sobre el propio globo: `interior` abre un gajo y enseña las
   * capas de la Tierra en sus caras; `atmosphere` rodea el globo con las capas de la atmósfera.
   * Solo tiene sentido con el globo formado: quien lo llama pone antes la vista en 3D.
   */
  setPlanetView(view: 'interior' | 'atmosphere' | null) {
    // Al dejar la atmósfera, la cámara vuelve a la altura que tenía antes de alejarse.
    if (this.planetView === 'atmosphere' && view !== 'atmosphere' && this.heightBefore) this.flyTo({ h: this.heightBefore });
    if (view === 'atmosphere' && this.planetView !== 'atmosphere') this.heightBefore = this.rig.h;
    else if (view !== 'atmosphere') this.heightBefore = 0;
    const already = this.planetView === view;
    this.planetView = view;
    this.uniforms.uCut.value = view === 'interior' ? 1 : 0;
    this.own.halo.uShells.value = view === 'atmosphere' ? 1 : 0;
    if (view === 'interior' && !this.cutFaces) {
      const [west, east] = [this.uniforms.uCutLon.value.x, this.uniforms.uCutLon.value.y];
      const position: number[] = [];
      const shade: number[] = [];
      const radius: number[] = [];
      const at = (lon: number, lat: number, r: number) => [r * Math.cos(lat) * Math.sin(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.cos(lon)];
      // Un trozo de superficie en malla: point(u, v) con u, v en 0..1. «tint» es el radio con el que
      // se colorea un escalón (0 en las caras del corte, que se colorean por su distancia al centro).
      const patch = (point: (u: number, v: number) => number[], light: number, tint = 0, nu = 40, nv = 12) => {
        for (let i = 0; i < nu; i++) {
          for (let j = 0; j < nv; j++) {
            const [a, b, c, d] = [point(i / nu, j / nv), point((i + 1) / nu, j / nv), point((i + 1) / nu, (j + 1) / nv), point(i / nu, (j + 1) / nv)];
            position.push(...a, ...b, ...c, ...a, ...c, ...d);
            for (let k = 0; k < 6; k++) {
              shade.push(light);
              radius.push(tint);
            }
          }
        }
      };
      const mix = (a: number, b: number, k: number) => a + (b - a) * k;
      const top = Math.PI / 2;
      for (let k = 0; k < SHELL_STEP.length; k++) {
        const [outer, inner, step] = [SHELL_RADIUS[k], SHELL_RADIUS[k + 1], SHELL_STEP[k]];
        // Las tres caras del corte de esta capa: dos sobre sus meridianos y el suelo.
        patch((u, v) => at(west + step, mix(step, top, u), mix(inner, outer, v)), 0.82);
        patch((u, v) => at(east - step, mix(step, top, u), mix(inner, outer, v)), 1);
        patch((u, v) => at(mix(west + step, east - step, u), step, mix(inner, outer, v)), 0.9);
        if (k === 0) continue;
        // El escalón: la superficie de la capa que queda a la vista entre su corte y el de la capa de encima.
        const [before, tint] = [SHELL_STEP[k - 1], outer - 0.012];
        patch((u, v) => at(mix(west + before, west + step, v), mix(before, top, u), outer), 1.08, tint, 40, 4);
        patch((u, v) => at(mix(east - step, east - before, v), mix(before, top, u), outer), 0.94, tint, 40, 4);
        patch((u, v) => at(mix(west + step, east - step, u), mix(before, step, v), outer), 1.02, tint, 40, 4);
      }
      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(new Float32Array(position), 3));
      geometry.setAttribute('aShade', new BufferAttribute(new Float32Array(shade), 1));
      geometry.setAttribute('aRadius', new BufferAttribute(new Float32Array(radius), 1));
      this.cutFaces = new Mesh(geometry, this.material(CUT_VERT, CUT_FRAG, 0, { uTime: this.own.ocean.uTime }));
      this.add(this.cutFaces, 3);
      // El núcleo interno (1220 km de radio), entero.
      this.core = new Mesh(new SphereGeometry(SHELL_RADIUS[4], 48, 32), this.material(CORE_VERT, CORE_FRAG, 0, { uTime: this.own.ocean.uTime }));
      this.add(this.core, 3);
    }
    if (this.cutFaces) this.cutFaces.visible = view === 'interior';
    if (this.core) this.core.visible = view === 'interior';
    if (view === 'interior') {
      // De frente al gajo y un poco desde arriba, con el globo entero a la vista.
      const { x, y } = this.uniforms.uCutLon.value;
      this.flyTo({ lon: (x + y) / 2, lat: 24 * DEG });
    }
    // Las capas de la atmósfera ocupan bastante más que el globo: se aleja la cámara para que quepan.
    if (view === 'atmosphere' && !already) this.flyTo({ h: this.rig.h * 1.7 });
    this.invalidate();
  }

  /** Husos horarios teóricos: franjas de 15° sobre el mar, cada una con su diferencia respecto a UTC. */
  setZones(on: boolean) {
    this.own.ocean.uZones.value = on ? 1 : 0;
    if (on && !this.zoneLabels && this.canvas.parentElement) this.zoneLabels = new FeatureLabels(this.canvas.parentElement);
    const labels: MapFeature[] = [];
    if (on) {
      for (let hour = -11; hour <= 12; hour++) {
        const text = hour === 0 ? 'UTC' : `UTC${hour > 0 ? '+' : '−'}${Math.abs(hour)}`;
        for (const lat of [-38, 24]) labels.push({ kind: 'grado', rank: 0, lon: hour * 15, lat, text });
      }
    }
    this.zoneLabels?.set(labels);
    this.invalidate();
  }

  /**
   * Retícula cada 15° dibujada también sobre tierra y con los grados rotulados, para leer
   * coordenadas. `west` es la letra del oeste en el idioma de la página («O», «W»).
   */
  setGraticule(on: boolean, west = 'O') {
    if (this.graticule) this.graticule.visible = on;
    if (!on) {
      this.graticuleLabels?.set([]);
      this.invalidate();
      return;
    }
    if (!this.graticule) {
      const start: number[] = [];
      const end: number[] = [];
      for (let lat = -75; lat <= 75; lat += 15) {
        for (let lon = -180; lon < 180; lon += 3) this.segment(start, end, lon, lat, lon + 3, lat);
      }
      for (let lon = -180; lon < 180; lon += 15) {
        for (let lat = -84; lat < 84; lat += 3) this.segment(start, end, lon, lat, lon, lat + 3);
      }
      this.graticule = this.segments(start, end, this.material(LINE_VERT, LINE_FRAG, ALT.line, this.own.graticule, { transparent: true, depthWrite: false }));
      this.disposables.push(this.graticule.geometry);
    }
    if (!this.graticuleLabels && this.canvas.parentElement) this.graticuleLabels = new FeatureLabels(this.canvas.parentElement);
    const labels: MapFeature[] = [];
    // latitudes, sobre cuatro meridianos; longitudes, sobre el ecuador y los paralelos 45
    for (let lat = -75; lat <= 75; lat += 15) {
      const text = lat === 0 ? '0°' : `${Math.abs(lat)}° ${lat > 0 ? 'N' : 'S'}`;
      for (const lon of [-157.5, -67.5, 22.5, 112.5]) labels.push({ kind: 'grado', rank: 0, lon, lat, text });
    }
    for (let lon = -165; lon <= 180; lon += 15) {
      const text = lon === 0 || lon === 180 ? `${Math.abs(lon)}°` : `${Math.abs(lon)}° ${lon > 0 ? 'E' : west}`;
      for (const lat of [-52.5, 7.5, 52.5]) labels.push({ kind: 'grado', rank: 0, lon, lat, text });
    }
    this.graticuleLabels?.set(labels);
    this.invalidate();
  }

  /**
   * Líneas imaginarias con su nombre: ecuador, trópicos, círculos polares y meridiano de Greenwich.
   * Los nombres van de norte a sur y Greenwich al final; sin nombres, se quitan.
   */
  setGuides(names: string[] | null) {
    if (this.guides) this.guides.visible = !!names;
    if (!names) {
      this.guideLabels?.set([]);
      this.invalidate();
      return;
    }
    // Los trópicos están a la latitud de la inclinación del eje (23° 26′) y los círculos polares
    // a su complementaria (66° 34′).
    const TILT = 23.436;
    const parallels = [90 - TILT, TILT, 0, -TILT, TILT - 90];
    if (!this.guides) {
      const start: number[] = [];
      const end: number[] = [];
      for (const lat of parallels) {
        for (let lon = -180; lon < 180; lon++) this.segment(start, end, lon, lat, lon + 1, lat);
      }
      for (let lat = -90; lat < 90; lat++) this.segment(start, end, 0, lat, 0, lat + 1);
      this.guides = this.segments(start, end, this.material(LINE_VERT, LINE_FRAG, ALT.line, this.own.guide, { transparent: true, depthWrite: false }));
      this.disposables.push(this.guides.geometry);
    }
    if (!this.guideLabels && this.canvas.parentElement) this.guideLabels = new FeatureLabels(this.canvas.parentElement);
    // El nombre se repite a lo largo de cada línea para que siempre haya uno a la vista.
    const labels: MapFeature[] = [];
    parallels.forEach((lat, i) => {
      for (let lon = -135; lon < 180; lon += 90) labels.push({ kind: 'guia', rank: 0, lon, lat, text: names[i] });
    });
    for (const lat of [-50, -12, 12, 50]) labels.push({ kind: 'guia', rank: 0, lon: 0, lat, text: names[5] });
    this.guideLabels?.set(labels);
    this.invalidate();
  }

  /** Muestra u oculta la capa de corrientes oceánicas (vetas que avanzan con el agua). */
  setCurrents(on: boolean) {
    this.showCurrents = on;
    this.own.ocean.uFlowShow.value = on && this.flowReady ? 1 : 0;
    this.invalidate();
  }

  /** Pinta el mar con su profundidad real o de un solo color. */
  setSeaDepth(on: boolean) {
    this.showDepth = on;
    this.own.ocean.uDepth.value = on && this.seabedReady ? this.palette.seaDepth : 0;
    this.own.ocean.uShadeAmt.value = on && this.shadeReady ? this.palette.seaRelief : 0;
    this.invalidate();
  }

  /**
   * Contorno del país señalado. Sobre la imagen de satélite el país no se puede teñir (se taparía la
   * foto), así que el amarillo de «señalado» pasa al contorno, con un ribete oscuro que lo separa de
   * la arena y de la nieve. Sin la foto, el contorno es el del tema (crema o tinta), sin ribete.
   */
  private syncEmph() {
    this.photoOutline = this.showPhoto && this.photoReady;
    this.uniforms.uLineEmph.value.copy(vec3(this.photoOutline ? this.palette.hover : this.palette.lineEmph));
  }

  /** Pinta la tierra con la imagen de satélite. La imagen (480 KB) solo se descarga si se pide. */
  setSatellite(on: boolean) {
    this.showPhoto = on;
    if (on && !this.own.fill.uPhoto.value) {
      const photo = this.image('/data/satellite.webp', () => {
        this.photoReady = true;
        this.own.fill.uPhotoAmt.value = this.showPhoto ? 1 : 0;
        this.syncEmph();
        this.invalidate();
      });
      photo.colorSpace = NoColorSpace;
      photo.wrapS = RepeatWrapping;
      photo.anisotropy = 4;
      this.disposables.push(photo);
      this.own.fill.uPhoto.value = photo;
    }
    this.own.fill.uPhotoAmt.value = on && this.photoReady ? 1 : 0;
    this.syncEmph();
    this.patchView = ''; // que se vuelva a mirar si hace falta detalle
    this.invalidate();
  }

  /**
   * Con el mapa acercado se piden las teselas de detalle que cubren lo que se ve y se dibujan sobre
   * la imagen general, que de cerca queda borrosa (10 km por píxel): las de la foto, si la capa
   * «Imagen de satélite» está puesta, y las de las luces, si en lo que se ve es de noche. Salen de
   * nuestro propio almacén, no de un tercero, y el navegador las guarda un año.
   */
  private requestPatch() {
    this.patchTimer = 0;
    const rig = this.rig;
    const photo = this.showPhoto && this.photoReady;
    const lights = this.nightTarget > 0 && this.own.fill.uLightsAmt.value > 0;
    if (this.disposed || (!photo && !lights) || rig.worldPerPixel > PATCH_FROM) return;
    if (rig.morph > 0.001 && rig.morph < 0.999) return;
    // Qué se ve: el punto del mapa bajo el centro, las esquinas y los lados de la parte de la
    // pantalla que los paneles dejan libre.
    let [west, south, east, north] = [Infinity, Infinity, -Infinity, -Infinity];
    let dark = false; // ¿es de noche en algún punto de lo que se ve?
    const sun = this.uniforms.uSun.value;
    const { left, right, top, bottom } = rig.pad;
    const [x0, y0, w, h] = [left, top, Math.max(1, rig.width - left - right), Math.max(1, rig.height - top - bottom)];
    const center = rig.screenToGeo(x0 + w / 2, y0 + h / 2);
    if (!center) return;
    for (const fx of [0, 0.5, 1]) {
      for (const fy of [0, 0.5, 1]) {
        const p = rig.screenToGeo(x0 + fx * w, y0 + fy * h);
        if (!p) return; // asoma el cielo: aún no está lo bastante cerca
        // longitudes respecto al centro, para no partir la zona en el antimeridiano
        const lon = center.lon + Math.atan2(Math.sin(p.lon - center.lon), Math.cos(p.lon - center.lon));
        west = Math.min(west, lon / DEG);
        east = Math.max(east, lon / DEG);
        south = Math.min(south, p.lat / DEG);
        north = Math.max(north, p.lat / DEG);
        const cos = Math.cos(p.lat);
        if (cos * Math.sin(p.lon) * sun.x + Math.sin(p.lat) * sun.y + cos * Math.cos(p.lon) * sun.z < 0.05) dark = true;
      }
    }
    dark &&= lights;
    if (!photo && !dark) return;
    // La rejilla no da la vuelta al antimeridiano: las zonas que lo cruzan se quedan sin detalle.
    if (west < -180 || east > 180) return;
    // El nivel cuya resolución alcanza la de la pantalla; si hacen falta demasiadas teselas para
    // cubrir la vista, uno menos fino.
    const wanted = this.renderer.getPixelRatio() / (rig.worldPerPixel / DEG); // píxeles por grado
    let level = clamp(Math.ceil(Math.log2((wanted * 0.75 * TILE_SPAN) / TILE)), 0, TILE_LEVELS);
    let span = 0;
    let [c0, c1, r0, r1] = [0, 0, 0, 0];
    for (; ; level--) {
      span = TILE_SPAN / 2 ** level;
      c0 = Math.floor((west + 180) / span);
      c1 = Math.floor((east + 180) / span);
      r0 = Math.max(0, Math.floor((90 - north) / span));
      r1 = Math.floor((90 - south) / span);
      if (level === 0 || (c1 - c0 < TILES_ACROSS && r1 - r0 < TILES_ACROSS)) break;
    }
    const key = `${level}/${r0}-${r1}/${c0}-${c1}${photo ? '/foto' : ''}${dark ? '/noche' : ''}`;
    if (key === this.patchKey) return;
    this.patchKey = key;
    const id = ++this.patchId;

    // Zona que cubren esas teselas, en grados, y el lienzo donde se van pegando.
    const box: Bounds = [c0 * span - 180, 90 - (r1 + 1) * span, (c1 + 1) * span - 180, 90 - r0 * span];
    const was = this.own.fill.uPatchBox.value.clone();
    // Un lienzo con las teselas de una capa, que se van pegando según llegan, y su textura.
    const layer = (uniform: { value: Texture | null }, old: HTMLCanvasElement | null, url: string, opaque: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = (c1 - c0 + 1) * TILE;
      canvas.height = (r1 - r0 + 1) * TILE;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      // Mientras llegan, lo que ya había de esa zona (del nivel que fuera), para que no se vea
      // volver a lo borroso. Lo que no había queda vacío y el sombreador deja pasar la imagen general.
      if (old) {
        const sx = canvas.width / (box[2] - box[0]);
        const sy = canvas.height / (box[3] - box[1]);
        ctx.drawImage(old, (was.x / DEG - box[0]) * sx, (box[3] - was.w / DEG) * sy, ((was.z - was.x) / DEG) * sx, ((was.w - was.y) / DEG) * sy);
      }
      let texture = uniform.value;
      if (!texture) {
        texture = new Texture();
        texture.colorSpace = NoColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = LinearFilter;
        this.disposables.push(texture);
        uniform.value = texture;
      }
      const shown = texture;
      shown.dispose(); // el lienzo anterior medía otra cosa: three no cambia el tamaño de una textura
      shown.image = canvas;
      shown.needsUpdate = true;
      ctx.fillStyle = '#000';
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          fetch(`${url}/${level}/${r}/${c}.webp`)
            .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
            .then((blob) => createImageBitmap(blob))
            .then((tile) => {
              if (!this.disposed && id === this.patchId) {
                // Las teselas de luces son transparentes donde no hay luz: se pintan sobre negro,
                // para que «opaco» signifique «esta tesela ya ha llegado».
                if (opaque) ctx.fillRect((c - c0) * TILE, (r - r0) * TILE, TILE, TILE);
                ctx.drawImage(tile, (c - c0) * TILE, (r - r0) * TILE);
                shown.needsUpdate = true;
                this.invalidate();
              }
              tile.close();
            })
            .catch(() => {}); // sin conexión o sin servicio: ahí se queda la imagen general
        }
      }
      return canvas;
    };
    const fill = this.own.fill;
    this.patchCanvas = photo ? layer(fill.uPatch, fill.uPatchAmt.value > 0 ? this.patchCanvas : null, TILE_URL, false) : null;
    // Las luces, solo si en lo que se ve es de noche en algún punto.
    this.lightsCanvas = dark ? layer(fill.uLightsPatch, fill.uLightsPatchAmt.value > 0 ? this.lightsCanvas : null, LIGHT_TILE_URL, true) : null;
    fill.uPatchBox.value.set(box[0] * DEG, box[1] * DEG, box[2] * DEG, box[3] * DEG);
    fill.uPatchAmt.value = this.patchCanvas ? 1 : 0;
    fill.uLightsPatchAmt.value = this.lightsCanvas ? 1 : 0;
    this.invalidate();
  }

  /** Muestra u oculta el sombreado del relieve. La imagen (200 KB) solo se descarga si se pide. */
  setRelief(on: boolean) {
    this.showRelief = on;
    if (on && !this.own.fill.uRelief.value) this.loadRelief('/data/relief.webp');
    this.own.fill.uReliefAmt.value = on && this.reliefReady ? this.palette.relief : 0;
    this.invalidate();
  }

  private loadRelief(url: string) {
    const relief = this.image(url, () => {
      // la de detalle sustituye a la normal cuando ya está lista, no antes
      const old = this.own.fill.uRelief.value;
      if (old && old !== relief) {
        this.sources.delete(old);
        old.dispose();
      }
      this.own.fill.uRelief.value = relief;
      this.reliefReady = true;
      this.own.fill.uReliefAmt.value = this.showRelief ? this.palette.relief : 0;
      this.invalidate();
    });
    relief.colorSpace = NoColorSpace;
    relief.wrapS = RepeatWrapping;
    relief.anisotropy = 4;
    this.disposables.push(relief);
    this.own.fill.uRelief.value ??= relief;
  }

  /** Pide la textura de la Vía Láctea la primera vez que el cielo está a la vista (tema de noche, estrellas activas). */
  private loadSky() {
    if (this.skyTexture.value || !this.showStars || this.palette.stars <= 0) return;
    const galaxy = this.image('/data/milkyway.webp', () => this.invalidate());
    galaxy.wrapS = RepeatWrapping;
    galaxy.generateMipmaps = false;
    galaxy.minFilter = LinearFilter;
    this.disposables.push(galaxy);
    this.skyTexture.value = galaxy;
    // Y las estrellas débiles (decenas de miles: 440 KB), que con las brillantes del catálogo Yale
    // llenan el fondo. Sin tarjeta gráfica no se piden: son demasiados puntos para dibujar a mano.
    if (this.weak) return;
    fetch('/data/stars.bin')
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (this.disposed) return;
        this.add(new Points(faintStarGeometry(data, new Date()), this.starMaterial), -1);
        this.invalidate();
      })
      .catch(() => {});
  }

  /** Gira el cielo: hora sidérea de Greenwich, en grados. */
  setSidereal(deg: number) {
    this.own.stars.uSidereal.value = deg * DEG;
    this.invalidate();
  }

  /** Intensidad del día y la noche: 0 = oculto, 1 = pleno (se funde poco a poco). */
  setDaylight(strength: number) {
    this.nightTarget = clamp(strength, 0, 1);
    // Con la noche a la vista, las luces de las ciudades (105 KB, solo se piden entonces). Cuánto se
    // ven en cada punto lo decide el sombreador: solo donde es de noche.
    if (this.nightTarget > 0 && !this.own.fill.uLights.value) {
      const lights = this.image('/data/nightlights.webp', () => {
        this.own.fill.uLightsAmt.value = 1;
        this.invalidate();
      });
      lights.colorSpace = NoColorSpace;
      lights.wrapS = RepeatWrapping;
      this.disposables.push(lights);
      this.own.fill.uLights.value = lights;
    }
    this.patchView = ''; // que se vuelva a mirar si hace falta el detalle de las luces
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
    this.idleUntil = performance.now() + IDLE_AFTER_TOUCH; // como con la rueda: el giro de la portada se para
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
    this.autoRotate = on && !this.reducedMotion && !this.weak;
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

  /**
   * Un astro, a su distancia real. No se oculta de golpe al pasar tras la Tierra: se recorta con el
   * contorno del globo, así que asoma o se esconde poco a poco por el borde.
   */
  private placeFar(item: Tracked): ScreenPoint {
    const p = this.rig.projectFar(item.lon, item.lat, 1 + item.alt, this.screen);
    const disc = this.rig.earthDisc();
    // Se recorta el dibujo del astro (marcado con data-sky), no su ficha, que debe leerse entera
    // aunque caiga sobre el globo. El dibujo va centrado en el punto, así que su esquina queda a medio tamaño.
    // El dibujo se mide una vez y no en cada fotograma: medir obliga al navegador a recalcular los
    // estilos de la página en ese momento, y aquí ocurría dos veces por fotograma (Sol y Luna). Se
    // vuelve a medir si cambia el tamaño del lienzo o si React sustituye el elemento, y mientras
    // mida cero (oculto) no se da por bueno.
    let sky = item.sky;
    if (!sky || !sky.body.isConnected || sky.width === 0) {
      const body = item.el.querySelector<HTMLElement | SVGElement>('[data-sky]') ?? item.el;
      const box = body === item.el ? { width: 0, height: 0 } : body.getBoundingClientRect();
      sky = item.sky = { body, width: box.width, height: box.height };
    }
    p.visible = !!p.ahead;
    // Lejos de la pantalla no se ve ni su resplandor: no hace falta tocar el recorte.
    if (p.x < -SKY_REACH || p.y < -SKY_REACH || p.x > this.rig.width + SKY_REACH || p.y > this.rig.height + SKY_REACH) return p;
    const [x, y, r] = [disc.x - p.x + sky.width / 2, disc.y - p.y + sky.height / 2, disc.r];
    // Todo menos el círculo de la Tierra, en coordenadas del propio dibujo.
    sky.body.style.clipPath = p.ahead
      ? `path(evenodd, "M-3000 -3000H3000V3000H-3000Z M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0a${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0Z")`
      : '';
    return p;
  }

  private place(item: Tracked) {
    // Lo que flota (el Sol, la Luna) solo se separa en el globo, y nunca más allá de media altura de
    // la cámara: al acercarse baja hasta su punto del mapa en vez de quedar detrás del observador.
    const rig = this.rig;
    const alt = item.alt * rig.morph;
    // Los astros (la Luna a 60 radios, el Sol a 23 500) van a su distancia real con el globo formado:
    // casi siempre quedan fuera de la pantalla o detrás de la Tierra, como de verdad.
    const p =
      item.alt > 10 && rig.morph > 0.999
        ? this.placeFar(item)
        : rig.project(item.lon, item.lat, ALT.marker + Math.min(alt, rig.h * 0.5), this.screen, alt > 0);
    // Con el planeta abierto, lo que cae sobre el gajo quitado no tiene dónde apoyarse.
    if (this.planetView === 'interior' && rig.morph > 0.999 && item.alt <= 10 && item.lat > 0) {
      const { x, y } = this.uniforms.uCutLon.value;
      const lon = Math.atan2(Math.sin(item.lon), Math.cos(item.lon));
      if (lon > x && lon < y) p.visible = false;
    }
    // En el mapa plano los astros vuelven a su punto del mapa, sin recorte.
    if (item.alt > 10 && rig.morph <= 0.999) item.el.querySelector<HTMLElement | SVGElement>('[data-sky]')?.style.removeProperty('clip-path');
    item.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    item.el.toggleAttribute('data-hidden', !p.visible);
  }

  /** País (y coordenadas) bajo un píxel, teniendo en cuenta los marcadores de países pequeños. */
  pick(x: number, y: number, coarse = false): PointerInfo | null {
    if (!this.settled) return null;
    // Con el planeta abierto no se señalan países: se señalan sus capas.
    if (this.planetView === 'interior' && this.rig.morph > 0.999) return { x, y, index: -1, lon: 0, lat: 0, layer: this.layerAt(x, y) };
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

  /**
   * Capa del interior bajo un píxel: la primera superficie sólida que encuentra el rayo entre las
   * del corte escalonado (esferas, meridianos y suelos de cada capa). Null fuera del gajo.
   */
  private layerAt(x: number, y: number): PlanetLayer | null {
    const { o, d } = this.rig.screenRay(x, y);
    const [west, east] = [this.uniforms.uCutLon.value.x, this.uniforms.uCutLon.value.y];
    let best = Infinity;
    let layer: PlanetLayer | null = null;
    let face: PlanetLayer | null = null;
    // Prueba un punto del rayo: «ok» recibe su radio, su latitud y lo que se adentra en el gajo por cada meridiano.
    const tryAt = (t: number, hit: PlanetLayer | null, ok: (r: number, lat: number, w: number, e: number) => boolean) => {
      if (!(t > 0) || t >= best) return;
      face = null;
      const [px, py, pz] = [o.x + d.x * t, o.y + d.y * t, o.z + d.z * t];
      const r = Math.hypot(px, py, pz);
      const lon = Math.atan2(px, pz);
      if (!ok(r, Math.asin(Math.max(-1, Math.min(1, py / r))), lon - west, east - lon)) return;
      best = t;
      layer = face ?? hit;
    };
    const quadratic = (a: number, b: number, c: number) => {
      const disc = b * b - 4 * a * c;
      if (disc < 0 || Math.abs(a) < 1e-12) return [];
      const root = Math.sqrt(disc);
      return [(-b - root) / (2 * a), (-b + root) / (2 * a)];
    };
    const EPS = 1e-4;
    const core = SHELL_RADIUS.length - 1;
    for (let k = 0; k <= core; k++) {
      const [outer, inner, step] = [SHELL_RADIUS[k], SHELL_RADIUS[k + 1] ?? 0, SHELL_STEP[k] ?? Infinity];
      // La esfera de la capa: sólida donde su propio corte no la ha quitado. La superficie no es ninguna capa.
      for (const t of quadratic(1, 2 * o.dot(d), o.lengthSq() - outer * outer)) {
        tryAt(t, k === 0 ? null : SHELL_LAYERS[k], (_r, lat, w, e) => Math.min(lat, w, e) < step);
      }
      if (k === core) break;
      // En las caras del corte, junto a la línea que separa dos capas se señala la discontinuidad.
      const within = (r: number) => {
        if (r < inner - EPS || r > outer + EPS) return false;
        face = r - inner < 0.012 ? SHELL_EDGES[k] : k > 0 && outer - r < 0.012 ? SHELL_EDGES[k - 1] : null;
        return true;
      };
      // Sus dos caras sobre los meridianos…
      for (const [lon, side] of [[west + step, 1], [east - step, -1]] as const) {
        const [nx, nz] = [Math.cos(lon), -Math.sin(lon)];
        const den = d.x * nx + d.z * nz;
        if (Math.abs(den) < 1e-9) continue;
        tryAt(-(o.x * nx + o.z * nz) / den, SHELL_LAYERS[k], (r, lat, w, e) => within(r) && lat >= step - EPS && Math.abs((side > 0 ? w : e) - step) < 0.01);
      }
      // …y su suelo: el ecuador en la corteza, un cono de latitud constante en las demás.
      const slope = Math.tan(step) ** 2;
      const floor =
        k === 0
          ? Math.abs(d.y) < 1e-9
            ? []
            : [-o.y / d.y]
          : quadratic(d.y * d.y - slope * (d.x * d.x + d.z * d.z), 2 * (o.y * d.y - slope * (o.x * d.x + o.z * d.z)), o.y * o.y - slope * (o.x * o.x + o.z * o.z));
      for (const t of floor) tryAt(t, SHELL_LAYERS[k], (r, lat, w, e) => within(r) && lat > -EPS && Math.min(w, e) >= step - EPS);
    }
    return layer;
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
    this.idleUntil = performance.now() + IDLE_AFTER_TOUCH;
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
    this.idleUntil = performance.now() + IDLE_AFTER_TOUCH;
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
    this.idleUntil = performance.now() + IDLE_AFTER_TOUCH;
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
      this.idleUntil = performance.now() + IDLE_AFTER_TOUCH;
      this.rig.panBy(...pan[e.key]);
    } else if (e.key === '+' || e.key === '=' || e.key === '-') {
      if (!this.settled) return;
      this.flight = null;
      this.intent = null;
      this.idleUntil = performance.now() + IDLE_AFTER_TOUCH;
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
    if (!this.compiled) return; // se vuelve a pedir fotograma al terminar de compilar
    const dt = this.lastFrame ? clamp((now - this.lastFrame) / 1000, 0, 0.05) : 1 / 60;
    const busyCamera = this.stepCamera(dt, now);
    const busyState = this.stepState(dt, now);
    this.own.ocean.uTime.value = (now / 1000) % 3600;
    // De lejos no se ven olas: el oleaje entra poco a poco al acercarse y, mientras no lo hay, el mar
    // se dibuja con el sombreador liso, que cuesta mucho menos por fotograma y no hay que animar.
    const swell = this.showGlint ? clamp((SWELL_FROM - this.rig.worldPerPixel) / (SWELL_FROM - SWELL_FULL), 0, 1) : 0;
    this.own.ocean.uSwell.value = swell;
    this.wavy = swell > 0 || this.showCurrents;
    // Las vetas de las corrientes, de unos 30 píxeles de pantalla sea cual sea el zoom.
    this.own.ocean.uStreak.value = clamp((0.035 * this.renderer.getPixelRatio()) / this.rig.worldPerPixel, 14, 160);
    if (this.seaFull) this.sea.material = this.wavy ? this.seaFull : this.seaLite;
    // Al acercarse, un píxel de la textura de relieve normal ocupa más de uno de pantalla: se pide
    // la de detalle (700 KB), una sola vez y solo si la tarjeta gráfica admite ese tamaño.
    if (this.showRelief && this.reliefReady && !this.reliefHd && this.rig.worldPerPixel < 0.0012 && this.renderer.capabilities.maxTextureSize >= 8192) {
      this.reliefHd = true;
      this.loadRelief('/data/relief-hd.webp');
    }
    if (this.showPhoto || this.nightTarget > 0) {
      const view = `${this.rig.lon.toFixed(5)},${this.rig.lat.toFixed(5)},${this.rig.h.toFixed(5)},${this.rig.morph.toFixed(3)},${this.rig.width},${this.rig.height}`;
      if (view !== this.patchView) {
        this.patchView = view;
        clearTimeout(this.patchTimer);
        this.patchTimer = window.setTimeout(() => this.requestPatch(), 120);
      }
    }
    this.render();
    if (busyCamera || busyState) {
      this.raf = requestAnimationFrame(this.tick);
      this.lastFrame = now;
    } else if ((this.wavy || this.planetView === 'interior' || this.twinkling) && !this.reducedMotion && !this.weak && !this.seaTimer) {
      // Con el mapa quieto, el agua se sigue moviendo a unos 10 fotogramas por segundo: basta para
      // un vaivén lento y gasta mucho menos que dibujar a 60. En una pestaña oculta el navegador
      // no atiende el requestAnimationFrame y esto se para solo.
      this.seaTimer = window.setTimeout(() => {
        this.seaTimer = 0;
        this.invalidate();
      }, 100);
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
      rig.h = Math.min(h * (1 + f.hop * Math.sin(Math.PI * e)), Math.max(h, rig.fitHeight()));
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
      if (now > this.idleUntil) rig.lon = wrapLon(rig.lon + 0.022 * dt);
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

  /** Las estrellas están a la vista (globo, tema de noche): parpadean, así que hay que seguir dibujando. */
  private get twinkling() {
    return this.showStars && this.palette.stars > 0 && this.rig.morph > 0.7;
  }

  /** Qué se está viendo del planeta sobre el globo, si algo. */
  get planet() {
    return this.planetView;
  }

  /** El lienzo recién dibujado, para copiarlo a una imagen: hay que usarlo en esta misma tarea. */
  snapshot(): HTMLCanvasElement {
    this.render();
    return this.canvas;
  }

  private render() {
    const rig = this.rig;
    rig.apply();
    const morph = rig.morph;
    const dpr = this.renderer.getPixelRatio();
    this.uniforms.uMorph.value = morph;
    this.uniforms.uViewport.value.set(rig.width * dpr, rig.height * dpr);
    this.own.stars.uDpr.value = dpr;
    this.own.line.uWidth.value = LINE_WIDTH * dpr;
    this.own.river.uWidth.value = 1.4 * dpr;
    this.own.plate.uWidth.value = 2 * dpr;
    this.own.guide.uWidth.value = 1.6 * dpr;
    this.own.graticule.uWidth.value = dpr;
    this.own.line.uEmphWidth.value = LINE_WIDTH_EMPH * dpr;
    this.own.line.uCasing.value = this.photoOutline ? LINE_CASING * dpr : 0;
    this.own.marker.uPxPerRad.value = 1 / rig.worldPerPixel;
    this.own.marker.uMarkerPx.value = MARKER_DIAMETER * dpr;

    // El halo solo tiene sentido con el globo formado; la sombra y el marco, con la hoja plana.
    const d = rig.camera.position.length();
    const silhouette = d / Math.sqrt(Math.max(d * d - 1, 1e-3));
    this.own.halo.uSilhouette.value = silhouette;
    // La atmósfera se ilumina según de dónde venga el Sol respecto a quien mira (solo en tiempo
    // real y de noche: en el tema claro el halo es la sombra del globo sobre el papel).
    this.own.halo.uSunView.value.copy(this.uniforms.uSun.value).transformDirection(this.rig.camera.matrixWorldInverse);
    this.own.halo.uSunLit.value = this.uniforms.uNight.value * (this.palette.stars > 0 ? 1 : 0) * (morph > 0.999 ? 1 : 0);
    this.own.halo.uExtent.value = silhouette * 1.9;
    const formed = smoothstep(0.88, 1, morph);
    this.own.halo.uAlpha.value = this.palette.haloAlpha * formed;
    this.own.halo.uOutlineAlpha.value = this.palette.outlineAlpha * formed;
    this.halo.visible = formed > 0.003;
    const whole = morph > 0.999;
    this.uniforms.uCut.value = this.planetView === 'interior' && whole ? 1 : 0;
    this.own.halo.uShells.value = this.planetView === 'atmosphere' && whole ? 1 : 0;
    if (this.cutFaces) this.cutFaces.visible = this.planetView === 'interior' && whole;
    if (this.core) this.core.visible = this.planetView === 'interior' && whole;
    this.own.shadow.uAlpha.value = this.palette.sheetShadowAlpha * (1 - smoothstep(0, 0.4, morph));
    this.sheetShadow.visible = this.own.shadow.uAlpha.value > 0.003;
    this.own.frame.uAlpha.value = 0.9 * (1 - smoothstep(0, 0.5, morph));
    this.frameLine.visible = this.own.frame.uAlpha.value > 0.003;

    this.renderer.render(this.scene, rig.camera);

    for (const item of this.tracked) this.place(item);
    // Con el planeta abierto, nada se rotula sobre el gajo quitado.
    const cut = this.uniforms.uCutLon.value;
    const skip =
      this.planetView === 'interior' && rig.morph > 0.999
        ? (lon: number, lat: number) => lat > -0.02 && Math.atan2(Math.sin(lon), Math.cos(lon)) > cut.x - 0.02 && Math.atan2(Math.sin(lon), Math.cos(lon)) < cut.y + 0.02
        : undefined;
    for (const overlay of this.overlays.values()) overlay.labels?.place(rig, ALT.marker, skip);
    this.guideLabels?.place(rig, ALT.marker, skip);
    this.graticuleLabels?.place(rig, ALT.marker, skip);
    this.zoneLabels?.place(rig, ALT.marker, skip);
    this.emit('view', {
      lon: rig.lon / DEG,
      lat: rig.lat / DEG,
      zoom: clamp(1 - Math.log(rig.h / 0.09) / Math.log(rig.maxHeight() / 0.09), 0, 1),
      morph,
      kmPerPixel: rig.worldPerPixel * 6371,
      heightKm: rig.h * 6371,
    });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (width === this.rig.width && height === this.rig.height) return;
    this.rig.width = width;
    this.rig.height = height;
    // Con otro tamaño de ventana el dibujo de los astros puede medir distinto: se vuelve a medir.
    for (const item of this.tracked) item.sky = undefined;
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
    clearTimeout(this.seaTimer);
    clearTimeout(this.patchTimer);
    for (const overlay of this.overlays.values()) {
      overlay.labels?.dispose();
      overlay.mesh?.geometry.dispose();
    }
    this.guideLabels?.dispose();
    this.graticuleLabels?.dispose();
    this.zoneLabels?.dispose();
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.tracked.clear();
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
  }
}
