import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'

type Props = { seconds: number; running: boolean; onToggle: () => void; label: string; labelKey: string; disabled?: boolean; disabledLabel?: string }

export function Timer({ seconds, running, onToggle, label, labelKey, disabled = false, disabledLabel = 'Session complete' }: Props) {
  const previousLabelKey = useRef(labelKey)
  const labelTimer = useRef<number | null>(null)
  const [labelMotion, setLabelMotion] = useState(false)
  useEffect(() => {
    if (previousLabelKey.current === labelKey) return
    previousLabelKey.current = labelKey
    if (labelTimer.current) window.clearTimeout(labelTimer.current)
    setLabelMotion(true)
    labelTimer.current = window.setTimeout(() => setLabelMotion(false), 250)
  }, [labelKey])
  useEffect(() => () => { if (labelTimer.current) window.clearTimeout(labelTimer.current) }, [])
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return <section className="timer-panel" aria-label="Block timer">
    <p className="eyebrow">Current block</p>
    <h2 className={labelMotion ? 'block-name-enter' : ''}>{label}</h2>
    <time className="timer" dateTime={`PT${seconds}S`}>{minutes}:{remaining}</time>
    <button className="primary-button timer-button" onClick={onToggle} disabled={disabled}>
      {running ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
      {disabled ? disabledLabel : running ? 'Pause timer' : 'Start timer'}
    </button>
    <p className="shortcut-hint">{disabled ? disabledLabel === 'Rest in progress' ? 'Complete or skip the rest to continue' : 'Session logged when you are ready' : `Space to ${running ? 'pause' : 'start'}`}</p>
  </section>
}
