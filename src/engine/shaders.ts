// Sombreadores del mapa. Todas las capas comparten la función `surface()`, que coloca un punto
// (longitud, latitud) sobre la superficie según `uMorph` (1 = globo, 0 = mapa plano). Es la misma
// fórmula que ./projection.ts: si cambias una, cambia la otra.
//
// El estado de cada país (color, elevación, énfasis del contorno…) no va en los vértices, sino en
// dos texturas de 1 píxel de alto con un téxel por país. Así, pintar o levantar un país es escribir
// 4 bytes, sin tocar la geometría.

const glsl = String.raw;

const SURFACE = glsl`
uniform float uMorph;
uniform sampler2D uState; // rgb = color del país, a = elevación (0–1)
uniform sampler2D uAux;   // r = énfasis del contorno, g = marcador activo
uniform float uCount;     // número de países (ancho de las texturas)
uniform float uLift;      // elevación máxima, en radios
uniform float uBaseAlt;   // altura de la capa sobre el océano

vec2 naturalEarth(vec2 ll) {
  float p2 = ll.y * ll.y;
  float p4 = p2 * p2;
  return vec2(
    ll.x * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4))),
    ll.y * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)))
  );
}

float sinc(float x) {
  return abs(x) < 1e-3 ? 1.0 - x * x / 6.0 : sin(x) / x;
}

vec3 surface(vec2 ll, float alt, out vec3 n) {
  vec2 uv = mix(naturalEarth(ll), ll, uMorph);
  float a = uv.x * uMorph;
  float b = uv.y * uMorph;
  float ca = cos(a);
  float sa = sin(a);
  float cb = cos(b);
  float sb = sin(b);
  float sha = sinc(0.5 * a);
  float shb = sinc(0.5 * b);
  n = vec3(cb * sa, sb, cb * ca);
  vec3 p = vec3(
    cb * uv.x * sinc(a),
    uv.y * sinc(b),
    1.0 - 0.5 * uMorph * (uv.y * uv.y * shb * shb + cb * uv.x * uv.x * sha * sha)
  );
  return p + alt * n;
}

vec4 stateOf(float country) {
  return texture2D(uState, vec2((country + 0.5) / uCount, 0.5));
}

vec4 auxOf(float country) {
  return texture2D(uAux, vec2((country + 0.5) / uCount, 0.5));
}

// Vector unitario del punto en la Tierra real (no depende de la vista): para el día y la noche.
vec3 geoVector(vec2 ll) {
  return vec3(cos(ll.y) * sin(ll.x), sin(ll.y), cos(ll.y) * cos(ll.x));
}
`;

// Sombreado suave de esfera: solo actúa en modo globo (se desvanece con uMorph).
const SHADE = glsl`
uniform float uMorph;
uniform vec3 uLight;      // dirección de la luz, en espacio de cámara
uniform float uShadow;    // luz mínima en la cara en sombra
uniform vec3 uRim;        // color del borde "atmosférico"
uniform float uRimAmount;
uniform float uRimPower;

// Día y noche en tiempo real: la cara que no mira al Sol se oscurece y se tiñe, con una franja
// de crepúsculo. Depende solo del punto geográfico, así que sirve igual en el globo y en el plano.
uniform vec3 uSun;        // dirección del Sol en coordenadas geográficas (unitario)
uniform float uNight;     // 0 = sin efecto, 1 = día y noche visibles
uniform vec3 uNightTint;
uniform float uNightDim;

// «El planeta por dentro»: se abre un gajo del globo (un cuarto de naranja sobre el ecuador, entre
// dos meridianos) y lo que cae dentro no se dibuja. «geo» es el punto geográfico, unitario.
uniform float uCut;    // 1 = gajo abierto
uniform vec2 uCutLon;  // meridianos que lo limitan, en radianes (oeste, este)

bool inCut(vec3 geo) {
  if (uCut < 0.5 || geo.y < 0.0) return false;
  float lon = atan(geo.x, geo.z);
  return lon > uCutLon.x && lon < uCutLon.y;
}

vec3 daylight(vec3 color, vec3 geo) {
  float day = smoothstep(-0.14, 0.05, dot(normalize(geo), uSun));
  vec3 night = mix(color * uNightDim, uNightTint, 0.3);
  return mix(color, mix(night, color, day), uNight);
}

vec3 shade(vec3 color, vec3 normal, vec3 toEye, vec3 geo) {
  vec3 n = normalize(normal);
  vec3 v = normalize(toEye);
  float lambert = smoothstep(0.0, 1.0, 0.5 + 0.5 * dot(n, uLight));
  float light = mix(1.0, mix(uShadow, 1.0, lambert), uMorph);
  float rim = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), uRimPower) * uMorph;
  return mix(daylight(color, geo) * light, uRim, rim * uRimAmount);
}
`;

// ───────────────────────── Océano (con retícula de meridianos y paralelos) ─────────────────────────

export const OCEAN_VERT = glsl`
${SURFACE}
varying vec2 vLonLat;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;

void main() {
  vec3 n;
  vec3 p = surface(position.xy, 0.0, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vLonLat = position.xy;
  vGeo = geoVector(position.xy);
  vNormal = mat3(viewMatrix) * n;
  vToEye = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const OCEAN_FRAG = glsl`
${SHADE}
uniform vec3 uOcean;
uniform vec3 uGrid;
uniform float uGridAlpha;
uniform float uGlint;     // fuerza del reflejo del agua (0 = mate)
uniform float uSwell;     // cuánto oleaje hay: 0 con el mapa lejos, 1 de cerca (lo fija el motor)
uniform float uTime;      // segundos, para el vaivén lento del agua
uniform sampler2D uFlow;  // corrientes medias reales (scripts/build-currents.py)
uniform float uFlowAmt;   // 1 = el agua se mueve con la corriente
uniform float uZones;     // 1 = franjas de los husos horarios teóricos (15° cada uno)
uniform float uFlowShow;  // 1 = capa «Corrientes oceánicas» a la vista
uniform sampler2D uSeabed; // profundidad real del mar (scripts/build-depth.py)
uniform float uDepth;     // cuánto se distinguen el mar profundo y las aguas someras (0 = color plano)
uniform sampler2D uShade; // relieve del fondo del mar, sombreado (scripts/build-seabed.py)
uniform float uShadeAmt;  // cuánto se nota ese relieve (0 = fondo liso)
varying vec2 vLonLat;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;

