import type { EquationAnswers } from '../types'

const fields: { key: keyof EquationAnswers; title: string; prompt: string }[] = [
  { key: 'variables', title: 'Variables', prompt: 'What quantities appear, and what does each represent?' },
  { key: 'units', title: 'Units', prompt: 'Do the dimensions balance on both sides?' },
  { key: 'relationships', title: 'Relationships', prompt: 'What is proportional, conserved, or changing?' },
  { key: 'geometry', title: 'Geometry', prompt: 'What are the axes, directions, and constraints?' },
  { key: 'meaning', title: 'Physical meaning', prompt: 'What does this say about the real system?' },
]

type Props = { answers: EquationAnswers; onChange: (answers: EquationAnswers) => void }

export function EquationCheck({ answers, onChange }: Props) {
  return <section className="equation-check" aria-labelledby="equation-title">
    <div className="section-heading"><div><p className="eyebrow">Thinking tool</p><h2 id="equation-title">Equation check</h2></div><span>Five aspects</span></div>
    <div className="equation-grid">
      {fields.map((field) => <label key={field.key}><span>{field.title}</span><textarea value={answers[field.key]} onChange={(event) => onChange({ ...answers, [field.key]: event.target.value })} placeholder={field.prompt} rows={3} /></label>)}
    </div>
  </section>
}
