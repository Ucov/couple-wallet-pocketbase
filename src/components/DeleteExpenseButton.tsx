'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { deleteExpenseAction, type ActionState } from '@/app/expense-actions'

const initialState: ActionState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors"
    >
      {pending ? 'Eliminando…' : 'Eliminar'}
    </button>
  )
}

export default function DeleteExpenseButton({
  id,
  concept,
  amount,
}: {
  id: string
  concept: string
  amount: number
}) {
  const [open, setOpen] = useState(false)
  const [state, dispatch] = useActionState(deleteExpenseAction, initialState)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (state.error === null && open) {
      setOpen(false)
    }
  }, [state, open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
        aria-label="Eliminar gasto"
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
            <h2 className="text-lg font-bold text-zinc-100">Eliminar gasto</h2>
            <p className="text-sm text-zinc-400 mt-2">
              ¿Eliminar &quot;<span className="text-zinc-200">{concept}</span>&quot; (€{amount.toFixed(2)})?
              Esta acción no se puede deshacer.
            </p>

            {state.error && (
              <p className="text-red-400 text-sm mt-3" role="alert">
                {state.error}
              </p>
            )}

            <form action={dispatch} className="flex gap-3 mt-6">
              <input type="hidden" name="id" value={id} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl py-3 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  )
}
