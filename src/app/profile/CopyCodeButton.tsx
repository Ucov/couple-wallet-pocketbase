'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="text-zinc-400 hover:text-white transition-colors bg-zinc-800 p-2 rounded-lg"
      title="Copiar código"
    >
      {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
    </button>
  )
}
