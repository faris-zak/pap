import { useState } from 'react'
import { BarChart3, CheckCircle2 } from 'lucide-react'
import type { PastSession } from '../types'

type Props = { history: PastSession[]; onSave: (minutes: number, energy: number) => void; open: boolean; onOpen: () => void; chartMotionKey: string | null }

export function FocusLog({ history, onSave, open, onOpen, chartMotionKey }: Props) {
  const entries = history.filter((entry) => entry.focusMinutes !== null).slice(-10)
  const average = entries.length ? Math.round(entries.reduce((total, entry) => total + (entry.focusMinutes ?? 0), 0) / entries.length) : null
  return <section className="focus-log" aria-labelledby="focus-title">
    <div className="section-heading"><div><p className="eyebrow">Session reflection</p><h2 id="focus-title">Focus log</h2></div><BarChart3 size={20} /></div>
    {open ? <FocusForm onSave={onSave} /> : <button className="outline-button" onClick={onOpen}><CheckCircle2 size={16} /> Complete session and log focus</button>}
    <div className="focus-summary"><span>Running average</span><strong>{average === null ? '—' : `${average} min`}</strong></div>
    {entries.length > 0 ? <><svg key={chartMotionKey ?? 'initial'} className="bar-chart" viewBox="0 0 320 94" role="img" aria-label="Minutes until focused over recent sessions">
      <line x1="0" x2="320" y1="76" y2="76" className="chart-axis" />
      {entries.map((entry, index) => { const value = entry.focusMinutes ?? 0; const barWidth = 320 / entries.length - 8; const x = index * (320 / entries.length) + 4; const height = Math.max(4, value / 240 * 66); return <g key={entry.id}><title>{entry.topic}: {value} minutes</title><rect style={{ animationDelay: `${Math.min(index * 30, 270)}ms` }} x={x} y={76 - height} width={barWidth} height={height} rx="2" /><text x={x + barWidth / 2} y="90" textAnchor="middle">{value}</text></g> })}
    </svg><ul className="recent-focus">{entries.map((entry) => <li key={entry.id}><span>{entry.topic}</span><strong>{entry.focusMinutes} min</strong></li>)}</ul></> : <p className="empty-state">Your focus trend will appear after your first completed session.</p>}
  </section>
}

function FocusForm({ onSave }: { onSave: (minutes: number, energy: number) => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [energy, setEnergy] = useState(0)
  function submit(event: React.FormEvent) { event.preventDefault(); const number = Number(value); if (!Number.isInteger(number) || number < 1 || number > 240) { setError('Enter a whole number from 1 to 240.'); return }; onSave(number, energy) }
  return <form className="focus-form" onSubmit={submit} noValidate><label htmlFor="focus-minutes">Minutes until I felt focused<input id="focus-minutes" inputMode="numeric" value={value} onChange={(event) => { setValue(event.target.value); setError('') }} aria-invalid={Boolean(error)} aria-describedby={error ? 'focus-error' : undefined} placeholder="For example, 35" /></label><div className="energy-rating"><span>Energy at the start of Stage II</span><div role="group" aria-label="Energy at the start of Stage II">{[1, 2, 3, 4, 5].map((score) => <button type="button" className={energy === score ? 'selected' : ''} aria-pressed={energy === score} key={score} onClick={() => setEnergy(score)}>{score}</button>)}</div></div>{error && <p className="field-error" id="focus-error">{error}</p>}<button className="primary-button" type="submit">Save session</button></form>
}
