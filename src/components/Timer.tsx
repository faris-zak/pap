import { Pause, Play } from 'lucide-react'

type Props = { seconds: number; running: boolean; onToggle: () => void; label: string; disabled?: boolean; disabledLabel?: string; pulse?: boolean }

export function Timer({ seconds, running, onToggle, label, disabled = false, disabledLabel = 'Session complete', pulse = false }: Props) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return <section className="timer-panel" aria-label="Block timer">
    <p className="eyebrow">Current block</p>
    <h2 className={pulse ? 'block-name-enter' : ''}>{label}</h2>
    <time className="timer" dateTime={`PT${seconds}S`}>{minutes}:{remaining}</time>
    <button className="primary-button timer-button" onClick={onToggle} disabled={disabled}>
      {running ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
      {disabled ? disabledLabel : running ? 'Pause timer' : 'Start timer'}
    </button>
    <p className="shortcut-hint">{disabled ? disabledLabel === 'Rest in progress' ? 'Complete or skip the rest to continue' : 'Session logged when you are ready' : `Space to ${running ? 'pause' : 'start'}`}</p>
  </section>
}
