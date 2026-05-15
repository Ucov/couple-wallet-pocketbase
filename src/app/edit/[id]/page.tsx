import { createClient } from '@/utils/supabase/server'
import { updateExpense } from '../../expense-actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // Obtener el gasto actual
  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!expense) {
    notFound()
  }

  // Obtener categorías
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex items-center py-6 mb-4">
        <Link href="/" className="text-zinc-400 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Editar Gasto</h1>
      </header>

      <form action={updateExpense.bind(null, id)} className="flex flex-col gap-6">
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
          <label className="block text-sm font-semibold text-zinc-400 mb-2">Fecha</label>
          <input
            type="date"
            name="date"
            defaultValue={new Date(expense.date || expense.created_at).toISOString().split('T')[0]}
            className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-white border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-400 mb-2">Categoría</label>
          <div className="grid grid-cols-2 gap-3">
            {categories?.map((cat) => (
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

        <button
          type="submit"
          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-emerald-900/20 transition-transform active:scale-95"
        >
          Guardar Cambios
        </button>
      </form>
    </main>
  )
}
