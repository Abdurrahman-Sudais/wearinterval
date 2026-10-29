import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CELLS, DEMO_NOW, DAY, MACHINES, TECHNICIANS } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import { INSPECTION_RESULT_LABEL, fmtDateTime, fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { FreshnessBadge, SimulatedTag, ToolStateBadge } from './Status'
import { ChartLegend, TrendChart } from './TrendChart'

/** Compact, live-data preview of the monitoring dashboard for marketing pages. */
export function DashboardPreview() {
  const { assessments, assessmentById, alerts, alertState, telemetry, inspections, settings } = useDemo()
  const focus = assessmentById['T-1204']
  const openAlerts = alerts.filter((a) => alertState(a.id).status !== 'resolved')
  const recentInspections = [...inspections].sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt)).slice(0, 4)

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-ink-700 bg-ink-850 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
          <span className="ml-3 font-mono text-xs text-ink-400">wearinterval.space/monitoring</span>
        </div>
        <SimulatedTag />
      </div>

      <div className="grid gap-px bg-ink-700 sm:grid-cols-3">
        {CELLS.map((c) => {
          const ms = MACHINES.filter((m) => m.cellId === c.id)
          const cellTools = assessments.filter((a) => a.machine.cellId === c.id)
          const review = cellTools.filter((a) => a.state === 'review-suggested').length
          const stale = cellTools.filter((a) => a.notCurrent).length
          return (
            <div key={c.id} className="bg-ink-900 p-4">
              <div className="label">{c.id}</div>
              <div className="mt-1 truncate text-sm font-medium text-white">{c.name.split('·')[1]}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                <span>{ms.length} machines</span>
                <span>{cellTools.length} tools</span>
                {review > 0 && <span className="text-warn">{review} review</span>}
                {stale > 0 && <span className="text-stale">{stale} data not current</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-px bg-ink-700 lg:grid-cols-[1.6fr_1fr]">
        <div className="bg-ink-900 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="label">Tool-condition trend · {focus.tool.id} · {focus.machine.id}</div>
              <div className="mt-1 text-sm text-white">{FEATURE_BY_KEY.vibBand.label}</div>
            </div>
            <ToolStateBadge state={focus.state} />
          </div>
          <div className="mt-3">
            <TrendChart assessment={focus} feature="vibBand" settings={settings} from={DEMO_NOW - 6 * DAY} height={200} compact />
          </div>
          <div className="mt-2 hidden sm:block">
            <ChartLegend />
          </div>
        </div>
        <div className="space-y-px bg-ink-700">
          <div className="bg-ink-900 p-4">
            <div className="label mb-2">Inspection alerts</div>
            <ul className="space-y-2">
              {openAlerts.length === 0 && <li className="text-sm text-ink-400">No open alerts.</li>}
              {openAlerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                  <span className="text-ink-200">
                    <span className="font-mono text-white">{a.toolId}</span> {FEATURE_BY_KEY[a.feature].shortLabel.toLowerCase()} {fmtPct(a.deviation.pctChange)} vs baseline
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ink-900 p-4">
            <div className="label mb-2">Telemetry freshness</div>
            <ul className="grid grid-cols-2 gap-2">
              {MACHINES.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-mono text-ink-300">{m.id}</span>
                  <FreshnessBadge freshness={telemetry[m.id].freshness} ageHours={telemetry[m.id].ageHours} compact />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-ink-900 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="label">Tool inspection history</div>
          <Link to="/monitoring/inspections" className="inline-flex items-center gap-1 text-xs text-steel-400 hover:text-steel-300">
            Open queue <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <tbody className="divide-y divide-ink-800">
              {recentInspections.map((i) => (
                <tr key={i.id}>
                  <td className="py-1.5 pr-3 font-mono text-ink-400">{fmtDateTime(i.inspectedAt)}</td>
                  <td className="py-1.5 pr-3 font-mono text-white">{i.toolId}</td>
                  <td className="py-1.5 pr-3 text-ink-200">{INSPECTION_RESULT_LABEL[i.result]}</td>
                  <td className="py-1.5 text-ink-400">{TECHNICIANS.find((t) => t.id === i.technicianId)?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
