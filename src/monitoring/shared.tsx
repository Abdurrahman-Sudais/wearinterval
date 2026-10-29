import { AlertOctagon, CheckCircle2, WifiOff } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { TECHNICIANS } from '../data/facility'
import type { InspectionResult } from '../data/types'
import { INSPECTION_RESULT_LABEL, fmtAge, fmtDateTime, type ToolAssessment } from '../lib/analysis'
import { useDemo } from '../lib/store'

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-ink-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ title, actions, children, className = '' }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 px-4 py-3">
          {title && <h2 className="text-sm font-medium text-white">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

export function StatTile({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'warn' | 'stale' | 'ok' }) {
  const color = tone === 'warn' ? 'text-warn' : tone === 'stale' ? 'text-stale' : tone === 'ok' ? 'text-ok' : 'text-white'
  return (
    <div className="panel p-4">
      <div className="label">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tabular-nums ${color}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  )
}

/** Prominent warning shown whenever an assessment is based on outdated or incomplete data. */
export function NotCurrentWarning({ assessment }: { assessment: ToolAssessment }) {
  if (!assessment.notCurrent) return null
  const t = assessment.telemetry
  const stale = assessment.state === 'data-stale'
  return (
    <div role="alert" className="flex gap-3 rounded-lg border border-stale/40 bg-stale/10 p-4 text-sm">
      {stale ? <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-stale" aria-hidden /> : <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-stale" aria-hidden />}
      <div>
        <p className="font-medium text-white">{stale ? 'Telemetry is outdated — this assessment is not current.' : 'Telemetry is incomplete — this assessment is not current.'}</p>
        <p className="mt-1 text-ink-300">
          {stale
            ? `The last reading from ${assessment.machine.id} was received ${fmtAge(t.ageHours)} (${t.lastReceived ? fmtDateTime(t.lastReceived) : '—'} UTC). Values below describe the tool as of that time, not now.`
            : `Only ${t.received24h} of ${t.expected24h} expected readings (${t.completeness24h.toFixed(0)}%) arrived from ${assessment.machine.id} in the last 24 h. Comparisons are shown for reference only.`}{' '}
          Confirm the tool’s condition by inspection.
        </p>
      </div>
    </div>
  )
}

export const RESULT_OPTIONS: { value: InspectionResult; help: string }[] = [
  { value: 'no-visible-issue', help: 'Tool examined, no visible wear or damage beyond normal.' },
  { value: 'wear-observed', help: 'Wear present; tool can remain in service.' },
  { value: 'tool-replaced', help: 'Tool or insert edge replaced. A new baseline will be needed.' },
  { value: 'additional-monitoring', help: 'Keep in service and re-check at a set interval.' },
  { value: 'unable-to-determine', help: 'Condition could not be confirmed (e.g. tool not accessible).' },
]

/** Record a human-confirmed inspection result, optionally linked to an alert. */
export function InspectionForm({ toolId, alertId, defaultTechnicianId, onDone }: { toolId: string; alertId?: string; defaultTechnicianId?: string; onDone?: () => void }) {
  const { recordInspection } = useDemo()
  const [technicianId, setTechnicianId] = useState(defaultTechnicianId ?? '')
  const [result, setResult] = useState<InspectionResult | ''>('')
  const [notes, setNotes] = useState('')
  const [wear, setWear] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!technicianId || !result) {
      setError('Select a technician and an inspection result.')
      return
    }
    const wearNum = wear.trim() ? Number(wear) : undefined
    if (wearNum !== undefined && (!Number.isFinite(wearNum) || wearNum < 0 || wearNum > 2)) {
      setError('Flank wear must be a number between 0 and 2 mm.')
      return
    }
    const ins = recordInspection({ toolId, alertId, technicianId, result, notes: notes.trim(), flankWearMm: wearNum })
    setSaved(`${ins.id} saved: ${INSPECTION_RESULT_LABEL[result]}`)
    setError(null)
    setResult('')
    setNotes('')
    setWear('')
    onDone?.()
  }

  return (
    <form onSubmit={submit} className="space-y-4" aria-label={`Record inspection for ${toolId}`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`tech-${toolId}`} className="mb-1.5 block text-sm text-ink-300">
            Inspected by
          </label>
          <select id={`tech-${toolId}`} className="field" value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
            <option value="">Select technician…</option>
            {TECHNICIANS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} — {t.role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`wear-${toolId}`} className="mb-1.5 block text-sm text-ink-300">
            Measured flank wear VB (mm, optional)
          </label>
          <input id={`wear-${toolId}`} inputMode="decimal" className="field" value={wear} onChange={(e) => setWear(e.target.value)} placeholder="e.g. 0.12" />
        </div>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm text-ink-300">Inspection result</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {RESULT_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm transition-colors ${result === o.value ? 'border-steel-500 bg-steel-500/10' : 'border-ink-600 hover:border-ink-500'}`}
            >
              <input type="radio" name={`result-${toolId}`} value={o.value} checked={result === o.value} onChange={() => setResult(o.value)} className="mt-0.5 accent-[#4fb3d9]" />
              <span>
                <span className="block font-medium text-white">{INSPECTION_RESULT_LABEL[o.value]}</span>
                <span className="text-xs text-ink-400">{o.help}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor={`notes-${toolId}`} className="mb-1.5 block text-sm text-ink-300">
          Inspection notes
        </label>
        <textarea id={`notes-${toolId}`} rows={3} className="field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What was examined, what was found, any action taken." />
      </div>
      {error && (
        <p role="alert" className="text-sm text-crit">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="flex items-center gap-2 text-sm text-ok">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> {saved}. Added to the tool’s inspection history.
        </p>
      )}
      <button type="submit" className="btn-primary">
        Record inspection result
      </button>
    </form>
  )
}

export function InspectionHistory({ assessment, limit }: { assessment: ToolAssessment; limit?: number }) {
  const list = limit ? assessment.inspections.slice(0, limit) : assessment.inspections
  if (!list.length) return <p className="text-sm text-ink-400">No inspections recorded.</p>
  return (
    <ol className="relative space-y-4 border-l border-ink-700 pl-5">
      {list.map((i) => (
        <li key={i.id} className="relative">
          <span className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-850 bg-stale" aria-hidden />
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-mono text-ink-400">{fmtDateTime(i.inspectedAt)} UTC</span>
            <span className="font-medium text-white">{INSPECTION_RESULT_LABEL[i.result]}</span>
            {i.flankWearMm !== undefined && <span className="font-mono text-ink-300">VB {i.flankWearMm.toFixed(2)} mm</span>}
            {i.userRecorded && <span className="rounded bg-steel-500/15 px-1.5 text-steel-300">recorded in this demo</span>}
          </div>
          <p className="mt-1 text-sm text-ink-300">{i.notes || <span className="italic text-ink-500">No notes.</span>}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {TECHNICIANS.find((t) => t.id === i.technicianId)?.name} · {i.id}
          </p>
        </li>
      ))}
    </ol>
  )
}
