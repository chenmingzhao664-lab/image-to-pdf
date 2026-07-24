import { useEffect } from 'react'
import { formatSize } from '../utils/pdf'

interface Props {
  open: boolean
  fileName: string
  fileUrl?: string
  fileType: 'pdf' | 'excel' | 'docx' | 'xlsx'
  fileSize: number
  pageCount: number
  onClose: () => void
  onDownload: () => void
}

export default function DownloadModal({
  open, fileName, fileUrl, fileType, fileSize, pageCount, onClose, onDownload,
}: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const isPdf = fileType === 'pdf'
  const friendly = isPdf ? 'PDF' : fileType === 'excel' ? 'Excel' : fileType === 'docx' ? 'Word' : 'Excel'

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 0.2s ease-out both' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-3xl p-6 sm:p-8 w-full max-w-lg"
        style={{ animation: 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
      >
        {/* 成功图标 */}
        <div className="mb-5 flex items-center justify-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500"
            style={{ animation: 'checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <h3 className="text-center text-lg font-semibold">{friendly} 生成完成</h3>
        <p className="mt-1.5 text-center text-xs text-[var(--text-tertiary)] truncate px-4">{fileName}</p>

        {/* 信息 */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3 text-center">
            <div className="text-[11px] text-[var(--text-tertiary)]">文件大小</div>
            <div className="mt-0.5 text-sm font-semibold">{formatSize(fileSize)}</div>
          </div>
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3 text-center">
            <div className="text-[11px] text-[var(--text-tertiary)]">{isPdf ? '页数' : 'Sheet 数'}</div>
            <div className="mt-0.5 text-sm font-semibold">{pageCount}</div>
          </div>
        </div>

        {/* PDF 预览 */}
        {isPdf && fileUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border-subtle)]" style={{ aspectRatio: '16/10' }}>
            <iframe src={fileUrl} title="PDF Preview" className="h-full w-full" />
          </div>
        )}

        {/* 按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-85 transition active:scale-[0.97]"
          >
            下载 {friendly}
          </button>
        </div>
      </div>
    </div>
  )
}