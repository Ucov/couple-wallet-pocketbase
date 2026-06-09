'use client'

import { Pencil } from 'lucide-react'
import Link from 'next/link'
import DeleteExpenseButton from '@/components/DeleteExpenseButton'

interface ExpenseItemProps {
  id: string
  concept: string
  amount: number
  date: string
  paidByStr: string
  categoryName: string
  categoryIcon: string
  isRefundable?: boolean
  isTransfer?: boolean
  status?: string
}

export default function ExpenseItem({
  id,
  concept,
  amount,
  date,
  paidByStr,
  categoryName,
  categoryIcon,
  isRefundable,
  isTransfer,
  status
}: ExpenseItemProps) {
  // Define colors based on type
  const isBizum = isTransfer
  const bgColor = isBizum ? 'bg-purple-950/20 border-purple-900/30' : 'bg-zinc-900/50 border-zinc-800/50'
  const iconBg = isBizum ? 'bg-purple-950/50 text-purple-400 border-purple-800/50' : 'bg-zinc-800'
  const amountColor = isBizum ? 'text-purple-300' : 'text-zinc-100'

  return (
    <div className={`relative w-full z-10 p-4 rounded-xl flex justify-between items-center border hover:bg-zinc-800/80 transition-colors backdrop-blur-xl mb-3 ${bgColor}`}>
      <div className="flex gap-3 items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border border-transparent flex-shrink-0 ${iconBg}`}>
          {isBizum ? '💸' : categoryIcon}
        </div>
        <div>
          <p className={`font-medium flex flex-wrap items-center gap-2 ${isBizum ? 'text-purple-300' : 'text-zinc-200'}`}>
            {concept}
            {isBizum && <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-purple-800">Bizum</span>}
            {isRefundable && <span className="text-[10px] bg-amber-950/50 text-amber-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-amber-900/50">Deuda</span>}
            {status === 'PENDING_AI' && <span className="text-[10px] bg-indigo-950/50 text-indigo-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-indigo-900/50 flex items-center gap-1"><span className="animate-pulse">🤖</span> IA</span>}
            {status === 'MISSING_RECEIPT' && <span className="text-[10px] bg-orange-950/50 text-orange-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-orange-900/50 flex items-center gap-1">📎 Falta Ticket</span>}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">
            {new Date(date).toLocaleDateString('es-ES')} • {isBizum ? 'Transferencia' : categoryName}
          </p>
        </div>
      </div>

      <div className="text-right flex items-center gap-3">
        <div className="mr-1">
          <p className={`font-bold ${amountColor}`}>€{amount.toFixed(2)}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5 font-semibold">
            {paidByStr}
          </p>
        </div>
        <div className="flex flex-col opacity-100 gap-1.5 flex-shrink-0">
            <Link href={`/edit/${id}`} className="text-zinc-500 hover:text-emerald-400 transition-colors p-1.5 bg-zinc-950/50 rounded border border-zinc-800/50 flex items-center justify-center">
              <Pencil size={14} />
            </Link>
            <div className="bg-zinc-950/50 rounded border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-red-400">
              <DeleteExpenseButton 
                id={id} 
                concept={concept} 
                amount={amount} 
              />
            </div>
        </div>
      </div>
    </div>
  )
}
