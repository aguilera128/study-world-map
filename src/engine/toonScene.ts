import {
  AmbientLight,
  BackSide,
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CylinderGeometry,
  DataTexture,
  DirectionalLight,
  Group,
  LatheGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  RepeatWrapping,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Camera,
  type Material,
  type Object3D,
  type Texture,
} from 'three';

// Huevo de pascua: lo que rodea al planeta de dibujos, todo en la misma escena que el mapa para que
// cada cosa tape a la otra según lo lejos que esté de verdad:
//
//   · La nave, que da vueltas a la Tierra. Es un modelo en tres dimensiones hecho aquí con piezas
//     sencillas, no un dibujo plano: tiene volumen, cambia de cara al girar, crece al acercarse y la
//     Tierra la tapa cuando pasa por detrás. Reproduce la nave de la ilustración del mapa plano
//     (public/toon/nave.webp): un platillo de chapa gris remachada, con óxido y un parche cosido, dos
//     faros distintos, luces amarillas por debajo, un tubo de escape acodado que echa humo, una
//     antena en zigzag con su luz roja y, bajo una cúpula grande de cristal, sus dos tripulantes.
//   · Las nubes, pegadas al globo.
//   · Los planetas y el remolino verde, que flotan lejos, por detrás de la Tierra y de la órbita de
//     la nave: nunca le pasan por delante.
//
// El aspecto de dibujos animados de la nave sale de tres cosas: la luz va a saltos (tres tonos, sin
// degradados), cada pieza lleva un contorno negro (la misma pieza, un poco mayor, pintada por dentro)
// y la chapa lleva pintadas a tinta sus juntas, remaches y manchas. Las nubes y los astros son
// carteles con su ilustración, que miran siempre a la cámara.
//
// Son diseños propios: ni la nave ni los tripulantes son de ninguna serie.
//
// Las medidas van en radios terrestres (el globo mide 1). La nave mira hacia +X, su techo hacia +Y y
// su costado bueno (el del parche y el segundo faro) hacia +Z, que es el que enseña al pasar por delante.

const INK = 0x12091c;
const INK_CSS = '#12091c';
/** Tamaño de la nave: con 1 mediría 0,7 radios de proa a popa. */
const SHIP_SCALE = 0.47;
const ORBIT_RADIUS = 1.4; // del centro de la Tierra
const ORBIT_SECONDS = 26;
/** Cuánto baja la órbita por delante del globo (y sube por detrás), en radianes: pasa bajo el centro, sin tapar media Tierra. */
const ORBIT_DIP = 0.26;
const BANK = 0.22; // cuánto se inclina hacia dentro en la curva

/** Las nubes: dónde va cada una (longitud y latitud, en grados) y cuánto mide de ancho. */
const CLOUDS: [lon: number, lat: number, width: number][] = [
  [-32, 38, 0.29],
  [18, -8, 0.23],
  [72, 24, 0.31],
  [118, -26, 0.25],
  [-98, 12, 0.27],
  [-150, 42, 0.22],
  [162, 6, 0.27],
  [-58, -32, 0.24],
  [42, 56, 0.21],
  [-122, -46, 0.26],
  [100, 52, 0.23],
  [-8, 14, 0.2],
];
const CLOUD_ALTITUDE = 1.05;

/**
 * Los astros: qué ilustración llevan, dónde flotan (longitud, latitud y distancia al centro de la
 * Tierra) y cuánto miden de ancho. Están fijos respecto a la Tierra: al girarla asoman por un lado,
 * pasan por detrás y salen por el otro. El remolino es el que queda más al fondo.
 */
