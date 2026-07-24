export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] mt-16 pb-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-3)' }}>
        <p>Image2PDF · 本地处理 · 不上传服务器</p>
        <a href="https://github.com/chenmingzhao664-lab/image-to-pdf" target="_blank" rel="noreferrer"
          className="hover:text-[var(--text-1)] transition font-medium">GitHub</a>
      </div>
    </footer>
  )
}
