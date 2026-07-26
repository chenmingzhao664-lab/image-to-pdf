interface ToolbarProps {
  total: number; selectionCount: number; estimatedSize: string | null
  onClearAll: () => void; onGenerate: () => void; isGenerating: boolean; progressInfo: string
  progressPercent?: number  // 0..100, undefined = indeterminate
  actionLabel?: string; onToggleSettings?: () => void
  justReady?: boolean  // 生成完成后的 1.4s 庆祝窗口，触发按钮 .is-ready
}

/** 把后端 progress 字符串映射成三段阶段标签：Preparing / Creating / Finished
 *  - "PROCESSING..." / "OCR INIT..." / "CONVERTING..." → Preparing
 *  - "PAGE x/y" / "OCR x/y" → Creating
 *  - 100% / "DONE" / "Finished" → Finished
 */
function deriveStage(info: string, percent: number | undefined): { label: string; tone: 'prep' | 'run' | 'done' } {
  const s = info.trim().toUpperCase()
  if (s.startsWith('PAGE') || s.startsWith('OCR') || /OCR\s*\d/.test(s)) return { label: 'CREATING', tone: 'run' }
  if (s === 'DONE' || s === 'FINISHED' || (typeof percent === 'number' && percent >= 100)) return { label: 'FINISHED', tone: 'done' }
  return { label: 'PREPARING', tone: 'prep' }
}

/** 把 stage 转成 stepper 的三段进度（0/1/2/3 — 0=idle 未启动） */
function stageStep(tone: 'prep' | 'run' | 'done'): number {
  if (tone === 'prep') return 1
  if (tone === 'run') return 2
  return 3
}

export default function Toolbar({ total, selectionCount, estimatedSize, onClearAll, onGenerate, isGenerating, progressInfo, progressPercent, actionLabel, onToggleSettings, justReady }: ToolbarProps) {
  const stage = isGenerating ? deriveStage(progressInfo, progressPercent) : null
  const currentStep = stage ? stageStep(stage.tone) : 0
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
      <button type="button" onClick={onGenerate} disabled={isGenerating || total === 0} className={`btn-primary${justReady ? ' is-ready' : ''}`} style={{ background: justReady ? undefined : 'var(--accent)', color: 'var(--accent-text)' }} aria-busy={isGenerating}>
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="spinner-ring" aria-hidden="true" />
            {stage && (
              <span className={`stage-pill stage-${stage.tone}`} aria-label={`阶段 ${stage.label}`}>
                {stage.label}
              </span>
            )}
            {/* Stepper — 三段进度可视化 */}
            <span className="stepper" role="presentation" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span key={n} className={`stepper-dot ${n < currentStep ? 'is-done' : ''} ${n === currentStep ? 'is-current' : ''}`}>
                  {n < currentStep ? (
                    <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="round"/></svg>
                  ) : n === currentStep ? (
                    <span className="stepper-dot-pulse" />
                  ) : null}
                </span>
              ))}
            </span>
            <span>{progressInfo || 'PROCESSING'}</span>
            {typeof progressPercent === 'number' && (
              <span className="progress-pill" aria-label={`进度 ${progressPercent}%`}>
                <span className="progress-pill-bar" style={{ width: `${progressPercent}%` }} />
                <span className="progress-pill-text">{progressPercent}%</span>
              </span>
            )}
          </span>
        ) : (
          <><svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/></svg>{actionLabel || '生成 PDF'}</>
        )}
      </button>
    </div>
  )
}