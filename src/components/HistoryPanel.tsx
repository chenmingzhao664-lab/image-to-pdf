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
        <h3 className="ark-label text-sm flex items-center gap-2" style={{ fontSize: 12 }}>
          <span className="diamond" style={{ width: 6, height: 6 }} />
          最近生成
        </h3>
        <button type="button" onClick={() => { clearHistory(); setItems([]) }}
          className="btn-ghost !text-[10px] !p-1.5">清空</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((r) => (
          <div key={r.id} className="ark-card flex items-center gap-3 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center"
              style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" style={{ color: 'var(--text-4)' }}>
                <path d="M11 8h7l4 4v12a1 1 0 01-1 1H11a1 1 0 01-1-1V9a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{r.fileName}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{r.pageCount} 页 · {formatSize(r.fileSize)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
