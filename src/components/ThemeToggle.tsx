export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={() => { const w = window as unknown as Record<string, unknown>; if (typeof w.__toggleTheme === 'function') w.__toggleTheme() }}
      aria-label="切换主题"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 dark:hidden">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 hidden dark:block">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </button>
  )
}
