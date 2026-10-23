/// <reference types="node" />
/**
 * Integración de Astro: al terminar el build, calcula los hashes de los scripts y estilos
 * incrustados en cada HTML y escribe `dist/_headers` (Cloudflare Pages) con la CSP y el
 * resto de encabezados de seguridad. Así la CSP nunca queda desfasada del código.
 */
import type { AstroIntegration } from 'astro';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCsp,
  buildHeadersFile,
  findInlineHashes,
  findUnsupportedInline,
  type CspExtras,
} from '../lib/csp.ts';

export default function securityHeaders(extras: CspExtras = {}): AstroIntegration {
  return {
    name: 'security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));

        const scripts = new Set<string>();
        const styles = new Set<string>();
        for (const page of pages) {
          const html = await readFile(join(root, page), 'utf8');
          const problems = findUnsupportedInline(html);
          if (problems.length > 0) {
            throw new Error(`${page}: incompatible con la CSP:\n  ${problems.join('\n  ')}`);
          }
          const hashes = findInlineHashes(html);
          hashes.scripts.forEach((h) => scripts.add(h));
          hashes.styles.forEach((h) => styles.add(h));
        }

        const csp = buildCsp({ scripts: [...scripts].sort(), styles: [...styles].sort() }, extras);
        await writeFile(join(root, '_headers'), buildHeadersFile(csp));
        logger.info(
          `_headers escrito: ${pages.length} página(s), ${scripts.size} script(s) y ${styles.size} estilo(s) incrustados con hash`,
        );
      },
    },
  };
}
