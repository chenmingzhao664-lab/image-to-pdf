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
      className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
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
              'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
              active
                ? 'bg-gray-900 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            <span aria-hidden>{icon}</span>
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
