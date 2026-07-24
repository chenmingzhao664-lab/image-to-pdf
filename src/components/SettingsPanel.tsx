import type { PdfSettings } from '../types'
import type { PageOrientation, PageSize, ImageFit, MarginLevel, OutputQuality } from '../types'

interface Props {
  settings: PdfSettings
  onChange: (patch: Partial<PdfSettings>) => void
}

function Segmented<T extends string>({
  value, options, onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented-control">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={value === o.value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      {children}
    </div>
  )
}

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[var(--text-secondary)]">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19.4 9a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <h3 className="text-sm font-semibold">PDF 设置</h3>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        <Row label="页面尺寸">
          <Segmented<PageSize>
            value={settings.pageSize}
            onChange={(v) => onChange({ pageSize: v })}
            options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'original', label: '原尺寸' },
            ]}
          />
        </Row>

        <Row label="方向">
          <Segmented<PageOrientation>
            value={settings.orientation}
            onChange={(v) => onChange({ orientation: v })}
            options={[
              { value: 'portrait', label: '竖版' },
              { value: 'landscape', label: '横版' },
            ]}
          />
        </Row>

        <Row label="图片适配">
          <Segmented<ImageFit>
            value={settings.imageFit}
            onChange={(v) => onChange({ imageFit: v })}
            options={[
              { value: 'contain', label: '完整显示' },
              { value: 'fill', label: '填充' },
            ]}
          />
        </Row>

        <Row label="边距">
          <Segmented<MarginLevel>
            value={settings.margin}
            onChange={(v) => onChange({ margin: v })}
            options={[
              { value: 'none', label: '无' },
              { value: 'small', label: '小' },
              { value: 'medium', label: '中' },
              { value: 'large', label: '大' },
            ]}
          />
        </Row>

        <Row label="质量">
          <Segmented<OutputQuality>
            value={settings.quality}
            onChange={(v) => onChange({ quality: v })}
            options={[
              { value: 'standard', label: '普通' },
              { value: 'hd', label: '高清' },
            ]}
          />
        </Row>
      </div>
    </div>
  )
}
