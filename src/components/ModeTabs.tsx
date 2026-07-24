import type { WorkMode } from '../utils/constants'

interface ModeTabsProps {
  mode: WorkMode
  onModeChange: (m: WorkMode) => void
  disabled?: boolean
}

const MODE_LABELS: { key: WorkMode; label: string }[] = [
  { key: 'pdf', label: 'PDF' },
  { key: 'excel', label: 'Excel' },
  { key: 'wordpdf', label: 'Word↔PDF' },
]

export default function ModeTabs({ mode, onModeChange, disabled }: ModeTabsProps) {
  return (
    <div role="tablist" aria-label="选择功能模式" className="inline-flex rounded-xl border border-[#e8e8ea] bg-white/80 backdrop-blur p-1">
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
              'px-4 py-1.5 rounded-lg text-sm font-medium transition',
              active ? 'bg-[#0c0c0d] text-white' : 'text-[#52525b] hover:text-[#0c0c0d]',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}