// El oleaje y las vetas de las corrientes son casi todo lo que tarda en compilarse este sombreador
// (el ruido se copia entero en cada sitio donde se usa). Por eso hay dos versiones: sin «WAVES», el
// mar liso, con el que el mapa aparece cuanto antes y que se usa mientras se ve de lejos; con
// «WAVES», la completa, que el motor compila después y pone al acercarse o con la capa de corrientes
// (ver «fullOcean» y «tick» en MapEngine).
#ifdef WAVES
// Oleaje: ruido de gradiente en 3D evaluado sobre el punto geográfico, así que está fijo al mapa
// (no se mueve ni obliga a redibujar) y es continuo en el antimeridiano y en los polos.
vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(
      mix(dot(hash3(i), f), dot(hash3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), dot(hash3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0)), u.x),
      u.y
    ),
    mix(
      mix(dot(hash3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), dot(hash3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), u.x),
      mix(dot(hash3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), dot(hash3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1)), u.x),
      u.y
    ),
    u.z
  );
}

// Altura del agua: varias escalas de ola, de las que solo cuentan las que en pantalla miden entre
// unos 3 y unos 12 píxeles. Más grandes parecen olas gigantes al acercar el mapa; más finas, la
// pendiente por píxel sale en bloques de 2×2 y se ve una cuadrícula. Cada una pesa algo menos que
// la anterior, con la misma pendiente.
// Giro fijo (ortonormal) entre escalas de ola.
const mat3 TURN = mat3(0.36, 0.48, -0.8, -0.8, 0.6, 0.0, 0.48, 0.64, 0.6);
#endif

// Corriente en un punto: xyz = hacia dónde va el agua (vector sobre la esfera, sin unidades de
// distancia) y w = velocidad en m/s. En la textura, rojo y verde son la velocidad hacia el este y
// hacia el norte de −1 a 1 m/s, y azul vale 1 donde hay dato.
//
// La rejilla de corrientes es gruesa (540 × 270, dos tercios de grado) y al acercarse cada celda
// ocupa decenas de píxeles. Si se deja que la tarjeta gráfica interpole (o no interpole, que también
// pasa), el arrastre cambia de golpe o en esquina de una celda a otra y el dibujo se parte en
// cuadrados. Por eso se interpola aquí, con suavidad, entre los nueve puntos de alrededor
// (B-spline cuadrática), leyendo cada uno en el centro de su celda.
vec2 flowAt(vec2 ll) {
  const vec2 size = vec2(540.0, 270.0);
  vec2 st = vec2(ll.x / 6.283185307 + 0.5, ll.y / 3.141592654 + 0.5) * size;
  vec2 center = floor(st) + 0.5;
  vec2 f = st - center; // de −0,5 a 0,5: dónde cae el punto dentro de su celda
  vec2 w0 = 0.5 * (0.5 - f) * (0.5 - f);
  vec2 w1 = 0.75 - f * f;
  vec2 w2 = 0.5 * (0.5 + f) * (0.5 + f);
  vec2 sum = vec2(0.0);
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec3 t = texture2D(uFlow, (center + vec2(float(i), float(j))) / size).rgb;
      float w = (i < 0 ? w0.x : (i > 0 ? w2.x : w1.x)) * (j < 0 ? w0.y : (j > 0 ? w2.y : w1.y));
      sum += w * (t.rg * 255.0 - 128.0) / 127.0 * t.b;
    }
  }
  return sum;
}

vec4 current(vec2 ll) {
  vec2 uv = flowAt(ll);
  vec3 east = vec3(cos(ll.x), 0.0, -sin(ll.x));
  vec3 north = vec3(-sin(ll.y) * sin(ll.x), cos(ll.y), -sin(ll.y) * cos(ll.x));
  float speed = length(uv);
  return vec4(speed > 1e-4 ? (east * uv.x + north * uv.y) / speed : vec3(0.0), speed);
}

#ifdef WAVES
// Ruido que la corriente arrastra. El dibujo se desplaza en la dirección «drift» y, para que no se
// estire sin fin, se alternan dos copias desfasadas medio ciclo que se funden una en otra.
float carried(vec3 p, vec3 drift) {
  float a = fract(uTime / 9.0);
  float b = fract(uTime / 9.0 + 0.5);
  return mix(gnoise(p - drift * b + vec3(3.7)), gnoise(p - drift * a), 1.0 - abs(2.0 * a - 1.0));
}

float swell(vec3 p, float px, vec3 drift) {
  float h = 0.0;
  // Las escalas van de 2,07 en 2,07 desde olas de unos 50 km. Solo se calculan las cuatro que caben
  // en esa ventana de tamaños en pantalla, empezando por la más gruesa que entra: con el globo
  // entero queda un grano tenue (desde el espacio no se ven olas) y el oleaje aparece al acercarse.
  // Calcular solo esas, en vez de recorrerlas todas, abarata mucho el sombreador (y su compilación).
  float first = max(ceil(log(0.07 / (px * 120.0)) / log(2.07)), 0.0);
  for (int j = 0; j < 4; j++) {
    float k = first + float(j);
    float f = 120.0 * pow(2.07, k);
    float visible = 1.0 - smoothstep(0.1, 0.4, px * f);
    float fine = smoothstep(0.07, 0.16, px * f);
    // cada escala, girada respecto a las vecinas: sin esto las celdas del ruido se alinean y se ve
    // una cuadrícula
    float turn = mod(k, 3.0);
    vec3 q = turn < 0.5 ? p : (turn < 1.5 ? TURN * p : TURN * (TURN * p));
    vec3 pull = turn < 0.5 ? drift : (turn < 1.5 ? TURN * drift : TURN * (TURN * drift));
    // cada escala arrastra un poco a la siguiente: crestas alargadas en vez de manchas redondas
    vec3 at = q * f + vec3(h * f * 0.35) + uTime * vec3(0.05, 0.035, 0.02);
    h += fine * visible * pow(0.86, k) / f * carried(at, pull);
  }
  return h;
}
#endif

