import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { DEFAULT_CONFIG } from '../game/config';
import { dailyConfig } from '../game/daily';
import { missed } from '../game/session';
import { rankingOf } from './ranking';
import { useApp, useProgress, useSettings } from './store';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);
const app = useApp.getState;

/** Juega la partida en curso rindiéndose en cada pregunta, hasta los resultados. */
function giveUpAll() {
  while (app().screen === 'play') {
    app().answer({ kind: 'giveUp' });
    app().next();
  }
}

describe('repasar fallos', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSettings.setState({ config: DEFAULT_CONFIG });
    useApp.setState({ atlas, screen: 'home', session: null, daily: null, reviewOnly: false });
  });
  afterEach(() => vi.useRealTimers());

  // El 14 toca el reto de climas y el 15 el de localizar: con la configuración de serie (Europa,
  // localizar), el repaso preguntaba otro reto en otra zona, o nada y la pantalla quedaba vacía.
  it.each(['2026-11-14', '2026-11-15'])('tras el reto del día (%s) repasa ese reto y esa zona, sin contar como reto del día', (key) => {
    vi.setSystemTime(new Date(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10), 12));
    app().startDaily();
    giveUpAll();
    const daily = app().session!;
    const record = useProgress.getState().daily;
    const toReview = missed(daily);
    expect(toReview).toHaveLength(10);

    app().start(toReview);
    const review = app().session!;
    expect(app().screen).toBe('play');
    expect(review.config).toEqual(dailyConfig(key));
    expect(review.scopeLabel).toBe(daily.scopeLabel);
    expect(review.total).toBe(10);
    expect(review.queue.map((q) => q.country).sort()).toEqual([...toReview].sort());
    expect(app().daily).toBeNull();
    expect(app().reviewOnly).toBe(true);
    // Lo elegido en la portada no cambia.
    expect(useSettings.getState().config).toEqual(DEFAULT_CONFIG);

    giveUpAll();
    expect(app().screen).toBe('results');
    expect(useProgress.getState().daily).toBe(record);
    expect(app().newBest).toBe(false);
    expect(rankingOf(app().session!.config, { daily: app().daily, review: app().reviewOnly, lists: [] })).toBeNull();
  });

  it('tras una partida normal repasa la misma partida', () => {
    app().start();
    giveUpAll();
    const played = app().session!;
    app().start(missed(played));
    expect(app().session!.config).toEqual(played.config);
    expect(app().session!.total).toBe(missed(played).length);
    expect(app().reviewOnly).toBe(true);
  });

  it('una partida sin preguntas no se empieza', () => {
    app().start();
    giveUpAll();
    const played = app().session;
    app().start([]);
    expect(app().screen).toBe('results');
    expect(app().session).toBe(played);
  });
});
