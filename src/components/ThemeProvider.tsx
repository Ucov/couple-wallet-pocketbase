'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: 'light' | 'dark'
  appColor: string
  setAppColor: (c: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'dark',
  appColor: 'emerald',
  setAppColor: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.documentElement.classList.toggle('light', resolved === 'light')
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [appColor, setAppColorState] = useState<string>('emerald')

  // On mount: read saved preference
  useEffect(() => {
    const saved = (localStorage.getItem('cw-theme') as Theme) || 'system'
    setThemeState(saved)
    const resolved = saved === 'system' ? getSystemTheme() : saved
    setResolvedTheme(resolved)
    applyTheme(saved)

    // Load App Color
    const savedColor = localStorage.getItem('cw-color') || 'emerald'
    setAppColorState(savedColor)
    if (savedColor !== 'emerald') {
      document.documentElement.setAttribute('data-color', savedColor)
    } else {
      document.documentElement.removeAttribute('data-color')
    }

    // Listen for OS theme changes when mode is 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if ((localStorage.getItem('cw-theme') || 'system') === 'system') {
        const r = getSystemTheme()
        setResolvedTheme(r)
        applyTheme('system')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('cw-theme', t)
    const resolved = t === 'system' ? getSystemTheme() : t
    setResolvedTheme(resolved)
    applyTheme(t)
  }

  function setAppColor(color: string) {
    setAppColorState(color)
    localStorage.setItem('cw-color', color)
    if (color !== 'emerald') {
      document.documentElement.setAttribute('data-color', color)
    } else {
      document.documentElement.removeAttribute('data-color')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, appColor, setAppColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
