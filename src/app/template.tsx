'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
      className="flex-1 w-full h-full flex flex-col"
    >
      {children}
    </motion.div>
  )
}
