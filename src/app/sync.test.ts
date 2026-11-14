import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { record, type Progress } from '../game/progress';
import { useProgress } from './store';
import { syncNow, useSync } from './sync';

/** Unos 90 KB de progreso: el de alguien que ha jugado mucho. */
function bigProgress(): Progress {
  let p: Progress = {};
  for (let i = 0; i < 500; i++) {
    const id = String.fromCharCode(65 + Math.floor(i / 676), 65 + (Math.floor(i / 26) % 26), 65 + (i % 26));
    for (const mode of ['locate', 'capital', 'flag'] as const) p = record(p, id, mode, 'first', 1_800_000_000_000);
  }
  return p;
}

describe('subida de la sincronización', () => {
  const puts: RequestInit[] = [];

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init: RequestInit) => {
        if (init.method === 'PUT') puts.push(init);
        return { status: 200, json: async () => ({}) };
      }),
    );
    useSync.setState({ code: 'ABCDEFGHJKMN' });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    puts.length = 0;
  });

  async function put(visibility: 'visible' | 'hidden', progress: Progress): Promise<RequestInit> {
    vi.stubGlobal('document', { visibilityState: visibility });
    useProgress.setState({ progress, bests: {}, daily: null });
    await syncNow();
    return puts.at(-1)!;
  }

  it('solo usa keepalive con la pestaña oculta y si el cuerpo cabe en los 64 KiB que admite el navegador', async () => {
    const big = bigProgress();
    expect((await put('visible', big)).keepalive).toBe(false);
    expect((await put('hidden', record({}, 'ESP', 'locate', 'first', 1))).keepalive).toBe(true);
    const tooBig = await put('hidden', big);
    expect(new TextEncoder().encode(tooBig.body as string).length).toBeGreaterThan(65_536);
    expect(tooBig.keepalive).toBe(false);
  });
});
