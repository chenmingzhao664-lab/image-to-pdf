// 接受的图片类型
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

// 文件扩展名白名单
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp'

// 接受的文档类型
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

// A4 尺寸（pt）
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89

// Letter 尺寸（pt）
export const LETTER_WIDTH_PT = 612
export const LETTER_HEIGHT_PT = 792

// 边距等级对应的留白（pt）
export const MARGIN_PT: Record<string, number> = {
  none: 0,
  small: 18,
  medium: 36,
  large: 54,
}

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

// 品牌信息
export const BRAND = {
  NAME: 'zcm的文档转换器',
  ZH_NAME: 'zcm的文档转换器',
  TAGLINE: '快速、安全、免费的图片转 PDF 工具',
  DESCRIPTION: 'Convert JPG PNG images to PDF instantly. 100% free and private browser-based PDF converter.',
  AUTHOR: 'zcm',
} as const

// 旧版兼容
export const SITE_TITLE = 'Free Image to PDF Converter - Offline & Secure'
export const SITE_TAGLINE = '快速、安全、免费的图片转 PDF 工具'
export const SITE_SUBTITLE = 'Image PDF · 图片秒变 PDF'
export const SITE_PRIVACY_NOTE = '所有文件均在浏览器本地处理，不会上传服务器'

// 流程步骤
export const FLOW_STEPS = [
  { id: 1, label: '上传', icon: 'M12 16V4M12 4l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2' },
  { id: 2, label: '排序', icon: 'M3 6h13M3 12h9M3 18h13M17 8l4 4-4 4' },
  { id: 3, label: '设置', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 9a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
  { id: 4, label: '导出', icon: 'M12 4v12m0 0l-4-4m4 4l4-4M4 18h16' },
] as const

// LocalStorage keys
export const LS_HISTORY_KEY = 'zcm_pdf_history_v1'
export const LS_THEME_KEY = 'zcm_pdf_theme_v1'
export const HISTORY_MAX_ITEMS = 10
