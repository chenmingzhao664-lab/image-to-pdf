/** 单个图片项的状态数据 */
export interface ImageItem {
  id: string
  file: File
  thumbnail: string
  name: string
  size: number
  type: string
  createdAt: number
  /** 图片原始方向（EXIF 方向 1-8，默认 1）*/
  orientation?: number
  /** 勾选状态（批量删除） */
  selected?: boolean
}
