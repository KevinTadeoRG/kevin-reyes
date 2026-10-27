/**
 * Configuración del despliegue. Sale de variables de entorno (o de `infra/.env`, que no se
 * versiona), nunca del código: así el correo no queda escrito en el repo público.
 */
export interface ContactConfig {
  /** Identidad verificada en SES: remitente y destinatario. */
  contactEmail: string;
  /** Orígenes que pueden llamar a la API (CORS + verificación en la Lambda). */
  allowedOrigins: string[];
}

export const DEFAULT_ALLOWED_ORIGINS = ['https://kevin-reyes.pages.dev'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadConfig(env: Record<string, string | undefined>): ContactConfig {
  const contactEmail = env.CONTACT_EMAIL?.trim();
  if (!contactEmail || !EMAIL_RE.test(contactEmail)) {
    throw new Error(
      'Falta CONTACT_EMAIL (el correo verificado en SES). Defínelo en infra/.env; ver infra/.env.example.',
    );
  }

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  for (const origin of allowedOrigins) {
    const url = new URL(origin);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.origin !== origin || (url.protocol !== 'https:' && !isLocal)) {
      throw new Error(
        `Origen inválido en ALLOWED_ORIGINS: "${origin}" (formato: https://host, sin ruta ni "/" final)`,
      );
    }
  }

  return { contactEmail, allowedOrigins };
}
