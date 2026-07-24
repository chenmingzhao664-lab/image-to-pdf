import { PdfFitMode } from '../utils/pdf'
import { OcrLang } from '../utils/excel'
import { WorkMode, SmartMode, SMART_MODE_LABELS } from '../utils/constants'
import type { ConvertDirection } from '../utils/officedoc'

interface ToolbarProps {
  total: number
  mode: WorkMode
  fitMode: PdfFitMode
  onFitModeChange: (mode: PdfFitMode) => void
  smartMode: SmartMode
  onSmartModeChange: (m: SmartMode) => void
  ocrLang: OcrLang
  onOcrLangChange: (lang: OcrLang) => void
  convertDirection: ConvertDirection
  onConvertDirectionChange: (d: ConvertDirection) => void
  onClearAll: () => void
  onBatchDelete: () => void
  onGenerate: () => void
  isGenerating: boolean
  progressInfo: string
  hasSelection: number  // 选中数量，0 表示无
  estimatedPdfSize: string | null
}

const OCR_LANG_OPTIONS: { value: OcrLang; label: string }[] = [
  { value: 'chi_sim+eng', label: '中文(简)+英文' },
  { value: 'chi_tra+eng', label: '中文(繁)+英文' },
  { value: 'eng', label: '英文' },
  { value: 'chi_sim', label: '中文(简)' },
  { value: 'chi_tra', label: '中文(繁)' },
]

const SMART_MODES: SmartMode[] = ['study', 'photo', 'custom']

/** SmartMode 图标 SVG */
function SmartIcon({ type }: { type: string }) {
  const cls = "h-4 w-4"
  switch(type) {
    case 'study':
      return <svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8"/></svg>
    case 'photo':
      return <svg className={cls} viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M22 14l-4-4-5 5-3-3-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'custom':
      return <svg className={cls} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    default: return null
  }
}

export default function Toolbar({
  total, mode, fitMode, onFitModeChange, smartMode, onSmartModeChange,
  ocrLang, onOcrLangChange, convertDirection, onConvertDirectionChange,
  onClearAll, onBatchDelete, onGenerate, isGenerating, progressInfo,
  hasSelection, estimatedPdfSize,
}: ToolbarProps) {
  const disabled = total === 0 || isGenerating

  const generateLabel = isGenerating ? '处理中...'
    : mode === 'pdf' ? '生成 PDF'
    : mode === 'excel' ? '识别并生成 Excel'
    : convertDirection === 'word-to-pdf' ? 'Word → PDF'
    : convertDirection === 'pdf-to-word' ? 'PDF → Word'
    : convertDirection === 'excel-to-pdf' ? 'Excel → PDF'
    : 'PDF → Excel'

  const humanTotal = `${total} ${mode === 'wordpdf' ? '个文件' : '张'}`

  return (
    <div className="flex flex-col gap-3">
      {/* Main toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#e8e8ea] bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* PDF mode: smart mode selection + fit */}
          {mode === 'pdf' && (
            <>
              {/* Smart mode pills */}
              <div className="flex items-center gap-1.5">
                {SMART_MODES.map((s) => {
                  const active = smartMode === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onSmartModeChange(s)
                        if (s === 'study') onFitModeChange('a4')
                        else if (s === 'photo') onFitModeChange('original')
                      }}
                      className={[
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition border',
                        active
                          ? 'bg-[#0c0c0d] text-white border-[#0c0c0d]'
                          : 'bg-white text-[#52525b] border-[#e8e8ea] hover:border-[#d4d4d8]',
                      ].join(' ')}
                    >
                      <SmartIcon type={s} />
                      {SMART_MODE_LABELS[s].title}
                    </button>
                  )
                })}
              </div>
              {/* When custom, show fit toggle */}
              {smartMode === 'custom' && (
                <div className="inline-flex rounded-lg border border-[#e8e8ea] p-0.5 ml-1">
                  <button type="button" onClick={() => onFitModeChange('original')}
                    className={`px-3 py-1.5 rounded-md text-xs transition ${fitMode === 'original' ? 'bg-[#0c0c0d] text-white' : 'text-[#52525b] hover:text-[#0c0c0d]'}`}>原始</button>
                  <button type="button" onClick={() => onFitModeChange('a4')}
                    className={`px-3 py-1.5 rounded-md text-xs transition ${fitMode === 'a4' ? 'bg-[#0c0c0d] text-white' : 'text-[#52525b] hover:text-[#0c0c0d]'}`}>A4</button>
                </div>
              )}
            </>
          )}

          {/* Excel mode */}
          {mode === 'excel' && (
            <div className="inline-flex items-center gap-1.5 text-xs text-[#52525b]">
              <span>识别语言：</span>
              <select value={ocrLang} onChange={(e) => onOcrLangChange(e.target.value as OcrLang)}
                className="rounded-md border border-[#e8e8ea] bg-white px-2 py-1.5 text-xs text-[#0c0c0d]">
                {OCR_LANG_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          )}

          {/* Word↔PDF mode */}
          {mode === 'wordpdf' && (
            <div className="flex flex-wrap gap-1">
              {(['word-to-pdf', 'pdf-to-word', 'excel-to-pdf', 'pdf-to-excel'] as const).map((dir) => (
                <button key={dir} type="button" onClick={() => onConvertDirectionChange(dir)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition border ${convertDirection === dir ? 'bg-[#0c0c0d] text-white border-[#0c0c0d]' : 'text-[#52525b] border-[#e8e8ea] hover:border-[#d4d4d8]'}`}>
                  {dir === 'word-to-pdf' ? 'Word → PDF' : dir === 'pdf-to-word' ? 'PDF → Word' : dir === 'excel-to-pdf' ? 'Excel → PDF' : 'PDF → Excel'}
                </button>
              ))}
            </div>
          )}

          <span className="text-[#d4d4d8]">·</span>
          <span className="text-[#a1a1aa]">{humanTotal}</span>
          {estimatedPdfSize && mode === 'pdf' && (
            <span className="text-[11px] text-[#a1a1aa] bg-[#f4f4f5] px-2 py-0.5 rounded-full">
              约 {estimatedPdfSize}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={onClearAll} disabled={disabled}
            className="px-4 py-2 rounded-lg text-xs border border-[#e8e8ea] text-[#52525b] transition hover:border-[#d4d4d8] hover:text-[#0c0c0d] disabled:opacity-40 disabled:cursor-not-allowed">
            清空
          </button>
          {hasSelection && (
            <button type="button" onClick={onBatchDelete}
              className="px-4 py-2 rounded-lg text-xs border border-red-200 text-red-500 transition hover:bg-red-50 hover:border-red-300">
              删除选中 ({hasSelection})
            </button>
          )}
          <button type="button" onClick={onGenerate} disabled={disabled}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-medium bg-[#0c0c0d] text-white transition hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
            {isGenerating && (
              <svg className="h-3.5 w-3.5" style={{ animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
            )}
            {generateLabel}
          </button>
        </div>
      </div>

      {/* Progress */}
      {progressInfo && (
        <div className="rounded-lg border border-[#e8e8ea] bg-white px-4 py-2.5 text-sm text-[#52525b]" style={{ animation: 'fadeIn 0.2s ease-out both' }}>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#18181b]" style={{ animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            <span>{progressInfo}</span>
          </div>
        </div>
      )}
    </div>
  )
}