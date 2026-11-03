import { useEffect, useRef, useState } from 'react'
import type { ProtocolBlock } from '../data/protocol'

export function TransitionBanner({ block, onExtend }: { block: ProtocolBlock | null; onExtend: () => void }) {
  const [visible, setVisible] = useState(Boolean(block))
  const hideRef = useRef<number | null>(null)
  const removeRef = useRef<number | null>(null)
  function clearTimers() { if (hideRef.current) window.clearTimeout(hideRef.current); if (removeRef.current) window.clearTimeout(removeRef.current) }
  function schedule(delay: number) { clearTimers(); hideRef.current = window.setTimeout(() => { setVisible(false); removeRef.current = window.setTimeout(() => { /* Parent clears the next notice. */ }, 350) }, delay) }
  useEffect(() => { if (!block) return; setVisible(true); schedule(4000); return clearTimers }, [block?.id])
  if (!block) return null
  return <aside className={`transition-banner ${visible ? 'is-visible' : 'is-leaving'}`} role="status" aria-live="polite" onMouseEnter={clearTimers} onMouseLeave={() => schedule(2000)}><div><strong>Next: {block.title} · {block.minutes} min</strong><p>{block.instructions[0]}</p></div><button className="outline-button" onClick={onExtend}>+5 min</button></aside>
}
