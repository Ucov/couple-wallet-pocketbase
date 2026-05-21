import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addShoppingItem } from './actions'
import ShoppingListClient from './ShoppingListClient'

export const dynamic = 'force-dynamic'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/setup-couple')

  const { data: items } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('status', { ascending: false })
    .order('created_at', { ascending: false })

  // Sacamos los nombres únicos para el autocompletado
  const uniqueNames = Array.from(new Set(items?.map(i => i.name) || []))

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen pb-32">
      <header className="flex justify-between items-center py-6 mb-2">
        <h1 className="text-2xl font-bold">Lista de Compra</h1>
      </header>

      {/* Formulario rápido para añadir con Autocompletado */}
      <form action={addShoppingItem} className="relative mb-8 z-20">
        <input
          type="text"
          name="name"
          list="shopping-history"
          placeholder="Ej: Leche, Huevos, Papel..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg text-lg"
          required
          autoComplete="off"
        />
        <datalist id="shopping-history">
          {uniqueNames.map(name => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button 
          type="submit" 
          className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl aspect-square flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* Listas renderizadas en cliente con Real-time */}
      <ShoppingListClient initialItems={items || []} coupleId={profile.couple_id} />
    </main>
  )
}
