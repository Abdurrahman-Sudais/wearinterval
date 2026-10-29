import { AlertTriangle, ArrowRight, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertStatusBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { TECHNICIANS } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import type { AlertStatus } from '../data/types'
import { fmtDateTime, fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, PageHeader } from './shared'

const TABS: (AlertStatus | 'all')[] = ['all', 'open', 'assigned', 'reviewed', 'resolved']

export default function InspectionQueue() {
  const { alerts, alertState, assessments } = useDemo()
  const [tab, setTab] = useState<AlertStatus | 'all'>('all')
  const [q, setQ] = useState('')
  const list = alerts.filter((a) => (tab === 'all' || alertState(a.id).status === tab) && (!q || `${a.id} ${a.toolId} ${a.machineId} ${a.title}`.toLowerCase().includes(q.toLowerCase())))
  const holds = assessments.filter((a) => a.notCurrent || a.state === 'not-comparable' || a.state === 'baseline-pending')

  return (
    <>
      <PageHeader title="Inspection queue" description="Alerts suggest tools that may need inspection. Open an alert to review the evidence, assign a technician and record the result." actions={<SimulatedTag />} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Alert status" className="inline-flex overflow-hidden rounded-md border border-ink-600">
          {TABS.map((t) => {
            const count = t === 'all' ? alerts.length : alerts.filter((a) => alertState(a.id).status === t).length
            return (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs capitalize ${tab === t ? 'bg-steel-500 text-ink-950' : 'text-ink-300 hover:bg-ink-800'}`}>
                {t} <span className="font-mono opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
        <input type="search" aria-label="Search alerts" placeholder="Search alerts…" className="field h-8 max-w-xs py-1 text-xs" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-ink-850 text-xs text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Alert</th>
              <th className="px-4 py-3 font-medium">Tool / machine</th>
              <th className="px-4 py-3 font-medium">Change vs baseline</th>
              <th className="px-4 py-3 font-medium">Since (UTC)</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-900">
            {list.map((a) => {
              const st = alertState(a.id)
              return (
                <tr key={a.id} className="hover:bg-ink-850">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                      <div>
                        <div className="font-mono text-xs text-ink-400">{a.id}</div>
                        <div className="text-white">{a.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-200">
                    {a.toolId}
                    <div className="text-xs text-ink-500">{a.machineId}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-200">
                    {FEATURE_BY_KEY[a.feature].shortLabel} <span className="font-mono text-warn">{fmtPct(a.deviation.pctChange)}</span>
                    <div className="text-xs text-ink-500">{a.deviation.z.toFixed(1)}σ · {a.compared.length} obs. compared</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-300">{fmtDateTime(a.createdAt)}</td>
                  <td className="px-4 py-3 text-ink-300">{TECHNICIANS.find((t) => t.id === st.assigneeId)?.name ?? <span className="text-ink-500">Unassigned</span>}</td>
                  <td className="px-4 py-3">
                    <AlertStatusBadge status={st.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/monitoring/inspections/${a.id}`} className="btn-secondary btn-sm">
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-400">
                  No alerts in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <Card title="Tools without a current comparison">
          <p className="mb-3 text-sm text-ink-400">These tools can’t produce a current alert because data is outdated or incomplete, conditions have changed, or a new baseline is pending. Consider a manual check.</p>
          <ul className="divide-y divide-ink-800">
            {holds.map((a) => (
              <li key={a.tool.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <Link to={`/monitoring/tools/${a.tool.id}`} className="flex items-center gap-2 text-ink-200 hover:text-white">
                  {a.notCurrent && <WifiOff className="h-4 w-4 text-stale" aria-hidden />}
                  <span className="font-mono text-steel-400">{a.tool.id}</span> {a.tool.type} · {a.machine.id}
                </Link>
                <ToolStateBadge state={a.state} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
