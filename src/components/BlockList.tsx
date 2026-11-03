import { Check, Circle, Info, Sparkles } from 'lucide-react'
import type { ProtocolStage } from '../data/protocol'

type Props = { stage: ProtocolStage; activeBlockId: string; completed: string[] }

export function BlockList({ stage, activeBlockId, completed }: Props) {
  return <section className="block-list" aria-label={`${stage.title} blocks`}>
    <div className="section-heading"><div><p className="eyebrow">Stage {stage.id === 'activation' ? 'I' : 'II'} · {stage.minutes} minutes</p><h2>{stage.title}</h2></div><span>{stage.blocks.length} blocks</span></div>
    <ol>
      {stage.blocks.map((block, index) => {
        const done = completed.includes(block.id)
        const active = activeBlockId === block.id
        return <li className={`block-row ${active ? 'active' : ''} ${done ? 'done' : ''}`} key={block.id}>
          <span className="block-status" aria-label={done ? 'Completed' : active ? 'Active' : 'Not started'}>{done ? <Check size={14} /> : <Circle size={13} />}</span>
          <div><div className="block-title"><span>{index + 1}. {block.title}</span><span className="block-meta">{block.important && <span className="important"><Sparkles size={12} /> Most important</span>}<span className="info-wrap"><button className="info-button" aria-label={`Show instructions for ${block.title}`}><Info size={14} /></button><span className="block-tooltip" role="tooltip"><strong>{block.title}</strong><ul>{block.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}</ul></span></span></span></div><small>{block.minutes} min</small></div>
        </li>
      })}
    </ol>
  </section>
}
