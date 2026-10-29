import { AlertOctagon, Info, WifiOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FreshnessBadge, MachineStatusBadge, SimulatedTag } from '../components/Status'
import { CELLS, MACHINES, TOOLS } from '../data/facility'
import type { MeasurementType } from '../data/types'
import { fmtAge, fmtDateTime, slotTimeline } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { PageHeader } from './shared'

const MEASUREMENT_LABEL: Record<MeasurementType, string> = {
  vibration: 'Vibration features',
  acoustic: 'Acoustic features',
  'cutting-conditions': 'Cutting conditions (controller)',
  'spindle-load': 'Spindle load',
}

export default function Telemetry() {
  const { telemetry, settings } = useDemo()
  const problems = MACHINES.filter((m) => telemetry[m.id].freshness !== 'current' || telemetry[m.id].completeness24h < settings.minCompletenessPct)

  return (
    <>
      <PageHeader title="Telemetry quality" description="Freshness and completeness of the supplied data feed for each machine. Assessments built on outdated or incomplete data are not presented as current." actions={<SimulatedTag />} />

      <div className="mb-6 flex gap-3 rounded-lg border border-ink-700 bg-ink-850 p-4 text-sm text-ink-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden />
        <p>
          No physical sensors are connected in this demonstration. The “feeds” below are simulated sample data with deliberate gaps and delays, to show how Wearinterval treats data quality. Expected interval: one reading per machine per hour during operating shifts (06:00–22:00 UTC).
        </p>
      </div>

      {problems.length > 0 && (
        <div role="alert" className="mb-6 rounded-lg border border-stale/40 bg-stale/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium text-white">
            <AlertOctagon className="h-4 w-4 text-stale" aria-hidden /> {problems.length} machine feed{problems.length > 1 ? 's need' : ' needs'} attention
          </p>
          <ul className="mt-2 space-y-1 text-ink-300">
            {problems.map((m) => {
              const t = telemetry[m.id]
              return (
                <li key={m.id}>
                  <span className="font-mono text-white">{m.id}</span>:{' '}
                  {t.freshness === 'stale'
                    ? `no readings for ${fmtAge(t.ageHours).replace(' ago', '')}. Tool assessments are outdated.`
                    : t.completeness24h < settings.minCompletenessPct
                      ? `${t.completeness24h.toFixed(0)}% of expected readings in 24 h. Assessments are withheld as incomplete.`
                      : `latest reading delayed (${fmtAge(t.ageHours)}).`}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {MACHINES.map((m) => {
          const t = telemetry[m.id]
          const slots = slotTimeline(m, 48)
          const tools = TOOLS.filter((x) => x.machineId === m.id)
          const incomplete = t.completeness24h < settings.minCompletenessPct
          return (
            <article key={m.id} className={`panel p-5 ${t.freshness === 'stale' || incomplete ? 'border-stale/40' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-mono text-lg text-white">
                    {t.freshness === 'stale' && <WifiOff className="h-4 w-4 text-stale" aria-label="Outdated" />}
                    {m.id}
                  </h2>
                  <p className="text-xs text-ink-400">
                    {m.type} · {CELLS.find((c) => c.id === m.cellId)?.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <MachineStatusBadge status={m.status} />
                  <FreshnessBadge freshness={t.freshness} ageHours={t.ageHours} />
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div>
                  <dt className="label">Last received</dt>
                  <dd className="mt-1 font-mono text-ink-200">{t.lastReceived ? `${fmtDateTime(t.lastReceived)} UTC` : 'Never'}</dd>
                </div>
                <div>
                  <dt className="label">Completeness 24 h</dt>
                  <dd className="mt-1">
                    <Meter value={t.completeness24h} warn={incomplete} />
                    <span className="font-mono text-xs text-ink-400">
                      {t.received24h}/{t.expected24h} readings
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="label">Completeness 7 d</dt>
                  <dd className="mt-1">
                    <Meter value={t.completeness7d} warn={t.completeness7d < settings.minCompletenessPct} />
                  </dd>
                </div>
                <div>
                  <dt className="label">Measurement types</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {m.measurementTypes.map((mt) => (
                      <span key={mt} className="rounded border border-ink-600 px-1.5 py-0.5 text-xs text-ink-300">
                        {MEASUREMENT_LABEL[mt]}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <div className="label mb-1.5">Last 48 h · hourly slots</div>
                <div className="flex gap-[2px]" role="img" aria-label={`${slots.filter((s) => s.state === 'missing').length} missing readings in the last 48 hours`}>
                  {slots.map((s) => (
                    <span
                      key={s.t}
                      title={`${fmtDateTime(new Date(s.t).toISOString())} UTC — ${s.state}`}
                      className={`h-5 flex-1 rounded-[2px] ${s.state === 'received' ? 'bg-steel-600' : s.state === 'missing' ? 'bg-stale/70 ring-1 ring-inset ring-stale' : 'bg-ink-800'}`}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-4 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-steel-600" /> Received
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-stale/70 ring-1 ring-stale" /> Missing
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-ink-800" /> Outside operating hours
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="label mb-1.5">Missing intervals (7 d)</div>
                  {t.missingIntervals.length === 0 ? (
                    <p className="text-sm text-ink-400">None.</p>
                  ) : (
                    <ul className="max-h-32 space-y-1 overflow-y-auto font-mono text-xs text-ink-300">
                      {t.missingIntervals.slice(0, 12).map((g) => (
                        <li key={g.start}>
                          {fmtDateTime(g.start)} → {fmtDateTime(g.end)} <span className="text-ink-500">({g.slots} reading{g.slots > 1 ? 's' : ''})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="label mb-1.5">Outdated readings · associated tools</div>
                  <ul className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <li key={tool.id}>
                        <Link
                          to={`/monitoring/tools/${tool.id}`}
                          className={`inline-flex rounded border px-2 py-0.5 font-mono text-xs ${t.outdatedToolIds.includes(tool.id) ? 'border-stale/50 text-stale' : 'border-ink-600 text-ink-300'} hover:border-ink-400`}
                        >
                          {tool.id}
                          {t.outdatedToolIds.includes(tool.id) && ' · outdated'}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}

function Meter({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-ink-700" role="meter" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label="Completeness">
        <div className={`h-full rounded-full ${warn ? 'bg-stale' : 'bg-steel-500'}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className={`font-mono text-sm ${warn ? 'text-stale' : 'text-ink-200'}`}>{value.toFixed(0)}%</span>
    </div>
  )
}
