'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 25, filter: 'blur(2px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: -25, filter: 'blur(2px)' }}
        transition={{ 
          duration: 0.3, 
          ease: [0.22, 1, 0.36, 1] // Native-feeling custom cubic bezier
        }}
        className="flex-1 w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
