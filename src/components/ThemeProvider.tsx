import { useEffect, useState } from 'react'
import type { ThemeMode } from '../types'

const KEY = 'image2pdf_theme_v2'

function getInitial(): ThemeMode {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  }
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) setTheme(e.newValue)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return <>{children}</>
}
