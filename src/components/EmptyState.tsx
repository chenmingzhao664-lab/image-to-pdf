interface Props {
  mode: 'pdf' | 'excel' | 'wordpdf'
}

const ART: Record<Props['mode'], { title: string; hint: string }> = {
  pdf: { title: '上传图片即可预览', hint: '支持拖拽 / 粘贴 / 点击选择' },
  excel: { title: '上传图片即可识别', hint: 'OCR 提取文字 → 导出 .xlsx' },
  wordpdf: { title: '选择文档即可转换', hint: '支持 .docx / .pdf / .xlsx' },
}

export default function EmptyState({ mode }: Props) {
  const { title, hint } = ART[mode]
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <svg viewBox="0 0 240 160" className="empty-state-art" aria-hidden="true">
        <defs>
          <linearGradient id="es-paper" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--bg-1)" />
            <stop offset="100%" stopColor="var(--bg-2)" />
          </linearGradient>
          <linearGradient id="es-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 底部聚光 */}
        <ellipse cx="120" cy="148" rx="78" ry="6" fill="url(#es-glow)" opacity="0.5" />

        {/* 第一张纸（最远，最浅） */}
        <rect x="50" y="36" width="80" height="100" rx="6"
          fill="url(#es-paper)"
          stroke="var(--line)" strokeWidth="1"
          opacity="0.45"
          transform="rotate(-8 90 86)" />

        {/* 第二张纸（中间，主图） */}
        <rect x="92" y="28" width="80" height="100" rx="6"
          fill="url(#es-paper)"
          stroke="var(--line-strong)" strokeWidth="1.2" />
        {/* 图片占位区 + accent 边框 */}
        <rect x="102" y="38" width="60" height="46" rx="3"
          fill="var(--bg-2)" stroke="var(--accent-soft)" strokeWidth="1"
          strokeDasharray="3 3" />
        {/* 山峰占位图 */}
        <path d="M102 78 L116 60 L128 70 L140 56 L148 64 L162 78 Z"
          fill="var(--accent-soft)" opacity="0.7" />
        <circle cx="118" cy="50" r="3" fill="var(--accent)" opacity="0.55" />
        {/* 文字模拟占位 */}
        <rect x="102" y="92" width="60" height="3" rx="1.5" fill="var(--text-3)" opacity="0.5" />
        <rect x="102" y="100" width="42" height="3" rx="1.5" fill="var(--text-3)" opacity="0.35" />
        <rect x="102" y="108" width="56" height="3" rx="1.5" fill="var(--text-3)" opacity="0.25" />
        <rect x="102" y="116" width="38" height="3" rx="1.5" fill="var(--text-3)" opacity="0.2" />

        {/* 右上 + 角标 — 页码 */}
        <g transform="translate(164 22)">
          <circle r="11" fill="var(--accent)" />
          <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700"
            fill="var(--accent-text)" fontFamily="var(--font-sans)">01</text>
        </g>

        {/* 右侧装饰：上传箭头 */}
        <g transform="translate(186 84)">
          <circle r="18" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.2" />
          <path d="M0 6 V -6 M0 -6 L -4 -2 M0 -6 L 4 -2"
            stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="square" fill="none" />
        </g>
      </svg>

      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-hint">{hint}</p>
    </div>
  )
}
