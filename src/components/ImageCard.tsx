import { ImageItem } from '../types'

interface ImageCardProps {
  item: ImageItem
  index: number
  total: number
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

/** 单个图片卡片：缩略图 + 名称 + 排序按钮 + 删除 */
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
    <li className="group relative flex flex-col rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden transition hover:shadow-md">
      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <div className="px-3 py-2.5 text-xs">
        <p className="truncate font-medium text-gray-800" title={item.name}>
          {item.name}
        </p>
        <p className="mt-0.5 text-gray-500">{sizeKB} KB · #{index + 1}/{total}</p>
      </div>
      <div className="absolute top-1.5 right-1.5 flex gap-1">
        <button
          type="button"
          onClick={() => onMoveUp(item.id)}
          disabled={index === 0}
          aria-label="上移"
          className="h-7 w-7 rounded-md bg-white/90 shadow text-gray-700 text-xs leading-none flex items-center justify-center hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(item.id)}
          disabled={index === total - 1}
          aria-label="下移"
          className="h-7 w-7 rounded-md bg-white/90 shadow text-gray-700 text-xs leading-none flex items-center justify-center hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label="删除"
          className="h-7 w-7 rounded-md bg-white/90 shadow text-red-600 text-xs leading-none flex items-center justify-center hover:bg-red-600 hover:text-white"
        >
          ×
        </button>
      </div>
    </li>
  )
}
