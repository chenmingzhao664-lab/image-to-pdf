/**
 * 图片转 Excel 工具
 * - Tesseract.js：浏览器端 OCR（WebAssembly，不上传图片）
 * - SheetJS (xlsx)：浏览器端生成 .xlsx
 * 两个库都通过 dynamic import 加载，不进入首屏 bundle。
 */
import { readFileAsImage, isImageTooLarge } from './image'
import { MAX_IMAGE_DIMENSION } from './constants'

export interface OcrProgress {
  current: number
  total: number
  fileName: string
  phase: 'loading-ocr' | 'recognizing' | 'generating-xlsx'
  percent?: number
}

type ProgressCallback = (p: OcrProgress) => void

/** Tesseract 支持的语言包组合 */
export type OcrLang = 'chi_sim' | 'chi_tra' | 'eng' | 'chi_sim+eng' | 'chi_tra+eng'

export interface ImageToExcelOptions {
  /** OCR 语言，默认 'chi_sim+eng'（简中+英文混排） */
  lang?: OcrLang
  /** 是否尝试智能检测表格结构（基于空白行/列对齐） */
  detectTable?: boolean
}

/** 单张图片的 OCR 结果 */
export interface OcrPageResult {
  fileName: string
  /** 识别出的所有文本（按行分隔） */
  text: string
  /** 智能切割后的二维表格数据，每行一个数组（如果 detectTable=true） */
  rows: string[][]
}

/**
 * 把多张图片 OCR 后合并为一个 Excel 文件
 *
 * @param files       图片文件列表
 * @param options     OCR 选项
 * @param onProgress  进度回调
 * @returns           { xlsxBytes, sheetCount }
 */
export async function imagesToExcel(
  files: File[],
  options: ImageToExcelOptions = {},
  onProgress?: ProgressCallback,
): Promise<{ xlsxBytes: Uint8Array; sheetCount: number }> {
  const lang = options.lang ?? 'chi_sim+eng'
  const detectTable = options.detectTable ?? true

  // 1. 动态加载 Tesseract.js
  onProgress?.({ current: 0, total: files.length, fileName: '', phase: 'loading-ocr' })
  const Tesseract = await import('tesseract.js')

  // 2. 智能识别每张图片
  const pages: OcrPageResult[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    onProgress?.({
      current: i + 1,
      total: files.length,
      fileName: file.name,
      phase: 'recognizing',
      percent: 0,
    })

    // 像素尺寸校验
    const img = await readFileAsImage(file)
    if (isImageTooLarge(img, MAX_IMAGE_DIMENSION)) {
      throw new Error(
        `图片 "${file.name}" 像素尺寸过大 ` +
        `(${img.naturalWidth}×${img.naturalHeight})，` +
        `超过 ${MAX_IMAGE_DIMENSION}px 限制，请压缩后重试。`,
      )
    }

    // 调用 Tesseract.js 识别（在 Web Worker 中执行，不阻塞 UI）
    const { data } = await Tesseract.recognize(file, lang, {
      logger: (info: { status: string; progress?: number }) => {
        if (info.status === 'recognizing text' && typeof info.progress === 'number') {
          onProgress?.({
            current: i + 1,
            total: files.length,
            fileName: file.name,
            phase: 'recognizing',
            percent: Math.round(info.progress * 100),
          })
        }
      },
    })

    const text = (data?.text ?? '').trim()
    const rows = detectTable ? parseTableFromText(text) : text.split('\n').map((l: string) => [l])
    pages.push({ fileName: file.name, text, rows })
  }

  // 3. 动态加载 SheetJS 并生成 xlsx
  onProgress?.({ current: files.length, total: files.length, fileName: '', phase: 'generating-xlsx' })
  const XLSX = await import('xlsx')

  const workbook = XLSX.utils.book_new()

  // 多张图：每张图一个 sheet；单张图：单 sheet 名为 "Sheet1"
  if (pages.length === 1) {
    const ws = XLSX.utils.aoa_to_sheet(pages[0]!.rows)
    XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1')
  } else {
    pages.forEach((p, idx) => {
      const ws = XLSX.utils.aoa_to_sheet(p.rows)
      // Excel sheet 名 ≤ 31 字符，不能含 : \ / ? * [ ]
      const safeName = sanitizeSheetName(p.fileName) || `Sheet${idx + 1}`
      XLSX.utils.book_append_sheet(workbook, ws, safeName)
    })
  }

  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const xlsxBytes = out instanceof Uint8Array ? out : new Uint8Array(out)

  return { xlsxBytes, sheetCount: pages.length }
}

/**
 * 把 OCR 文本智能切割成二维表格：
 * - 每一行先按"两个以上空格 / 制表符"切（识别列）
 * - 若一行中只有单空格，尝试按"对齐列"切（暂留 fallback：~ 单列）
 * - 空行保留作为表格行分隔
 */
function parseTableFromText(text: string): string[][] {
  const lines = text.split('\n')
  return lines.map((line) => {
    const trimmed = line.replace(/\r/g, '')
    // 优先按 2+ 空格 / 制表符 切（Tesseract 对表格列常用 2 空格分隔）
    if (/\t/.test(trimmed) || / {2,}/.test(trimmed)) {
      return trimmed
        .split(/\t| {2,}/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    }
    // fallback：单列
    return [trimmed.trim()].filter((c) => c.length > 0)
  })
}

/** Excel sheet 名合规化：≤31 字符，移除非法字符 */
function sanitizeSheetName(name: string): string {
  const base = name.replace(/\.[^.]+$/, '')
  const cleaned = base.replace(/[:\\/?*[\]]/g, '_').trim()
  return cleaned.length > 31 ? cleaned.slice(0, 31) : cleaned
}
