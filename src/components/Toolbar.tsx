interface Props {
  total: number
  selectionCount: number
  estimatedSize: string | null
  onClearAll: () => void
  onGenerate: () => void
  isGenerating: boolean
  progressInfo: string
  actionLabel?: string
}

export default function Toolbar({
  total, selectionCount, estimatedSize, onClearAll, onGenerate, isGenerating, progressInfo, actionLabel,
}: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        共 <span className="font-semibold text-[var(--text-primary)]">{total}</span> {actionLabel ? '个' : '张'}
        {selectionCount > 0 && <span className="badge ml-1">已选 {selectionCount}</span>}
      </div>
      {estimatedSize && <span className="badge">预计 <span className="ml-1 font-semibold">{estimatedSize}</span></span>}
      <div className="flex-1" />
      {selectionCount > 0 ? (
        <button type="button" onClick={onClearAll} className="btn-secondary">删除选中 ({selectionCount})</button>
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
