import { AlertTriangle, ArrowLeft, ArrowRight, ClipboardPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AiPanel } from '../components/AiPanel'
import { AlertStatusBadge, FreshnessBadge, MachineStatusBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { ChartLegend, TrendChart } from '../components/TrendChart'
import { CELLS } from '../data/facility'
import { FEATURE_BY_KEY, getObservations } from '../data/simulate'
import type { FeatureKey, ObservationType } from '../data/types'
import { TOOL_STATE_META, alertIdFor, fmtDateTime, fmtPct, isComparable } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { RangeFilter, ObservationFilter, defaultRange, resolveRange } from './filters'
import { Card, InspectionForm, InspectionHistory, NotCurrentWarning, PageHeader } from './shared'

export default function ToolDetail() {
  const { toolId = '' } = useParams()
  const { assessmentById, alerts, alertState, settings } = useDemo()
  const a = assessmentById[toolId]
  const alert = alerts.find((x) => x.id === alertIdFor(toolId))
  const [range, setRange] = useState(defaultRange('14d'))
  const [obsType, setObsType] = useState<ObservationType>((alert && FEATURE_BY_KEY[alert.feature].type) || 'vibration')
  const [feature, setFeature] = useState<FeatureKey>(alert?.feature ?? 'vibBand')
  const [showForm, setShowForm] = useState(false)
  const { from, to } = resolveRange(range)

  const recentObs = useMemo(() => {
    if (!a) return []
    return getObservations()[a.tool.id]
      .filter((o) => {
        const t = Date.parse(o.recordedAt)
        return t >= from && t <= to
      })
      .slice(-12)
      .reverse()
  }, [a, from, to])

  if (!a) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-ink-300">Tool “{toolId}” was not found.</p>
        <Link to="/monitoring/tools" className="btn-secondary mt-4">
          Back to tools
        </Link>
      </div>
    )
  }

  const { tool, machine, raw, telemetry } = a
  const def = FEATURE_BY_KEY[feature]
  const base = raw.baseline.features[feature]
  const dev = raw.deviations.find((d) => d.key === feature)

  return (
    <>
      <Link to="/monitoring/tools" className="mb-3 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> All cutting tools
      </Link>
      <PageHeader
        title={`${tool.id} · ${tool.type}`}
        description={`${tool.description} — ${tool.operation}`}
        actions={
          <>
            <SimulatedTag />
            <button className="btn-primary btn-sm" onClick={() => setShowForm((s) => !s)} aria-expanded={showForm}>
              {showForm ? <X className="h-3.5 w-3.5" /> : <ClipboardPlus className="h-3.5 w-3.5" />} {showForm ? 'Close' : 'Record inspection'}
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ToolStateBadge state={a.state} />
        <FreshnessBadge freshness={telemetry.freshness} ageHours={telemetry.ageHours} />
        <span className="text-xs text-ink-400">{TOOL_STATE_META[a.state].help}</span>
      </div>

      <div className="space-y-4">
        <NotCurrentWarning assessment={a} />
        {alert && (
          <Link to={`/monitoring/inspections/${alert.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warn/40 bg-warn/10 p-4 hover:border-warn/70">
            <span className="flex items-start gap-3 text-sm">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden />
              <span>
                <span className="font-medium text-white">{alert.title}</span>
                <span className="block text-ink-300">{alert.summary}</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <AlertStatusBadge status={alertState(alert.id).status} />
              <span className="inline-flex items-center gap-1 text-xs text-warn">
                Open alert <ArrowRight className="h-3 w-3" />
              </span>
            </span>
          </Link>
        )}
        {showForm && (
          <Card title={`Record inspection for ${tool.id}`}>
            <InspectionForm toolId={tool.id} alertId={alert && alertState(alert.id).status !== 'resolved' ? alert.id : undefined} defaultTechnicianId={alert ? alertState(alert.id).assigneeId : undefined} onDone={() => undefined} />
          </Card>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <Card
            title="Condition trend"
            actions={
              <div className="flex flex-wrap gap-2">
                <ObservationFilter
                  toolId={tool.id}
                  type={obsType}
                  feature={feature}
                  onChange={(t, f) => {
                    setObsType(t)
                    setFeature(f)
                  }}
                />
                <RangeFilter value={range} onChange={setRange} />
              </div>
            }
          >
            <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-400">
              <span>{def.label} ({def.unit})</span>
              {base && (
                <span>
                  Baseline mean <span className="font-mono text-ink-200">{base.mean.toFixed(3)}</span> ± <span className="font-mono text-ink-200">{base.std.toFixed(3)}</span> (n={base.n})
                </span>
              )}
              {dev && Number.isFinite(dev.pctChange) && (
                <span>
                  Recent comparable mean <span className={`font-mono ${dev.flagged ? 'text-warn' : 'text-ink-200'}`}>{dev.recent.mean.toFixed(3)}</span> ({fmtPct(dev.pctChange)}, {dev.z.toFixed(1)}σ)
                </span>
              )}
            </div>
            <TrendChart assessment={a} feature={feature} from={from} to={to} settings={settings} height={320} />
            <div className="mt-3">
              <ChartLegend />
            </div>
          </Card>

          <Card title="Operating-condition context">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-xs text-ink-400">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Parameter</th>
                    <th className="py-2 pr-3 text-right font-medium">Baseline</th>
                    <th className="py-2 pr-3 text-right font-medium">Recent (mean)</th>
                    <th className="py-2 pr-3 text-right font-medium">Difference</th>
                    <th className="py-2 font-medium">Tolerance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800">
                  {raw.conditionDiffs.map((d) => (
                    <tr key={d.param}>
                      <td className="py-2 pr-3 text-ink-200">{d.label}</td>
                      <td className="py-2 pr-3 text-right font-mono text-ink-300">{d.baseline}</td>
                      <td className="py-2 pr-3 text-right font-mono text-ink-300">{d.observed}</td>
                      <td className="py-2 pr-3 text-right font-mono text-ink-300">{d.pctDiff === null ? (d.within ? 'same' : 'changed') : fmtPct(d.pctDiff)}</td>
                      <td className="py-2">
                        <span className={d.within ? 'text-ok' : 'text-warn'}>{d.within ? 'Within' : 'Outside'}</span>
                        {d.tolerancePct !== null && <span className="ml-1 text-xs text-ink-500">±{d.tolerancePct}%</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-400">
              Baseline <span className="font-mono">{raw.baseline.id}</span>: {raw.baseline.label}, {raw.baseline.observationCount} observations, {fmtDateTime(raw.baseline.windowStart)} – {fmtDateTime(raw.baseline.windowEnd)} UTC.
            </p>
          </Card>

          <Card title="Recent observations" actions={<span className="text-xs text-ink-500">Latest 12 in selected range</span>}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-xs text-ink-400">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Recorded (UTC)</th>
                    {raw.deviations.map((d) => (
                      <th key={d.key} className="py-2 pr-3 text-right font-medium">
                        {FEATURE_BY_KEY[d.key].shortLabel}
                      </th>
                    ))}
                    <th className="py-2 pr-3 text-right font-medium">rpm</th>
                    <th className="py-2 pr-3 text-right font-medium">Feed</th>
                    <th className="py-2 font-medium">Comparable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800 font-mono text-xs text-ink-300">
                  {recentObs.map((o) => {
                    const ok = isComparable(raw.baseline.conditions, o.conditions, settings)
                    return (
                      <tr key={o.id}>
                        <td className="py-1.5 pr-3 text-ink-400">{fmtDateTime(o.recordedAt)}</td>
                        {raw.deviations.map((d) => (
                          <td key={d.key} className="py-1.5 pr-3 text-right">
                            {o.features[d.key].toFixed(d.key === 'aePeak' ? 1 : 3)}
                          </td>
                        ))}
                        <td className="py-1.5 pr-3 text-right">{o.conditions.spindleRpm}</td>
                        <td className="py-1.5 pr-3 text-right">{o.conditions.feedMmMin}</td>
                        <td className={`py-1.5 font-sans ${ok ? 'text-ink-300' : 'text-warn'}`}>{ok ? 'Yes' : 'No — outside tolerance'}</td>
                      </tr>
                    )
                  })}
                  {recentObs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-4 text-center font-sans text-ink-500">
                        No observations in this range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <AiPanel assessment={a} />
          <Card title="Tool record">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ['Machine', <Link key="m" to={`/monitoring/machines#${machine.id}`} className="font-mono text-steel-400 hover:text-steel-300">{machine.id}</Link>],
                ['Cell', CELLS.find((c) => c.id === machine.cellId)?.id],
                ['Machine status', <MachineStatusBadge key="s" status={machine.status} />],
                ['Pocket', `P${tool.pocket}`],
                ['Workpiece', tool.workpieceMaterial],
                ['Tool material', tool.toolMaterial],
                ['Grade', tool.grade],
                ['Diameter', `${tool.diameterMm} mm`],
                ['Installed', `${fmtDateTime(tool.installedAt)} UTC`],
                ['Coolant', tool.conditions.coolant],
                ['Last telemetry', telemetry.lastReceived ? `${fmtDateTime(telemetry.lastReceived)} UTC` : '—'],
                ['24 h completeness', `${telemetry.completeness24h.toFixed(0)}%`],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="label">{k}</dt>
                  <dd className="mt-0.5 text-ink-200">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card title="Inspection history & notes">
            <InspectionHistory assessment={a} />
          </Card>
        </div>
      </div>
    </>
  )
}
