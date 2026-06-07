'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { PlusCircle, Trash2, X } from 'lucide-react'
import { addChore, toggleChoreStatus, deleteChore } from './actions'
import { getChoreIcon } from '@/utils/choreIcons'

interface Chore {
  id: string
  title: string
  is_completed: boolean
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

import { useRouter } from 'next/navigation'

export default function ChoresClient({ initialChores, coupleId, currentUserId, currentUserName, partnerId, partnerName }: Props) {
  const [chores, setChores] = useState<Chore[]>(initialChores)
  const [newTitle, setNewTitle] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    setChores(initialChores)
  }, [initialChores])

  // Realtime robusto mediante Broadcast + Refresh
  useEffect(() => {
    // PocketBase real-time not implemented yet
  }, [coupleId, router])

  const broadcastSync = () => {
    // PocketBase real-time not implemented yet
  }

  const pendingChores = chores.filter(c => !c.is_completed)
  const doneChores = chores.filter(c => c.is_completed)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const tempTitle = newTitle
    // Optimistic: add immediately
    const tempId = crypto.randomUUID()
    setChores(prev => [{ id: tempId, title: tempTitle, is_completed: false, assigned_to: null }, ...prev])
    setNewTitle('')
    startTransition(async () => { 
      await addChore(tempTitle) 
      broadcastSync()
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    setChores(prev => prev.map(c => c.id === id ? { ...c, is_completed: !currentStatus } : c))
    startTransition(async () => { 
      const res = await toggleChoreStatus(id, !currentStatus)
      if (res?.error) alert('Error: ' + res.error)
      else broadcastSync()
    })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setChores(prev => prev.filter(c => c.id !== id))
    startTransition(async () => { 
      const res = await deleteChore(id)
      if (res?.error) alert('Error: ' + res.error)
      else broadcastSync()
    })
  }

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      
      {/* Añadir Tarea */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="Ej: Poner la lavadora..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <button type="submit" disabled={!newTitle.trim()} className="bg-emerald-600 text-white p-3 rounded-2xl disabled:opacity-50 active:scale-95 transition-transform">
          <PlusCircle size={24} />
        </button>
      </form>

      {/* Tareas Pendientes - Estilo Tile */}
      <section>
        <h2 className="text-sm text-zinc-400 font-semibold uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Para Hacer</span>
          <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full text-xs">{pendingChores.length}</span>
        </h2>

        {pendingChores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-zinc-900/20 border-2 border-dashed border-zinc-800/50 rounded-3xl">
            <div className="w-14 h-14 bg-emerald-950/30 text-emerald-500 rounded-full flex items-center justify-center mb-3">
              <Trash2 size={28} />
            </div>
            <p className="text-zinc-400 font-medium">¡Todo limpio!</p>
            <p className="text-sm text-zinc-600 mt-1">No hay tareas pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pendingChores.map(chore => {
              const Icon = getChoreIcon(chore.title)
              return (
                <div
                  key={chore.id}
                  onClick={() => handleToggle(chore.id, chore.is_completed)}
                  className="relative group flex flex-col items-center justify-center p-4 min-w-[90px] max-w-[110px] rounded-2xl transition-all duration-200 shadow-sm cursor-pointer active:scale-95 select-none bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 shadow-emerald-900/20"
                >
                  <div className="mb-2 drop-shadow-md">
                    <Icon size={28} className="text-white" />
                  </div>
                  <span className="text-[12px] font-semibold text-center leading-tight text-white line-clamp-2">
                    {chore.title}
                  </span>

                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Tareas Completadas */}
      {doneChores.length > 0 && (
        <section>
          <h2 className="text-sm text-zinc-600 font-semibold uppercase tracking-wider mb-4">Completadas</h2>
          <div className="flex flex-wrap gap-2">
            {doneChores.map(chore => {
              const Icon = getChoreIcon(chore.title)
              return (
                <div
                  key={chore.id}
                  onClick={() => handleToggle(chore.id, chore.is_completed)}
                  className="relative group flex flex-col items-center justify-center p-4 min-w-[90px] max-w-[110px] rounded-2xl transition-all duration-200 shadow-sm cursor-pointer active:scale-95 select-none bg-zinc-900 border border-zinc-800/80 opacity-70 grayscale"
                >
                  <div className="mb-2 scale-90 opacity-50">
                    <Icon size={28} className="text-zinc-500" />
                  </div>
                  <span className="text-[12px] font-semibold text-center leading-tight text-zinc-500 line-clamp-2 line-through">
                    {chore.title}
                  </span>
                  {/* Botón borrar */}
                  <button
                    onClick={(e) => handleDelete(e, chore.id)}
                    className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:bg-red-950/80 hover:text-red-400 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-zinc-700/50"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
