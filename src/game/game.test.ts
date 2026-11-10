import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { REGION_FILTERS, resolveScope, SAMPLE_LIST, sanitizeConfig, showsTarget, type GameConfig } from './config';
import { mastery, record, sanitizeProgress, selectionWeight, summarize, type Progress } from './progress';
import { advance, attemptsLeft, createSession, currentQuestion, gradeLabel, missed, score, submit, type Session } from './session';
import { editDistance, hint, matchesAnswer, normalize } from './text';

const atlas = new Atlas(JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas);
const idx = (id: string) => atlas.indexOf(id);
const NOW = 1_800_000_000_000;

/** Generador pseudoaleatorio reproducible. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const start = (config: GameConfig, progress: Progress = {}, seed = 7, only?: number[]) =>
  createSession(atlas, config, resolveScope(atlas, config.scope, [SAMPLE_LIST]), progress, NOW, { rng: seeded(seed), only });

/** Responde bien a la pregunta actual, sea cual sea la forma de responder. */
function answerRight(session: Session): Session {
  const q = currentQuestion(session)!;
  const target = atlas.countries[q.country];
  const { mode, answer } = session.config;
  const verdict =
    answer === 'map'
      ? submit(atlas, session, { kind: 'country', index: q.country }, NOW)
      : answer === 'type'
        ? submit(atlas, session, { kind: 'text', text: mode === 'capital' ? target.capital! : target.name }, NOW)
        : submit(atlas, session, { kind: 'option', id: mode === 'continent' ? target.continents[0] : target.id }, NOW);
  expect(verdict.verdict).toBe('right');
  return verdict.session;
}

describe('texto', () => {
  it('normaliza tildes, mayúsculas, signos y artículos', () => {
    expect(normalize('  El  LÍBANO ')).toBe('libano');
    expect(normalize("Côte d'Ivoire")).toBe('cote d ivoire');
    expect(normalize('España')).toBe('espana');
    expect(normalize('Washington D. C.')).toBe('washington d c');
  });

  it('calcula la distancia de edición', () => {
    expect(editDistance('casa', 'casa')).toBe(0);
    expect(editDistance('casa', 'cosa')).toBe(1);
    expect(editDistance('gato', 'gatos')).toBe(1);
    expect(editDistance('abc', 'xyz', 1)).toBe(2);
  });

  it('perdona erratas pequeñas en respuestas largas', () => {
    expect(matchesAnswer('alemania', ['Alemania'])).toBe(true);
    expect(matchesAnswer('Alemnia', ['Alemania'])).toBe(true);
    expect(matchesAnswer('Kazajistan', ['Kazajistán'])).toBe(true);
    expect(matchesAnswer('Uzbequistán', ['Uzbekistán'])).toBe(true);
    expect(matchesAnswer('Francia', ['Alemania'])).toBe(false);
    expect(matchesAnswer('', ['Alemania'])).toBe(false);
  });

  it('exige exactitud en respuestas cortas', () => {
    expect(matchesAnswer('Irak', ['Irán'])).toBe(false);
    expect(matchesAnswer('Mali', ['Malí'])).toBe(true);
    expect(matchesAnswer('Peru', ['Perú'])).toBe(true);
    expect(matchesAnswer('Chad', ['Chile'])).toBe(false);
  });

  it('acepta los alias', () => {
    expect(matchesAnswer('EEUU', ['Estados Unidos', 'EE. UU.', 'EEUU'])).toBe(true);
    expect(matchesAnswer('ee. uu.', ['Estados Unidos', 'EE. UU.', 'EEUU'])).toBe(true);
    expect(matchesAnswer('Holanda', ['Países Bajos', 'Holanda'])).toBe(true);
  });

  it('no da por errata lo que es el nombre de otro país', () => {
    const otros = ['Austria', 'Eslovaquia', 'Níger', 'Kingston'];
    expect(matchesAnswer('Austria', ['Australia'], otros)).toBe(false);
    expect(matchesAnswer('Austrlia', ['Australia'], otros)).toBe(true);
    expect(matchesAnswer('Kingston', ['Kingstown'], otros)).toBe(false);
    expect(matchesAnswer('Eslovaquia', ['Eslovenia'], otros)).toBe(false);
  });

  it('da pistas letra a letra', () => {
    expect(hint('Francia', 1)).toBe('F _ _ _ _ _ _');
    expect(hint('Francia', 3)).toBe('F r a _ _ _ _');
    expect(hint('El Cairo', 2)).toBe('E l   _ _ _ _ _');
  });
});

