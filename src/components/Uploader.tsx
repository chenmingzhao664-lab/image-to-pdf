import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_DOC_TYPES,
  MAX_SINGLE_IMAGE_BYTES,
  MAX_SINGLE_DOC_BYTES,
} from '../utils/constants'

interface UploaderProps {
  onSelectFiles: (files: File[]) => void
  onError: (msg: string) => void
  uploadMode?: 'images' | 'doc'
  docAccept?: '.docx' | '.pdf' | '.xlsx'
}

const toMB = (b: number) => (b / 1024 / 1024).toFixed(0)

export default function Uploader({
  onSelectFiles,
  onError,
  uploadMode = 'images',
  docAccept = '.pdf',
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileIdRef = useRef(0)
  const nextFileId = () => ++fileIdRef.current

  const isDocMode = uploadMode === 'doc'
  const acceptStr = isDocMode ? docAccept : ACCEPTED_IMAGE_EXTENSIONS
  const multiple = !isDocMode
  const maxBytes = isDocMode ? MAX_SINGLE_DOC_BYTES : MAX_SINGLE_IMAGE_BYTES

  const validateFiles = useCallback(
    (fileList: FileList | null): File[] => {
      if (!fileList || fileList.length === 0) return []
      const accepted: File[] = []
      const allowedTypes = isDocMode ? ACCEPTED_DOC_TYPES : ACCEPTED_IMAGE_TYPES
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList.item(i)
        if (!f) continue
        if (isDocMode) {
          const lower = f.name.toLowerCase()
          if (docAccept === '.docx' && !lower.endsWith('.docx') && !lower.endsWith('.doc')) {
            onError(`仅支持 .docx 文件，已忽略 "${f.name}"`)
            continue
          }
          if (docAccept === '.pdf' && !lower.endsWith('.pdf')) {
            onError(`仅支持 .pdf 文件，已忽略 "${f.name}"`)
            continue
          }
        } else {
          if (!allowedTypes.includes(f.type as never)) continue
        }
        if (f.size > maxBytes) {
          onError(`文件 "${f.name}" 超过 ${toMB(maxBytes)}MB 限制`)
          continue
        }
        accepted.push(f)
        if (isDocMode) break
      }
      return accepted
    },
    [isDocMode, docAccept, maxBytes, onError],
  )

  const acceptFiles = useCallback(
    (files: FileList | null) => {
      const valid = validateFiles(files)
      if (valid.length) onSelectFiles(valid)
    },
    [validateFiles, onSelectFiles],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    acceptFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    acceptFiles(e.dataTransfer.files)
  }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  // Ctrl+V 粘贴图片
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (!e.clipboardData || isDocMode) return
      const items = e.clipboardData.items
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile()
          if (blob) {
            const f = new File([blob], `pasted_img_${nextFileId()}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type })
            files.push(f)
          }
        }
      }
      if (files.length) onSelectFiles(files)
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [isDocMode, onSelectFiles])

  const title = isDocMode
    ? (docAccept === '.pdf' ? '拖拽 PDF 文件到这里' : '拖拽 Word 文件到这里')
    : '拖拽图片到这里'
  const subtitle = isDocMode
    ? `支持 .${docAccept === '.pdf' ? 'pdf' : 'docx'} · 单文件不超过 ${toMB(MAX_SINGLE_DOC_BYTES)}MB`
    : `支持 JPG / PNG / WebP · 单张不超过 ${toMB(MAX_SINGLE_IMAGE_BYTES)}MB · 支持 Ctrl+V 粘贴`
  const btnLabel = isDocMode
    ? (docAccept === '.pdf' ? '选择 PDF' : '选择 Word')
    : '选择图片'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`drop-zone cursor-pointer select-none rounded-[20px] flex flex-col items-center justify-center text-center px-6 py-10 sm:py-14 ${isDragging ? 'dragging' : ''}`}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-tertiary)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path d="M12 16V4M12 4l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-base sm:text-lg font-semibold">{title}</p>
      <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-tertiary)]">{subtitle}</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="mt-5 inline-flex items-center rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-85 active:scale-[0.97]"
      >
        {btnLabel}
      </button>
      <input ref={inputRef} type="file" accept={acceptStr} multiple={multiple} onChange={handleInputChange} className="hidden" />
    </div>
  )
}