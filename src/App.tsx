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
import EmptyState from './components/EmptyState'
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

  // 主标题保持中文「图片秒速转换 PDF」—— SaaS 首屏口语化、3 秒说清产品
  // 副标题：mode-aware 三短 bullet（icon + label）+ 一句信任描述
  // mode 切换时只换 eyebrow 标签 + bullets + 长描述，主标题稳定（利于 brand recall + cache）
  const MODE_META: Record<AppMode, { eyebrow: string; bullets: { icon: string; label: string }[]; desc: string }> = {
    pdf: {
      eyebrow: 'Image → PDF',
      bullets: [
        { icon: '🔒', label: '本地处理' },
        { icon: '⚡', label: '秒速合成' },
        { icon: '🆓', label: '完全免费' },
      ],
      desc: '把 JPG、PNG、WebP 图片在浏览器里直接打成 PDF。本地处理，不上传服务器，完全免费。',
    },
    excel: {
      eyebrow: 'Image → Excel',
      bullets: [
        { icon: '🔍', label: 'OCR 识别' },
        { icon: '📊', label: '表格导出' },
        { icon: '🔒', label: '数据不离开设备' },
      ],
      desc: '通过 OCR 识别图片中的文字并导出为 Excel 表格，纯本地处理，数据不离开设备。',
    },
    wordpdf: {
      eyebrow: 'Doc ⇄ PDF',
      bullets: [
        { icon: '🔄', label: '双向转换' },
        { icon: '📄', label: 'Word / Excel / PDF' },
        { icon: '🚫', label: '无需上传' },
      ],
      desc: '在 Word、Excel、PDF 格式之间互转。浏览器本地处理，文件不会上传到任何服务器。',
    },
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
        {/* Hero — v12 三段：品牌行 + 主标题 + mode-aware 三短 bullet，顶部聚光增强 */}
        <section aria-labelledby="hero-title" className="hero-spotlight text-center mb-14 reveal" style={{ position: 'relative' }}>
          <div aria-hidden="true" style={{
            position: 'absolute', inset: '-40px -80px 0 -80px', zIndex: -1, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 40% at 50% 0%, var(--accent-glow), transparent 60%)',
            filter: 'blur(2px)',
          }} />
          {/* 品牌行 — Image2PDF 小号字距 logoline */}
          <div className="hero-brand" aria-hidden="true">
            <span className="hero-brand-mark">◆</span>
            <span className="hero-brand-name">Image<span style={{ color: 'var(--accent)' }}>2</span>PDF</span>
          </div>
          {/* eyebrow — 当前模式标签（小号大写字距） */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 14px',
            background: 'var(--accent-soft)',
            border: '1px solid var(--line-soft)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--accent)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            marginTop: 14, marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
            {meta.eyebrow}
          </div>
          {/* 主标题 — 稳定中文 brand slogan */}
          <h1 id="hero-title" className="font-bold mx-auto max-w-3xl" style={{
            fontSize: 'var(--display-size)',
            lineHeight: 'var(--display-line)',
            letterSpacing: 'var(--display-track)',
            background: 'var(--hero-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            图片秒速转换 PDF
          </h1>
          {/* 英文副标语 — Apple/Linear 风格价值描述 */}
          <p className="hero-subline" aria-hidden="true">
            Convert your images into beautiful PDFs.
          </p>
          {/* mode-aware 三短 bullet — 替代长副标题，密度更高 */}
          <ul className="hero-bullets" aria-label="产品特性">
            {(meta.bullets as readonly { icon: string; label: string }[]).map((b, i) => (
              <li key={i} className="hero-bullet">
                <span className="hero-bullet-icon" aria-hidden="true">{b.icon}</span>
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
          {/* 信任描述 — mode-aware 一句话 */}
          <p className="mt-6 mx-auto max-w-xl font-medium" style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
            {meta.desc}
          </p>
          {/* 信任条 — Local Processing · No Upload · Free，强化核心卖点 */}
          <ul className="hero-trust" aria-label="核心承诺">
            <li className="hero-trust-item">
              <svg viewBox="0 0 24 24" fill="none" className="hero-trust-icon" aria-hidden="true">
                <path d="M12 3l7 4v5c0 4-3 7-7 8-4-1-7-4-7-8V7l7-4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span>Local Processing</span>
            </li>
            <li className="hero-trust-divider" aria-hidden="true">·</li>
            <li className="hero-trust-item">
              <svg viewBox="0 0 24 24" fill="none" className="hero-trust-icon" aria-hidden="true">
                <path d="M18 10h-5V5a2 2 0 10-4 0v5H4a2 2 0 100 4h5v5a2 2 0 104 0v-5h5a2 2 0 100-4z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round" transform="rotate(-45 12 12)"/>
              </svg>
              <span>No Upload</span>
            </li>
            <li className="hero-trust-divider" aria-hidden="true">·</li>
            <li className="hero-trust-item">
              <svg viewBox="0 0 24 24" fill="none" className="hero-trust-icon" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="round"/>
              </svg>
              <span>Free Forever</span>
            </li>
          </ul>
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

        {/* Empty state — 无图无下载时，在 Uploader 下显示插画引导 */}
        {items.length === 0 && !download && (
          <div className="mt-12 reveal" style={{ '--reveal-delay': '0.22s' } as React.CSSProperties}>
            <EmptyState mode={mode} />
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
