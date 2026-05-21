'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingCart, UserCog, Calendar } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  // No mostrar la barra en pantallas de auth o setup
  if (!pathname || pathname === '/login' || pathname === '/setup-couple') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
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
          href="/calendar" 
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${
            pathname.startsWith('/calendar')
              ? 'text-emerald-400 bg-emerald-500/10' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className={`transition-transform duration-300 ${pathname.startsWith('/calendar') ? 'scale-110 mb-1' : 'mb-0.5'}`}>
            <Calendar size={22} strokeWidth={pathname.startsWith('/calendar') ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium transition-all duration-300 ${pathname.startsWith('/calendar') ? 'opacity-100' : 'opacity-70'}`}>
            Agenda
          </span>
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
