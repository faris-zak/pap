import type { StageId } from './data/protocol'

export type EquationAnswers = Record<'variables' | 'units' | 'relationships' | 'geometry' | 'meaning', string>

export type ActiveSession = {
  id: string
  topic: string
  recall: [string, string, string]
  stageId: StageId
  activeBlockId: string
  completedBlockIds: string[]
  remainingSeconds: number
  running: boolean
  endsAt: number | null
  equationAnswers: EquationAnswers
  startedAt: number
  extensions: Record<string, number>
  rest: { end: number; ready: boolean } | null
  sessionComplete: boolean
}

export type PastSession = {
  id: string
  savedAt: number
  date: string
  topic: string
  completedBlocks: number
  focusMinutes: number | null
  energy: number
}

export type AppStorage = {
  activeSession: ActiveSession
  history: PastSession[]
  theme: 'dark' | 'light'
}
