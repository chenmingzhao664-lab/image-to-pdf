/**
 * pdf-lib 类型仅做类型提示，运行时 dynamic import
 * 支持：A4 / 原始尺寸 · 自动/横向/纵向 · 高清/普通/压缩 · 学习资料模式（页码+标题+日期）
 */

import type { PDFDocument as PDFDocType, PDFPage, PDFImage } from 'pdf-lib'
import {
  MAX_IMAGE_DIMENSION,
  A4_WIDTH_PT, A4_HEIGHT_PT,
  QUALITY_MAX_PX,
} from './constants'
import type { PdfSettings } from '../types'

export interface PdfResult {
  pdfBytes: Uint8Array
  pageCount: number
}

export interface ProcessStatus {
  current: number
  total: number
  fileName: string
  phase: 'loading-lib' | 'embedding' | 'saving'
}

type ProgressCallback = (status: ProcessStatus) => void

/** 读取图片并按质量等级压缩到 canvas（输出 JPEG blob） */
async function readImageForQuality(file: File, qualityLevel: string): Promise<{ blob: Blob, width: number, height: number }> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image()
      im.onload = () => res(im)
      im.onerror = () => rej(new Error(`无法读取图片 "${file.name}"`))
      im.src = url
    })

    if (img.naturalWidth > MAX_IMAGE_DIMENSION || img.naturalHeight > MAX_IMAGE_DIMENSION) {
      throw new Error(`图片 "${file.name}" 像素过大 (${img.naturalWidth}×${img.naturalHeight})，超过 ${MAX_IMAGE_DIMENSION}px`)
    }

    const maxPx = QUALITY_MAX_PX[qualityLevel] ?? 99999
    const ratio = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.round(img.naturalWidth * ratio)
    const h = Math.round(img.naturalHeight * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    // 白底（避免透明 PNG 转 JPEG 后变黑）
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)

    const blob: Blob = await new Promise((res) => {
      canvas.toBlob((b) => res(b as Blob), 'image/jpeg', 0.85)
    })
    return { blob, width: w, height: h }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** 根据方向 + 图片实际宽高决定页面 W/H */
function decidePageWH(settings: PdfSettings, imgW: number, imgH: number): [number, number] {
  if (settings.pageSize === 'a4') {
    let w = A4_WIDTH_PT
    let h = A4_HEIGHT_PT
    if (settings.orientation === 'landscape') [w, h] = [h, w]
    else if (settings.orientation === 'auto') {
      // 跟随图片长宽比
      if (imgW > imgH) [w, h] = [h, w]
    }
    return [w, h]
  }
  // 原始尺寸 = 图片尺寸
  let w = imgW
  let h = imgH
  if (settings.orientation === 'landscape' && imgW < imgH) [w, h] = [h, w]
  else if (settings.orientation === 'portrait' && imgW > imgH) [w, h] = [h, w]
  return [w, h]
}

/** 主入口 */
export async function imagesToPdf(
  files: File[],
  settings: PdfSettings,
  onProgress?: ProgressCallback,
): Promise<PdfResult> {
  onProgress?.({ current: 0, total: files.length, fileName: '', phase: 'loading-lib' })
  const pdfLib = await import('pdf-lib')
  const { PDFDocument, StandardFonts, rgb } = pdfLib
  const pdfDoc: PDFDocType = await PDFDocument.create()

  // 学习模式：标题
  let titleFont: Awaited<ReturnType<typeof pdfDoc.embedFont>> | null = null
  if (settings.study.enabled && (settings.study.pageTitle || settings.study.addPageNumbers)) {
    try {
      titleFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    } catch { /* 静默 */ }
  }

  const marginPt = 24 // 标准边距

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    onProgress?.({ current: i + 1, total: files.length, fileName: file.name, phase: 'embedding' })

    const { blob, width, height } = await readImageForQuality(file, settings.quality)
    const buf = await blob.arrayBuffer()
    const embedImg: PDFImage = await pdfDoc.embedJpg(buf)

    const [pageW, pageH] = decidePageWH(settings, width, height)
    const page: PDFPage = pdfDoc.addPage([pageW, pageH])

    // 留白（学习模式下顶部预留 50pt 给标题）
    const topReserve = settings.study.enabled && settings.study.pageTitle ? 50 : 0
    const bottomReserve = settings.study.enabled && settings.study.addPageNumbers ? 36 : 0
    const usableW = pageW - marginPt * 2
    const usableH = pageH - marginPt * 2 - topReserve - bottomReserve
    const scale = Math.min(usableW / width, usableH / height)
    const drawW = width * scale
    const drawH = height * scale
    page.drawImage(embedImg, {
      x: (pageW - drawW) / 2,
      y: (pageH - drawH) / 2 - bottomReserve / 2 + topReserve / 2,
      width: drawW,
      height: drawH,
    })

    // 学习模式：标题
    if (settings.study.enabled && settings.study.pageTitle && titleFont) {
      const fontSize = 14
      const text = settings.study.pageTitle
      const tw = titleFont.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: (pageW - tw) / 2,
        y: pageH - marginPt - 18,
        size: fontSize,
        font: titleFont,
        color: rgb(0.4, 0.4, 0.4),
      })
    }
    // 学习模式：日期
    if (settings.study.enabled && settings.study.pageDate && titleFont) {
      const fontSize = 10
      page.drawText(settings.study.pageDate, {
        x: marginPt,
        y: marginPt / 2 + 6,
        size: fontSize,
        font: titleFont,
        color: rgb(0.55, 0.55, 0.55),
      })
    }
    // 学习模式：页码
    if (settings.study.enabled && settings.study.addPageNumbers && titleFont) {
      const fontSize = 10
      const text = `${i + 1} / ${files.length}`
      const tw = titleFont.widthOfTextAtSize(text, fontSize)
      page.drawText(text, {
        x: pageW - marginPt - tw,
        y: marginPt / 2 + 6,
        size: fontSize,
        font: titleFont,
        color: rgb(0.55, 0.55, 0.55),
      })
    }
  }

  onProgress?.({ current: files.length, total: files.length, fileName: '', phase: 'saving' })
  const pdfBytes = await pdfDoc.save()
  return { pdfBytes, pageCount: files.length }
}

/** 估算 PDF 大小 */
export function estimatePdfSize(items: { size: number }[], settings: PdfSettings): number {
  const total = items.reduce((s, i) => s + i.size, 0)
  const ratio = settings.pageSize === 'original'
    ? 1.0
    : settings.quality === 'compressed' ? 0.4 : settings.quality === 'normal' ? 0.65 : 0.95
  return Math.round(total * ratio)
}

/** 友好文件大小 */
export function formatSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

/** 默认 PDF 设置 */
export function defaultPdfSettings(): PdfSettings {
  return {
    pageSize: 'a4',
    orientation: 'auto',
    quality: 'normal',
    study: {
      enabled: false,
      addPageNumbers: false,
      pageTitle: '',
      pageDate: '',
    },
  }
}
