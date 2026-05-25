'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'

export default function FloatingAddButton() {
  return (
    <div className="fixed bottom-6 right-6 pointer-events-none z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
        className="pointer-events-auto relative"
      >
        {/* Ambient background pulsing glow */}
        <motion.div
          className="absolute -inset-1 rounded-full bg-emerald-500/20 blur-lg pointer-events-none"
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Soft floating movement */}
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Link
            href="/add"
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-[0_8px_30px_rgba(16,185,129,0.35)] border border-emerald-300/20 hover:scale-105 active:scale-95 transition-transform duration-200 group"
            aria-label="Añadir Gasto"
          >
            {/* Hover ripple wave */}
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            {/* Spinning & growing custom plus icon */}
            <motion.div
              whileHover={{ rotate: 90, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="relative z-10 flex items-center justify-center"
            >
              <Plus size={28} strokeWidth={2.5} />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
