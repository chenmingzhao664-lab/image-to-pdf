import { SITE_PRIVACY_NOTE } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="mt-10 pb-10 text-center">
      {/* 隐私气泡：手绘对话泡 */}
      <div className="manga-bubble inline-flex items-center gap-2 px-5 py-3 mx-auto max-w-md">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#5EEAD4] flex-shrink-0">
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs sm:text-sm text-white/85" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {SITE_PRIVACY_NOTE}
        </span>
      </div>
      <p className="mt-6 text-[11px] sm:text-xs text-white/30 tracking-wide">
        纯前端处理 · 无后端 · 无追踪 · 无 Cookie
      </p>
    </footer>
  )
}
