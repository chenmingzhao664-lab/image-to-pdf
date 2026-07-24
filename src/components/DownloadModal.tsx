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

export default function DownloadModal({ open, fileName, fileUrl, fileType, fileSize, pageCount, onClose, onDownload }: Props) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null

  const isPdf = fileType === 'pdf'
  const typeLabel = isPdf ? 'PDF' : fileType === 'excel' ? 'Excel' : 'Word'

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.35)', animation: 'fadeIn 0.15s ease-out both' }}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-6" style={{ animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
        <div className="mb-4 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ animation: 'checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-green-500"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <h3 className="text-center text-base font-semibold">{typeLabel} 生成成功</h3>
        <p className="mt-1 text-center text-xs text-[var(--text-tertiary)] truncate">{fileName}</p>
        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-2.5 text-center">
            <div className="text-[10px] text-[var(--text-tertiary)]">文件大小</div>
            <div className="mt-0.5 text-sm font-semibold">{formatSize(fileSize)}</div>
          </div>
          <div className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-2.5 text-center">
            <div className="text-[10px] text-[var(--text-tertiary)]">{isPdf ? '页数' : 'Sheet'}</div>
            <div className="mt-0.5 text-sm font-semibold">{pageCount}</div>
          </div>
        </div>
        {isPdf && fileUrl && (
          <div className="mt-3 rounded-xl overflow-hidden border border-[var(--border)]" style={{ aspectRatio: '16/10' }}>
            <iframe src={fileUrl} title="PDF Preview" className="h-full w-full" />
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">关闭</button>
          <button type="button" onClick={onDownload} className="btn-primary flex-1">下载 {typeLabel}</button>
        </div>
      </div>
    </div>
  )
}
