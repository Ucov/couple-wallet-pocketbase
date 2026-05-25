'use client'

import { useState, useRef } from 'react'
import { Download, Upload, Loader2 } from 'lucide-react'
import { exportBackupData, importBackupData } from './backup-actions'
import { toast } from 'sonner'

export default function BackupPanel() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await exportBackupData()
      if (res.success && res.data) {
        const json = JSON.stringify(res.data, null, 2)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `couple-wallet-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Backup exportado con éxito')
      } else {
        toast.error('Error al exportar los datos')
      }
    } catch (e) {
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        const res = await importBackupData(content)
        if (res.success) {
          toast.success('Datos importados correctamente')
          // Opción de forzar recarga si fuera necesario
          setTimeout(() => window.location.reload(), 1000)
        } else {
          toast.error(res.error || 'Error al importar')
        }
      } catch (err) {
        toast.error('Error al procesar el archivo')
      } finally {
        setIsImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-4 mt-2">
      <button 
        onClick={handleExport}
        disabled={isExporting || isImporting}
        className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors border border-zinc-700"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        Exportar
      </button>

      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isExporting || isImporting}
        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-900/50 disabled:opacity-50 rounded-xl py-3 font-semibold transition-colors"
      >
        {isImporting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        Importar
      </button>
      
      <input 
        type="file" 
        accept=".json" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImport}
      />
    </div>
  )
}
