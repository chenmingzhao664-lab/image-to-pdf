import type { ConvertDirection } from '../utils/officedoc'

interface Props {
  value: ConvertDirection
  onChange: (d: ConvertDirection) => void
}

/**
 * 6 个方向分成上下两组：上半"以 PDF 为目标"，下半"从 PDF 导出"。
 * 实际目前底层引擎只支持 4 个方向（Word↔PDF、Excel↔PDF），先全量暴露。
 */
const GROUPS: { label: string; items: { key: ConvertDirection; label: string; sub: string }[] }[] = [
  {
    label: '转出为 PDF',
    items: [
      { key: 'word-to-pdf', label: 'Word → PDF', sub: '.docx' },
      { key: 'excel-to-pdf', label: 'Excel → PDF', sub: '.xlsx' },
    ],
  },
  {
    label: '从 PDF 导出',
    items: [
      { key: 'pdf-to-word', label: 'PDF → Word', sub: '.docx' },
      { key: 'pdf-to-excel', label: 'PDF → Excel', sub: '.xlsx' },
    ],
  },
]

export default function DirectionPicker({ value, onChange }: Props) {
  return (
    <div className="dir-picker reveal" role="radiogroup" aria-label="转换方向">
      {GROUPS.map((g) => (
        <div key={g.label} className="dir-group">
          <span className="dir-group-label">{g.label}</span>
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
                >
                  <span className="dir-chip-arrow">{it.label.split(' → ')[0]}</span>
                  <span className="dir-chip-arrow-mark" aria-hidden="true">→</span>
                  <span className="dir-chip-target">{it.label.split(' → ')[1]}</span>
                  <span className="dir-chip-ext">{it.sub}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
