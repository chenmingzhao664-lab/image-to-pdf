import type { ConvertDirection } from '../utils/officedoc'

interface Props {
  value: ConvertDirection
  onChange: (d: ConvertDirection) => void
}

const GROUPS: { label: string; labelEn: string; items: { key: ConvertDirection; from: string; to: string; ext: string }[] }[] = [
  {
    label: '转换为 PDF',
    labelEn: 'EXPORT TO PDF',
    items: [
      { key: 'word-to-pdf', from: 'Word', to: 'PDF', ext: '.docx' },
      { key: 'excel-to-pdf', from: 'Excel', to: 'PDF', ext: '.xlsx' },
    ],
  },
  {
    label: '从 PDF 导出',
    labelEn: 'EXPORT FROM PDF',
    items: [
      { key: 'pdf-to-word', from: 'PDF', to: 'Word', ext: '.docx' },
      { key: 'pdf-to-excel', from: 'PDF', to: 'Excel', ext: '.xlsx' },
    ],
  },
]

export default function DirectionPicker({ value, onChange }: Props) {
  return (
    <div className="dir-picker reveal" role="radiogroup" aria-label="转换方向">
      {GROUPS.map((g) => (
        <div key={g.label} className="dir-group">
          <div className="dir-group-header">
            <span className="dir-group-label-zh">{g.label}</span>
            <span className="dir-group-label-en">{g.labelEn}</span>
          </div>
          <div className="dir-chips">
            {g.items.map((it) => {
              const active = value === it.key
              return (
                <button
                  key={it.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(it.key)}
                  className={active ? 'dir-chip active' : 'dir-chip'}
                  aria-label={`${it.from} 转为 ${it.to}（${it.ext}）`}
                  title={`${it.from} → ${it.to}（${it.ext}）`}
                >
                  <span className="dir-chip-from">{it.from}</span>
                  <span className="dir-chip-arrow" aria-hidden="true">→</span>
                  <span className="dir-chip-to">{it.to}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
