import { Matrix4, PerspectiveCamera, Vector3 } from 'three';
import type { Bounds } from '../atlas/types';
import {
  DEG,
  FLAT_HALF_HEIGHT,
  FLAT_HALF_WIDTH,
  naturalEarth,
  naturalEarthInverse,
  newSample,
  surface,
  wrapLon,
  type Vec2,
} from './projection';

/** Zonas del lienzo tapadas por la interfaz, en píxeles: la cámara encuadra en el hueco que queda. */
export interface Padding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Punto que mira la cámara (radianes) y altura sobre la superficie (en radios del globo). */
export interface Pose {
  lon: number;
  lat: number;
  h: number;
}

export interface GeoPoint {
  lon: number;
  lat: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
  /** false si el punto queda en la cara oculta del globo. */
  visible: boolean;
  /** Solo en projectFar: el astro está delante de la cámara (aunque lo tape la Tierra). */
  ahead?: boolean;
}

const FOV = 28;
const TAN_HALF = Math.tan((FOV / 2) * DEG);
export const MIN_HEIGHT = 0.09;
const MAX_LAT = 84 * DEG;
/** Fracción del hueco disponible que ocupa lo encuadrado. */
const FIT = 0.84;
/** Cuánto más lejos que la vista general puede irse la cámara del globo (en distancia al centro). */
const GLOBE_FAR = 1.25;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Cámara del mapa. No orbita alrededor de un centro fijo: se coloca siempre sobre el punto enfocado,
 * a una altura `h` y mirando hacia la superficie a lo largo de su normal. Con esa única regla sirve
 * igual para el globo (órbita), el mapa plano (desplazamiento) y cualquier punto intermedio.
 */
