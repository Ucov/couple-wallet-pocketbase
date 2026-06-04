'use server'

import { createClient } from '@/utils/pocketbase/server'
import { z } from 'zod'

export async function exportBackupData() {
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model
  
  if (!user?.couple_id) throw new Error('No estás en ninguna pareja')

  const filter = `couple_id="${user.couple_id}"`

  const [expenses, chores, shoppingItems] = await Promise.all([
    pb.collection('expenses').getFullList({ filter }),
    pb.collection('chores').getFullList({ filter }),
    pb.collection('shopping_items').getFullList({ filter })
  ])

  return {
    success: true,
    data: {
      expenses: expenses || [],
      chores: chores || [],
      shopping_items: shoppingItems || []
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
  const pb = await createClient()
  if (!pb.authStore.isValid) throw new Error('Not authenticated')
  const user = pb.authStore.model

  if (!user?.couple_id) throw new Error('No estás en ninguna pareja')

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
      for (const e of expenses) {
        delete e.id // PB auto-generates or we need to update by id. Let's just create them for simplicity as backups or create if not exists
        await pb.collection('expenses').create({ ...e, couple_id: user.couple_id })
      }
    }
    
    if (chores && chores.length > 0) {
      for (const c of chores) {
        delete c.id
        await pb.collection('chores').create({ ...c, couple_id: user.couple_id })
      }
    }

    if (shopping_items && shopping_items.length > 0) {
      for (const s of shopping_items) {
        delete s.id
        await pb.collection('shopping_items').create({ ...s, couple_id: user.couple_id })
      }
    }

    return { success: true }
  } catch (e: any) {
    console.error('Error importing:', e)
    return { success: false, error: e.message || 'Error al importar datos' }
  }
}
