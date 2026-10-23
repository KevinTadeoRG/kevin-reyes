/// <reference types="node" />
/**
 * Imagen para compartir (Open Graph / Twitter), 1200×630, generada en el build a partir de los datos.
 * satori convierte el diseño en SVG (con el texto como trazos, usando IBM Plex) y sharp lo pasa a PNG.
 */
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { getContent, person } from '../data/index.ts';
import { OG_IMAGE } from '../lib/seo.ts';

// Colores del tema oscuro (los mismos tokens de global.css, en hex porque satori no lee oklch).
const COLORS = {
  bg: '#0d1013',
  surface: '#16191c',
  fg: '#e9ebee',
  muted: '#a0a5ab',
  line: '#2b2e32',
  accent: '#61d7b2',
};

const font = (pkg: string, file: string) =>
  readFile(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({
  type,
  props: { style, children },
});

export const GET: APIRoute = async () => {
  // El titular y las palabras clave son iguales en ES y EN; se usa el contenido en español.
  const { profile } = getContent('es');

  const [sans400, sans600, mono400, mono500] = await Promise.all([
    font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'),
    font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'),
    font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'),
    font('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff'),
  ]);

  // Lienzo completo + franja de acento arriba; el contenido va en una caja con márgenes fijos
  // (en satori el padding se suma al tamaño, por eso se usa posición absoluta).
  const content = h(
    'div',
    {
      position: 'absolute',
      top: 12 + 72,
      left: 80,
      right: 80,
      bottom: 64,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    [
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h(
          'div',
          { fontSize: 96, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05 },
          person.name,
        ),
        h(
          'div',
          { marginTop: 20, fontSize: 48, fontWeight: 600, color: COLORS.accent },
          profile.headline.role,
        ),
      ]),
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          paddingTop: 32,
          borderTop: `2px solid ${COLORS.line}`,
        },
        profile.headline.keywords.map((keyword) =>
          h('div', { display: 'flex', fontFamily: 'IBM Plex Mono', fontSize: 30 }, [
            h('span', { color: COLORS.accent, marginRight: 18, fontWeight: 500 }, '>'),
            h('span', { color: COLORS.muted }, keyword),
          ]),
        ),
      ),
    ],
  );

  const tree = h(
    'div',
    {
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      display: 'flex',
      position: 'relative',
      backgroundColor: COLORS.bg,
      color: COLORS.fg,
      fontFamily: 'IBM Plex Sans',
    },
    [
      h('div', {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 12,
        backgroundColor: COLORS.accent,
      }),
      content,
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    fonts: [
      { name: 'IBM Plex Sans', data: sans400, weight: 400, style: 'normal' },
      { name: 'IBM Plex Sans', data: sans600, weight: 600, style: 'normal' },
      { name: 'IBM Plex Mono', data: mono400, weight: 400, style: 'normal' },
      { name: 'IBM Plex Mono', data: mono500, weight: 500, style: 'normal' },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': OG_IMAGE.type } });
};