export class CameraRig {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.01, 50);
  lon = 0;
  lat = 0;
  h = 4;
  /** 1 = globo, 0 = mapa plano. */
  morph = 1;
  width = 1;
  height = 1;
  pad: Padding = { left: 0, right: 0, top: 0, bottom: 0 };
  /**
   * Hasta dónde se puede acercar la cámara. En el mapa de un país pequeño (Suiza) baja: con la del
   * mundo, el país entero no llenaría la pantalla y sus cantones no se distinguirían. Lo fija el motor.
   */
  minHeight = MIN_HEIGHT;
  /**
   * Radio (desde el centro) de lo más lejano que tiene que caber al alejarse del globo: con la capa
   * de satélites, sus órbitas. 0 = solo el globo. Lo fija el motor.
   */
  reach = 0;

  private readonly sample = newSample();
  private readonly basis = new Matrix4();
  private readonly vx = new Vector3();
  private readonly vy = new Vector3();
  private readonly vz = new Vector3();
  private readonly tmp = new Vector3();
  private readonly flat: Vec2 = [0, 0];
  private readonly geo: Vec2 = [0, 0];

  /** Pendiente del semiángulo útil en horizontal y vertical (descontando la interfaz). */
  private get kx() {
    return (TAN_HALF * Math.max(120, this.width - this.pad.left - this.pad.right)) / this.height;
  }

  private get ky() {
    return (TAN_HALF * Math.max(120, this.height - this.pad.top - this.pad.bottom)) / this.height;
  }

  /** Altura desde la que el globo entero cabe en el hueco disponible. */
  globeMaxHeight(): number {
    return this.fitDistance(1) - 1;
  }

  /** Distancia al centro desde la que cabe en el hueco disponible una esfera de radio `r`. */
  private fitDistance(r: number): number {
    const k = Math.min(this.kx, this.ky) * FIT;
    return r * Math.sqrt(1 + 1 / (k * k));
  }

  /** Altura desde la que cabe el mapa plano entero. */
  flatMaxHeight(): number {
    return Math.max(FLAT_HALF_HEIGHT / (this.ky * 0.9), FLAT_HALF_WIDTH / (this.kx * 0.94));
  }

  /** Altura de la vista general: desde donde cabe entero el globo o el mapa plano. */
  fitHeight(morph = this.morph): number {
    const flat = this.flatMaxHeight();
    return flat + (this.globeMaxHeight() - flat) * morph;
  }

  /**
   * Lo más lejos que se puede ir. El mapa plano, hasta verlo entero; el globo, un poco más allá
   * (se ve un cuarto más pequeño que en la vista general), para verlo suelto en el cielo; y con
   * `reach`, hasta que quepa entero lo que está a esa distancia.
   */
  maxHeight(morph = this.morph): number {
    const flat = this.flatMaxHeight();
    const globe = Math.max(this.fitDistance(1) * GLOBE_FAR, this.fitDistance(this.reach)) - 1;
    return flat + (globe - flat) * morph;
  }

  /** Unidades de mundo (radios) que ocupa un píxel CSS sobre la superficie enfocada. */
  get worldPerPixel(): number {
    return (2 * this.h * TAN_HALF) / this.height;
  }

  /**
   * Altura equivalente al cambiar de vista. De cerca conserva la escala (lo que veías sigue igual
   * de grande); de lejos, "ver el globo entero" se convierte en "ver el mapa entero".
   */
  convertHeight(h: number, toFlat: boolean): number {
    const globe = this.globeMaxHeight();
    const ratio = Math.max(1, this.flatMaxHeight() / globe);
    const toFlatHeight = (hg: number) => hg * (1 + (ratio - 1) * smoothstep(0.3, 0.9, hg / globe));
    if (toFlat) return toFlatHeight(Math.min(h, globe));
    let lo = this.minHeight * 0.5;
    let hi = globe;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2;
      if (toFlatHeight(mid) < h) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /** Mantiene la pose dentro de límites: latitud, zoom y, en plano, que el mapa no se salga de la vista. */
  clampPose(pose: Pose = this, morph = this.morph): Pose {
    pose.h = clamp(pose.h, this.minHeight, this.maxHeight(morph));
    if (morph > 0.5) {
      pose.lon = wrapLon(pose.lon);
      pose.lat = clamp(pose.lat, -MAX_LAT, MAX_LAT);
    } else {
      const f = naturalEarth(clamp(pose.lon, -Math.PI, Math.PI), pose.lat, this.flat);
      // El foco puede moverse hasta que el borde de la hoja casi alcanza el borde de la vista;
      // si la hoja entera cabe, se queda centrada.
      const limitX = Math.max(0, FLAT_HALF_WIDTH - pose.h * this.kx * 0.9);
      const limitY = Math.max(0, FLAT_HALF_HEIGHT - pose.h * this.ky * 0.9);
      naturalEarthInverse(clamp(f[0], -limitX, limitX), clamp(f[1], -limitY, limitY), this.geo);
      pose.lon = this.geo[0];
      pose.lat = this.geo[1];
    }
    return pose;
  }

  /** Aplica el estado actual a la cámara de three.js. */
  apply() {
    const s = surface(this.lon, this.lat, this.morph, 0, this.sample);
    const cam = this.camera;
    cam.position.set(s.px + s.nx * this.h, s.py + s.ny * this.h, s.pz + s.nz * this.h);
    // Ejes de la cámara: Z = normal (hacia la cámara), Y = norte del mapa, X = Y × Z.
    this.vy.set(s.tx, s.ty, s.tz);
    this.vz.set(s.nx, s.ny, s.nz);
    this.vx.crossVectors(this.vy, this.vz);
    cam.quaternion.setFromRotationMatrix(this.basis.makeBasis(this.vx, this.vy, this.vz));

    cam.aspect = this.width / this.height;
    cam.near = Math.max(0.004, this.h * 0.5 - 0.03);
    cam.far = this.h + 14;
    cam.updateProjectionMatrix();
    // Desplaza el punto principal para que lo enfocado quede centrado en el hueco libre de interfaz.
    const e = cam.projectionMatrix.elements;
    e[8] = -(this.pad.left - this.pad.right) / this.width;
    e[9] = (this.pad.top - this.pad.bottom) / this.height;
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
    cam.updateMatrixWorld(true);
  }

  /** Arrastre de (dx, dy) píxeles: el mapa sigue al cursor. */
  panBy(dx: number, dy: number) {
    const wpp = this.worldPerPixel;
    if (this.morph > 0.5) {
      this.lon = wrapLon(this.lon - (dx * wpp) / Math.max(0.3, Math.cos(this.lat)));
      this.lat = clamp(this.lat + dy * wpp, -MAX_LAT, MAX_LAT);
    } else {
      const f = naturalEarth(this.lon, this.lat, this.flat);
      naturalEarthInverse(f[0] - dx * wpp, f[1] + dy * wpp, this.geo);
      this.lon = this.geo[0];
      this.lat = this.geo[1];
      this.clampPose();
    }
  }

  /** Multiplica la altura por `factor` manteniendo fijo, si se indica, el punto bajo (x, y). */
  zoomBy(factor: number, x?: number, y?: number) {
    const anchor = x !== undefined && y !== undefined ? this.screenToGeo(x, y) : null;
    this.h = clamp(this.h * factor, this.minHeight, this.maxHeight());
    if (anchor && x !== undefined && y !== undefined) {
      // Tras cambiar la altura, se corrige el foco hasta que el ancla vuelve a quedar bajo el cursor.
      for (let i = 0; i < 2; i++) {
        this.apply();
        const now = this.screenToGeo(x, y);
        if (!now) break;
        if (this.morph > 0.5) {
          this.lon = wrapLon(this.lon + wrapLon(anchor.lon - now.lon));
          this.lat = clamp(this.lat + anchor.lat - now.lat, -MAX_LAT, MAX_LAT);
        } else {
          const a = naturalEarth(anchor.lon, anchor.lat, [0, 0]);
          const b = naturalEarth(now.lon, now.lat, [0, 0]);
          const f = naturalEarth(this.lon, this.lat, this.flat);
          naturalEarthInverse(f[0] + a[0] - b[0], f[1] + a[1] - b[1], this.geo);
          this.lon = this.geo[0];
          this.lat = this.geo[1];
        }
      }
    }
    this.clampPose();
  }

  /** Rayo que sale de la cámara por el píxel (x, y): origen y dirección unitaria. */
  screenRay(x: number, y: number): { o: Vector3; d: Vector3 } {
    const o = this.camera.position;
    const d = new Vector3((2 * x) / this.width - 1, 1 - (2 * y) / this.height, 0.5).unproject(this.camera).sub(o).normalize();
    return { o, d };
  }

  /**
   * Punto del mapa bajo el píxel (x, y), o null si no hay mapa ahí.
   * Solo está definido con la vista asentada (globo o plano), no durante la transición.
   */
  screenToGeo(x: number, y: number): GeoPoint | null {
    const cam = this.camera;
    const o = cam.position;
    const d = this.tmp
      .set((2 * x) / this.width - 1, 1 - (2 * y) / this.height, 0.5)
      .unproject(cam)
      .sub(o)
      .normalize();
    if (this.morph > 0.999) {
      // rayo–esfera unidad
      const b = o.dot(d);
      const disc = b * b - (o.lengthSq() - 1);
      if (disc < 0) return null;
      const t = -b - Math.sqrt(disc);
      if (t < 0) return null;
      const px = o.x + d.x * t;
      const py = o.y + d.y * t;
      const pz = o.z + d.z * t;
      return { lon: Math.atan2(px, pz), lat: Math.asin(clamp(py, -1, 1)) };
    }
    if (this.morph < 0.001) {
      // rayo–plano z = 1
      if (Math.abs(d.z) < 1e-9) return null;
      const t = (1 - o.z) / d.z;
      if (t < 0) return null;
      if (!naturalEarthInverse(o.x + d.x * t, o.y + d.y * t, this.geo)) return null;
      return { lon: this.geo[0], lat: this.geo[1] };
    }
    return null;
  }

  /**
   * Posición en pantalla (píxeles CSS) de un punto del mapa. Con `floating`, el punto está separado
   * del globo (el Sol, la Luna): se ve aunque quede detrás, salvo que la Tierra lo tape.
   */
  project(lon: number, lat: number, alt: number, out: ScreenPoint, floating = false): ScreenPoint {
    const s = surface(lon, lat, this.morph, alt, this.sample);
    const cam = this.camera;
    const facing =
      s.nx * (cam.position.x - s.px) + s.ny * (cam.position.y - s.py) + s.nz * (cam.position.z - s.pz);
    const v = this.tmp.set(s.px, s.py, s.pz).project(cam);
    out.x = ((v.x + 1) / 2) * this.width;
    out.y = ((1 - v.y) / 2) * this.height;
    out.visible = facing > 0 && v.z < 1;
    if (floating && this.morph > 0.5 && !out.visible && v.z < 1) {
      // ¿La recta de la cámara al punto atraviesa la esfera (radio 1, centrada en el origen)?
      const c = cam.position;
      const dx = s.px - c.x;
      const dy = s.py - c.y;
      const dz = s.pz - c.z;
      const t = clamp(-(c.x * dx + c.y * dy + c.z * dz) / (dx * dx + dy * dy + dz * dz), 0, 1);
      out.visible = Math.hypot(c.x + dx * t, c.y + dy * t, c.z + dz * t) > 1;
    }
    return out;
  }

  /**
   * Posición en pantalla de un astro: un punto en la dirección (lon, lat) a `distance` radios del
   * centro de la Tierra, mucho más allá de lo que alcanza el plano lejano de la cámara. Queda oculto
   * si cae detrás de la cámara o si la Tierra lo tapa.
   */
  projectFar(lon: number, lat: number, distance: number, out: ScreenPoint): ScreenPoint {
    const cam = this.camera;
    // A estas distancias un fotograma de retraso en la cámara son cientos de píxeles: se pone al día.
    cam.updateMatrixWorld();
    const c = cam.position;
    const p = this.tmp.set(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)).multiplyScalar(distance);
    const [dx, dy, dz] = [p.x - c.x, p.y - c.y, p.z - c.z];
    // ¿La recta de la cámara al astro atraviesa la esfera (radio 1, centrada en el origen)?
    const t = clamp(-(c.x * dx + c.y * dy + c.z * dz) / (dx * dx + dy * dy + dz * dz), 0, 1);
    const clear = Math.hypot(c.x + dx * t, c.y + dy * t, c.z + dz * t) > 1;
    const v = p.applyMatrix4(cam.matrixWorldInverse);
    const ahead = v.z < 0;
    const m = cam.projectionMatrix.elements;
    // La proyección está descentrada (el globo se aparta de los paneles): cuentan también m[8] y m[9].
    out.x = ((m[0] * v.x + m[8] * v.z) / -v.z + 1) * 0.5 * this.width;
    out.y = (1 - (m[5] * v.y + m[9] * v.z) / -v.z) * 0.5 * this.height;
    out.visible = ahead && clear;
    out.ahead = ahead;
    return out;
  }

  /** El disco de la Tierra en pantalla (centro y radio en píxeles CSS), con el globo formado. */
  earthDisc(): { x: number; y: number; r: number } {
    const cam = this.camera;
    cam.updateMatrixWorld();
    const c = cam.position;
    const d = c.length();
    const alpha = Math.asin(Math.min(1, 1 / d));
    // Un punto del contorno: desde la cámara, la dirección al centro girada el ángulo del borde.
    const e = cam.matrixWorld.elements;
    const side = new Vector3(e[0], e[1], e[2]);
    const toCentre = c.clone().multiplyScalar(-1 / d);
    side.addScaledVector(toCentre, -side.dot(toCentre)).normalize();
    const reach = d * Math.cos(alpha);
    const limb = c.clone().addScaledVector(toCentre, Math.cos(alpha) * reach).addScaledVector(side, Math.sin(alpha) * reach).project(cam);
    const centre = new Vector3(0, 0, 0).project(cam);
    const [x, y] = [((centre.x + 1) / 2) * this.width, ((1 - centre.y) / 2) * this.height];
    return { x, y, r: Math.hypot(((limb.x + 1) / 2) * this.width - x, ((1 - limb.y) / 2) * this.height - y) };
  }

  /** Pose que encuadra un rectángulo geográfico en la vista indicada (1 = globo, 0 = plano). */
  fit(bounds: Bounds, morph: number, minSpanDeg = 0): Pose {
    const [w, s, e, n] = bounds;
    let lon = ((w + e) / 2) * DEG;
    let lat = ((s + n) / 2) * DEG;
    let h: number;
    if (morph > 0.5) {
      const halfLat = (Math.max(n - s, minSpanDeg) / 2) * DEG;
      const halfLon = (Math.max((e - w) * Math.cos(lat), minSpanDeg) / 2) * DEG;
      // Un punto a un ángulo α del foco se ve a tan = sen α / (h + 1 − cos α) del eje de la cámara.
      const need = (alpha: number, k: number) => {
        const a = Math.min(alpha, 80 * DEG);
        return Math.sin(a) / (k * FIT) - (1 - Math.cos(a));
      };
      h = Math.max(need(halfLon, this.kx), need(halfLat, this.ky));
    } else {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i <= 2; i++) {
        for (let j = 0; j <= 2; j++) {
          const f = naturalEarth((w + ((e - w) * i) / 2) * DEG, (s + ((n - s) * j) / 2) * DEG, this.flat);
          minX = Math.min(minX, f[0]);
          maxX = Math.max(maxX, f[0]);
          minY = Math.min(minY, f[1]);
          maxY = Math.max(maxY, f[1]);
        }
      }
      const min = (minSpanDeg / 2) * DEG;
      h = Math.max(Math.max((maxX - minX) / 2, min) / (this.kx * FIT), Math.max((maxY - minY) / 2, min) / (this.ky * FIT));
      naturalEarthInverse((minX + maxX) / 2, (minY + maxY) / 2, this.geo);
      lon = this.geo[0];
      lat = this.geo[1];
    }
    return this.clampPose({ lon, lat, h }, morph);
  }
}
