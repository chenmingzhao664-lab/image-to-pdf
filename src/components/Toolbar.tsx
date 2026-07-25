interface ToolbarProps {
  total: number; selectionCount: number; estimatedSize: string | null
  onClearAll: () => void; onGenerate: () => void; isGenerating: boolean; progressInfo: string
  progressPercent?: number  // 0..100, undefined = indeterminate
  actionLabel?: string; onToggleSettings?: () => void
}

export default function Toolbar({ total, selectionCount, estimatedSize, onClearAll, onGenerate, isGenerating, progressInfo, progressPercent, actionLabel, onToggleSettings }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-medium flex items-center gap-2" style={{ fontSize: 12 }}>
        FILES: <span className="font-semibold">{total}</span>
      </span>
      {estimatedSize && <span className="badge">{estimatedSize}</span>}
      {selectionCount > 0 && <span className="badge" style={{ borderColor: 'var(--accent)' }}>Selected: {selectionCount}</span>}
      <div className="flex-1" />
      {onToggleSettings && (
        <button type="button" onClick={onToggleSettings} className="btn-secondary">
          SETTINGS
        </button>
      )}
      <button type="button" onClick={onClearAll} className="btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
        CLEAR
      </button>
      <button type="button" onClick={onGenerate} disabled={isGenerating || total === 0} className="btn-primary" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }} aria-busy={isGenerating}>
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-blink">▶</span>
            <span>{progressInfo || 'PROCESSING'}</span>
            {typeof progressPercent === 'number' && (
              <span className="progress-pill" aria-label={`进度 ${progressPercent}%`}>
                <span className="progress-pill-bar" style={{ width: `${progressPercent}%` }} />
                <span className="progress-pill-text">{progressPercent}%</span>
              </span>
            )}
          </span>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="#1c1c1a" strokeWidth="2" strokeLinecap="square"/></svg>{actionLabel || '生成 PDF'}</>
        )}
      </button>
    </div>
  )
}