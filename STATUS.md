# STATUS — CoupleWallet

> Fuente de verdad del estado actual de la app y la base de datos.
> Actualizar **siempre** que cambie el esquema, RLS, rutas, o funcionalidad.

Última actualización: 2026-05-16 (Donut por categorías + RLS de gastos en solitario)

## Stack vigente

- **Framework:** Next.js 15.5.18 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 (`@tailwindcss/postcss`)
- **Backend/DB/Auth:** Supabase (PostgreSQL) — `@supabase/ssr`, `@supabase/supabase-js`
- **Iconos:** `lucide-react`
- **PWA:** `@ducanh2912/next-pwa`
- **Renderizado:** dynamic rendering en servidor (Next.js), sin store cliente.

## Base de datos (Supabase / PostgreSQL)

### Tablas

| Tabla        | Descripción                                                                                       |
|--------------|---------------------------------------------------------------------------------------------------|
| `couples`    | Grupos de pareja. Campo único `join_code`.                                                        |
| `profiles`   | Perfiles de usuario, FK a `auth.users` y a `couples` (`couple_id`).                               |
| `categories` | Catálogo de categorías (Comida, Vivienda, etc.). Predefinidas en `supabase/migrations/`.          |
| `expenses`   | Gastos individuales: `amount`, `concept`, `category_id`, `paid_by` (profile id), `couple_id`.     |

### RLS (Row Level Security)

- **`expenses`**: SELECT/INSERT/UPDATE/DELETE permitidos en dos casos: (1) gasto compartido — `couple_id` coincide con el `couple_id` del perfil de `auth.uid()`; o (2) gasto en solitario — `couple_id IS NULL` y `paid_by = auth.uid()`. INSERT exige siempre `paid_by = auth.uid()`. Migraciones: `20260515152921_initial_schema.sql` (versión inicial sin soporte solo), `20260515160000_add_delete_update_policies.sql` (UPDATE/DELETE), `20260516120000_allow_solo_expenses.sql` (rama `couple_id IS NULL` que desbloquea uso individual antes de tener pareja).
- **`profiles`**: visible para el propio usuario y para su pareja (mismo `couple_id`). UPDATE solo del propio perfil.
- **Auth**: Supabase Auth (email/password u OAuth según configuración).

> Si añades columnas, índices, triggers o cambias políticas RLS: **plan mode obligatorio** (ver `CLAUDE.md`).

## Arquitectura de la app

```text
src/
├── app/
│   ├── page.tsx                 # Dashboard: balance + gastos recientes (Server Component)
│   ├── DeleteExpenseButton.tsx  # Client: botón Trash2 + modal de confirmación
│   ├── EditExpenseForm.tsx      # Client: form de edición con useActionState
│   ├── expense-actions.ts       # Server Actions: deleteExpenseAction, updateExpenseAction
│   ├── recurring-actions.ts     # Server Action: applyRecurringExpenses
│   ├── settlement-actions.ts    # Server Action: settleMonth
│   ├── add/                     # Form de alta de gasto + actions.ts
│   ├── edit/[id]/               # Vista de edición de gasto
│   ├── login/                   # Auth + actions.ts
│   └── setup-couple/            # Crear pareja o unirse por código
└── utils/supabase/              # Clientes (client / server / middleware)

supabase/migrations/              # SQL de inicialización + parches RLS
```

## Funcionalidad implementada

- [x] Registro / login (Supabase Auth).
- [x] Creación de pareja y unión por `join_code`.
- [x] Dashboard: balance mensual (quién debe a quién) + **donut por categorías** (`src/app/CategoryDonutChart.tsx`, SVG puro, leyenda con icono/importe/%) + lista de gastos recientes.
- [x] Alta de gasto con selección de categoría.
- [x] **Gastos en solitario**: usuarios sin pareja pueden añadir/editar/borrar/ver sus propios gastos (`couple_id IS NULL`, `paid_by = auth.uid()`). Aislamiento entre usuarios solitarios garantizado por RLS.
- [x] **CRUD de gastos**: editar (`/edit/[id]`) y eliminar con modal de confirmación in-app. Feedback de error al usuario vía `useActionState` (React 19) si RLS o validación fallan.
- [x] **Selector de fecha**: permitido elegir fecha de gasto en el pasado (con validación para evitar fechas futuras) tanto en creación como edición.
- [x] Gastos recurrentes (`recurring-actions.ts`) y cierre mensual (`settlement-actions.ts`).
- [x] PWA básica vía `@ducanh2912/next-pwa`.
- [x] **Ingesta Automatizada (n8n)**: Flujos externos en servidor homelab para registrar gastos automáticamente vía Webhook desde MacroDroid (notificaciones bancarias), IMAP (emails de recibos digitales), y un App Scanner (OCR de tickets mediante Vision AI Gemini).

## Funcionalidad pendiente

Ver [`TODO.md`](TODO.md).

## Notas operativas

- Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` (no commiteado).
- Migraciones: aplicar a través de Supabase CLI o panel; mantener `supabase/migrations/` sincronizado.
