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

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  const handleSelectFiles = useCallback(async (files: File[]) => {
    setError(null)
    if (mode === 'wordpdf') {
      // Word/Excel 模式：直接使用文件，不做图片缩略图
      const newItems: ImageItem[] = files.map((f) => ({
        id: nextId(), file: f, thumbnail: '',
        name: f.name, size: f.size, type: f.type, createdAt: Date.now(),
      }))
      setItems((arr) => [...arr, ...newItems])
      return
    }
    // 图片模式
    const newItems: ImageItem[] = []
    for (const f of files) {
      try {
        const meta = await readImageMeta(f)
        newItems.push({
          id: nextId(), file: f, thumbnail: meta.thumbnail,
          name: f.name, size: f.size, type: f.type, createdAt: Date.now(),
          naturalWidth: meta.width, naturalHeight: meta.height,
        })
      } catch (e) {
        setError((e as Error).message)
      }
    }
    if (newItems.length) setItems((arr) => [...arr, ...newItems])
  }, [mode])

  const handleDelete = useCallback((id: string) => setItems((arr) => arr.filter((i) => i.id !== id)), [])
  const handleClearAll = useCallback(() => { if (confirm('确定清空全部?')) setItems([]) }, [])

  const handleMove = useCallback((id: string, dir: -1 | 1) => {
    setItems((arr) => {
      const i = arr.findIndex((x) => x.id === id)
      if (i < 0) return arr
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      const next = arr.slice()
      ;[next[i], next[j]] = [next[j]!, next[i]!]
      return next
    })
  }, [])

  const handleReorder = useCallback((fromId: string, toId: string) => {
    setItems((arr) => {
      const from = arr.findIndex((x) => x.id === fromId)
      const to = arr.findIndex((x) => x.id === toId)
      if (from < 0 || to < 0) return arr
      const next = arr.slice()
      const [m] = next.splice(from, 1)
      next.splice(to, 0, m!)
      return next
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
    setIsGenerating(true)
    setError(null)
    setProgress(mode === 'pdf' ? '处理图片中...' : mode === 'excel' ? 'OCR 识别中...' : '转换文档中...')

    try {
      let bytes: Uint8Array
      let ext: 'pdf' | 'docx' | 'xlsx'
      let pageCount = items.length

      if (mode === 'pdf') {
        const result = await imagesToPdf(items.map((i) => i.file), settings, (s) => {
          setProgress(s.phase === 'saving' ? '保存中…' : s.phase === 'loading-lib' ? '加载引擎…' : `处理 ${s.current}/${s.total}`)
        })
        bytes = result.pdfBytes
        ext = 'pdf'
        pageCount = result.pageCount
      } else if (mode === 'excel') {
        const result = await imagesToExcel(items.map((i) => i.file), {}, (s) => {
          setProgress(s.phase === 'loading-ocr' ? '加载 OCR 引擎...' : s.phase === 'recognizing' ? `识别 ${s.current}/${s.total}` : '生成 Excel...')
        })
        bytes = result.xlsxBytes
        ext = 'xlsx'
        pageCount = result.sheetCount
      } else {
        // wordpdf mode — 支持 4 个方向
        const f = items[0]!.file
        const extLc = f.name.split('.').pop()?.toLowerCase() || ''
        let direction: ConvertDirection
        if (items.length > 1) throw new Error('Word/Excel 转换每次请只上传一个文件')
        if (extLc === 'docx') direction = 'word-to-pdf'
        else if (extLc === 'xlsx') direction = 'excel-to-pdf'
        else if (extLc === 'pdf') {
          // PDF→Word 或者 PDF→Excel — 让用户选，默认 Word
          direction = 'pdf-to-word'
        } else throw new Error(`不支持的文件格式: .${extLc}`)

        const result = await convertFile(f, direction, (s) => {
          setProgress(s.message || s.phase)
        })
        bytes = result.bytes
        ext = result.ext
        pageCount = result.pageCount || 1
      }

      const blob = new Blob([bytes as BlobPart], ext === 'pdf' ? { type: 'application/pdf' } : ext === 'docx' ? { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } : { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const name = items.length === 1 ? items[0]!.name.replace(/\.[^.]+$/, '') + '.' + ext : `converted_${new Date().toISOString().slice(0, 10)}.${ext}`
      setDownload({ url, name, size: blob.size, pageCount })
      pushHistory({ id: nextId(), fileName: name, fileSize: blob.size, pageCount, createdAt: Date.now() })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [items, settings, mode])

  /** 切换模式时清空图片 */
  const handleModeChange = useCallback((m: AppMode) => {
    setMode(m)
    setItems([])
    setDownload(null)
    setError(null)
  }, [])

  let uploaderHint = ''
  if (mode === 'pdf') uploaderHint = '支持 JPG · PNG · WebP · 单张不超过 20MB'
  else if (mode === 'excel') uploaderHint = '支持 JPG · PNG · WebP · 单张不超过 20MB'
  else uploaderHint = '支持 .docx · .pdf · .xlsx · 单次一个文件'

  return (
    <div className="min-h-screen flex flex-col" style={{ animation: 'fadeIn 0.4s ease both' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass-card border-b border-[var(--glass-border)]" style={{ borderRadius: 0 }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M14 2v6h6M9 13l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">{BRAND.NAME}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-8" style={{ animation: 'slideUp 0.5s ease both' }}>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            {mode === 'pdf' ? '图片转 PDF' : mode === 'excel' ? '图片转 Excel' : '文档格式转换'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
            {mode === 'pdf' ? '免费在线图片转PDF · 本地处理，不上传服务器' : mode === 'excel' ? 'OCR 识别图片文字为 Excel · 数据不出电脑' : 'Word ↔ PDF · Excel ↔ PDF · 纯浏览器转换'}
          </p>
        </div>

        {/* Mode tabs */}
        <div className="mx-auto max-w-md mb-8">
          <ModeTabs mode={mode} onChange={handleModeChange as (m: string) => void} />
        </div>

        {/* Uploader */}
        <div className="mx-auto max-w-2xl" style={{ animation: 'slideUp 0.6s 0.05s ease both' }}>
          <Uploader
            onSelectFiles={handleSelectFiles}
            onError={(m) => setError(m)}
            mode={mode}
            hint={uploaderHint}
          />
        </div>

        {error && (
          <div className="mx-auto max-w-2xl mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300" style={{ animation: 'slideDown 0.2s ease both' }}>
            {error}
          </div>
        )}

        {/* Image/File list + Settings */}
        {items.length > 0 && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6" style={{ animation: 'fadeIn 0.3s ease both' }}>
            <div>
              <Toolbar
                total={items.length}
                selectionCount={selectionCount}
                estimatedSize={estimatedSize || null}
                onClearAll={selectionCount > 0 ? handleBatchDelete : handleClearAll}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                progressInfo={progress || ''}
                actionLabel={mode === 'wordpdf' ? '开始转换' : undefined}
              />
              {mode === 'pdf' ? (
                <ImageList
                  items={items}
                  onDelete={handleDelete}
                  onMoveUp={(id) => handleMove(id, -1)}
                  onMoveDown={(id) => handleMove(id, 1)}
                  onReorder={handleReorder}
                  onToggleSelect={handleToggleSelect}
                />
              ) : (
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm">
                      <span className="flex-1 truncate">{item.name}</span>
                      <span className="text-[var(--text-tertiary)]">{formatSize(item.size)}</span>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-500">删除</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {mode === 'pdf' && (
              <aside className="lg:sticky lg:top-20 lg:self-start">
                <details className="lg:!block group" open>
                  <summary className="lg:!hidden list-none cursor-pointer select-none flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 9a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
                      PDF 设置
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition group-open:rotate-180"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </summary>
                  <div className="mt-2 lg:mt-0">
                    <SettingsPanel settings={settings} onChange={updateSettings} />
                  </div>
                </details>
              </aside>
            )}
          </div>
        )}

        <HistoryPanel />
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
          const a = document.createElement('a')
          a.href = download.url
          a.download = download.name
          a.click()
        }}
      />
    </div>
  )
}