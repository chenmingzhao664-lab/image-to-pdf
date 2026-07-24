import type { ImageItem } from '../types'
import { formatSize } from '../utils/pdf'

interface Props {
  item: ImageItem; index: number; total: number
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void; onMoveDown: (id: string) => void
  onDragStart: (id: string) => void; onDragOver: (e: React.DragEvent) => void
  onDrop: (targetId: string) => void; onDragEnd: () => void
  onToggleSelect: (id: string) => void
  selected: boolean
}

export default function ImageCard({
  item, index, total, onDelete, onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop, onDragEnd, onToggleSelect, selected,
}: Props) {
  return (
    <li
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(item.id)}
      onDragEnd={onDragEnd}
      className={`img-card relative ${selected ? 'selected' : ''}`}
    >
      <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-[var(--accent-text)]">{index + 1}</div>
      <button
        type="button" onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id) }}
        className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] transition"
      >
        {selected && <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-[var(--accent)]"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      <div className="aspect-square overflow-hidden bg-[var(--bg-subtle)]">
        <img src={item.thumbnail} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium" title={item.name}>{item.name}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-tertiary)]">
          <span>{formatSize(item.size)}</span>
          {item.naturalWidth && <span>{item.naturalWidth}x{item.naturalHeight}</span>}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <button type="button" onClick={() => onMoveUp(item.id)} disabled={index === 0}
            className="btn-secondary h-7 flex-1 px-0 rounded-md text-center" aria-label="上移">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mx-auto"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={() => onMoveDown(item.id)} disabled={index === total - 1}
            className="btn-secondary h-7 flex-1 px-0 rounded-md text-center" aria-label="下移">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mx-auto"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button type="button" onClick={() => onDelete(item.id)}
            className="btn-secondary h-7 flex-1 px-0 rounded-md text-center hover:text-red-500 hover:border-red-200" aria-label="删除">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 mx-auto"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </li>
  )
}
