@AGENTS.md

# CoupleWallet

App de gastos compartidos para parejas.

## Stack

- **Framework:** Next.js 15.5.18 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 (`@tailwindcss/postcss`)
- **Backend/DB/Auth:** Supabase (PostgreSQL) — `@supabase/ssr`, `@supabase/supabase-js`
- **Iconos:** `lucide-react`
- **PWA:** `@ducanh2912/next-pwa`

## Fuentes de verdad del proyecto

- **`STATUS.md`** — estado actual de la base de datos Supabase y arquitectura de la app. Léelo antes de razonar sobre el esquema o flujos existentes.
- **`TODO.md`** — backlog priorizado. Léelo antes de proponer trabajo nuevo.

Si una de las dos fuentes contradice lo que ves en el código o en `PROJECT_SUMMARY.md`, prevalece la fuente de verdad y se actualiza el código/documento secundario.

## Estructura

- `src/app/` — rutas App Router: `(root)` dashboard, `/add`, `/login`, `/setup-couple`
- `src/utils/supabase/` — clientes Supabase (client/server/middleware)
- `supabase/migrations/` — scripts SQL de inicialización

## Comandos

- `pnpm dev` — servidor de desarrollo
- `pnpm build` — build de producción (idéntico al de Vercel)
- `pnpm lint` — ESLint
- `pnpm install --frozen-lockfile` — instalar dependencias (lo que ejecuta Vercel)

## Preferencias de colaboración (obligatorias)

1. **Respuestas cortas y directas.** Sin resúmenes ni conclusiones al final.
2. **Edición quirúrgica.** Prohibido reescribir archivos enteros si solo cambian unas líneas o una función — usar `Edit`, no `Write`. Ahorro de tokens.
3. **Regla de oro financiera.** Antes de cualquier cambio grande en código o base de datos: entrar en Plan mode o usar el agente `Plan` para presentar el diseño y **esperar aprobación explícita** antes de tocar nada. Aplica a: migraciones SQL, cambios de esquema, refactors multi-archivo, cambios en RLS/auth, cambios que afecten cálculos de balance.

## Entorno y despliegue

**Tooling fijado** (cualquier desajuste rompe el build en Vercel):

- Node **22.x LTS** — `.nvmrc` + `package.json#engines.node`.
- pnpm **11.x** — `package.json#packageManager` (Corepack lo activa en Vercel).
- Despliegue: **Vercel** — `vercel.json` define `framework: nextjs`, `installCommand: pnpm install --frozen-lockfile`, `buildCommand: pnpm run build`.

**Comandos canónicos** (no mezclar npm con pnpm):

- `pnpm install --frozen-lockfile` — instalar (lo que ejecuta Vercel).
- `pnpm dev` — servidor de desarrollo.
- `pnpm build` — build de producción (idéntico a Vercel).
- `pnpm lint` — ESLint.

**Reglas obligatorias** (Claude, Gemini, humano: todos):

1. **No uses `npm install` ni `yarn add`.** Corrompe `pnpm-lock.yaml` y rompe el build en Vercel. Si propones añadir una dependencia, sugiere el comando `pnpm add <paquete>`.
2. **No actualices Node ni pnpm** sin alinear a la vez `.nvmrc`, `engines` y `packageManager`. Cambio coordinado → Plan mode.
3. **No añadas dependencias sin Plan mode previo.** Antes de proponer un paquete nuevo, valora si se puede resolver con código nativo (regla "edición quirúrgica" llevada a `node_modules`). Aplica especialmente a librerías de UI/charts/state.
4. **Versiones de framework pinneadas**: Next 15.5.18, React 19.2.6, Tailwind 4. Cualquier bump → Plan mode obligatorio.
5. **Antes de cualquier commit que toque `package.json` o `pnpm-lock.yaml`**: ejecutar `pnpm build` local y verificar que pasa. Vercel ejecuta exactamente lo mismo.

## Notas Next.js

Ver [AGENTS.md](AGENTS.md): esta versión de Next.js puede tener breaking changes respecto al training data. Consultar `node_modules/next/dist/docs/` antes de escribir APIs no triviales.