// Brillo del agua: reflejo de la luz (del Sol real en el modo de tiempo real) roto en destellos finos
// por el oleaje, un velo ancho alrededor y un aclarado hacia el borde del globo (Fresnel).
vec3 glint(vec3 normal, vec3 toEye, vec3 geo, vec4 flow) {
  float px = max(length(fwidth(geo)) * 0.7071, 1e-7);
  // La dirección es la real; la velocidad se comprime (raíz cuadrada) para que también se note
  // dónde la corriente es débil. Una corriente de 1 m/s arrastra el oleaje 5 olas por ciclo.
#ifdef WAVES
  float h = uSwell * swell(geo, px, flow.xyz * sqrt(flow.w) * 5.0 * uFlowAmt);
#else
  float h = 0.0;
#endif
  // pendiente de la ola en pantalla → inclina la normal (en espacio de cámara)
  vec2 slope = vec2(dFdx(h), dFdy(h)) / px;
  vec3 n = normalize(normalize(normal) - 0.16 * vec3(slope, 0.0));
  vec3 v = normalize(toEye);
  float real = uNight * uMorph;
  vec3 l = normalize(mix(uLight, mat3(viewMatrix) * uSun, real));
  float ndh = max(dot(n, normalize(l + v)), 0.0);
  float flat_ = mix(0.3, 1.0, uMorph);
  float sparkle = pow(ndh, 60.0) * 0.55;
  float sheen = pow(ndh, 9.0) * 0.3;
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0) * uMorph * 0.3;
  // De noche no hay reflejo del Sol.
  float lit = mix(1.0, smoothstep(-0.05, 0.2, dot(geo, uSun)), uNight);
  return vec3(1.0, 0.97, 0.9) * (((sparkle + sheen) * flat_ + fresnel) * uGlint * lit);
}

// Color del mar como se ve desde el espacio, con la profundidad real: claro y verdoso sobre las
// plataformas continentales (menos de 200 m) y cada vez más oscuro hasta las llanuras abisales y
// las fosas. La textura guarda el escalón de profundidad (0 = tierra, 1 = 0–200 m, 2 = 200–1000 m,
// 3 = 1000–2000 m … 12 = más de 10 000 m) multiplicado por 21.
vec3 sea(vec2 ll) {
  float level = texture2D(uSeabed, vec2(ll.x / 6.283185307 + 0.5, ll.y / 3.141592654 + 0.5)).r * 255.0 / 21.0;
  // 0 en la plataforma, 1 a partir de 6000 m
  float deepness = clamp((level - 1.0) / 6.0, 0.0, 1.0);
  vec3 shallow = uOcean * vec3(1.06, 1.14, 1.10) + vec3(0.0, 0.035, 0.02);
  vec3 deep = uOcean * vec3(0.70, 0.78, 0.90);
  // la mayor parte del cambio, en los primeros 2000 m, como se ve en las fotos de satélite
  vec3 water = mix(uOcean, mix(shallow, deep, sqrt(deepness)), uDepth);
  // Relieve del fondo (dorsales, fosas, taludes): 0,5 es fondo llano; más claro, ladera iluminada.
  // Aclara u oscurece el agua, sin cambiarle el tono.
  float relief = texture2D(uShade, vec2(ll.x / 6.283185307 + 0.5, ll.y / 3.141592654 + 0.5)).r - 0.5;
  return water * (1.0 + relief * uShadeAmt);
}

void main() {
  // Retícula cada 15°, de 1 px de grosor sea cual sea el zoom.
  vec2 g = vLonLat * (180.0 / 3.141592653589793) / 15.0;
  vec2 w = max(fwidth(g), 1e-6);
  vec2 d = abs(fract(g - 0.5) - 0.5) / w;
  // Cerca de los polos los meridianos se amontonan: se desvanecen.
  float meridian = (1.0 - clamp(d.x, 0.0, 1.0)) * (1.0 - smoothstep(0.15, 0.5, w.x));
  float parallel = 1.0 - clamp(d.y, 0.0, 1.0);
  float line = max(meridian, parallel);
  vec3 geo = normalize(vGeo);
  if (inCut(geo)) discard;
  vec4 flow = uFlowAmt + uFlowShow > 0.0 ? current(vLonLat) : vec4(0.0);
  vec3 water = sea(vLonLat);
#ifdef WAVES
  // Capa de corrientes: vetas claras que avanzan con el agua, más visibles cuanto más rápida va.
  if (uFlowShow > 0.0) {
    // Vetas de unos pocos píxeles sea cual sea el zoom: con el globo entero, anchas; de cerca, finas.
    float px = max(length(fwidth(geo)) * 0.7071, 1e-7);
    float scale = clamp(0.035 / px, 14.0, 160.0);
    vec3 pull = flow.xyz * sqrt(flow.w);
    float streak = carried(geo * scale, pull * 3.0) + 0.5 * carried(geo * scale * 2.1, pull * 6.0);
    water += uFlowShow * smoothstep(0.02, 0.4, flow.w) * (0.3 + 1.2 * smoothstep(-0.15, 0.45, streak)) * vec3(0.48, 0.66, 0.70);
  }
#endif
  // Husos teóricos: una franja de 15° por hora, centrada en su meridiano (el de Greenwich, la del 0).
  if (uZones > 0.0) {
    float band = floor((vLonLat.x * 57.29578 + 7.5) / 15.0);
    water *= 1.0 + uZones * (mod(band, 2.0) < 0.5 ? 0.09 : -0.09);
  }
  vec3 c = mix(water, uGrid, line * uGridAlpha);
  gl_FragColor = vec4(shade(c, vNormal, vToEye, vGeo) + glint(vNormal, vToEye, vGeo, flow), 1.0);
}
`;

// ───────────────────────── Relleno de los países ─────────────────────────

export const FILL_VERT = glsl`
${SURFACE}
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;
varying vec2 vLonLat;
varying float vPhoto; // cuánto de la imagen de satélite deja ver este país (0–1)
varying float vTint;

