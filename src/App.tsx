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
import type { ImageItem, PdfSettings } from './types'

let idCounter = 0
const nextId = () => `img_${Date.now()}_${++idCounter}`
type AppMode = 'pdf' | 'excel' | 'wordpdf'

function readImageMeta(file: File): Promise<{ thumbnail: string; width: number; height: number }> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas'); const MAX = 240
      const ratio = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio))
      const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const thumb = canvas.toDataURL('image/jpeg', 0.7); URL.revokeObjectURL(url)
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

  useEffect(() => { if (!error) return; const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t) }, [error])

  const handleSelectFiles = useCallback(async (files: File[]) => {
    setError(null)
    if (mode === 'wordpdf') {
      setItems((arr) => [...arr, ...files.map((f) => ({ id: nextId(), file: f, thumbnail: '', name: f.name, size: f.size, type: f.type, createdAt: Date.now() } as ImageItem))])
      return
    }
    const newItems: ImageItem[] = []
    for (const f of files) {
      try { const meta = await readImageMeta(f); newItems.push({ id: nextId(), file: f, thumbnail: meta.thumbnail, name: f.name, size: f.size, type: f.type, createdAt: Date.now(), naturalWidth: meta.width, naturalHeight: meta.height } as ImageItem) }
      catch (e) { setError((e as Error).message) }
    }
    if (newItems.length) setItems((arr) => [...arr, ...newItems])
  }, [mode])

  const handleDelete = useCallback((id: string) => setItems((arr) => arr.filter((i) => i.id !== id)), [])
  const handleClearAll = useCallback(() => { if (confirm('确定清空全部?')) setItems([]) }, [])
  const handleMove = useCallback((id: string, dir: -1 | 1) => setItems((arr) => {
    const i = arr.findIndex((x) => x.id === id); if (i < 0) return arr; const j = i + dir
    if (j < 0 || j >= arr.length) return arr; const n = arr.slice(); [n[i], n[j]] = [n[j]!, n[i]!]; return n
  }), [])
  const handleReorder = useCallback((fromId: string, toId: string) => setItems((arr) => {
    const f = arr.findIndex((x) => x.id === fromId); const t = arr.findIndex((x) => x.id === toId)
    if (f < 0 || t < 0) return arr; const n = arr.slice(); const [m] = n.splice(f, 1); n.splice(t, 0, m!); return n
  }), [])
  const handleToggleSelect = useCallback((id: string) => setItems((arr) => arr.map((i) => i.id === id ? { ...i, selected: !i.selected } : i)), [])
  const handleBatchDelete = useCallback(() => {
    const sel = items.filter((i) => i.selected)
    if (sel.length === 0) { handleClearAll(); return }
    if (!confirm(`删除选中的 ${sel.length} 个文件?`)) return; setItems((arr) => arr.filter((i) => !i.selected))
  }, [items, handleClearAll])

  const updateSettings = useCallback((p: Partial<PdfSettings>) => setSettings((s) => ({ ...s, ...p })), [])
  const selectionCount = useMemo(() => items.filter((i) => i.selected).length, [items])
  const estimatedSize = useMemo(() => items.length && mode === 'pdf' ? formatSize(estimatePdfSize(items, settings)) : '', [items, settings, mode])

  const handleGenerate = useCallback(async () => {
    if (items.length === 0) return; setIsGenerating(true); setError(null)
    setProgress(mode === 'pdf' ? 'PROCESSING...' : mode === 'excel' ? 'OCR INIT...' : 'CONVERTING...')
    try {
      let bytes: Uint8Array; let ext: 'pdf' | 'docx' | 'xlsx'; let pageCount = items.length
      if (mode === 'pdf') {
        const r = await imagesToPdf(items.map((i) => i.file), settings, (s) => setProgress(`PAGE ${s.current}/${s.total}`))
        bytes = r.pdfBytes; ext = 'pdf'; pageCount = r.pageCount
      } else if (mode === 'excel') {
        const r = await imagesToExcel(items.map((i) => i.file), {}, (s) => setProgress(`OCR ${s.current}/${s.total}`))
        bytes = r.xlsxBytes; ext = 'xlsx'; pageCount = r.sheetCount
      } else {
        const f = items[0]!.file; const e = f.name.split('.').pop()?.toLowerCase() || ''
        let d: ConvertDirection
        if (items.length > 1) throw new Error('一次一个文件')
        if (e === 'docx') d = 'word-to-pdf'; else if (e === 'xlsx') d = 'excel-to-pdf'; else if (e === 'pdf') d = 'pdf-to-word'
        else throw new Error(`不支持 .${e}`)
        const r = await convertFile(f, d, (s) => setProgress(s.message || s.phase))
        bytes = r.bytes; ext = r.ext; pageCount = r.pageCount || 1
      }
      const blob = new Blob([bytes as BlobPart], ext === 'pdf' ? { type: 'application/pdf' } : ext === 'docx' ? { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } : { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const name = items.length === 1 ? items[0]!.name.replace(/\.[^.]+$/, '') + '.' + ext : `converted_${new Date().toISOString().slice(0, 10)}.${ext}`
      setDownload({ url, name, size: blob.size, pageCount })
      pushHistory({ id: nextId(), fileName: name, fileSize: blob.size, pageCount, createdAt: Date.now() })
    } catch (e) { setError((e as Error).message) }
    finally { setIsGenerating(false); setProgress(null) }
  }, [items, settings, mode])

  const handleModeChange = useCallback((m: AppMode) => { setMode(m); setItems([]); setDownload(null); setError(null); setShowSettings(false) }, [])
  const isImageMode = mode === 'pdf' || mode === 'excel'

  const MODE_META: Record<AppMode, { title: string; code: string; desc: string }> = {
    pdf: { title: 'IMAGE TO PDF', code: 'IMG2PDF_01', desc: 'ONLINE · LOCAL · NO UPLOAD' },
    excel: { title: 'IMAGE TO EXCEL', code: 'IMG2XLS_01', desc: 'OCR · LOCAL · NO UPLOAD' },
    wordpdf: { title: 'DOC CONVERTER', code: 'DOCPACK_01', desc: 'WORD · EXCEL · PDF ↔ ANY' },
  }
  const meta = MODE_META[mode]

  return (
    <div className="min-h-screen flex flex-col" style={{ animation: 'fadeIn 0.3s ease both' }}>
      {/* 顶栏 — 终端风格 */}
      <header className="sticky top-0 z-30" style={{
        background: 'rgba(28,28,26,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="diamond" />
            <span className="font-semibold tracking-[0.15em]" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>IMAGE<span style={{ color: 'var(--ark-yellow)' }}>2</span>PDF</span>
            <span className="hidden sm:flex items-center gap-2 ml-3 px-3 py-1" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-display)', letterSpacing: '0.12em' }}>
              {meta.code}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-5 py-10 sm:py-16">
        {/* Hero */}
        <div style={{ animation: 'slideInLeft 0.4s ease both' }}>
          <div className="flex items-center gap-3 mb-1 ark-label" style={{ fontSize: 11 }}>
            <span className="diamond" />
            <span>SERVICE INITIALIZED</span>
            <span className="h-[1px] flex-1" style={{ background: 'var(--line)' }} />
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[1.05]" style={{ fontFamily: 'var(--font-display)' }}>
            {meta.title}
          </h1>
          <p className="mt-2 ark-label" style={{ fontSize: 13, color: 'var(--text-2)' }}>{meta.desc}</p>
        </div>

        {/* Mode Tabs */}
        <div className="mt-10 flex justify-center" style={{ animation: 'fadeIn 0.3s 0.06s ease both' }}>
          <ModeTabs mode={mode} onChange={handleModeChange as (m: string) => void} />
        </div>

        {/* Uploader */}
        <div className="mt-8" style={{ animation: 'fadeIn 0.3s 0.1s ease both' }}>
          <Uploader onSelectFiles={handleSelectFiles} onError={(m) => setError(m)} mode={mode}
            hint={isImageMode ? 'JPG · PNG · WebP · ≤ 20MB · Ctrl+V' : '.docx · .pdf · .xlsx · single'} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 mx-auto max-w-lg p-3 text-sm text-center" style={{
            background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', color: '#FF4444',
            fontFamily: 'var(--font-display)', letterSpacing: '0.08em', fontSize: 12,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* File list area */}
        {items.length > 0 && (
          <div className="mt-10" style={{ animation: 'slideUp 0.35s ease both' }}>
            <Toolbar total={items.length} selectionCount={selectionCount} estimatedSize={estimatedSize || null}
              onClearAll={selectionCount > 0 ? handleBatchDelete : handleClearAll} onGenerate={handleGenerate}
              isGenerating={isGenerating} progressInfo={progress || ''} actionLabel={mode === 'wordpdf' ? '开始转换' : undefined}
              onToggleSettings={() => setShowSettings(!showSettings)} />

            {showSettings && mode === 'pdf' && (
              <div className="mt-4" style={{ animation: 'slideUp 0.2s ease both' }}>
                <div className="ark-card p-4 max-w-md">
                  <SettingsPanel settings={settings} onChange={updateSettings} />
                </div>
              </div>
            )}

            {mode === 'pdf' ? (
              <ImageList items={items} onDelete={handleDelete} onMoveUp={(id) => handleMove(id, -1)}
                onMoveDown={(id) => handleMove(id, 1)} onReorder={handleReorder} onToggleSelect={handleToggleSelect} />
            ) : (
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item.id} className="ark-card flex items-center gap-3 p-3 text-sm">
                    <span className="flex-1 truncate">{item.name}</span>
                    <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.08em' }}>{formatSize(item.size)}</span>
                    <button type="button" onClick={() => handleDelete(item.id)} className="btn-secondary !py-1 !px-3 !text-xs">DELETE</button>
                  </li>
                ))}
              </ul>
            )}
            <HistoryPanel />
          </div>
        )}
      </main>

      <Footer />

      <DownloadModal open={!!download} fileName={download?.name ?? ''} fileUrl={download?.url}
        fileType={download?.name?.endsWith('.pdf') ? 'pdf' : download?.name?.endsWith('.docx') ? 'docx' : 'xlsx'}
        fileSize={download?.size ?? 0} pageCount={download?.pageCount ?? 0}
        onClose={() => { if (download) URL.revokeObjectURL(download.url); setDownload(null) }}
        onDownload={() => { if (!download) return; const a = document.createElement('a'); a.href = download.url; a.download = download.name; a.click() }} />
    </div>
  )
}