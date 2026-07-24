function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="reveal" style={{ marginTop: 24 }}>
      <div className="text-center">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </section>
  )
}

const IconLock = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
)
const IconBolt = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const IconLayers = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="M3 13l9 5 9-5M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
)
const IconUpload = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
  </svg>
)
const IconDownload = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square"/>
  </svg>
)

const FEATURES = [
  { icon: IconLock, title: '本地处理 · 不上传', text: '所有图片转换在浏览器内完成，文件不会上传到服务器。隐私从源头得到保障。' },
  { icon: IconBolt, title: '极速转换', text: '基于 WebAssembly + Canvas 流水线，单张图片平均处理 < 200ms。无需安装、即开即用。' },
  { icon: IconLayers, title: '多格式支持', text: '图片转 PDF / 图片转 Excel (OCR) / Word ⇄ Excel ⇄ PDF 文档互转一站式搞定。' },
]

const STEPS = [
  { n: 'STEP 01', icon: IconUpload, title: '选择或拖拽文件', text: '支持 JPG / PNG / WebP，最大 20MB。也可直接 Ctrl+V 粘贴剪贴板里的图片。' },
  { n: 'STEP 02', icon: IconLayers, title: '调整顺序与参数', text: '拖拽排序图片、切换 A4 或原始比例、选择 HD/Normal/Compact 质量。学习资料模式可加页码。' },
  { n: 'STEP 03', icon: IconBolt, title: '本地生成 PDF', text: '点击「生成 PDF」，进度条实时显示页数 N/Total。生成完成即可下载或预览。' },
  { n: 'STEP 04', icon: IconDownload, title: '下载或续做', text: '一键下载文件。历史记录自动保存最近 6 项，可随时重新下载或清空。' },
]

const FAQ = [
  { q: '文件会上传到服务器吗？', a: '不会。Image2PDF 是 100% 客户端工具，所有处理在浏览器内通过 WebAssembly + Canvas 完成。文件从不离开你的设备。' },
  { q: '支持哪些图片格式？', a: 'JPG / JPEG / PNG / WebP，单张 ≤ 20MB。批量不限张数。可拖拽排序，也可粘贴剪贴板图片。' },
  { q: '图片转 Excel 是真的吗？', a: '是。基于内置 OCR 引擎识别图片中的文字，并按行/列结构导出为 .xlsx 表格。识别准确率取决于图片清晰度，建议高对比度扫描件。' },
  { q: '文档互转支持哪些格式？', a: 'Word (.docx) ⇄ Excel (.xlsx) ⇄ PDF 三种格式互转。一次一个文件，自动识别输入格式并推断转换方向，也可手动指定。' },
  { q: '在手机上能用吗？', a: '可以。页面为响应式设计，iOS Safari 与 Android Chrome 均已适配。但大文件处理建议在桌面端进行。' },
]

export default function Sections() {
  return (
    <div className="mt-20 max-w-3xl mx-auto">
      <div className="divider-premium" />

      <Section eyebrow="FEATURES" title="为什么选择 Image2PDF">
        <div className="section-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="section-card">
              <div className="section-card-icon">{f.icon}</div>
              <div className="section-card-title">{f.title}</div>
              <div className="section-card-text">{f.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="divider-premium" />

      <Section eyebrow="HOW IT WORKS" title="四步完成图片转 PDF">
        <div className="section-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {STEPS.map((s) => (
            <div key={s.n} className="section-card">
              <div className="section-card-icon">{s.icon}</div>
              <div className="step-num">{s.n}</div>
              <div className="section-card-title">{s.title}</div>
              <div className="section-card-text">{s.text}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="divider-premium" />

      <Section eyebrow="FAQ" title="常见问题">
        <div style={{ marginTop: 12 }}>
          {FAQ.map((it) => (
            <div key={it.q} className="faq-item">
              <div className="faq-q">{it.q}</div>
              <div className="faq-a">{it.a}</div>
            </div>
          ))}
        </div>
      </Section>

      <div style={{ textAlign: 'center', margin: '40px 0 0', color: 'var(--text-3)', fontSize: 13 }}>
        <svg viewBox="0 0 24 24" fill="none" className="inline-block h-4 w-4 align-middle" aria-hidden="true" style={{ marginRight: 6, verticalAlign: '-2px' }}>
          <path d="M12 3l8 4v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" stroke="var(--accent)" strokeWidth="1.4" fill="none"/>
        </svg>
        所有处理在浏览器本地完成 · 文件不会上传服务器
      </div>
    </div>
  )
}
