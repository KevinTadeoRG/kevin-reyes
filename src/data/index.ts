/**
 * Punto de entrada único del contenido del sitio.
 *
 * Valida todo al importarse: si un idioma no cumple el esquema o ES y EN no tienen la misma
 * forma, lanza un error y `pnpm build` falla.
 */
import { z } from 'astro/zod';
import { contentEn } from './content.en.ts';
import { contentEs } from './content.es.ts';
import { findShapeMismatches } from './parity.ts';
import { person as personInput } from './person.ts';
import {
  contentSchema,
  personSchema,
  uiSchema,
  type Content,
  type Locale,
  type Person,
  type Ui,
} from './schema.ts';
import { uiEn } from './ui.en.ts';
import { uiEs } from './ui.es.ts';

export class ContentValidationError extends Error {
  name = 'ContentValidationError';
}

function parse<T>(schema: z.ZodType<T>, input: unknown, label: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ContentValidationError(
      `${label} no cumple el esquema:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

function assertSameShape(es: unknown, en: unknown, label: string): void {
  const mismatches = findShapeMismatches(es, en, ['es', 'en']);
  if (mismatches.length > 0) {
    throw new ContentValidationError(
      `${label}: ES y EN no tienen la misma forma:\n${mismatches.map((m) => `  - ${m}`).join('\n')}`,
    );
  }
}

export interface SiteData {
  person: Person;
  content: Record<Locale, Content>;
  ui: Record<Locale, Ui>;
}

export interface SiteDataSources {
  person: unknown;
  content: Record<Locale, unknown>;
  ui: Record<Locale, unknown>;
}

/** Valida y devuelve todo el contenido. Exportada para poder probarla con datos alterados. */
export function loadSiteData(sources: SiteDataSources): SiteData {
  const data: SiteData = {
    person: parse(personSchema, sources.person, 'person.ts'),
    content: {
      es: parse(contentSchema, sources.content.es, 'content.es.ts'),
      en: parse(contentSchema, sources.content.en, 'content.en.ts'),
    },
    ui: {
      es: parse(uiSchema, sources.ui.es, 'ui.es.ts'),
      en: parse(uiSchema, sources.ui.en, 'ui.en.ts'),
    },
  };
  assertSameShape(data.content.es, data.content.en, 'Contenido');
  assertSameShape(data.ui.es, data.ui.en, 'Textos de interfaz');
  return data;
}

const siteData = loadSiteData({
  person: personInput,
  content: { es: contentEs, en: contentEn },
  ui: { es: uiEs, en: uiEn },
});

export const person: Person = siteData.person;
export const getContent = (locale: Locale): Content => siteData.content[locale];
export const getUi = (locale: Locale): Ui => siteData.ui[locale];

export { LOCALES, SECTION_IDS, type Locale, type SectionId } from './schema.ts';
