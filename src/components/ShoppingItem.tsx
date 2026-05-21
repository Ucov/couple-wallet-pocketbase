'use client'

import { useTransition, useState, useEffect } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/shopping/actions'
import { CheckCircle2, Circle, Trash2, RotateCcw } from 'lucide-react'

interface ShoppingItemProps {
  id: string
  name: string
  status: 'pending' | 'bought'
}

export default function ShoppingItem({ id, name, status }: ShoppingItemProps) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(status)

  // Sincronizar estado local si el servidor cambia (ej. por Realtime)
  useEffect(() => {
    setLocalStatus(status)
  }, [status])

  const isBought = localStatus === 'bought'

  const handleToggle = () => {
    const nextStatus = isBought ? 'pending' : 'bought'
    setLocalStatus(nextStatus)
    
    // Pequeño retraso para ver la animación de tachado antes de mandarlo al servidor
    setTimeout(() => {
      startTransition(() => {
        toggleShoppingItem(id, status)
      })
    }, 400)
  }

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este artículo del historial definitivamente?')) {
      startTransition(() => {
        deleteShoppingItem(id)
      })
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
      isBought 
        ? 'bg-zinc-900/40 border-zinc-800/40 opacity-60 scale-[0.98]' 
        : 'bg-zinc-900 border-zinc-800 shadow-sm'
    } ${isPending ? 'opacity-30 pointer-events-none' : ''}`}>
      
      <button 
        onClick={handleToggle}
        className="flex items-center gap-4 flex-1 text-left"
      >
        <div className={`transition-all duration-300 ${isBought ? 'text-emerald-500 scale-110' : 'text-zinc-400 hover:scale-110'}`}>
          {isBought ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </div>
        <span className={`text-lg font-medium transition-all duration-300 ${
          isBought ? 'text-zinc-500 line-through' : 'text-zinc-200'
        }`}>
          {name}
        </span>
      </button>

      {isBought && (
        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={handleToggle}
            className="p-2 text-zinc-500 hover:text-emerald-400 transition-colors"
            title="Volver a añadir"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
            title="Eliminar del historial"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
