import type { ConvertDirection } from '../utils/officedoc'

interface Props {
  value: ConvertDirection
  onChange: (d: ConvertDirection) => void
}

/**
 * 6 个方向分成上下两组：上半"以 PDF 为目标"，下半"从 PDF 导出"。
 * 实际目前底层引擎只支持 4 个方向（Word↔PDF、Excel↔PDF），先全量暴露。
 */
const GROUPS: { label: string; items: { key: ConvertDirection; from: string; to: string; ext: string }[] }[] = [
  {
    label: '转换为 PDF',
    items: [
      { key: 'word-to-pdf', from: 'Word', to: 'PDF', ext: '.docx' },
      { key: 'excel-to-pdf', from: 'Excel', to: 'PDF', ext: '.xlsx' },
    ],
  },
  {
    label: '从 PDF 导出',
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
                  aria-label={`${it.from} 转为 ${it.to}（${it.ext}）`}
                >
                  <span className="dir-chip-from">{it.from}</span>
                  <span className="dir-chip-arrow" aria-hidden="true">→</span>
                  <span className="dir-chip-to">{it.to}</span>
                  <span className="dir-chip-ext">{it.ext}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
