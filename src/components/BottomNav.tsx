'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, UserCog } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  // No mostrar la barra en pantallas de auth o setup
  if (!pathname || pathname === '/login' || pathname === '/setup-couple') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/80 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        <Link 
          href="/"
          className={`flex flex-col items-center justify-center w-16 h-14 mt-1 rounded-2xl space-y-1 transition-all ${
            pathname === '/' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home size={22} className={pathname === '/' ? 'fill-emerald-400/20' : ''} />
          <span className="text-[10px] font-medium">Inicio</span>
        </Link>
        
        <Link 
          href="/shopping"
          className={`flex flex-col items-center justify-center w-16 h-14 mt-1 rounded-2xl space-y-1 transition-all ${
            pathname === '/shopping' || pathname?.startsWith('/shopping') ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ShoppingCart size={22} className={pathname === '/shopping' || pathname?.startsWith('/shopping') ? 'fill-emerald-400/20' : ''} />
          <span className="text-[10px] font-medium">Compra</span>
        </Link>
        
        <Link 
          href="/profile"
          className={`flex flex-col items-center justify-center w-16 h-14 mt-1 rounded-2xl space-y-1 transition-all ${
            pathname === '/profile' || pathname?.startsWith('/profile') ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <UserCog size={22} className={pathname === '/profile' || pathname?.startsWith('/profile') ? 'fill-emerald-400/20' : ''} />
          <span className="text-[10px] font-medium">Perfil</span>
        </Link>
      </div>
    </nav>
  )
}
