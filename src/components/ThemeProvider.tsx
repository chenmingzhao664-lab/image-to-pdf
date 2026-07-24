import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import { LS_THEME_KEY } from '../utils/constants'
import type { ThemeMode } from '../types'

interface ThemeCtx {
  theme: ThemeMode
  toggle: () => void
}

const ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })
export const useTheme = () => useContext(ctx)

/** 从 localStorage 或系统偏好读取初始主题 */
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem(LS_THEME_KEY) as ThemeMode | null
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)

  useEffect(() => {
    localStorage.setItem(LS_THEME_KEY, theme)
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])

  return <ctx.Provider value={{ theme, toggle }}>{children}</ctx.Provider>
}
