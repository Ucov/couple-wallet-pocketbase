import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const pb = await createClient()
  
  if (!pb.authStore.isValid) redirect('/login')
  const user = pb.authStore.model

  if (!user?.couple_id) redirect('/setup-couple')

  // Obtener eventos desde hace 7 días hasta los próximos 60 días
  const past = new Date()
  past.setDate(past.getDate() - 365)
  
  const future = new Date()
  future.setDate(future.getDate() + 365)

  let events: any[] = []
  try {
    events = await pb.collection('calendar_events').getFullList({
      filter: `couple_id="${user.couple_id}" && date >= "${past.toISOString().replace('T', ' ')}" && date <= "${future.toISOString().replace('T', ' ')}"`,
      sort: 'date'
    })
  } catch(e) {}

  return (
    <main className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32">
      <header className="px-6 py-6 pb-2">
        <h1 className="text-2xl font-bold text-zinc-100">Agenda Común</h1>
        <p className="text-sm text-zinc-500 mt-1">Sincronizados en todo momento</p>
      </header>

      <CalendarClient initialEvents={events || []} coupleId={user.couple_id} />
    </main>
  )
}
