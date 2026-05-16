import { createClient } from '@/utils/supabase/server'
import EditExpenseForm from '@/components/EditExpenseForm'
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

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!expense) {
    notFound()
  }

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex items-center py-6 mb-4">
        <Link href="/" className="text-zinc-400 hover:text-white mr-4">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold">Editar Gasto</h1>
      </header>

      <EditExpenseForm expense={expense} categories={categories ?? []} />
    </main>
  )
}
