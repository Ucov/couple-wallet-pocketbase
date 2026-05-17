'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteRecurringExpense } from '@/app/recurring-actions'

export default function DeleteRecurringButton({
  id,
  concept,
  amount,
}: {
  id: string
  concept: string
  amount: number
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const submittedRef = useRef(false)

  async function handleDelete() {
    submittedRef.current = true
    setPending(true)
    try {
      await deleteRecurringExpense(id)
      // La Server Action hace revalidatePath → la página se actualiza sola
    } catch {
      setPending(false)
      submittedRef.current = false
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
        title="Eliminar gasto fijo"
        aria-label="Eliminar gasto fijo"
      >
        <Trash2 size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-zinc-100">Eliminar gasto fijo</h2>
            <p className="text-sm text-zinc-400 mt-2">
              ¿Eliminar &quot;<span className="text-zinc-200">{concept}</span>&quot; (€{amount.toFixed(2)})?
              <br />
              <span className="text-yellow-500/80">Este gasto dejará de añadirse automáticamente cada mes.</span>
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl py-3 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors"
              >
                {pending ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
