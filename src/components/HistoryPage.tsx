import { ArrowLeft, Clock3 } from 'lucide-react'
import { BackupCard } from './BackupCard'
import type { ActiveSession, PastSession } from '../types'
import type { Preferences } from '../backup'

type Props = { history: PastSession[]; session: ActiveSession; preferences: Preferences; onBack: () => void; onImport: (history: PastSession[], state: ActiveSession | null, preferences: Preferences | null) => void }

export function HistoryPage({ history, session, preferences, onBack, onImport }: Props) {
  return <main className="history-page"><div className="history-header"><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Back to session</button><p className="eyebrow">Personal record</p><h1>Session history</h1><p>Completed work and time-to-focus. Export a backup to move it to another device.</p></div>
    <BackupCard history={history} session={session} preferences={preferences} onImport={onImport} />
    {history.length ? <div className="history-list">{history.map((session) => <article className="history-card" key={session.id}><div><time>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(session.date))}</time><h2>{session.topic}</h2></div><dl><div><dt>Blocks completed</dt><dd>{session.completedBlocks} / 10</dd></div><div><dt>Focus reached</dt><dd>{session.focusMinutes === null ? 'Not logged' : `${session.focusMinutes} min`}{session.energy > 0 && ` · energy ${session.energy}/5`}</dd></div></dl></article>)}</div> : <div className="history-empty"><Clock3 size={28} /><h2>No sessions yet</h2><p>Your completed sessions will be collected here.</p></div>}
  </main>
}
