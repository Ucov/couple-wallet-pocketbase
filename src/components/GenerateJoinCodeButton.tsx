'use client'

import { useState } from 'react'
import { generateJoinCode } from '@/app/profile/actions'
import { toast } from 'sonner'
import { RefreshCw, Copy, Check, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GenerateJoinCodeButton({ coupleId }: { coupleId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsLoading(true)
    setCopied(false)
    try {
      const res = await generateJoinCode(coupleId)
      if (res.error) {
        toast.error('Error: ' + res.error)
      } else {
        setGeneratedCode(res.code || null)
        toast.success('¡Código generado!')
        router.refresh()
      }
    } catch (e: any) {
      toast.error('Error al generar código: ' + e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedCode) return
    try {
      await navigator.clipboard.writeText(generatedCode)
      setCopied(true)
      toast.success('¡Código copiado!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {generatedCode && (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-400/5 pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400/80 font-semibold uppercase tracking-widest">
                Tu código de pareja
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-zinc-950/80 backdrop-blur-sm p-3 rounded-lg border border-zinc-700/50">
              <span className="font-mono text-emerald-400 tracking-[0.3em] font-bold text-xl select-all">
                {generatedCode}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-zinc-500 mt-2.5 text-center">
              Comparte este código con tu pareja para que se una a tu grupo
            </p>
          </div>
        </div>
      )}

      <button 
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
      >
        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        {generatedCode ? 'Regenerar código' : 'Generar nuevo código'}
      </button>
    </div>
  )
}