describe('ámbitos y configuración', () => {
  it('cada región tiene los países que le corresponden', () => {
    const count = (id: string) => resolveScope(atlas, id, []).countries.length;
    expect(count('mundo')).toBe(197);
    expect(count('africa')).toBe(54);
    expect(count('america')).toBe(35);
    expect(count('america-nc')).toBe(23);
    expect(count('america-sur')).toBe(12);
    expect(count('oceania')).toBe(14);
    // Europa y Asia comparten los países transcontinentales
    expect(count('europa')).toBe(50);
    expect(count('asia')).toBe(50);
    for (const r of REGION_FILTERS) expect(count(r.id), r.id).toBeGreaterThan(0);
  });

  it('la lista de ejemplo se resuelve entera', () => {
    const scope = resolveScope(atlas, SAMPLE_LIST.id, [SAMPLE_LIST]);
    expect(scope.countries).toHaveLength(50);
    expect(scope.isList).toBe(true);
    expect(scope.countries).toContain(idx('TWN'));
  });

  it('un ámbito desconocido cae en todo el mundo', () => {
    expect(resolveScope(atlas, 'lista-borrada', []).id).toBe('mundo');
  });

  it('repara configuraciones guardadas no válidas', () => {
    expect(sanitizeConfig({ mode: 'locate', answer: 'type', scope: 'nada', length: 10 }, [])).toEqual({
      mode: 'locate',
      answer: 'map',
      scope: 'europa',
      length: 10,
    });
    expect(sanitizeConfig({ mode: 'continent', answer: 'guided', scope: SAMPLE_LIST.id, length: 'all' }, [SAMPLE_LIST])).toEqual({
      mode: 'continent',
      answer: 'guided',
      scope: SAMPLE_LIST.id,
      length: 'all',
    });
    expect(sanitizeConfig(undefined, []).mode).toBe('locate');
  });

  it('sabe cuándo se señala el país en el mapa', () => {
    expect(showsTarget({ mode: 'locate', answer: 'map' })).toBe(false);
    expect(showsTarget({ mode: 'name', answer: 'choice' })).toBe(true);
    expect(showsTarget({ mode: 'continent', answer: 'choice' })).toBe(false);
    expect(showsTarget({ mode: 'continent', answer: 'guided' })).toBe(true);
    expect(showsTarget({ mode: 'capital', answer: 'map' })).toBe(false);
    expect(showsTarget({ mode: 'capital', answer: 'type' })).toBe(true);
    expect(showsTarget({ mode: 'flag', answer: 'choice' })).toBe(false);
  });
});

