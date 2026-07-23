import { useCallback, useRef, useState } from 'react'
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_IMAGE_EXTENSIONS,
  MAX_SINGLE_IMAGE_BYTES,
  TYPE_FRIENDLY_NAME,
} from '../utils/constants'

interface UploaderProps {
  /** 上传成功一组文件时回调 */
  onSelectFiles: (files: File[]) => void
  /** 上传错误回调 */
  onError: (msg: string) => void
}

/**
 * 大号拖拽上传区域，支持点击 + 拖拽 + 多文件
 */
export default function Uploader({ onSelectFiles, onError }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  /** 校验文件类型 + 大小，返回合格文件 */
  const validateFiles = useCallback(
    (fileList: FileList | null): File[] => {
      if (!fileList || fileList.length === 0) return []
      const accepted: File[] = []
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList.item(i)
        if (!f) continue
        // 不在白名单的忽略
        if (!ACCEPTED_IMAGE_TYPES.includes(f.type as never)) {
          continue
        }
        // 超大图片忽略并发错误提示
        if (f.size > MAX_SINGLE_IMAGE_BYTES) {
          onError(
            `图片 "${f.name}" 超过 ${(MAX_SINGLE_IMAGE_BYTES / 1024 / 1024).toFixed(0)}MB 限制，` +
            `请压缩后再上传。`,
          )
          continue
        }
        accepted.push(f)
      }
      return accepted
    },
    [onError],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = validateFiles(e.target.files)
    if (files.length) onSelectFiles(files)
    // 清空 input 让用户能再次选择同一文件
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
        'cursor-pointer select-none rounded-3xl border-2 border-dashed transition-all',
        'flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16',
        isDragging
          ? 'border-blue-600 bg-blue-50 scale-[1.01]'
          : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50/40',
      ].join(' ')}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <path
            d="M12 16V4M12 4l-4 4m4-4l4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-lg sm:text-xl font-semibold text-gray-900">
        拖拽图片到这里
      </p>
      <p className="mt-1 text-sm text-gray-500">
        支持 {Object.values(TYPE_FRIENDLY_NAME).filter((v, i, a) => a.indexOf(v) === i).join(' / ')} · 单张不超过 {MAX_SINGLE_IMAGE_BYTES / 1024 / 1024}MB
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.click()
        }}
        className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-6 py-2.5 text-white font-medium shadow-sm transition hover:bg-blue-700 active:scale-95"
      >
        选择图片
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_EXTENSIONS}
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-label="选择图片文件"
      />
    </div>
  )
}
