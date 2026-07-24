import { useEffect, useState } from 'react'
import type { DownloadRecord } from '../types'
import { readHistory, clearHistory } from './history'
import { formatSize } from '../utils/pdf'

export default function HistoryPanel() {
  const [items, setItems] = useState<DownloadRecord[]>([])

  const refresh = () => setItems(readHistory().slice(0, 6))

  useEffect(() => {
    refresh()
    const h = () => refresh()
    window.addEventListener('history-changed', h)
    return () => window.removeEventListener('history-changed', h)
  }, [])

  if (items.length === 0) return null

  return (
    <section className="mt-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          最近生成
        </h3>
        <button type="button" onClick={() => { clearHistory(); setItems([]) }} className="text-xs text-[var(--text-tertiary)] hover:text-red-500 transition">清空</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M11 8h7l4 4v12a1 1 0 01-1 1H11a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{r.fileName}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">{r.pageCount} 页 · {formatSize(r.fileSize)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
