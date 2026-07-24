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

/** 生成完成后的下载弹窗（漫画风暗色版） */
export default function DownloadModal({
  open,
  fileName,
  fileType = 'pdf',
  fileSize,
  onClose,
  onDownload,
}: DownloadModalProps) {
  if (!open) return null

  // fileType 保留为扩展点
  void fileType

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1033]/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm manga-card rounded-[28px] p-6"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(28, 18, 56, 0.88)',
          boxShadow: '8px 8px 0 0 rgba(255, 216, 107, 0.55), 14px 14px 0 0 rgba(255, 107, 107, 0.30), 0 20px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* 成功图标：薄荷绿勾 */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#5EEAD4] bg-[#5EEAD4]/15">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-[#5EEAD4]">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-center text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          生成成功 ✨
        </h3>
        <p className="text-center text-xs text-white/50 truncate mt-2 mb-1" title={fileName}>
          {fileName}
        </p>
        {fileSize !== undefined && fileSize > 0 && (
          <p className="text-center text-[11px] text-white/35 mb-5">
            {formatBytes(fileSize)}
          </p>
        )}
        {fileSize === undefined && <div className="mb-5" />}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="manga-btn manga-btn-primary w-full px-4 py-2.5 rounded-xl text-base font-semibold"
          >
            下载文件 🚀
          </button>
          <button
            type="button"
            onClick={onClose}
            className="manga-btn manga-btn-ghost w-full px-4 py-2.5 rounded-xl text-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}