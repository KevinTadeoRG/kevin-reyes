import { LOCALES, type Content, type Locale, type Person } from '../data/schema.ts';
import { localePath } from './i18n.ts';

/** Locale de Open Graph por idioma. */
export const OG_LOCALE: Record<Locale, string> = { es: 'es_MX', en: 'en_US' };

/** Imagen para compartir (la genera src/pages/og.png.ts en el build). */
export const OG_IMAGE = { path: '/og.png', width: 1200, height: 630, type: 'image/png' } as const;

export function absoluteUrl(site: URL, path: string): string {
  return new URL(path, site).href;
}

export interface Alternate {
  hreflang: string;
  href: string;
}

/** Una URL por idioma + `x-default` (el idioma por defecto). Igual en todas las páginas. */
export function alternates(site: URL): Alternate[] {
  const perLocale = LOCALES.map((locale) => ({
    hreflang: locale,
    href: absoluteUrl(site, localePath(locale)),
  }));
  return [...perLocale, { hreflang: 'x-default', href: absoluteUrl(site, localePath(LOCALES[0])) }];
}

/** Puesto actual: el rol sin fecha de fin. */
export function currentJobTitle(content: Content): string | undefined {
  for (const company of content.experience) {
    const role = company.roles.find((r) => r.period.end === null);
    if (role) return role.title;
  }
  return undefined;
}

/** Datos estructurados schema.org/Person. */
export function personJsonLd(
  person: Person,
  content: Content,
  url: string,
): Record<string, unknown> {
  const jobTitle = currentJobTitle(content);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    ...(jobTitle ? { jobTitle } : {}),
    url,
    sameAs: [person.links.linkedin, person.links.github],
  };
}

/** JSON seguro para `<script type="application/ld+json">`: escapa `<` para que no pueda cerrar la etiqueta. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
