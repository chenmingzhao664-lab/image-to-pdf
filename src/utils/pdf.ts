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

/** 在 canvas 上渲染中文文本（浏览器原生字体），返回 PNG Uint8Array + 实际宽高 */
async function renderTextToCanvas(
  text: string,
  fontSize: number,
  color: string,
  maxWidth: number,
): Promise<{ buffer: Uint8Array; width: number; height: number }> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const fontStr = `${fontSize}px "PingFang SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif`
  ctx.font = fontStr
  const m = ctx.measureText(text)
  const tw = Math.min(Math.ceil(m.width), maxWidth)
  const th = Math.ceil(fontSize * 1.35) + 4
  canvas.width = Math.max(tw + 8, 1)
  canvas.height = Math.max(th, 1)
  const ctx2 = canvas.getContext('2d')!
  ctx2.font = fontStr
  ctx2.fillStyle = color
  ctx2.textBaseline = 'middle'
  ctx2.fillText(text, 4, canvas.height / 2)
  return new Promise((res, rej) => {
    canvas.toBlob(async (blob) => {
      if (!blob) return rej(new Error('canvas toBlob failed'))
      res({ buffer: new Uint8Array(await blob.arrayBuffer()), width: canvas.width, height: canvas.height })
    }, 'image/png')
  })
}

/** 主入口 */
export async function imagesToPdf(
  files: File[],
  settings: PdfSettings,
  onProgress?: ProgressCallback,
): Promise<PdfResult> {
  onProgress?.({ current: 0, total: files.length, fileName: '', phase: 'loading-lib' })
  const pdfLib = await import('pdf-lib')
  const { PDFDocument } = pdfLib
  const pdfDoc: PDFDocType = await PDFDocument.create()

  // 学习模式：标题/日期/页码使用 canvas 绘制中文后嵌入为 PNG（绕过 pdf-lib 中文字体限制）
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

    // 学习模式：标题（canvas 渲染中文 → PNG 嵌入）
    if (settings.study.enabled && settings.study.pageTitle) {
      const titleRes = await renderTextToCanvas(settings.study.pageTitle, 14, '#666666', pageW - marginPt * 2)
      const pngImg = await pdfDoc.embedPng(titleRes.buffer)
      page.drawImage(pngImg, {
        x: (pageW - titleRes.width) / 2,
        y: pageH - marginPt - titleRes.height - 4,
        width: titleRes.width,
        height: titleRes.height,
      })
    }
    // 学习模式：日期（canvas 渲染中文 → PNG 嵌入）
    if (settings.study.enabled && settings.study.pageDate) {
      const dateRes = await renderTextToCanvas(settings.study.pageDate, 10, '#888888', pageW * 0.4)
      const pngImg = await pdfDoc.embedPng(dateRes.buffer)
      page.drawImage(pngImg, {
        x: marginPt,
        y: marginPt / 2,
        width: dateRes.width,
        height: dateRes.height,
      })
    }
    // 学习模式：页码（canvas 渲染 → PNG 嵌入）
    if (settings.study.enabled && settings.study.addPageNumbers) {
      const pageText = `${i + 1} / ${files.length}`
      const pageRes = await renderTextToCanvas(pageText, 10, '#888888', pageW * 0.3)
      const pngImg = await pdfDoc.embedPng(pageRes.buffer)
      page.drawImage(pngImg, {
        x: pageW - marginPt - pageRes.width,
        y: marginPt / 2,
        width: pageRes.width,
        height: pageRes.height,
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
