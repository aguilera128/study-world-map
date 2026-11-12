import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Atlas, withBackdrop } from '../atlas/atlas';
import type { RawAtlas } from '../atlas/types';
import { modesOf, REGION_FILTERS, resolveScope, SAMPLE_LIST, sanitizeConfig, showsTarget, type GameConfig } from './config';
import { COUNTRY_IDS, COUNTRY_MAPS } from './countryMaps';
import { dailyConfig } from './daily';
import { MAPS } from './maps';
import { mastery, record, sanitizeProgress, selectionWeight, summarize, type Progress } from './progress';
import { advance, attemptsLeft, createSession, currentQuestion, gradeLabel, missed, score, submit, type Session } from './session';
import { editDistance, hint, matchesAnswer, normalize } from './text';
import { LANGS } from '../i18n';

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
    // (Lo guardado por una versión anterior no dice de qué mapa es: es del mundo.)
    expect(sanitizeConfig({ mode: 'locate', answer: 'type', scope: 'nada', length: 10 }, [])).toEqual({
      map: 'world',
      mode: 'locate',
      answer: 'map',
      scope: 'europa',
      length: 10,
    });
    expect(sanitizeConfig({ map: 'world', mode: 'continent', answer: 'guided', scope: SAMPLE_LIST.id, length: 'all' }, [SAMPLE_LIST])).toEqual({
      map: 'world',
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
  const locate: GameConfig = { map: 'world', mode: 'locate', answer: 'map', scope: 'europa', length: 10 };

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
    const s = start({ map: 'world', mode: 'name', answer: 'choice', scope: 'africa', length: 20 });
    for (const q of s.queue) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(q.options.some((o) => o.country === q.country)).toBe(true);
      for (const o of q.options) expect(atlas.countries[o.country].regions).toContain('africa');
    }
    const caps = start({ map: 'world', mode: 'capital', answer: 'choice', scope: 'europa', length: 10 });
    const q = caps.queue[0];
    expect(q.options.find((o) => o.country === q.country)!.label).toBe(atlas.countries[q.country].capital);
  });

  it('con opciones da dos intentos', () => {
    let s = start({ map: 'world', mode: 'name', answer: 'choice', scope: 'africa', length: 10 });
    const q = s.queue[0];
    const wrong = q.options.filter((o) => o.country !== q.country);
    let v = submit(atlas, s, { kind: 'option', id: wrong[0].id }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: false });
    v = submit(atlas, v.session, { kind: 'option', id: wrong[1].id }, NOW);
    expect(v).toMatchObject({ verdict: 'wrong', resolved: true });
    expect(v.session.outcome).toBe('failed');
    s = start({ map: 'world', mode: 'name', answer: 'choice', scope: 'africa', length: 10 });
    // pulsar en el mapa no vale cuando se responde con opciones
    expect(submit(atlas, s, { kind: 'country', index: q.country }, NOW).verdict).toBe('ignored');
  });

  it('continentes: mismas opciones siempre y reglas de los países repartidos', () => {
    const config: GameConfig = { map: 'world', mode: 'continent', answer: 'choice', scope: SAMPLE_LIST.id, length: 'all' };
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
    const config: GameConfig = { map: 'world', mode: 'name', answer: 'type', scope: 'mundo', length: 10 };
    const typed = (id: string, text: string) => submit(atlas, start(config, {}, 1, [idx(id)]), { kind: 'text', text }, NOW).verdict;
    expect(typed('USA', 'eeuu')).toBe('right');
    expect(typed('NLD', 'Holanda')).toBe('right');
    expect(typed('AUS', 'Austria')).toBe('wrong');
    expect(typed('AUS', 'Austrlia')).toBe('right');
    expect(typed('COD', 'Congo')).toBe('wrong');
    expect(typed('COD', 'RD Congo')).toBe('right');
    expect(typed('ESP', '   ')).toBe('ignored');

    const capitals: GameConfig = { map: 'world', mode: 'capital', answer: 'type', scope: 'mundo', length: 10 };
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
    let session = start({ map: 'world', mode: 'climate', answer: 'choice', scope: 'mundo', length: 'all' });
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
    const session = start({ map: 'world', mode: 'climate', answer: 'choice', scope: 'europa', length: 10 });
    const q = currentQuestion(session)!;
    const wrong = q.options.find((o) => !atlas.countries[q.country].climate.includes(o.id as never))!;
    expect(submit(atlas, session, { kind: 'option', id: wrong.id }, NOW).verdict).toBe('wrong');
  });
});

