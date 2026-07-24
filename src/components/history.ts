import { useEffect, useState } from 'react'
import { LS_HISTORY_KEY, HISTORY_MAX_ITEMS } from '../utils/constants'
import type { DownloadRecord } from '../types'

function loadHistory(): DownloadRecord[] {
  try {
    const raw = localStorage.getItem(LS_HISTORY_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as DownloadRecord[]
    return arr.slice(0, HISTORY_MAX_ITEMS)
  } catch { return [] }
}

function saveHistory(list: DownloadRecord[]) {
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX_ITEMS)))
  } catch { /* quota */ }
}

export function pushHistory(rec: DownloadRecord) {
  const list = [rec, ...loadHistory()].slice(0, HISTORY_MAX_ITEMS)
  saveHistory(list)
}

export function clearHistory() {
  saveHistory([])
}

export function useHistory(): [DownloadRecord[], () => void, () => void] {
  const [items, setItems] = useState<DownloadRecord[]>([])
  const refresh = () => setItems(loadHistory())
  const clearAll = () => { saveHistory([]); setItems([]) }
  useEffect(() => { refresh() }, [])
  return [items, refresh, clearAll]
}
