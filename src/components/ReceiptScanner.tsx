'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Tesseract from 'tesseract.js'
import { toast } from 'sonner'

interface ReceiptScannerProps {
  onScanComplete: (amount: string, concept?: string) => void
}

export default function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setProgress(0)
    setIsSuccess(false)
    setStatusText('Inicializando motor OCR...')

    try {
      const result = await Tesseract.recognize(file, 'spa', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
            setStatusText('Extrayendo texto del ticket...')
          } else {
            setStatusText('Cargando modelos de lenguaje...')
          }
        }
      })

      const text = result.data.text
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      
      // Intentar encontrar el importe (TOTAL, IMPORTE, EUROS, etc.)
      let amountFound = ''
      let maxAmount = 0
      
      for (const line of lines) {
        // Limpiar la línea de ruido común del OCR
        const cleanLine = line.replace(/[^a-zA-Z0-9.,€$:\s]/g, '')
        
        // 1. Buscar cualquier número con formato de moneda en la línea
        const numbersInLine = cleanLine.match(/\b\d+[.,]\d{2}\b/g)
        
        if (numbersInLine) {
          for (const numStr of numbersInLine) {
            const val = parseFloat(numStr.replace(',', '.'))
            if (val > maxAmount) maxAmount = val
          }
        }
      }

      if (maxAmount > 0) {
        amountFound = maxAmount.toFixed(2)
        setIsSuccess(true)
        setStatusText(`¡Encontrado: €${amountFound}!`)
        toast.success('Ticket escaneado correctamente')
        onScanComplete(amountFound, 'Ticket Escaneado')
      } else {
        setStatusText('No se pudo detectar el importe')
        toast.error('No se encontró ningún importe claro, introduce a mano')
      }

    } catch (error) {
      console.error(error)
      setStatusText('Error al escanear')
      toast.error('Falló el reconocimiento óptico')
    } finally {
      setTimeout(() => {
        setIsScanning(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }, 2000)
    }
  }

  return (
    <div className="w-full mb-6">
      <AnimatePresence mode="wait">
        {!isScanning ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-3"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all rounded-xl py-4 font-semibold shadow-lg"
            >
              <Camera size={20} />
              <span>Escanear Ticket</span>
            </button>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </motion.div>
        ) : (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full rounded-xl p-4 border flex flex-col items-center justify-center gap-3 ${isSuccess ? 'bg-emerald-900/40 border-emerald-500' : 'bg-zinc-900 border-emerald-500/50'}`}
          >
            {isSuccess ? (
              <CheckCircle2 size={32} className="text-emerald-400" />
            ) : (
              <div className="relative">
                <Loader2 size={32} className="text-emerald-500 animate-spin" />
                <FileText size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-300" />
              </div>
            )}
            
            <div className="text-center w-full">
              <p className="text-sm font-medium text-emerald-100">{statusText}</p>
              {!isSuccess && (
                <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
