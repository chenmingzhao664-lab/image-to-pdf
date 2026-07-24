interface DownloadModalProps {
  open: boolean
  fileName: string
  fileType?: 'pdf' | 'excel' | 'docx' | 'xlsx'
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

/** 生成完成后的下载弹窗（SaaS 极简风） */
export default function DownloadModal({
  open,
  fileName,
  fileType = 'pdf',
  fileSize,
  onClose,
  onDownload,
}: DownloadModalProps) {
  if (!open) return null

  void fileType

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.2s ease-out both' }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl p-8"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#0c0c0d]">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-center text-lg font-semibold text-[#0c0c0d]">
          生成成功
        </h3>
        <p className="text-center text-sm text-[#52525b] truncate mt-2" title={fileName}>
          {fileName}
        </p>
        {fileSize !== undefined && fileSize > 0 && (
          <p className="text-center text-xs text-[#a1a1aa] mt-1 mb-6">
            {formatBytes(fileSize)}
          </p>
        )}
        {fileSize === undefined && <div className="mb-6" />}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="w-full px-4 py-2.5 rounded-md text-sm font-medium bg-[#0c0c0d] text-white transition hover:opacity-85 active:scale-[0.97]"
          >
            下载文件
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-md text-sm text-[#52525b] border border-[#e4e4e7] transition hover:border-[#d4d4d8] hover:text-[#0c0c0d]"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}