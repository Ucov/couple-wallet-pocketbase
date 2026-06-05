# 🧠 ARCHIVO MAESTRO DE CONOCIMIENTO — ProyectoCasa (CoupleWallet)

> **ATENCIÓN PARA FUTUROS AGENTES:** Este es el archivo "fuente de verdad" e historial de conocimiento de la aplicación **CoupleWallet** dentro del ecosistema **ProyectoCasa**. Leed este archivo por completo al iniciar cualquier nueva conversación/sesión para heredar el 100% del contexto histórico, decisiones técnicas y planes de implementación sin requerir que el usuario os vuelva a explicar el proyecto.

---

## 📌 Contexto del Proyecto

**ProyectoCasa** es un ecosistema destinado a agrupar todas las herramientas de desarrollo y automatización de la casa del usuario.
La aplicación principal actualmente es **CoupleWallet** (ubicada en `./couple-wallet`), un gestor de finanzas, convivencia, tareas y calendario compartido para parejas en tiempo real.

### 🏷️ Ideas de Marca y Naming Propuestas
El usuario está considerando renombrar la aplicación para darle una marca más moderna y pulida. Las mejores opciones propuestas son:
1. **DuetWallet** o **DuetPay** *(De un dueto, elegante, simple)*
2. **TwoPocket** *(Dos bolsillos que comparten uno solo)*
3. **Clink!** *(El sonido de dos monedas o copas chocando al pagar o celebrar juntos)*
4. **CoSpend** *(Gasto colaborativo, claro y directo)*
5. **UsWallet** *(Nuestra cartera)*
6. **AmourBudget** *(Toque romántico y financiero en pareja)*

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Framework:** Next.js 15.5.18 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 (`@tailwindcss/postcss`) para control absoluto.
- **Base de Datos/Auth:** PocketBase (SQLite) — `pocketbase` (JS SDK v0.23+).
- **Iconografía:** `lucide-react`.
- **Animaciones:** `framer-motion` (v12) para transiciones e interacciones fluidas.
- **PWA:** Soporte básico mediante `@ducanh2912/next-pwa`.

### 📂 Estructura de la Base de Código
```text
ProyectoCasa/
├── CONOCIMIENTO_COMPLETO.md   <-- (Este archivo maestro)
└── couple-wallet/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx               # Dashboard (Balance mensual, Donut SVG, Recharts, lista)
    │   │   ├── add/                   # Vista de añadir gasto
    │   │   ├── edit/[id]/             # Vista de edición de gasto
    │   │   ├── shopping/              # Lista de la compra compartida
    │   │   ├── chores/                # Gestor de tareas domésticas
    │   │   ├── calendar/              # Agenda / Calendario compartido
    │   │   ├── profile/               # Perfil, pareja y utilidades
    │   │   └── recurring-actions.ts   # Automatización de gastos fijos
    │   └── components/
    │       ├── BottomNav.tsx          # Navegación inferior
    │       ├── FloatingAddButton.tsx  # Botón de añadir gasto premium con Framer Motion
    │       ├── PageTransition.tsx     # Animaciones de rutas con Framer Motion
    │       └── SwipeNavigation.tsx    # Navegación gestual de deslizamiento (Swipe)
    └── supabase/
        └── migrations/                # Migraciones y esquemas de base de datos
```

---

## 🗄️ Esquema de Base de Datos y Seguridad (PocketBase)

### Tablas Principales
1. **`couples`**: Grupos de pareja vinculados por un código único `join_code`. El campo `name` no puede estar vacío (blank).
2. **`users`**: Perfiles de usuario (sistema auth nativo de PB). Contiene `couple_id`, `name`, `avatar`.
3. **`categories`**: Catálogo de categorías predefinidas.
4. **`expenses`**: Gastos. Si `couple_id` es vacío, se considera un "gasto en solitario".
5. **`shopping_items`**: Elementos de la lista de compras (`status` = 'pending' | 'bought').
6. **`chores`**: Tareas domésticas (`title`, `is_done`, `assigned_to`, `couple_id`).

### API Rules (Seguridad y Reglas Críticas)
Dado que migramos de Supabase a PocketBase, las reglas de acceso (API Rules) se gestionan desde el panel Admin.
- **Evitar 400 Failed to update record:** En la colección `couples`, si el campo `name` en la BD está vacío, cualquier actualización (como regenerar el código de unión) fallará. Siempre inyectar un nombre por defecto ("Mi Pareja") al hacer un update si estuviera vacío.
- **Relaciones (couple_id):** Las reglas de Update de `couples` suelen usar `@request.auth.couple_id ?= id` o dejarse en blanco si se administra localmente.
- **Error PWA Next 15:** La inyección automática del Service Worker falla con App Router. Se forzó el registro mediante un componente cliente `<PwaRegister />` inyectado en `layout.tsx`. Además, se eliminó `skipWaiting` de `next.config.ts` porque `next-pwa` dejó de soportarlo.

---

## 🛠️ Lecciones de Debugging Críticas (¡Muy Importante!)

