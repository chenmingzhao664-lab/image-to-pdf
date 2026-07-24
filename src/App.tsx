import { useCallback, useEffect, useMemo, useState } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import SettingsPanel from './components/SettingsPanel'
import ModeTabs from './components/ModeTabs'
import DownloadModal from './components/DownloadModal'
import ThemeToggle from './components/ThemeToggle'
import HistoryPanel from './components/HistoryPanel'
import { pushHistory } from './components/history'
import Footer from './components/Footer'
import { imagesToPdf, estimatePdfSize, defaultPdfSettings, formatSize } from './utils/pdf'
import { imagesToExcel } from './utils/excel'
import { convertFile } from './utils/officedoc'
import type { ConvertDirection } from './utils/officedoc'
import { BRAND } from './utils/constants'
import type { ImageItem, PdfSettings } from './types'

let idCounter = 0
const nextId = () => `img_${Date.now()}_${++idCounter}`

type AppMode = 'pdf' | 'excel' | 'wordpdf'

function readImageMeta(file: File): Promise<{ thumbnail: string; width: number; height: number }> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const MAX = 240
      const ratio = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio))
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const thumb = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(url)
      res({ thumbnail: thumb, width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(`无法读取 "${file.name}"`)) }
    img.src = url
  })
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('pdf')
  const [items, setItems] = useState<ImageItem[]>([])
  const [settings, setSettings] = useState<PdfSettings>(defaultPdfSettings)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [download, setDownload] = useState<{ url: string; name: string; size: number; pageCount: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  const handleSelectFiles = useCallback(async (files: File[]) => {
    setError(null)
    if (mode === 'wordpdf') {
      const newItems: ImageItem[] = files.map((f) => ({
        id: nextId(), file: f, thumbnail: '',
        name: f.name, size: f.size, type: f.type, createdAt: Date.now(),
      }))
      setItems((arr) => [...arr, ...newItems])
      return
    }
    const newItems: ImageItem[] = []
    for (const f of files) {
      try {
        const meta = await readImageMeta(f)
        newItems.push({
          id: nextId(), file: f, thumbnail: meta.thumbnail,
          name: f.name, size: f.size, type: f.type, createdAt: Date.now(),
          naturalWidth: meta.width, naturalHeight: meta.height,
        })
      } catch (e) { setError((e as Error).message) }
    }
    if (newItems.length) setItems((arr) => [...arr, ...newItems])
  }, [mode])

  const handleDelete = useCallback((id: string) => setItems((arr) => arr.filter((i) => i.id !== id)), [])
  const handleClearAll = useCallback(() => { if (confirm('确定清空全部?')) setItems([]) }, [])
  const handleMove = useCallback((id: string, dir: -1 | 1) => {
    setItems((arr) => {
      const i = arr.findIndex((x) => x.id === id)
      if (i < 0) return arr; const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      const next = arr.slice(); [next[i], next[j]] = [next[j]!, next[i]!]; return next
    })
  }, [])

  const handleReorder = useCallback((fromId: string, toId: string) => {
    setItems((arr) => {
      const from = arr.findIndex((x) => x.id === fromId)
      const to = arr.findIndex((x) => x.id === toId)
      if (from < 0 || to < 0) return arr
      const next = arr.slice(); const [m] = next.splice(from, 1); next.splice(to, 0, m!); return next
    })
  }, [])

  const handleToggleSelect = useCallback((id: string) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i)))
  }, [])

  const handleBatchDelete = useCallback(() => {
    const selected = items.filter((i) => i.selected)
    if (selected.length === 0) { handleClearAll(); return }
    if (!confirm(`删除选中的 ${selected.length} 个文件?`)) return
    setItems((arr) => arr.filter((i) => !i.selected))
  }, [items, handleClearAll])

  const updateSettings = useCallback((p: Partial<PdfSettings>) => {
    setSettings((s) => ({ ...s, ...p }))
  }, [])

  const selectionCount = useMemo(() => items.filter((i) => i.selected).length, [items])
  const estimatedSize = useMemo(() => {
    if (items.length === 0) return ''
    if (mode === 'pdf') return formatSize(estimatePdfSize(items, settings))
    return ''
  }, [items, settings, mode])

  const handleGenerate = useCallback(async () => {
    if (items.length === 0) return
    setIsGenerating(true); setError(null)
    setProgress(mode === 'pdf' ? '处理图片中...' : mode === 'excel' ? 'OCR 识别中...' : '转换文档中...')

    try {
      let bytes: Uint8Array; let ext: 'pdf' | 'docx' | 'xlsx'; let pageCount = items.length
      if (mode === 'pdf') {
        const result = await imagesToPdf(items.map((i) => i.file), settings, (s) => {
          setProgress(s.phase === 'saving' ? '保存中…' : s.phase === 'loading-lib' ? '加载引擎…' : `处理 ${s.current}/${s.total}`)
        })
        bytes = result.pdfBytes; ext = 'pdf'; pageCount = result.pageCount
      } else if (mode === 'excel') {
        const result = await imagesToExcel(items.map((i) => i.file), {}, (s) => {
          setProgress(s.phase === 'loading-ocr' ? '加载 OCR 引擎...' : s.phase === 'recognizing' ? `识别 ${s.current}/${s.total}` : '生成 Excel...')
        })
        bytes = result.xlsxBytes; ext = 'xlsx'; pageCount = result.sheetCount
      } else {
        const f = items[0]!.file; const extLc = f.name.split('.').pop()?.toLowerCase() || ''
        let direction: ConvertDirection
        if (items.length > 1) throw new Error('每次只上传一个文件')
        if (extLc === 'docx') direction = 'word-to-pdf'
        else if (extLc === 'xlsx') direction = 'excel-to-pdf'
        else if (extLc === 'pdf') direction = 'pdf-to-word'
        else throw new Error(`不支持 .${extLc}`)
        const result = await convertFile(f, direction, (s) => setProgress(s.message || s.phase))
        bytes = result.bytes; ext = result.ext; pageCount = result.pageCount || 1
      }
      const blob = new Blob([bytes as BlobPart],
        ext === 'pdf' ? { type: 'application/pdf' } : ext === 'docx'
          ? { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
          : { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const name = items.length === 1 ? items[0]!.name.replace(/\.[^.]+$/, '') + '.' + ext : `converted_${new Date().toISOString().slice(0, 10)}.${ext}`
      setDownload({ url, name, size: blob.size, pageCount })
      pushHistory({ id: nextId(), fileName: name, fileSize: blob.size, pageCount, createdAt: Date.now() })
    } catch (e) { setError((e as Error).message) }
    finally { setIsGenerating(false); setProgress(null) }
  }, [items, settings, mode])

  const handleModeChange = useCallback((m: AppMode) => {
    setMode(m); setItems([]); setDownload(null); setError(null); setShowSettings(false)
  }, [])

  const isImageMode = mode === 'pdf' || mode === 'excel'
  const heroTitle = mode === 'pdf' ? '图片转 PDF' : mode === 'excel' ? '图片转 Excel' : '文档格式转换'
  const heroDesc = mode === 'pdf' ? '免费在线 · 本地处理 · 不上传服务器'
    : mode === 'excel' ? 'OCR 识别图片文字为 Excel · 数据不出电脑'
    : 'Word ↔ PDF · Excel ↔ PDF · 纯浏览器转换'
  const uploaderHint = isImageMode ? '支持 JPG · PNG · WebP · 单张不超过 20MB'
    : '支持 .docx · .pdf · .xlsx · 单次一个文件'

  return (
    <div className="min-h-screen flex flex-col" style={{ animation: 'fadeIn 0.5s ease both' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30" style={{ backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)', background: 'var(--glass-bg)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 no-underline text-inherit">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M14 2v6h6M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">{BRAND.NAME}</span>
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-5 py-12 sm:py-20">
        {/* Hero — 巨大标题 */}
        <div className="text-center mb-10 sm:mb-14" style={{ animation: 'slideUp 0.6s ease both' }}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08]">
            {heroTitle}
          </h1>
          <p className="mt-3 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            {heroDesc}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center mb-10" style={{ animation: 'slideUp 0.6s 0.08s ease both' }}>
          <ModeTabs mode={mode} onChange={handleModeChange as (m: string) => void} />
        </div>

        {/* 巨大上传区域 */}
        <div style={{ animation: 'slideUp 0.6s 0.12s ease both' }}>
          <Uploader onSelectFiles={handleSelectFiles} onError={(m) => setError(m)} mode={mode} hint={uploaderHint} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 mx-auto max-w-lg rounded-xl p-3 text-sm text-center" style={{
            animation: 'slideUp 0.2s ease both',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626',
          }}>
            {error}
          </div>
        )}

        {/* 图片/文件列表 */}
        {items.length > 0 && (
          <div className="mt-12" style={{ animation: 'slideUp 0.4s ease both' }}>
            {/* Toolbar */}
            <Toolbar
              total={items.length}
              selectionCount={selectionCount}
              estimatedSize={estimatedSize || null}
              onClearAll={selectionCount > 0 ? handleBatchDelete : handleClearAll}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              progressInfo={progress || ''}
              actionLabel={mode === 'wordpdf' ? '开始转换' : undefined}
              showSettings={showSettings}
              onToggleSettings={() => setShowSettings(!showSettings)}
            />

            {/* Settings panel — 折叠 */}
            {showSettings && mode === 'pdf' && (
              <div className="mt-4" style={{ animation: 'slideUp 0.25s ease both' }}>
                <SettingsPanel settings={settings} onChange={updateSettings} />
              </div>
            )}

            {/* Image grid or file list */}
            {mode === 'pdf' ? (
              <ImageList items={items} onDelete={handleDelete} onMoveUp={(id) => handleMove(id, -1)}
                onMoveDown={(id) => handleMove(id, 1)} onReorder={handleReorder} onToggleSelect={handleToggleSelect} />
            ) : (
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="card flex items-center gap-3 p-3 text-sm">
                    <span className="flex-1 truncate">{item.name}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>{formatSize(item.size)}</span>
                    <button type="button" onClick={() => handleDelete(item.id)} className="btn-secondary !py-1 !px-3 !text-xs">删除</button>
                  </li>
                ))}
              </ul>
            )}

            {/* History */}
            <HistoryPanel />
          </div>
        )}
      </main>

      <Footer />

      <DownloadModal
        open={!!download}
        fileName={download?.name ?? ''}
        fileUrl={download?.url}
        fileType={download?.name?.endsWith('.pdf') ? 'pdf' : download?.name?.endsWith('.docx') ? 'docx' : 'xlsx'}
        fileSize={download?.size ?? 0}
        pageCount={download?.pageCount ?? 0}
        onClose={() => { if (download) URL.revokeObjectURL(download.url); setDownload(null) }}
        onDownload={() => {
          if (!download) return
          const a = document.createElement('a'); a.href = download.url; a.download = download.name; a.click()
        }}
      />
    </div>
  )
}