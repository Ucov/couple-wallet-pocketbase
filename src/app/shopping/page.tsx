import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { addShoppingItem } from './actions'
import ShoppingItem from '@/components/ShoppingItem'

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
    .order('status', { ascending: false }) // 'pending' comes after 'bought' in alphabet, wait no. 'pending' > 'bought', so descending makes pending first.
    .order('created_at', { ascending: false })

  const pendingItems = items?.filter(item => item.status === 'pending') || []
  const boughtItems = items?.filter(item => item.status === 'bought') || []

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex justify-between items-center py-6 mb-2">
        <h1 className="text-2xl font-bold">Lista de Compra</h1>
      </header>

      {/* Formulario rápido para añadir */}
      <form action={addShoppingItem} className="relative mb-8">
        <input
          type="text"
          name="name"
          placeholder="Ej: Leche, Huevos, Papel..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg text-lg"
          required
          autoComplete="off"
        />
        <button 
          type="submit" 
          className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl aspect-square flex items-center justify-center transition-transform active:scale-95"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* Lista Pendiente */}
      <section className="mb-8">
        <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Por comprar</span>
          <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
            {pendingItems.length}
          </span>
        </h2>
        
        {pendingItems.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-zinc-800/50 rounded-2xl">
            <p className="text-zinc-500">Todo comprado 🎉</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingItems.map(item => (
              <ShoppingItem key={item.id} id={item.id} name={item.name} status={item.status as 'pending'} />
            ))}
          </div>
        )}
      </section>

      {/* Historial / Comprados */}
      {boughtItems.length > 0 && (
        <section>
          <h2 className="text-sm text-zinc-600 font-semibold uppercase tracking-wider mb-4">
            Comprados recientemente
          </h2>
          <div className="flex flex-col gap-3">
            {boughtItems.map(item => (
              <ShoppingItem key={item.id} id={item.id} name={item.name} status={item.status as 'bought'} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
