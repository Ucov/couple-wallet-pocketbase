'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { addShoppingItem } from '@/app/shopping/actions'
import { toast } from 'sonner'

export default function AddShoppingFormClient({ uniqueNames, coupleId }: { uniqueNames: string[], coupleId: string }) {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    const formData = new FormData()
    formData.append('name', name)
    
    setName('')

    startTransition(async () => {
      const result = await addShoppingItem(formData)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      
      // Broadcast to other clients - not implemented in PB yet
    })
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-8 z-20">
      <input
        type="text"
        name="name"
        value={name}
        onChange={e => setName(e.target.value)}
        list="shopping-history"
        placeholder="Ej: Leche, Huevos, Papel..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg text-lg"
        required
        autoComplete="off"
      />
      <datalist id="shopping-history">
        {uniqueNames.map(n => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <button 
        type="submit" 
        disabled={isPending || !name.trim()}
        className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl aspect-square flex items-center justify-center transition-transform active:scale-95"
      >
        <Plus size={24} />
      </button>
    </form>
  )
}