void main() {
  vGeo = geoVector(position.xy);
  vLonLat = position.xy;
  vec4 state = stateOf(position.z);
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt + state.a * uLift, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vColor = state.rgb;
  vPhoto = auxOf(position.z).b;
  vTint = 1.0;
  vNormal = mat3(viewMatrix) * n;
  vToEye = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

// Paredes: cada vértice de contorno existe dos veces, arriba (aTop = 1) y abajo (aTop = 0).
// Con el país sin levantar, las dos copias coinciden y la pared no ocupa ningún píxel.
export const WALL_VERT = glsl`
${SURFACE}
attribute float aTop;
uniform float uWallTint;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;
varying vec2 vLonLat;
varying float vPhoto;
varying float vTint;

void main() {
  vGeo = geoVector(position.xy);
  vLonLat = position.xy;
  vec4 state = stateOf(position.z);
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt + state.a * uLift * aTop, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vColor = state.rgb * uWallTint;
  vPhoto = auxOf(position.z).b;
  vTint = uWallTint;
  vNormal = mat3(viewMatrix) * n;
  vToEye = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const FILL_FRAG = glsl`
${SHADE}
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;
varying vec2 vLonLat;
uniform sampler2D uRelief; // sombreado real del relieve (scripts/build-relief.py)
uniform float uReliefAmt; // 0 = sin relieve
uniform sampler2D uPhoto; // imagen de satélite (scripts/build-satellite.py); transparente en el mar
uniform float uPhotoAmt;  // 1 = capa «Imagen de satélite» a la vista
uniform sampler2D uPatch; // la misma foto con más detalle, solo de la zona que se está mirando
uniform vec4 uPatchBox;   // qué zona cubre: (longitud oeste, latitud sur, longitud este, latitud norte)
uniform float uPatchAmt;  // 0 = sin detalle; sube a 1 al llegar la imagen
varying float vPhoto;
varying float vTint;

void main() {
  if (inCut(normalize(vGeo))) discard;
  vec2 uv = vec2(vLonLat.x / 6.283185307 + 0.5, vLonLat.y / 3.141592654 + 0.5);
  // En la textura, 206/255 es terreno llano: más oscuro, ladera en sombra; más claro, al sol.
  float relief = texture2D(uRelief, uv).r / 0.808;
  vec3 base = vColor;
  if (uPhotoAmt > 0.0) {
    // La foto sustituye al color del país en la medida que diga su estado (entera en el mapa
    // político, a medias bajo el color de una respuesta, nada en los mapas de datos) y solo donde
    // la foto tiene tierra: en una isla que en ella es mar se queda el color del país.
    vec4 photo = texture2D(uPhoto, uv);
    if (uPatchAmt > 0.0) {
      vec2 q = (vLonLat - uPatchBox.xy) / (uPatchBox.zw - uPatchBox.xy);
      vec3 fine = texture2D(uPatch, clamp(q, 0.0, 1.0)).rgb;
      // Dentro de la zona, fundida hacia el borde para que no se vea el corte.
      vec2 edge = min(q, 1.0 - q);
      float inside = clamp(min(edge.x, edge.y) / 0.03, 0.0, 1.0);
      // En la foto de detalle el mar es un azul casi negro; la costa del mapa no coincide con ella
      // al píxel, y donde cae mar se deja la foto general, que ahí tiene color de tierra.
      float sea = step(fine.r, fine.b) * step(fine.g, fine.b + 0.02) * (1.0 - smoothstep(0.22, 0.36, fine.b));
      float cover = inside * (1.0 - sea) * uPatchAmt;
      photo.rgb = mix(photo.rgb, fine, cover);
      // Una isla que en la foto general era mar sí sale en la de detalle.
      photo.a = max(photo.a, cover);
    }
    base = mix(base, photo.rgb * vTint, vPhoto * photo.a * uPhotoAmt);
  }
  vec3 c = base * mix(1.0, relief, uReliefAmt);
  gl_FragColor = vec4(shade(c, vNormal, vToEye, vGeo), 1.0);
}
`;

// ───────────────────────── Contornos (fronteras y costas) ─────────────────────────
//
// Cada tramo es un rectángulo instanciado que se ensancha en espacio de pantalla, de modo que el
// grosor no depende del zoom ni del límite de 1 px de gl.LINES.

export const LINE_VERT = glsl`
${SURFACE}
attribute vec3 aStart; // lon, lat, país
attribute vec2 aEnd;   // lon, lat
uniform vec2 uViewport;   // tamaño del lienzo en píxeles de dispositivo
uniform float uWidth;     // grosor normal, en píxeles de dispositivo
uniform float uEmphWidth; // grosor de un contorno enfatizado
uniform vec3 uLine;
uniform vec3 uLineEmph;
uniform float uFlat; // 1 = línea que no es una frontera (un río, el ecuador): no se enfatiza
varying vec3 vColor;
varying float vDist; // distancia al eje del tramo, en píxeles
varying float vHalf;
varying vec3 vGeoLine;

void main() {
  vGeoLine = geoVector(position.x < 0.5 ? aStart.xy : aEnd);
  // aStart.z < 0: el tramo va por el mar y no sube con ningún país
  float owned = step(0.0, aStart.z);
  vec4 state = stateOf(max(aStart.z, 0.0));
  float emph = auxOf(max(aStart.z, 0.0)).r * (1.0 - uFlat);
  float alt = uBaseAlt + state.a * uLift * owned;
  vec3 n;
  vec4 ca = projectionMatrix * viewMatrix * vec4(surface(aStart.xy, alt, n), 1.0);
  vec4 cb = projectionMatrix * viewMatrix * vec4(surface(aEnd, alt, n), 1.0);
  vec2 pa = ca.xy / ca.w * uViewport * 0.5;
  vec2 pb = cb.xy / cb.w * uViewport * 0.5;
  vec2 d = pb - pa;
  float len = length(d);
  vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float halfWidth = 0.5 * mix(uWidth, uEmphWidth, emph);
  float reach = halfWidth + 1.0; // 1 px más para suavizar el borde
  vec4 c = position.x < 0.5 ? ca : cb;
  // se alarga medio grosor por cada extremo para tapar las juntas entre tramos
  vec2 offset = nrm * position.y * reach + dir * (position.x * 2.0 - 1.0) * halfWidth * 0.5;
  c.xy += offset / (uViewport * 0.5) * c.w;
  gl_Position = c;
  vDist = position.y * reach;
  vHalf = halfWidth;
  vColor = mix(uLine, uLineEmph, emph);
}
`;

export const LINE_FRAG = glsl`
uniform float uOpacity;
uniform float uCut;
uniform vec2 uCutLon;
varying vec3 vColor;
varying float vDist;
varying float vHalf;
varying vec3 vGeoLine;

void main() {
  // dentro del gajo abierto no hay fronteras, ríos ni líneas
  if (uCut > 0.5 && vGeoLine.y > 0.0) {
    float lon = atan(vGeoLine.x, vGeoLine.z);
    if (lon > uCutLon.x && lon < uCutLon.y) discard;
  }
  float a = clamp(vHalf + 0.5 - abs(vDist), 0.0, 1.0) * uOpacity;
  if (a <= 0.003) discard;
  gl_FragColor = vec4(vColor, a);
}
`;

// ───────────────────────── Marcadores de países diminutos ─────────────────────────
//
// Un país que en pantalla mide menos que `uThreshold` píxeles se señala con un círculo de tamaño
// fijo, para que se pueda ver y pulsar. Al acercarse, el país crece y el círculo se desvanece.

export const MARKER_VERT = glsl`
${SURFACE}
attribute float aSize;    // tamaño angular del país, en radianes
uniform float uPxPerRad;  // píxeles (CSS) por radián en el punto enfocado
uniform float uThreshold; // por debajo de este tamaño en pantalla aparece el marcador
uniform float uMarkerPx;  // diámetro del marcador, en píxeles de dispositivo
uniform float uCut;       // 1 = gajo del planeta abierto
uniform vec2 uCutLon;
varying vec3 vColor;
varying float vShow;
varying float vEmph;

void main() {
  vec4 state = stateOf(position.z);
  vec4 aux = auxOf(position.z);
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt + state.a * uLift, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  // Los marcadores no pasan la prueba de profundidad (un país vecino levantado los taparía),
  // así que la cara oculta del globo se descarta aquí.
  float facing = dot(normalize(mat3(viewMatrix) * n), normalize(-mv.xyz));
  float px = aSize * uPxPerRad;
  vShow = (1.0 - smoothstep(uThreshold * 0.85, uThreshold * 1.15, px)) * aux.g * smoothstep(0.02, 0.12, facing);
  // Con el planeta abierto, los países diminutos que caen en el gajo quitado no llevan marcador.
  if (uCut > 0.5 && position.y > 0.0 && position.x > uCutLon.x && position.x < uCutLon.y) vShow = 0.0;
  gl_PointSize = vShow > 0.01 ? uMarkerPx : 0.0;
  vColor = state.rgb;
  vEmph = aux.r;
}
`;

export const MARKER_FRAG = glsl`
uniform vec3 uLine;
uniform vec3 uLineEmph;
uniform float uMarkerPx;
varying vec3 vColor;
varying float vShow;
varying float vEmph;

void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  float px = 2.0 / uMarkerPx; // un píxel, en unidades de radio
  float disc = 1.0 - smoothstep(1.0 - 2.0 * px, 1.0, r);
  float ringStart = 1.0 - mix(4.0, 6.0, vEmph) * px;
  float ring = smoothstep(ringStart - px, ringStart + px, r);
  vec3 c = mix(vColor, mix(uLine, uLineEmph, max(vEmph, 0.35)), ring);
  float a = disc * vShow;
  if (a <= 0.003) discard;
  gl_FragColor = vec4(c, a);
}
`;

// ───────────────────────── Halo del globo ─────────────────────────
//
// Un cuadrado que mira siempre a la cámara, centrado en el globo. Se dibuja con prueba de
// profundidad: el globo lo tapa por dentro y solo asoma el resplandor exterior.

export const HALO_VERT = glsl`
uniform float uExtent;  // semilado del cuadrado, en radios
varying vec2 vPos;

