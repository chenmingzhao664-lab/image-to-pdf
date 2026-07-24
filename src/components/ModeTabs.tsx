export default function ModeTabs({ mode, onChange }: { mode: string; onChange: (m: string) => void }) {
  const modes = [
    { key: 'pdf', label: '图片转 PDF' },
    { key: 'excel', label: '图片转 Excel' },
    { key: 'wordpdf', label: 'Word ↔ PDF' },
  ]
  return (
    <div role="tablist" aria-label="选择功能" className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] p-1">
      {modes.map(({ key, label }) => (
        <button
          key={key} role="tab" aria-selected={mode === key} type="button"
          onClick={() => onChange(key)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            mode === key ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
