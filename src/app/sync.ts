import { create } from 'zustand';
import { homeOf, lang, t } from '../i18n';
import { useProgress } from './store';

// Sincronización del progreso entre dispositivos con un código, sin cuentas (función api/sync.ts).
//
// Cada dispositivo guarda su progreso como siempre, en el navegador. Con un código, además lo sube
// y lo baja: al abrir la web, unos segundos después de cada respuesta y al dejar la pestaña. Al
// juntarse dos progresos gana, país por país y reto por reto, la ficha más reciente, así que nada
// se pierde aunque se juegue en dos sitios a la vez. Sin conexión no pasa nada: se reintenta luego.

const STORAGE_KEY = 'mapamundi:sync';
const CODE = /^[A-Z0-9]{12}$/;
const PUSH_DELAY = 4000;
/** Por debajo de los 64 KiB que admite el navegador en las peticiones keepalive, con margen para otras en vuelo. */
const KEEPALIVE_BYTES = 60_000;

export type SyncStatus = 'off' | 'syncing' | 'ok' | 'offline';

interface SyncState {
  code: string | null;
  status: SyncStatus;
  /** Última sincronización correcta (ms), o null. */
  at: number | null;
}

export const useSync = create<SyncState>(() => ({ code: readCode(), status: 'off', at: null }));

function readCode(): string | null {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return code && CODE.test(code) ? code : null;
  } catch {
    return null;
  }
}

function saveCode(code: string | null) {
  try {
    if (code) localStorage.setItem(STORAGE_KEY, code);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sin almacenamiento (modo privado): la sincronización dura lo que dure la pestaña
  }
  useSync.setState({ code, status: code ? useSync.getState().status : 'off' });
}

/** «ABCD-EFGH-JKMN»: como se enseña y se dicta. */
export const formatCode = (code: string) => code.replace(/(.{4})(?=.)/g, '$1-');
const cleanCode = (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Enlace que, abierto en otro dispositivo, propone usar este código. */
export const syncLink = (code: string) => `${location.origin}${homeOf(lang)}?codigo=${formatCode(code)}`;

const local = () => {
  const { progress, bests, daily } = useProgress.getState();
  return { progress, bests, daily };
};

async function request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown, code?: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const text = body ? JSON.stringify(body) : undefined;
  // El código va en una cabecera, no en la dirección: así no queda en los registros del alojamiento.
  const res = await fetch('/api/sync', {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(code && method === 'GET' ? { 'X-Sync-Code': code } : {}) },
    body: text,
    // keepalive deja acabar la subida aunque se cierre la pestaña, pero el navegador rechaza esos
    // cuerpos si pasan de 64 KiB (contando los que ya estén en vuelo): solo con la pestaña oculta y si cabe.
    keepalive: method === 'PUT' && document.visibilityState === 'hidden' && new TextEncoder().encode(text).length < KEEPALIVE_BYTES,
  });
  return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
}

let timer: ReturnType<typeof setTimeout> | undefined;
let running = false;
let again = false;
/** Tras borrar el progreso, lo de este dispositivo sustituye a lo guardado en vez de mezclarse. */
let replaceRemote = false;
/**
 * Mezclar lo bajado cambia el progreso de este dispositivo, pero no es un cambio que haya que subir
 * después: lo sube la misma sincronización que lo ha bajado. Sin esta marca, cada sincronización
 * programaba la siguiente y no paraba nunca.
 */
let absorbing = false;

function absorb(data: unknown) {
  absorbing = true;
  try {
    useProgress.getState().absorb(data);
  } finally {
    absorbing = false;
  }
}