void main() {
  vPos = position.xy * uExtent;
  vec4 mv = viewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  mv.xy += vPos;
  gl_Position = projectionMatrix * mv;
}
`;

export const HALO_FRAG = glsl`
uniform vec3 uColor;
uniform float uAlpha;
uniform float uFalloff;
uniform vec2 uOffset;      // desplazamiento del resplandor (sombra proyectada sobre el papel)
uniform vec3 uOutline;     // contorno fino pegado al globo
uniform float uOutlineAlpha;
uniform float uSilhouette; // radio aparente del globo en el plano del cuadrado
uniform float uShells;     // 1 = capas de la atmósfera en vez del resplandor
uniform vec3 uSunView;     // dirección del Sol vista desde la cámara (x derecha, y arriba, z hacia quien mira)
uniform float uSunLit;     // 1 = la atmósfera se ilumina según el Sol (tiempo real)
varying vec2 vPos;

// Las cinco capas de la atmósfera alrededor del globo. La altura está muy exagerada (a escala, las
// cuatro primeras no llegarían a un píxel) y los grosores solo guardan el orden. Cada capa es aire
// cada vez más tenue: más densa y clara por abajo, casi transparente por arriba, así que las
// estrellas se ven a través de las de fuera. «rim» es la dirección del punto en pantalla.
vec4 shells(float r, vec2 rim) {
  if (r < 1.0) return vec4(0.0);
  vec3 color;
  float lo;
  float hi;
  vec2 dense; // opacidad abajo y arriba de la capa
  if (r < 1.07) { color = vec3(0.70, 0.86, 0.98); lo = 1.0; hi = 1.07; dense = vec2(0.94, 0.82); }        // troposfera
  else if (r < 1.16) { color = vec3(0.38, 0.62, 0.88); lo = 1.07; hi = 1.16; dense = vec2(0.80, 0.64); }  // estratosfera
  else if (r < 1.27) { color = vec3(0.20, 0.40, 0.70); lo = 1.16; hi = 1.27; dense = vec2(0.62, 0.46); }  // mesosfera
  else if (r < 1.45) { color = vec3(0.14, 0.26, 0.52); lo = 1.27; hi = 1.45; dense = vec2(0.44, 0.24); }  // termosfera
  else { color = vec3(0.10, 0.17, 0.36); lo = 1.45; hi = 1.72; dense = vec2(0.18, 0.0); }                 // exosfera
  float f = (r - lo) / (hi - lo);
  float alpha = mix(dense.x, dense.y, f);
  color *= mix(1.12, 0.82, f);
  // El lado que mira al Sol brilla más; el de noche queda en penumbra (solo con tiempo real).
  float lit = max(smoothstep(-0.35, 0.3, dot(rim, uSunView.xy)), smoothstep(0.75, 0.98, -uSunView.z));
  float sunny = mix(1.0, 0.7 + 0.4 * lit, uSunLit);
  color *= sunny;
  // Capa de ozono: una franja algo más clara en mitad de la estratosfera.
  color += vec3(0.10, 0.14, 0.16) * exp(-pow((r - 1.115) / 0.012, 2.0)) * sunny;
  // Auroras: cortinas verdes en la parte baja de la termosfera, cerca de los polos.
  float polar = smoothstep(0.78, 0.95, abs(rim.y));
  float curtain = 0.6 + 0.4 * sin(atan(rim.y, rim.x) * 90.0);
  float aurora = polar * exp(-pow((r - 1.30) / 0.022, 2.0)) * curtain;
  color = mix(color, vec3(0.35, 1.0, 0.62), aurora * 0.75);
  alpha = max(alpha, aurora * 0.6);
  // Una línea fina y clara marca dónde acaba cada capa (la exosfera se desvanece sin borde).
  float line = (1.0 - smoothstep(0.0, 2.0 * fwidth(r), hi - r)) * step(r, 1.45);
  color = mix(color, vec3(0.90, 0.95, 1.0) * sunny, line * 0.75);
  alpha = max(alpha, line * 0.8);
  return vec4(color, alpha);
}

