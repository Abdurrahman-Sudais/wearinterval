import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FreshnessBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { CELLS, MACHINES } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import { TOOL_STATE_META, fmtDateTime, fmtPct, type ToolState } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { PageHeader } from './shared'

export default function Tools() {
  const { assessments } = useDemo()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const cell = params.get('cell') ?? ''
  const machine = params.get('machine') ?? ''
  const state = (params.get('state') ?? '') as ToolState | ''

  const update = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v)
    else next.delete(k)
    setParams(next, { replace: true })
  }

  const list = useMemo(
    () =>
      assessments.filter(
        (a) =>
          (!cell || a.machine.cellId === cell) &&
          (!machine || a.machine.id === machine) &&
          (!state || a.state === state) &&
          (!q || `${a.tool.id} ${a.tool.type} ${a.tool.description} ${a.tool.workpieceMaterial} ${a.tool.grade}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [assessments, q, cell, machine, state],
  )

  return (
    <>
      <PageHeader title="Cutting tools" description="Every tool with its machine, workpiece, grade, baseline reference, latest observation and condition status." actions={<SimulatedTag />} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input type="search" aria-label="Search tools" placeholder="Search ID, type, material, grade…" className="field max-w-xs" value={q} onChange={(e) => update('q', e.target.value)} />
        <select aria-label="Cell" className="field w-auto" value={cell} onChange={(e) => update('cell', e.target.value)}>
          <option value="">All cells</option>
          {CELLS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select aria-label="Machine" className="field w-auto" value={machine} onChange={(e) => update('machine', e.target.value)}>
          <option value="">All machines</option>
          {MACHINES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
        <select aria-label="Condition status" className="field w-auto" value={state} onChange={(e) => update('state', e.target.value)}>
          <option value="">Any status</option>
          {(Object.keys(TOOL_STATE_META) as ToolState[]).map((s) => (
            <option key={s} value={s}>
              {TOOL_STATE_META[s].label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-ink-850 text-xs text-ink-400">
            <tr>
              <th className="px-4 py-3 font-medium">Tool</th>
              <th className="px-4 py-3 font-medium">Machine</th>
              <th className="px-4 py-3 font-medium">Workpiece / grade</th>
              <th className="px-4 py-3 font-medium">Conditions</th>
              <th className="px-4 py-3 font-medium">Baseline</th>
              <th className="px-4 py-3 font-medium">Latest observation</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800 bg-ink-900">
            {list.map((a) => {
              const lead = a.raw.primary ?? a.raw.deviations.reduce((m, d) => (Math.abs(d.pctChange) > Math.abs(m.pctChange) ? d : m), a.raw.deviations[0])
              return (
                <tr key={a.tool.id} className="hover:bg-ink-850">
                  <td className="px-4 py-3">
                    <Link to={`/monitoring/tools/${a.tool.id}`} className="font-mono text-steel-400 hover:text-steel-300">
                      {a.tool.id}
                    </Link>
                    <div className="text-xs text-ink-400">{a.tool.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-ink-200">{a.machine.id}</div>
                    <div className="text-xs text-ink-500">{a.machine.cellId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink-200">{a.tool.workpieceMaterial}</div>
                    <div className="text-xs text-ink-500">{a.tool.grade}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-300">
                    {a.tool.conditions.spindleRpm} rpm
                    <br />
                    {a.tool.conditions.feedMmMin} mm/min
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-300">
                    <div className="font-mono">{a.raw.baseline.id}</div>
                    <div className="text-ink-500">{a.raw.baseline.observationCount} obs.</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-mono text-ink-300">{a.raw.latestObservation ? fmtDateTime(a.raw.latestObservation.recordedAt) : '—'}</div>
                    <div className="mt-1">
                      <FreshnessBadge freshness={a.telemetry.freshness} ageHours={a.telemetry.ageHours} compact />
                    </div>
                    {lead && Number.isFinite(lead.pctChange) && (
                      <div className="mt-1 text-ink-500">
                        {FEATURE_BY_KEY[lead.key].shortLabel} {fmtPct(lead.pctChange)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ToolStateBadge state={a.state} />
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-400">
                  No tools match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
