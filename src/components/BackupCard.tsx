import { Download, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { createBackup, isActiveSession, isPreferences, lastExportKey, mergeHistory, validateBackup, type Preferences } from '../backup'
import type { ActiveSession, PastSession } from '../types'

type Props = { history: PastSession[]; session: ActiveSession; preferences: Preferences; onImport: (history: PastSession[], state: ActiveSession | null, preferences: Preferences | null) => void }

function readLastExport() { try { return localStorage.getItem(lastExportKey) } catch { return null } }
function writeLastExport(value: string) { try { localStorage.setItem(lastExportKey, value) } catch { /* Storage is optional. */ } }

function relativeDate(value: string | null) {
  if (!value) return 'Never backed up'
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
  if (days <= 0) return 'Last backup: today'
  return `Last backup: ${days} day${days === 1 ? '' : 's'} ago`
}

export function BackupCard({ history, session, preferences, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [lastExport, setLastExport] = useState(() => readLastExport())
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null)
  const unsaved = lastExport ? history.filter((entry) => entry.savedAt > new Date(lastExport).getTime()).length : history.length

  function exportBackup() {
    const backup = createBackup(history, session, preferences)
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url; link.download = `pap-backup-${date}.json`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
    const exportedAt = new Date().toISOString()
    writeLastExport(exportedAt); setLastExport(exportedAt); setStatus({ text: 'Backup downloaded.' })
  }

  async function importBackup(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      const result = validateBackup(parsed)
      if ('error' in result) { setStatus({ text: result.error, error: true }); return }
      const replace = isActiveSession(result.backup.state) && window.confirm('Also replace your current in-progress session?')
      const merged = mergeHistory(history, result.backup.history)
      const importedPreferences = isPreferences(result.backup.preferences) ? result.backup.preferences : null
      onImport(merged.history, replace ? result.backup.state : null, importedPreferences)
      setStatus({ text: `Imported ${merged.imported} session${merged.imported === 1 ? '' : 's'}, skipped ${merged.duplicates} duplicate${merged.duplicates === 1 ? '' : 's'} and ${result.invalid} invalid.${importedPreferences ? ' Settings were restored.' : ''}` })
    } catch { setStatus({ text: 'This file could not be read as a PAP backup.', error: true }) }
  }

  return <section className="backup-card" aria-labelledby="backup-title"><div className="section-heading"><div><p className="eyebrow">Portable progress</p><h2 id="backup-title">Backup</h2></div><span>{relativeDate(lastExport)}</span></div><div className="backup-actions"><button className="outline-button" onClick={exportBackup}><Download size={16} /> Export backup</button><button className="outline-button" onClick={() => inputRef.current?.click()}><Upload size={16} /> Import backup</button><input ref={inputRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={importBackup} /></div>{unsaved >= 5 && <p className="backup-reminder">{unsaved} sessions not backed up yet.</p>}{status && <p className={`backup-status ${status.error ? 'is-error' : ''}`} role="status">{status.text}</p>}</section>
}
