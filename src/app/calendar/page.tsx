import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id, name')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/setup-couple')

  // Obtener eventos desde hace 7 días hasta los próximos 60 días
  const past = new Date()
  past.setDate(past.getDate() - 365)
  
  const future = new Date()
  future.setDate(future.getDate() + 365)

  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .gte('date', past.toISOString())
    .lte('date', future.toISOString())
    .order('date', { ascending: true })

  return (
    <main className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32">
      <header className="px-6 py-6 pb-2">
        <h1 className="text-2xl font-bold text-zinc-100">Agenda Común</h1>
        <p className="text-sm text-zinc-500 mt-1">Sincronizados en todo momento</p>
      </header>

      <CalendarClient initialEvents={events || []} coupleId={profile.couple_id} />
    </main>
  )
}
