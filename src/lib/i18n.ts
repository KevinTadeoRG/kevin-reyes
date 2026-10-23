import { LOCALES, type Locale } from '../data/schema.ts';

/** Ruta raíz de cada idioma: español en `/`, el resto con prefijo. */
export function localePath(locale: Locale): string {
  return locale === LOCALES[0] ? '/' : `/${locale}/`;
}

/** El otro idioma (el sitio tiene exactamente dos). */
export function otherLocale(locale: Locale): Locale {
  return LOCALES.find((l) => l !== locale) ?? LOCALES[0];
}
