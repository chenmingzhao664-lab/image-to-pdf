import { useCallback, useRef } from 'react'
import ImageCard from './ImageCard'
import type { ImageItem } from '../types'

interface Props {
  items: ImageItem[]
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onReorder: (fromId: string, toId: string) => void
  onToggleSelect: (id: string) => void
}

export default function ImageList({
  items, onDelete, onMoveUp, onMoveDown, onReorder, onToggleSelect,
}: Props) {
  const dragRef = useRef<string | null>(null)

  const handleDragStart = useCallback((id: string) => { dragRef.current = id }, [])
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])
  const handleDrop = useCallback((targetId: string) => {
    const fromId = dragRef.current
    dragRef.current = null
    if (fromId && fromId !== targetId) onReorder(fromId, targetId)
  }, [onReorder])
  const handleDragEnd = useCallback(() => { dragRef.current = null }, [])

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4" aria-label="图片列表">
      {items.map((item, idx) => (
        <ImageCard
          key={item.id}
          item={item}
          index={idx}
          total={items.length}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onToggleSelect={onToggleSelect}
          selected={!!item.selected}
        />
      ))}
    </ul>
  )
}