/** Baja lo guardado, lo mezcla con lo de este dispositivo y sube el resultado. */
export async function syncNow(): Promise<void> {
  const { code } = useSync.getState();
  if (!code) return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  useSync.setState({ status: 'syncing' });
  try {
    if (!replaceRemote) {
      const remote = await request('GET', undefined, code);
      if (remote.status === 404) {
        // El código ya no existe (caducó tras un año sin uso): se deja de sincronizar.
        saveCode(null);
        return;
      }
      if (remote.status !== 200) throw new Error('lectura');
      absorb(remote.body.data);
    }
    const saved = await request('PUT', { code, data: local() });
    if (saved.status !== 200) throw new Error('escritura');
    replaceRemote = false;
    useSync.setState({ status: 'ok', at: Date.now() });
  } catch {
    useSync.setState({ status: 'offline' });
  } finally {
    running = false;
    if (again) {
      again = false;
      void syncNow();
    }
  }
}

/** Crea un código para el progreso de este dispositivo. Devuelve un mensaje de error, o null si va bien. */
export async function createCode(): Promise<string | null> {
  try {
    const res = await request('POST', { data: local() });
    if (res.status === 429) return t('Ahora mismo no se pueden crear más códigos. Prueba dentro de un rato.');
    if (res.status !== 201 || typeof res.body.code !== 'string') return t('No se ha podido crear el código. Comprueba la conexión.');
    saveCode(res.body.code);
    useSync.setState({ status: 'ok', at: Date.now() });
    return null;
  } catch {
    return t('No se ha podido crear el código. Comprueba la conexión.');
  }
}

/** Usa en este dispositivo un código creado en otro. Devuelve un mensaje de error, o null si va bien. */
export async function joinCode(raw: string): Promise<string | null> {
  const code = cleanCode(raw);
  if (!CODE.test(code)) return t('Ese código no es válido: son doce letras y cifras.');
  try {
    const remote = await request('GET', undefined, code);
    if (remote.status === 404) return t('No hay ningún progreso guardado con ese código.');
    if (remote.status !== 200) return t('No se ha podido leer ese código. Comprueba la conexión.');
    saveCode(code);
    absorb(remote.body.data);
    await syncNow();
    return null;
  } catch {
    return t('No se ha podido leer ese código. Comprueba la conexión.');
  }
}

/** Deja de sincronizar este dispositivo. Lo guardado con el código no se borra. */
export function leaveSync() {
  clearTimeout(timer);
  saveCode(null);
}

/** Borra del servidor lo guardado con el código y deja de sincronizar. El progreso de este dispositivo se queda. */
export async function deleteRemote(): Promise<string | null> {
  const { code } = useSync.getState();
  if (!code) return null;
  try {
    const res = await request('DELETE', { code });
    if (res.status !== 200) return t('No se ha podido borrar. Comprueba la conexión.');
    leaveSync();
    return null;
  } catch {
    return t('No se ha podido borrar. Comprueba la conexión.');
  }
}

let started = false;

/** Arranca la sincronización: se llama una vez, al abrir la web. */
export function initSync() {
  if (started) return;
  started = true;

  // Enlace con código (el de «Llevar a otro dispositivo»): se pregunta antes de usarlo.
  const params = new URLSearchParams(location.search);
  const offered = params.get('codigo');
  if (offered) {
    params.delete('codigo');
    history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
    const code = cleanCode(offered);
    if (CODE.test(code) && code !== useSync.getState().code && window.confirm(t('¿Usar en este dispositivo el progreso guardado con el código {code}?', { code: formatCode(code) }))) {
      void joinCode(code);
    }
  }

  // Cada cambio del progreso se sube unos segundos después (así una partida no hace una petición por respuesta).
  let size = Object.keys(useProgress.getState().progress).length;
  useProgress.subscribe((state, previous) => {
    if (!useSync.getState().code) return;
    if (state.progress === previous.progress && state.bests === previous.bests && state.daily === previous.daily) return;
    const now = Object.keys(state.progress).length;
    if (now < size) replaceRemote = true;
    size = now;
    if (absorbing) return;
    clearTimeout(timer);
    timer = setTimeout(() => void syncNow(), PUSH_DELAY);
  });
  // Al dejar la pestaña, lo pendiente se sube ya; al volver, se baja lo que haya cambiado en otro sitio.
  document.addEventListener('visibilitychange', () => {
    if (!useSync.getState().code) return;
    clearTimeout(timer);
    void syncNow();
  });
  void syncNow();
}
