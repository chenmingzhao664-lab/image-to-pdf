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
  /** 自然宽（像素） */
  naturalWidth?: number
  /** 自然高（像素） */
  naturalHeight?: number
}

/** 页面尺寸 */
export type PageSize = 'a4' | 'letter' | 'original'

/** 页面方向 */
export type PageOrientation = 'portrait' | 'landscape'

/** 图片适配模式 */
export type ImageFit = 'fill' | 'contain'

/** 边距等级 */
export type MarginLevel = 'none' | 'small' | 'medium' | 'large'

/** 输出质量 */
export type OutputQuality = 'standard' | 'hd'

/** PDF 生成设置 */
export interface PdfSettings {
  pageSize: PageSize
  orientation: PageOrientation
  imageFit: ImageFit
  margin: MarginLevel
  quality: OutputQuality
}

/** LocalStorage 下载记录 */
export interface DownloadRecord {
  id: string
  fileName: string
  fileSize: number
  pageCount: number
  createdAt: number
  thumbnail?: string
}

/** 主题模式 */
export type ThemeMode = 'light' | 'dark'
