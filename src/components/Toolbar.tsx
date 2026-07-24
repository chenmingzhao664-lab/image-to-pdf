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

  const accentBg = mode === 'excel'
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : mode === 'wordpdf'
      ? 'bg-violet-600 hover:bg-violet-700'
      : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className="flex flex-col gap-4">
      {/* 模式切换、参数、操作 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm">
        {/* 模式切换 + 参数 */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {/* PDF 模式：A4/原始 */}
          {mode === 'pdf' && (
            <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-sm font-medium">
              <button
                type="button"
                onClick={() => onFitModeChange('original')}
                className={[
                  'px-3 py-1.5 rounded-md transition',
                  fitMode === 'original'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
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
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900',
                ].join(' ')}
              >
                A4 适配
              </button>
            </div>
          )}

          {/* Excel 模式：OCR 语言 */}
          {mode === 'excel' && (
            <div className="inline-flex items-center gap-1.5 text-xs text-gray-600">
              <span>识别语言：</span>
              <select
                value={ocrLang}
                onChange={(e) => onOcrLangChange(e.target.value as OcrLang)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                {OCR_LANG_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Word↔PDF 模式：方向切换（4 个方向） */}
          {mode === 'wordpdf' && (
            <div className="flex flex-wrap gap-1">
              {(['word-to-pdf', 'pdf-to-word', 'excel-to-pdf', 'pdf-to-excel'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => onConvertDirectionChange(dir)}
                  className={[
                    'px-3 py-1.5 rounded-md text-sm font-medium transition',
                    convertDirection === dir
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900',
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

          <span className="ml-0.5 text-gray-400">·</span>
          <span className="text-gray-500">
            {total} {mode === 'wordpdf' ? '个文件' : '张'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={disabled}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            清空
          </button>
          <button
            type="button"
            onClick={onGenerate}
            disabled={disabled}
            className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${accentBg}`}
          >
            {generateLabel}
          </button>
        </div>
      </div>

      {/* 进度信息 */}
      {progressInfo && (
        <div className={[
          'rounded-xl px-4 py-2.5 text-sm',
          mode === 'excel'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : mode === 'wordpdf'
              ? 'bg-violet-50 border border-violet-200 text-violet-800'
              : 'bg-blue-50 border border-blue-200 text-blue-800',
        ].join(' ')}>
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
