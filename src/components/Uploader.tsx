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

  const validate = useCallback((list: FileList | null): File[] => {
    if (!list || list.length === 0) return []
    const out: File[] = []
    if (!isImageMode && list.length > 1) { onError('SINGLE FILE ONLY'); return [] }
    for (let i = 0; i < list.length; i++) {
      const f = list.item(i); if (!f) continue
      if (isImageMode && !ACCEPTED_IMAGE_TYPES.includes(f.type as never)) { onError(`INVALID: ${f.name}`); continue }
      if (f.size > maxBytes) { onError(`OVERSIZE: ${f.name}`); continue }
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

  const label = isImageMode ? '拖拽图片到这里' : '拖拽文件到这里'

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      className={`drop-zone select-none ${isDragging ? 'dragging' : ''}`}
    >
      <span className="corner tl" /><span className="corner tr" />
      <span className="corner bl" /><span className="corner br" />

      <div className="mb-5 flex h-14 w-14 items-center justify-center" style={{
        background: 'var(--bg-1)', border: '1.5px solid var(--ark-yellow)', color: 'var(--ark-yellow)',
      }}>
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path d="M12 16V4M12 4l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="square"/>
        </svg>
      </div>
      <p className="text-xl sm:text-2xl font-semibold tracking-[0.04em]" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
      <p className="mt-2 ark-label" style={{ fontSize: 11 }}>{hint}</p>
      <button type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }} className="btn-primary mt-6">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square"/></svg>
        选择文件
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple}
        onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = '' }} className="hidden" />
    </div>
  )
}