# Project Report: CoupleWallet

## Tech Stack
- **Framework:** Next.js 15.5.18 (App Router)
- **Database & Auth:** Supabase (using `@supabase/ssr` and `@supabase/supabase-js`)
- **Styling:** Tailwind CSS 4 (with `@tailwindcss/postcss`)
- **Icons:** Lucide React
- **Language:** TypeScript
- **State Management:** Server-side data fetching with Next.js dynamic rendering.

## Database Schema (Supabase/PostgreSQL)
- **`couples`**: Stores couple groups with a unique `join_code`.
- **`profiles`**: User profiles linked to `auth.users` and a `couple_id`.
- **`categories`**: Predefined expense categories (Comida, Vivienda, etc.).
- **`expenses`**: Individual records containing `amount`, `concept`, `category_id`, `paid_by` (profile ID), and `couple_id`.

## Security & RLS (Row Level Security)
- Users can only see and insert expenses belonging to their `couple_id`.
- Profiles are visible to the user themselves and their partner (same `couple_id`).
- Authentication is handled via Supabase Auth.

## Project Structure
- `src/app/`: Contains the main routes:
  - `(root)`: Dashboard with balance and recent expenses.
  - `/add`: Form to create new expenses.
  - `/login`: Authentication.
  - `/setup-couple`: Logic for creating or joining a couple.
- `src/utils/supabase/`: Supabase client configuration for client/server/middleware.
- `supabase/migrations/`: Database initialization scripts.

## Current Functionality
- User authentication (Sign up/Login).
- Couple creation or joining via code.
- Dashboard showing:
  - Monthly balance (who owes whom).
  - Recent expenses list.
- Adding expenses with category selection.

## Next Implementations Planned
1. Full CRUD for expenses (Delete and Edit).
2. Date selector for expenses.
3. Custom split proportions for expenses.
4. Monthly history and charts.
