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
varying vec2 vLonLat;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;

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

// Altura del agua: seis escalas de ola fina. Cada una pesa 1/frecuencia
// (misma pendiente en todas) y se apaga cuando sus olas son más finas que un par de píxeles, así
// que a cualquier zoom hay detalle nítido y nada parpadea.
float swell(vec3 p, float px) {
  float h = 0.0;
  float f = 150.0;
  float a = 1.0;
  for (int i = 0; i < 6; i++) {
    float visible = 1.0 - smoothstep(0.18, 0.5, px * f);
    // cada escala arrastra un poco a la siguiente: crestas alargadas en vez de manchas redondas
    h += visible * a / f * gnoise(p * f + vec3(h * f * 0.35));
    f *= 2.07;
    a *= 0.86;
  }
  return h;
}

// Brillo del agua: reflejo de la luz (del Sol real en el modo de tiempo real) roto en destellos finos
// por el oleaje, un velo ancho alrededor y un aclarado hacia el borde del globo (Fresnel).
vec3 glint(vec3 normal, vec3 toEye, vec3 geo) {
  float px = max(length(fwidth(geo)) * 0.7071, 1e-7);
  float h = swell(geo, px);
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

void main() {
  // Retícula cada 15°, de 1 px de grosor sea cual sea el zoom.
  vec2 g = vLonLat * (180.0 / 3.141592653589793) / 15.0;
  vec2 w = max(fwidth(g), 1e-6);
  vec2 d = abs(fract(g - 0.5) - 0.5) / w;
  // Cerca de los polos los meridianos se amontonan: se desvanecen.
  float meridian = (1.0 - clamp(d.x, 0.0, 1.0)) * (1.0 - smoothstep(0.15, 0.5, w.x));
  float parallel = 1.0 - clamp(d.y, 0.0, 1.0);
  float line = max(meridian, parallel);
  vec3 c = mix(uOcean, uGrid, line * uGridAlpha);
  gl_FragColor = vec4(shade(c, vNormal, vToEye, vGeo) + glint(vNormal, vToEye, normalize(vGeo)), 1.0);
}
`;

// ───────────────────────── Relleno de los países ─────────────────────────

export const FILL_VERT = glsl`
${SURFACE}
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vToEye;
varying vec3 vGeo;

void main() {
  vGeo = geoVector(position.xy);
  vec4 state = stateOf(position.z);
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt + state.a * uLift, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vColor = state.rgb;
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

void main() {
  vGeo = geoVector(position.xy);
  vec4 state = stateOf(position.z);
  vec3 n;
  vec3 p = surface(position.xy, uBaseAlt + state.a * uLift * aTop, n);
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vColor = state.rgb * uWallTint;
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

void main() {
  gl_FragColor = vec4(shade(vColor, vNormal, vToEye, vGeo), 1.0);
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
varying vec3 vColor;
varying float vDist; // distancia al eje del tramo, en píxeles
varying float vHalf;

void main() {
  vec4 state = stateOf(aStart.z);
  float emph = auxOf(aStart.z).r;
  float alt = uBaseAlt + state.a * uLift;
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
varying vec3 vColor;
varying float vDist;
varying float vHalf;

void main() {
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
varying vec2 vPos;

void main() {
  float glowR = length(vPos - uOffset) / uSilhouette;
  float glow = uAlpha * (glowR < 1.0 ? 1.0 : exp(-(glowR - 1.0) * uFalloff));
  float r = length(vPos) / uSilhouette;
  float px = fwidth(r);
  float ring = uOutlineAlpha * (1.0 - smoothstep(1.2 * px, 2.4 * px, r - 1.0));
  float a = ring + glow * (1.0 - ring);
  if (a <= 0.003) discard;
  gl_FragColor = vec4((uOutline * ring + uColor * glow * (1.0 - ring)) / a, a);
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

export const STAR_VERT = glsl`
uniform float uSidereal; // hora sidérea de Greenwich, en radianes
uniform float uDpr;
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
  gl_PointSize = clamp(6.6 - 0.85 * mag, 1.8, 8.0) * uDpr;
  vAlpha = clamp(1.3 - 0.15 * mag, 0.32, 1.0);
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
