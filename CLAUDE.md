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

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint

## Preferencias de colaboración (obligatorias)

1. **Respuestas cortas y directas.** Sin resúmenes ni conclusiones al final.
2. **Edición quirúrgica.** Prohibido reescribir archivos enteros si solo cambian unas líneas o una función — usar `Edit`, no `Write`. Ahorro de tokens.
3. **Regla de oro financiera.** Antes de cualquier cambio grande en código o base de datos: entrar en Plan mode o usar el agente `Plan` para presentar el diseño y **esperar aprobación explícita** antes de tocar nada. Aplica a: migraciones SQL, cambios de esquema, refactors multi-archivo, cambios en RLS/auth, cambios que afecten cálculos de balance.

## Notas Next.js

Ver [AGENTS.md](AGENTS.md): esta versión de Next.js puede tener breaking changes respecto al training data. Consultar `node_modules/next/dist/docs/` antes de escribir APIs no triviales.
