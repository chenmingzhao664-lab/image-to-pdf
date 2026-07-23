interface DownloadModalProps {
  open: boolean
  fileName: string
  onClose: () => void
  onDownload: () => void
}

/** 生成完成后的下载弹窗 */
export default function DownloadModal({
  open,
  fileName,
  onClose,
  onDownload,
}: DownloadModalProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-900 mb-1">
          PDF 生成成功
        </h3>
        <p className="text-center text-xs text-gray-500 truncate mb-5" title={fileName}>
          {fileName}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            下载 PDF
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
