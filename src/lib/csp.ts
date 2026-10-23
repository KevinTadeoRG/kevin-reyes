/// <reference types="node" />
import { createHash } from 'node:crypto';

export interface InlineHashes {
  scripts: string[];
  styles: string[];
}

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const EXECUTABLE_TYPES = new Set(['module', 'text/javascript', 'application/javascript']);

const sha256 = (source: string) =>
  `'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;

/** Un `<script>` incrustado que el navegador ejecuta (JSON-LD y otros tipos de datos no cuentan). */
function isExecutableInline(attrs: string): boolean {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const type = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1]?.toLowerCase();
  return type === undefined || EXECUTABLE_TYPES.has(type);
}

/** Hashes SHA-256 de los scripts y estilos incrustados de una página HTML. */
export function findInlineHashes(html: string): InlineHashes {
  const scripts = [...html.matchAll(SCRIPT_RE)]
    .filter(([, attrs = '']) => isExecutableInline(attrs))
    .map(([, , body = '']) => sha256(body));
  const styles = [...html.matchAll(STYLE_RE)].map(([, body = '']) => sha256(body));
  return { scripts, styles };
}

/**
 * Cosas que una CSP sin 'unsafe-inline' bloquearía y que un hash no cubre:
 * atributos `style="…"` y manejadores `onclick="…"`. Si aparecen, el build debe fallar.
 */
export function findUnsupportedInline(html: string): string[] {
  const problems: string[] = [];
  for (const [tag] of html.matchAll(/<[a-z][a-z0-9-]*\b[^>]*>/gi)) {
    if (/\sstyle\s*=/i.test(tag)) problems.push(`atributo style: ${tag.slice(0, 80)}`);
    if (/\son[a-z]+\s*=/i.test(tag)) problems.push(`manejador on*: ${tag.slice(0, 80)}`);
  }
  return problems;
}

export interface CspExtras {
  /** Orígenes extra para fetch/XHR (p. ej. la API del formulario en la Fase 5). */
  connectSrc?: string[];
}

export function buildCsp(hashes: InlineHashes, extras: CspExtras = {}): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...hashes.scripts],
    'style-src': ["'self'", ...hashes.styles],
    'img-src': ["'self'"],
    'font-src': ["'self'"],
    'connect-src': ["'self'", ...(extras.connectSrc ?? [])],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'object-src': ["'none'"],
    'upgrade-insecure-requests': [],
  };
  return Object.entries(directives)
    .map(([name, values]) => [name, ...values].join(' '))
    .join('; ');
}

/**
 * Archivo `_headers` de Cloudflare Pages.
 * `! Access-Control-Allow-Origin` quita el `*` que Cloudflare agrega por defecto: el sitio
 * no necesita que otros orígenes lean sus respuestas.
 */
export function buildHeadersFile(csp: string): string {
  return `# Generado en el build por src/integrations/security-headers.ts. No editar a mano.
/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  ! Access-Control-Allow-Origin

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
`;
}
