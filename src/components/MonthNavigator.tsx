'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Props {
  currentMonth: number
  currentYear: number
  monthName: string
}

export default function MonthNavigator({ currentMonth, currentYear, monthName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear

  const handleNavigate = (m: number, y: number) => {
    startTransition(() => {
      router.push(`/?month=${m}&year=${y}`)
    })
  }

  return (
    <div className="flex justify-between items-center mb-6 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800 relative overflow-hidden">
      <button 
        onClick={() => handleNavigate(prevMonth, prevYear)}
        disabled={isPending}
        className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-2">
        <span className="font-semibold text-zinc-200 capitalize">{monthName} {currentYear}</span>
        {isPending && <Loader2 size={14} className="animate-spin text-emerald-500 absolute right-12" />}
      </div>
      
      <button 
        onClick={() => handleNavigate(nextMonth, nextYear)}
        disabled={isPending}
        className="p-2 text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
