'use client'

import { useTransition } from 'react'
import { toggleShoppingItem, deleteShoppingItem } from '@/app/shopping/actions'
import { CheckCircle2, Circle, Trash2, RotateCcw } from 'lucide-react'

interface ShoppingItemProps {
  id: string
  name: string
  status: 'pending' | 'bought'
}

export default function ShoppingItem({ id, name, status }: ShoppingItemProps) {
  const [isPending, startTransition] = useTransition()
  const isBought = status === 'bought'

  const handleToggle = () => {
    startTransition(() => {
      toggleShoppingItem(id, status)
    })
  }

  const handleDelete = () => {
    if (confirm('¿Eliminar este artículo del historial definitivamente?')) {
      startTransition(() => {
        deleteShoppingItem(id)
      })
    }
  }

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
      isBought 
        ? 'bg-zinc-900/40 border-zinc-800/40 opacity-70' 
        : 'bg-zinc-900 border-zinc-800 shadow-sm'
    } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      
      <button 
        onClick={handleToggle}
        className="flex items-center gap-4 flex-1 text-left"
      >
        <div className={`transition-colors ${isBought ? 'text-emerald-500/50' : 'text-zinc-400'}`}>
          {isBought ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </div>
        <span className={`text-lg font-medium transition-all ${
          isBought ? 'text-zinc-500 line-through' : 'text-zinc-200'
        }`}>
          {name}
        </span>
      </button>

      {isBought && (
        <div className="flex items-center gap-2">
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
