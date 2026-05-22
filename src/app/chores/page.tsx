import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ChoresClient from './ChoresClient'

export const dynamic = 'force-dynamic'

export default async function ChoresPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id, name')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) redirect('/setup-couple')

  // Obtener perfil de la pareja para las asignaciones
  const { data: partnerProfile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('couple_id', profile.couple_id)
    .neq('id', user.id)
    .maybeSingle()

  const { data: chores } = await supabase
    .from('chores')
    .select('*')
    .eq('couple_id', profile.couple_id)
    .order('created_at', { ascending: false })

  return (
    <main className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32">
      <header className="px-6 py-6 pb-2">
        <h1 className="text-2xl font-bold text-zinc-100">Tareas Domésticas</h1>
        <p className="text-sm text-zinc-500 mt-1">Repartiendo el trabajo en equipo</p>
      </header>

      <ChoresClient 
        initialChores={chores || []} 
        coupleId={profile.couple_id} 
        currentUserId={user.id}
        currentUserName={profile.name || 'Tú'}
        partnerId={partnerProfile?.id || null}
        partnerName={partnerProfile?.name || 'Pareja'}
      />
    </main>
  )
}
