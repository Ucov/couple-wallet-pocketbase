'use client'

import { useTransition, useState, useEffect } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/shopping/actions'
import { X } from 'lucide-react'
import { getGroceryIcon } from '@/utils/groceryIcons'

interface ShoppingItemProps {
  id: string
  name: string
  status: 'pending' | 'bought'
  onUpdate?: () => void
}

export default function ShoppingItem({ id, name, status, onUpdate }: ShoppingItemProps) {
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
    
    startTransition(async () => {
      await toggleShoppingItem(id, status)
      onUpdate?.()
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent toggling when clicking delete
    if (window.confirm('¿Eliminar este artículo del historial definitivamente?')) {
      startTransition(async () => {
        await deleteShoppingItem(id)
        onUpdate?.()
      })
    }
  }

  const Icon = getGroceryIcon(name)

  return (
    <div 
      className={`relative group flex flex-col items-center justify-center p-4 min-w-[80px] rounded-2xl transition-all duration-300 shadow-sm cursor-pointer active:scale-95 select-none ${
        isBought 
          ? 'bg-zinc-900 border border-zinc-800/80 opacity-70 grayscale' 
          : 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 shadow-emerald-900/20'
      } ${isPending ? 'opacity-40 pointer-events-none' : ''}`}
      onClick={handleToggle}
    >
      <div className={`mb-2 transition-transform duration-300 ${isBought ? 'scale-90 opacity-50' : 'scale-100 drop-shadow-md'}`}>
        <Icon size={28} className={isBought ? 'text-zinc-500' : 'text-white'} />
      </div>

      <span className={`text-[13px] font-semibold text-center leading-tight transition-all duration-300 ${
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
