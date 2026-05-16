# 🗺️ Tablero de Control - CoupleWallet

## 🔄 En Proceso

- [ ] Fix RLS: permitir gastos en solitario (`couple_id IS NULL`). Migración escrita en `supabase/migrations/20260516120000_allow_solo_expenses.sql`, pendiente de aplicar en Supabase y validar en la app.

## 📋 Pendientes (Backlog y Fases Futuras)

### Fase 1: Cierre del MVP Financiero

- [ ] Implementar el módulo "Ajuste de Cuentas" (Lógica Tricount/Splitwise) para calcular automáticamente el balance mensual y mostrar quién debe a quién.
- [ ] Revisión final de Políticas de Seguridad RLS en Supabase para garantizar aislamiento total por núcleo familiar.

### Fase 2: Gestión de la Convivencia Diaria

- [ ] Migración de gastos huérfanos al unirse/crear pareja: cuando un usuario solitario pasa a tener `couple_id`, sus gastos previos con `couple_id IS NULL` deben actualizarse al nuevo `couple_id` (server action o trigger en `profiles` UPDATE).
- [ ] Módulo de Lista de la Compra Inteligente: Lista de tareas compartida que, al marcar un ítem como comprado e introducir el precio, se transforma automáticamente en un gasto en la tabla 'expenses'.
- [ ] Módulo de Suscripciones y Gastos Recurrentes: Interfaz para añadir gastos fijos (Alquiler, Netflix, Luz) y automatización en base de datos para que se inyecten solos el día 1 de cada mes.

### Fase 3: Finanzas Avanzadas y Futuro

- [ ] Activar selector de división proporcional (vía columna split_ratio) para permitir divisiones dinámicas más allá del 50/50 (ej. 60/40 en base a ingresos).
- [ ] Módulo de Huchas Virtuales: Objetivos de ahorro compartidos con barras de progreso visuales para proyectos comunes (viajes, muebles).

## ✅ Realizadas

- [x] Inicialización del entorno con Next.js, Tailwind CSS y Supabase.
- [x] Configuración de la estructura de datos base en STATUS.md.
- [x] Implementación del CRUD completo de gastos (Edit y Delete utilizando Server Actions, useActionState, useFormStatus y Modales Premium oscuros con Tailwind).
- [x] Dashboard visual con donut SVG por categorías (`src/app/CategoryDonutChart.tsx`), Server Component sin dependencias externas, con placeholder visual cuando el mes no tiene gastos.
