'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useRef, useEffect } from 'react'

const ROUTE_ORDER = ['/', '/shopping', '/chores', '/calendar', '/profile']

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevIndexRef = useRef(0)
  
  const getBaseRoute = (path: string) => {
    if (path === '/') return '/'
    const base = '/' + path.split('/')[1]
    return ROUTE_ORDER.includes(base) ? base : '/'
  }

  const currentIndex = ROUTE_ORDER.indexOf(getBaseRoute(pathname))
  const isForward = currentIndex >= prevIndexRef.current

  const initialX = isForward ? 35 : -35
  const exitX = isForward ? -35 : 35

  useEffect(() => {
    prevIndexRef.current = currentIndex
  }, [currentIndex])
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: initialX, filter: 'blur(2px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, x: exitX, filter: 'blur(2px)' }}
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
