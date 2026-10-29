import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SimulatedTag, ToolStateBadge } from '../components/Status'
import { ChartLegend, TrendChart } from '../components/TrendChart'
import { CELLS } from '../data/facility'
import { FEATURE_BY_KEY, availableFeatures } from '../data/simulate'
import type { FeatureKey, ObservationType } from '../data/types'
import { fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { ObservationFilter, RangeFilter, defaultRange, resolveRange } from './filters'
import { Card, PageHeader } from './shared'

export default function Trends() {
  const { assessments, settings } = useDemo()
  const [range, setRange] = useState(defaultRange('7d'))
  const [type, setType] = useState<ObservationType>('vibration')
  const [feature, setFeature] = useState<FeatureKey>('vibBand')
  const [cell, setCell] = useState('')
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  const { from, to } = resolveRange(range)

  const list = assessments.filter(
    (a) => availableFeatures(a.tool.id).includes(feature) && (!cell || a.machine.cellId === cell) && (!onlyFlagged || a.raw.deviations.find((d) => d.key === feature)?.flagged),
  )

  return (
    <>
      <PageHeader title="Condition trends" description="Compare one observation feature across tools, each against its own baseline. Select a tool to open its detail view." actions={<SimulatedTag />} />
      <div className="panel mb-6 flex flex-wrap items-center gap-3 p-3">
        <ObservationFilter
          type={type}
          feature={feature}
          onChange={(t, f) => {
            setType(t)
            setFeature(f)
          }}
        />
        <RangeFilter value={range} onChange={setRange} />
        <select aria-label="Cell" className="field h-8 w-auto py-1 text-xs" value={cell} onChange={(e) => setCell(e.target.value)}>
          <option value="">All cells</option>
          {CELLS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-xs text-ink-300">
          <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} className="accent-[#4fb3d9]" />
          Only differing from baseline
        </label>
      </div>

      <div className="mb-4">
        <ChartLegend />
      </div>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {list.map((a) => {
          const d = a.raw.deviations.find((x) => x.key === feature)
          return (
            <Card
              key={a.tool.id}
              title={
                <Link to={`/monitoring/tools/${a.tool.id}`} className="hover:text-steel-300">
                  <span className="font-mono">{a.tool.id}</span> <span className="font-normal text-ink-400">· {a.machine.id} · {a.tool.type}</span>
                </Link>
              }
              actions={<ToolStateBadge state={a.state} />}
            >
              <div className="mb-1 text-xs text-ink-400">
                {FEATURE_BY_KEY[feature].shortLabel}
                {d && Number.isFinite(d.pctChange) ? ` · recent ${fmtPct(d.pctChange)} vs baseline` : ' · no comparable recent observations'}
              </div>
              <TrendChart assessment={a} feature={feature} from={from} to={to} settings={settings} height={180} compact showInspections />
            </Card>
          )
        })}
        {list.length === 0 && <p className="text-sm text-ink-400">No tools match these filters.</p>}
      </div>
    </>
  )
}
