import { SITE_PRIVACY_NOTE } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-[#e4e4e7] bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f4f5] text-sm text-[#52525b] mb-6">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#52525b]">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{SITE_PRIVACY_NOTE}</span>
        </div>
        <p className="text-xs text-[#a1a1aa]">
          纯前端处理 · 无后端 · 无追踪 · 无 Cookie
        </p>
        <p className="mt-2 text-[11px] text-[#d4d4d8]">
          zcm的文档转换器 &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}