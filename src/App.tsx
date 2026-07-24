import { useState, useCallback } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import ModeTabs from './components/ModeTabs'
import DownloadModal from './components/DownloadModal'
import Footer from './components/Footer'
import { imagesToPdf, PdfFitMode } from './utils/pdf'
import { imagesToExcel, type OcrLang } from './utils/excel'
import { convertFile, getAcceptExt, type ConvertDirection } from './utils/officedoc'
import { SITE_TITLE, SITE_TAGLINE, SITE_SUBTITLE, type WorkMode } from './utils/constants'
import { ImageItem } from './types'

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `img_${Date.now()}_${idCounter}`
}

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<WorkMode>('pdf')
  const [fitMode, setFitMode] = useState<PdfFitMode>('original')
  const [ocrLang, setOcrLang] = useState<OcrLang>('chi_sim+eng')
  const [convertDirection, setConvertDirection] = useState<ConvertDirection>('word-to-pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressInfo, setProgressInfo] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null)
  const [downloadFileName, setDownloadFileName] = useState('')
  const [downloadFileSize, setDownloadFileSize] = useState(0)
  const [downloadFileType, setDownloadFileType] = useState<'pdf' | 'excel' | 'docx' | 'xlsx'>('pdf')

  const handleSelectFiles = useCallback(async (files: File[]) => {
    const newItems: ImageItem[] = []
    for (const f of files) {
      try {
        newItems.push({
          id: nextId(),
          file: f,
          thumbnail: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
          type: f.type,
          createdAt: Date.now(),
        })
      } catch {
        // skip
      }
    }
    setItems((prev) => [...prev, ...newItems])
    setErrorMsg(null)
  }, [])

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
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
    setProgressInfo('准备中...')

    try {
      const files = items.map((i) => i.file)

      if (mode === 'pdf') {
        setProgressInfo('正在生成 PDF...')
        const { pdfBytes, pageCount } = await imagesToPdf(files, fitMode)
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadBlobUrl(url)
        setDownloadFileName(`图片转PDF_${pageCount}页_${Date.now()}.pdf`)
        setDownloadFileSize(blob.size)
        setDownloadFileType('pdf')
        setDownloadOpen(true)
      } else if (mode === 'excel') {
        const { xlsxBytes, sheetCount } = await imagesToExcel(
          files,
          { lang: ocrLang, detectTable: true },
          (p) => {
            if (p.phase === 'loading-ocr') setProgressInfo('正在加载 OCR 引擎（首次约 5-10 秒）...')
            else if (p.phase === 'recognizing') {
              const pct = p.percent !== undefined ? `${p.percent}%` : '...'
              setProgressInfo(`识别中 [${p.current}/${p.total}] ${p.fileName} ${pct}`)
            } else if (p.phase === 'generating-xlsx') setProgressInfo('正在生成 Excel 文件...')
          },
        )
        const blob = new Blob([xlsxBytes.buffer as ArrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        const url = URL.createObjectURL(blob)
        setDownloadBlobUrl(url)
        setDownloadFileName(`图片转Excel_${sheetCount}页_${Date.now()}.xlsx`)
        setDownloadFileSize(blob.size)
        setDownloadFileType('excel')
        setDownloadOpen(true)
      } else {
        // wordpdf 模式
        const file = files[0]!
        const result = await convertFile(file, convertDirection, (p) => {
          setProgressInfo(p.message ?? p.phase)
        })
        const ext = result.ext
        const mime = ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
        const blob = new Blob([result.bytes.buffer as ArrayBuffer], { type: mime })
        const url = URL.createObjectURL(blob)
        const prefix = ext === 'docx' ? 'PDF转Word' : 'Word转PDF'
        setDownloadBlobUrl(url)
        setDownloadFileName(`${prefix}_${Date.now()}.${ext}`)
        setDownloadFileSize(blob.size)
        setDownloadFileType(ext)
        setDownloadOpen(true)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '生成时出现未知错误'
      setErrorMsg(msg)
    } finally {
      setIsGenerating(false)
      setProgressInfo('')
    }
  }, [items, mode, fitMode, ocrLang, convertDirection])

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

  const uploadMode = mode === 'wordpdf' ? 'doc' : 'images'
  const docAccept = mode === 'wordpdf' ? getAcceptExt(convertDirection) : undefined

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="manga-card rounded-[32px] px-5 py-8 sm:px-8 sm:py-10 relative overflow-hidden">
      {/* 手绘装饰：星星右上角 */}
      <div className="manga-deco hidden sm:block" style={{ top: 22, right: 24 }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2l3.1 6.3 7 .3-5.3 4.6L21 20l-7-3.3L7 20l2.2-6.8L4 8.6l7-.3L14 2z" fill="#5EEAD4" stroke="#1a1033" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
      {/* 手绘装饰：小闪电左上角 */}
      <div className="manga-deco hidden sm:block" style={{ top: 18, left: 18 }}>
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
          <path d="M16 2l-8 14h5L9 30l12-16h-5l5-12z" fill="#FFD86B" stroke="#1a1033" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>

      <header className="relative pb-2 text-center">
        <h1 className="manga-title-glow text-4xl sm:text-5xl font-extrabold tracking-tight pt-4">
          {SITE_TITLE}
        </h1>
        <p className="mt-1.5 text-base sm:text-lg font-medium text-white/70" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {SITE_TAGLINE}
        </p>
        <p className="mt-1 text-xs sm:text-sm text-white/40">
          {SITE_SUBTITLE}
        </p>
      </header>

      <main className="mt-6 sm:mt-8 space-y-5">
        <ModeTabs mode={mode} onModeChange={(m) => { setMode(m); setItems([]) }} />

        <Uploader
          onSelectFiles={handleSelectFiles}
          onError={handleError}
          uploadMode={uploadMode}
          docAccept={docAccept}
        />

        {errorMsg && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-red-400 bg-red-500/20 px-4 py-3 text-sm text-red-100 backdrop-blur">
            <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-5 w-5 flex-shrink-0">
              <path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="flex-1">{errorMsg}</span>
            <button type="button" onClick={dismissError} className="text-red-200 hover:text-white text-lg leading-none">×</button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <Toolbar
              total={items.length}
              mode={mode}
              fitMode={fitMode}
              onFitModeChange={setFitMode}
              ocrLang={ocrLang}
              onOcrLangChange={setOcrLang}
              convertDirection={convertDirection}
              onConvertDirectionChange={setConvertDirection}
              onClearAll={handleClearAll}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              progressInfo={progressInfo}
            />
            <ImageList
              items={items}
              onDelete={handleDelete}
              onMoveUp={(id) => setItems((prev) => {
                const idx = prev.findIndex((i) => i.id === id)
                if (idx < 1) return prev
                const n = [...prev]; [n[idx - 1]!, n[idx]!] = [n[idx]!, n[idx - 1]!]; return n
              })}
              onMoveDown={(id) => setItems((prev) => {
                const idx = prev.findIndex((i) => i.id === id)
                if (idx < 0 || idx >= prev.length - 1) return prev
                const n = [...prev]; [n[idx]!, n[idx + 1]!] = [n[idx + 1]!, n[idx]!]; return n
              })}
            />
          </>
        )}

        {items.length === 0 && !errorMsg && (
          <p className="text-center text-sm text-white/40">
            {mode === 'wordpdf' ? '请上传一个文档文件' : '暂无图片，请通过上方区域上传'}
          </p>
        )}
      </main>

      <Footer />

      <DownloadModal
        open={downloadOpen}
        fileName={downloadFileName}
        fileType={downloadFileType}
        fileSize={downloadFileSize}
        onClose={handleCloseDownload}
        onDownload={handleDownload}
      />
      </div>
    </div>
  )
}
