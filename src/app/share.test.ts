import { describe, expect, it } from 'vitest';
import { SAMPLE_LIST } from '../game/config';
import { parsePreset, parseSharedList, shareUrl } from './share';

const BASE = 'https://studyworldmap.example/';

describe('listas compartidas', () => {
  it('una lista sobrevive al viaje por la dirección de la página', () => {
    const list = { id: 'lista-x', name: 'Examen del martes: Europa & África', countries: ['ESP', 'FRA', 'MAR'] };
    const url = new URL(shareUrl(list, BASE));
    const parsed = parseSharedList(url.search)!;
    expect(parsed.name).toBe(list.name);
    expect(parsed.countries).toEqual(list.countries);
  });

  it('la lista de ejemplo cabe en un enlace razonable', () => {
    const url = shareUrl(SAMPLE_LIST, BASE);
    expect(url.length).toBeLessThan(400);
    expect(parseSharedList(new URL(url).search)!.countries).toHaveLength(50);
  });

  it('el mismo enlace da siempre la misma lista (no se duplica al abrirlo dos veces)', () => {
    const search = '?lista=Mi%20lista~ESP.FRA';
    expect(parseSharedList(search)!.id).toBe(parseSharedList(search)!.id);
    expect(parseSharedList('?lista=Mi%20lista~FRA.ESP')!.id).toBe(parseSharedList(search)!.id);
    expect(parseSharedList('?lista=Otra~ESP.FRA')!.id).not.toBe(parseSharedList(search)!.id);
  });

  it('descarta lo que no es una lista válida', () => {
    expect(parseSharedList('')).toBeNull();
    expect(parseSharedList('?otra=cosa')).toBeNull();
    expect(parseSharedList('?lista=SinPaises')).toBeNull();
    expect(parseSharedList('?lista=Mala~esp.<script>.12')).toBeNull();
    // se quedan solo los códigos con forma de ISO, sin repetidos
    expect(parseSharedList('?lista=Mixta~ESP.xx.FRA.ESP')!.countries).toEqual(['ESP', 'FRA']);
    // un nombre vacío o larguísimo se sanea
    expect(parseSharedList('?lista=~ESP')!.name).toBe('Lista compartida');
    expect(parseSharedList(`?lista=${'a'.repeat(200)}~ESP`)!.name).toHaveLength(60);
  });
});

describe('reto y zona en la dirección', () => {
  it('lee reto y zona válidos', () => {
    expect(parsePreset('?reto=capitales&zona=europa')).toEqual({ mode: 'capital', answer: 'choice', scope: 'europa' });
    expect(parsePreset('?zona=africa')).toEqual({ scope: 'africa' });
  });
  it('ignora valores desconocidos', () => {
    expect(parsePreset('?reto=hack&zona=marte')).toBeNull();
    expect(parsePreset('')).toBeNull();
  });
});
