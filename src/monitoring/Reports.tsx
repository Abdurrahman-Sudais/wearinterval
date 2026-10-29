import { Download } from 'lucide-react'
import { SimulatedTag, ToolStateBadge } from '../components/Status'
import { CELLS, MACHINES, TECHNICIANS } from '../data/facility'
import type { InspectionResult } from '../data/types'
import { INSPECTION_RESULT_LABEL, TOOL_STATE_META, fmtPct, type ToolState } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, PageHeader } from './shared'

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const { assessments, alerts, alertState, inspections, telemetry } = useDemo()

  const byResult = (Object.keys(INSPECTION_RESULT_LABEL) as InspectionResult[]).map((r) => [r, inspections.filter((i) => i.result === r).length] as const)
  const maxResult = Math.max(1, ...byResult.map(([, n]) => n))
  const states = Object.keys(TOOL_STATE_META) as ToolState[]

  return (
    <>
      <PageHeader title="Reports" description="Summaries of tool status, alerts, inspection outcomes and data quality. Exports are generated in the browser from the demo data." actions={<SimulatedTag />} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Tool status by cell"
          actions={
            <button
              className="btn-secondary btn-sm"
              onClick={() =>
                downloadCsv('wearinterval-tool-status.csv', [
                  ['tool_id', 'machine_id', 'cell_id', 'type', 'workpiece', 'status', 'lead_feature_change_pct', 'telemetry_freshness', 'simulated'],
                  ...assessments.map((a) => {
                    const lead = a.raw.primary ?? a.raw.deviations[0]
                    return [a.tool.id, a.machine.id, a.machine.cellId, a.tool.type, a.tool.workpieceMaterial, TOOL_STATE_META[a.state].label, lead && Number.isFinite(lead.pctChange) ? lead.pctChange.toFixed(1) : '', a.telemetry.freshness, 'yes']
                  }),
                ])
              }
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-ink-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  {CELLS.map((c) => (
                    <th key={c.id} className="py-2 pr-3 text-right font-medium">
                      {c.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {states.map((s) => (
                  <tr key={s}>
                    <td className="py-2 pr-3">
                      <ToolStateBadge state={s} />
                    </td>
                    {CELLS.map((c) => (
                      <td key={c.id} className="py-2 pr-3 text-right font-mono text-ink-200">
                        {assessments.filter((a) => a.machine.cellId === c.id && a.state === s).length || <span className="text-ink-600">0</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Inspection outcomes"
          actions={
            <button
              className="btn-secondary btn-sm"
              onClick={() =>
                downloadCsv('wearinterval-inspections.csv', [
                  ['inspection_id', 'tool_id', 'inspected_at_utc', 'technician', 'result', 'flank_wear_mm', 'alert_id', 'notes', 'simulated'],
                  ...inspections.map((i) => [i.id, i.toolId, i.inspectedAt, TECHNICIANS.find((t) => t.id === i.technicianId)?.name ?? '', INSPECTION_RESULT_LABEL[i.result], i.flankWearMm ?? '', i.alertId ?? '', i.notes, 'yes']),
                ])
              }
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          }
        >
          <ul className="space-y-2.5">
            {byResult.map(([r, n]) => (
              <li key={r} className="grid grid-cols-[180px_1fr_32px] items-center gap-3 text-sm">
                <span className="text-ink-300">{INSPECTION_RESULT_LABEL[r]}</span>
                <span className="h-2 overflow-hidden rounded-full bg-ink-800">
                  <span className="block h-full rounded-full bg-steel-500" style={{ width: `${(n / maxResult) * 100}%` }} />
                </span>
                <span className="text-right font-mono text-ink-200">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-500">{inspections.length} inspections in total, including any you have recorded in this demo.</p>
        </Card>

        <Card
          title="Alerts"
          actions={
            <button
              className="btn-secondary btn-sm"
              onClick={() =>
                downloadCsv('wearinterval-alerts.csv', [
                  ['alert_id', 'tool_id', 'machine_id', 'feature', 'change_pct', 'z', 'since_utc', 'status', 'assignee', 'simulated'],
                  ...alerts.map((a) => {
                    const st = alertState(a.id)
                    return [a.id, a.toolId, a.machineId, a.feature, a.deviation.pctChange.toFixed(1), a.deviation.z.toFixed(2), a.createdAt, st.status, TECHNICIANS.find((t) => t.id === st.assigneeId)?.name ?? '', 'yes']
                  }),
                ])
              }
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          }
        >
          <ul className="divide-y divide-ink-800 text-sm">
            {alerts.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span className="text-ink-200">
                  <span className="font-mono">{a.id}</span> · {a.toolId}
                </span>
                <span className="font-mono text-ink-300">
                  {fmtPct(a.deviation.pctChange)} · <span className="capitalize">{alertState(a.id).status}</span>
                </span>
              </li>
            ))}
            {alerts.length === 0 && <li className="py-2 text-ink-400">No alerts.</li>}
          </ul>
        </Card>

        <Card title="Data quality (24 h)">
          <ul className="divide-y divide-ink-800 text-sm">
            {MACHINES.map((m) => (
              <li key={m.id} className="flex justify-between gap-2 py-2">
                <span className="font-mono text-ink-200">{m.id}</span>
                <span className="font-mono text-ink-300">
                  {telemetry[m.id].completeness24h.toFixed(0)}% · {telemetry[m.id].missingIntervals.length} gaps (7 d) · {telemetry[m.id].freshness}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
