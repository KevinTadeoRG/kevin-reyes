# Kevin Reyes — sitio personal / CV

Sitio bilingüe (español en `/`, inglés en `/en`) construido con **Astro + TypeScript (strict) + Tailwind CSS**.

> Estado: **Fase 2 — diseño y secciones**. Ver el plan de fases en `plan-sitio-cv.md` (fuera del repo).

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

## Notas

- **Secretos:** nunca en el repo. `.env*` está en `.gitignore`; solo se permite `.env.example` como plantilla sin valores reales.
- **Modo claro/oscuro:** los colores son tokens en `global.css` definidos con `light-dark()` (clases `bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-accent`…). Por defecto se sigue `prefers-color-scheme`; el toggle fija `data-theme` en `<html>` y lo guarda en `localStorage`. Sin JavaScript, se sigue al sistema.
- **Fuentes:** IBM Plex Sans y Mono vía la API de fuentes de Astro; se descargan en el build y se sirven desde el propio sitio (`font-display: swap`).
- **TypeScript 6.0:** fijado a `~6.0` porque `typescript-eslint` y `@astrojs/check` aún no soportan TypeScript 7.
- **Commits:** formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`…).
