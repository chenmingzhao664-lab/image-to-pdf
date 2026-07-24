interface Props { mode: string; onChange: (m: string) => void }
const modes = [
  { key: 'pdf', label: '图片转 PDF', desc: '将 JPG/PNG/WebP 图片转换为 PDF 文档' },
  { key: 'excel', label: '图片转 Excel', desc: '通过 OCR 识别图片中的文字并导出 Excel 表格' },
  { key: 'wordpdf', label: '文档互转', desc: '在 Word、Excel、PDF 格式之间互相转换' },
]
export default function ModeTabs({ mode, onChange }: Props) {
  return (
    <div role="tablist" aria-label="功能模式" aria-labelledby="mode-tabs-title" className="mode-pill">
      <span id="mode-tabs-title" className="sr-only">功能模式选择</span>
      {modes.map(({ key, label, desc }) => {
        const active = mode === key
        return (
          <button key={key} role="tab" id={`tab-${key}`} aria-selected={active}
            aria-controls="mode-panel" aria-label={desc}
            type="button" tabIndex={active ? 0 : -1}
            onClick={() => onChange(key)}
            className={active ? 'active' : ''}
          >{label}</button>
        )
      })}
    </div>
  )
}
