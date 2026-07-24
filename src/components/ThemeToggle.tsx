export default function ThemeToggle() {
  return (
    <button type="button"
      onClick={() => { const w = window as unknown as Record<string, unknown>; if (typeof w.__toggleTheme === 'function') w.__toggleTheme() }}
      aria-label="切换主题"
      className="inline-flex h-9 w-9 items-center justify-center"
      style={{ border: '1px solid var(--line)', color: 'var(--text-2)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}