describe('progreso', () => {
  it('sube de caja con los aciertos y vuelve a la primera con los fallos', () => {
    let p: Progress = {};
    p = record(p, 'ESP', 'locate', 'first', NOW);
    expect(p.ESP.locate).toMatchObject({ box: 3, seen: 1, right: 1 });
    p = record(p, 'ESP', 'locate', 'first', NOW);
    p = record(p, 'ESP', 'locate', 'first', NOW);
    p = record(p, 'ESP', 'locate', 'first', NOW);
    expect(p.ESP.locate!.box).toBe(5);
    expect(mastery(p.ESP.locate)).toBe(4);
    p = record(p, 'ESP', 'locate', 'later', NOW);
    expect(p.ESP.locate!.box).toBe(4);
    p = record(p, 'ESP', 'locate', 'failed', NOW);
    expect(p.ESP.locate).toMatchObject({ box: 1, seen: 6, right: 4 });
    expect(mastery(p.ESP.locate)).toBe(1);
    // cada reto lleva su cuenta
    expect(p.ESP.capital).toBeUndefined();
    expect(mastery(undefined)).toBe(0);
  });

  it('no modifica el progreso anterior', () => {
    const before: Progress = {};
    const after = record(before, 'FRA', 'name', 'failed', NOW);
    expect(before).toEqual({});
    expect(after.FRA.name!.box).toBe(1);
  });

  it('da más peso a lo que peor se sabe y a lo olvidado', () => {
    const p = record(record({}, 'A', 'locate', 'failed', NOW), 'B', 'locate', 'first', NOW);
    const fallado = selectionWeight(p, 'A', 'locate', NOW);
    const nuevo = selectionWeight(p, 'C', 'locate', NOW);
    const sabido = selectionWeight(p, 'B', 'locate', NOW);
    expect(fallado).toBeGreaterThan(nuevo);
    expect(nuevo).toBeGreaterThan(sabido);
    expect(selectionWeight(p, 'B', 'locate', NOW + 30 * 86_400_000)).toBeGreaterThan(sabido);
  });

  it('resume el dominio de un grupo de países', () => {
    let p: Progress = {};
    for (let i = 0; i < 4; i++) p = record(p, 'ESP', 'locate', 'first', NOW);
    p = record(p, 'FRA', 'locate', 'failed', NOW);
    const s = summarize(p, ['ESP', 'FRA', 'ITA', 'PRT'], 'locate');
    expect(s).toMatchObject({ total: 4, seen: 2, mastered: 1, levels: [2, 1, 0, 0, 1] });
    expect(s.ratio).toBeCloseTo((5 + 1) / 20);
  });

  it('descarta el progreso guardado que no tenga la forma esperada', () => {
    const ok = record({}, 'ESP', 'locate', 'first', NOW);
    expect(sanitizeProgress(ok)).toEqual(ok);
    expect(sanitizeProgress(null)).toEqual({});
    expect(sanitizeProgress('basura')).toEqual({});
    const raw = {
      ESP: { locate: { box: 9, seen: 2, right: 1, last: NOW }, borrado: { box: 1, seen: 1, right: 0, last: NOW } },
      FRA: { name: { box: '3', seen: 1, right: 1, last: NOW } },
      xx: { locate: { box: 1, seen: 1, right: 0, last: NOW } },
    };
    expect(sanitizeProgress(raw)).toEqual({ ESP: { locate: { box: 5, seen: 2, right: 1, last: NOW } } });
  });
});

