interface Props { mode: string; onChange: (m: string) => void }
const modes = [
  { key: 'pdf', label: '图片转 PDF' },
  { key: 'excel', label: '图片转 Excel' },
  { key: 'wordpdf', label: '文档互转' },
]
export default function ModeTabs({ mode, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Mode" className="mode-pill">
      {modes.map(({ key, label }) => (
        <button key={key} role="tab" aria-selected={mode === key} type="button"
          onClick={() => onChange(key)}
          className={mode === key ? 'active' : ''}
        >{label}</button>
      ))}
    </div>
  )
}