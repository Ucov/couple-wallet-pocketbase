'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import ShoppingItem from '@/components/ShoppingItem'
import { PartyPopper } from 'lucide-react'
import FinishShoppingButton from '@/components/FinishShoppingModal'

export default function ShoppingListClient({ initialItems, coupleId }: { initialItems: any[], coupleId: string }) {
  const [items, setItems] = useState(initialItems)
  const supabase = useMemo(() => createClient(), [])

  // Sincronizar con props del servidor
  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupRealtime = async () => {
      // Asegurar que tenemos sesión activa antes de suscribirnos
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('[Realtime] No hay sesión activa, no se puede suscribir')
        return
      }

      console.log('[Realtime] Sesión encontrada, configurando canal shopping...')

      channel = supabase
        .channel(`shopping_rt_${coupleId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'shopping_items',
          },
          (payload) => {
            console.log('[Realtime] INSERT shopping:', payload.new)
            setItems(prev => {
              if (prev.some(i => i.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'shopping_items',
          },
          (payload) => {
            console.log('[Realtime] UPDATE shopping:', payload.new)
            setItems(prev => prev.map(i => i.id === payload.new.id ? payload.new : i))
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'shopping_items',
          },
          (payload) => {
            console.log('[Realtime] DELETE shopping:', payload.old)
            setItems(prev => prev.filter(i => i.id !== payload.old.id))
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] shopping status:', status)
          if (err) console.error('[Realtime] shopping error:', err)
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        console.log('[Realtime] Limpiando canal shopping')
        supabase.removeChannel(channel)
      }
    }
  }, [coupleId, supabase])

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
          <div className="flex flex-wrap gap-2">
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
          <div className="flex flex-wrap gap-2">
            {boughtItems.map(item => (
              <ShoppingItem key={item.id} id={item.id} name={item.name} status={item.status as 'bought'} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
