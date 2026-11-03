import type { ActiveSession, PastSession } from './types'

export const lastExportKey = 'pap_last_export'

type BackupHistoryEntry = { id: string; savedAt: number; date: string; topic: string; blocks: number; focus: number; energy: number }
export type Preferences = { soundOn: boolean; restMinutes: number; theme: 'dark' | 'light' }
export type BackupFile = { app: 'pap'; version: 1; exportedAt: string; history: BackupHistoryEntry[]; state: ActiveSession; preferences?: Preferences }

export function createBackup(history: PastSession[], state: ActiveSession, preferences: Preferences): BackupFile {
  return { app: 'pap', version: 1, exportedAt: new Date().toISOString(), history: history.map((entry) => ({ id: entry.id, savedAt: entry.savedAt, date: entry.date, topic: entry.topic, blocks: entry.completedBlocks, focus: entry.focusMinutes ?? 1, energy: entry.energy })), state, preferences }
}

export function validateBackup(value: unknown): { backup: BackupFile; invalid: number } | { error: string } {
  if (!value || typeof value !== 'object') return { error: 'This file is not a PAP backup.' }
  const raw = value as Partial<BackupFile>
  if (raw.app !== 'pap' || raw.version !== 1 || !Array.isArray(raw.history)) return { error: 'This file is not a valid PAP v1 backup.' }
  let invalid = 0
  const history: BackupHistoryEntry[] = []
  for (const entry of raw.history) {
    if (!entry || typeof entry !== 'object') { invalid++; continue }
    const item = entry as Partial<BackupHistoryEntry>
    const blocks = item.blocks
    const focus = item.focus
    const savedAt = item.savedAt
    if (typeof item.id !== 'string' || !item.id || typeof item.date !== 'string' || typeof blocks !== 'number' || !Number.isInteger(blocks) || blocks < 0 || blocks > 10 || typeof focus !== 'number' || !Number.isInteger(focus) || focus < 1 || focus > 240) { invalid++; continue }
    const energy = typeof item.energy === 'number' && Number.isInteger(item.energy) && item.energy >= 0 && item.energy <= 5 ? item.energy : 0
    history.push({ id: item.id, date: item.date, topic: typeof item.topic === 'string' ? item.topic : 'Untitled study session', blocks, focus, energy, savedAt: typeof savedAt === 'number' && Number.isInteger(savedAt) ? savedAt : Date.parse(item.date) || Date.now() })
  }
  if (raw.history.length > 0 && history.length === 0) return { error: 'This backup has no valid session entries.' }
  return { backup: { app: 'pap', version: 1, exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(), history, state: raw.state as ActiveSession, preferences: raw.preferences as Preferences | undefined }, invalid }
}

export function mergeHistory(local: PastSession[], imported: BackupHistoryEntry[]) {
  const existing = new Set(local.map((entry) => entry.id))
  let duplicates = 0
  const additions: PastSession[] = []
  for (const entry of imported) {
    if (existing.has(entry.id)) { duplicates++; continue }
    existing.add(entry.id)
    additions.push({ id: entry.id, savedAt: entry.savedAt, date: entry.date, topic: entry.topic, completedBlocks: entry.blocks, focusMinutes: entry.focus, energy: entry.energy })
  }
  return { history: [...local, ...additions].sort((a, b) => a.savedAt - b.savedAt), imported: additions.length, duplicates }
}

export function isActiveSession(value: unknown): value is ActiveSession {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<ActiveSession>
  return typeof state.id === 'string' && typeof state.topic === 'string' && Array.isArray(state.recall) && typeof state.activeBlockId === 'string' && Array.isArray(state.completedBlockIds) && typeof state.remainingSeconds === 'number' && typeof state.running === 'boolean' && typeof state.startedAt === 'number'
}

export function isPreferences(value: unknown): value is Preferences {
  if (!value || typeof value !== 'object') return false
  const preferences = value as Partial<Preferences>
  const restMinutes = preferences.restMinutes
  return typeof preferences.soundOn === 'boolean' && typeof restMinutes === 'number' && Number.isInteger(restMinutes) && [10, 15, 20, 25, 30].includes(restMinutes) && (preferences.theme === 'dark' || preferences.theme === 'light')
}
