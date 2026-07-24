interface DownloadModalProps {
  open: boolean
  fileName: string
  fileUrl?: string
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

export default function DownloadModal({ open, fileName, fileUrl, fileType = 'pdf', fileSize, onClose, onDownload }: DownloadModalProps) {
  if (!open) return null
  void fileType

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
      onClick={onClose} style={{ animation: 'fadeIn 0.2s ease-out both' }}>
      <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8e8ea]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0c0c0d]" style={{ animation: 'checkPop 0.3s ease-out both' }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#0c0c0d]">生成成功</h3>
              <p className="text-xs text-[#a1a1aa] truncate max-w-[280px] sm:max-w-[400px]" title={fileName}>{fileName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#a1a1aa] hover:bg-[#f4f4f5] shrink-0">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {fileUrl && fileType === 'pdf' && (
          <div className="border-b border-[#e8e8ea] bg-[#fafaf9]">
            <iframe src={fileUrl} className="w-full" style={{ height: '380px' }} title="PDF 预览" />
          </div>
        )}

        <div className="px-6 py-4 flex items-center justify-between">
          {fileSize !== undefined && fileSize > 0 ? (
            <span className="text-xs text-[#a1a1aa]">{formatBytes(fileSize)}</span>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#52525b] border border-[#e8e8ea] hover:border-[#d4d4d8] hover:text-[#0c0c0d]">
              关闭
            </button>
            <button type="button" onClick={onDownload}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#0c0c0d] text-white hover:opacity-85 active:scale-[0.97]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              下载文件
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}