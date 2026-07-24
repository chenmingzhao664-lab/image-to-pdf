import { PdfFitMode } from '../utils/pdf'
import { OcrLang } from '../utils/excel'
import { WorkMode } from '../utils/constants'
import type { ConvertDirection } from '../utils/officedoc'

interface ToolbarProps {
  total: number
  mode: WorkMode
  fitMode: PdfFitMode
  onFitModeChange: (mode: PdfFitMode) => void
  ocrLang: OcrLang
  onOcrLangChange: (lang: OcrLang) => void
  convertDirection: ConvertDirection
  onConvertDirectionChange: (d: ConvertDirection) => void
  onClearAll: () => void
  onGenerate: () => void
  isGenerating: boolean
  progressInfo: string
}

const OCR_LANG_OPTIONS: { value: OcrLang; label: string }[] = [
  { value: 'chi_sim+eng', label: '中文(简)+英文' },
  { value: 'chi_tra+eng', label: '中文(繁)+英文' },
  { value: 'eng', label: '英文' },
  { value: 'chi_sim', label: '中文(简)' },
  { value: 'chi_tra', label: '中文(繁)' },
]

export default function Toolbar({
  total,
  mode,
  fitMode,
  onFitModeChange,
  ocrLang,
  onOcrLangChange,
  convertDirection,
  onConvertDirectionChange,
  onClearAll,
  onGenerate,
  isGenerating,
  progressInfo,
}: ToolbarProps) {
  const disabled = total === 0 || isGenerating

  const generateLabel = isGenerating
    ? '处理中...'
    : mode === 'pdf'
      ? '生成 PDF'
      : mode === 'excel'
        ? '识别并生成 Excel'
        : convertDirection === 'word-to-pdf'
          ? 'Word → PDF'
          : convertDirection === 'pdf-to-word'
            ? 'PDF → Word'
            : convertDirection === 'excel-to-pdf'
              ? 'Excel → PDF'
              : 'PDF → Excel'

  return (
    <div className="flex flex-col gap-4">
      {/* 操作栏：暗色漫画风卡片 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[20px] border-2 border-white/20 bg-white/6 p-3 sm:p-4 backdrop-blur">
        {/* 模式切换 + 参数 */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* PDF 模式：A4/原始 */}
          {mode === 'pdf' && (
            <div className="inline-flex rounded-xl border-2 border-white/15 p-0.5 text-sm font-medium bg-white/4">
              <button
                type="button"
                onClick={() => onFitModeChange('original')}
                className={[
                  'px-3 py-1.5 rounded-lg transition',
                  fitMode === 'original'
                    ? 'bg-[#FFD86B] text-[#1a1033] shadow-md font-bold'
                    : 'text-white/70 hover:text-white',
                ].join(' ')}
              >
                原始比例
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('a4')}
                className={[
                  'px-3 py-1.5 rounded-lg transition',
                  fitMode === 'a4'
                    ? 'bg-[#FFD86B] text-[#1a1033] shadow-md font-bold'
                    : 'text-white/70 hover:text-white',
                ].join(' ')}
              >
                A4 适配
              </button>
            </div>
          )}

          {/* Excel 模式：OCR 语言 */}
          {mode === 'excel' && (
            <div className="inline-flex items-center gap-1.5 text-xs text-white/60">
              <span>识别语言：</span>
              <select
                value={ocrLang}
                onChange={(e) => onOcrLangChange(e.target.value as OcrLang)}
                className="rounded-xl border-2 border-white/15 bg-white/8 px-2 py-1.5 text-xs text-white/85 backdrop-blur"
              >
                {OCR_LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Word↔PDF 模式：方向切换 */}
          {mode === 'wordpdf' && (
            <div className="flex flex-wrap gap-1">
              {(['word-to-pdf', 'pdf-to-word', 'excel-to-pdf', 'pdf-to-excel'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onConvertDirectionChange(dir)}
                  className={[
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition border-2',
                    convertDirection === dir
                      ? 'bg-[#FFD86B] text-[#1a1033] border-[#FFD86B] font-bold'
                      : 'text-white/70 border-white/10 hover:text-white hover:border-white/30',
                  ].join(' ')}
                >
                  {dir === 'word-to-pdf' ? 'Word → PDF'
                    : dir === 'pdf-to-word' ? 'PDF → Word'
                    : dir === 'excel-to-pdf' ? 'Excel → PDF'
                    : 'PDF → Excel'}
                </button>
              ))}
            </div>
          )}

          <span className="text-white/30">·</span>
          <span className="text-white/55" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {total} {mode === 'wordpdf' ? '个文件' : '张'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={disabled}
            className="manga-btn manga-btn-ghost px-4 py-2 rounded-xl text-sm"
          >
            清空
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            className="manga-btn manga-btn-primary px-5 py-2 rounded-xl text-sm"
          >
            {generateLabel}
          </button>
        </div>
      </div>

      {/* 进度信息 */}
      {progressInfo && (
        <div className="manga-chip rounded-2xl px-4 py-2.5 text-sm bg-white/8 text-white/85 border-[#FFD86B]">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-[#FFD86B]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{progressInfo}</span>
          </div>
        </div>
      )}
    </div>
  )
}