import { ImageItem } from '../types'

interface ImageCardProps {
  item: ImageItem
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (targetId: string) => void
  onDragEnd: () => void
}

/** 单个图片卡片：缩略图 + 名称 + 排序按钮 + 删除（SaaS 极简风） */
export default function ImageCard({
  item,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ImageCardProps) {
  const sizeKB = (item.size / 1024).toFixed(0)

  return (
    <li
      className="image-card"
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(item.id)}
      onDragEnd={onDragEnd}
    >
      <div className="aspect-square w-full bg-[#f4f4f5] flex items-center justify-center overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="px-3 py-2.5 text-xs flex items-center justify-between">
        <p className="truncate text-[#52525b] flex-1 pr-1" title={item.name}>
          {item.name}
        </p>
        <span className="text-[#a1a1aa] shrink-0">{sizeKB} KB</span>
      </div>
      <div className="px-3 pb-2.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(item.id)}
          aria-label="上移"
          className="h-6 w-6 rounded-md border border-[#e4e4e7] text-[#a1a1aa] text-xs flex items-center justify-center hover:border-[#d4d4d8] hover:text-[#52525b] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(item.id)}
          aria-label="下移"
          className="h-6 w-6 rounded-md border border-[#e4e4e7] text-[#a1a1aa] text-xs flex items-center justify-center hover:border-[#d4d4d8] hover:text-[#52525b] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ↓
        </button>
        <span className="text-[#d4d4d8] mx-auto text-[10px]">
          {/* 不需要序号，拖拽即可 */}
        </span>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label="删除"
          className="ml-auto h-6 w-6 rounded-md border border-[#e4e4e7] text-red-400 text-xs flex items-center justify-center hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition"
        >
          ×
        </button>
      </div>
    </li>
  )
}