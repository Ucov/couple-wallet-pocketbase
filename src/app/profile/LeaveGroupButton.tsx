'use client'

import { UserX } from 'lucide-react'
import { leaveCouple } from '../setup-couple/actions'

export default function LeaveGroupButton() {
  return (
    <form action={leaveCouple}>
      <button
        type="submit"
        className="w-full bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        onClick={(e) => {
          if (!window.confirm('¿Seguro que quieres salir del grupo actual? Dejarás de ver los gastos compartidos.')) {
            e.preventDefault()
          }
        }}
      >
        <UserX size={18} /> Salir del grupo
      </button>
    </form>
  )
}
