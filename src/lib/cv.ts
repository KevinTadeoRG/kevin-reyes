/// <reference types="node" />
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Locale } from '../data/schema.ts';

/**
 * Ruta pública del CV en PDF para un idioma, o `undefined` si no existe.
 * Se busca `public/cv/kevin-reyes-cv-<idioma>.pdf`; si falta el del idioma, se usa el de español.
 * Se evalúa en el build (sitio estático), así que el botón solo aparece si el archivo está.
 */
export function getCvHref(locale: Locale): string | undefined {
  for (const candidate of new Set<Locale>([locale, 'es'])) {
    const file = `cv/kevin-reyes-cv-${candidate}.pdf`;
    if (existsSync(join(process.cwd(), 'public', file))) return `/${file}`;
  }
  return undefined;
}
