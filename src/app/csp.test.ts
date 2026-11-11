import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// La política de contenido (cabecera Content-Security-Policy de vercel.json) solo deja ejecutar los
// scripts en línea cuya huella lleva apuntada. Si se toca el de index.html (el que aplica el tema
// antes de pintar) y no se actualiza la huella, el navegador lo bloquea en producción sin avisar.

const csp = (JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers: { headers: { key: string; value: string }[] }[] }).headers
  .flatMap((rule) => rule.headers)
  .find((header) => header.key === 'Content-Security-Policy')!.value;

test('la CSP lleva la huella de cada script en línea de index.html', () => {
  const html = readFileSync('index.html', 'utf8');
  // Los bloques de datos (JSON-LD) no se ejecutan: la política no les afecta.
  const inline = [...html.matchAll(/<script(?![^>]*\b(?:src|type)=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  expect(inline.length).toBeGreaterThan(0);
  for (const code of inline) {
    expect(csp).toContain(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
  }
});

test('la CSP no deja ejecutar código en línea sin huella', () => {
  const scripts = csp.split(';').find((directive) => directive.trim().startsWith('script-src'))!;
  expect(scripts).not.toContain("'unsafe-inline'");
  expect(scripts).not.toContain("'unsafe-eval'");
});
