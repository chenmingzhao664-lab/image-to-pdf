import { useState } from 'react'
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
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-lg)' }}>
      {/* Quick Settings — 默认显示，低信息密度 */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-2 font-medium" style={{ fontSize: 12, color: 'var(--text-2)' }}>
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true" style={{ color: 'var(--accent)' }}>
          <path d="M12 3l3 6 6 .9-4.5 4.4 1 6.1L12 17.8 6.5 20.4l1-6.1L3 9.9 9 9l3-6z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
        快速设置
      </div>
      <div style={{ borderTop: '1px solid var(--line)', padding: '6px 14px 10px' }}>
        <SegGroup label="页面" value={settings.pageSize} onChange={(v) => onChange({ pageSize: v as any })}
          options={[{ value: 'a4', label: 'A4' }, { value: 'original', label: '原始' }]} />
        <SegGroup label="质量" value={settings.quality} onChange={(v) => onChange({ quality: v as any })}
          options={[{ value: 'hd', label: '高清' }, { value: 'normal', label: '普通' }, { value: 'compressed', label: '压缩' }]} />
      </div>

      {/* Advanced — 折叠，含方向 + 学习资料 */}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
          className="settings-advanced-trigger"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true" style={{ color: 'var(--text-3)' }}>
            <path d="M10.5 6l-3 6 3 6M13.5 6l3 6-3 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="round" transform={advancedOpen ? 'rotate(90 12 12)' : 'rotate(0)'}/>
          </svg>
          <span>高级设置</span>
          <span className="settings-advanced-hint">{advancedOpen ? '收起' : '展开'}</span>
        </button>
        {advancedOpen && (
          <div style={{ padding: '4px 14px 12px', borderTop: '1px solid var(--line-soft)' }}>
            <SegGroup label="方向" value={settings.orientation} onChange={(v) => onChange({ orientation: v as any })}
              options={[{ value: 'auto', label: '自动' }, { value: 'portrait', label: '纵向' }, { value: 'landscape', label: '横向' }]} />

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
        )}
      </div>
    </div>
  )
}
