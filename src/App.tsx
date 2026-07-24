import { useCallback, useEffect, useState } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import ModeTabs from './components/ModeTabs'
import SettingsPanel from './components/SettingsPanel'
import DownloadModal from './components/DownloadModal'
import ThemeToggle from './components/ThemeToggle'
import HistoryPanel from './components/HistoryPanel'
import { pushHistory } from './components/history'
import Footer from './components/Footer'
import { imagesToPdf, estimatePdfSize, defaultPdfSettings } from './utils/pdf'
import { imagesToExcel, type OcrLang } from './utils/excel'
import { convertFile, getAcceptExt, type ConvertDirection } from './utils/officedoc'
import { BRAND, FLOW_STEPS, type WorkMode } from './utils/constants'
import type { ImageItem, PdfSettings } from './types'

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `img_${Date.now()}_${idCounter}`
}

interface ExtractedMeta {
  orientation: number
  naturalWidth: number
  naturalHeight: number
}

async function readImageMeta(file: File): Promise<ExtractedMeta> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  try {
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej()
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
  // EXIF orientation
  let orientation = 1
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    try {
      const buf = await file.slice(0, 65536).arrayBuffer()
      const dv = new DataView(buf)
      if (dv.getUint16(0) === 0xffd8) {
        let offset = 2
        while (offset < dv.byteLength) {
          const marker = dv.getUint16(offset)
          offset += 2
          if (marker === 0xffe1 && dv.getUint32(offset + 2) === 0x45786966) {
            const tiff = offset + 10
            const little = dv.getUint16(tiff) === 0x4949
            const ifdOffset = tiff + dv.getUint32(tiff + 4, little)
            const entries = dv.getUint16(ifdOffset, little)
            for (let i = 0; i < entries; i++) {
              const e = ifdOffset + 2 + i * 12
              if (dv.getUint16(e, little) === 0x0112) {
                orientation = dv.getUint16(e + 8, little) || 1
                break
              }
            }
            break
          } else if ((marker & 0xff00) === 0xff00 && marker !== 0xffda) {
            offset += dv.getUint16(offset)
          } else break
        }
      }
    } catch { /* ignore */ }
  }
  return { orientation, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }
}

const FEATURES = [
  { icon: 'fast', title: '快速高效', desc: '基于浏览器原生 API，毫秒级生成，无上传等待。' },
  { icon: 'lock', title: '隐私安全', desc: '所有文件均在本地处理，不上传任何服务器。' },
  { icon: 'gift', title: '永久免费', desc: '无水印、无次数限制、无账号要求。' },
]

function FeatureIcon({ name }: { name: string }) {
  const cls = 'h-5 w-5'
  switch (name) {
    case 'fast': return <svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case 'lock': return <svg className={cls} viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    case 'gift': return <svg className={cls} viewBox="0 0 24 24" fill="none"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
    default: return null
  }
}

function FlowStepIcon({ icon }: { icon: string }) {
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[var(--text-secondary)]">
        <path d={icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  )
}