// España por provincias: otro atlas con el mismo formato (scripts/build-maps.mjs).
describe('mapa de España', () => {
  const spain = new Atlas(JSON.parse(readFileSync('public/data/es/atlas.json', 'utf8')) as RawAtlas, 'es');
  const at = (id: string) => spain.indexOf(id);
  const play = (config: GameConfig, seed = 7) => createSession(spain, config, resolveScope(spain, config.scope, [SAMPLE_LIST]), {}, NOW, { rng: seeded(seed) });

  it('ofrece localizar, comunidades, nombrar y capitales, y no banderas, continentes ni climas', () => {
    expect(modesOf('es').map((m) => m.id)).toEqual(['locate', 'region', 'name', 'capital']);
    expect(modesOf('world').map((m) => m.id)).not.toContain('region');
    for (const m of modesOf('es')) expect(m.title && m.summary, m.id).toBeTruthy();
  });

  it('el reto del día sigue saliendo de los retos del mundo', () => {
    for (let day = 1; day <= 28; day++) {
      const config = dailyConfig(`2026-02-${String(day).padStart(2, '0')}`);
      expect(config.map).toBe('world');
      expect(MAPS.world.modes).toContain(config.mode);
    }
  });

  it('las zonas agrupan las comunidades y no dejan ninguna provincia fuera', () => {
    const count = (id: string) => resolveScope(spain, id, []).countries.length;
    expect(count('es')).toBe(52);
    expect(count('es-norte')).toBe(11);
    expect(count('es-centro')).toBe(17);
    expect(count('es-este')).toBe(12);
    expect(count('es-sur')).toBe(12);
    expect(count('es-an')).toBe(8);
    expect(count('es-cl')).toBe(9);
    expect(resolveScope(spain, 'es-an', []).label).toBe('Andalucía');
    for (const f of MAPS.es.filters) for (const key of f.keys) expect(spain.regions[key], `${f.id}: ${key}`).toBeTruthy();
    // Las cuatro agrupaciones cubren todas las comunidades, sin repetir.
    const grouped = MAPS.es.filters.slice(1, 5).flatMap((f) => f.keys);
    expect([...grouped].sort()).toEqual(Object.keys(spain.regions).sort());
    // Todas se encuadran en su zona; el mapa entero, en España.
    for (const f of MAPS.es.filters) expect(resolveScope(spain, f.id, []).frame, f.id).not.toBeNull();
    expect(resolveScope(spain, 'es', []).frame).toEqual(spain.frame);
  });

  it('una zona o una lista del mundo no valen aquí, ni al revés', () => {
    expect(resolveScope(spain, 'europa', []).id).toBe('es');
    expect(resolveScope(spain, SAMPLE_LIST.id, [SAMPLE_LIST]).isList).toBe(false);
    expect(resolveScope(atlas, 'es-norte', []).id).toBe('mundo');
    expect(sanitizeConfig({ map: 'es', mode: 'flag', answer: 'map', scope: 'europa', length: 20 }, [SAMPLE_LIST])).toEqual({
      map: 'es',
      mode: 'locate',
      answer: 'map',
      scope: 'es',
      length: 20,
    });
    // Al volver al mundo, el reto de comunidades y la zona de España dejan de valer.
    expect(sanitizeConfig({ map: 'world', mode: 'region', answer: 'choice', scope: 'es-norte', length: 10 }, [])).toEqual({
      map: 'world',
      mode: 'locate',
      answer: 'map',
      scope: 'europa',
      length: 10,
    });
  });

  it('reto de comunidades: cuatro opciones, solo una es la suya, y se acierta con ella', () => {
    let session = play({ map: 'es', mode: 'region', answer: 'choice', scope: 'es', length: 'all' });
    expect(session.total).toBe(52);
    for (let i = 0; i < 52; i++) {
      const q = currentQuestion(session)!;
      const own = spain.countries[q.country].regions[0];
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(4);
      expect(q.options.filter((o) => o.id === own)).toHaveLength(1);
      for (const o of q.options) expect(o.label).toBe(spain.regions[o.id].name);
      const verdict = submit(spain, session, { kind: 'option', id: own }, NOW);
      expect(verdict.verdict).toBe('right');
      session = advance(verdict.session, NOW);
    }
    expect(session.status).toBe('finished');
    expect(score(session).grade).toBe(10);
  });

  it('reto de comunidades: otra comunidad cuenta como fallo y a la segunda da la solución', () => {
    const session = play({ map: 'es', mode: 'region', answer: 'guided', scope: 'es-norte', length: 10 });
    const q = currentQuestion(session)!;
    const [a, b] = q.options.filter((o) => o.id !== spain.countries[q.country].regions[0]);
    const first = submit(spain, session, { kind: 'option', id: a.id }, NOW);
    expect(first.verdict).toBe('wrong');
    expect(first.resolved).toBe(false);
    const second = submit(spain, first.session, { kind: 'option', id: b.id }, NOW);
    expect(second.resolved).toBe(true);
    expect(second.session.outcome).toBe('failed');
    // Una comunidad que no está entre las opciones no cuenta.
    expect(submit(spain, session, { kind: 'option', id: 'ES-XX' }, NOW).verdict).toBe('ignored');
    expect(showsTarget({ mode: 'region', answer: 'guided' })).toBe(true);
    expect(showsTarget({ mode: 'region', answer: 'choice' })).toBe(false);
  });

  it('localizar y capitales funcionan con provincias', () => {
    let session = play({ map: 'es', mode: 'locate', answer: 'map', scope: 'es-sur', length: 'all' });
    expect(session.pool).toContain(at('ES-CE'));
    expect(session.pool).toContain(at('ES-TF'));
    // Pulsar una provincia de otra zona (o un país de alrededor) no penaliza.
    expect(submit(spain, session, { kind: 'country', index: at('ES-M') }, NOW).verdict).toBe('ignored');
    expect(submit(spain, session, { kind: 'country', index: at('PRT') }, NOW).verdict).toBe('ignored');
    session = submit(spain, session, { kind: 'country', index: currentQuestion(session)!.country }, NOW).session;
    expect(session.outcome).toBe('first');

    const capitals = play({ map: 'es', mode: 'capital', answer: 'type', scope: 'es', length: 'all' });
    const ask = (id: string, text: string) => {
      const s = { ...capitals, queue: [{ country: at(id), review: false, options: [] }] };
      return submit(spain, s, { kind: 'text', text }, NOW).verdict;
    };
    expect(ask('ES-VI', 'Vitoria')).toBe('right');
    expect(ask('ES-VI', 'vitoria-gasteiz')).toBe('right');
    expect(ask('ES-O', 'Oviedo')).toBe('right');
    expect(ask('ES-GC', 'Las Palmas de Gran Canaria')).toBe('right');
    expect(ask('ES-L', 'Lleida')).toBe('right');
    expect(ask('ES-O', 'Gijón')).toBe('wrong');
    expect(ask('ES-BA', 'Cáceres')).toBe('wrong');
  });

  it('el progreso de las provincias se guarda con su propio código y no se mezcla con el de los países', () => {
    let progress: Progress = record({}, 'ESP', 'locate', 'first', NOW);
    progress = record(progress, 'ES-A', 'locate', 'failed', NOW);
    progress = record(progress, 'ES-CE', 'region', 'first', NOW);
    expect(sanitizeProgress(JSON.parse(JSON.stringify(progress)))).toEqual(progress);
    const ids = (a: Atlas) => a.quizzable.map((i) => a.countries[i].id);
    expect(ids(spain).filter((id) => ids(atlas).includes(id))).toEqual([]);
    expect(summarize(progress, ids(atlas), 'locate').seen).toBe(1);
    expect(summarize(progress, ids(spain), 'locate').seen).toBe(1);
    expect(summarize(progress, ids(spain), 'region').mastered).toBe(0);
    expect(summarize(progress, ids(spain), 'region').seen).toBe(1);
  });
});

