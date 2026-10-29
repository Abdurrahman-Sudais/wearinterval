import { ArrowLeft, CheckCircle2, Clock, Eye, MessageSquarePlus, UserPlus } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AiPanel } from '../components/AiPanel'
import { AlertStatusBadge, FreshnessBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { ChartLegend, TrendChart } from '../components/TrendChart'
import { DAY, DEMO_NOW, TECHNICIANS } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import { INSPECTION_RESULT_LABEL, fmtAge, fmtDateTime, fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, InspectionForm, NotCurrentWarning, PageHeader } from './shared'

export default function AlertDetail() {
  const { alertId = '' } = useParams()
  const { alerts, alertState, assessmentById, settings, assign, addNote, setStatus, inspections } = useDemo()
  const alert = alerts.find((a) => a.id === alertId)
  const [note, setNote] = useState('')

  if (!alert) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-ink-300">Alert “{alertId}” is not active under the current analysis settings.</p>
        <Link to="/monitoring/inspections" className="btn-secondary mt-4">
          Back to queue
        </Link>
      </div>
    )
  }

  const st = alertState(alert.id)
  const a = assessmentById[alert.toolId]
  const f = FEATURE_BY_KEY[alert.feature]
  const d = alert.deviation
  const linkedInspection = st.inspectionId ? inspections.find((i) => i.id === st.inspectionId) : undefined
  const resolved = st.status === 'resolved'

  return (
    <>
      <Link to="/monitoring/inspections" className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Inspection queue
      </Link>
      <PageHeader
        title={alert.title}
        description={
          <>
            <span className="font-mono">{alert.id}</span> · <Link to={`/monitoring/tools/${a.tool.id}`} className="text-steel-400 hover:text-steel-300">{a.tool.id}</Link> {a.tool.description} on {a.machine.id}
          </>
        }
        actions={
          <>
            <SimulatedTag />
            <AlertStatusBadge status={st.status} />
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <ToolStateBadge state={a.state} />
        <FreshnessBadge freshness={a.telemetry.freshness} ageHours={a.telemetry.ageHours} />
      </div>
      <NotCurrentWarning assessment={a} />

      <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Supporting observations">
            <TrendChart assessment={a} feature={alert.feature} from={DEMO_NOW - 8 * DAY} settings={settings} height={280} />
            <div className="mt-3">
              <ChartLegend />
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Explain title="What changed">
              The mean {f.label.toLowerCase()} over the compared window is <b className="font-mono text-white">{d.recent.mean.toFixed(3)} {f.unit}</b>, against a baseline mean of{' '}
              <b className="font-mono text-white">{d.baseline.mean.toFixed(3)} {f.unit}</b>: a change of <b className="text-warn">{fmtPct(d.pctChange)}</b>, or {d.z.toFixed(1)} baseline standard deviations.
              {alert.otherChanged.length > 0 && <> Also changed: {alert.otherChanged.map((o) => `${FEATURE_BY_KEY[o.key].shortLabel} ${fmtPct(o.pctChange)}`).join(', ')}.</>}
            </Explain>
            <Explain title="Which observations were compared">
              Baseline <span className="font-mono">{alert.baseline.id}</span>: {alert.baseline.observationCount} observations, {fmtDateTime(alert.baseline.windowStart)} – {fmtDateTime(alert.baseline.windowEnd)} UTC. Compared with the latest{' '}
              {alert.compared.length} comparable observations, {fmtDateTime(alert.compared[0].recordedAt)} – {fmtDateTime(alert.compared[alert.compared.length - 1].recordedAt)} UTC.
              {a.raw.excludedRecent.length > 0 && ` ${a.raw.excludedRecent.length} recent observations were excluded because their conditions were outside tolerance.`}
            </Explain>
            <Explain title="Relevant operating conditions">
              <ul className="space-y-0.5">
                {alert.conditionDiffs.map((c) => (
                  <li key={c.param} className="flex justify-between gap-2">
                    <span>{c.label}</span>
                    <span className="font-mono text-ink-200">
                      {c.baseline} → {c.observed} <span className={c.within ? 'text-ok' : 'text-warn'}>{c.within ? '✓' : '✕'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Explain>
            <Explain title="When the data was recorded">
              The comparison has met the rule since <b className="text-white">{fmtDateTime(alert.createdAt)} UTC</b>. The most recent compared observation was recorded {fmtDateTime(alert.latestAt)} UTC. The last telemetry from {a.machine.id} arrived{' '}
              {fmtAge(a.telemetry.ageHours)}.
            </Explain>
          </div>
          <Explain title="Why an inspection may be appropriate" wide>
            The change is sustained across {alert.compared.length} observations made under conditions within tolerance of the baseline, so it is unlikely to be explained by a change in speed, feed or engagement alone. That makes it worth a look at the tool.
            It does <b className="text-white">not</b> establish that the tool is worn or about to fail: fixturing, workpiece batch, coolant or sensor mounting can also cause a change like this. Confirm the
            tool’s physical condition before changing the replacement schedule.
          </Explain>
          <AiPanel assessment={a} />
        </div>

        <div className="space-y-6">
          <Card title="Workflow">
            <ol className="space-y-4 text-sm">
              <li>
                <div className="label mb-1.5 flex items-center gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" aria-hidden /> 1 · Assign technician
                </div>
                <select aria-label="Assign technician" className="field" value={st.assigneeId ?? ''} onChange={(e) => e.target.value && assign(alert.id, e.target.value)} disabled={resolved}>
                  <option value="">Unassigned</option>
                  {TECHNICIANS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.role} ({t.shift})
                    </option>
                  ))}
                </select>
              </li>
              <li>
                <div className="label mb-1.5 flex items-center gap-1.5">
                  <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden /> 2 · Add a note
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (note.trim()) {
                      addNote(alert.id, note.trim())
                      setNote('')
                    }
                  }}
                >
                  <label htmlFor="alert-note" className="sr-only">
                    Note
                  </label>
                  <input id="alert-note" className="field" placeholder="e.g. Checked coolant concentration: 7%" value={note} onChange={(e) => setNote(e.target.value)} />
                  <button type="submit" className="btn-secondary btn-sm shrink-0" disabled={!note.trim()}>
                    Add
                  </button>
                </form>
              </li>
              <li>
                <div className="label mb-1.5 flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" aria-hidden /> 3 · Review status
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary btn-sm" onClick={() => setStatus(alert.id, 'reviewed')} disabled={st.status === 'reviewed' || resolved}>
                    Mark reviewed
                  </button>
                  <button className="btn-primary btn-sm" onClick={() => setStatus(alert.id, 'resolved')} disabled={resolved}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
                  </button>
                  {resolved && (
                    <button className="btn-ghost btn-sm" onClick={() => setStatus(alert.id, 'reviewed')}>
                      Reopen
                    </button>
                  )}
                </div>
                {!linkedInspection && !resolved && <p className="mt-2 text-xs text-ink-500">Tip: record an inspection result before resolving so the outcome is part of the tool’s history.</p>}
              </li>
            </ol>
          </Card>

          <Card title="4 · Record inspection result">
            {linkedInspection && (
              <div className="mb-4 rounded-md border border-ok/40 bg-ok/10 p-3 text-sm">
                <div className="font-medium text-white">
                  {linkedInspection.id}: {INSPECTION_RESULT_LABEL[linkedInspection.result]}
                </div>
                <div className="text-xs text-ink-300">
                  {TECHNICIANS.find((t) => t.id === linkedInspection.technicianId)?.name} · {fmtDateTime(linkedInspection.inspectedAt)} UTC
                </div>
                {linkedInspection.notes && <p className="mt-1 text-ink-300">{linkedInspection.notes}</p>}
              </div>
            )}
            {resolved ? <p className="text-sm text-ink-400">This alert is resolved. Reopen it to record another inspection.</p> : <InspectionForm key={st.assigneeId} toolId={a.tool.id} alertId={alert.id} defaultTechnicianId={st.assigneeId} />}
          </Card>

          <Card title="Activity">
            {st.activity.length === 0 ? (
              <p className="text-sm text-ink-400">No activity yet.</p>
            ) : (
              <ol className="space-y-3">
                {[...st.activity].reverse().map((ev, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-500" aria-hidden />
                    <div>
                      <div className="text-ink-200">{ev.text}</div>
                      <div className="font-mono text-xs text-ink-500">{fmtDateTime(ev.at)} UTC</div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

function Explain({ title, children }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className="panel p-4">
      <h3 className="label">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed text-ink-300">{children}</div>
    </section>
  )
}
