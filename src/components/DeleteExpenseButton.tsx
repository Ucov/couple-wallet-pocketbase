'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'
import { deleteExpenseAction, type ActionState } from '@/app/expense-actions'

const initialState: ActionState = { error: null, timestamp: 0 }

function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={onSubmit}
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
  const [mounted, setMounted] = useState(false)
  const [state, dispatch] = useActionState(deleteExpenseAction, initialState)
  const submittedRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (submittedRef.current && state.timestamp && state.timestamp > 0) {
      if (state.error === null) {
        setOpen(false)
        submittedRef.current = false
      } else {
        submittedRef.current = false
      }
    }
  }, [state])

  function handleOpen() {
    submittedRef.current = false
    setOpen(true)
  }

  const modalContent = open ? (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[20vh] p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false)
      }}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl cursor-default">
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
          <SubmitButton onSubmit={() => { submittedRef.current = true }} />
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-zinc-600 hover:text-red-400 transition-colors p-1"
        aria-label="Eliminar gasto"
      >
        <Trash2 size={18} />
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