export type ToonArt = 'cloud' | 'ring' | 'portal' | 'green' | 'red';
const BODIES: { art: Exclude<ToonArt, 'cloud'>; lon: number; lat: number; distance: number; width: number }[] = [
  { art: 'portal', lon: -150, lat: -10, distance: 4.2, width: 1.35 },
  { art: 'ring', lon: -60, lat: 16, distance: 3.4, width: 1.3 },
  { art: 'green', lon: 140, lat: 22, distance: 3.2, width: 0.6 },
  { art: 'red', lon: 60, lat: -18, distance: 3, width: 0.55 },
  { art: 'green', lon: -10, lat: -26, distance: 3.3, width: 0.45 },
  { art: 'red', lon: -105, lat: 28, distance: 3.6, width: 0.42 },
  { art: 'ring', lon: 100, lat: -6, distance: 3.9, width: 1 },
  { art: 'red', lon: 175, lat: -28, distance: 3.1, width: 0.5 },
  { art: 'green', lon: -35, lat: 32, distance: 3.7, width: 0.4 },
  { art: 'red', lon: 20, lat: 18, distance: 3.4, width: 0.4 },
  { art: 'ring', lon: -170, lat: 30, distance: 3.6, width: 0.8 },
  { art: 'green', lon: 75, lat: 36, distance: 3.8, width: 0.5 },
  { art: 'red', lon: -75, lat: -30, distance: 3.5, width: 0.45 },
  { art: 'green', lon: -130, lat: 8, distance: 3, width: 0.38 },
];
/**
 * Un astro solo se ve cuando queda así de lejos por detrás del centro de la Tierra, en radios: más
 * allá de la órbita de la nave (1,4), para que nunca la tape. Entre los dos números aparece poco a poco.
 */
const BODY_BEHIND: [from: number, full: number] = [1.7, 2.1];
/** Alto entre ancho de cada ilustración (public/toon/*.webp). */
const ASPECT: Record<ToonArt, number> = { cloud: 107 / 260, ring: 344 / 520, portal: 633 / 620, green: 323 / 320, red: 362 / 360 };

// Orden de pintado de lo que es transparente, entre las capas del mapa (MapEngine): los astros, antes
// que el resplandor y el contorno negro del globo (3), que así los tapan; las nubes de este lado,
// después de las fronteras (5); la cúpula de la nave, lo último.
const ORDER = { body: 2.5, cloud: 7, dome: 8, domeBehind: 6.5 };

export interface ToonScene {
  object: Group;
  /** Coloca la nave donde le toca a esa hora (en segundos), en una órbita que rodea el globo tal como lo ve la cámara. */
  update(seconds: number, camera: Camera): void;
  dispose(): void;
}

