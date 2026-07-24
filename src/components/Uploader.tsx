import { useCallback, useRef, useState } from 'react'
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_DOC_TYPES,
  MAX_SINGLE_IMAGE_BYTES,
  MAX_SINGLE_DOC_BYTES,
  TYPE_FRIENDLY_NAME,
} from '../utils/constants'

interface UploaderProps {
  onSelectFiles: (files: File[]) => void
  onError: (msg: string) => void
  uploadMode?: 'images' | 'doc'
  docAccept?: '.docx' | '.pdf' | '.xlsx'
}

/** 大号玻璃拟态拖拽上传区域 */
export default function Uploader({
  onSelectFiles,
  onError,
  uploadMode = 'images',
  docAccept = '.pdf',
}: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

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
          const mb = (maxBytes / 1024 / 1024).toFixed(0)
          onError(`文件 "${f.name}" 超过 ${mb}MB 限制，请压缩后再上传。`)
          continue
        }
        accepted.push(f)

        if (isDocMode) break
      }
      return accepted
    },
    [isDocMode, docAccept, maxBytes, onError],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = validateFiles(e.target.files)
    if (files.length) onSelectFiles(files)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const files = validateFiles(e.dataTransfer.files)
    if (files.length) onSelectFiles(files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const title = isDocMode
    ? (docAccept === '.pdf' ? '拖拽 PDF 文件到这里' : '拖拽 Word 文件到这里')
    : '拖拽图片到这里'

  const subtitle = isDocMode
    ? `支持 .${docAccept === '.pdf' ? 'pdf' : 'docx'} · 单文件不超过 ${MAX_SINGLE_DOC_BYTES / 1024 / 1024}MB`
    : `支持 ${Object.values(TYPE_FRIENDLY_NAME).filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).join(' / ')} · 单张不超过 ${MAX_SINGLE_IMAGE_BYTES / 1024 / 1024}MB`

  const btnLabel = isDocMode
    ? (docAccept === '.pdf' ? '选择 PDF' : '选择 Word')
    : '选择图片'

  const acceptProp = isDocMode ? docAccept : acceptStr

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={[
        'drop-zone cursor-pointer select-none rounded-2xl transition-all',
        'flex flex-col items-center justify-center text-center px-6 py-12 sm:py-14',
        isDragging ? 'dragging' : '',
      ].join(' ')}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#f4f4f5] text-[#a1a1aa]">
        {isDocMode ? (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path d="M7 3h7l5 5v13a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path d="M12 16V4M12 4l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p className="text-base sm:text-lg font-semibold text-[#0c0c0d]">{title}</p>
      <p className="mt-1.5 text-xs sm:text-sm text-[#a1a1aa]">{subtitle}</p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className="mt-5 inline-flex items-center rounded-lg bg-[#0c0c0d] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-85 active:scale-[0.97]"
      >
        {btnLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptProp}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        aria-label={btnLabel}
      />
    </div>
  )
}