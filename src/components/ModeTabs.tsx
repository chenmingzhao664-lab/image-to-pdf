import { useRef, type KeyboardEvent } from 'react'

interface Props { mode: string; onChange: (m: string) => void }
const modes = [
  { key: 'pdf', label: '图片转 PDF', desc: '将 JPG/PNG/WebP 图片转换为 PDF 文档' },
  { key: 'excel', label: '图片转 Excel', desc: '通过 OCR 识别图片中的文字并导出 Excel 表格' },
  { key: 'wordpdf', label: '文档互转', desc: '在 Word、Excel、PDF 格式之间互相转换' },
]

export default function ModeTabs({ mode, onChange }: Props) {
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const focusTab = (idx: number) => {
    const safe = ((idx % modes.length) + modes.length) % modes.length
    const target = modes[safe]
    const btn = refs.current[safe]
    if (target && btn) {
      btn.focus()
      onChange(target.key)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = modes.findIndex(m => m.key === mode)
    const safe = current < 0 ? 0 : current
    switch (e.key) {
      case 'ArrowRight':
      case 'Right':
        e.preventDefault(); focusTab(safe + 1); break
      case 'ArrowLeft':
      case 'Left':
        e.preventDefault(); focusTab(safe - 1); break
      case 'Home':
        e.preventDefault(); focusTab(0); break
      case 'End':
        e.preventDefault(); focusTab(modes.length - 1); break
      default:
        return
    }
  }

  return (
    <div
      role="tablist"
      aria-label="功能模式"
      aria-labelledby="mode-tabs-title"
      aria-orientation="horizontal"
      className="mode-pill"
      id="mode-tabs"
      onKeyDown={onKeyDown}
    >
      <span id="mode-tabs-title" className="sr-only">功能模式选择</span>
      {modes.map(({ key, label, desc }, i) => {
        const active = mode === key
        return (
          <button
            key={key}
            ref={(el) => { refs.current[i] = el }}
            role="tab"
            id={`tab-${key}`}
            aria-selected={active}
            aria-controls="mode-panel"
            aria-label={label}
            aria-describedby={`tab-${key}-hint`}
            type="button"
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            className={active ? 'active' : ''}
          >
            <span className="tab-label">{label}</span>
            <span id={`tab-${key}-hint`} className="sr-only">{desc}</span>
          </button>
        )
      })}
    </div>
  )
}
