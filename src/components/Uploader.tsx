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
  const [isHover, setIsHover] = useState(false)
  const idRef = useRef(0)
  const nextId = () => ++idRef.current

  const isImageMode = mode === 'pdf' || mode === 'excel'
  const accept = isImageMode ? ACCEPTED_IMAGE_EXTENSIONS : OFFICE_EXTS
  const maxBytes = isImageMode ? MAX_SINGLE_IMAGE_BYTES : 100 * 1024 * 1024
  const multiple = isImageMode

  const validate = useCallback(
    (list: FileList | null): File[] => {
      if (!list || list.length === 0) return []
      const out: File[] = []
      if (!isImageMode && list.length > 1) {
        onError('Word/Excel 模式每次只能上传一个文件')
        return []
      }
      for (let i = 0; i < list.length; i++) {
        const f = list.item(i)
        if (!f) continue
        if (isImageMode) {
          if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) { onError(`不支持 "${f.name}" 格式`); continue }
        }
        if (f.size > maxBytes) { onError(`"${f.name}" 超过 ${maxBytes / 1024 / 1024}MB`); continue }
        out.push(f)
      }
      return out
    },
    [onError, isImageMode, maxBytes],
  )

  const handleFiles = useCallback(
    (list: FileList | null) => {
      const valid = validate(list)
      if (valid.length) onSelectFiles(valid)
    },
    [validate, onSelectFiles],
  )

  // Ctrl+V (only for image modes)
  useEffect(() => {
    if (!isImageMode) return
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
  }, [onSelectFiles, isImageMode])

  const dropCls = [
    'drop-zone cursor-pointer select-none rounded-2xl flex flex-col items-center justify-center text-center',
    'px-6 py-16 sm:py-20 transition-all duration-200',
    isDragging ? 'dragging scale-[1.01]' : isHover ? 'scale-[1.005]' : '',
  ].join(' ')

  const label = isImageMode ? '拖拽图片到这里' : '点击或拖拽文件到这里'
  const defaultHint = isImageMode ? '支持 JPG · PNG · WebP 单张不超过 20MB · 支持 Ctrl+V' : '支持 .docx · .pdf · .xlsx 文件'

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
      <p className="text-lg sm:text-xl font-semibold tracking-tight">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-tertiary)]">{hint || defaultHint}</p>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
        className="mt-6 btn-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        {isImageMode ? '选择图片' : '选择文件'}
      </button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = '' }} className="hidden" />
    </div>
  )
}