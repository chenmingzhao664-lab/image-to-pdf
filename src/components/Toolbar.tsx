import { PdfFitMode } from '../utils/pdf'

interface ToolbarProps {
  total: number
  fitMode: PdfFitMode
  onFitModeChange: (mode: PdfFitMode) => void
  onClearAll: () => void
  onGenerate: () => void
  isGenerating: boolean
}

/** 顶部控制条：模式切换 + 清空 + 生成PDF */
export default function Toolbar({
  total,
  fitMode,
  onFitModeChange,
  onClearAll,
  onGenerate,
  isGenerating,
}: ToolbarProps) {
  const disabled = total === 0 || isGenerating

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">输出模式：</span>
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
        <span className="ml-2 text-gray-500">·  共 {total} 张</span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClearAll}
          disabled={disabled}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          清空全部
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled}
          className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '生成 PDF'}
        </button>
      </div>
    </div>
  )
}