/** El mismo paso de longitud y latitud a un punto del globo que usa el mapa. */
const onGlobe = (lon: number, lat: number, distance: number) => {
  const [x, y] = [(lon * Math.PI) / 180, (lat * Math.PI) / 180];
  return new Vector3(Math.cos(y) * Math.sin(x), Math.sin(y), Math.cos(y) * Math.cos(x)).multiplyScalar(distance);
};
const smooth = (x: number, from: number, to: number) => {
  const t = Math.min(1, Math.max(0, (x - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

/** Dónde caen las juntas de las chapas, en vueltas al casco (0,5 es el costado bueno; 0,75, la proa). */
const SEAMS = [0.035, 0.16, 0.295, 0.43, 0.565, 0.69, 0.82, 0.945];

/**
 * La chapa del casco, pintada a tinta: juntas, remaches, óxido y, en el lomo, un bollo y el parche cosido. De
 * izquierda a derecha da la vuelta al casco; «t» va del canto (0) hacia el centro (1).
 */
function plating(top: boolean): CanvasTexture {
  const [W, H] = [1024, 256];
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const y = (t: number) => (top ? 1 - t : t) * H;
  let seed = top ? 11 : 29;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const blob = (x: number, yy: number, rx: number, ry = rx) => {
    ctx.beginPath();
    ctx.ellipse(x, yy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  // chapas de dos grises, una sí y otra no
  SEAMS.forEach((u, i) => {
    ctx.fillStyle = (i % 2 ? ['#8f909a', '#686974'] : ['#878892', '#61626d'])[top ? 0 : 1];
    const next = SEAMS[i + 1] ?? 1 + SEAMS[0];
    ctx.fillRect(u * W, 0, (next - u) * W + 1, H);
    if (i === SEAMS.length - 1) ctx.fillRect(0, 0, SEAMS[0] * W + 1, H);
  });

  // óxido: manchas de borde irregular
  const rust = (u: number, t: number, size: number) => {
    for (let i = 0; i < 10; i++) {
      const main = i < 7;
      ctx.fillStyle = main ? '#9c5838' : '#74391f';
      const r = size * (main ? 0.35 + random() * 0.45 : 0.1 + random() * 0.1);
      blob(u * W + (random() - 0.5) * size * 1.6, y(t) + (random() - 0.5) * size, r, r * 0.9);
    }
  };
  const spots: [number, number, number][] = top
    ? [[0.47, 0.34, 26], [0.535, 0.27, 16], [0.6, 0.36, 22], [0.66, 0.1, 13], [0.33, 0.13, 16], [0.87, 0.28, 20], [0.1, 0.22, 18], [0.23, 0.36, 15], [0.77, 0.2, 11]]
    : [[0.52, 0.2, 18], [0.63, 0.5, 14], [0.3, 0.3, 16], [0.8, 0.4, 16], [0.12, 0.55, 14]];
  spots.forEach(([u, t, size]) => rust(u, t, size));

  // juntas entre chapas, y la del canto
  ctx.strokeStyle = INK_CSS;
  ctx.lineWidth = 4;
  for (const u of SEAMS) {
    ctx.beginPath();
    ctx.moveTo(u * W, 0);
    ctx.lineTo(u * W, H);
    ctx.stroke();
  }
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(0, y(0));
  ctx.lineTo(W, y(0));
  ctx.stroke();

  // remaches: a lo largo de cada junta y dando la vuelta al canto
  const rivet = (u: number, t: number) => {
    ctx.fillStyle = INK_CSS;
    blob(u * W, y(t), 5.5, 6.5);
    ctx.fillStyle = top ? '#b4b5be' : '#8b8c96';
    blob(u * W - 1, y(t) - 1.5, 2.6, 3);
  };
  for (const u of SEAMS) for (const t of [0.14, 0.28, 0.42, 0.58, 0.74]) rivet(u + 0.013, t);
  for (let i = 0; i < 32; i++) rivet((i + 0.5) / 32, 0.06);

  ctx.lineCap = 'round';
  if (top) {
    // un bollo: tres arañazos
    ctx.lineWidth = 3;
    for (const [u, t, du, dt] of [[0.625, 0.2, 0.012, 0.1], [0.64, 0.17, 0.01, 0.12], [0.652, 0.22, 0.006, 0.06]]) {
      ctx.beginPath();
      ctx.moveTo(u * W, y(t));
      ctx.lineTo((u + du) * W, y(t + dt));
      ctx.stroke();
    }
    // el parche: un trozo de chapa roja cosido con puntadas gordas
    const [x0, x1, y0, y1] = [0.372 * W, 0.422 * W, y(0.31), y(0.1)];
    ctx.fillStyle = '#8d4b3a';
    ctx.lineWidth = 4;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    const stitch = (x: number, yy: number) => {
      ctx.fillStyle = INK_CSS;
      blob(x, yy, 5.5, 6.5);
      ctx.fillStyle = '#e8e1d4';
      blob(x, yy, 3.6, 4.4);
    };
    for (let i = 0; i <= 4; i++) [y0, y1].forEach((yy) => stitch(x0 + ((x1 - x0) * i) / 4, yy));
    for (let i = 1; i < 4; i++) [x0, x1].forEach((x) => stitch(x, y0 + ((y1 - y0) * i) / 4));
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

export function createToonScene(art: Record<ToonArt, Texture>): ToonScene {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];
  const textures: Texture[] = [];
  const keep = <T extends BufferGeometry>(geometry: T): T => (geometries.push(geometry), geometry);

  // Tres tonos de luz y ninguno intermedio: sombra, medio tono y luz.
  const steps = new DataTexture(new Uint8Array([125, 200, 255]), 3, 1, RedFormat);
  steps.minFilter = steps.magFilter = NearestFilter;
  steps.needsUpdate = true;
  textures.push(steps);
  const made = new Map<string, Material>();
  const toon = (color: number): Material => {
    const key = `t${color}`;
    if (!made.has(key)) made.set(key, new MeshToonMaterial({ color, gradientMap: steps }));
    return made.get(key)!;
  };
  const flat = (color: number): Material => {
    const key = `f${color}`;
    if (!made.has(key)) made.set(key, new MeshBasicMaterial({ color }));
    return made.get(key)!;
  };
  const painted = (top: boolean): Material => {
    const map = plating(top);
    textures.push(map);
    const material = new MeshToonMaterial({ map, gradientMap: steps });
    materials.push(material);
    return material;
  };
  const ink = new MeshBasicMaterial({ color: INK, side: BackSide });
  materials.push(ink);

  const ship = new Group();
  ship.scale.setScalar(SHIP_SCALE);
  /** Una pieza con su contorno: la misma forma, algo mayor y vista por dentro, en negro. */
  const part = (geometry: BufferGeometry, material: Material, outline: number | [number, number, number] = 0.12, parent: Object3D = ship) => {
    const mesh = new Mesh(keep(geometry), material);
    if (outline) {
      const edge = new Mesh(geometry, ink);
      const [x, y, z] = typeof outline === 'number' ? [1 + outline, 1 + outline, 1 + outline] : outline;
      edge.scale.set(x, y, z);
      mesh.add(edge);
    }
    parent.add(mesh);
    return mesh;
  };
  const ball = (radius: number, material: Material, x: number, y: number, z: number, outline = 0.12, parent: Object3D = ship) => {
    const mesh = part(new SphereGeometry(radius, 20, 14), material, outline, parent);
    mesh.position.set(x, y, z);
    return mesh;
  };
  /** Una barra de un punto a otro (un tubo, un brazo, un tramo de antena). */
  const Y = new Vector3(0, 1, 0);
  const rod = (from: [number, number, number], to: [number, number, number], radius: number, material: Material, outline = 0.2, parent: Object3D = ship) => {
    const [a, b] = [new Vector3(...from), new Vector3(...to)];
    const mesh = part(new CylinderGeometry(radius, radius, a.distanceTo(b), 10), material, outline ? [1 + outline, 1.02, 1 + outline] : 0, parent);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(Y, b.sub(a).normalize());
    return mesh;
  };
  /** Un cuerpo de revolución: los puntos van de abajo arriba, (radio, altura). Empieza a dar la vuelta por el costado malo (−Z). */
  const turned = (points: [number, number][], segments = 48) =>
    new LatheGeometry(
      points.map(([r, y]) => new Vector2(r, y)),
      segments,
      Math.PI,
    );

  // ── El casco: una lenteja de chapa gris, de canto afilado. Por arriba es casi plana; por abajo, un
  // cuenco hondo y más oscuro, para que de costado se le vea la panza con su parche ──
  const LONG = 1.3;
  const hull = new Group();
  hull.scale.set(LONG, 1, 1);
  ship.add(hull);
  part(turned([[0.27, 0], [0.25, 0.018], [0.215, 0.034], [0.16, 0.052], [0.085, 0.064], [0, 0.068]]), painted(true), [1.03, 1.2, 1.03], hull);
  part(turned([[0.125, -0.088], [0.19, -0.078], [0.235, -0.058], [0.262, -0.03], [0.27, 0]]), painted(false), [1.03, 1.1, 1.03], hull);
  // la quilla: un cuenco más oscuro todavía, con sus luces
  part(turned([[0, -0.125], [0.08, -0.118], [0.115, -0.1], [0.128, -0.086]], 36), toon(0x4d4e59), [1.05, 1.08, 1.05], hull);
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) / 6) * Math.PI * 2;
    const light = part(new SphereGeometry(1, 14, 8), flat(0xffe98a), 0.16);
    light.scale.set(0.036, 0.012, 0.021);
    light.position.set(Math.sin(a) * 0.1 * LONG, -0.109, Math.cos(a) * 0.1);
    light.rotation.y = a;
  }

  // ── La cabina: un aro remachado, el suelo y, encima, la cúpula ──
  const FLOOR = 0.07;
  const cabin = new Group();
  cabin.position.x = -0.012;
  ship.add(cabin);
  part(turned([[0.196, 0.02], [0.196, 0.056], [0.188, 0.066], [0.172, FLOOR]], 44), toon(0x9c9da6), [1.03, 1.06, 1.03], cabin);
  part(new CylinderGeometry(0.174, 0.174, 0.004, 40), toon(0x4a4b55), 0, cabin).position.y = FLOOR - 0.003;
  const rivet = keep(new SphereGeometry(0.0065, 8, 6));
  for (let i = 0; i < 16; i++) {
    const a = ((i + 0.5) / 16) * Math.PI * 2;
    const dot = new Mesh(rivet, flat(0x2b2b36));
    dot.position.set(Math.sin(a) * 0.197, 0.053, Math.cos(a) * 0.197);
    cabin.add(dot);
  }
  // el salpicadero
  part(new BoxGeometry(0.036, 0.03, 0.15), toon(0x5a5b66), 0.1, cabin).position.set(0.132, FLOOR + 0.014, 0);

  // ── Dos faros, cada uno de su padre y de su madre ──
  const lamp = (position: [number, number, number], aim: [number, number, number], radius: number, housing: number, grille: boolean) => {
    const [x, y, z] = position;
    rod([x, y, z], [x - 0.012, y - radius - 0.02, z - 0.012], radius * 0.3, toon(0x55565f), 0.2);
    const group = new Group();
    group.position.set(x, y, z);
    group.quaternion.setFromUnitVectors(Y, new Vector3(...aim).normalize());
    ship.add(group);
    part(new CylinderGeometry(radius, radius * 0.78, radius * 1.5, 20), toon(housing), 0.13, group);
    const lens = part(new SphereGeometry(radius * 0.84, 18, 10), flat(0xfbe9a0), 0, group);
    lens.scale.set(1, 0.4, 1);
    lens.position.y = radius * 0.75;
    const rim = part(new TorusGeometry(radius * 0.94, radius * 0.12, 6, 22), toon(housing), 0, group);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = radius * 0.75;
    // la rejilla, o los nervios del cristal
    for (const turn of grille ? [0, Math.PI / 2] : [0]) {
      for (const shift of grille ? [-0.4, 0, 0.4] : [-0.3, 0.3]) {
        const bar = part(new BoxGeometry(radius * (grille ? 1.7 : 1.5), radius * 0.07, radius * 0.07), flat(grille ? INK : 0xc9a94e), 0, group);
        bar.position.set(turn ? shift * radius : 0, radius * 1.07, turn ? 0 : shift * radius);
        bar.rotation.y = turn;
      }
    }
  };
  lamp([0.272, 0.06, 0.085], [1, 0.14, 0.5], 0.05, 0x8c4a36, false);
  lamp([0.17, 0.05, 0.215], [0.5, 0.16, 1], 0.036, 0x74767f, true);

  // ── Tubo de escape acodado, oxidado, con su humo ──
  const pipe = toon(0x7b4a35);
  rod([-0.25, 0.028, -0.04], [-0.332, 0.046, -0.04], 0.022, pipe);
  rod([-0.332, 0.042, -0.04], [-0.344, 0.112, -0.04], 0.022, pipe);
  ball(0.0245, pipe, -0.332, 0.044, -0.04, 0.16);
  const mouth = part(new TorusGeometry(0.023, 0.006, 6, 18), toon(0x5e3323), 0.3);
  mouth.position.set(-0.344, 0.112, -0.04);
  mouth.rotation.x = Math.PI / 2;
  const puffs = [0, 1, 2].map((i) => ball(0.017 + i * 0.008, toon(0xe4e2e6), -0.354 - i * 0.036, 0.146 + i * 0.03, -0.04 + (i - 1) * 0.012, 0.16));

  // ── Antena con su muelle, en zigzag, y su luz roja ──
  const wire = flat(0x2b2b36);
  const [ax, az] = [-0.236, 0.06];
  part(new BoxGeometry(0.03, 0.03, 0.03), toon(0x8a4b3a), 0.16).position.set(ax, 0.052, az);
  rod([ax, 0.06, az], [ax, 0.115, az], 0.005, wire, 0);
  for (let i = 0; i < 3; i++) {
    const coil = part(new TorusGeometry(0.011, 0.004, 5, 14), wire, 0);
    coil.position.set(ax, 0.1 + i * 0.011, az);
    coil.rotation.x = Math.PI / 2;
  }
  const zigzag: [number, number, number][] = [
    [ax, 0.115, az],
    [ax - 0.018, 0.15, az],
    [ax + 0.012, 0.172, az],
    [ax - 0.012, 0.205, az],
    [ax - 0.004, 0.235, az],
  ];
  zigzag.slice(1).forEach((to, i) => rod(zigzag[i], to, 0.005, wire, 0));
  ball(0.02, flat(0xf04a3a), ax - 0.004, 0.25, az, 0.17);

  // ── Los dos tripulantes: en sus asientos, vueltos hacia el costado bueno ──
  const white = flat(0xffffff);
  const black = flat(INK);
  const eye = (parent: Object3D, radius: number, x: number, y: number, z: number) => {
    const globe = ball(radius, white, x, y, z, 0.15, parent);
    ball(radius * 0.42, black, radius * 0.72, 0, 0, 0, globe);
  };
  /** Un asiento con su ocupante: lo que se cuelgue de «who» mira hacia +X antes de girarlo. */
  const seat = (x: number, z: number, height: number) => {
    const who = new Group();
    who.position.set(x, FLOOR, z);
    who.rotation.y = -0.6;
    cabin.add(who);
    const back = part(new SphereGeometry(1, 16, 12), toon(0x7a4e33), 0, who);
    back.scale.set(0.017, height / 2, 0.047);
    back.position.set(-0.042, height / 2, 0);
    const edge = part(new SphereGeometry(1, 16, 12), ink, 0, who);
    edge.scale.set(0.021, height / 2 + 0.004, 0.051);
    edge.position.copy(back.position);
    return who;
  };

  // el piloto, delante: alto, lila, de tres ojos, con mono naranja y las manos al volante
  const orange = toon(0xf08a3c);
  const lilac = toon(0xb79df2);
  const front = seat(0.034, -0.022, 0.1);
  part(new CapsuleGeometry(0.03, 0.036, 6, 16), orange, 0.1, front).position.set(0, 0.046, 0);
  const lapel = part(new TorusGeometry(0.015, 0.0065, 6, 16), toon(0xd9742c), 0.3, front);
  lapel.position.set(0.002, 0.094, 0);
  lapel.rotation.x = Math.PI / 2;
  rod([0, 0.09, 0], [0.008, 0.132, 0], 0.011, lilac, 0.2, front);
  const pilot = ball(0.034, lilac, 0.016, 0.148, 0, 0.1, front);
  pilot.scale.set(1.3, 1.12, 1.25);
  eye(pilot, 0.013, 0.024, 0.024, -0.021);
  eye(pilot, 0.014, 0.029, 0.031, 0);
  eye(pilot, 0.013, 0.024, 0.024, 0.021);
  // la boca abierta, con sus dientes y su lengua
  const grin = ball(0.019, flat(0x5a1f3a), 0.027, -0.012, 0, 0, pilot);
  grin.scale.set(0.5, 0.56, 1.2);
  for (const z of [-0.006, 0.006]) part(new BoxGeometry(0.005, 0.007, 0.009), white, 0, pilot).position.set(0.035, -0.006, z);
  ball(0.009, flat(0xf2788a), 0.03, -0.019, 0, 0, pilot).scale.set(1, 0.6, 1.2);
  // lunares
  for (const [x, y, z] of [[-0.012, 0.004, 0.031], [-0.002, -0.012, 0.03], [-0.02, -0.01, 0.025]]) ball(0.0055, toon(0x9478dc), x, y, z, 0, pilot);
  for (const z of [-0.012, 0.012]) {
    // antenas
    rod([0, 0.03, z], [-0.008, 0.05, z * 2], 0.0035, lilac, 0, pilot);
    ball(0.0075, lilac, -0.008, 0.052, z * 2, 0.18, pilot);
    // brazos y manos, al volante
    const side = Math.sign(z);
    rod([0.004, 0.076, side * 0.031], [0.03, 0.05, side * 0.038], 0.0095, orange, 0.2, front);
    rod([0.03, 0.05, side * 0.038], [0.058, 0.064, side * 0.024], 0.0095, orange, 0.2, front);
    ball(0.0105, orange, 0.03, 0.05, side * 0.038, 0.16, front);
    ball(0.0115, lilac, 0.062, 0.066, side * 0.024, 0.16, front);
  }
  const wheel = part(new TorusGeometry(0.03, 0.0055, 8, 22), flat(0x24242c), 0, front);
  wheel.position.set(0.068, 0.064, 0);
  wheel.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), new Vector3(-1, 0.5, 0).normalize());
  rod([0.068, 0.064, 0], [0.092, 0.03, 0], 0.005, flat(0x24242c), 0, front);

  // el pequeño, detrás: redondo, turquesa, de un ojo y con la boca abierta de la emoción
  const teal = toon(0x3fbfae);
  const rear = seat(-0.078, 0.036, 0.085);
  const mate = ball(0.046, teal, 0, 0.05, 0, 0.09, rear);
  mate.scale.set(1, 0.95, 1);
  eye(mate, 0.02, 0.033, 0.019, 0);
  const gape = ball(0.02, flat(0x5a1f3a), 0.035, -0.014, 0, 0, mate);
  gape.scale.set(0.45, 0.55, 1.15);
  part(new BoxGeometry(0.005, 0.007, 0.01), white, 0, mate).position.set(0.043, -0.007, 0);
  ball(0.009, flat(0xf2788a), 0.038, -0.022, 0, 0, mate).scale.set(1, 0.6, 1.2);
  for (const [x, y, z] of [[0.004, 0.012, 0.043], [-0.012, -0.006, 0.042], [0.014, -0.02, 0.04]]) ball(0.006, toon(0x2f9d90), x, y, z, 0, mate);
  rod([0, 0.04, 0], [-0.006, 0.062, 0], 0.004, teal, 0, mate);
  ball(0.0085, teal, -0.006, 0.064, 0, 0.18, mate);
  for (const z of [-1, 1]) {
    // orejillas y puños levantados
    for (const [y, out] of [[0.02, 0.058], [-0.004, 0.062]]) {
      rod([-0.014, y, z * 0.036], [-0.026, y + 0.01, z * out], 0.006, teal, 0.2, mate);
      ball(0.0085, teal, -0.026, y + 0.01, z * out, 0.16, mate);
    }
    ball(0.013, teal, 0.03, -0.024, z * 0.034, 0.15, mate);
  }

  // ── La cúpula de cristal: grande, azulada, con el borde en negro y dos brillos, como dibujada ──
  const glass = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      float band(float x, float from, float to, float soft) {
        return smoothstep(from - soft, from + soft, x) * (1.0 - smoothstep(to - soft, to + soft, x));
      }
      void main() {
        vec3 n = normalize(vNormal);
        float facing = abs(dot(n, normalize(vView)));
        float edge = 1.0 - smoothstep(0.25, 0.3, facing);
        // dos brillos curvos en lo alto, siempre hacia el mismo lado de la pantalla
        float turn = atan(n.y, n.x);
        float spread = length(n.xy);
        float shine = max(band(turn, 1.95, 2.7, 0.03), band(turn, 0.5, 0.82, 0.03)) * band(spread, 0.7, 0.79, 0.012);
        vec3 color = mix(mix(vec3(0.66, 0.87, 0.94), vec3(1.0), shine), vec3(0.07, 0.035, 0.11), edge);
        gl_FragColor = vec4(color, mix(mix(0.1, 0.95, shine), 1.0, edge));
      }`,
  });
  // En el dibujo el cristal es un azul claro liso por detrás de los tripulantes, que conservan sus
  // colores. Aquí igual: la mitad de atrás de la cúpula va pintada de ese azul, y la de delante apenas tiñe.
  const backdrop = new MeshBasicMaterial({ color: 0xa9dcee, side: BackSide, transparent: true, opacity: 0.86, depthWrite: false });
  materials.push(glass, backdrop);
  // Algo más que media esfera: la corta el aro de la cabina por debajo de su ecuador.
  const DOME = 0.182;
  const bubble = keep(new SphereGeometry(DOME, 40, 26, 0, Math.PI * 2, 0, 1.829));
  const [domeBack, dome] = [new Mesh(bubble, backdrop), new Mesh(bubble, glass)];
  for (const half of [domeBack, dome]) {
    half.position.y = FLOOR - DOME * Math.cos(1.829);
    cabin.add(half);
  }

  // ── Luz: una principal, que acompaña a quien mira, y otra de relleno ──
  const sun = new DirectionalLight(0xffffff, 3);
  const fill = new AmbientLight(0xffffff, 0.9);
  const object = new Group();
  object.add(ship, sun, sun.target, fill);
  materials.push(...made.values());

  // ── Nubes y astros: carteles que miran siempre a la cámara ──
  const billboard = (which: ToonArt) => {
    art[which].colorSpace = SRGBColorSpace;
    const material = new SpriteMaterial({ map: art[which], transparent: true, depthWrite: false });
    materials.push(material);
    return material;
  };
  const puffy = billboard('cloud');
  const clouds = CLOUDS.map(([lon, lat, width], i) => {
    const sprite = new Sprite(puffy);
    object.add(sprite);
    return { sprite, home: onGlobe(lon, lat, CLOUD_ALTITUDE), width, flip: i % 2 ? -1 : 1 };
  });
  const bodies = BODIES.map(({ art: which, lon, lat, distance, width }) => {
    const material = billboard(which);
    const sprite = new Sprite(material);
    sprite.position.copy(onGlobe(lon, lat, distance));
    sprite.scale.set(width, width * ASPECT[which], 1);
    sprite.renderOrder = ORDER.body;
    object.add(sprite);
    return { sprite, material, turns: which === 'portal' };
  });

  // La órbita: un círculo alrededor de la Tierra tal como se ve en pantalla, de izquierda a derecha por
  // delante y de vuelta por detrás. Se mide respecto a la cámara para que pase siempre bien a la vista.
  const [right, above, toward, near, place, forward, up, side, eyeward, ray] = Array.from({ length: 10 }, () => new Vector3());
  const basis = new Matrix4();

  return {
    object,
    update(seconds, camera) {
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      above.setFromMatrixColumn(camera.matrixWorld, 1);
      toward.setFromMatrixColumn(camera.matrixWorld, 2);
      const far = camera.position.length();
      eyeward.copy(camera.position).divideScalar(far);
      // Con el mapa muy acercado la nave pasaría por delante de la cámara: se aparta.
      ship.visible = far > 1.9;
      // El lado de la órbita que da a la cámara, algo caído: por delante pasa bajo el centro del globo.
      near.copy(toward).multiplyScalar(Math.cos(ORBIT_DIP)).addScaledVector(above, -Math.sin(ORBIT_DIP));
      const angle = (seconds / ORBIT_SECONDS) * Math.PI * 2;
      const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
      place.copy(right).multiplyScalar(-cos).addScaledVector(near, sin);
      forward.copy(right).multiplyScalar(sin).addScaledVector(near, cos);
      // El techo mira a lo alto de la órbita y se vence hacia la Tierra en la curva, como una moto.
      up.crossVectors(near, right).multiplyScalar(Math.cos(BANK)).addScaledVector(place, -Math.sin(BANK)).normalize();
      side.crossVectors(forward, up).normalize();
      up.crossVectors(side, forward).normalize();
      basis.makeBasis(forward, up, side);
      ship.quaternion.setFromRotationMatrix(basis);
      ship.position.copy(place).multiplyScalar(ORBIT_RADIUS).addScaledVector(up, 0.012 * Math.sin(seconds * 2.6));
      // Por detrás del globo, la cúpula se pinta antes que las nubes: la nave está más lejos que ellas.
      dome.renderOrder = sin < 0 ? ORDER.domeBehind : ORDER.dome;
      domeBack.renderOrder = dome.renderOrder - 0.1;
      // el humo se hincha y se deshincha
      puffs.forEach((puff, i) => puff.scale.setScalar(0.8 + 0.3 * Math.sin(seconds * 5 - i * 1.3)));
      // La luz, desde arriba y a un lado de la cámara: la nave siempre tiene una cara iluminada hacia quien mira.
      sun.position.copy(camera.position).addScaledVector(above, 2.5).addScaledVector(right, -2);
      sun.target.position.copy(ship.position);

      // Las nubes. Un cartel es plano y mira a la cámara: en el borde del globo, su mitad de dentro
      // quedaría hundida en la Tierra. Así que las de este lado del horizonte se adelantan hacia la
      // cámara, por su misma línea de mirada (no cambian de sitio ni de tamaño en pantalla), lo justo
      // para librar el globo. Las del otro lado se quedan donde están, y la Tierra las tapa.
      for (const { sprite, home, width, flip } of clouds) {
        const ahead = home.dot(eyeward); // cuánto se adelanta al centro de la Tierra, hacia la cámara
        const front = smooth(ahead - 1 / far, -0.14, 0); // 1 = de este lado del horizonte
        const inner = Math.max(0, Math.sqrt(Math.max(0, CLOUD_ALTITUDE ** 2 - ahead ** 2)) - width / 2);
        const clear = Math.sqrt(1 - Math.min(1, inner * inner)) + 0.08; // lo que sobresale ahí el globo
        const pulled = ahead + Math.max(0, clear - ahead) * front;
        const k = Math.min(1, Math.max(0.3, (far - pulled) / (far - ahead)));
        sprite.position.copy(camera.position).addScaledVector(ray.copy(home).sub(camera.position), k);
        sprite.scale.set(flip * width * k, width * ASPECT.cloud * k, 1);
        // Las de este lado, después de las fronteras del mapa; las de detrás, antes que el contorno del globo.
        sprite.renderOrder = front > 0 ? ORDER.cloud : ORDER.body;
      }

      // Los astros solo se ven bien por detrás de la Tierra, más allá de la órbita de la nave.
      for (const { sprite, material, turns } of bodies) {
        const shown = smooth(-sprite.position.dot(eyeward), BODY_BEHIND[0], BODY_BEHIND[1]);
        sprite.visible = shown > 0;
        material.opacity = shown;
        if (turns) material.rotation = -seconds * 0.45; // el remolino gira despacio
      }
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
    },
  };
}
