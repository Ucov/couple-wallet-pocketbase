# STATUS — CoupleWallet

> Fuente de verdad del estado actual de la app y la base de datos.
> Actualizar **siempre** que cambie el esquema, API Rules, rutas, o funcionalidad.

Última actualización: 2026-06-11 (Migración a PocketBase + Integración n8n Webhooks)

## Stack vigente

- **Framework:** Next.js 15.5.18 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 (`@tailwindcss/postcss`)
- **Backend/DB/Auth:** PocketBase — `pocketbase` JS SDK
- **Iconos:** `lucide-react`
- **PWA:** `@ducanh2912/next-pwa`
- **Renderizado:** dynamic rendering en servidor (Next.js), sin store cliente.

## Base de datos (PocketBase)

### Colecciones

| Colección    | Descripción                                                                                       |
|--------------|---------------------------------------------------------------------------------------------------|
| `users`      | Perfiles de usuario por defecto de PocketBase.                                                    |
| `couples`    | Grupos de pareja. Campo único `join_code`.                                                        |
| `profiles`   | Perfiles extendidos, FK a `users` y a `couples` (`couple_id`).                                    |
| `categories` | Catálogo de categorías (Comida, Vivienda, etc.).                                                  |
| `expenses`   | Gastos individuales: `amount`, `concept`, `category_id`, `paid_by` (user id), `couple_id`, `type`, `status` y `receipt` (imagen). |

### API Rules (Seguridad)

- **`expenses`**: SELECT/INSERT/UPDATE/DELETE permitidos en dos casos: (1) gasto compartido — `couple_id` coincide con el `couple_id` del usuario; o (2) gasto en solitario — `couple_id = ""` y `paid_by = @request.auth.id`. INSERT exige siempre `paid_by = @request.auth.id`.
- **`profiles`**: visible para el propio usuario y para su pareja (mismo `couple_id`). UPDATE solo del propio perfil.
- **Auth**: PocketBase Auth (email/password).

> Si añades campos, cambias colecciones o API Rules: **plan mode obligatorio** (ver `CLAUDE.md`).

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
│   ├── add/                     # Form de alta de gasto + actions.ts (draft-actions.ts)
│   ├── edit/[id]/               # Vista de edición de gasto
│   ├── login/                   # Auth + actions.ts
│   └── setup-couple/            # Crear pareja o unirse por código
└── utils/pocketbase/            # Clientes (client / server)

pb_hooks/                        # PocketBase JavaScript Hooks
├── macrodroid.pb.js             # Webhook nativo de PocketBase para recibir notificaciones
└── trigger_n8n_scanner.pb.js    # Disparador para enviar recibos a n8n cuando se detecta un ticket
```

## Funcionalidad implementada

- [x] Registro / login (PocketBase Auth).
- [x] Creación de pareja y unión por `join_code`.
- [x] Dashboard: balance mensual (quién debe a quién) + **donut por categorías** + lista de gastos recientes.
- [x] Alta de gasto con selección de categoría y subida de imágenes (receipts).
- [x] **Gastos en solitario**: usuarios sin pareja pueden añadir/editar/borrar/ver sus propios gastos (`couple_id = ""`, `paid_by = @request.auth.id`).
- [x] **CRUD de gastos**: editar (`/edit/[id]`) y eliminar con modal de confirmación in-app.
- [x] **Selector de fecha**: permitido elegir fecha de gasto en el pasado.
- [x] Gastos recurrentes (`recurring-actions.ts`) y cierre mensual (`settlement-actions.ts`).
- [x] PWA básica vía `@ducanh2912/next-pwa`.
- [x] **Ingesta Automatizada (n8n)**: Flujos externos en servidor homelab para registrar gastos automáticamente vía Webhook desde MacroDroid (notificaciones bancarias), IMAP (emails de recibos digitales), y un App Scanner (OCR de tickets mediante Vision AI Gemini) inyectado por PocketBase Hooks.

## Funcionalidad pendiente

Ver [`TODO.md`](TODO.md).

## Notas operativas

- Variables de entorno: `NEXT_PUBLIC_POCKETBASE_URL` en `.env.local` (no commiteado).
