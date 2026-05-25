'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

export async function exportBackupData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  
  if (!profile?.couple_id) throw new Error('No estás en ninguna pareja')

  const [expenses, chores, shoppingItems] = await Promise.all([
    supabase.from('expenses').select('*').eq('couple_id', profile.couple_id),
    supabase.from('chores').select('*').eq('couple_id', profile.couple_id),
    supabase.from('shopping_items').select('*').eq('couple_id', profile.couple_id)
  ])

  return {
    success: true,
    data: {
      expenses: expenses.data || [],
      chores: chores.data || [],
      shopping_items: shoppingItems.data || []
    }
  }
}

// Un esquema básico para validar que el archivo importado tiene sentido
const backupSchema = z.object({
  expenses: z.array(z.any()).optional(),
  chores: z.array(z.any()).optional(),
  shopping_items: z.array(z.any()).optional(),
})

export async function importBackupData(jsonData: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('couple_id').eq('id', user.id).single()
  if (!profile?.couple_id) throw new Error('No estás en ninguna pareja')

  let parsed: any;
  try {
    parsed = JSON.parse(jsonData)
  } catch (e) {
    return { success: false, error: 'El archivo no es un JSON válido' }
  }

  const validation = backupSchema.safeParse(parsed)
  if (!validation.success) {
    return { success: false, error: 'El formato del archivo de backup es incorrecto' }
  }

  const { expenses, chores, shopping_items } = validation.data

  // Hacemos upserts básicos asegurando que el couple_id sea el correcto, para no sobreescribir datos ajenos
  try {
    if (expenses && expenses.length > 0) {
      const safeExpenses = expenses.map(e => ({ ...e, couple_id: profile.couple_id }))
      await supabase.from('expenses').upsert(safeExpenses)
    }
    
    if (chores && chores.length > 0) {
      const safeChores = chores.map(c => ({ ...c, couple_id: profile.couple_id }))
      await supabase.from('chores').upsert(safeChores)
    }

    if (shopping_items && shopping_items.length > 0) {
      const safeItems = shopping_items.map(s => ({ ...s, couple_id: profile.couple_id }))
      await supabase.from('shopping_items').upsert(safeItems)
    }

    return { success: true }
  } catch (e: any) {
    console.error('Error importing:', e)
    return { success: false, error: e.message || 'Error al importar datos' }
  }
}
