import { allBlocks } from './data/protocol'
import type { ActiveSession, AppStorage, EquationAnswers, PastSession } from './types'

const storageKey = 'pap-v2-data'

const blankAnswers = (): EquationAnswers => ({ variables: '', units: '', relationships: '', geometry: '', meaning: '' })

export const newSession = (): ActiveSession => ({
  id: crypto.randomUUID(),
  topic: '',
  recall: ['', '', ''],
  stageId: 'activation',
  activeBlockId: allBlocks[0].id,
  completedBlockIds: [],
  remainingSeconds: allBlocks[0].minutes * 60,
  running: false,
  endsAt: null,
  equationAnswers: blankAnswers(),
  startedAt: Date.now(),
  extensions: {},
  rest: null,
  sessionComplete: false,
})

export const initialStorage = (): AppStorage => ({ activeSession: newSession(), history: [], theme: 'dark' })

export function loadStorage(): AppStorage {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return initialStorage()
    const parsed = JSON.parse(saved) as Partial<AppStorage>
    const rawHistory = Array.isArray(parsed.history) ? parsed.history : []
    let migrated = false
    const history = rawHistory.map((entry) => {
      const savedAt = Number.isInteger(entry.savedAt) ? entry.savedAt : Date.now()
      const id = typeof entry.id === 'string' && entry.id ? entry.id : crypto.randomUUID()
      if (savedAt !== entry.savedAt || id !== entry.id) migrated = true
      const energy = Number.isInteger(entry.energy) && entry.energy >= 0 && entry.energy <= 5 ? entry.energy : 0
      if (energy !== entry.energy) migrated = true
      return { ...entry, id, savedAt, energy } as PastSession
    })
    const data = {
      activeSession: { ...newSession(), ...parsed.activeSession, equationAnswers: { ...blankAnswers(), ...parsed.activeSession?.equationAnswers } },
      history,
      theme: parsed.theme ?? 'dark',
    }
    if (migrated) saveStorage(data)
    return data
  } catch {
    return initialStorage()
  }
}

export function saveStorage(data: AppStorage) {
  try { localStorage.setItem(storageKey, JSON.stringify(data)) } catch { /* Storage is optional. */ }
}

export const resolveRemaining = (session: ActiveSession, now = Date.now()) =>
  session.running && session.endsAt ? Math.max(0, Math.ceil((session.endsAt - now) / 1000)) : session.remainingSeconds

export const makeHistoryEntry = (session: ActiveSession, focusMinutes: number | null, energy: number): PastSession => ({
  id: crypto.randomUUID(),
  savedAt: Date.now(),
  date: new Date().toISOString(),
  topic: session.topic.trim() || 'Untitled study session',
  completedBlocks: session.completedBlockIds.length,
  focusMinutes,
  energy,
})