void main() {
  if (uShells > 0.5) {
    vec4 shell = shells(length(vPos) / uSilhouette, normalize(vPos + vec2(1e-5)));
    if (shell.a <= 0.003) discard;
    gl_FragColor = shell;
    return;
  }
  float glowR = length(vPos - uOffset) / uSilhouette;
  // El aire del borde solo brilla donde le da el Sol. «side» dice si este punto del borde mira al
  // Sol; «back», si el Sol está detrás de la Tierra (contraluz) o detrás de quien mira (de frente).
  // A contraluz la luz atraviesa la atmósfera casi de canto: un anillo fino y muy brillante, cálido
  // junto al terminador. De frente, un resplandor azul suave. En el lado de noche casi nada.
  vec2 rim = normalize(vPos + vec2(1e-5));
  float side = dot(rim, uSunView.xy);
  float back = -uSunView.z;
  float lit = max(smoothstep(-0.22, 0.18, side), smoothstep(0.8, 0.98, back));
  float forward = pow(max(back, 0.0), 3.0);
  float sunny = mix(1.0, (0.1 + 0.9 * lit) * (0.8 + 1.3 * forward), uSunLit);
  float falloff = uFalloff * (1.0 + 2.2 * forward * uSunLit);
  float glow = min(1.0, uAlpha * sunny) * (glowR < 1.0 ? 1.0 : exp(-(glowR - 1.0) * falloff));
  // El color del ocaso, donde el borde pasa del día a la noche.
  float dusk = exp(-side * side * 22.0) * (0.25 + 0.75 * max(back, 0.0)) * uSunLit;
  vec3 air = mix(uColor, vec3(1.0, 0.62, 0.34), dusk * 0.75);
  air = mix(air, vec3(0.86, 0.93, 1.0), forward * lit * 0.5 * uSunLit);
  float r = length(vPos) / uSilhouette;
  float px = fwidth(r);
  float ring = uOutlineAlpha * (1.0 - smoothstep(1.2 * px, 2.4 * px, r - 1.0));
  float a = ring + glow * (1.0 - ring);
  if (a <= 0.003) discard;
  gl_FragColor = vec4((uOutline * ring + air * glow * (1.0 - ring)) / a, a);
}
`;

// ───────────────────────── Interior de la Tierra (caras del gajo abierto) ─────────────────────────
//
// El corte es escalonado: cada capa se abre un poco menos que la de encima, así que asoma como un
// escalón con su superficie esférica a la vista. La geometría la construye el motor (setPlanetView).
// El color sale de la distancia al centro, así que las capas son esferas de verdad y a escala:
// núcleo interno hasta 1220 km de radio, núcleo externo hasta 3470 y manto hasta la corteza, que se
// dibuja engrosada porque a escala no se vería. El movimiento es una ilustración.

const NOISE3 = glsl`
// Ruido de valor en 3D y su suma por octavas: con él se hacen la roca, el metal fundido y las
// corrientes. Se evalúa sobre el punto del espacio, así que el dibujo casa de una cara a otra.
float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amp * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum;
}
`;

export const CUT_VERT = glsl`
attribute float aShade;
attribute float aRadius; // > 0 en los escalones: radio con el que se colorea (el de su capa)
varying vec3 vPos;
varying float vShade;
varying float vRadius;

void main() {
  vPos = position;
  vShade = aShade;
  vRadius = aRadius;
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
}
`;

export const CUT_FRAG = glsl`
uniform float uTime;
varying vec3 vPos;
varying float vShade;
varying float vRadius;

