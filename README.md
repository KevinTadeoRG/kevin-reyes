# Kevin Reyes — sitio personal / CV

Sitio bilingüe (español en `/`, inglés en `/en`) construido con **Astro + TypeScript (strict) + Tailwind CSS**.

> Estado: **Fase 0 — setup**. Ver el plan de fases en `plan-sitio-cv.md` (fuera del repo).

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
| `pnpm lint`         | ESLint                                                    |
| `pnpm format`       | Formatea todo con Prettier                                |
| `pnpm format:check` | Verifica formato sin modificar                            |

## Estructura

```
src/
  components/   # Componentes .astro y islas React (Fase 2)
  layouts/      # BaseLayout.astro: <html lang>, <head>, estilos globales
  pages/        # index.astro → "/" (es) · en/index.astro → "/en"
  data/         # Contenido tipado ES/EN (Fase 1)
  styles/       # global.css (Tailwind)
public/         # favicon, imagen OG, CV en PDF
```

## Notas

- **Secretos:** nunca en el repo. `.env*` está en `.gitignore`; solo se permite `.env.example` como plantilla sin valores reales.
- **Modo oscuro:** Tailwind está configurado para usar la clase `.dark` en `<html>` (el toggle llega en la Fase 2).
- **TypeScript 6.0:** fijado a `~6.0` porque `typescript-eslint` y `@astrojs/check` aún no soportan TypeScript 7.
- **Commits:** formato [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`…).
