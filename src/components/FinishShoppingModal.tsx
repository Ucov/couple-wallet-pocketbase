'use client'

import { useState } from 'react'
import { Receipt, X } from 'lucide-react'
import { finishShopping } from '@/app/shopping/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function FinishShoppingButton({ boughtItemsCount, coupleId }: { boughtItemsCount: number, coupleId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  if (boughtItemsCount === 0) return null

  async function handleSubmit(formData: FormData) {
    setPending(true)
    try {
      await finishShopping(formData)
      const supabase = createClient()
      supabase.channel(`sync_shop_${coupleId}`).send({ type: 'broadcast', event: 'update_shopping', payload: {} })
      toast.success('Gasto añadido correctamente')
      setIsOpen(false)
      router.push('/')
    } catch (e: any) {
      toast.error(e.message || 'Error al añadir el gasto')
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-24 left-0 right-0 flex justify-center pointer-events-none z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6 py-4 shadow-xl shadow-emerald-900/20 pointer-events-auto transition-transform hover:scale-105 active:scale-95 font-semibold flex items-center gap-2"
        >
          <Receipt size={20} /> Añadir a Gastos
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Terminar Compra</h3>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">¿Cuánto ha costado la compra?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl font-medium">€</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    required
                    autoFocus
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-10 pr-4 py-4 text-2xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              
              <input type="hidden" name="concept" value="Compra en supermercado" />

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl py-4 font-bold transition-colors mt-4 text-lg"
              >
                {pending ? 'Añadiendo...' : 'Guardar Gasto'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
