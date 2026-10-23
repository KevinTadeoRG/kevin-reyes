/// <reference types="node" />
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';
import { buildCsp, buildHeadersFile, findInlineHashes, findUnsupportedInline } from './csp.ts';

const hash = (s: string) => `'sha256-${createHash('sha256').update(s).digest('base64')}'`;

describe('findInlineHashes', () => {
  it('hashea scripts ejecutables y estilos incrustados', () => {
    const html = `
      <script>a()</script>
      <script type="module">b()</script>
      <script src="/x.js"></script>
      <script type="application/ld+json">{"@type":"Person"}</script>
      <style>@font-face{}</style>`;
    assert.deepEqual(findInlineHashes(html), {
      scripts: [hash('a()'), hash('b()')],
      styles: [hash('@font-face{}')],
    });
  });

  it('el hash cubre el contenido exacto (un espacio cambia el hash)', () => {
    const [a] = findInlineHashes('<script>x()</script>').scripts;
    const [b] = findInlineHashes('<script> x()</script>').scripts;
    assert.notEqual(a, b);
  });
});

describe('findUnsupportedInline', () => {
  it('detecta atributos style y manejadores on*', () => {
    const problems = findUnsupportedInline('<div style="color:red"></div><button onclick="x()">');
    assert.equal(problems.length, 2);
  });

  it('no confunde texto o data-* con manejadores', () => {
    const html = '<button data-label="Cambiar a modo oscuro" aria-label="on=off">Mostrar</button>';
    assert.deepEqual(findUnsupportedInline(html), []);
  });
});

describe('buildCsp', () => {
  const csp = buildCsp({ scripts: ["'sha256-AAA'"], styles: ["'sha256-BBB'"] });

  it("sin 'unsafe-inline' ni 'unsafe-eval'", () => {
    assert.ok(!csp.includes('unsafe'));
  });

  it('incluye las directivas clave', () => {
    for (const d of [
      "default-src 'self'",
      "script-src 'self' 'sha256-AAA'",
      "style-src 'self' 'sha256-BBB'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]) {
      assert.ok(csp.includes(d), d);
    }
  });

  it('agrega orígenes extra a connect-src', () => {
    const withApi = buildCsp(
      { scripts: [], styles: [] },
      { connectSrc: ['https://api.ejemplo.test'] },
    );
    assert.ok(withApi.includes("connect-src 'self' https://api.ejemplo.test"));
  });
});

describe('buildHeadersFile', () => {
  it('incluye los 5 encabezados que pide el plan', () => {
    const file = buildHeadersFile("default-src 'self'");
    for (const h of [
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Permissions-Policy',
    ]) {
      assert.ok(file.includes(`  ${h}: `), h);
    }
  });

  it('quita el Access-Control-Allow-Origin: * que agrega Cloudflare', () => {
    assert.ok(buildHeadersFile("default-src 'self'").includes('  ! Access-Control-Allow-Origin\n'));
  });
});
