/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { person } from '../data/index.ts';
import { decodeEmailPart, encodeEmailPart } from './email.ts';
import { localePath, otherLocale } from './i18n.ts';

describe('correo ofuscado', () => {
  it('ida y vuelta da el mismo valor', () => {
    for (const part of [person.email.user, person.email.domain]) {
      assert.equal(decodeEmailPart(encodeEmailPart(part)), part);
    }
  });

  it('la versión codificada no contiene el texto original', () => {
    const encoded = encodeEmailPart(person.email.user);
    assert.ok(!encoded.includes(person.email.user));
    assert.ok(!encoded.includes('@'));
  });
});

describe('rutas por idioma', () => {
  it('español en "/" e inglés en "/en/"', () => {
    assert.equal(localePath('es'), '/');
    assert.equal(localePath('en'), '/en/');
  });

  it('el otro idioma', () => {
    assert.equal(otherLocale('es'), 'en');
    assert.equal(otherLocale('en'), 'es');
  });
});
