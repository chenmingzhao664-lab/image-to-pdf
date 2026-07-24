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
import Sections from './components/Sections'
import { imagesToPdf, estimatePdfSize, formatSize } from './utils/pdf'
import { imagesToExcel } from './utils/excel'
import { convertFile } from './utils/officedoc'
import type { ConvertDirection } from './utils/officedoc'
import type { ImageItem, PdfSettings } from './types'
import { defaultPdfSettings } from './utils/pdf'

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

const LS_SETTINGS_KEY = 'image2pdf_settings_v3'
function loadSettings(): PdfSettings {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY)
    if (!raw) return defaultPdfSettings()
    return { ...defaultPdfSettings(), ...JSON.parse(raw) }
  } catch { return defaultPdfSettings() }
}
function saveSettings(s: PdfSettings) {
  try { localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export default function App() {
  const [mode, setMode] = useState<AppMode>('pdf')
  const [items, setItems] = useState<ImageItem[]>([])
  const [settings, setSettings] = useState<PdfSettings>(loadSettings)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const progressPercent = (() => {
    if (!progress) return undefined
    const m = progress.match(/(\d+)\s*\/\s*(\d+)/)
    if (!m || !m[1] || !m[2]) return undefined
    const cur = parseInt(m[1], 10); const tot = parseInt(m[2], 10)
    if (!tot || cur > tot) return undefined
    return Math.round((cur / tot) * 100)
  })()
  const [error, setError] = useState<string | null>(null)
  const [download, setDownload] = useState<{ url: string; name: string; size: number; pageCount: number } | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => { if (!error) return; const t = setTimeout(() => setError(null), 3000); return () => clearTimeout(t) }, [error])
  useEffect(() => { saveSettings(settings) }, [settings])

  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible') });
    }, { threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items])

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
        if (items.length > 1) throw new Error('一次一个文件')
        const dirKey = sessionStorage.getItem('image2pdf_convert_dir') || 'auto'
        let d: ConvertDirection
        if (dirKey !== 'auto') { d = dirKey as ConvertDirection }
        else if (e === 'docx') d = 'word-to-pdf'
        else if (e === 'xlsx') d = 'excel-to-pdf'
        else if (e === 'pdf') d = 'pdf-to-word'
        else throw new Error(`不支持 .${e}`)
        const r = await convertFile(f, d, (s) => setProgress(s.message || s.phase))
        bytes = r.bytes; ext = r.ext; pageCount = r.pageCount || 1
      }
      const blob = new Blob([bytes as BlobPart], ext === 'pdf'
        ? { type: 'application/pdf' }
        : ext === 'docx'
          ? { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
          : { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const name = items.length === 1
        ? items[0]!.name.replace(/\.[^.]+$/, '') + '.' + ext
        : `converted_${new Date().toISOString().slice(0, 10)}.${ext}`
      setDownload({ url, name, size: blob.size, pageCount })
      pushHistory({ id: nextId(), fileName: name, fileSize: blob.size, pageCount, createdAt: Date.now() })
    } catch (e) { setError((e as Error).message) }
    finally { setIsGenerating(false); setProgress(null) }
  }, [items, settings, mode])

  const handleModeChange = useCallback((m: AppMode) => { setMode(m); setItems([]); setDownload(null); setError(null); setShowSettings(false) }, [])

  const MODE_META: Record<AppMode, { title: string; desc: string }> = {
    pdf: { title: 'Image to PDF', desc: '将 JPG、PNG、WebP 图片在线转换为 PDF，所有处理在浏览器本地完成，无需上传服务器。' },
    excel: { title: '图片转 Excel', desc: '通过 OCR 识别图片中的文字并导出为 Excel 表格，纯本地处理，保障数据安全。' },
    wordpdf: { title: '文档互转', desc: '在 Word、Excel、PDF 格式之间互相转换，浏览器本地处理，文件不会上传。' },
  }
  const meta = MODE_META[mode]

  return (
    <div className="min-h-screen flex flex-col">
      <header style={{
        background: 'rgba(12,10,9,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div className="mx-auto max-w-5xl px-5 h-12 flex items-center justify-between">
          <span className="font-semibold" style={{ fontSize: 15 }}>
            Image<span style={{ color: 'var(--accent)' }}>2</span>PDF
          </span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-5 pt-16 sm:pt-24 pb-20">
        {/* Hero — 极简：仅 h1 + 一行描述，顶部聚光增强 */}
        <section aria-labelledby="hero-title" className="hero-spotlight text-center mb-14 reveal" style={{ position: 'relative' }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: '-40px -80px 0 -80px', zIndex: -1, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(245,158,11,0.18), transparent 60%)',
            filter: 'blur(2px)',
          }} />
          <h1 id="hero-title" className="font-bold mx-auto max-w-3xl" style={{
            fontSize: 'var(--display-size)',
            lineHeight: 'var(--display-line)',
            letterSpacing: 'var(--display-track)',
            background: 'linear-gradient(120deg, #FFFFFF 0%, #FEF3C7 35%, #FCD34D 65%, #B8B2AC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {meta.title}
          </h1>
          <p className="mt-6 mx-auto max-w-xl font-medium" style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>
            {meta.desc}
          </p>
        </section>

        {/* 模式选择 */}
        <section aria-label="模式选择" className="flex justify-center mb-8 reveal" style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
          <ModeTabs mode={mode} onChange={handleModeChange as (m: string) => void} />
        </section>

        {/* 上传区 */}
        <section aria-label="文件上传" className="reveal" style={{ '--reveal-delay': '0.15s' } as React.CSSProperties}>
          <Uploader onSelectFiles={handleSelectFiles} onError={(m) => setError(m)} mode={mode}
            hint={mode === 'pdf' || mode === 'excel' ? 'JPG · PNG · WebP · ≤ 20MB' : '.docx · .pdf · .xlsx'} />
        </section>

        {/* Error */}
        {error && (
          <div className="alert mt-4 max-w-lg mx-auto text-center reveal">
            ⚠ {error}
          </div>
        )}

        {/* Settings — 默认折叠 */}

        {/* Content */}
        {items.length > 0 ? (
          <div className="mt-8 reveal" style={{ '--reveal-delay': '0.2s' } as React.CSSProperties}>
            <div className="max-w-3xl mx-auto">
              {/* Quick settings row */}
              {mode === 'pdf' && (
                <div className="flex items-center gap-4 mb-5 pb-4 flex-wrap" style={{ borderBottom: '1px solid var(--line)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>Page</span>
                    <div className="segmented">
                      <button className={settings.pageSize === 'a4' ? 'active' : ''} onClick={() => updateSettings({ pageSize: 'a4' })}>A4</button>
                      <button className={settings.pageSize === 'original' ? 'active' : ''} onClick={() => updateSettings({ pageSize: 'original' })}>Original</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--text-3)' }}>Quality</span>
                    <div className="segmented">
                      <button className={settings.quality === 'hd' ? 'active' : ''} onClick={() => updateSettings({ quality: 'hd' })}>HD</button>
                      <button className={settings.quality === 'normal' ? 'active' : ''} onClick={() => updateSettings({ quality: 'normal' })}>Normal</button>
                      <button className={settings.quality === 'compressed' ? 'active' : ''} onClick={() => updateSettings({ quality: 'compressed' })}>Compact</button>
                    </div>
                  </div>
                  <button onClick={() => setShowSettings(!showSettings)} className="btn-ghost" style={{ fontSize: 12 }}>
                    {showSettings ? 'Less' : 'More'} settings
                    <span className={`chevron ${showSettings ? 'open' : ''}`} style={{ display: 'inline-block', transition: 'transform 0.2s', transform: showSettings ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </button>
                </div>
              )}

              {showSettings && mode === 'pdf' && (
                <div className="mb-5 settings-panel reveal">
                  <SettingsPanel settings={settings} onChange={updateSettings} />
                </div>
              )}

              <Toolbar total={items.length} selectionCount={selectionCount} estimatedSize={estimatedSize || null}
                onClearAll={selectionCount > 0 ? handleBatchDelete : handleClearAll} onGenerate={handleGenerate}
                isGenerating={isGenerating} progressInfo={progress || ''} progressPercent={progressPercent} onToggleSettings={() => {}} />

              {mode === 'pdf' ? (
                <div className="mt-4">
                  <ImageList items={items} onDelete={handleDelete} onMoveUp={(id) => handleMove(id, -1)}
                    onMoveDown={(id) => handleMove(id, 1)} onReorder={handleReorder} onToggleSelect={handleToggleSelect} />
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="glass-card flex items-center gap-3 p-3 text-sm">
                      <span className="flex-1 truncate">{item.name}</span>
                      <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{formatSize(item.size)}</span>
                      <button onClick={() => handleDelete(item.id)} className="btn-ghost danger">✕</button>
                    </li>
                  ))}
                </ul>
              )}

              <HistoryPanel />
            </div>
          </div>
        ) : (
          <Sections />
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
