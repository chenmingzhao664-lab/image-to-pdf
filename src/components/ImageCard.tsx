import type { ImageItem } from '../types'
import { formatSize } from '../utils/pdf'

interface Props {
  item: ImageItem
  index: number
  isSelected: boolean
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onToggleSelect: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDrop: (id: string) => void
  isDragging: boolean
  isDragOver: boolean
}

export default function ImageCard({ item, index, isSelected, onDelete, onMoveUp, onMoveDown, onToggleSelect, onDragStart, onDragOver, onDrop, isDragging, isDragOver }: Props) {
  return (
    <div
      className={`img-card group ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(item.id)}
      onDragOver={(e) => { e.preventDefault(); onDragOver(item.id) }}
      onDrop={(e) => { e.preventDefault(); onDrop(item.id) }}
      onClick={() => onToggleSelect(item.id)}
      style={{ position: 'relative' }}
    >
      <div className="thumb-wrap">
        <img src={item.thumbnail} alt={item.name} draggable={false} />

        {/* 页码角标 — 左下 */}
        <span className="page-number">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* 选中标记 — 右上圆勾 */}
        {isSelected && (
          <span style={{
            position: 'absolute', top: 6, right: 6, zIndex: 5,
            width: 22, height: 22, background: 'var(--accent)', color: 'var(--accent-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, borderRadius: '50%',
            boxShadow: '0 2px 8px var(--accent-glow)',
            animation: 'cardIn 0.3s var(--ease-spring) both',
          }}>✓</span>
        )}

        {/* hover 时浮现的操作层 */}
        <div className="absolute inset-0 flex items-end justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pb-2" style={{ background: 'linear-gradient(180deg, transparent 60%, var(--overlay-shadow-bottom) 100%)' }}>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(item.id) }} className="btn-secondary small" title="上移" style={{ padding: '4px 10px', fontSize: 11 }}>↑</button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(item.id) }} className="btn-secondary small" title="下移" style={{ padding: '4px 10px', fontSize: 11 }}>↓</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="btn-secondary small" title="删除" style={{ padding: '4px 10px', fontSize: 11, color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}>✕</button>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="truncate" style={{ color: 'var(--text-1)', fontSize: 12, fontWeight: 500 }} title={item.name}>
          {item.name}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-3)', fontSize: 10 }}>
          {item.naturalWidth && item.naturalHeight && (
            <>
              <span>{item.naturalWidth}×{item.naturalHeight}</span>
              <span style={{ color: 'var(--line-strong)' }}>·</span>
            </>
          )}
          <span>{formatSize(item.size)}</span>
        </div>
      </div>
    </div>
  )
}
