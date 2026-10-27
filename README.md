# Kevin Reyes — sitio personal / CV

Sitio bilingüe (español en `/`, inglés en `/en`) construido con **Astro + TypeScript (strict) + Tailwind CSS**.

> Estado: **Fase 5 — formulario de contacto en AWS**. Ver el plan de fases en `plan-sitio-cv.md` (fuera del repo).

## Requisitos

- **Node.js 22.23.4 o superior** (Astro 7 lo exige). Hay un `.nvmrc` con `22`.
- **pnpm 12** (fijado en `package.json` → `packageManager`). La forma más simple es con Corepack, que viene con Node:

  ```bash
  corepack enable
  ```

### Desarrollo en Windows: usar WSL

En Windows con **Smart App Control** activado, los binarios nativos de Astro 7, Vite (rolldown) y Tailwind 4 quedan bloqueados ("An Application Control policy has blocked this file"). Por eso el proyecto vive y se ejecuta dentro de **WSL (Ubuntu)**, en `~/code/kevin-reyes-site`:

- Node 22 está instalado en `~/.local/node` (binario oficial de nodejs.org) y agregado al `PATH` en `~/.profile`.
- Desde Windows, los archivos se ven en `\\wsl.localhost\Ubuntu\home\kevin\code\kevin-reyes-site`.
- Para editar: VS Code con la extensión **WSL** (`code .` desde la terminal de Ubuntu).
- `pnpm dev` dentro de WSL se abre desde el navegador de Windows en http://localhost:4321.

No ejecutes `pnpm install` desde Windows sobre esta carpeta: instalaría binarios de Windows en `node_modules`.

## Comandos

| Comando             | Qué hace                                                  |
| ------------------- | --------------------------------------------------------- |
| `pnpm install`      | Instala dependencias                                      |
| `pnpm dev`          | Servidor local en http://localhost:4321                   |
| `pnpm build`        | Revisa tipos (`astro check`) y genera el sitio en `dist/` |
| `pnpm preview`      | Sirve el build de `dist/` para probarlo                   |
| `pnpm check`        | Solo revisión de tipos                                    |
| `pnpm test`         | Pruebas de contenido (esquema, paridad ES/EN, fechas)     |
| `pnpm lint`         | ESLint                                                    |
| `pnpm format`       | Formatea todo con Prettier                                |
| `pnpm format:check` | Verifica formato sin modificar                            |

## Estructura

```
src/
  components/   # HomePage, Header, selector de idioma, toggle de tema, formulario…
    sections/   # Hero, About, Experience, Stack, Projects, Education, Contact
  layouts/      # BaseLayout.astro: <html lang>, <head>, fuentes, tema inicial
  pages/        # index.astro → "/" (es) · en/index.astro → "/en" (solo <HomePage lang>)
  data/         # Contenido tipado ES/EN y textos de interfaz (ver abajo)
  lib/          # Utilidades: fechas, rutas por idioma, CV, correo ofuscado
  scripts/      # site.ts: tema, sección activa, correo (JS mínimo, sin framework)
  styles/       # global.css: tokens de color (claro/oscuro) y estilos base
public/         # favicon, imagen OG, CV en PDF
backend/contact/  # Lambda del formulario (Python 3.12) y sus pruebas (pytest)
infra/            # Infraestructura AWS con CDK (TypeScript), paquete aparte
```

### CV en PDF

Coloca `public/cv/kevin-reyes-cv-es.pdf` (y, si existe, `public/cv/kevin-reyes-cv-en.pdf`). El botón "Descargar CV" solo aparece si el archivo está; la versión en inglés usa el PDF en español si no hay uno en inglés.

## Cómo editar el contenido

Todo el texto del sitio vive en `src/data/`; los componentes no tienen texto escrito a mano.

| Archivo                           | Qué contiene                                                     |
| --------------------------------- | ---------------------------------------------------------------- |
| `content.es.ts` / `content.en.ts` | Perfil, sobre mí, stack, experiencia, educación, metadatos       |
| `ui.es.ts` / `ui.en.ts`           | Menú, botones, etiquetas de accesibilidad y del formulario       |
| `person.ts`                       | Nombre, enlaces y correo (partido en dos, nunca completo)        |
| `schema.ts`                       | Esquemas zod: qué campos existen y qué formato llevan            |
| `parity.ts`                       | Chequeo de que ES y EN tengan la misma forma                     |
| `index.ts`                        | Valida todo y expone `getContent(lang)`, `getUi(lang)`, `person` |

Reglas:

