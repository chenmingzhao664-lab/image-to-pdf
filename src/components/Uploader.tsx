import { useCallback, useEffect, useRef, useState } from 'react'
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_IMAGE_EXTENSIONS, MAX_SINGLE_IMAGE_BYTES } from '../utils/constants'

interface Props {
  onSelectFiles: (files: File[]) => void
  onError: (msg: string) => void
}

export default function Uploader({ onSelectFiles, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHover, setIsHover] = useState(false)
  const idRef = useRef(0)
  const nextId = () => ++idRef.current

  const validate = useCallback(
    (list: FileList | null): File[] => {
      if (!list || list.length === 0) return []
      const out: File[] = []
      for (let i = 0; i < list.length; i++) {
        const f = list.item(i)
        if (!f) continue
        if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) { onError(`不支持 "${f.name}" 格式`); continue }
        if (f.size > MAX_SINGLE_IMAGE_BYTES) { onError(`"${f.name}" 超过 20MB`); continue }
        out.push(f)
      }
      return out
    },
    [onError],
  )

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const valid = validate(list)
      if (valid.length) onSelectFiles(valid)
    },
    [validate, onSelectFiles],
  )

  // Ctrl+V
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      if (!e.clipboardData) return
      const items = e.clipboardData.items
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const blob = item.getAsFile()
          if (blob) files.push(new File([blob], `粘贴_${nextId()}.${blob.type.split('/')[1] || 'png'}`, { type: blob.type }))
        }
      }
      if (files.length) onSelectFiles(files)
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [onSelectFiles])

  const dropCls = [
    'drop-zone cursor-pointer select-none rounded-2xl flex flex-col items-center justify-center text-center',
    'px-6 py-16 sm:py-20 transition-all duration-200',
    isDragging ? 'dragging scale-[1.01]' : isHover ? 'scale-[1.005]' : '',
  ].join(' ')

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className={dropCls}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] text-[var(--text-tertiary)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
          <path d="M12 16V4M12 4l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-lg sm:text-xl font-semibold tracking-tight">拖拽图片到这里</p>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">支持 JPG · PNG · WebP 单张不超过 20MB · 支持 Ctrl+V</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="mt-6 btn-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        选择图片
      </button>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_EXTENSIONS} multiple onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = '' }} className="hidden" />
    </div>
  )
}
