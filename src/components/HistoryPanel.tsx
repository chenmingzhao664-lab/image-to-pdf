import { useHistory } from './history'
import { formatSize } from '../utils/pdf'

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function HistoryPanel() {
  const [items, , clearAll] = useHistory()

  if (items.length === 0) return null

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          最近生成的文件（仅本机保存）
        </h3>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-[var(--text-tertiary)] hover:text-red-500 transition"
        >
          清空
        </button>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M11 8h7l4 4v12a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{it.fileName}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {it.pageCount} 页 · {formatSize(it.fileSize)} · {formatDate(it.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
