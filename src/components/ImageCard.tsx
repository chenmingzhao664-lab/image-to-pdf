import type { ImageItem } from '../types'
import { formatSize } from '../utils/pdf'

interface Props {
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
  isDragging?: boolean
  selected?: boolean
}

export default function ImageCard({
  item, index, total,
  onDelete, onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop, onDragEnd,
  onToggleSelect, isDragging, selected,
}: Props) {
  return (
    <li
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(item.id)}
      onDragEnd={onDragEnd}
      className={`img-card relative ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      {/* 编号徽章 */}
      <div className="absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
        {index + 1}
      </div>

      {/* 勾选框 */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id) }}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition"
        aria-label="勾选"
      >
        {selected && (
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-[var(--accent)]">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* 缩略图（lazy） */}
      <div className="aspect-square overflow-hidden bg-[var(--bg-subtle)]">
        <img
          src={item.thumbnail}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>

      {/* 信息 */}
      <div className="p-2.5">
        <p className="truncate text-xs font-medium" title={item.name}>{item.name}</p>
        <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
          <span>{formatSize(item.size)}</span>
          {item.naturalWidth && item.naturalHeight && (
            <span>{item.naturalWidth}×{item.naturalHeight}</span>
          )}
        </div>

        {/* 操作 */}
        <div className="mt-2 flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(item.id) }}
            disabled={index === 0}
            className="flex h-7 flex-1 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition"
            aria-label="上移"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(item.id) }}
            disabled={index === total - 1}
            className="flex h-7 flex-1 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 transition"
            aria-label="下移"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            className="flex h-7 flex-1 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-red-500 hover:border-red-200 transition"
            aria-label="删除"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </li>
  )
}