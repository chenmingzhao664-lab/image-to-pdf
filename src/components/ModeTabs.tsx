import type { WorkMode } from '../utils/constants'

interface ModeTabsProps {
  mode: WorkMode
  onModeChange: (m: WorkMode) => void
  disabled?: boolean
}

const MODE_LABELS: { key: WorkMode; label: string }[] = [
  { key: 'pdf', label: '图片转 PDF' },
  { key: 'excel', label: '图片转 Excel (OCR)' },
  { key: 'wordpdf', label: 'Word ↔ PDF' },
]

export default function ModeTabs({ mode, onModeChange, disabled }: ModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="选择功能模式"
      className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-1 w-full sm:w-auto"
    >
      {MODE_LABELS.map(({ key, label }) => {
        const active = mode === key
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(key)}
            className={[
              'px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex-1 sm:flex-initial',
              active
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}