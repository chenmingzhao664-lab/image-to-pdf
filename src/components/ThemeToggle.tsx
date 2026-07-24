import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const [theme, toggle] = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切换到日间模式' : '切换到夜间模式'}
      aria-pressed={isDark}
      title={isDark ? '日间模式' : '夜间模式'}
      className="inline-flex h-9 w-9 items-center justify-center transition-colors"
      style={{ border: '1px solid var(--line)', color: 'var(--text-2)' }}
    >
      {isDark ? (
        // 太阳图标（当前是夜间，点击切到日间）
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      ) : (
        // 月亮图标（当前是日间，点击切到夜间）
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
