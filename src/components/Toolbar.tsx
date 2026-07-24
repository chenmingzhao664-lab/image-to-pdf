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
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#e4e4e7] bg-white p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {mode === 'pdf' && (
            <div className="inline-flex rounded-lg border border-[#e4e4e7] p-0.5 text-sm font-medium bg-white">
              <button
                type="button"
                onClick={() => onFitModeChange('original')}
                className={[
                  'px-3 py-1.5 rounded-md transition',
                  fitMode === 'original'
                    ? 'bg-[#0c0c0d] text-white'
                    : 'text-[#52525b] hover:text-[#0c0c0d]',
                ].join(' ')}
              >
                原始比例
              </button>
              <button
                type="button"
                onClick={() => onFitModeChange('a4')}
                className={[
                  'px-3 py-1.5 rounded-md transition',
                  fitMode === 'a4'
                    ? 'bg-[#0c0c0d] text-white'
                    : 'text-[#52525b] hover:text-[#0c0c0d]',
                ].join(' ')}
              >
                A4 适配
              </button>
            </div>
          )}

          {mode === 'excel' && (
            <div className="inline-flex items-center gap-1.5 text-xs text-[#52525b]">
              <span>识别语言：</span>
              <select
                value={ocrLang}
                onChange={(e) => onOcrLangChange(e.target.value as OcrLang)}
                className="rounded-md border border-[#e4e4e7] bg-white px-2 py-1.5 text-xs text-[#0c0c0d]"
              >
                {OCR_LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === 'wordpdf' && (
            <div className="flex flex-wrap gap-1">
              {(['word-to-pdf', 'pdf-to-word', 'excel-to-pdf', 'pdf-to-excel'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onConvertDirectionChange(dir)}
                  className={[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition border',
                    convertDirection === dir
                      ? 'bg-[#0c0c0d] text-white border-[#0c0c0d]'
                      : 'text-[#52525b] border-[#e4e4e7] hover:border-[#d4d4d8] hover:text-[#0c0c0d]',
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

          <span className="text-[#d4d4d8]">·</span>
          <span className="text-[#a1a1aa]">
            {total} {mode === 'wordpdf' ? '个文件' : '张'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={disabled}
            className="px-4 py-2 rounded-md text-sm border border-[#e4e4e7] text-[#52525b] transition hover:border-[#d4d4d8] hover:text-[#0c0c0d] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            清空
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium bg-[#0c0c0d] text-white transition hover:opacity-85 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating && (
              <svg className="h-3.5 w-3.5" style={{ animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            {generateLabel}
          </button>
        </div>
      </div>

      {progressInfo && (
        <div className="rounded-lg border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm text-[#52525b]">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#2563eb]" style={{ animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
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