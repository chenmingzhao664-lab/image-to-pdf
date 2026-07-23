/**
 * PDF 生成工具
 * 使用 pdf-lib + 浏览器原生 API，所有操作在浏览器本地完成。
 */
import { PDFDocument, PDFImage } from 'pdf-lib'
import { readFileAsImage, isImageTooLarge } from './image'
import {
  MAX_IMAGE_DIMENSION,
  A4_WIDTH_PT,
  A4_HEIGHT_PT,
  A4_MARGIN_PT,
} from './constants'

/** 输出模式：A4 适配 或 原始比例 */
export type PdfFitMode = 'a4' | 'original'

/** 生成结果 */
export interface PdfResult {
  pdfBytes: Uint8Array
  pageCount: number
}

/** 处理中的图片状态（用于进度提示） */
export interface ProcessStatus {
  current: number
  total: number
  fileName: string
}

type ProgressCallback = (status: ProcessStatus) => void

/**
 * 将多张图片合并为一个 PDF
 *
 * @param files      用户选择的图片文件列表，顺序即页面顺序
 * @param fitMode    'a4' = 每页 A4 适配（留边距、居中）；'original' = 原始比例
 * @param onProgress 可选进度回调
 * @returns          { pdfBytes, pageCount }
 */
export async function imagesToPdf(
  files: File[],
  fitMode: PdfFitMode = 'original',
  onProgress?: ProgressCallback,
): Promise<PdfResult> {
  const pdfDoc = await PDFDocument.create()

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    onProgress?.({ current: i + 1, total: files.length, fileName: file.name })

    // 校验像素尺寸
    const img = await readFileAsImage(file)
    if (isImageTooLarge(img, MAX_IMAGE_DIMENSION)) {
      throw new Error(
        `图片 "${file.name}" 像素尺寸过大 ` +
        `(${img.naturalWidth}×${img.naturalHeight})，` +
        `超过 ${MAX_IMAGE_DIMENSION}px 限制，请压缩后重试。`,
      )
    }

    // 嵌入图片到 PDF
    const embedImg = await embedImage(pdfDoc, file)
    const imgW = embedImg.width
    const imgH = embedImg.height

    // 计算页面尺寸 + 绘制参数
    let pageW: number
    let pageH: number
    let drawW: number
    let drawH: number
    let offsetX = 0
    let offsetY = 0

    if (fitMode === 'a4') {
      const usableW = A4_WIDTH_PT - A4_MARGIN_PT * 2
      const usableH = A4_HEIGHT_PT - A4_MARGIN_PT * 2
      const scale = Math.min(usableW / imgW, usableH / imgH)
      drawW = imgW * scale
      drawH = imgH * scale
      pageW = A4_WIDTH_PT
      pageH = A4_HEIGHT_PT
      offsetX = (pageW - drawW) / 2
      offsetY = (pageH - drawH) / 2
    } else {
      drawW = imgW
      drawH = imgH
      pageW = imgW
      pageH = imgH
    }

    const page = pdfDoc.addPage([pageW, pageH])
    page.drawImage(embedImg, {
      x: offsetX,
      y: offsetY,
      width: drawW,
      height: drawH,
    })
  }

  const pdfBytes = await pdfDoc.save()
  return { pdfBytes, pageCount: files.length }
}

/**
 * 根据 MIME 类型把图片嵌入 PDFDocument，返回 PDFImage
 */
async function embedImage(pdfDoc: PDFDocument, file: File): Promise<PDFImage> {
  if (file.type === 'image/png') {
    const buf = await file.arrayBuffer()
    return await pdfDoc.embedPng(buf)
  }
  if (file.type === 'image/webp') {
    const pngBuffer = await webpToPng(file)
    return await pdfDoc.embedPng(pngBuffer)
  }
  // JPG / JPEG 走 embedJpg
  const buf = await file.arrayBuffer()
  return await pdfDoc.embedJpg(buf)
}

/**
 * WebP → PNG 转换（通过 Canvas，绕开 pdf-lib 不支持 WebP 的限制）
 */
async function webpToPng(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D 上下文不可用')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b)
      else reject(new Error('Canvas 转 PNG Blob 失败'))
    }, 'image/png')
  })
  return new Uint8Array(await blob.arrayBuffer())
}
