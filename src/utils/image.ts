/**
 * 浏览器原生图片处理工具
 * 所有操作在用户浏览器本地完成，不上传任何数据到服务器。
 */

/**
 * 将 File 对象读取为 HTMLImageElement
 * 返回 { url, naturalWidth, naturalHeight }，务必在完成后释放 URL
 */
export function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`无法解码图片: ${file.name}`))
    }
    img.src = url
  })
}

/**
 * 验证图片是否超出尺寸限制
 */
export function isImageTooLarge(img: HTMLImageElement, maxDimension: number): boolean {
  return img.naturalWidth > maxDimension || img.naturalHeight > maxDimension
}

/**
 * 从 File 生成缩略图 data URL（用于列表预览）
 * maxWidth=200，保持宽高比
 */
export function generateThumbnail(file: File, maxWidth = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = maxWidth / img.naturalWidth
      canvas.width = maxWidth
      canvas.height = Math.round(img.naturalHeight * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D 上下文不可用'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('缩略图生成失败'))
    }
    img.src = url
  })
}
