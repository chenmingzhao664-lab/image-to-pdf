// 接受的图片类型
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const

// 文件扩展名白名单（用于 input.accept）
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp'

// 单张图片最大体积（20MB）—— 超过会拒绝并提示用户
// 浏览器端限制：防止浏览器崩溃/ODOM 内存爆炸
export const MAX_SINGLE_IMAGE_BYTES = 20 * 1024 * 1024

// 单张图片最大像素边（防止 canvas / pdf-lib 因像素过大失败）
export const MAX_IMAGE_DIMENSION = 8000

// 默认 A4 尺寸（72 DPI 下 pdf-lib 的 PDFPoint）
// A4 = 595.28 x 841.89 pt
export const A4_WIDTH_PT = 595.28
export const A4_HEIGHT_PT = 841.89

// A4 模式下的页边距（pt）
export const A4_MARGIN_PT = 24

// 文件类型友好名称
export const TYPE_FRIENDLY_NAME: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
}

// 全站标题
export const SITE_TITLE = 'Image To PDF'
export const SITE_SUBTITLE = '免费在线图片转PDF工具'
export const SITE_PRIVACY_NOTE = '所有图片均在浏览器本地处理，不会上传服务器'