${NOISE3}
void main() {
  float r = vRadius > 0.0 ? vRadius : length(vPos);
  vec3 dir = vPos / max(r, 1e-4);
  float t = uTime;
  vec3 color;

  if (r < 0.1915) {
    // (queda dentro de la esfera del núcleo interno, que se dibuja aparte y entera)
    color = vec3(1.0, 0.9, 0.6);
  } else if (r < 0.5447) {
    // Núcleo externo: metal líquido. El dibujo se retuerce y gira alrededor del eje, con
    // filamentos más calientes; es la capa que más se mueve.
    float depth = (r - 0.1915) / (0.5447 - 0.1915);
    float spin = t * 0.22;
    vec3 q = vec3(vPos.x * cos(spin) - vPos.z * sin(spin), vPos.y, vPos.x * sin(spin) + vPos.z * cos(spin));
    vec3 warp = vec3(fbm(q * 7.0 + vec3(0.0, t * 0.10, 0.0)), fbm(q * 7.0 + vec3(5.2, 1.3, t * 0.08)), fbm(q * 7.0 + vec3(2.8, t * 0.06, 7.1)));
    float flow = fbm(q * 9.0 + (warp - 0.5) * 2.6);
    float filament = pow(1.0 - abs(flow - 0.5) * 2.0, 5.0);
    color = mix(vec3(0.86, 0.34, 0.05), vec3(1.0, 0.70, 0.18), flow);
    color = mix(color, vec3(1.0, 0.93, 0.62), filament * 0.75);
    color *= 1.08 - 0.22 * depth;
  } else if (r < 0.8964) {
    // Manto inferior: roca al rojo, más clara junto al núcleo; penachos que suben y vetas
    // incandescentes entre la roca.
    float depth = (r - 0.5447) / (0.8964 - 0.5447);
    vec3 rise = dir * (t * 0.012);
    float rock = fbm(vPos * 15.0 - rise * 15.0);
    float plume = fbm(vec3(dir * 5.0) + vec3(0.0, 0.0, r * 3.0 - t * 0.035));
    float vein = pow(1.0 - abs(fbm(vPos * 26.0 - rise * 26.0 + vec3(4.0)) - 0.5) * 2.0, 7.0);
    vec3 hot = vec3(0.93, 0.30, 0.08);
    vec3 cool = vec3(0.50, 0.08, 0.05);
    color = mix(hot, cool, clamp(depth * 0.85 + (rock - 0.5) * 0.5, 0.0, 1.0));
    color = mix(color, hot * 1.1, smoothstep(0.52, 0.78, plume) * (1.0 - depth) * 0.7);
    color += vec3(1.0, 0.50, 0.14) * vein * 0.5 * (1.0 - 0.6 * depth);
    color *= 0.86 + 0.28 * rock;
  } else if (r < 0.972) {
    // Manto superior: peridotita, más fría. Roca parda verdosa de grano fino, sin vetas encendidas,
    // para que no se confunda con el manto inferior.
    float depth = (r - 0.8964) / (0.972 - 0.8964);
    float rock = fbm(vPos * 34.0 - dir * (t * 0.01));
    float speck = noise(vPos * 120.0);
    color = mix(vec3(0.62, 0.46, 0.20), vec3(0.34, 0.27, 0.13), clamp(depth * 0.7 + (rock - 0.5) * 0.7, 0.0, 1.0));
    color *= 0.88 + 0.2 * speck;
  } else {
    // Corteza: roca fría en estratos, engrosada para que se vea.
    float strata = noise(vec3(r * 520.0, dir.x * 6.0, dir.z * 6.0));
    float rock = fbm(vPos * 70.0);
    color = mix(vec3(0.30, 0.24, 0.19), vec3(0.58, 0.47, 0.34), 0.5 * strata + 0.5 * rock);
  }

  // Los límites entre capas: un resplandor en los dos del núcleo y una línea oscura bajo la corteza.
  float glow = exp(-abs(r - 0.1915) * 70.0) + 0.7 * exp(-abs(r - 0.5447) * 55.0);
  color += vec3(1.0, 0.72, 0.30) * glow * 0.45;
  color *= 0.45 + 0.55 * smoothstep(0.0, 0.005, abs(r - 0.972));
  color *= 0.5 + 0.5 * smoothstep(0.0, 0.005, abs(r - 0.8964));
  // algo más oscuro hacia el borde, para que la cara no parezca plana
  color *= 1.0 - 0.18 * smoothstep(0.6, 1.0, r);
  gl_FragColor = vec4(color * vShade, 1.0);
}
`;

// El núcleo interno es una bola sólida: no se corta con el gajo, asoma entera en el hueco.
export const CORE_VERT = glsl`
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vToEye;

