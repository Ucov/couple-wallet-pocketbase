'use client'

import { useTransition, useState, useEffect } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/shopping/actions'
import { X } from 'lucide-react'

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
    
    startTransition(() => {
      toggleShoppingItem(id, status)
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent toggling when clicking delete
    if (window.confirm('¿Eliminar este artículo del historial definitivamente?')) {
      startTransition(() => {
        deleteShoppingItem(id)
      })
    }
  }

  return (
    <div 
      className={`relative group inline-flex items-center justify-center px-4 py-3 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer active:scale-95 select-none ${
        isBought 
          ? 'bg-zinc-900 border border-zinc-800/80 opacity-70' 
          : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500'
      } ${isPending ? 'opacity-40 pointer-events-none' : ''}`}
      onClick={handleToggle}
    >
      <span className={`text-[15px] font-semibold transition-all duration-300 ${
        isBought ? 'text-zinc-500 line-through' : 'text-white'
      }`}>
        {name}
      </span>

      {isBought && (
        <button 
          onClick={handleDelete}
          className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:bg-red-950/80 hover:text-red-400 p-1.5 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all border border-zinc-700/50"
          title="Eliminar del historial"
        >
          <X size={12} strokeWidth={3} />
        </button>
      )}
    </div>
  )
}
