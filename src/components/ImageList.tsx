import ImageCard from './ImageCard'
import { ImageItem } from '../types'

interface ImageListProps {
  items: ImageItem[]
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}

/** 图片网格列表区域 */
export default function ImageList({
  items,
  onDelete,
  onMoveUp,
  onMoveDown,
}: ImageListProps) {
  return (
    <ul
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
      aria-label="图片列表"
    >
      {items.map((item, idx) => (
        <ImageCard
          key={item.id}
          item={item}
          index={idx}
          total={items.length}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
    </ul>
  )
}
