import { Coffee } from 'lucide-react'

type Props = { end: number; ready: boolean; onSkip: () => void; onStart: () => void }

export function RestCard({ end, ready, onSkip, onStart }: Props) {
  const seconds = Math.max(0, Math.ceil((end - Date.now()) / 1000))
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0')
  const remaining = (seconds % 60).toString().padStart(2, '0')
  return <section className="rest-card" aria-labelledby="rest-title"><div><p className="eyebrow">Between stages</p><h2 id="rest-title">{ready ? 'Ready when you are' : 'Rest'}</h2></div><Coffee size={21} /><time className="rest-timer">{ready ? '00:00' : `${minutes}:${remaining}`}</time><ul><li>Stand up and move.</li><li>Drink water.</li><li>Look at something far away.</li><li>Skip social media.</li></ul><button className="primary-button" onClick={ready ? onStart : onSkip}>{ready ? 'Start Stage II' : 'Skip rest'}</button></section>
}
