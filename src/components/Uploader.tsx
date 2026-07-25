import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_IMAGE_EXTENSIONS, MAX_SINGLE_IMAGE_BYTES } from '../utils/constants'

interface Props {
  onSelectFiles: (files: File[]) => void
  onError: (msg: string) => void
  mode?: string
  hint?: string
}

const OFFICE_EXTS = '.docx,.pdf,.xlsx'

export default function Uploader({ onSelectFiles, onError, mode = 'pdf', hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const idRef = useRef(0); const nextId = () => ++idRef.current

  const isImageMode = mode === 'pdf' || mode === 'excel'
  const accept = isImageMode ? ACCEPTED_IMAGE_EXTENSIONS : OFFICE_EXTS
  const maxBytes = isImageMode ? MAX_SINGLE_IMAGE_BYTES : 100 * 1024 * 1024
  const multiple = isImageMode
  const uploadHintId = 'upload-hint'
  const inputAriaLabel = isImageMode ? '选择图片文件，支持 JPG、PNG、WebP 格式' : '选择文档文件，支持 .docx、.pdf、.xlsx 格式'

  const validate = useCallback((list: FileList | null): File[] => {
    if (!list || list.length === 0) return []
    const out: File[] = []
    if (!isImageMode && list.length > 1) { onError('一次只能选择 1 个文档文件'); return [] }
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i); if (!f) continue
      if (isImageMode && !ACCEPTED_IMAGE_TYPES.includes(f.type as never)) { onError(`不支持的格式：${f.name}（仅 JPG / PNG / WebP）`); continue }
      if (f.size > maxBytes) { onError(`文件过大：${f.name}（超过 ${Math.round(maxBytes / 1024 / 1024)}MB 限制）`); continue }
      out.push(f)
    }
    return out
  }, [onError, isImageMode, maxBytes])

  const handleFiles = useCallback((list: FileList | null) => { const v = validate(list); if (v.length) onSelectFiles(v) }, [validate, onSelectFiles])

  useEffect(() => {
    if (!isImageMode) return
    const h = (e: ClipboardEvent) => {
      if (!e.clipboardData) return; const items = e.clipboardData.items; const files: File[] = []
      for (let i = 0; i < items.length; i++) { const it = items[i]; if (it && it.kind === 'file' && it.type.startsWith('image/')) {
        const b = it.getAsFile(); if (b) files.push(new File([b], `paste_${nextId()}.${b.type.split('/')[1] || 'png'}`, { type: b.type })) } }
      if (files.length) onSelectFiles(files)
    }
    document.addEventListener('paste', h); return () => document.removeEventListener('paste', h)
  }, [onSelectFiles, isImageMode])

  return (
    <div
      role="button" tabIndex={0} aria-labelledby="upload-text" aria-describedby={uploadHintId}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      className={`drop-zone select-none cursor-pointer ${isDragging ? 'dragging' : ''}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12" style={{ color: 'var(--text-3)' }} aria-hidden="true">
        <path d="M12 16V4M12 4l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
      </svg>
      <p id="upload-text" className="mt-5 text-base sm:text-lg font-semibold" style={{ color: 'var(--text-1)' }}>拖拽图片到这里</p>
      <p id={uploadHintId} className="mt-2" style={{ fontSize: 13, color: 'var(--text-3)' }}>{hint || 'JPG · PNG · WebP'}</p>

      <input ref={inputRef} type="file" accept={accept} multiple={multiple} aria-label={inputAriaLabel} tabIndex={-1}
        onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = '' }} className="sr-only" />
    </div>
  )
}