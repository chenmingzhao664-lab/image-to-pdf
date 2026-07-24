interface ToolbarProps {
  total: number; selectionCount: number; estimatedSize: string | null
  onClearAll: () => void; onGenerate: () => void; isGenerating: boolean; progressInfo: string
  actionLabel?: string; onToggleSettings?: () => void
}

export default function Toolbar({ total, selectionCount, estimatedSize, onClearAll, onGenerate, isGenerating, progressInfo, actionLabel, onToggleSettings }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="ark-label flex items-center gap-2" style={{ fontSize: 12 }}>
        <span className="diamond" />
        FILES: <span className="ark-num">{total}</span>
      </span>
      {estimatedSize && <span className="badge">{estimatedSize}</span>}
      {selectionCount > 0 && <span className="badge" style={{ borderColor: 'var(--ark-yellow)' }}>SELECTED: {selectionCount}</span>}
      <div className="flex-1" />
      {onToggleSettings && (
        <button type="button" onClick={onToggleSettings} className="btn-secondary">
          <span className="diamond" style={{ width: 6, height: 6 }} />
          SETTINGS
        </button>
      )}
      <button type="button" onClick={onClearAll} className="btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/></svg>
        CLEAR
      </button>
      <button type="button" onClick={onGenerate} disabled={isGenerating || total === 0} className="btn-primary" style={{ background: 'var(--ark-yellow)', color: '#1c1c1a' }}>
        {isGenerating ? (
          <><span className="animate-blink">▶</span> {progressInfo || 'PROCESSING'}</>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="#1c1c1a" strokeWidth="2" strokeLinecap="square"/></svg>{actionLabel || '生成 PDF'}</>
        )}
      </button>
    </div>
  )
}