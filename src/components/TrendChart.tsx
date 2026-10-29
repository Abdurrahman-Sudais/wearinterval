import { useMemo, type ReactNode } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import { FEATURE_BY_KEY, getObservations } from '../data/simulate'
import type { FeatureKey, Inspection } from '../data/types'
import { INSPECTION_RESULT_LABEL, fmtDateTime, isComparable, type AnalysisSettings, type ToolAssessment } from '../lib/analysis'

export const CHART = {
  series: '#4fb3d9',
  excluded: '#7a899c',
  baseline: '#cdd4dd',
  band: '#a7b2c0',
  grid: '#24313f',
  axis: '#7a899c',
  compared: '#e0a640',
  inspection: '#a28ee6',
}

interface Point {
  t: number
  value: number
  comparable: boolean
  rpm: number
  feed: number
}

export function TrendChart({
  assessment,
  feature,
  from,
  to,
  settings,
  height = 300,
  compact = false,
  showInspections = true,
}: {
  assessment: ToolAssessment
  feature: FeatureKey
  from?: number
  to?: number
  settings: AnalysisSettings
  height?: number
  compact?: boolean
  showInspections?: boolean
}) {
  const { raw, inspections } = assessment
  const base = raw.baseline.features[feature]
  const def = FEATURE_BY_KEY[feature]

  const data: Point[] = useMemo(
    () =>
      getObservations()[assessment.tool.id]
        .filter((o) => {
          const t = Date.parse(o.recordedAt)
          return (from === undefined || t >= from) && (to === undefined || t <= to)
        })
        .map((o) => ({
          t: Date.parse(o.recordedAt),
          value: o.features[feature],
          comparable: isComparable(raw.baseline.conditions, o.conditions, settings),
          rpm: o.conditions.spindleRpm,
          feed: o.conditions.feedMmMin,
        })),
    [assessment.tool.id, feature, from, to, raw.baseline.conditions, settings],
  )

  if (!data.length || !base) {
    return (
      <div className="grid place-items-center rounded-md border border-dashed border-ink-600 text-sm text-ink-400" style={{ height }}>
        No observations in the selected range.
      </div>
    )
  }

  const tMin = data[0].t
  const tMax = data[data.length - 1].t
  const bStart = Date.parse(raw.baseline.windowStart)
  const bEnd = Date.parse(raw.baseline.windowEnd)
  const cmp = raw.comparableRecent
  const cStart = cmp.length ? Date.parse(cmp[0].recordedAt) : null
  const cEnd = cmp.length ? Date.parse(cmp[cmp.length - 1].recordedAt) : null
  const visibleInspections = showInspections ? inspections.filter((i) => {
    const t = Date.parse(i.inspectedAt)
    return t >= tMin && t <= tMax
  }) : []
  const clampX = (x: number) => Math.min(Math.max(x, tMin), tMax)

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: compact ? -18 : 0 }}>
          <CartesianGrid stroke={CHART.grid} strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={[tMin, tMax]}
            tickFormatter={(t) => new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })}
            stroke={CHART.axis}
            tick={{ fontSize: 11, fill: CHART.axis }}
            tickLine={false}
            axisLine={{ stroke: CHART.grid }}
            minTickGap={40}
          />
          <YAxis
            stroke={CHART.axis}
            tick={{ fontSize: 11, fill: CHART.axis }}
            tickLine={false}
            axisLine={false}
            width={compact ? 46 : 56}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => (v >= 10 ? v.toFixed(0) : v.toFixed(2))}
            label={compact ? undefined : { value: def.unit, angle: -90, position: 'insideLeft', fill: CHART.axis, fontSize: 11, dx: 6 }}
          />
          {/* Baseline window (x) and ±2σ band (y) */}
          {bEnd >= tMin && bStart <= tMax && <ReferenceArea x1={clampX(bStart)} x2={clampX(bEnd)} fill={CHART.band} fillOpacity={0.07} ifOverflow="hidden" />}
          <ReferenceArea y1={base.mean - 2 * base.std} y2={base.mean + 2 * base.std} fill={CHART.band} fillOpacity={0.09} ifOverflow="hidden" />
          <ReferenceLine y={base.mean} stroke={CHART.baseline} strokeDasharray="6 4" strokeWidth={1.2} ifOverflow="extendDomain" />
          {cStart !== null && cEnd !== null && cEnd >= tMin && (
            <ReferenceArea x1={clampX(cStart)} x2={clampX(cEnd)} fill={CHART.compared} fillOpacity={0.08} stroke={CHART.compared} strokeOpacity={0.35} ifOverflow="hidden" />
          )}
          {visibleInspections.map((i) => (
            <ReferenceLine key={i.id} x={Date.parse(i.inspectedAt)} stroke={CHART.inspection} strokeDasharray="2 3" strokeWidth={1.2} />
          ))}
          <Tooltip content={<ChartTooltip unit={def.unit} inspections={visibleInspections} />} cursor={{ stroke: CHART.axis, strokeWidth: 1 }} />
          <Line
            type="linear"
            dataKey="value"
            stroke={CHART.series}
            strokeWidth={2}
            isAnimationActive={false}
            dot={(props: { cx?: number; cy?: number; payload?: Point; index?: number }) => {
              const { cx, cy, payload, index } = props
              if (cx === undefined || cy === undefined || !payload || payload.comparable) return <g key={index} />
              return <circle key={index} cx={cx} cy={cy} r={3.5} fill="#0d131a" stroke={CHART.excluded} strokeWidth={1.5} />
            }}
            activeDot={{ r: 5, stroke: '#0d131a', strokeWidth: 2, fill: CHART.series }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ChartTooltip({ active, payload, unit, inspections }: TooltipProps<number, string> & { unit: string; inspections: Inspection[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as Point
  const near = inspections.find((i) => Math.abs(Date.parse(i.inspectedAt) - p.t) < 45 * 60_000)
  return (
    <div className="rounded-md border border-ink-600 bg-ink-900/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-ink-400">{fmtDateTime(new Date(p.t).toISOString())} UTC</div>
      <div className="mt-1 text-sm font-semibold text-white">
        {p.value.toFixed(3)} <span className="font-normal text-ink-300">{unit}</span>
      </div>
      <div className="mt-1 text-ink-300">
        {p.rpm} rpm · {p.feed} mm/min
      </div>
      <div className={p.comparable ? 'text-ink-300' : 'text-warn'}>{p.comparable ? 'Conditions within tolerance of baseline' : 'Conditions outside tolerance — excluded'}</div>
      {near && <div className="mt-1 text-stale">Inspection: {INSPECTION_RESULT_LABEL[near.result]}</div>}
    </div>
  )
}

export function ChartLegend() {
  const item = (swatch: ReactNode, label: string) => (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {label}
    </span>
  )
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-300">
      {item(<span className="h-0.5 w-4 rounded" style={{ background: CHART.series }} />, 'Observation')}
      {item(<span className="h-0 w-4 border-t border-dashed" style={{ borderColor: CHART.baseline }} />, 'Baseline mean')}
      {item(<span className="h-3 w-4 rounded-sm" style={{ background: CHART.band, opacity: 0.25 }} />, 'Baseline ±2σ')}
      {item(<span className="h-3 w-4 rounded-sm border" style={{ background: 'rgba(224,166,64,.12)', borderColor: 'rgba(224,166,64,.5)' }} />, 'Compared window')}
      {item(<span className="h-3 w-0 border-l border-dashed" style={{ borderColor: CHART.inspection }} />, 'Inspection')}
      {item(<span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: CHART.excluded }} />, 'Excluded (conditions differ)')}
    </div>
  )
}
