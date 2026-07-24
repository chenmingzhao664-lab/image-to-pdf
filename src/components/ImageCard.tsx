import { ImageItem } from '../types'

interface ImageCardProps {
  item: ImageItem
  index: number
  total: number
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (targetId: string) => void
  onDragEnd: () => void
  onToggleSelect: (id: string) => void
}

export default function ImageCard({
  item, index, total, onDelete, onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop, onDragEnd, onToggleSelect,
}: ImageCardProps) {
  const sizeKB = (item.size / 1024).toFixed(0)
  const selected = !!item.selected

  return (
    <li
      className={`img-card group ${selected ? 'selected' : ''}`}
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(item.id)}
      onDragEnd={onDragEnd}
    >
      {/* Select checkbox - top left */}
      <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label={selected ? '取消选中' : '选中'}
          onClick={() => onToggleSelect(item.id)}
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${selected ? 'bg-[#0c0c0d] border-[#0c0c0d] text-white' : 'bg-white/90 border-[#e8e8ea] hover:border-[#d4d4d8]'}`}
        >
          {selected && (
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" style={{ animation: 'checkPop 0.2s ease-out both' }}>
              <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* Delete - top right */}
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label="删除"
          className="flex h-5 w-5 items-center justify-center rounded-md bg-white/90 border border-[#e8e8ea] text-[#a1a1aa] hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition"
          style={{ opacity: selected ? 1 : 0 }}
          // hover-revealed via group-hover
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Thumbnail */}
      <div className="aspect-square w-full bg-[#f4f4f5] flex items-center justify-center overflow-hidden">
        <img src={item.thumbnail} alt={item.name} loading="lazy" className="max-h-full max-w-full object-contain" />
      </div>

      {/* Meta */}
      <div className="px-2.5 py-2">
        <p className="truncate text-[11px] text-[#52525b]" title={item.name}>{item.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[#a1a1aa]">{sizeKB} KB</span>
          <span className="text-[10px] text-[#d4d4d8]">#{index + 1}/{total}</span>
        </div>
        <div className="flex gap-1 mt-2">
          <button type="button" onClick={() => onMoveUp(item.id)} disabled={index === 0} aria-label="上移"
            className="flex-1 h-6 rounded-md border border-[#e8e8ea] text-[#a1a1aa] text-[10px] flex items-center justify-center hover:border-[#d4d4d8] hover:text-[#52525b] transition disabled:opacity-30 disabled:cursor-not-allowed">
            ↑
          </button>
          <button type="button" onClick={() => onMoveDown(item.id)} disabled={index === total - 1} aria-label="下移"
            className="flex-1 h-6 rounded-md border border-[#e8e8ea] text-[#a1a1aa] text-[10px] flex items-center justify-center hover:border-[#d4d4d8] hover:text-[#52525b] transition disabled:opacity-30 disabled:cursor-not-allowed">
            ↓
          </button>
        </div>
      </div>

      {/* Hover delete style override - shown via group-hover */}
      <style>{`
        .img-card:hover button[aria-label="删除"] { opacity: 1 !important; }
      `}</style>
    </li>
  )
}