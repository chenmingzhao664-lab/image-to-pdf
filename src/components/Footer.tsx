const IconShield = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true" style={{ color: 'var(--accent)' }}>
    <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const IconLock = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true" style={{ color: 'var(--accent)' }}>
    <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" fill="none"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-20 pb-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
        <p className="flex items-center gap-2.5">
          {IconShield}
          <span>Image2PDF</span>
          <span style={{ color: 'var(--line-strong)' }} className="mx-1">·</span>
          {IconLock}
          <span>本地处理 · 不上传服务器</span>
        </p>
        <a href="https://github.com/chenmingzhao664-lab/image-to-pdf" target="_blank" rel="noreferrer"
          className="hover:text-[var(--text-1)] transition font-medium">GitHub</a>
      </div>
    </footer>
  )
}