describe('partida', () => {
  const locate: GameConfig = { mode: 'locate', answer: 'map', scope: 'europa', length: 10 };

  it('prepara tantas preguntas como se piden, sin repetir país y dentro del ámbito', () => {
    const s = start(locate);
    expect(s.total).toBe(10);
    expect(s.queue).toHaveLength(10);
    const countries = s.queue.map((q) => q.country);
    expect(new Set(countries).size).toBe(10);
    for (const c of countries) expect(atlas.countries[c].regions).toContain('europa');
    expect(start({ ...locate, length: 'all' }).total).toBe(50);
    expect(start({ ...locate, scope: 'america-sur', length: 20 }).total).toBe(12);
  });

  it('prioriza los países que peor se saben', () => {
    // España fallada; el resto de Europa, dominado: casi siempre debe salir España.
    let p: Progress = {};
    for (const i of resolveScope(atlas, 'europa', []).countries) {
      const id = atlas.countries[i].id;
      if (id === 'ESP') p = record(p, id, 'locate', 'failed', NOW);
      else for (let k = 0; k < 4; k++) p = record(p, id, 'locate', 'first', NOW);
    }
    let withSpain = 0;
    for (let seed = 0; seed < 200; seed++) {
      if (start(locate, p, seed).queue.some((q) => q.country === idx('ESP'))) withSpain++;
    }
    // sin ponderar saldría en 10 de cada 50 partidas (40 de 200)
    expect(withSpain).toBeGreaterThan(130);
  });

  it('acierto a la primera: marca, racha y avance', () => {
    let s = start(locate);
    const first = s.queue[0].country;
    s = answerRight(s);
    expect(s.status).toBe('resolved');
    expect(s.outcome).toBe('first');
    expect(s.marks[first]).toBe('first');
    expect(s.streak).toBe(1);
    expect(s.answered).toBe(1);
    s = advance(s, NOW + 1000);
    expect(s.status).toBe('asking');
    expect(s.queue).toHaveLength(9);
    expect(s.wrong).toEqual([]);
  });

  it('en el mapa da tres intentos y luego la solución', () => {
    let s = start(locate);
    const target = s.queue[0].country;
    const others = s.pool.filter((i) => i !== target);
    expect(attemptsLeft(s)).toBe(3);

    let v = submit(atlas, s, { kind: 'country', index: others[0] }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: false });
    expect(attemptsLeft(v.session)).toBe(2);

    // repetir el mismo fallo no gasta intento
    expect(submit(atlas, v.session, { kind: 'country', index: others[0] }, NOW).verdict).toBe('ignored');
    // un país de fuera del cuestionario tampoco cuenta
    expect(submit(atlas, v.session, { kind: 'country', index: idx('BRA') }, NOW).verdict).toBe('ignored');
    // ni un territorio
    expect(submit(atlas, v.session, { kind: 'country', index: idx('GRL') }, NOW).verdict).toBe('ignored');

    v = submit(atlas, v.session, { kind: 'country', index: others[1] }, NOW);
    v = submit(atlas, v.session, { kind: 'country', index: others[2] }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: true });
    s = v.session;
    expect(s.outcome).toBe('failed');
    expect(s.marks[target]).toBe('failed');
    expect(s.streak).toBe(0);
    // ya resuelta, no admite más respuestas
    expect(submit(atlas, s, { kind: 'country', index: target }, NOW).verdict).toBe('ignored');
  });

  it('acertar tras un fallo cuenta como «con ayuda»', () => {
    let s = start(locate);
    const target = s.queue[0].country;
    s = submit(atlas, s, { kind: 'country', index: s.pool.find((i) => i !== target)! }, NOW).session;
    const v = submit(atlas, s, { kind: 'country', index: target }, NOW);
    expect(v).toMatchObject({ verdict: 'right', resolved: true });
    expect(v.session.outcome).toBe('later');
    expect(v.session.results[0].attempts).toBe(2);
  });

  it('un país no acertado a la primera vuelve como repaso tres preguntas después', () => {
    let s = start(locate);
    const target = s.queue[0].country;
    s = submit(atlas, s, { kind: 'giveUp' }, NOW).session;
    expect(s.outcome).toBe('failed');
    expect(s.queue).toHaveLength(11);
    expect(s.queue[4]).toMatchObject({ country: target, review: true });
    expect(s.total).toBe(10);

    // tres preguntas más y reaparece
    for (let i = 0; i < 3; i++) s = answerRight(advance(s, NOW));
    s = advance(s, NOW);
    expect(currentQuestion(s)).toMatchObject({ country: target, review: true });
    const answeredBefore = s.answered;
    s = answerRight(s);
    // el repaso no puntúa, pero mejora la marca en el mapa
    expect(s.answered).toBe(answeredBefore);
    expect(s.marks[target]).toBe('later');
    // y no se vuelve a encolar
    expect(s.queue.filter((q) => q.country === target)).toHaveLength(1);
  });

  it('termina y puntúa: a la primera vale 1, con ayuda medio', () => {
    let s = start({ ...locate, scope: 'america-sur', length: 'all' });
    // primera: fallo y luego acierto; segunda: rendirse; el resto, a la primera
    const t0 = s.queue[0].country;
    s = submit(atlas, s, { kind: 'country', index: s.pool.find((i) => i !== t0)! }, NOW).session;
    s = answerRight(s);
    s = advance(s, NOW);
    s = submit(atlas, s, { kind: 'giveUp' }, NOW).session;
    s = advance(s, NOW);
    while (s.status !== 'finished') {
      s = answerRight(s);
      s = advance(s, NOW + 60_000);
    }
    const sc = score(s);
    expect(sc).toMatchObject({ total: 12, first: 10, later: 1, failed: 1 });
    expect(sc.grade).toBeCloseTo((10.5 / 12) * 10);
    expect(sc.ms).toBe(60_000);
    expect(missed(s)).toHaveLength(2);
    // 12 preguntas + 2 repasos
    expect(s.results).toHaveLength(14);
    expect(currentQuestion(s)).toBeNull();
  });

  it('las opciones incluyen la respuesta y tres vecinos distintos', () => {
    const s = start({ mode: 'name', answer: 'choice', scope: 'africa', length: 20 });
    for (const q of s.queue) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(q.options.some((o) => o.country === q.country)).toBe(true);
      for (const o of q.options) expect(atlas.countries[o.country].regions).toContain('africa');
    }
    const caps = start({ mode: 'capital', answer: 'choice', scope: 'europa', length: 10 });
    const q = caps.queue[0];
    expect(q.options.find((o) => o.country === q.country)!.label).toBe(atlas.countries[q.country].capital);
  });

  it('con opciones da dos intentos', () => {
    let s = start({ mode: 'name', answer: 'choice', scope: 'africa', length: 10 });
    const q = s.queue[0];
    const wrong = q.options.filter((o) => o.country !== q.country);
    let v = submit(atlas, s, { kind: 'option', id: wrong[0].id }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: false });
    v = submit(atlas, v.session, { kind: 'option', id: wrong[1].id }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: true });
    expect(v.session.outcome).toBe('failed');
    s = start({ mode: 'name', answer: 'choice', scope: 'africa', length: 10 });
    // pulsar en el mapa no vale cuando se responde con opciones
    expect(submit(atlas, s, { kind: 'country', index: q.country }, NOW).verdict).toBe('ignored');
  });

  it('continentes: mismas opciones siempre y reglas de los países repartidos', () => {
    const config: GameConfig = { mode: 'continent', answer: 'choice', scope: SAMPLE_LIST.id, length: 'all' };
    const ask = (id: string, option: string) => {
      const s = start(config, {}, 3, [idx(id)]);
      expect(s.queue[0].options.map((o) => o.label)).toEqual(['Europa', 'Asia', 'África', 'América', 'Oceanía', 'Europa y Asia']);
      return submit(atlas, s, { kind: 'option', id: option }, NOW).verdict;
    };
    expect(start(config).total).toBe(50);
    expect(ask('SAU', 'asia')).toBe('right');
    expect(ask('SAU', 'africa')).toBe('wrong');
    expect(ask('ARE', 'asia')).toBe('right');
    expect(ask('ISR', 'asia')).toBe('right');
    expect(ask('EGY', 'africa')).toBe('right');
    expect(ask('MEX', 'america')).toBe('right');
    expect(ask('NZL', 'oceania')).toBe('right');
    expect(ask('TWN', 'asia')).toBe('right');
    // Rusia y Turquía están en los dos: uno solo no basta
    expect(ask('RUS', 'europa-asia')).toBe('right');
    expect(ask('RUS', 'europa')).toBe('wrong');
    expect(ask('TUR', 'europa-asia')).toBe('right');
    expect(ask('TUR', 'asia')).toBe('wrong');
  });

  it('escribiendo acepta alias y erratas, y da tres intentos', () => {
    const config: GameConfig = { mode: 'name', answer: 'type', scope: 'mundo', length: 10 };
    const typed = (id: string, text: string) => submit(atlas, start(config, {}, 1, [idx(id)]), { kind: 'text', text }, NOW).verdict;
    expect(typed('USA', 'eeuu')).toBe('right');
    expect(typed('NLD', 'Holanda')).toBe('right');
    expect(typed('AUS', 'Austria')).toBe('wrong');
    expect(typed('AUS', 'Austrlia')).toBe('right');
    expect(typed('COD', 'Congo')).toBe('wrong');
    expect(typed('COD', 'RD Congo')).toBe('right');
    expect(typed('ESP', '   ')).toBe('ignored');

    const capitals: GameConfig = { mode: 'capital', answer: 'type', scope: 'mundo', length: 10 };
    const cap = (id: string, text: string) => submit(atlas, start(capitals, {}, 1, [idx(id)]), { kind: 'text', text }, NOW).verdict;
    expect(cap('FRA', 'paris')).toBe('right');
    expect(cap('VCT', 'Kingston')).toBe('wrong'); // es la de Jamaica
    expect(cap('VCT', 'Kingstown')).toBe('right');
    expect(cap('GNQ', 'Malabo')).toBe('right');
    expect(cap('BOL', 'La Paz')).toBe('right');

    let s = start(config, {}, 1, [idx('ESP')]);
    for (let i = 0; i < 2; i++) s = submit(atlas, s, { kind: 'text', text: 'Portugal' }, NOW).session;
    expect(s.status).toBe('asking');
    s = submit(atlas, s, { kind: 'text', text: 'Francia' }, NOW).session;
    expect(s.outcome).toBe('failed');
  });

  it('repasar fallos pregunta solo esos países', () => {
    const only = [idx('ESP'), idx('ITA'), idx('GRC')];
    const s = start(locate, {}, 5, only);
    expect(s.total).toBe(3);
    expect(s.queue.map((q) => q.country).sort()).toEqual([...only].sort());
    // pero se puede fallar pulsando cualquier país del ámbito
    expect(s.pool.length).toBe(50);
  });

  it('pone nota como en el colegio', () => {
    expect(gradeLabel(10)).toBe('Sobresaliente');
    expect(gradeLabel(9)).toBe('Sobresaliente');
    expect(gradeLabel(7.5)).toBe('Notable');
    expect(gradeLabel(6)).toBe('Bien');
    expect(gradeLabel(5)).toBe('Suficiente');
    expect(gradeLabel(4.9)).toBe('A repasar');
  });
});

