import { BRAND, SITE_PRIVACY_NOTE } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e8ea] bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0c0c0d] text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 8h7l4 4v12a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 8v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="text-sm font-semibold">{BRAND.NAME}</span>
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              {BRAND.ZH_NAME} — 纯浏览器端文档转换工具。
              {SITE_PRIVACY_NOTE}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#0c0c0d] mb-3">功能</h4>
            <ul className="space-y-2 text-xs text-[#a1a1aa]">
              <li>图片转 PDF</li>
              <li>图片转 Excel（OCR）</li>
              <li>Word ↔ PDF</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#0c0c0d] mb-3">关于</h4>
            <ul className="space-y-2 text-xs text-[#a1a1aa]">
              <li>纯前端 · 无后端 · 无追踪</li>
              <li>Made by {BRAND.AUTHOR}</li>
              <li>&copy; {new Date().getFullYear()} {BRAND.NAME}</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}