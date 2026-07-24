import { formatSize } from '../utils/pdf'

interface Props {
  total: number
  selectionCount: number
  estimatedSize: number | null
  onClearAll: () => void
  onGenerate: () => void
  isGenerating: boolean
  progressInfo: string
}

export default function Toolbar({
  total, selectionCount, estimatedSize,
  onClearAll, onGenerate, isGenerating, progressInfo,
}: Props) {
  return (
    <div className="mt-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        共 <span className="font-semibold text-[var(--text-primary)]">{total}</span> 张
        {selectionCount > 0 && (<span className="badge ml-1">已选 {selectionCount}</span>)}
      </div>

      <div className="flex-1" />

      {estimatedSize != null && (
        <span className="badge text-[11px]">
          预计 PDF <span className="ml-1 font-semibold">{formatSize(estimatedSize)}</span>
        </span>
      )}

      <button
        type="button"
        onClick={onClearAll}
        className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition"
      >
        {selectionCount > 0 ? `删除选中 (${selectionCount})` : '清空全部'}
      </button>

      <button
        type="button"
        onClick={onGenerate}
        disabled={isGenerating || total === 0}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.97]"
      >
        {isGenerating ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin-slow">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {progressInfo || '生成中…'}
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            生成 PDF
          </>
        )}
      </button>
    </div>
  )
}