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

// A4 尺寸
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

// 智能模式（PDF 专用）—— 隐式选项，不展示为 tab，仅 PDF 模式下展示选择
export type SmartMode = 'study' | 'photo' | 'custom'

export const SMART_MODE_LABELS: Record<SmartMode, { title: string; desc: string; icon: string }> = {
  study: {
    title: '学习资料',
    desc: 'A4 适配 · 保留高清文字 · 压缩扫描件',
    icon: 'study',
  },
  photo: {
    title: '照片合集',
    desc: '铺满页面 · 保留照片质量',
    icon: 'photo',
  },
  custom: {
    title: '自定义',
    desc: '手动选择 A4 / 原始比例',
    icon: 'custom',
  },
}

// 品牌信息（老板原话订正：是"zcm的文档转换器"，不要改成别的）
export const BRAND = {
  NAME: 'zcm的文档转换器',
  ZH_NAME: 'zcm的文档转换器',
  TAGLINE: '纯浏览器端 · 不上传服务器 · 一站搞定',
  DESCRIPTION: '纯浏览器端文档转换工具',
  AUTHOR: 'zcm',
} as const

// 旧版兼容（避免下游报错）
export const SITE_TITLE = 'zcm的文档转换器 — 图片转PDF工具'
export const SITE_TAGLINE = '纯浏览器端 · 不上传服务器 · 一站搞定'
export const SITE_SUBTITLE = '图片转PDF / 图片转Excel（OCR）/ Word↔PDF 三合一'
export const SITE_PRIVACY_NOTE = '所有文件均在浏览器本地处理，不会上传服务器'

// 转换流程步骤
export const FLOW_STEPS = [
  { id: 1, label: '上传', icon: 'M12 16V4M12 4l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2' },
  { id: 2, label: '排序', icon: 'M3 6h13M3 12h9M3 18h13M17 8l4 4-4 4' },
  { id: 3, label: '设置', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 9a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' },
  { id: 4, label: '导出', icon: 'M12 4v12m0 0l-4-4m4 4l4-4M4 18h16' },
] as const