export default function App() {
  const [items, setItems] = useState<ImageItem[]>([])
  const [mode, setMode] = useState<WorkMode>('pdf')
  const [settings, setSettings] = useState<PdfSettings>(defaultPdfSettings)
  const [ocrLang, setOcrLang] = useState<OcrLang>('chi_sim+eng')
  const [convertDirection, setConvertDirection] = useState<ConvertDirection>('word-to-pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progressInfo, setProgressInfo] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null)
  const [downloadFileName, setDownloadFileName] = useState('')
  const [downloadFileSize, setDownloadFileSize] = useState(0)
  const [downloadFileType, setDownloadFileType] = useState<'pdf' | 'excel' | 'docx' | 'xlsx'>('pdf')
  const [downloadPageCount, setDownloadPageCount] = useState(0)

  const dismissError = useCallback(() => setErrorMsg(null), [])

  // ----- 文件选择 -----
  const handleSelectFiles = useCallback(async (files: File[]) => {
    const batch: ImageItem[] = []
    for (const f of files) {
      try {
        const meta = await readImageMeta(f)
        batch.push({
          id: nextId(),
          file: f,
          thumbnail: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
          type: f.type,
          createdAt: Date.now(),
          orientation: meta.orientation,
          naturalWidth: meta.naturalWidth,
          naturalHeight: meta.naturalHeight,
          selected: false,
        })
      } catch { /* skip */ }
    }
    setItems((prev) => [...prev, ...batch])
    setErrorMsg(null)
  }, [])

  const handleDelete = useCallback((id: string) => setItems((prev) => prev.filter((i) => i.id !== id)), [])
  const handleClearAll = useCallback(() => { setItems([]); setErrorMsg(null) }, [])
  const handleBatchDelete = useCallback(() => setItems((prev) => prev.filter((i) => !i.selected)), [])
  const handleToggleSelect = useCallback((id: string) => setItems((prev) => prev.map((i) => i.id === id ? { ...i, selected: !i.selected } : i)), [])
  const handleError = useCallback((msg: string) => setErrorMsg(msg), [])

  const selectionCount = items.filter((i) => i.selected).length

  // ----- 生成 PDF / Excel / Word -----
  const handleGenerate = useCallback(async () => {
    if (items.length === 0) return
    setIsGenerating(true)
    setErrorMsg(null)
    setProgressInfo('准备中…')
    try {
      const files = items.map((i) => i.file)
      if (mode === 'pdf') {
        setProgressInfo('正在生成 PDF…')
        const { pdfBytes, pageCount } = await imagesToPdf(files, settings)
        const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setDownloadBlobUrl(url)
        setDownloadFileName(`zcm文档转换_PDF_${pageCount}页_${Date.now()}.pdf`)
        setDownloadFileSize(blob.size)
        setDownloadFileType('pdf')
        setDownloadPageCount(pageCount)
        pushHistory({ id: nextId(), fileName: `PDF_${pageCount}页`, fileSize: blob.size, pageCount, createdAt: Date.now() })
        setDownloadOpen(true)
      } else if (mode === 'excel') {
        setProgressInfo('正在识别 OCR…')
        const { xlsxBytes, sheetCount } = await imagesToExcel(files, { lang: ocrLang, detectTable: true }, (p) => {
          if (p.phase === 'loading-ocr') setProgressInfo('加载 OCR 引擎…')
          else if (p.phase === 'recognizing') {
            const pct = p.percent != null ? `${p.percent}%` : '…'
            setProgressInfo(`识别中 [${p.current}/${p.total}] ${p.fileName} ${pct}`)
          } else if (p.phase === 'generating-xlsx') setProgressInfo('生成 Excel…')
        })
        const blob = new Blob([xlsxBytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        setDownloadBlobUrl(url)
        setDownloadFileName(`zcm文档转换_Excel_${sheetCount}页_${Date.now()}.xlsx`)
        setDownloadFileSize(blob.size)
        setDownloadFileType('excel')
        setDownloadPageCount(sheetCount)
        pushHistory({ id: nextId(), fileName: `Excel_${sheetCount}页`, fileSize: blob.size, pageCount: sheetCount, createdAt: Date.now() })
        setDownloadOpen(true)
      } else {
        setProgressInfo('正在转换…')
        const file = files[0]!
        const result = await convertFile(file, convertDirection, (p) => setProgressInfo(p.message ?? p.phase))
        const ext = result.ext
        const mime = ext === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'
        const blob = new Blob([result.bytes.buffer as ArrayBuffer], { type: mime })
        const url = URL.createObjectURL(blob)
        const prefix = ext === 'docx' ? 'PDF转Word' : 'Word转PDF'
        setDownloadBlobUrl(url)
        setDownloadFileName(`${prefix}_${Date.now()}.${ext}`)
        setDownloadFileSize(blob.size)
        setDownloadFileType(ext)
        setDownloadPageCount(1)
        pushHistory({ id: nextId(), fileName: `${prefix}_${ext}`, fileSize: blob.size, pageCount: 1, createdAt: Date.now() })
        setDownloadOpen(true)
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '生成时出现未知错误')
    } finally {
      setIsGenerating(false)
      setProgressInfo('')
    }
  }, [items, mode, settings, ocrLang, convertDirection])

  const handleDownload = useCallback(() => {
    if (!downloadBlobUrl) return
    const a = document.createElement('a')
    a.href = downloadBlobUrl
    a.download = downloadFileName
    a.click()
  }, [downloadBlobUrl, downloadFileName])

  useEffect(() => () => { if (downloadBlobUrl) URL.revokeObjectURL(downloadBlobUrl) }, [downloadBlobUrl])

  const uploadMode = mode === 'wordpdf' ? 'doc' : 'images'
  const docAccept = mode === 'wordpdf' ? getAcceptExt(convertDirection) : undefined

  const estimatedSize = mode === 'pdf' && items.length > 0 ? estimatePdfSize(items, settings) : null

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===================== Nav ===================== */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
        <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent)] text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16v16H4V4z M4 9h16 M9 4v16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="text-[15px] font-semibold tracking-tight">Image PDF</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="https://github.com/chenmingzhao664-lab/image-to-pdf" target="_blank" rel="noreferrer" className="hidden sm:inline text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition">GitHub</a>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 mx-auto max-w-6xl w-full px-4 sm:px-6 pb-12">
        {/* ===================== Hero ===================== */}
        <section className="pt-10 sm:pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] mb-5"
            style={{ animation: 'slideUp 0.5s ease-out both' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            快速 · 安全 · 免费
          </div>
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl mx-auto"
            style={{ animation: 'slideUp 0.6s 0.05s ease-out both' }}>
            图片秒变 PDF
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
            style={{ animation: 'slideUp 0.6s 0.1s ease-out both' }}>
            {BRAND.TAGLINE}
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 text-xs text-[var(--text-tertiary)]"
            style={{ animation: 'slideUp 0.6s 0.15s ease-out both' }}>
            {FLOW_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <FlowStepIcon icon={s.icon} />
                  <span className="text-[var(--text-secondary)] font-medium">{s.label}</span>
                </div>
                {i < FLOW_STEPS.length - 1 && <span className="text-[var(--text-quaternary)]">→</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ===================== Main Work Area ===================== */}
        <section className="glass-card rounded-[24px] p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto"
          style={{ animation: 'slideUp 0.5s 0.2s ease-out both' }}>
          <ModeTabs mode={mode} onModeChange={(m) => { setMode(m); setItems([]) }} />

          <div className="mt-5">
            <Uploader onSelectFiles={handleSelectFiles} onError={handleError} uploadMode={uploadMode} docAccept={docAccept} />
          </div>

          {errorMsg && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
              style={{ animation: 'slideDown 0.2s ease-out both' }}>
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0"><path d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="flex-1">{errorMsg}</span>
              <button type="button" onClick={dismissError} className="text-red-400 hover:text-red-700 dark:hover:text-red-200 text-lg leading-none">×</button>
            </div>
          )}

          {/* 非 PDF 模式的参数 */}
          {mode === 'excel' && items.length > 0 && (
            <div className="mt-5 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span>OCR 识别语言：</span>
              <select value={ocrLang} onChange={(e) => setOcrLang(e.target.value as OcrLang)}
                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 py-1.5 text-xs">
                <option value="chi_sim+eng">中文(简)+英文</option>
                <option value="chi_tra+eng">中文(繁)+英文</option>
                <option value="eng">英文</option>
                <option value="chi_sim">中文(简)</option>
                <option value="chi_tra">中文(繁)</option>
              </select>
            </div>
          )}

          {mode === 'wordpdf' && items.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1">
              {(['word-to-pdf','pdf-to-word','excel-to-pdf','pdf-to-excel'] as const).map((dir) => (
                <button key={dir} type="button" onClick={() => setConvertDirection(dir)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${convertDirection === dir ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  {dir === 'word-to-pdf' ? 'Word → PDF' : dir === 'pdf-to-word' ? 'PDF → Word' : dir === 'excel-to-pdf' ? 'Excel → PDF' : 'PDF → Excel'}
                </button>
              ))}
            </div>
          )}

          {/* Settings panel (PDF only) */}
          {mode === 'pdf' && items.length > 0 && (
            <div className="mt-5">
              <SettingsPanel settings={settings} onChange={(p) => setSettings((s) => ({ ...s, ...p }))} />
            </div>
          )}

          {items.length > 0 && (
            <>
              <Toolbar
                total={items.length}
                selectionCount={selectionCount}
                estimatedSize={estimatedSize}
                onClearAll={selectionCount > 0 ? handleBatchDelete : handleClearAll}
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
                  const n = [...prev]; [n[idx-1]!, n[idx]!] = [n[idx]!, n[idx-1]!]; return n
                })}
                onMoveDown={(id) => setItems((prev) => {
                  const idx = prev.findIndex((i) => i.id === id)
                  if (idx < 0 || idx >= prev.length - 1) return prev
                  const n = [...prev]; [n[idx]!, n[idx+1]!] = [n[idx+1]!, n[idx]!]; return n
                })}
                onReorder={(fromId, toId) => setItems((prev) => {
                  const from = prev.findIndex((i) => i.id === fromId)
                  const to = prev.findIndex((i) => i.id === toId)
                  if (from < 0 || to < 0) return prev
                  const n = [...prev]; const [m] = n.splice(from, 1); n.splice(to, 0, m!); return n
                })}
                onToggleSelect={handleToggleSelect}
              />
            </>
          )}

          {items.length === 0 && !errorMsg && (
            <p className="mt-5 text-center text-sm text-[var(--text-tertiary)]">
              {mode === 'wordpdf' ? '请上传一个文档文件' : '拖入图片 / 点击按钮 / Ctrl+V 粘贴'}
            </p>
          )}
        </section>

        {/* ===================== History ===================== */}
        <div className="max-w-3xl mx-auto">
          <HistoryPanel />
        </div>

        {/* ===================== Features ===================== */}
        <section id="features" className="mt-16 sm:mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{BRAND.NAME}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">现代 · 简洁 · 可信的浏览器端文档工具</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="feat-card">
                <div className="h-10 w-10 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center mb-4">
                  <FeatureIcon name={f.icon} />
                </div>
                <h3 className="text-base font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== Privacy ===================== */}
        <section className="mt-12 sm:mt-16 text-center max-w-2xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">你的文件不会上传服务器</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            所有处理均在浏览器本地完成。打开页面后断网也能用——根本没有网络请求发送你的文件出去。
          </p>
        </section>
      </main>

      <Footer />

      <DownloadModal
        open={downloadOpen}
        fileName={downloadFileName}
        fileUrl={downloadBlobUrl ?? undefined}
        fileType={downloadFileType}
        fileSize={downloadFileSize}
        pageCount={downloadPageCount}
        onClose={() => setDownloadOpen(false)}
        onDownload={handleDownload}
      />
    </div>
  )
}