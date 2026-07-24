interface Props {
  total: number
  selectionCount: number
  estimatedSize: string | null
  onClearAll: () => void
  onGenerate: () => void
  isGenerating: boolean
  progressInfo: string
  actionLabel?: string
  showSettings?: boolean
  onToggleSettings?: () => void
}

export default function Toolbar({
  total, selectionCount, estimatedSize, onClearAll, onGenerate, isGenerating, progressInfo, actionLabel,
  showSettings, onToggleSettings,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        共 <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span>
        {' '}<span className="hidden sm:inline">个文件</span>
        {selectionCount > 0 && <span className="badge ml-1">已选 {selectionCount}</span>}
      </div>
      {estimatedSize && <span className="badge">{estimatedSize}</span>}
      <div className="flex-1/0" />
      {onToggleSettings && (
        <button type="button" onClick={onToggleSettings} className="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 9a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
          {showSettings ? '收起设置' : 'PDF 设置'}
        </button>
      )}
      {selectionCount > 0 ? (
        <button type="button" onClick={onClearAll} className="btn-secondary">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          删除选中 ({selectionCount})
        </button>
      ) : (
        <button type="button" onClick={onClearAll} className="btn-secondary">清空全部</button>
      )}
      <button type="button" onClick={onGenerate} disabled={isGenerating || total === 0} className="btn-primary">
        {isGenerating ? (
          <><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin-slow"><path d="M21 12a9 9 0 11-6.219-8.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>{progressInfo || '处理中…'}</>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>{actionLabel || '生成 PDF'}</>
        )}
      </button>
    </div>
  )
}