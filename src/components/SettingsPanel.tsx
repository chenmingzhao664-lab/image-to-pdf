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
      {label && <span className="font-medium" style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</span>}
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
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 font-medium" style={{ fontSize: 12, color: 'var(--text-2)' }}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true" style={{ color: 'var(--accent)' }}>
          <path d="M4 6h16M4 12h16M4 18h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
        </svg>
        高级设置
      </div>
      <div style={{ borderTop: '1px solid var(--line)', padding: '4px 14px 12px' }}>
        <SegGroup label="页面尺寸" value={settings.pageSize} onChange={(v) => onChange({ pageSize: v as any })}
          options={[{ value: 'a4', label: 'A4' }, { value: 'original', label: '原始比例' }]} />
        <SegGroup label="方向" value={settings.orientation} onChange={(v) => onChange({ orientation: v as any })}
          options={[{ value: 'auto', label: '自动' }, { value: 'portrait', label: '纵向' }, { value: 'landscape', label: '横向' }]} />
        <SegGroup label="质量" value={settings.quality} onChange={(v) => onChange({ quality: v as any })}
          options={[{ value: 'hd', label: '高清' }, { value: 'normal', label: '普通' }, { value: 'compressed', label: '压缩' }]} />

        {/* 学习资料模式 */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <span className="font-medium" style={{ fontSize: 11, color: 'var(--text-2)' }}>学习资料模式</span>
            <button type="button" onClick={() => onChange({ study: { ...settings.study, enabled: !settings.study.enabled } })}
              className={`switch ${settings.study.enabled ? 'on' : ''}`} />
          </div>
          {settings.study.enabled && (
            <div className="mt-3 space-y-2.5">
              <label className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-2)' }}>
                <input type="checkbox" checked={settings.study.addPageNumbers} onChange={(e) => onChange({ study: { ...settings.study, addPageNumbers: e.target.checked } })} />
                添加页码
              </label>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>标题</span>
                <input type="text" value={settings.study.pageTitle} onChange={(e) => onChange({ study: { ...settings.study, pageTitle: e.target.value } })}
                  placeholder="例如：高等数学笔记" />
              </div>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>日期</span>
                <input type="date" value={settings.study.pageDate} onChange={(e) => onChange({ study: { ...settings.study, pageDate: e.target.value } })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
