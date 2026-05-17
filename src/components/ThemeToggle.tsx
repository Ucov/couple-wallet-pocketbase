'use client'

import { useTheme } from './ThemeProvider'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { value: 'system', label: 'Sistema', Icon: Monitor },
  { value: 'light',  label: 'Claro',   Icon: Sun  },
  { value: 'dark',   label: 'Oscuro',  Icon: Moon },
] as const

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  function cycleTheme() {
    const idx = themes.findIndex(t => t.value === theme)
    const next = themes[(idx + 1) % themes.length]
    setTheme(next.value)
  }

  const current = themes.find(t => t.value === theme) ?? themes[0]
  const Icon = current.Icon

  return (
    <button
      onClick={cycleTheme}
      title={`Tema: ${current.label}`}
      aria-label={`Cambiar tema (actual: ${current.label})`}
      className="
        flex items-center justify-center w-9 h-9 rounded-xl
        bg-zinc-800 hover:bg-zinc-700
        dark:bg-zinc-800 dark:hover:bg-zinc-700
        light:bg-zinc-200 light:hover:bg-zinc-300
        text-zinc-400 hover:text-zinc-100
        dark:text-zinc-400 dark:hover:text-zinc-100
        light:text-zinc-600 light:hover:text-zinc-900
        transition-colors duration-200
      "
    >
      <Icon size={16} />
    </button>
  )
}
