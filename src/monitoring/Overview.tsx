import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertStatusBadge, FreshnessBadge, MachineStatusBadge, ToolStateBadge } from '../components/Status'
import { ChartLegend, TrendChart } from '../components/TrendChart'
import { CELLS, DAY, DEMO_NOW, MACHINES, TECHNICIANS } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import { INSPECTION_RESULT_LABEL, fmtDateTime, fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, PageHeader, StatTile } from './shared'

export default function Overview() {
  const { assessments, alerts, alertState, telemetry, inspections, settings } = useDemo()
  const open = alerts.filter((a) => alertState(a.id).status !== 'resolved')
  const review = assessments.filter((a) => a.state === 'review-suggested').length
  const notCurrent = assessments.filter((a) => a.notCurrent).length
  const staleMachines = MACHINES.filter((m) => telemetry[m.id].freshness !== 'current' || telemetry[m.id].completeness24h < settings.minCompletenessPct).length
  const focus = open[0] ? assessments.find((a) => a.tool.id === open[0].toolId)! : assessments[0]
  const focusFeature = open[0]?.feature ?? 'vibRms'
  const recent = [...inspections].sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt)).slice(0, 5)

  return (
    <>
      <PageHeader title="Overview" description="Monitored machining cells, tool-condition status, inspection alerts and data freshness for the simulated facility." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Monitored tools" value={assessments.length} hint={`${MACHINES.length} machines · ${CELLS.length} cells`} />
        <StatTile label="Review suggested" value={review} tone={review ? 'warn' : 'ok'} hint="Comparable observations differ from baseline" />
        <StatTile label="Open alerts" value={open.length} tone={open.length ? 'warn' : 'ok'} hint={`${alerts.length - open.length} resolved in this demo`} />
        <StatTile label="Assessments not current" value={notCurrent} tone={notCurrent ? 'stale' : 'ok'} hint={`${staleMachines} machine feed${staleMachines === 1 ? '' : 's'} delayed, outdated or incomplete`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card
          title={
            <>
              Tool-condition trend · <span className="font-mono">{focus.tool.id}</span> · {FEATURE_BY_KEY[focusFeature].shortLabel}
            </>
          }
          actions={
            <Link to={`/monitoring/tools/${focus.tool.id}`} className="inline-flex items-center gap-1 text-xs text-steel-400 hover:text-steel-300">
              Tool detail <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <TrendChart assessment={focus} feature={focusFeature} settings={settings} from={DEMO_NOW - 7 * DAY} height={260} />
          <div className="mt-3">
            <ChartLegend />
          </div>
        </Card>

        <Card
          title="Inspection alerts"
          actions={
            <Link to="/monitoring/inspections" className="inline-flex items-center gap-1 text-xs text-steel-400 hover:text-steel-300">
              Queue <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <ul className="space-y-3">
            {alerts.length === 0 && <li className="text-sm text-ink-400">No alerts under the current rules.</li>}
            {alerts.map((a) => {
              const st = alertState(a.id)
              return (
                <li key={a.id}>
                  <Link to={`/monitoring/inspections/${a.id}`} className="block rounded-md border border-ink-700 p-3 hover:border-ink-500">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                        <div>
                          <div className="text-sm text-white">{a.title}</div>
                          <div className="mt-0.5 text-xs text-ink-400">
                            {fmtPct(a.deviation.pctChange)} · since {fmtDateTime(a.createdAt)} · {a.machineId}
                          </div>
                        </div>
                      </div>
                      <AlertStatusBadge status={st.status} />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-medium text-white">Monitored machining cells</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {CELLS.map((c) => (
          <Card key={c.id} title={c.name}>
            <p className="-mt-1 mb-3 text-xs text-ink-400">{c.description}</p>
            <ul className="space-y-3">
              {MACHINES.filter((m) => m.cellId === c.id).map((m) => (
                <li key={m.id} className="rounded-md border border-ink-700 bg-ink-900 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm text-white">{m.id}</span>
                    <div className="flex gap-1.5">
                      <MachineStatusBadge status={m.status} />
                      <FreshnessBadge freshness={telemetry[m.id].freshness} ageHours={telemetry[m.id].ageHours} compact />
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {assessments
                      .filter((a) => a.machine.id === m.id)
                      .map((a) => (
                        <li key={a.tool.id} className="flex items-center justify-between gap-2 text-xs">
                          <Link to={`/monitoring/tools/${a.tool.id}`} className="truncate text-ink-300 hover:text-white">
                            <span className="font-mono text-steel-400">{a.tool.id}</span> {a.tool.type}
                          </Link>
                          <ToolStateBadge state={a.state} />
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Card title="Recent tool inspections">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs text-ink-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Recorded (UTC)</th>
                  <th className="py-2 pr-3 font-medium">Tool</th>
                  <th className="py-2 pr-3 font-medium">Result</th>
                  <th className="py-2 pr-3 font-medium">Technician</th>
                  <th className="py-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {recent.map((i) => (
                  <tr key={i.id}>
                    <td className="py-2 pr-3 font-mono text-xs text-ink-400">{fmtDateTime(i.inspectedAt)}</td>
                    <td className="py-2 pr-3">
                      <Link to={`/monitoring/tools/${i.toolId}`} className="font-mono text-steel-400 hover:text-steel-300">
                        {i.toolId}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 text-ink-200">{INSPECTION_RESULT_LABEL[i.result]}</td>
                    <td className="py-2 pr-3 text-ink-300">{TECHNICIANS.find((t) => t.id === i.technicianId)?.name}</td>
                    <td className="max-w-xs truncate py-2 text-ink-400" title={i.notes}>
                      {i.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