// Los mapas de un país salen todos del mismo molde (./countryMaps.ts y scripts/build-maps.mjs): lo
// que se comprueba aquí vale para cualquiera que se añada.
describe('mapas de un país', () => {
  for (const id of COUNTRY_IDS) {
    const country = new Atlas(JSON.parse(readFileSync(`public/data/${id}/atlas.json`, 'utf8')) as RawAtlas, id);
    const asked = country.quizzable.map((i) => country.countries[i]);

    it(`${id}: sus zonas existen en el atlas, se encuadran y dan para una partida`, () => {
      expect(MAPS[id].filters[0].id).toBe(id);
      // Su código es el de un país del atlas del mundo: de ahí sale a quién se le ofrece su mapa.
      expect(atlas.indexOf(COUNTRY_MAPS[id].iso), COUNTRY_MAPS[id].iso).toBeGreaterThanOrEqual(0);
      for (const f of MAPS[id].filters) {
        for (const key of f.keys) expect(country.regions[key], `${f.id}: ${key}`).toBeTruthy();
        const scope = resolveScope(country, f.id, []);
        expect(scope.frame, f.id).not.toBeNull();
        expect(scope.label, f.id).toBeTruthy();
        expect(scope.countries.length, f.id).toBeGreaterThanOrEqual(4);
      }
    });

    it(`${id}: cada reto tiene título y resumen, y la región solo se pregunta si hay regiones`, () => {
      for (const m of modesOf(id)) expect(m.title && m.summary, m.id).toBeTruthy();
      const grouped = Object.keys(country.regions).length > 0;
      expect(MAPS[id].modes.includes('region')).toBe(grouped);
      expect(!!MAPS[id].text.askRegion).toBe(grouped);
      for (const c of asked) expect(c.regions.length, c.id).toBe(grouped ? 1 : 0);
    });

    it(`${id}: lo que se pregunta tiene capital, un encuadre que no da la vuelta al mundo y vecinas que también se preguntan`, () => {
      for (const c of asked) {
        expect(c.capital, c.id).toBeTruthy();
        expect(c.frame[2] - c.frame[0], c.id).toBeLessThan(180);
        for (const n of c.neighbors) expect(country.countries[n].kind, c.id).toBe('country');
      }
      const [w, , e] = country.frame!;
      expect(e - w).toBeLessThan(180);
    });

    it(`${id}: todo tiene nombre en cada idioma`, () => {
      for (const lang of Object.keys(LANGS).filter((l) => l !== 'es')) {
        const names = JSON.parse(readFileSync(`public/data/${id}/names.${lang}.json`, 'utf8'));
        for (const c of asked) {
          expect(names.countries[c.id]?.n, `${lang} ${c.id}`).toBeTruthy();
          expect(names.countries[c.id]?.c, `${lang} ${c.id}`).toBeTruthy();
        }
        for (const key of Object.keys(country.regions)) expect(names.regions[key], `${lang} ${key}`).toBeTruthy();
      }
    });
  }

  it('un país sin agrupaciones (Alemania) se juega igual, sin el reto de la región', () => {
    const germany = new Atlas(JSON.parse(readFileSync('public/data/de/atlas.json', 'utf8')) as RawAtlas, 'de');
    expect(modesOf('de').map((m) => m.id)).toEqual(['locate', 'name', 'capital']);
    expect(resolveScope(germany, 'de', []).countries.length).toBe(16);
    expect(germany.byIdOrThrow('DE-BY').capital).toBe('Múnich');
    expect(sanitizeConfig({ map: 'de', mode: 'region', answer: 'choice', scope: 'de', length: 10 }, []).mode).toBe('locate');
    for (const mode of ['locate', 'name', 'capital'] as const) {
      const config: GameConfig = { map: 'de', mode, answer: modesOf('de').find((m) => m.id === mode)!.answers[0], scope: 'de', length: 'all' };
      const session = createSession(germany, config, resolveScope(germany, 'de', []), {}, NOW, { rng: seeded(3) });
      expect(session.total, mode).toBe(16);
    }
  });

  it('el resto del mundo va de fondo: lo que no es vecino no sale como mar, y nada se dibuja dos veces', () => {
    const world = JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas;
    for (const id of COUNTRY_IDS) {
      const raw = JSON.parse(readFileSync(`public/data/${id}/atlas.json`, 'utf8')) as RawAtlas;
      const before = raw.countries.map((c) => c.id);
      const full = new Atlas(withBackdrop(raw, world), id);
      const ids = full.countries.map((c) => c.id);
      expect(new Set(ids).size, id).toBe(ids.length);
      // Lo propio sigue delante y en su sitio (los índices de las vecinas no se mueven)…
      expect(ids.slice(0, before.length), id).toEqual(before);
      // …el país no se repite entero debajo de sus provincias, y el fondo no se pregunta.
      expect(full.indexOf(COUNTRY_MAPS[id].iso), id).toBe(-1);
      expect(full.quizzable.length, id).toBe(before.filter((code) => raw.countries.find((c) => c.id === code)!.kind === 'country').length);
      for (const far of ['JPN', 'BRA', 'ZAF']) expect(full.byIdOrThrow(far).kind, `${id} ${far}`).toBe('context');
    }
  });

  it('las unidades de Natural Earth se funden en las que se estudian (Reino Unido, Francia, Italia)', () => {
    const count = (id: (typeof COUNTRY_IDS)[number]) => (JSON.parse(readFileSync(`public/data/${id}/atlas.json`, 'utf8')) as RawAtlas).countries.filter((c) => c.kind === 'country').length;
    expect([count('gb'), count('fr'), count('it')]).toEqual([4, 13, 20]);
    const britain = new Atlas(JSON.parse(readFileSync('public/data/gb/atlas.json', 'utf8')) as RawAtlas, 'gb');
    // Londres cae en Inglaterra y Edimburgo en Escocia: las piezas se han reunido en su nación.
    expect(britain.countries[britain.locate(-0.13, 51.5)].id).toBe('GB-ENG');
    expect(britain.countries[britain.locate(-3.19, 55.95)].id).toBe('GB-SCT');
    expect(britain.countries[britain.locate(-3.18, 51.48)].id).toBe('GB-WLS');
    expect(britain.countries[britain.locate(-5.93, 54.6)].id).toBe('GB-NIR');
  });

  it('Portugal se encuadra en el continente, con las islas fuera de la vista general', () => {
    const portugal = new Atlas(JSON.parse(readFileSync('public/data/pt/atlas.json', 'utf8')) as RawAtlas, 'pt');
    expect(portugal.frame).toEqual([-9.6, 36.9, -6.1, 42.2]);
    expect(portugal.quizzable.length).toBe(20);
    expect(portugal.byIdOrThrow('PT-20').capital).toBe('Ponta Delgada');
  });

  it('dentro de un país, dos unidades no se llaman igual en ningún idioma', () => {
    for (const id of COUNTRY_IDS) {
      const raw = JSON.parse(readFileSync(`public/data/${id}/atlas.json`, 'utf8')) as RawAtlas;
      const asked = raw.countries.filter((c) => c.kind === 'country');
      const repeated = (names: string[]) => names.filter((name, i) => names.indexOf(name) !== i);
      expect(repeated(asked.map((c) => c.name)), `${id} es`).toEqual([]);
      for (const lang of Object.keys(LANGS).filter((l) => l !== 'es')) {
        const names = JSON.parse(readFileSync(`public/data/${id}/names.${lang}.json`, 'utf8'));
        expect(repeated(asked.map((c) => names.countries[c.id].n)), `${id} ${lang}`).toEqual([]);
      }
    }
  });

  it('Croacia: Požega-Eslavonia tiene su propio código, que Natural Earth confunde con el de su vecina', () => {
    const croatia = new Atlas(JSON.parse(readFileSync('public/data/hr/atlas.json', 'utf8')) as RawAtlas, 'hr');
    expect(croatia.quizzable.length).toBe(21);
    // Požega cae en su condado y Slavonski Brod en el suyo.
    expect(croatia.countries[croatia.locate(17.68, 45.33)].id).toBe('HR-11');
    expect(croatia.countries[croatia.locate(18.01, 45.17)].id).toBe('HR-12');
  });

  it('Hungría: las ciudades con rango de condado se funden con el suyo; Serbia: cada distrito, con su código', () => {
    const hungary = new Atlas(JSON.parse(readFileSync('public/data/hu/atlas.json', 'utf8')) as RawAtlas, 'hu');
    expect(hungary.quizzable.length).toBe(20);
    // Debrecen cae en Hajdú-Bihar, Szeged en Csongrád-Csanád y Sopron en Győr-Moson-Sopron.
    expect(hungary.countries[hungary.locate(21.63, 47.53)].id).toBe('HU-HB');
    expect(hungary.countries[hungary.locate(20.15, 46.25)].id).toBe('HU-CS');
    expect(hungary.countries[hungary.locate(16.59, 47.68)].id).toBe('HU-GS');
    const serbia = new Atlas(JSON.parse(readFileSync('public/data/rs/atlas.json', 'utf8')) as RawAtlas, 'rs');
    // Natural Earth llama igual a dos distritos: Kruševac cae en Rasina y Jagodina en Pomoravlje.
    expect(serbia.countries[serbia.locate(21.33, 43.58)].id).toBe('RS-19');
    expect(serbia.countries[serbia.locate(21.26, 43.98)].id).toBe('RS-13');
    expect(serbia.countries[serbia.locate(20.46, 44.8)].id).toBe('RS-00');
  });

  it('Bulgaria: la ciudad de Sofía y la provincia que la rodea son dos unidades con la misma capital', () => {
    const bulgaria = new Atlas(JSON.parse(readFileSync('public/data/bg/atlas.json', 'utf8')) as RawAtlas, 'bg');
    expect(bulgaria.quizzable.length).toBe(28);
    // El centro de Sofía cae en la ciudad; Samokov, en la provincia.
    expect(bulgaria.countries[bulgaria.locate(23.32, 42.7)].id).toBe('BG-22');
    expect(bulgaria.countries[bulgaria.locate(23.55, 42.34)].id).toBe('BG-23');
  });

  it('Ucrania lleva Crimea y Sebastopol, y donde es vecina Crimea no sale como mar', () => {
    const world = JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas;
    const open = (id: 'ua' | 'by' | 'ro' | 'sk' | 'hu' | 'pl') =>
      new Atlas(withBackdrop(JSON.parse(readFileSync(`public/data/${id}/atlas.json`, 'utf8')) as RawAtlas, world), id);
    const ukraine = open('ua');
    expect(ukraine.quizzable.length).toBe(27);
    // Simferópol, Sebastopol, el centro de Kiev y Bila Tserkva (región de Kiev).
    expect(ukraine.countries[ukraine.locate(34.1, 45.0)].id).toBe('UA-43');
    expect(ukraine.countries[ukraine.locate(33.6, 44.6)].id).toBe('UA-40');
    expect(ukraine.countries[ukraine.locate(30.52, 50.45)].id).toBe('UA-30');
    expect(ukraine.countries[ukraine.locate(30.11, 49.8)].id).toBe('UA-32');
    // Natural Earth asigna Crimea a Rusia: en los mapas de los vecinos de Ucrania quedaba en blanco.
    for (const id of ['by', 'ro', 'sk', 'hu', 'pl'] as const) {
      const atlas = open(id);
      expect(atlas.countries[atlas.locate(34.1, 45.0)]?.id, id).toBe('UKR');
    }
    const belarus = open('by');
    expect(belarus.quizzable.length).toBe(7);
    // El centro de Minsk cae en la ciudad; Barýsaw, en la región.
    expect(belarus.countries[belarus.locate(27.56, 53.9)].id).toBe('BY-HM');
    expect(belarus.countries[belarus.locate(28.5, 54.23)].id).toBe('BY-MI');
  });

  it('Finlandia: las regiones son las vigentes desde 2021 y Åland no se repite de fondo', () => {
    const world = JSON.parse(readFileSync('public/data/atlas.json', 'utf8')) as RawAtlas;
    const finland = new Atlas(withBackdrop(JSON.parse(readFileSync('public/data/fi/atlas.json', 'utf8')) as RawAtlas, world), 'fi');
    expect(finland.quizzable.length).toBe(19);
    const at = (lon: number, lat: number) => finland.countries[finland.locate(lon, lat)]?.id;
    // Los cinco municipios que cambiaron de región el 1 de enero de 2021: Heinävesi, Joroinen,
    // Iitti, Kuhmoinen e Isokyrö. Natural Earth los deja en la anterior.
    expect(at(28.63, 62.43)).toBe('FI-13');
    expect(at(27.83, 62.18)).toBe('FI-15');
    expect(at(26.34, 60.89)).toBe('FI-16');
    expect(at(25.18, 61.56)).toBe('FI-11');
    expect(at(22.33, 63.0)).toBe('FI-03');
    // Helsinki, Mariehamn y, al otro lado de la frontera, Estocolmo.
    expect(at(24.94, 60.17)).toBe('FI-18');
    expect(at(19.94, 60.1)).toBe('FI-01');
    expect(at(18.07, 59.33)).toBe('SWE');
    // Åland es una región: el territorio que trae el atlas del mundo no va también de fondo.
    expect(finland.countries.some((c) => c.id === 'ALA')).toBe(false);
  });

  it('una capital compartida (Praga, de la ciudad y de Bohemia Central) no sale dos veces ni cuenta como fallo', () => {
    const czechia = new Atlas(JSON.parse(readFileSync('public/data/cz/atlas.json', 'utf8')) as RawAtlas, 'cz');
    const scope = resolveScope(czechia, 'cz', []);
    const [prague, central] = [czechia.indexOf('CZ-10'), czechia.indexOf('CZ-20')];
    for (let seed = 1; seed <= 20; seed++) {
      const choice = createSession(czechia, { map: 'cz', mode: 'capital', answer: 'choice', scope: 'cz', length: 'all' }, scope, {}, NOW, { rng: seeded(seed), only: [central] });
      const labels = currentQuestion(choice)!.options.map((o) => o.label);
      expect(new Set(labels).size, `semilla ${seed}`).toBe(labels.length);
    }
    const onMap = createSession(czechia, { map: 'cz', mode: 'capital', answer: 'map', scope: 'cz', length: 'all' }, scope, {}, NOW, { rng: seeded(1), only: [central] });
    expect(submit(czechia, onMap, { kind: 'country', index: prague }, NOW).verdict).toBe('right');
    expect(submit(czechia, onMap, { kind: 'country', index: czechia.indexOf('CZ-64') }, NOW).verdict).toBe('wrong');
  });

  it('Estados Unidos: 50 estados en las cuatro regiones del censo; el Distrito de Columbia se dibuja pero no se pregunta', () => {
    const usa = new Atlas(JSON.parse(readFileSync('public/data/us/atlas.json', 'utf8')) as RawAtlas, 'us');
    const count = (scope: string) => resolveScope(usa, scope, []).countries.length;
    expect(count('us')).toBe(50);
    expect([count('us-noreste'), count('us-medio-oeste'), count('us-sur'), count('us-oeste')]).toEqual([9, 12, 16, 13]);
    expect(usa.byIdOrThrow('US-DC').kind).toBe('context');
    expect(usa.byIdOrThrow('US-TX').capital).toBe('Austin');
    expect(resolveScope(usa, 'us-sur', []).label).toBe('Sur');
    // Maryland rodea al distrito, pero no lo tiene por vecino: no puede salir como opción.
    expect(usa.byIdOrThrow('US-MD').neighbors.map((n) => usa.countries[n].id).sort()).toEqual(['US-DE', 'US-PA', 'US-VA', 'US-WV']);
  });
});
