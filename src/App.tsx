import { useState, useCallback } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import DownloadModal from './components/DownloadModal'
import Footer from './components/Footer'
import { generateThumbnail } from './utils/image'
import { imagesToPdf, PdfFitMode } from './utils/pdf'
import { SITE_TITLE, SITE_SUBTITLE } from './utils/constants'
import { ImageItem } from './types'

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `img_${Date.now()}_${idCounter}`
}

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [fitMode, setFitMode] = useState<PdfFitMode>('original')
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null)
  const [downloadFileName, setDownloadFileName] = useState('')

  const handleSelectFiles = useCallback(async (files: File[]) => {
    const newItems: ImageItem[] = []
    for (const f of files) {
      try {
        const thumb = await generateThumbnail(f)
        newItems.push({
          id: nextId(),
          file: f,
          thumbnail: thumb,
          name: f.name,
          size: f.size,
          type: f.type,
          createdAt: Date.now(),
        })
      } catch {
        // 缩略图生成失败跳过该图片
      }
    }
    setItems((prev) => [...prev, ...newItems])
    setErrorMsg(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handleMoveUp = useCallback((id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx < 1) return prev
      const next = [...prev]
      ;[next[idx - 1]!, next[idx]!] = [next[idx]!, next[idx - 1]!]
      return next
    })
  }, [])

  const handleMoveDown = useCallback((id: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[idx]!, next[idx + 1]!] = [next[idx + 1]!, next[idx]!]
      return next
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setItems([])
    setErrorMsg(null)
  }, [])

  const handleError = useCallback((msg: string) => {
    setErrorMsg(msg)
  }, [])

  const dismissError = useCallback(() => {
    setErrorMsg(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (items.length === 0) return
    setIsGenerating(true)
    setErrorMsg(null)

    try {
      const files = items.map((i) => i.file)

      const { pdfBytes, pageCount } = await imagesToPdf(files, fitMode)

      // 构造 Blob 需要 Uint8Array → ArrayBuffer 兼容转换
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadBlobUrl(url)
      setDownloadFileName(`图片转PDF_${pageCount}页_${Date.now()}.pdf`)
      setDownloadOpen(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '生成 PDF 时出现未知错误'
      setErrorMsg(msg)
    } finally {
      setIsGenerating(false)
    }
  }, [items, fitMode])

  const handleDownload = useCallback(() => {
    if (!downloadBlobUrl) return
    const a = document.createElement('a')
    a.href = downloadBlobUrl
    a.download = downloadFileName
    a.click()
  }, [downloadBlobUrl, downloadFileName])

  const handleCloseDownload = useCallback(() => {
    setDownloadOpen(false)
  }, [])

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 sm:px-6">
      <header className="pt-8 pb-2 text-center sm:pt-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          {SITE_TITLE}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-500">
          {SITE_SUBTITLE}
        </p>
      </header>

      <main className="mt-6 sm:mt-8 space-y-5">
        <Uploader onSelectFiles={handleSelectFiles} onError={handleError} />

        {errorMsg && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 flex-shrink-0">
              <path
                d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="flex-1">{errorMsg}</span>
            <button
              type="button"
              onClick={dismissError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <Toolbar
              total={items.length}
              fitMode={fitMode}
              onFitModeChange={setFitMode}
              onClearAll={handleClearAll}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
            <ImageList
              items={items}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          </>
        )}

        {items.length === 0 && !errorMsg && (
          <p className="text-center text-sm text-gray-400">
            暂无图片，请通过上方区域上传
          </p>
        )}
      </main>

      <Footer />

      <DownloadModal
        open={downloadOpen}
        fileName={downloadFileName}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
      />
    </div>
  )
}