- **Cambia siempre ES y EN a la vez.** Si un idioma tiene un campo, una viñeta o un puesto que el otro no, `pnpm build` falla e indica la ruta exacta (p. ej. `$.experience[0].roles[0].groups[0].bullets: es tiene 5 elementos, en tiene 4`).
- **ids y fechas** deben ser idénticos en ambos idiomas. Las fechas van en formato `YYYY-MM`; `end: null` significa "actualidad".
- Cada empresa tiene una lista de `roles` (del más reciente al más antiguo); así una empresa con varios puestos se muestra como una sola.
- Los pendientes se marcan con `TODO(kevin): ...` como comentario en el archivo de datos.

## SEO

- **URL base:** vive solo en `SITE_URL`, al inicio de `astro.config.mjs`. De ahí salen canonical, `hreflang` (`es`, `en`, `x-default`), Open Graph, Twitter Card, JSON-LD, `sitemap.xml` y `robots.txt`. Al cambiar de subdominio o comprar dominio, se edita esa línea y nada más. Si se pone un marcador `.example`, el build muestra un aviso.
- **Imagen para compartir:** `src/pages/og.png.ts` genera `/og.png` (1200×630) en el build a partir de los datos, con satori + sharp e IBM Plex. Si cambia el nombre o el titular, la imagen se actualiza sola.
- **Datos estructurados:** JSON-LD `Person` con nombre, puesto actual (el rol sin fecha de fin) y `sameAs` (LinkedIn, GitHub). No incluye el correo.
- **Lighthouse (móvil):** 100 / 100 / 100 / 100 en Performance, Accessibility, Best Practices y SEO, en `/` y `/en/` (medido con la build local servida por `pnpm preview`).

## Publicación (Cloudflare Pages)

En línea en **https://kevin-reyes.pages.dev** (repo: https://github.com/KevinTadeoRG/kevin-reyes).

- **Deploy automático:** cada push a `main` publica en producción. Cada PR o rama obtiene su propia URL de preview (`<hash>.kevin-reyes.pages.dev`), que Cloudflare marca con `X-Robots-Tag: noindex`.
- **Configuración del proyecto en Cloudflare:**

  | Ajuste                  | Valor        |
  | ----------------------- | ------------ |
  | Production branch       | `main`       |
  | Framework preset        | Astro        |
  | Build command           | `pnpm build` |
  | Build output directory  | `dist`       |
  | Variable `NODE_VERSION` | `22.23.4`    |
  | Variable `PNPM_VERSION` | `12.15.0`    |

  Debe ser un proyecto de **Pages** (en el panel: _Continue to Pages_), no un Worker: el flujo de Workers corre `wrangler deploy` e intenta convertir el sitio en SSR.

- **Encabezados de seguridad:** no se editan a mano. La integración `src/integrations/security-headers.ts` corre al final de `pnpm build`, calcula el SHA-256 de cada `<script>` y `<style>` incrustado y escribe `dist/_headers` con:
  - `Content-Security-Policy` sin `'unsafe-inline'` ni `'unsafe-eval'` (scripts y estilos incrustados permitidos solo por hash; `frame-ancestors 'none'`, `object-src 'none'`).
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
  - `Cache-Control: immutable` para `/_astro/*` (archivos con hash en el nombre).
  - Se quita el `Access-Control-Allow-Origin: *` que Cloudflare agrega por defecto.

  Si alguien agrega un atributo `style="…"` o un `onclick="…"` (que la CSP bloquearía), el build falla con el archivo y la etiqueta.

- **Página 404:** `src/pages/404.astro` genera `/404.html`, una sola página bilingüe (ES y EN). Cloudflare Pages la sirve con estado **404** para cualquier ruta inexistente, también bajo `/en/`; sin ella, devolvía la página de inicio con estado 200 (un "soft 404"). Lleva `noindex` y no tiene canonical ni hreflang. (No hay `en/404.astro` porque Astro lo generaría como `en/404/index.html`, que Pages no usa.)

## Formulario de contacto (AWS)

```
Formulario (sitio) ──POST /contact──▶ API Gateway (HTTP API) ──▶ Lambda (Python 3.12) ──▶ Amazon SES ──▶ tu correo
                                      CORS solo del sitio          valida todo en el servidor
                                      throttling 5 req/s, ráfaga 10
```

| Carpeta            | Qué hay                                                                    | Pruebas                          |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------- |
| `backend/contact/` | `src/validation.py` (reglas) y `src/handler.py` (Lambda); sin dependencias | `uv run pytest`                  |
| `infra/`           | Stack CDK `KevinReyesContact` en `us-east-1` (`lib/contact-stack.ts`)      | `pnpm test` (plantilla, sin AWS) |

**Seguridad:**

