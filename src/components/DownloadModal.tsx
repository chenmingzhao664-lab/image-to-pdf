interface DownloadModalProps {
  open: boolean
  fileName: string
  /** 文件类型：pdf / excel / docx / xlsx，决定文案/图标/按钮颜色 */
  fileType?: 'pdf' | 'excel' | 'docx' | 'xlsx'
  /** 文件大小（字节），可选展示 */
  fileSize?: number
  onClose: () => void
  onDownload: () => void
}

function formatBytes(n: number): string {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}

/** 生成完成后的下载弹窗 */
export default function DownloadModal({
  open,
  fileName,
  fileType = 'pdf',
  fileSize,
  onClose,
  onDownload,
}: DownloadModalProps) {
  if (!open) return null

  const isExcel = fileType === 'excel'
  const title = isExcel ? 'Excel 生成成功' : 'PDF 生成成功'
  const btnLabel = isExcel ? '下载 Excel' : '下载 PDF'
  const accentBg = isExcel ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'
  const accentSoft = isExcel ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 animate-[scaleIn_0.25s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${accentSoft}`}>
          {isExcel ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-center text-xs text-gray-500 truncate mb-1" title={fileName}>
          {fileName}
        </p>
        {fileSize !== undefined && fileSize > 0 && (
          <p className="text-center text-[11px] text-gray-400 mb-5">
            {formatBytes(fileSize)}
          </p>
        )}
        {fileSize === undefined && <div className="mb-5" />}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDownload}
            className={`w-full px-4 py-2.5 rounded-xl text-white font-medium transition shadow-sm ${accentBg}`}
          >
            {btnLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
