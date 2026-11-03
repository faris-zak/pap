import { useEffect, useMemo, useState } from 'react'
import { History, Moon, Settings, Sun } from 'lucide-react'
import { allBlocks, getBlock } from './data/protocol'
import { HistoryPage } from './components/HistoryPage'
import { SessionPage } from './components/SessionPage'
import { TransitionBanner } from './components/TransitionBanner'
import { SettingsPage } from './components/SettingsPage'
import type { Preferences } from './backup'
import { playChime } from './audio'
import { loadStorage, makeHistoryEntry, newSession, resolveRemaining, saveStorage } from './storage'
import type { ActiveSession, AppStorage } from './types'

const soundKey = 'pap_sound'
const restKey = 'pap_rest'

function readSetting(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback } catch { return fallback } }
function writeSetting(key: string, value: string) { try { localStorage.setItem(key, value) } catch { /* Storage is optional. */ } }

function notifyBlockEnd(title: string, soundOn: boolean) {
  if (soundOn) playChime()
  if (document.hidden && Notification.permission === 'granted') new Notification('Physics activation protocol', { body: title })
}

export default function App() {
  const [data, setData] = useState<AppStorage>(() => loadStorage())
  const [page, setPage] = useState<'session' | 'history' | 'settings'>('session')
  const [visibleStage, setVisibleStage] = useState(data.activeSession.stageId)
  const [now, setNow] = useState(Date.now())
  const [focusOpen, setFocusOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(() => readSetting(soundKey, 'on') !== 'off')
  const [restMinutes, setRestMinutes] = useState(() => Number(readSetting(restKey, '20')) || 20)
  const [nextNotice, setNextNotice] = useState<string | null>(null)
  const [transitionPulse, setTransitionPulse] = useState(false)
  const session = data.activeSession
  const remainingSeconds = useMemo(() => resolveRemaining(session, now), [session, now])
  const activeBlock = getBlock(session.activeBlockId)!
  const totalSeconds = activeBlock.minutes * 60 + (session.extensions[activeBlock.id] ?? 0)
  const blockProgress = totalSeconds ? Math.max(0, Math.min(1, (totalSeconds - remainingSeconds) / totalSeconds)) : 0

  useEffect(() => { saveStorage(data) }, [data])
  useEffect(() => { document.documentElement.dataset.theme = data.theme }, [data.theme])
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(id) }, [])
  useEffect(() => { writeSetting(soundKey, soundOn ? 'on' : 'off') }, [soundOn])
  useEffect(() => { writeSetting(restKey, String(restMinutes)) }, [restMinutes])

  const changeSession = (change: Partial<ActiveSession>) => setData((current) => ({ ...current, activeSession: { ...current.activeSession, ...change } }))

  function showTransition(blockId: string, pulse = false) {
    setNextNotice(blockId)
    if (pulse) { setTransitionPulse(true); window.setTimeout(() => setTransitionPulse(false), 800) }
  }

  function beginRest(base: ActiveSession, completed: string[], end: number) {
    const next = allBlocks.find((block) => !completed.includes(block.id))!
    const restEnd = end + restMinutes * 60_000
    return { ...base, completedBlockIds: completed, activeBlockId: next.id, stageId: next.stageId, remainingSeconds: next.minutes * 60 + (base.extensions[next.id] ?? 0), running: false, endsAt: null, rest: { end: restEnd, ready: Date.now() >= restEnd } }
  }

  function advanceManually() {
    if (session.rest || session.sessionComplete) return
    const completed = session.completedBlockIds.includes(activeBlock.id) ? session.completedBlockIds : [...session.completedBlockIds, activeBlock.id]
    const next = allBlocks.find((block) => !completed.includes(block.id))
    if (!next) { setData((current) => ({ ...current, activeSession: { ...current.activeSession, completedBlockIds: completed, running: false, endsAt: null, remainingSeconds: 0, sessionComplete: true } })); setFocusOpen(true); return }
    if (activeBlock.id === 'investigation-briefing') {
      const rested = beginRest(session, completed, Date.now()); setData((current) => ({ ...current, activeSession: rested })); setVisibleStage('investigation'); showTransition(rested.activeBlockId); return
    }
    setData((current) => ({ ...current, activeSession: { ...current.activeSession, completedBlockIds: completed, activeBlockId: next.id, stageId: next.stageId, remainingSeconds: next.minutes * 60 + (session.extensions[next.id] ?? 0), running: false, endsAt: null } })); setVisibleStage(next.stageId); showTransition(next.id)
  }

  function autoAdvance() {
    if (!session.running || !session.endsAt || session.rest || session.sessionComplete || Date.now() < session.endsAt) return
    const nowAt = Date.now(); let working = session; let endAt = session.endsAt
    while (true) {
      const current = getBlock(working.activeBlockId)!
      const completed = working.completedBlockIds.includes(current.id) ? working.completedBlockIds : [...working.completedBlockIds, current.id]
      const next = allBlocks.find((block) => !completed.includes(block.id))
      if (!next) { working = { ...working, completedBlockIds: completed, running: false, endsAt: null, remainingSeconds: 0, sessionComplete: true }; setFocusOpen(true); break }
      if (current.id === 'investigation-briefing') { working = beginRest(working, completed, endAt); break }
      const nextTotal = next.minutes * 60 + (working.extensions[next.id] ?? 0)
      const nextEnd = endAt + nextTotal * 1000
      working = { ...working, completedBlockIds: completed, activeBlockId: next.id, stageId: next.stageId, remainingSeconds: Math.max(0, Math.ceil((nextEnd - nowAt) / 1000)), running: true, endsAt: nextEnd }
      if (nowAt < nextEnd) break
      endAt = nextEnd
    }
    const target = getBlock(working.activeBlockId)
    setData((current) => current.activeSession.endsAt === session.endsAt ? { ...current, activeSession: working } : current)
    if (target) { setVisibleStage(target.stageId); showTransition(target.id, true) }
    notifyBlockEnd(`${activeBlock.title} is complete.`, soundOn)
    if (working.rest?.ready) notifyBlockEnd('Rest is complete. Stage II is ready.', soundOn)
  }

  useEffect(() => { if (session.running && remainingSeconds <= 0) autoAdvance() }, [remainingSeconds, session.running])
  useEffect(() => {
    if (!session.rest || session.rest.ready || now < session.rest.end) return
    setData((current) => ({ ...current, activeSession: { ...current.activeSession, rest: current.activeSession.rest ? { ...current.activeSession.rest, ready: true } : null } }))
    notifyBlockEnd('Rest is complete. Stage II is ready.', soundOn)
  }, [now, session.rest?.end, session.rest?.ready])

  async function toggleTimer() {
    if (session.rest || session.sessionComplete) return
    if (!session.running && Notification.permission === 'default') { try { await Notification.requestPermission() } catch { /* Notifications are optional. */ } }
    setData((current) => {
      const active = current.activeSession
      const seconds = resolveRemaining(active)
      if (active.running) return { ...current, activeSession: { ...active, running: false, endsAt: null, remainingSeconds: seconds } }
      return { ...current, activeSession: { ...active, running: true, remainingSeconds: seconds, endsAt: Date.now() + seconds * 1000 } }
    })
  }

  function resetSession() {
    if (window.confirm('Reset this session? Your current topic, notes, and progress will be cleared.')) { const next = newSession(); setData((current) => ({ ...current, activeSession: next })); setVisibleStage('activation'); setFocusOpen(false) }
  }

  function saveFocus(minutes: number, energy: number) { setData((current) => ({ ...current, history: [...current.history, makeHistoryEntry(current.activeSession, minutes, energy)].sort((a, b) => a.savedAt - b.savedAt).slice(-50), activeSession: newSession() })); setVisibleStage('activation'); setFocusOpen(false) }

  function extendBlock() { if (session.rest || session.sessionComplete) return; setData((current) => { const active = current.activeSession; const extensions = { ...active.extensions, [active.activeBlockId]: (active.extensions[active.activeBlockId] ?? 0) + 300 }; return { ...current, activeSession: { ...active, extensions, remainingSeconds: active.remainingSeconds + 300, endsAt: active.running && active.endsAt ? active.endsAt + 300_000 : active.endsAt } } }) }
  function skipRest() { setData((current) => ({ ...current, activeSession: { ...current.activeSession, rest: null, running: false, endsAt: null } })) }
  function startStageTwo() { setData((current) => { const active = current.activeSession; const seconds = resolveRemaining(active); return { ...current, activeSession: { ...active, rest: null, running: true, remainingSeconds: seconds, endsAt: Date.now() + seconds * 1000 } } }) }

  function importBackup(history: AppStorage['history'], importedState: ActiveSession | null, importedPreferences: Preferences | null) {
    const restored = importedState ? { ...newSession(), ...importedState, extensions: importedState.extensions ?? {}, rest: importedState.rest ?? null, sessionComplete: importedState.sessionComplete ?? false } : null
    setData((current) => ({ ...current, history, ...(restored ? { activeSession: restored } : {}) }))
    if (restored) setVisibleStage(restored.stageId)
    if (importedPreferences) { setSoundOn(importedPreferences.soundOn); setRestMinutes(importedPreferences.restMinutes); setData((current) => ({ ...current, theme: importedPreferences.theme })) }
  }

  useEffect(() => {
    function keyboard(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, button, select') || page !== 'session' || session.rest || session.sessionComplete) return
      if (event.code === 'Space') { event.preventDefault(); toggleTimer() }
      if (event.key.toLowerCase() === 'n') { event.preventDefault(); advanceManually() }
    }
    window.addEventListener('keydown', keyboard); return () => window.removeEventListener('keydown', keyboard)
  })

  const completedCount = session.completedBlockIds.length
  const progress = Math.max(0, Math.min(100, ((completedCount + (session.rest || session.sessionComplete ? 0 : blockProgress)) / 10) * 100))
  const preferences: Preferences = { soundOn, restMinutes, theme: data.theme }
  function updatePreferences(next: Preferences) { setSoundOn(next.soundOn); setRestMinutes(next.restMinutes); setData((current) => ({ ...current, theme: next.theme })) }
  return <div className="app-shell">
    <header className="app-header"><a className="brand" href="#top" onClick={(event) => { event.preventDefault(); setPage('session') }}>PAP <span>v2.0</span></a><nav><button className={page === 'history' ? 'nav-active' : ''} onClick={() => setPage('history')}><History size={16} /> History</button><button className={page === 'settings' ? 'nav-active' : ''} onClick={() => setPage('settings')}><Settings size={16} /> Settings</button><button className="icon-button" aria-label={`Switch to ${data.theme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setData((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))}>{data.theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button></nav></header>
    <TransitionBanner block={nextNotice ? getBlock(nextNotice) ?? null : null} onExtend={extendBlock} />
    <div className={`progress-line ${session.running && remainingSeconds <= 60 ? 'is-warning' : ''} ${transitionPulse ? 'is-pulsing' : ''}`} aria-label={`${completedCount} of 10 blocks completed`}><span style={{ width: `${progress}%` }} /></div>
    {page === 'session' ? <SessionPage session={session} remainingSeconds={remainingSeconds} visibleStage={visibleStage} history={data.history} focusOpen={focusOpen} onVisibleStage={setVisibleStage} onSessionChange={changeSession} onToggle={toggleTimer} onMarkDone={advanceManually} onReset={resetSession} onFocusOpen={() => setFocusOpen(true)} onFocusSave={saveFocus} transitionPulse={transitionPulse} onRestSkip={skipRest} onRestStart={startStageTwo} onExtend={extendBlock} /> : page === 'history' ? <HistoryPage history={data.history} session={session} preferences={preferences} onBack={() => setPage('session')} onImport={importBackup} /> : <SettingsPage preferences={preferences} onBack={() => setPage('session')} onChange={updatePreferences} onTestSound={playChime} />}
  </div>
}
