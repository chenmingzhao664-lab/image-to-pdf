import { useCallback, useEffect, useMemo, useState } from 'react'
import Uploader from './components/Uploader'
import ImageList from './components/ImageList'
import Toolbar from './components/Toolbar'
import SettingsPanel from './components/SettingsPanel'
import DownloadModal from './components/DownloadModal'
import ThemeToggle from './components/ThemeToggle'
import HistoryPanel from './components/HistoryPanel'
import { pushHistory } from './components/history'
import Footer from './components/Footer'
import { imagesToPdf, estimatePdfSize, defaultPdfSettings, formatSize, type ProcessStatus } from './utils/pdf'
import { BRAND } from './utils/constants'
import type { ImageItem, PdfSettings } from './types'

let idCounter = 0
const nextId = () => `img_${Date.now()}_${++idCounter}`

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
  const [items, setItems] = useState<ImageItem[]>([])
  const [settings, setSettings] = useState<PdfSettings>(defaultPdfSettings)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<ProcessStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [download, setDownload] = useState<{ url: string; name: string; size: number; pageCount: number } | null>(null)

  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  const handleSelectFiles = useCallback(async (files: File[]) => {
    setError(null)
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
  }, [])

  const handleDelete = useCallback((id: string) => setItems((arr) => arr.filter((i) => i.id !== id)), [])
  const handleClearAll = useCallback(() => { if (confirm('确定清空全部图片?')) setItems([]) }, [])

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
    if (!confirm('删除选中的图片?')) return
    setItems((arr) => arr.filter((i) => !i.selected))
  }, [])

  const updateSettings = useCallback((p: Partial<PdfSettings>) => {
    setSettings((s) => ({ ...s, ...p }))
  }, [])

  const selectionCount = useMemo(() => items.filter((i) => i.selected).length, [items])
  const estimatedSize = useMemo(() => (items.length ? formatSize(estimatePdfSize(items, settings)) : ''), [items, settings])

  const handleGenerate = useCallback(async () => {
    if (items.length === 0) return
    setIsGenerating(true)
    setError(null)
    try {
      const result = await imagesToPdf(items.map((i) => i.file), settings, (s) => setProgress(s))
      const blob = new Blob([result.pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const name = `images_${new Date().toISOString().slice(0, 10)}.pdf`
      setDownload({ url, name, size: blob.size, pageCount: result.pageCount })
      pushHistory({ id: nextId(), fileName: name, fileSize: blob.size, pageCount: result.pageCount, createdAt: Date.now() })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setIsGenerating(false)
      setProgress(null)
    }
  }, [items, settings])

  const progressText = progress
    ? progress.phase === 'saving' ? '保存中…'
      : progress.phase === 'loading-lib' ? '加载引擎…'
      : `处理 ${progress.current}/${progress.total}`
    : ''

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

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14" style={{ animation: 'slideUp 0.5s ease both' }}>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight">
            {BRAND.NAME}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)]">{BRAND.TAGLINE}</p>
          <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">{BRAND.SUBTAGLINE}</p>
        </div>

        {/* Uploader */}
        <div className="mx-auto max-w-2xl" style={{ animation: 'slideUp 0.6s 0.05s ease both' }}>
          <Uploader onSelectFiles={handleSelectFiles} onError={(m) => setError(m)} />
        </div>

        {error && (
          <div className="mx-auto max-w-2xl mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300" style={{ animation: 'slideDown 0.2s ease both' }}>
            {error}
          </div>
        )}

        {/* Feature cards */}
        {items.length === 0 && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto" style={{ animation: 'slideUp 0.6s 0.1s ease both' }}>
            {[
              { icon: 'M9 12l2 2 4-4', title: '本地处理', desc: '图片不离开浏览器' },
              { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: '快速秒转', desc: '基于 pdf-lib 静态生成' },
              { icon: 'M5 13l4 4L19 7', title: '完全免费', desc: 'GitHub Pages 永久托管' },
            ].map((f) => (
              <div key={f.title} className="feat-card">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d={f.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Image list + Settings */}
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
                progressInfo={progressText}
              />
              <ImageList
                items={items}
                onDelete={handleDelete}
                onMoveUp={(id) => handleMove(id, -1)}
                onMoveDown={(id) => handleMove(id, 1)}
                onReorder={handleReorder}
                onToggleSelect={handleToggleSelect}
              />
            </div>
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <SettingsPanel settings={settings} onChange={updateSettings} />
            </aside>
          </div>
        )}

        <HistoryPanel />
      </main>

      <Footer />

      <DownloadModal
        open={!!download}
        fileName={download?.name ?? ''}
        fileUrl={download?.url}
        fileType="pdf"
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