describe('respuestas escritas en otras escrituras', () => {
  it('compara nombres en chino tal cual y acepta el nombre en alfabeto latino como alias', () => {
    expect(matchesAnswer('北京', ['北京', 'Beijing'])).toBe(true);
    expect(matchesAnswer(' beijing ', ['北京', 'Beijing'])).toBe(true);
    expect(matchesAnswer('东京', ['北京', 'Beijing'])).toBe(false);
  });

  it('sigue ignorando tildes y signos en alfabeto latino', () => {
    expect(matchesAnswer('sao tome', ['São Tomé'])).toBe(true);
    expect(matchesAnswer("n'djamena", ['N’Djamena'])).toBe(true);
  });
});

describe('reto de climas', () => {
  it('ofrece cuatro climas, uno solo de los cuales es del país, y acepta cualquiera de los suyos', () => {
    let session = start({ mode: 'climate', answer: 'choice', scope: 'mundo', length: 'all' });
    for (let i = 0; i < 40; i++) {
      const q = currentQuestion(session)!;
      const own = atlas.countries[q.country].climate;
      expect(q.options).toHaveLength(4);
      expect(q.options.filter((o) => own.includes(o.id as (typeof own)[number]))).toHaveLength(1);
      const verdict = submit(atlas, session, { kind: 'option', id: own[0] }, NOW);
      expect(verdict.verdict).toBe('right');
      session = advance(verdict.session, NOW);
    }
  });

  it('un clima que el país no tiene cuenta como fallo', () => {
    const session = start({ mode: 'climate', answer: 'choice', scope: 'europa', length: 10 });
    const q = currentQuestion(session)!;
    const wrong = q.options.find((o) => !atlas.countries[q.country].climate.includes(o.id as never))!;
    expect(submit(atlas, session, { kind: 'option', id: wrong.id }, NOW).verdict).toBe('wrong');
  });
});
