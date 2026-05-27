'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Trash2, Pencil } from 'lucide-react'
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
}

export default function SwipeableExpenseItem({
  id,
  concept,
  amount,
  date,
  paidByStr,
  categoryName,
  categoryIcon,
  isRefundable,
  isTransfer
}: ExpenseItemProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-100, 0], [1, 0])
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80) {
      // Trigger delete confirmation or delete directly
      // For now, we'll snap it to open state so they can click the delete button
    }
  }

  // Define colors based on type
  const isBizum = isTransfer
  const bgColor = isBizum ? 'bg-purple-950/20 border-purple-900/30' : 'bg-zinc-900/50 border-zinc-800/50'
  const iconBg = isBizum ? 'bg-purple-950/50 text-purple-400 border-purple-800/50' : 'bg-zinc-800'
  const amountColor = isBizum ? 'text-purple-300' : 'text-zinc-100'

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl mb-3"
    >
      {/* Background Actions (Delete) */}
      <div className="absolute inset-y-0 right-0 w-full bg-red-900/40 flex items-center justify-end px-6 rounded-xl">
        <motion.div style={{ opacity }} className="text-red-400 font-semibold flex items-center gap-2">
          <Trash2 size={20} />
          Desliza para borrar
        </motion.div>
      </div>

      {/* Foreground Draggable Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`relative w-full z-10 p-4 rounded-xl flex justify-between items-center border hover:bg-zinc-800/80 transition-colors backdrop-blur-xl ${bgColor}`}
      >
        <div className="flex gap-3 items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border border-transparent ${iconBg}`}>
            {isBizum ? '💸' : categoryIcon}
          </div>
          <div>
            <p className={`font-medium flex items-center gap-2 ${isBizum ? 'text-purple-300' : 'text-zinc-200'}`}>
              {concept}
              {isBizum && <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-purple-800">Bizum</span>}
              {isRefundable && <span className="text-[10px] bg-amber-950/50 text-amber-500 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-amber-900/50">Deuda</span>}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {new Date(date).toLocaleDateString('es-ES')} • {isBizum ? 'Transferencia' : categoryName}
            </p>
          </div>
        </div>

        <div className="text-right flex items-center gap-2">
          <div className="mr-2">
            <p className={`font-bold ${amountColor}`}>€{amount.toFixed(2)}</p>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5 font-semibold">
              {paidByStr}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1">
             <Link href={`/edit/${id}`} className="text-zinc-600 hover:text-emerald-400 transition-colors p-1 bg-zinc-900 rounded-lg border border-zinc-800">
               <Pencil size={16} />
             </Link>
             <DeleteExpenseButton 
               id={id} 
               concept={concept} 
               amount={amount} 
             />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
