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
  const typeLabel = isPdf ? 'PDF' : fileType === 'xlsx' ? 'EXCEL' : 'WORD'

  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 0.15s ease-out both' }}>
      <div onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm" style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          padding: 0,
          animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
        {/* Inside container */}
        <div className="p-6">
          {/* Check Icon */}
          <div className="mb-4 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center"
              style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" style={{ color: 'var(--accent)' }}>
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
          </div>
          <h3 className="text-center text-base font-semibold" style={{ fontFamily: 'var(--font-sans)', letterSpacing: '0.08em' }}>
            {typeLabel} 生成成功
          </h3>
          <p className="mt-1 text-center text-xs truncate" style={{ color: 'var(--text-2)' }}>{fileName}</p>
          <div className="mt-4 flex gap-3">
            <div className="flex-1 p-2.5 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
              <div className="font-medium" style={{ fontSize: 10 }}>文件大小</div>
              <div className="mt-0.5 text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>{formatSize(fileSize)}</div>
            </div>
            <div className="flex-1 p-2.5 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)' }}>
              <div className="font-medium" style={{ fontSize: 10 }}>{isPdf ? '页数' : 'Sheets'}</div>
              <div className="mt-0.5 text-sm font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>{pageCount}</div>
            </div>
          </div>
          {isPdf && fileUrl && (
            <div className="mt-3 overflow-hidden" style={{ aspectRatio: '16/10', border: '1px solid var(--line)' }}>
              <iframe src={fileUrl} title="PDF Preview" className="h-full w-full" />
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">关闭</button>
            <button type="button" onClick={onDownload} className="btn-primary flex-1">
              下载 {typeLabel}
            </button>
          </div>
        </div>
        {/* 底部分隔装饰 */}
        <div className="divider-premium" style={{ height: 4, backgroundSize: '16px 16px' }} />
      </div>
    </div>
  )
}
