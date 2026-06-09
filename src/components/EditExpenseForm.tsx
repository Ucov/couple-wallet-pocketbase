'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { updateExpenseAction, type ActionState } from '@/app/expense-actions'
import ReceiptScanner from './ReceiptScanner'

const initialState: ActionState = { error: null }

type Category = {
  id: string
  name: string
}

type Expense = {
  id: string
  amount: number | string
  concept: string
  date: string | null
  created_at: string
  category_id: string | null
  is_refundable?: boolean
  type?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-emerald-900/20 transition-transform active:scale-95"
    >
      {pending ? 'Guardando…' : 'Guardar Cambios'}
    </button>
  )
}

export default function EditExpenseForm({
  expense,
  categories,
}: {
  expense: Expense
  categories: Category[]
}) {
  const action = updateExpenseAction.bind(null, expense.id)
  const [state, dispatch] = useActionState(action, initialState)

  const defaultDate = new Date(expense.date || expense.created_at)
    .toISOString()
    .split('T')[0]

  return (
    <form id="edit-expense-form" action={dispatch} className="flex flex-col gap-6">
      <ReceiptScanner />

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Cantidad (€)</label>
        <input
          type="number"
          step="0.01"
          name="amount"
          defaultValue={expense.amount}
          className="w-full text-3xl bg-transparent border-b-2 border-zinc-800 focus:border-emerald-500 pb-2 outline-none text-white placeholder-zinc-700"
          placeholder="0.00"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Concepto</label>
        <input
          type="text"
          name="concept"
          defaultValue={expense.concept}
          className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          placeholder="Ej. Cena en pizzería"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Tipo de Movimiento</label>
        <div className="grid grid-cols-2 gap-3">
          <label className="cursor-pointer">
            <input type="radio" name="type" value="EXPENSE" className="peer sr-only" defaultChecked={expense.type !== 'INCOME'} />
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center peer-checked:bg-emerald-600/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 transition-colors font-medium">
              Gasto (Pago)
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="type" value="INCOME" className="peer sr-only" defaultChecked={expense.type === 'INCOME'} />
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center peer-checked:bg-emerald-600/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 transition-colors font-medium">
              Ingreso (Abono)
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Fecha</label>
        <input
          type="date"
          name="date"
          defaultValue={defaultDate}
          max={new Date().toISOString().split('T')[0]}
          className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-zinc-400 mb-2">Categoría</label>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <label key={cat.id} className="cursor-pointer">
              <input
                type="radio"
                name="category_id"
                value={cat.id}
                className="peer sr-only"
                defaultChecked={expense.category_id === cat.id}
                required
              />
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-center peer-checked:bg-emerald-600/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 transition-colors">
                {cat.name}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900 cursor-pointer transition-colors hover:border-emerald-500/50">
          <div>
            <span className="block text-sm font-semibold text-white">Es una deuda 100% (Adelanto)</span>
            <span className="block text-xs text-zinc-400 mt-1">Este gasto no se sumará a los gastos de la casa. Se exigirá el pago íntegro a la pareja.</span>
          </div>
          <div className="relative inline-flex items-center ml-4 cursor-pointer">
            <input type="checkbox" name="is_refundable" className="sr-only peer" defaultChecked={expense.is_refundable} />
            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </div>
        </label>
      </div>

      {state.error && (
        <p className="text-red-400 text-sm" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
