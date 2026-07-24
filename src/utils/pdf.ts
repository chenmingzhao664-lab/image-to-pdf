/**
 * pdf-lib 类型仅做类型提示，运行时 dynamic import
 * 扩展支持：Letter / 横竖版 / 边距等级 / 质量分级
 */

import type { PDFDocument as PDFDocType, PDFPage, PDFImage } from 'pdf-lib'
import { readFileAsImage, isImageTooLarge } from './image'
import {
  MAX_IMAGE_DIMENSION,
  A4_WIDTH_PT, A4_HEIGHT_PT,
  LETTER_WIDTH_PT, LETTER_HEIGHT_PT,
  MARGIN_PT,
} from './constants'
import type { PdfSettings } from '../types'

export type PdfFitMode = 'a4' | 'original'

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

/** 根据设置获取页面宽高（pt） */
function getPageSize(settings: PdfSettings): [number, number] {
  let w: number, h: number
  switch (settings.pageSize) {
    case 'a4':
      w = A4_WIDTH_PT; h = A4_HEIGHT_PT; break
    case 'letter':
      w = LETTER_WIDTH_PT; h = LETTER_HEIGHT_PT; break
    case 'original':
      return [0, 0] // 占位符，实际动态计算
    default:
      w = A4_WIDTH_PT; h = A4_HEIGHT_PT
  }
  if (settings.orientation === 'landscape') [w, h] = [h, w]
  return [w, h]
}

/** 根据文件类型从 pdf-lib 嵌入图片 */
async function embedImage(pdfDoc: PDFDocType, file: File): Promise<PDFImage> {
  const buf = await file.arrayBuffer()
  if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
    return pdfDoc.embedJpg(buf)
  }
  return pdfDoc.embedPng(buf)
}

/**
 * 将多张图片合并为 PDF（支持完整设置）
 *
 * @param files    图片文件列表
 * @param settings 详细设置
 * @param onProgress 进度回调
 */
export async function imagesToPdf(
  files: File[],
  settings: PdfSettings,
  onProgress?: ProgressCallback,
): Promise<PdfResult> {
  onProgress?.({ current: 0, total: files.length, fileName: '', phase: 'loading-lib' })

  const pdfLib = await import('pdf-lib')
  const { PDFDocument } = pdfLib
  const pdfDoc: PDFDocType = await PDFDocument.create()

  const marginPt = MARGIN_PT[settings.margin] ?? 36

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    onProgress?.({ current: i + 1, total: files.length, fileName: file.name, phase: 'embedding' })

    const img = await readFileAsImage(file)
    if (isImageTooLarge(img, MAX_IMAGE_DIMENSION)) {
      throw new Error(
        `图片 "${file.name}" 像素尺寸过大 (${img.naturalWidth}×${img.naturalHeight})，超过 ${MAX_IMAGE_DIMENSION}px 限制。`,
      )
    }

    const embedImg = await embedImage(pdfDoc, file)
    const imgW = embedImg.width
    const imgH = embedImg.height

    // 计算页面尺寸
    let pageW: number, pageH: number
    const [baseW, baseH] = getPageSize(settings)

    if (settings.pageSize === 'original') {
      // 原始尺寸模式：页面 = 图片比例 + 边距
      if (settings.orientation === 'landscape' && imgW < imgH) {
        ;[pageW, pageH] = [imgH, imgW]
      } else {
        pageW = imgW
        pageH = imgH
      }
      // 加上边距
      pageW += marginPt * 2
      pageH += marginPt * 2
    } else {
      pageW = baseW
      pageH = baseH
    }

    // 绘制区域
    const usableW = pageW - marginPt * 2
    const usableH = pageH - marginPt * 2

    let drawW: number, drawH: number
    if (settings.imageFit === 'fill') {
      // 铺满页面（不留白，可能裁剪）
      const s = Math.max(usableW / imgW, usableH / imgH)
      drawW = imgW * s
      drawH = imgH * s
    } else {
      // contain = 完整显示（留白居中，默认）
      const s = Math.min(usableW / imgW, usableH / imgH)
      drawW = imgW * s
      drawH = imgH * s
    }

    const offsetX = (pageW - drawW) / 2
    const offsetY = (pageH - drawH) / 2

    const page: PDFPage = pdfDoc.addPage([pageW, pageH])
    page.drawImage(embedImg, {
      x: offsetX,
      y: offsetY,
      width: drawW,
      height: drawH,
    })
  }

  onProgress?.({ current: files.length, total: files.length, fileName: '', phase: 'saving' })
  const pdfBytes = await pdfDoc.save()
  return { pdfBytes, pageCount: files.length }
}

/**
 * 估算 PDF 大小（基于图片总大小 + 30% PDF 容器开销）
 * mode: 'original' = 1.05x, 'a4'/'letter' = 0.85x（压缩缩略）
 */
export function estimatePdfSize(items: { size: number }[], settings: PdfSettings): number {
  const total = items.reduce((s, i) => s + i.size, 0)
  const ratio = settings.pageSize === 'original' ? 1.05 : 0.85
  return Math.round(total * ratio)
}

export function formatSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

/** 默认 PDF 设置 */
export function defaultPdfSettings() {
  return {
    pageSize: 'a4' as const,
    orientation: 'portrait' as const,
    imageFit: 'contain' as const,
    margin: 'medium' as const,
    quality: 'standard' as const,
  }
}