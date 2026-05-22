'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { PlusCircle, Trash2, CheckCircle2, Circle, User } from 'lucide-react'
import { addChore, toggleChoreStatus, assignChore, deleteChore } from './actions'
import { createClient } from '@/utils/supabase/client'

interface Chore {
  id: string
  title: string
  is_done: boolean
  assigned_to: string | null
}

interface Props {
  initialChores: Chore[]
  coupleId: string
  currentUserId: string
  currentUserName: string
  partnerId: string | null
  partnerName: string
}

export default function ChoresClient({ initialChores, coupleId, currentUserId, currentUserName, partnerId, partnerName }: Props) {
  const [chores, setChores] = useState<Chore[]>(initialChores)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const supabase = useMemo(() => createClient(), [])

  // Sincronizar con props del servidor
  useEffect(() => {
    setChores(initialChores)
  }, [initialChores])

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('[Realtime] No hay sesión activa para chores')
        return
      }

      console.log('[Realtime] Configurando canal chores...')

      channel = supabase
        .channel(`chores_rt_${coupleId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chores' },
          (payload) => {
            console.log('[Realtime] INSERT chore:', payload.new)
            setChores(prev => {
              if (prev.some(i => i.id === payload.new.id)) return prev
              return [payload.new as Chore, ...prev]
            })
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chores' },
          (payload) => {
            console.log('[Realtime] UPDATE chore:', payload.new)
            setChores(prev => prev.map(i => i.id === payload.new.id ? payload.new as Chore : i))
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'chores' },
          (payload) => {
            console.log('[Realtime] DELETE chore:', payload.old)
            setChores(prev => prev.filter(i => i.id !== payload.old.id))
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] chores status:', status)
          if (err) console.error('[Realtime] chores error:', err)
        })
    }

    setupRealtime()

    return () => {
      if (channel) {
        console.log('[Realtime] Limpiando canal chores')
        supabase.removeChannel(channel)
      }
    }
  }, [coupleId, supabase])

  const pendingChores = chores.filter(c => !c.is_done)
  const doneChores = chores.filter(c => c.is_done)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const tempTitle = newTitle
    setNewTitle('')
    startTransition(() => { addChore(coupleId, tempTitle) })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    // Optimistic update
    setChores(prev => prev.map(c => c.id === id ? { ...c, is_done: !currentStatus } : c))
    startTransition(() => { toggleChoreStatus(id, !currentStatus) })
  }

  const handleAssign = (id: string, currentAssigned: string | null) => {
    let nextAssigned: string | null = null
    if (currentAssigned === null) nextAssigned = currentUserId
    else if (currentAssigned === currentUserId && partnerId) nextAssigned = partnerId
    else nextAssigned = null

    // Optimistic update
    setChores(prev => prev.map(c => c.id === id ? { ...c, assigned_to: nextAssigned } : c))
    startTransition(() => { assignChore(id, nextAssigned) })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta tarea definitivamente?')) {
      setChores(prev => prev.filter(c => c.id !== id))
      startTransition(() => { deleteChore(id) })
    }
  }

  const renderAssignee = (assigned_to: string | null) => {
    if (assigned_to === currentUserId) return <div className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold">{currentUserName}</div>
    if (assigned_to === partnerId) return <div className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md font-bold">{partnerName}</div>
    return <div className="text-xs text-zinc-500 flex items-center gap-1"><User size={12}/> Sin asignar</div>
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-8">
      
      {/* Añadir Tarea */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Ej: Limpiar los cristales..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button type="submit" disabled={!newTitle.trim() || isPending} className="bg-emerald-600 text-white p-3 rounded-2xl disabled:opacity-50">
          <PlusCircle size={24} />
        </button>
      </form>

      {/* Tareas Pendientes */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Para Hacer ({pendingChores.length})</h2>
        <div className="space-y-3">
          {pendingChores.map(chore => (
            <div key={chore.id} className="bg-zinc-900 border border-zinc-800/80 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <button onClick={() => handleToggle(chore.id, chore.is_done)} className="text-zinc-500 hover:text-emerald-400 transition-colors mr-3 shrink-0">
                <Circle size={24} />
              </button>
              
              <div className="flex-1 text-zinc-200 font-medium">
                {chore.title}
              </div>

              <button onClick={() => handleAssign(chore.id, chore.assigned_to)} className="ml-2 shrink-0">
                {renderAssignee(chore.assigned_to)}
              </button>
            </div>
          ))}
          {pendingChores.length === 0 && (
            <p className="text-center text-zinc-600 py-4 text-sm">¡Todo limpio por ahora!</p>
          )}
        </div>
      </section>

      {/* Tareas Hechas */}
      {doneChores.length > 0 && (
        <section className="opacity-70">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Completadas</h2>
          <div className="space-y-3">
            {doneChores.map(chore => (
              <div key={chore.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between">
                <button onClick={() => handleToggle(chore.id, chore.is_done)} className="text-emerald-500 hover:text-zinc-400 transition-colors mr-3 shrink-0">
                  <CheckCircle2 size={24} />
                </button>
                
                <div className="flex-1 text-zinc-500 line-through font-medium">
                  {chore.title}
                </div>

                <button onClick={() => handleDelete(chore.id)} className="ml-2 text-zinc-700 hover:text-red-400 shrink-0 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
