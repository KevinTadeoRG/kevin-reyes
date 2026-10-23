/// <reference types="node" />
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatPeriod } from '../lib/dates.ts';
import { contentEn } from './content.en.ts';
import { contentEs } from './content.es.ts';
import { ContentValidationError, getContent, getUi, loadSiteData, person } from './index.ts';
import { findShapeMismatches } from './parity.ts';
import { person as personInput } from './person.ts';
import type { ContentInput, Locale, Person, UiInput } from './schema.ts';
import { uiEn } from './ui.en.ts';
import { uiEs } from './ui.es.ts';

interface EditableSources {
  person: Person;
  content: Record<Locale, ContentInput>;
  ui: Record<Locale, UiInput>;
}

/** Copia profunda del contenido real, para alterarla en cada prueba. */
const sources = (): EditableSources =>
  structuredClone({
    person: personInput,
    content: { es: contentEs, en: contentEn },
    ui: { es: uiEs, en: uiEn },
  });

describe('contenido actual', () => {
  it('ES y EN pasan esquema y paridad', () => {
    assert.doesNotThrow(() => loadSiteData(sources()));
  });

  it('Zikro Automation es una sola empresa con dos puestos', () => {
    for (const locale of ['es', 'en'] as const) {
      const zikro = getContent(locale).experience.filter((c) => c.id === 'zikro-automation');
      assert.equal(zikro.length, 1);
      assert.equal(zikro[0]?.roles.length, 2);
    }
  });

  it('el correo completo no aparece como texto en el contenido', () => {
    const full = `${person.email.user}@${person.email.domain}`;
    const all = JSON.stringify([contentEs, contentEn, uiEs, uiEn]);
    assert.ok(!all.includes(full));
  });
});

describe('el build falla si falta o sobra algo', () => {
  it('falta un campo obligatorio en EN', () => {
    const s = sources();
    // @ts-expect-error: se borra a propósito
    delete s.content.en.profile.valueProposition;
    assert.throws(() => loadSiteData(s), ContentValidationError);
  });

  it('un campo opcional existe en ES pero no en EN', () => {
    const s = sources();
    delete s.content.en.experience[0]?.roles[0]?.summary;
    assert.throws(() => loadSiteData(s), /falta en en/);
  });

  it('distinto número de viñetas', () => {
    const s = sources();
    s.content.es.experience[0]?.roles[0]?.groups[0]?.bullets.pop();
    assert.throws(() => loadSiteData(s), /elementos/);
  });

  it('fechas distintas entre idiomas', () => {
    const s = sources();
    const role = s.content.en.experience[1]?.roles[0];
    assert.ok(role);
    role.period.start = '2025-01';
    assert.throws(() => loadSiteData(s), /debe ser igual/);
  });

  it('llave desconocida (typo)', () => {
    const s = sources();
    Object.assign(s.ui.es.hero, { downlaodCv: 'x' });
    assert.throws(() => loadSiteData(s), ContentValidationError);
  });

  it('texto vacío', () => {
    const s = sources();
    s.ui.en.nav.about = '   ';
    assert.throws(() => loadSiteData(s), ContentValidationError);
  });

  it('fecha con formato inválido o inicio después del fin', () => {
    const bad = sources();
    const edu = bad.content.es.education[0];
    assert.ok(edu);
    edu.period.start = '2021-8';
    assert.throws(() => loadSiteData(bad), ContentValidationError);

    const reversed = sources();
    const edu2 = reversed.content.es.education[0];
    assert.ok(edu2);
    edu2.period.start = '2030-01';
    assert.throws(() => loadSiteData(reversed), ContentValidationError);
  });
});

describe('findShapeMismatches', () => {
  it('reporta la ruta exacta', () => {
    assert.deepEqual(findShapeMismatches({ a: [1, 2] }, { a: [1] }, ['es', 'en']), [
      '$.a: es tiene 2 elementos, en tiene 1',
    ]);
  });
});

describe('formatPeriod', () => {
  it('formatea por idioma y usa "actualidad" cuando no hay fin', () => {
    assert.equal(
      formatPeriod({ start: '2026-06', end: null }, getUi('es')),
      'jun 2026 – Actualidad',
    );
    assert.equal(
      formatPeriod({ start: '2021-08', end: '2025-12' }, getUi('en')),
      'Aug 2021 – Dec 2025',
    );
  });
});
