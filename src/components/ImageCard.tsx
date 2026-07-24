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
      style={{ position: 'relative' }}
    >
      {/* 序号标签 — 左上角黄边编号 */}
      <span style={{
        position: 'absolute', top: 0, left: 0, zIndex: 5,
        background: 'var(--bg-1)', border: '1px solid var(--ark-yellow)', color: 'var(--ark-yellow)',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em',
        padding: '2px 6px', minWidth: 36, textAlign: 'center', lineHeight: 1.4,
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* 拖拽手柄 — 右上角 */}
      <span aria-hidden style={{
        position: 'absolute', top: 6, right: 6, zIndex: 5,
        color: 'var(--text-4)', fontSize: 14, cursor: 'grab', padding: '4px',
        opacity: 0.5, transition: 'opacity 0.15s',
      }} className="group-hover:opacity-100">⠿</span>

      <div className="thumb-wrap">
        <img src={item.thumbnail} alt={item.name} draggable={false} />
        {/* 选中标记 */}
        {isSelected && (
          <span className="check-mark" style={{
            position: 'absolute', top: 6, right: 32, zIndex: 5,
            width: 22, height: 22, background: 'var(--ark-yellow)', color: '#1c1c1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)',
            animation: 'checkPop 0.4s ease both',
          }}>✓</span>
        )}
      </div>

      <div className="p-3 text-xs">
        <div className="truncate" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-display)', fontSize: 12, letterSpacing: '0.04em' }} title={item.name}>
          {item.name}
        </div>
        <div className="mt-1 flex items-center gap-2" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.08em' }}>
          <span>{item.naturalWidth && item.naturalHeight ? `${item.naturalWidth}×${item.naturalHeight}` : 'FILE'}</span>
          <span style={{ color: 'var(--line)' }}>·</span>
          <span>{formatSize(item.size)}</span>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); onToggleSelect(item.id) } }}
            title="选中"
            style={isSelected ? { borderColor: 'var(--ark-yellow)', color: 'var(--ark-yellow)' } : {}}
            className="btn-secondary !py-1 !px-2 !text-[10px] sup-btn">
            {isSelected ? 'SELECTED' : 'SELECT'}
          </span>
          <span className="flex-1" />
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onMoveUp(item.id) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).click() } }}
            className="btn-secondary !py-1 !px-2 !text-[10px] sup-btn" title="上移">▲</span>
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onMoveDown(item.id) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).click() } }}
            className="btn-secondary !py-1 !px-2 !text-[10px] sup-btn" title="下移">▼</span>
          <span role="button" tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLElement).click() } }}
            title="删除"
            className="btn-secondary !py-1 !px-2 !text-[10px] sup-btn"
            style={{ borderColor: 'rgba(255,68,68,0.4)', color: '#FF4444' }}
          >✕</span>
        </div>
      </div>
    </div>
  )
}