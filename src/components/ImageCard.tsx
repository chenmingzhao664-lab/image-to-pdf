import { ImageItem } from '../types'

interface ImageCardProps {
  item: ImageItem
  index: number
  total: number
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

/** 单个图片卡片：缩略图 + 名称 + 排序按钮 + 删除（漫画风暗色版） */
export default function ImageCard({
  item,
  index,
  total,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ImageCardProps) {
  const sizeKB = (item.size / 1024).toFixed(0)
  return (
    <li className="group relative flex flex-col manga-thumb rounded-2xl overflow-hidden transition hover:scale-[1.02]">
      <div className="aspect-square w-full bg-white/6 flex items-center justify-center overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="px-3 py-2.5 text-xs">
        <p className="truncate font-medium text-white/90" title={item.name}>
          {item.name}
        </p>
        <p className="mt-0.5 text-white/45" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {sizeKB} KB · #{index + 1}/{total}
        </p>
      </div>
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onMoveUp(item.id)}
          disabled={index === 0}
          aria-label="上移"
          className="manga-chip h-7 w-7 rounded-lg bg-[#FFD86B] text-[#1a1033] text-xs leading-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: '2px 2px 0 0 #1a1033' }}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(item.id)}
          disabled={index === total - 1}
          aria-label="下移"
          className="manga-chip h-7 w-7 rounded-lg bg-[#FFD86B] text-[#1a1033] text-xs leading-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: '2px 2px 0 0 #1a1033' }}
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label="删除"
          className="manga-chip h-7 w-7 rounded-lg bg-[#FF6B6B] text-white text-xs leading-none flex items-center justify-center hover:bg-red-500"
          style={{ boxShadow: '2px 2px 0 0 #1a1033' }}
        >
          ×
        </button>
      </div>
    </li>
  )
}