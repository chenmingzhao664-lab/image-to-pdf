import { BRAND } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[var(--accent)] text-white">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M4 4h16v16H4V4z M4 9h16 M9 4v16" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </span>
          <span>© 2026 {BRAND.NAME} · 纯浏览器端处理 · 不上传服务器</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-[var(--text-tertiary)]">
          <span>隐私优先</span>
          <span>永久免费</span>
          <a
            href="https://github.com/chenmingzhao664-lab/image-to-pdf"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--text-primary)] transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}