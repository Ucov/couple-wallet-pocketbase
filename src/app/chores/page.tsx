import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import ChoresClient from './ChoresClient'

export const dynamic = 'force-dynamic'

export default async function ChoresPage() {
  const pb = await createClient()
  if (!pb.authStore.isValid) redirect('/login')
  const user = pb.authStore.model

  if (!user?.couple_id) redirect('/setup-couple')

  let partnerProfile: any = null
  try {
    partnerProfile = await pb.collection('users').getFirstListItem(`couple_id="${user.couple_id}" && id!="${user.id}"`)
  } catch(e) {}

  let chores: any[] = []
  try {
    chores = await pb.collection('chores').getFullList({
      filter: `couple_id="${user.couple_id}"`
    })
  } catch(e) {}

  return (
    <main className="w-full max-w-md mx-auto min-h-screen flex flex-col pb-32">
      <header className="px-6 py-6 pb-2">
        <h1 className="text-2xl font-bold text-zinc-100">Tareas Domésticas</h1>
        <p className="text-sm text-zinc-500 mt-1">Repartiendo el trabajo en equipo</p>
      </header>

      <ChoresClient 
        initialChores={chores || []} 
        coupleId={user.couple_id} 
        currentUserId={user.id}
        currentUserName={user.name || 'Tú'}
        partnerId={partnerProfile?.id || null}
        partnerName={partnerProfile?.name || 'Pareja'}
      />
    </main>
  )
}
