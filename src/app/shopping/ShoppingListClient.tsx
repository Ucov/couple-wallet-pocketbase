'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import ShoppingItem from '@/components/ShoppingItem'
import { PartyPopper } from 'lucide-react'
import { useRouter } from 'next/navigation'
import FinishShoppingButton from '@/components/FinishShoppingModal'

export default function ShoppingListClient({ initialItems, coupleId }: { initialItems: any[], coupleId: string }) {
  const [items, setItems] = useState(initialItems)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    const channel = supabase
      .channel('shopping_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_items',
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          // Trigger a Server Component refresh so we fetch the freshest data
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [coupleId, router, supabase])

  const pendingItems = items.filter(item => item.status === 'pending')
  const boughtItems = items.filter(item => item.status === 'bought')

  return (
    <>
      <FinishShoppingButton boughtItemsCount={boughtItems.length} />

      {/* Lista Pendiente */}
      <section className="mb-8 relative z-10">
        <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Por comprar</span>
          <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full text-xs">
            {pendingItems.length}
          </span>
        </h2>
        
        {pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800/50 rounded-3xl animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mb-4">
              <PartyPopper size={32} />
            </div>
            <p className="text-lg font-medium text-zinc-300">¡Nevera llena!</p>
            <p className="text-sm text-zinc-500 mt-1">No hay nada que comprar por ahora.</p>
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
        <section className="relative z-10 pb-32">
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
    </>
  )
}
