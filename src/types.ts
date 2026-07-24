/** 单个图片项 */
export interface ImageItem {
  id: string
  file: File
  thumbnail: string
  name: string
  size: number
  type: string
  createdAt: number
  orientation?: number
  selected?: boolean
  naturalWidth?: number
  naturalHeight?: number
}

/** 页面尺寸 */
export type PageSize = 'a4' | 'original'

/** 方向 */
export type OrientationMode = 'auto' | 'portrait' | 'landscape'

/** 质量 */
export type QualityLevel = 'hd' | 'normal' | 'compressed'

/** 学习资料模式设置 */
export interface StudySettings {
  enabled: boolean
  addPageNumbers: boolean
  pageTitle: string
  pageDate: string
}

/** PDF 生成设置 */
export interface PdfSettings {
  pageSize: PageSize
  orientation: OrientationMode
  quality: QualityLevel
  study: StudySettings
}

/** 下载记录 */
export interface DownloadRecord {
  id: string
  fileName: string
  fileSize: number
  pageCount: number
  createdAt: number
}

/** 主题 */
export type ThemeMode = 'light' | 'dark'
