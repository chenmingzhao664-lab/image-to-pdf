// 接受的图片类型
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

// 文件扩展名白名单（用于 input.accept）
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp'

// 接受的文档类型（Word + PDF）
export const ACCEPTED_DOC_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/pdf',
  'application/msword',
] as const

export const ACCEPTED_DOC_EXTENSIONS = '.docx,.pdf,.doc'

// 单张图片最大体积（20MB）
export const MAX_SINGLE_IMAGE_BYTES = 20 * 1024 * 1024

// 单文档最大体积
export const MAX_SINGLE_DOC_BYTES = 50 * 1024 * 1024

// 单张图片最大像素边
export const MAX_IMAGE_DIMENSION = 8000

// 默认 A4 尺寸
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89
export const A4_MARGIN_PT = 24

// 文件类型友好名称
export const TYPE_FRIENDLY_NAME: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/msword': 'Word(旧)',
  'application/pdf': 'PDF',
}

// 工作模式
export type WorkMode = 'pdf' | 'excel' | 'wordpdf'

// 全站标题
export const SITE_TITLE = 'Image Tools · 图片工具箱'
export const SITE_SUBTITLE = '纯浏览器端 · 不上传服务器 · 图片转PDF / 图片转Excel / Word↔PDF'
export const SITE_PRIVACY_NOTE = '所有文件均在浏览器本地处理，不会上传服务器'
