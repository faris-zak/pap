import { RotateCcw, SkipForward } from 'lucide-react'
import { protocol, getBlock, type StageId } from '../data/protocol'
import type { ActiveSession, EquationAnswers, PastSession } from '../types'
import { BlockList } from './BlockList'
import { EquationCheck } from './EquationCheck'
import { FocusLog } from './FocusLog'
import { Timer } from './Timer'
import { RestCard } from './RestCard'

type Props = {
  session: ActiveSession
  remainingSeconds: number
  visibleStage: StageId
  history: PastSession[]
  focusOpen: boolean
  onVisibleStage: (stage: StageId) => void
  onSessionChange: (change: Partial<ActiveSession>) => void
  onToggle: () => void
  onMarkDone: () => void
  onReset: () => void
  onFocusOpen: () => void
  onFocusSave: (minutes: number, energy: number) => void
  transitionPulse: boolean
  onRestSkip: () => void
  onRestStart: () => void
  onExtend: () => void
}

export function SessionPage({ session, remainingSeconds, visibleStage, history, focusOpen, onVisibleStage, onSessionChange, onToggle, onMarkDone, onReset, onFocusOpen, onFocusSave, transitionPulse, onRestSkip, onRestStart, onExtend }: Props) {
  const activeBlock = getBlock(session.activeBlockId)!
  const stage = protocol.find((item) => item.id === visibleStage)!
  return <main className="session-page">
    <section className="session-intro"><p className="eyebrow">PAP v2.0 · A deliberate study session</p><h1>Physics activation<br /><em>protocol</em></h1><p className="intro-copy">Two stages to move from recall to sustained physical reasoning.</p></section>
    <section className="session-fields" aria-label="Session setup"><label>Topic name<input value={session.topic} onChange={(event) => onSessionChange({ topic: event.target.value })} placeholder="For example, Lagrangian mechanics" /></label><fieldset><legend>Things I remember without looking</legend>{session.recall.map((value, index) => <input key={index} value={value} onChange={(event) => { const recall = [...session.recall] as ActiveSession['recall']; recall[index] = event.target.value; onSessionChange({ recall }) }} placeholder={`Recall ${index + 1}`} />)}</fieldset></section>
    <div className="stage-switcher" role="tablist" aria-label="Protocol stages">{protocol.map((item, index) => <button key={item.id} role="tab" aria-selected={visibleStage === item.id} className={visibleStage === item.id ? 'selected' : ''} onClick={() => onVisibleStage(item.id)}><span>Stage {index === 0 ? 'I' : 'II'}</span>{item.title}<small>{item.minutes} min</small></button>)}</div>
    {session.rest && <RestCard end={session.rest.end} ready={session.rest.ready} onSkip={onRestSkip} onStart={onRestStart} />}
    <div className="session-grid">
      <div className="timer-column"><Timer seconds={remainingSeconds} running={session.running} onToggle={onToggle} label={session.sessionComplete ? 'Session complete' : activeBlock.title} disabled={Boolean(session.rest) || session.sessionComplete} disabledLabel={session.rest ? 'Rest in progress' : 'Session complete'} pulse={transitionPulse} /><div className="timer-actions"><button className="outline-button" onClick={onMarkDone} disabled={Boolean(session.rest) || session.sessionComplete}><SkipForward size={16} /> Mark block done <kbd>N</kbd></button><button className="outline-button" onClick={onExtend} disabled={Boolean(session.rest) || session.sessionComplete}>+5 min</button><button className="quiet-button" onClick={onReset}><RotateCcw size={15} /> Reset session</button></div></div>
      <div className="block-column"><BlockList stage={stage} activeBlockId={session.activeBlockId} completed={session.completedBlockIds} /><article className="instructions"><p className="eyebrow">Now working</p><h2>{activeBlock.title}</h2><ul>{activeBlock.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul></article></div>
    </div>
    <EquationCheck answers={session.equationAnswers} onChange={(equationAnswers: EquationAnswers) => onSessionChange({ equationAnswers })} />
    <FocusLog history={history} open={focusOpen} onOpen={onFocusOpen} onSave={onFocusSave} />
  </main>
}
