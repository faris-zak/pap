import { Coffee } from 'lucide-react'

type Props = { end: number; ready: boolean; leaving: boolean; onExitComplete: () => void; onSkip: () => void; onStart: () => void }

export function RestCard({ end, ready, leaving, onExitComplete, onSkip, onStart }: Props) {
  const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000))
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return <section className={`rest-card ${leaving ? 'is-leaving' : ''}`} aria-labelledby="rest-title" onTransitionEnd={(event) => { if (event.target === event.currentTarget && leaving) onExitComplete() }}><div><p className="eyebrow">Between stages</p><h2 id="rest-title" key={String(ready)} className="rest-title-enter">{ready ? 'Ready when you are' : 'Rest'}</h2></div><Coffee size={21} /><time className="rest-timer">{ready ? '00:00' : `${minutes}:${remaining}`}</time><ul><li>Stand up and move.</li><li>Drink water.</li><li>Look at something far away.</li><li>Skip social media.</li></ul><button className={`primary-button ${ready ? 'rest-ready-action' : ''}`} onClick={ready ? onStart : onSkip}>{ready ? 'Start Stage II' : 'Skip rest'}</button></section>
}