- Validación en el servidor (no se confía en el navegador): tipos, campos desconocidos, longitudes (nombre 100, correo 254, mensaje 5000, cuerpo 10 KB), formato de correo y caracteres de control (bloquea la inyección de encabezados con saltos de línea).
- Anti-spam: campo honeypot `website` (si viene lleno, se responde "ok" sin enviar nada) + throttling de API Gateway. Turnstile queda para después, solo si llega spam.
- CORS en API Gateway limitado al sitio; la Lambda además rechaza cualquier otro `Origin`.
- Errores genéricos al cliente (`forbidden`, `invalid_request`, `server_error`); el motivo va a CloudWatch Logs (retención 30 días). **Nunca** se registran el nombre, el correo ni el contenido del mensaje: solo longitudes y el id de la petición.
- IAM de mínimo privilegio: un rol propio que solo puede escribir en su grupo de logs y hacer `ses:SendEmail` desde la identidad verificada (con condición `ses:FromAddress`).
- El visitante va en `Reply-To`; el `From` siempre es la identidad verificada.
- El correo no está en el código: la infraestructura lo lee de `infra/.env` (no versionado; ver `infra/.env.example`) y se lo pasa a la Lambda como variable de entorno.

### Pasos manuales (una sola vez)

1. **Cuenta de AWS** y acceso por terminal. Lo recomendable es IAM Identity Center (SSO): `aws configure sso` crea un perfil con credenciales temporales. No usar llaves del usuario root.
2. **Verificar el correo en SES**, región **us-east-1**: _Amazon SES → Identities → Create identity → Email address_, escribir el correo y abrir el enlace que llega. Con el sandbox de SES basta, porque remitente y destinatario son la misma identidad verificada; no hace falta pedir acceso a producción.
3. **Configurar el despliegue:** `cp infra/.env.example infra/.env` y poner el correo verificado en `CONTACT_EMAIL`.
4. **Preparar la cuenta para CDK** (una vez por cuenta y región): `cd infra && pnpm exec cdk bootstrap`.
5. **Desplegar:** `pnpm exec cdk deploy`. Al final imprime `ContactEndpoint`, la URL que usa el formulario.
6. **Filtro en Gmail** para que no caiga en Spam (sin dominio propio, el correo sale de servidores de Amazon con remitente `@gmail.com` y no pasa la alineación DMARC): _Buscar → Mostrar opciones_ con asunto `[kevin-reyes.pages.dev]` → _Crear filtro → Nunca enviarlo a Spam_.

Con dominio propio: verificar el dominio en SES con DKIM y cambiar `CONTACT_EMAIL` (o separar remitente y destinatario) a una dirección del dominio; el filtro deja de ser necesario.

**Costo:** dentro de la capa gratuita de Lambda y API Gateway para este volumen; SES cobra USD 0.10 por cada 1,000 correos.

## Dominio propio (pendiente; pasos sin ejecutar)

1. **Comprar el dominio.** Si es en Cloudflare Registrar, el DNS queda en la misma cuenta (paso 3 automático).
2. **Cloudflare → Workers & Pages → `kevin-reyes` → Custom domains → Set up a custom domain** y escribir el dominio (p. ej. `kevinreyes.dev`) y, si se quiere, `www`.
3. **DNS:**
   - Dominio en Cloudflare: Cloudflare crea el registro `CNAME` solo.
   - Dominio en otro registrador: crear `CNAME www → kevin-reyes.pages.dev`; para el dominio raíz, mover los nameservers a Cloudflare (o usar el `CNAME`/`ALIAS` en la raíz si el registrador lo permite).
4. **Esperar el certificado** (Cloudflare lo emite solo; suele tardar minutos).
5. **Cambiar `SITE_URL`** en `astro.config.mjs` al dominio nuevo, hacer commit y push. Eso actualiza canonical, hreflang, Open Graph, JSON-LD, sitemap y robots.
6. **Redirigir `kevin-reyes.pages.dev` y `www` al dominio principal** con una Redirect Rule (Bulk Redirects) en Cloudflare, para que no haya contenido duplicado.
7. **Opcional:** con dominio propio se puede agregar `preload` al HSTS y registrarlo en hstspreload.org (es difícil de revertir; hacerlo solo cuando el dominio sea definitivo).
8. **Fase 5:** actualizar el origen permitido de CORS de la API del formulario al dominio nuevo.

## Notas

- **Secretos:** nunca en el repo. `.env*` está en `.gitignore`; solo se permite `.env.example` como plantilla sin valores reales.
- **Modo claro/oscuro:** los colores son tokens en `global.css` definidos con `light-dark()` (clases `bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-accent`…). Por defecto se sigue `prefers-color-scheme`; el toggle fija `data-theme` en `<html>` y lo guarda en `localStorage`. Sin JavaScript, se sigue al sistema.
- **Fuentes:** IBM Plex Sans y Mono vía la API de fuentes de Astro; se descargan en el build y se sirven desde el propio sitio (`font-display: swap`).
- **TypeScript 6.0:** fijado a `~6.0` porque `typescript-eslint` y `@astrojs/check` aún no soportan TypeScript 7.
- **Commits:** formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`…).
