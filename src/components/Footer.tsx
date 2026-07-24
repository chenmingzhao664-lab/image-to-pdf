export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-tertiary)]">
        <p>Image2PDF · 本地处理 · 不上传服务器</p>
        <a href="https://github.com/chenmingzhao664-lab/image-to-pdf" target="_blank" rel="noreferrer" className="hover:text-[var(--text-primary)] transition">GitHub</a>
      </div>
    </footer>
  )
}
