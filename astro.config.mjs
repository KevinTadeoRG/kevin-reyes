// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import securityHeaders from './src/integrations/security-headers.ts';

/**
 * URL pública del sitio. ÚNICO lugar donde vive: de aquí salen canonical, hreflang,
 * Open Graph, JSON-LD, sitemap.xml y robots.txt.
 * Al conectar un dominio propio, se cambia solo esta línea (ver README → Dominio propio).
 */
const SITE_URL = 'https://kevin-reyes.pages.dev';

if (new URL(SITE_URL).hostname.endsWith('.example')) {
  console.warn(`[site] SITE_URL todavía es un marcador (${SITE_URL}). Cámbialo antes de publicar.`);
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Escribe dist/_headers (CSP con hashes + encabezados de seguridad) al terminar el build.
  integrations: [securityHeaders()],
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      // Español en "/", inglés en "/en"
      prefixDefaultLocale: false,
    },
  },
  // Las fuentes se descargan en el build y se sirven desde el propio sitio (sin peticiones a terceros).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      display: 'swap',
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
