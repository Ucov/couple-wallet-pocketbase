import { createClient } from '@/utils/pocketbase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProfileForm from './ProfileForm'
import CopyCodeButton from './CopyCodeButton'
import LeaveGroupButton from './LeaveGroupButton'
import PushNotificationsClient from '@/components/PushNotificationsClient'
import BackupPanel from './BackupPanel'
import ColorSelector from './ColorSelector'
import ThemeToggle from '@/components/ThemeToggle'
import GenerateJoinCodeButton from '@/components/GenerateJoinCodeButton'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const pb = await createClient()
  if (!pb.authStore.isValid) {
    redirect('/login')
  }
  const user = pb.authStore.model

  let joinCode = null;
  if (user?.couple_id) {
    try {
      const couple = await pb.collection('couples').getOne(user.couple_id)
      joinCode = couple?.join_code
    } catch(e) {}
  }

  return (
    <main className="w-full max-w-md mx-auto p-4 flex flex-col min-h-screen">
      <header className="flex items-center justify-between py-6 mb-2">
        <h1 className="text-2xl font-bold">Perfil y Seguridad</h1>
      </header>
      
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 shadow-lg">
        <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4">Ajustes Personales</h2>
        <ProfileForm initialName={user?.name || ''} />
        
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4">Apariencia</h2>
          <ColorSelector />
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">Modo Oscuro / Claro</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      {user?.couple_id && (
        <PushNotificationsClient coupleId={user.couple_id} />
      )}

      {user?.couple_id && (
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4">Código de Pareja</h2>
          <p className="text-zinc-300 text-sm mb-4">Comparte este código con tu pareja si aún no se ha unido a tu grupo.</p>
          
          {joinCode ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="font-mono text-emerald-400 tracking-widest font-bold text-lg">{joinCode}</span>
                <CopyCodeButton code={joinCode} />
              </div>
              <GenerateJoinCodeButton coupleId={user.couple_id} />
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl text-sm mb-4">
              <p>Tu grupo no tiene un código de pareja asignado o no tienes permisos para verlo.</p>
              <GenerateJoinCodeButton coupleId={user.couple_id} />
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4">Copia de Seguridad</h2>
            <p className="text-zinc-500 text-xs mb-4">Exporta o importa todo el historial de gastos y tareas de la pareja. Guarda el archivo .json en un lugar seguro.</p>
            <BackupPanel />
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <LeaveGroupButton />
          </div>
        </section>
      )}
    </main>
  )
}
