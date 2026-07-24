/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 办公文档互转工具
 *
 * - Word → PDF: mammoth 解析 docx → jsPDF 渲染
 * - PDF  → Word: pdfjs 提取文本 → docx 构建
 * - Excel → PDF: xlsx 读 xlsx → jsPDF 表格渲染
 * - PDF  → Excel: pdfjs 提取文本+坐标 → xlsx 写入 cell
 *
 * 全部动态导入，首屏 bundle 不包含这些大库。
 */

export type ConvertDirection = 'word-to-pdf' | 'pdf-to-word' | 'excel-to-pdf' | 'pdf-to-excel'

export interface ConvertProgress {
  phase: 'loading-engine' | 'parsing' | 'rendering' | 'saving'
  percent?: number
  message?: string
}

type ProgressCb = (p: ConvertProgress) => void

export interface ConvertResult {
  bytes: Uint8Array
  ext: 'pdf' | 'docx' | 'xlsx'
  pageCount?: number
}

/** 通用转换入口 */
export async function convertFile(
  file: File,
  direction: ConvertDirection,
  onProgress?: ProgressCb,
): Promise<ConvertResult> {
  switch (direction) {
    case 'word-to-pdf': return wordToPdf(file, onProgress)
    case 'pdf-to-word': return pdfToWord(file, onProgress)
    case 'excel-to-pdf': return excelToPdf(file, onProgress)
    case 'pdf-to-excel': return pdfToExcel(file, onProgress)
  }
}

/** 根据 direction 推断应该接受的文件扩展名 */
export function getAcceptExt(direction: ConvertDirection): '.docx' | '.pdf' | '.xlsx' {
  switch (direction) {
    case 'word-to-pdf': return '.docx'
    case 'pdf-to-word': return '.pdf'
    case 'excel-to-pdf': return '.xlsx'
    case 'pdf-to-excel': return '.pdf'
  }
}

/** 根据 direction 推断生成的文件扩展名 */
export function getOutputExt(direction: ConvertDirection): 'pdf' | 'docx' | 'xlsx' {
  switch (direction) {
    case 'word-to-pdf': return 'pdf'
    case 'pdf-to-word': return 'docx'
    case 'excel-to-pdf': return 'pdf'
    case 'pdf-to-excel': return 'xlsx'
  }
}

/* ──────────────────── Word → PDF ──────────────────── */

async function wordToPdf(file: File, onProgress?: ProgressCb): Promise<ConvertResult> {
  onProgress?.({ phase: 'loading-engine', message: '加载 Word 解析引擎...' })

  const mammoth = await import('mammoth')
  const jsPdfMod = await import('jspdf')
  const JsPDF: any = (jsPdfMod as any).jsPDF ?? (jsPdfMod as any).default

  onProgress?.({ phase: 'parsing', message: '解析 Word 文档中...' })
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    { styleMap: ['p[style-name="Heading 1"] => h1:fresh', 'p[style-name="Heading 2"] => h2:fresh'] },
  )
  const html = result.value || '<p></p>'

  onProgress?.({ phase: 'rendering', message: '渲染 PDF 中...' })
  const doc = new JsPDF({ unit: 'pt', format: 'a4' })

  const pageWidth: number = doc.internal.pageSize.getWidth()
  const pageHeight: number = doc.internal.pageSize.getHeight()
  const margin = 40
  const usableWidth = pageWidth - margin * 2
  let y = margin

  const docBody = typeof DOMParser !== 'undefined'
    ? new DOMParser().parseFromString(html, 'text/html').body
    : null
  if (!docBody) throw new Error('当前环境不支持 DOMParser')

  const pushNewPage = () => { doc.addPage(); y = margin }

  const writeLine = (text: string, fontSize = 11, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, usableWidth) as string[]
    for (const line of lines) {
      if (y + fontSize > pageHeight - margin) pushNewPage()
      doc.text(line, margin, y + fontSize)
      y += fontSize * 1.35
    }
  }

  const walk = (node: ChildNode, opts: { size?: number; bold?: boolean } = {}) => {
    const size = opts.size ?? 11
    const bold = opts.bold ?? false
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (text.trim().length > 0) writeLine(text, size, bold)
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    const blockTags = new Set(['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'tr'])
    const isBlock = blockTags.has(tag)

    if (tag === 'h1') { writeLine('', 6); walkChildren(el, { size: 18, bold: true }); writeLine('', 4); return }
    if (tag === 'h2') { writeLine('', 4); walkChildren(el, { size: 15, bold: true }); writeLine('', 3); return }
    if (tag === 'h3') { writeLine('', 3); walkChildren(el, { size: 13, bold: true }); writeLine('', 2); return }
    if (tag === 'br') { y += size * 0.8; return }
    if (tag === 'img') return
    if (tag === 'table') {
      const rows = el.querySelectorAll('tr')
      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll('th,td'))
        const isHeaderRow = Array.from(row.querySelectorAll('th')).length > 0
        const text = cells.map((c) => (c.textContent || '').trim()).filter(Boolean).join('  |  ')
        if (text) writeLine(text, 10, isHeaderRow)
        writeLine('', 4)
      })
      return
    }
    walkChildren(el, opts)
    if (isBlock) y += size * 0.3
  }
  const walkChildren = (el: HTMLElement, opts: { size?: number; bold?: boolean } = {}) => {
    el.childNodes.forEach((n) => walk(n, opts))
  }

  Array.from(docBody.childNodes).forEach((n) => walk(n))

  onProgress?.({ phase: 'saving', message: '保存 PDF...' })
  const ab = doc.output('arraybuffer') as ArrayBuffer
  return { bytes: new Uint8Array(ab), ext: 'pdf' }
}

