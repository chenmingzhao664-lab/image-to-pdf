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

        {/* 页码角标 — 左下，圆形徽章化 */}
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

        {/* hover 操作层 — 覆盖整卡，渐变镇底 */}
        <div className="img-card-overlay" aria-hidden="true">
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(item.id) }} className="img-card-action" title="上移" aria-label="上移">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 5l-6 6 1.5 1.5L11 9v9h2V9l3.5 3.5L18 11z" fill="currentColor"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(item.id) }} className="img-card-action" title="下移" aria-label="下移">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 19l6-6-1.5-1.5L13 15V6h-2v9l-3.5-3.5L6 13z" fill="currentColor"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item.id) }} className="img-card-action img-card-action-danger" title="删除" aria-label="删除">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      <div className="img-card-meta">
        <div className="img-card-name" title={item.name}>{item.name}</div>
        <div className="img-card-stats">
          {item.naturalWidth && item.naturalHeight ? (
            <>
              <span>{item.naturalWidth}×{item.naturalHeight}</span>
              <span className="img-card-stats-dot" aria-hidden="true">·</span>
            </>
          ) : null}
          <span>{formatSize(item.size)}</span>
        </div>
      </div>
    </div>
  )
}
