/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getContent, person } from '../data/index.ts';
import { alternates, currentJobTitle, personJsonLd, serializeJsonLd } from './seo.ts';

const site = new URL('https://ejemplo.test');

describe('hreflang', () => {
  it('es, en y x-default con URLs absolutas', () => {
    assert.deepEqual(alternates(site), [
      { hreflang: 'es', href: 'https://ejemplo.test/' },
      { hreflang: 'en', href: 'https://ejemplo.test/en/' },
      { hreflang: 'x-default', href: 'https://ejemplo.test/' },
    ]);
  });
});

describe('JSON-LD Person', () => {
  it('incluye nombre, puesto actual y perfiles', () => {
    const data = personJsonLd(person, getContent('es'), 'https://ejemplo.test/');
    assert.equal(data['@type'], 'Person');
    assert.equal(data.name, person.name);
    assert.equal(data.jobTitle, 'Full Stack Engineer');
    assert.deepEqual(data.sameAs, [person.links.linkedin, person.links.github]);
  });

  it('no incluye el correo', () => {
    const json = JSON.stringify(personJsonLd(person, getContent('en'), 'https://ejemplo.test/en/'));
    assert.ok(!json.includes(person.email.user));
  });

  it('el puesto actual sale de los datos', () => {
    assert.equal(currentJobTitle(getContent('en')), 'Full Stack Engineer');
  });

  it('escapa "<" para no poder cerrar el <script>', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    assert.ok(!out.includes('<'));
    assert.deepEqual(JSON.parse(out), { name: '</script><script>alert(1)</script>' });
  });
});
