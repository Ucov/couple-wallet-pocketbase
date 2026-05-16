'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionState = { error: string | null }

export async function deleteExpenseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get('id') as string
  if (!id) return { error: 'Falta el identificador del gasto' }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.code === 'PGRST116'
      ? 'No se pudo eliminar el gasto (no existe o no tienes permiso)'
      : error.message }
  }

  revalidatePath('/')
  return { error: null }
}

export async function updateExpenseAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const amount = parseFloat(formData.get('amount') as string)
  const concept = formData.get('concept') as string
  const category_id = formData.get('category_id') as string
  const date = formData.get('date') as string

  if (!amount || !concept) {
    return { error: 'Faltan campos obligatorios' }
  }

  // Validar que la fecha no sea futura
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  if (selectedDate > today) {
    return { error: 'La fecha no puede ser futura' }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { error } = await supabase
    .from('expenses')
    .update({
      amount,
      concept,
      category_id: category_id || null,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.code === 'PGRST116'
      ? 'No se pudo actualizar el gasto (no existe o no tienes permiso)'
      : error.message }
  }

  revalidatePath('/')
  redirect('/')
}
