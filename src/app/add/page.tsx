import { createClient } from '@/utils/supabase/server'
import { addExpense } from './actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AddExpenseForm from '@/components/AddExpenseForm'

export default async function AddExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const { message } = await searchParams

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex items-center py-6 mb-4">
        <Link href="/" className="text-zinc-400 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Añadir Gasto</h1>
      </header>

      <AddExpenseForm categories={categories ?? []} message={message} action={addExpense} />
    </main>
  )
}
