# Project Report: CoupleWallet

## Tech Stack
- **Framework:** Next.js 15.5.18 (App Router)
- **Database & Auth:** PocketBase (using `pocketbase` JS SDK)
- **Styling:** Tailwind CSS 4 (with `@tailwindcss/postcss`)
- **Icons:** Lucide React
- **Language:** TypeScript
- **State Management:** Server-side data fetching with Next.js dynamic rendering.

## Database Schema (PocketBase)
- **`couples`**: Stores couple groups with a unique `join_code`.
- **`profiles`**: User profiles linked to `users` and a `couple_id`.
- **`categories`**: Predefined expense categories (Comida, Vivienda, etc.).
- **`expenses`**: Individual records containing `amount`, `concept`, `category_id`, `paid_by` (profile ID), `couple_id`, `type`, `status` and `receipt` (image).

## Security & API Rules (Row Level Security)
- Users can only see and insert expenses belonging to their `couple_id` (or `couple_id = ""` for solo expenses).
- Profiles are visible to the user themselves and their partner (same `couple_id`).
- Authentication is handled via PocketBase Auth (`users` collection).

## Project Structure
- `src/app/`: Contains the main routes:
  - `(root)`: Dashboard with balance and recent expenses.
  - `/add`: Form to create new expenses and upload receipts for AI scanning.
  - `/login`: Authentication.
  - `/setup-couple`: Logic for creating or joining a couple.
- `src/utils/pocketbase/`: PocketBase client configuration for client/server/middleware.
- `pb_hooks/`: PocketBase JS hooks for executing backend logic.

## Current Functionality
- User authentication (Sign up/Login).
- Couple creation or joining via code.
- Dashboard showing:
  - Monthly balance (who owes whom).
  - Recent expenses list with category donuts.
- Adding expenses with category selection.
- **Automated Ingestion (n8n)**: 
  - MacroDroid Integration for bank notifications (via `macrodroid.pb.js`).
  - App Scanner for receipt OCR using Gemini Vision, triggered by `trigger_n8n_scanner.pb.js` hook.

## Next Implementations Planned
1. Full CRUD for expenses (Delete and Edit).
2. Custom split proportions for expenses.
3. Monthly history and charts.