/* ──────────────────── PDF → Word ──────────────────── */

async function pdfToWord(file: File, onProgress?: ProgressCb): Promise<ConvertResult> {
  onProgress?.({ phase: 'loading-engine', message: '加载 PDF 解析引擎...' })

  const pdfjs: any = await import('pdfjs-dist')
  const workerVersion = (pdfjs as any).version || '6.1.200'
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`

  onProgress?.({ phase: 'parsing', message: '解析 PDF 中...' })
  const data = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data }).promise

  const docxMod: any = await import('docx')
  const { Document, Packer, Paragraph, TextRun } = docxMod

  const sections: any[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress?.({
      phase: 'parsing',
      percent: Math.round((i / doc.numPages) * 70),
      message: `解析第 ${i}/${doc.numPages} 页...`,
    })
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    const lines = new Map<number, { text: string; x: number }[]>()
    for (const item of content.items as any[]) {
      const str = item.str ?? ''
      const y = Math.round(item.transform[5])
      const x = item.transform[4]
      const key = findLineKey(lines, y)
      if (!lines.has(key)) lines.set(key, [])
      lines.get(key)!.push({ text: str, x })
    }

    const sortedKeys = Array.from(lines.keys()).sort((a, b) => b - a)
    for (const k of sortedKeys) {
      const parts = lines.get(k)!.sort((a, b) => a.x - b.x)
      const text = parts.map((p) => p.text).join('')
      if (text.trim().length === 0) {
        sections.push(new Paragraph({ children: [] }))
        continue
      }
      sections.push(new Paragraph({ children: [new TextRun({ text })] }))
    }
    if (i < doc.numPages) sections.push(new Paragraph({ children: [new TextRun({ text: '', break: 1 })] }))
  }

  onProgress?.({ phase: 'rendering', percent: 80, message: '构建 Word 文档...' })
  const wordDoc = new Document({ sections: [{ properties: {}, children: sections }] })

  onProgress?.({ phase: 'saving', message: '保存 docx...' })
  const blob = await Packer.toBlob(wordDoc)
  const bytes = new Uint8Array(await blob.arrayBuffer())
  return { bytes, ext: 'docx', pageCount: doc.numPages }
}

/* ──────────────────── Excel → PDF ──────────────────── */

async function excelToPdf(file: File, onProgress?: ProgressCb): Promise<ConvertResult> {
  onProgress?.({ phase: 'loading-engine', message: '加载 Excel 解析引擎...' })

  const XLSX: any = await import('xlsx')
  const jsPdfMod = await import('jspdf')
  const JsPDF: any = (jsPdfMod as any).jsPDF ?? (jsPdfMod as any).default

  onProgress?.({ phase: 'parsing', message: '解析 Excel 中...' })
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: 'array' })

  const jsDoc = new JsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth: number = jsDoc.internal.pageSize.getWidth()
  const pageHeight: number = jsDoc.internal.pageSize.getHeight()
  const margin = 30
  let y = margin

  const sheetCount = workbook.SheetNames.length
  workbook.SheetNames.forEach((sheetName: string, sIdx: number) => {
    onProgress?.({
      phase: 'rendering',
      percent: Math.round(((sIdx + 1) / sheetCount) * 80),
      message: `渲染工作表 ${sIdx + 1}/${sheetCount}：${sheetName}`,
    })

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) return

    // 新工作表另起一页
    if (sIdx > 0) { jsDoc.addPage(); y = margin }

    // 工作表名作为标题
    jsDoc.setFont('helvetica', 'bold')
    jsDoc.setFontSize(15)
    jsDoc.text(sheetName, margin, y + 15)
    y += 26

    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1')
    const cols: number[] = []
    // 估算列宽
    for (let c = range.s.c; c <= range.e.c; c++) {
      let maxLen = 4
      for (let r = range.s.r; r <= range.e.r; r++) {
        const addr = XLSX.utils.encode_cell({ r, c })
        const cell = sheet[addr]
        if (cell && cell.v != null) {
          const len = String(cell.v).length
          if (len > maxLen) maxLen = len
        }
      }
      cols.push(Math.min(maxLen * 7 + 8, 200))
    }
    const totalColsWidth = cols.reduce((a, b) => a + b, 0)
    let xStart = margin
    // 表格太宽时缩放
    const availWidth = pageWidth - margin * 2
    const scale = totalColsWidth > availWidth ? availWidth / totalColsWidth : 1
    const scaledCols = cols.map((w) => w * scale)
    const rowHeight = 14

    // 表头
    for (let r = range.s.r; r <= range.e.r; r++) {
      if (y + rowHeight > pageHeight - margin) { jsDoc.addPage(); y = margin }
      let x = xStart
      const isHeader = r === range.s.r
      jsDoc.setFont('helvetica', isHeader ? 'bold' : 'normal')
      jsDoc.setFontSize(9)

      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c })
        const cell = sheet[addr]
        const text = cell && cell.v != null ? String(cell.v) : ''
        const truncated = text.length > 30 ? text.slice(0, 28) + '…' : text
        jsDoc.rect(x, y, scaledCols[c - range.s.c]!, rowHeight, 'S')
        jsDoc.text(truncated, x + 2, y + 10)
        x += scaledCols[c - range.s.c]!
      }
      y += rowHeight
    }
  })

  onProgress?.({ phase: 'saving', message: '保存 PDF...' })
  const ab = jsDoc.output('arraybuffer') as ArrayBuffer
  return { bytes: new Uint8Array(ab), ext: 'pdf', pageCount: sheetCount }
}

/* ──────────────────── PDF → Excel ──────────────────── */

async function pdfToExcel(file: File, onProgress?: ProgressCb): Promise<ConvertResult> {
  onProgress?.({ phase: 'loading-engine', message: '加载 PDF 解析引擎...' })

  const pdfjs: any = await import('pdfjs-dist')
  const workerVersion = (pdfjs as any).version || '6.1.200'
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.mjs`

  const XLSX: any = await import('xlsx')

  onProgress?.({ phase: 'parsing', message: '解析 PDF 中...' })
  const data = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data }).promise

  const workbook = XLSX.utils.book_new()

  for (let i = 1; i <= doc.numPages; i++) {
    onProgress?.({
      phase: 'parsing',
      percent: Math.round((i / doc.numPages) * 70),
      message: `解析第 ${i}/${doc.numPages} 页...`,
    })
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    // 按 y 聚类 → 每行
    const rowMap = new Map<number, { x: number; text: string }[]>()
    for (const item of content.items as any[]) {
      const str = item.str ?? ''
      if (!str) continue
      const y = Math.round(item.transform[5])
      const x = item.transform[4]
      const key = findLineKey(rowMap, y)
      if (!rowMap.has(key)) rowMap.set(key, [])
      rowMap.get(key)!.push({ x, text: str })
    }

    // 排序 → 二维数组
    const sortedYs = Array.from(rowMap.keys()).sort((a, b) => b - a)
    const rows: string[][] = []
    for (const y of sortedYs) {
      const cells = rowMap.get(y)!.sort((a, b) => a.x - b.x)
      // 同行邻近文本合并到一个 cell
      const merged: { x: number; text: string }[] = []
      for (const c of cells) {
        const last = merged[merged.length - 1]
        if (last && c.x - (last.x + last.text.length * 4) < 15) {
          last.text += ' ' + c.text
        } else {
          merged.push({ ...c })
        }
      }
      rows.push(merged.map((m) => m.text))
    }

    const sheet = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['']])
    const sheetName = `Page${i}`.slice(0, 31) // Excel sheet 名 ≤ 31 char
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  }

  onProgress?.({ phase: 'rendering', percent: 80, message: '构建 Excel...' })
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer

  onProgress?.({ phase: 'saving', message: '保存 xlsx...' })
  return { bytes: new Uint8Array(wbout), ext: 'xlsx', pageCount: doc.numPages }
}

/* ──────────────────── 工具 ──────────────────── */

function findLineKey(lines: Map<number, any[]>, y: number, tol = 3): number {
  for (const k of Array.from(lines.keys())) {
    if (Math.abs(k - y) <= tol) return k
  }
  return y
}
