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

// 模块级单例订阅 —— 避免 window 全局变量 hack
type Listener = (theme: ThemeMode) => void
const listeners = new Set<Listener>()
let currentTheme: ThemeMode = getInitial()

function applyTheme(theme: ThemeMode) {
  currentTheme = theme
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(KEY, theme)
  listeners.forEach((l) => l(theme))
}

export function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

export function useTheme(): [ThemeMode, () => void] {
  const [theme, setTheme] = useState<ThemeMode>(currentTheme)
  useEffect(() => {
    const l: Listener = (t) => setTheme(t)
    listeners.add(l)
    // mount 时同步一次，避免 SSR/初始不一致
    setTheme(currentTheme)
    return () => { listeners.delete(l) }
  }, [])
  return [theme, toggleTheme]
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 初始化：把 <html> class 同步到 currentTheme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')
    // 跨 tab 同步
    const handler = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) applyTheme(e.newValue as ThemeMode)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
  return <>{children}</>
}
