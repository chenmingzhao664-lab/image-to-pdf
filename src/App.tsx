import { useCallback, useState } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import ModeTabs from './components/ModeTabs'
import DownloadModal from './components/DownloadModal'
import Footer from './components/Footer'
import { imagesToPdf, PdfFitMode } from './utils/pdf'
import { imagesToExcel, type OcrLang } from './utils/excel'
import { convertFile, getAcceptExt, type ConvertDirection } from './utils/officedoc'
import { type WorkMode } from './utils/constants'
import { ImageItem } from './types'

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `img_${Date.now()}_${idCounter}`
}

const FEATURES = [
  {
    title: '快速转换',
    desc: '基于 WebAssembly：在浏览器中运行，无上传等待，毫秒级响应。',
    icon: 'fast',
  },
  {
    title: '隐私安全',
    desc: '文件不会上传服务器，所有处理均在本地完成。',
    icon: 'lock',
  },
  {
    title: '完全免费',
    desc: '无水印、无次数限制、无登录要求。',
    icon: 'gift',
  },
]

function FeatureIcon({ name }: { name: string }) {
  const common = 'h-5 w-5'
  switch (name) {
    case 'fast':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'lock':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'gift':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none">
          <path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
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

  const handleError = useCallback((msg: string) => setErrorMsg(msg), [])
  const dismissError = useCallback(() => setErrorMsg(null), [])

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
      setErrorMsg(err instanceof Error ? err.message : '生成时出现未知错误')
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

  const handleCloseDownload = useCallback(() => setDownloadOpen(false), [])

  const uploadMode = mode === 'wordpdf' ? 'doc' : 'images'
  const docAccept = mode === 'wordpdf' ? getAcceptExt(convertDirection) : undefined

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===================== 顶部导航 ===================== */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#fafaf9]/70 border-b border-[#e4e4e7]">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0c0c0d] text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16v16H4V4z M4 9h16 M9 4v16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Image To PDF</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-[#52525b]">
            <a href="#features" className="hover:text-[#0c0c0d] transition">特性</a>
            <a href="#privacy" className="hover:text-[#0c0c0d] transition">隐私</a>
            <a
              href="https://github.com/chenmingzhao664-lab/image-to-pdf"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0c0c0d] transition"
            >
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 pb-16">
        {/* ===================== Hero ===================== */}
        <section className="pt-12 sm:pt-20 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e4e4e7]/60 text-xs text-[#52525b] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb]" />
            纯浏览器端 · 不上传服务器
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#0c0c0d] leading-tight max-w-2xl mx-auto">
            简单、快速、安全地<br className="hidden sm:block" />将图片转换为 PDF
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#52525b] max-w-xl mx-auto">
            所有文件均在浏览器本地处理，不上传服务器
          </p>
        </section>

        {/* ===================== 主操作区（玻璃拟态卡片） ===================== */}
        <section className="glass-card rounded-3xl p-4 sm:p-8 max-w-3xl mx-auto" style={{ animation: 'slideUp 0.5s ease-out both' }}>
          <ModeTabs mode={mode} onModeChange={(m) => { setMode(m); setItems([]) }} />

          <div className="mt-5">
            <Uploader
              onSelectFiles={handleSelectFiles}
              onError={handleError}
              uploadMode={uploadMode}
              docAccept={docAccept}
            />
          </div>

          {errorMsg && (
            <div
              className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              style={{ animation: 'fadeIn 0.2s ease-out both' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 flex-shrink-0">
                <path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="flex-1">{errorMsg}</span>
              <button type="button" onClick={dismissError} className="text-red-400 hover:text-red-700 text-lg leading-none">×</button>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-5">
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
                onReorder={(fromId, toId) => setItems((prev) => {
                  const from = prev.findIndex((i) => i.id === fromId)
                  const to = prev.findIndex((i) => i.id === toId)
                  if (from < 0 || to < 0) return prev
                  const n = [...prev]
                  const [moved] = n.splice(from, 1)
                  n.splice(to, 0, moved!)
                  return n
                })}
              />
            </div>
          )}

          {items.length === 0 && !errorMsg && (
            <p className="mt-4 text-center text-sm text-[#a1a1aa]">
              {mode === 'wordpdf' ? '请上传一个文档文件' : '暂无图片，请通过上方区域上传'}
            </p>
          )}
        </section>

        {/* ===================== Features ===================== */}
        <section id="features" className="mt-20 sm:mt-28">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">为什么选择 zcm的文档转换器</h2>
            <p className="mt-2 text-sm text-[#52525b]">现代、简洁、可信的浏览器端文档工具</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="h-10 w-10 rounded-lg bg-[#0c0c0d] text-white flex items-center justify-center mb-4">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-[#52525b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== Privacy ===================== */}
        <section id="privacy" className="mt-16 sm:mt-20 text-center max-w-2xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e4e4e7]/60 mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#0c0c0d" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 12l2 2 4-4" stroke="#0c0c0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">你的图片不会上传服务器</h2>
          <p className="text-sm text-[#52525b] leading-relaxed">
            所有处理均在浏览器本地完成。打开页面后断网也能用，因为根本没有网络请求发送你的文件出去。
          </p>
        </section>
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
  )
}