// 接受的图片类型
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp'

// 单张图片最大体积（20MB）
export const MAX_SINGLE_IMAGE_BYTES = 20 * 1024 * 1024
// 单张图片最大像素边
export const MAX_IMAGE_DIMENSION = 8000

// A4 尺寸（pt）
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89

// 各质量等级的最大图片尺寸（像素）与 JPEG 压缩质量
// - hd: 不缩放
// - normal: 限 1600px
// - compressed: 限 1024px
export const QUALITY_MAX_PX: Record<string, number> = {
  hd: 99999,
  normal: 1600,
  compressed: 1024,
}

// 品牌
export const BRAND = {
  NAME: 'Image2PDF',
  TAGLINE: '图片秒速转换 PDF',
  SUBTAGLINE: '本地处理 · 无需上传 · 完全免费',
} as const

// LocalStorage keys
export const LS_HISTORY_KEY = 'image2pdf_history_v2'
export const LS_THEME_KEY = 'image2pdf_theme_v2'
export const HISTORY_MAX_ITEMS = 12
