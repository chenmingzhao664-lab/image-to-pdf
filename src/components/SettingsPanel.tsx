import type { PdfSettings } from '../types'

interface Props {
  settings: PdfSettings
  onChange: (p: Partial<PdfSettings>) => void
}

function SegGroup<T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label?: string
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      {label && <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>}
      <div className="segmented">
        {options.map((o) => (
          <button key={o.value} type="button" className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPanel({ settings, onChange }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 9a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
        PDF 设置
      </div>
      <div className="divide-y divide-[var(--border)]">
        <SegGroup label="页面尺寸" value={settings.pageSize} onChange={(v) => onChange({ pageSize: v as any })}
          options={[{ value: 'a4', label: 'A4' }, { value: 'original', label: '原始比例' }]} />
        <SegGroup label="方向" value={settings.orientation} onChange={(v) => onChange({ orientation: v as any })}
          options={[{ value: 'auto', label: '自动' }, { value: 'portrait', label: '纵向' }, { value: 'landscape', label: '横向' }]} />
        <SegGroup label="质量" value={settings.quality} onChange={(v) => onChange({ quality: v as any })}
          options={[{ value: 'hd', label: '高清' }, { value: 'normal', label: '普通' }, { value: 'compressed', label: '压缩' }]} />

        {/* 学习资料模式 */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-secondary)]">学习资料模式</span>
            <button
              type="button"
              onClick={() => onChange({ study: { ...settings.study, enabled: !settings.study.enabled } })}
              className={`relative h-6 w-11 rounded-full transition ${settings.study.enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white shadow-sm transition ${settings.study.enabled ? 'translate-x-5.5 ml-0.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {settings.study.enabled && (
            <div className="mt-3 space-y-2.5 pl-1">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <input type="checkbox" checked={settings.study.addPageNumbers} onChange={(e) => onChange({ study: { ...settings.study, addPageNumbers: e.target.checked } })}
                  className="accent-[var(--accent)]" />
                添加页码
              </label>
              <div>
                <span className="text-xs text-[var(--text-secondary)]">标题</span>
                <input type="text" value={settings.study.pageTitle} onChange={(e) => onChange({ study: { ...settings.study, pageTitle: e.target.value } })}
                  placeholder="例如：高等数学笔记"
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
              <div>
                <span className="text-xs text-[var(--text-secondary)]">日期</span>
                <input type="date" value={settings.study.pageDate} onChange={(e) => onChange({ study: { ...settings.study, pageDate: e.target.value } })}
                  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
