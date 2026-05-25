'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type ActionState = { error: string | null }

const expenseSchema = z.object({
  amount: z.number().positive('La cantidad debe ser mayor a 0'),
  concept: z.string().min(1, 'El concepto es obligatorio'),
  category_id: z.string().uuid('Categoría no válida').optional().nullable(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  is_refundable: z.boolean().optional().default(false),
})

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

  if (error) {
    console.error('Error deleting expense:', error)
    return { 
      error: error.code === 'PGRST116'
        ? 'No se pudo eliminar el gasto (no existe o no tienes permiso)'
        : error.message 
    }
  }

  revalidatePath('/')
  return { error: null }
}

export async function updateExpenseAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const rawData = {
    amount: parseFloat(formData.get('amount') as string),
    concept: formData.get('concept') as string,
    category_id: formData.get('category_id') as string || null,
    date: formData.get('date') as string,
    is_refundable: formData.get('is_refundable') === 'on',
  }

  const validatedFields = expenseSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { amount, concept, category_id, date, is_refundable } = validatedFields.data

  const { error } = await supabase
    .from('expenses')
    .update({
      amount,
      concept,
      category_id,
      date: new Date(date).toISOString(),
      is_refundable,
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating expense:', error)
    return { 
      error: error.code === 'PGRST116'
        ? 'No se pudo actualizar el gasto (no existe o no tienes permiso)'
        : error.message 
    }
  }

  revalidatePath('/')
  redirect('/')
}
