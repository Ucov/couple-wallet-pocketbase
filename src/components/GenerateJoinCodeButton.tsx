'use client'

import { useState } from 'react'
import { generateJoinCode } from '@/app/profile/actions'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

import { useRouter } from 'next/navigation'

export default function GenerateJoinCodeButton({ coupleId }: { coupleId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const res = await generateJoinCode(coupleId)
      if (res.error) {
        toast.error('Error: ' + res.error)
      } else {
        toast.success('Código generado con éxito: ' + res.code)
        router.refresh()
      }
    } catch (e: any) {
      toast.error('Error al generar código: ' + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleGenerate}
      disabled={isLoading}
      className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
    >
      <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
      Generar nuevo código
    </button>
  )
}
