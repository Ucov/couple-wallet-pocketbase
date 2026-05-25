'use client'

import { useTheme } from '@/components/ThemeProvider'
import { Check } from 'lucide-react'

export default function ColorSelector() {
  const { appColor, setAppColor } = useTheme()

  const colors = [
    { id: 'emerald', name: 'Verde', hex: '#10b981' },
    { id: 'blue', name: 'Azul', hex: '#3b82f6' },
    { id: 'violet', name: 'Morado', hex: '#8b5cf6' },
    { id: 'rose', name: 'Rosa', hex: '#f43f5e' },
    { id: 'amber', name: 'Naranja', hex: '#f59e0b' },
  ]

  return (
    <div className="flex gap-4 items-center flex-wrap">
      {colors.map(color => (
        <button
          key={color.id}
          onClick={() => setAppColor(color.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md ${
            appColor === color.id ? 'ring-4 ring-offset-2 ring-offset-zinc-900 scale-110' : 'ring-1 ring-white/10'
          }`}
          style={{ backgroundColor: color.hex, ringColor: color.hex }}
          aria-label={`Seleccionar color ${color.name}`}
        >
          {appColor === color.id && <Check className="text-white drop-shadow-md" size={20} strokeWidth={3} />}
        </button>
      ))}
    </div>
  )
}
