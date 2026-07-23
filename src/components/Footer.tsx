import { SITE_PRIVACY_NOTE } from '../utils/constants'

export default function Footer() {
  return (
    <footer className="mt-10 pb-8 text-center text-xs sm:text-sm text-gray-500">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-green-600">
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
        <span>{SITE_PRIVACY_NOTE}</span>
      </div>
      <p>纯前端处理 · 无后端 · 无追踪 · 无 Cookie</p>
    </footer>
  )
}