### El Gran Error 500 en Servidor y Edge (Causa Raíz)
Durante el uso de Next.js Server Actions en la lista de compras y tareas, la app empezó a fallar con respuestas **HTTP 500**. 
- **Causa:** La biblioteca `web-push` realizaba la llamada `webpush.setVapidDetails()` directamente en el ámbito global del módulo `webPush.ts` en el momento de importarse. Cuando las claves VAPID no estaban configuradas o eran inválidas en el entorno de Vercel, el módulo lanzaba una excepción fatal inmediatamente al importarse, tirando abajo toda la ejecución de la función lambda o del edge runtime en cualquier Server Action que importara indirectamente notificaciones push.
- **Solución implementada:** Se encapsuló la inicialización de `webpush.setVapidDetails` en una inicialización perezosa (lazy init) dentro de un bloque `try/catch`. Ahora, si las claves fallan, la app continúa funcionando sin interrumpir el flujo principal y simplemente deshabilita las notificaciones push de forma controlada y segura:
  ```typescript
  // En utils/webPush.ts
  let isInitialized = false;
  function ensureInit() {
    if (isInitialized) return;
    try {
      webpush.setVapidDetails(...);
      isInitialized = true;
    } catch (e) {
      console.error("WebPush init failed safely", e);
    }
  }
  ```

---

## 🚀 Plan de Implementación de Novedades (Checklist Pendiente)

Cualquier nuevo agente debe ejecutar este plan paso a paso tras recibir la aprobación del usuario:

### 1. Animaciones de Deslizamiento Multidireccionales Fluídas
- **Objetivo:** Hacer que la animación en `PageTransition.tsx` coincida con la dirección natural de la navegación por gestos.
- **Implementación:**
  - Mapear las rutas en su orden lógico: `['/', '/shopping', '/chores', '/calendar', '/profile']`.
  - Usar un `useRef` en el componente cliente `PageTransition` para almacenar el índice de la ruta anterior.
  - Comparar `currentIndex` con `prevIndex`:
    - Si `currentIndex > prevIndex`, mover el contenido de derecha a izquierda (`x: 35` a `0`, salida hacia `x: -35`).
    - Si `currentIndex < prevIndex`, mover el contenido de izquierda a derecha (`x: -35` a `0`, salida hacia `x: 35`).
  - Actualizar `prevIndex` en un efecto secundario tras el cambio de ruta.

### 2. Gastos 100% Reembolsables (Shein / Devoluciones)
- **Objetivo:** Registrar gastos que se devolverán (por ej. compras para terceros o devoluciones de ropa) excluyéndolos de las cuentas y el balance del mes.
- **Implementación:**
  - **DB:** Crear una migración que añada la columna `is_refundable` (boolean, default false) a la tabla `expenses`.
  - **Formulario:** Añadir un Checkbox/Switch premium con descripción clara en `/add` y `/edit/[id]`.
  - **Cálculo:** En `src/app/page.tsx` y `settlement-actions.ts`, filtrar los gastos que tengan `is_refundable = true` para que **no sumen** al total del balance de deudas del mes.
  - **Tracker:** Mostrar una sección visual con un desglose de "Reembolsos Pendientes" en el Dashboard, permitiendo marcarlos como devueltos (lo que eliminará o archivará el gasto).

### 3. Copia de Seguridad y Exportación de Datos
- **Objetivo:** Evitar la pérdida de datos del usuario ofreciendo exportación de historial.
- **Implementación:**
  - Crear un panel en `/profile` de copias de seguridad.
  - **Exportar:** Un botón cliente que ejecute un fetch para traer todos los datos del usuario (gastos, tareas, compras) y genere la descarga de un archivo `.json` formateado estéticamente en un solo clic.
  - **Importar:** Un input tipo file que lea un archivo `.json` subido por el usuario, valide la estructura del esquema con Zod, y realice una inserción masiva en Supabase para restaurar el estado.

### 4. OCR de Fotos de Recibos a Texto
- **Objetivo:** Escanear facturas o tickets de compra con la cámara y rellenar automáticamente el formulario de alta.
- **Implementación:**
  - Instalar la dependencia de cliente `tesseract.js` en `package.json`.
  - Crear el componente `ReceiptScanner.tsx` e integrarlo en `/add`.
  - **UX:** Ofrecer botón de "Escanear ticket 📷", procesar la imagen seleccionada localmente mediante Tesseract con un loader animado de Framer Motion.
  - **Parsing:** Aplicar expresiones regulares al texto extraído para localizar el importe total (buscando patrones numéricos precedidos por palabras como `TOTAL`, `EUR`, `€`, `Importe`) y rellenar de inmediato el campo de cantidad. Intentar deducir la categoría y concepto a través de palabras clave del ticket (ej. `Mercadona` ➔ Alimentación, `Cepsa` ➔ Transporte).

---

## 📋 Estado de Funcionalidades Implementadas (Para Verificación)

1. **Dashboard Financiero:** Cuenta con un gráfico de donut premium hecho en SVG nativo, historial de transacciones recientes, gráficos de tendencias y cálculo dinámico de Bizums para el balance de la pareja.
2. **Botón Flotante de Añadir Gasto:** Totalmente interactivo con Framer Motion. Ofrece flotación fluida tipo respiración (bouncing) e interacciones táctiles en dispositivos.
3. **Lista de la Compra:** Optimista e instantánea. Se apoya en sincronización en tiempo real robusta usando Supabase Broadcast y refresco adaptativo.
4. **Tareas Domésticas:** Panel de control de asignación dinámica de tareas con soporte de avatares interactivos por usuario.

---

## ⚠️ Instrucciones Globales (Directrices del Usuario)
- **Gestor de Paquetes:** Utilizar SIEMPRE `pnpm` en lugar de `npm`. No preguntar al usuario, asumir `pnpm` para instalaciones, ejecución de scripts y gestión del entorno de Node.js.

*Este documento ha sido generado automáticamente por Antigravity para preservar el conocimiento histórico del proyecto.*
