import type { WorkMode } from '../utils/constants'

interface ModeTabsProps {
  mode: WorkMode
  onModeChange: (m: WorkMode) => void
  disabled?: boolean
}

const MODE_LABELS: { key: WorkMode; label: string; icon: string }[] = [
  { key: 'pdf', label: 'PDF', icon: '📄' },
  { key: 'excel', label: 'Excel', icon: '📊' },
  { key: 'wordpdf', label: 'Word↔PDF', icon: '🔄' },
]

export default function ModeTabs({ mode, onModeChange, disabled }: ModeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="选择功能模式"
      className="flex flex-wrap items-center gap-2"
    >
      {MODE_LABELS.map(({ key, label, icon }) => {
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
              'manga-btn manga-btn-ghost rounded-xl px-4 py-2.5 text-sm',
              active ? 'active' : '',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            <span aria-hidden className="mr-1.5">{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
