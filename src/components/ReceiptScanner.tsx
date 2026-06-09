'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadDraftExpense } from '@/app/add/draft-actions'
import imageCompression from 'browser-image-compression'

export default function ReceiptScanner() {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      // Comprimir imagen antes de subir para que sea instantáneo
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      }
      const compressedFile = await imageCompression(file, options)

      const formData = new FormData()
      formData.append('receipt', compressedFile, file.name)
      
      await uploadDraftExpense(formData)
    } catch (error) {
      console.error(error)
      // Si redirect() lanza un error interno de Next, se ignorará
      setIsUploading(false)
    }
  }

  return (
    <div className="w-full mb-6">
      {!isUploading ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all rounded-xl py-4 font-semibold shadow-lg"
          >
            <Camera size={20} />
            <span>Escaneo Rápido (IA)</span>
          </button>
          <input
            type="file"
            name="receipt"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        <div className="w-full rounded-xl p-4 border flex flex-col items-center justify-center gap-3 bg-zinc-900 border-emerald-500/50">
          <Loader2 size={32} className="text-emerald-500 animate-spin" />
          <div className="text-center w-full">
            <p className="text-sm font-medium text-emerald-100">Enviando ticket a IA...</p>
          </div>
        </div>
      )}
    </div>
  )
}
