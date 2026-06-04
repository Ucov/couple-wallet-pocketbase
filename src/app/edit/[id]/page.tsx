import { createClient } from '@/utils/pocketbase/server'
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
  const pb = await createClient()

  let expense: any = null
  try {
    expense = await pb.collection('expenses').getOne(id)
  } catch(e) {
    notFound()
  }

  let categories: any[] = []
  try {
    categories = await pb.collection('categories').getFullList({ sort: 'name' })
  } catch(e) {}

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