void main() {
  vPos = position;
  vec4 mv = viewMatrix * vec4(position, 1.0);
  vNormal = mat3(viewMatrix) * normalize(position);
  vToEye = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

export const CORE_FRAG = glsl`
uniform float uTime;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vToEye;
${NOISE3}

void main() {
  // Hierro sólido al rojo blanco: grano cristalino fijo, más claro de frente y un latido muy lento.
  float facing = clamp(dot(normalize(vNormal), normalize(vToEye)), 0.0, 1.0);
  float grain = fbm(vPos * 46.0);
  float crystal = abs(noise(vPos * 24.0) - 0.5) * 2.0;
  vec3 color = mix(vec3(1.0, 0.80, 0.34), vec3(1.0, 0.96, 0.66), 0.25 + 0.75 * facing);
  color *= 0.88 + 0.18 * grain - 0.10 * crystal;
  color += vec3(0.10, 0.08, 0.03) * sin(uTime * 0.9);
  gl_FragColor = vec4(color, 1.0);
}
`;

// ───────────────────────── Sombra y marco de la hoja (mapa plano) ─────────────────────────

export const SHEET_VERT = glsl`
${SURFACE}
uniform vec2 uOffset;

void main() {
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt, n);
  p.xy += uOffset;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

export const SHEET_FRAG = glsl`
uniform vec3 uColor;
uniform float uAlpha;

void main() {
  gl_FragColor = vec4(uColor, uAlpha);
}
`;

// ───────────────────────── Estrellas ─────────────────────────
//
// Puntos en el infinito: solo les afecta el giro de la cámara, no su distancia. Como el mundo del
// motor es la Tierra (ejes geográficos), la dirección de una estrella es la del punto que la tiene
// en el cénit: longitud = ascensión recta − hora sidérea, latitud = declinación.

// La Vía Láctea: el cielo real (NASA Deep Star Maps 2020, Gaia DR2) en un cuadrado que llena la
// pantalla, al fondo. Cada píxel mira en una dirección; de ella salen su ascensión recta y su
// declinación, y con ellas el punto de la imagen. Gira con la hora sidérea, como las estrellas.
export const SKY_VERT = glsl`
varying vec3 vDir;

void main() {
  // de la pantalla a la dirección de la mirada, deshaciendo la proyección y el giro de la cámara
  // (la proyección está descentrada para apartar el globo de los paneles: de ahí los dos sumandos;
  // sin ellos la galaxia quedaría corrida respecto a las estrellas)
  vec3 view = vec3((position.x + projectionMatrix[2][0]) / projectionMatrix[0][0], (position.y + projectionMatrix[2][1]) / projectionMatrix[1][1], -1.0);
  vDir = view * mat3(viewMatrix);
  gl_Position = vec4(position.xy, 1.0, 1.0);
}
`;

export const SKY_FRAG = glsl`
uniform sampler2D uSky;
uniform float uSidereal;
uniform float uMorph;
uniform float uStars;
varying vec3 vDir;
void main() {
  vec3 dir = normalize(vDir);
  // Se deshace el giro de la hora sidérea: «sky» es la dirección en el cielo fijo (ecuatorial J2000).
  float turn = uSidereal;
  vec3 sky = vec3(dir.x * cos(turn) + dir.z * sin(turn), dir.y, dir.z * cos(turn) - dir.x * sin(turn));
  float ra = atan(sky.x, sky.z);
  // En la imagen la ascensión recta 0 está en el centro y crece hacia la izquierda.
  vec2 uv = vec2(fract(0.5 - ra / 6.2831853), 0.5 + asin(clamp(sky.y, -1.0, 1.0)) / 3.14159265);
  // El cielo vacío del mapa no es negro del todo (un grano gris de estrellas muy débiles): se recorta.
  vec3 glow = max(texture2D(uSky, uv).rgb - 0.15, 0.0) * 1.18;
  // Todo lo que se ve es el mapa de la NASA, con su color y su contraste: solo se baja la
  // exposición. La imagen viene con curva gamma, así que elevarla al cuadrado le devuelve la
  // proporción real entre las nubes brillantes y lo tenue (sin aplanar los blancos ni teñirla).
  vec3 color = glow * glow * 0.17 + glow * 0.03;
  // Con tantas estrellas delante, la galaxia va a medio color: de fondo, sin competir con ellas.
  color = mix(color, vec3(dot(color, vec3(0.299, 0.587, 0.114))), 0.5);
  float a = clamp(max(color.r, max(color.g, color.b)), 0.0, 1.0) * uStars * smoothstep(0.7, 1.0, uMorph);
  if (a <= 0.003) discard;
  gl_FragColor = vec4(color / max(a, 0.001), a);
}
`;

export const STAR_VERT = glsl`
uniform float uSidereal; // hora sidérea de Greenwich, en radianes
uniform float uDpr;
uniform float uTime;
attribute float aColor;
varying float vAlpha;
varying vec3 vTint;

void main() {
  float lon = position.x - uSidereal;
  float lat = position.y;
  vec3 dir = vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon));
  vec4 clip = projectionMatrix * vec4(mat3(viewMatrix) * dir, 0.0);
  gl_Position = vec4(clip.xy, clip.w, clip.w); // al fondo del todo: la Tierra las tapa
  float mag = position.z;
  // Cada magnitud es 2,5 veces menos luz: las brillantes crecen y las débiles se atenúan.
  // Por debajo de lo que se ve a simple vista (magnitud 6,5) ya no hay tamaño que quitar: las
  // estrellas débiles se quedan en un punto y pierden luz hasta casi fundirse con el fondo.
  float faint = clamp((mag - 6.5) / 2.5, 0.0, 1.0);
  gl_PointSize = (clamp(6.6 - 0.85 * mag, 1.8, 8.0) - 0.3 * faint) * uDpr;
  vAlpha = clamp(1.3 - 0.15 * mag, 0.32, 1.0) * mix(1.0, 0.55, faint) * 1.6;
  // Parpadeo tenue, cada estrella a su ritmo (su fase sale de su posición). Es un guiño al cielo
  // visto desde el suelo: lo causa el aire, y desde el espacio las estrellas no titilan.
  float phase = fract(sin(position.x * 91.7 + position.y * 47.3) * 43758.5453) * 6.2831853;
  vAlpha *= 1.0 + 0.2 * sin(uTime * (1.1 + 0.35 * phase) + phase) + 0.08 * sin(uTime * 2.9 + phase * 3.0);
  // Índice de color B−V: negativo = azulada, ~0,6 = como el Sol, >1,2 = anaranjada.
  vec3 blue = vec3(0.72, 0.82, 1.0);
  vec3 white = vec3(1.0, 0.98, 0.94);
  vec3 orange = vec3(1.0, 0.76, 0.52);
  vTint = aColor < 0.5
    ? mix(blue, white, clamp((aColor + 0.25) / 0.75, 0.0, 1.0))
    : mix(white, orange, clamp((aColor - 0.5) / 1.2, 0.0, 1.0));
}
`;

export const STAR_FRAG = glsl`
uniform float uMorph;
uniform float uStars; // 0 = ocultas
varying float vAlpha;
varying vec3 vTint;

void main() {
  float r = length(gl_PointCoord * 2.0 - 1.0);
  float a = (1.0 - smoothstep(0.35, 1.0, r)) * vAlpha * uStars * smoothstep(0.7, 1.0, uMorph);
  if (a <= 0.003) discard;
  gl_FragColor = vec4(vTint, a);
}
`;
