import type { APIRoute } from 'astro';
import { LOCALES } from '../data/index.ts';
import { localePath } from '../lib/i18n.ts';
import { absoluteUrl, alternates } from '../lib/seo.ts';

/** Sitemap con las dos versiones de la página enlazadas entre sí (hreflang). */
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Falta `site` en astro.config.mjs');

  const links = alternates(site)
    .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}"/>`)
    .join('\n');

  const urls = LOCALES.map(
    (locale) =>
      `  <url>\n    <loc>${absoluteUrl(site, localePath(locale))}</loc>\n${links}\n  </url>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
