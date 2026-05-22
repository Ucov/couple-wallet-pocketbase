import { createBrowserClient } from '@supabase/ssr'

// Singleton para evitar múltiples instancias en el navegador
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  )
  
  return client
}
