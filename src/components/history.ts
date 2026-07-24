import type { DownloadRecord } from '../types'
import { LS_HISTORY_KEY, HISTORY_MAX_ITEMS } from '../utils/constants'

export function pushHistory(r: DownloadRecord): void {
  try {
    const arr = readHistory()
    arr.unshift(r)
    while (arr.length > HISTORY_MAX_ITEMS) arr.pop()
    const slim = arr.map(({ id, fileName, fileSize, pageCount, createdAt }) => ({ id, fileName, fileSize, pageCount, createdAt }))
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(slim))
    window.dispatchEvent(new CustomEvent('history-changed'))
  } catch { /* ignore */ }
}

export function readHistory(): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as DownloadRecord[]
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}

export function clearHistory(): void {
  localStorage.removeItem(LS_HISTORY_KEY)
  window.dispatchEvent(new CustomEvent('history-changed'))
}
