import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FreshnessBadge, MachineStatusBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { CELLS, MACHINES } from '../data/facility'
import type { MachineStatus } from '../data/types'
import { fmtDateTime } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { PageHeader } from './shared'

export default function Machines() {
  const { assessments, telemetry } = useDemo()
  const { hash } = useLocation()
  const [q, setQ] = useState('')
  const [cell, setCell] = useState('')
  const [status, setStatus] = useState<MachineStatus | ''>('')

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [hash])

  const list = useMemo(
    () =>
      MACHINES.filter((m) => (!cell || m.cellId === cell) && (!status || m.status === status) && (!q || `${m.id} ${m.type} ${m.name}`.toLowerCase().includes(q.toLowerCase()))),
    [q, cell, status],
  )

  return (
    <>
      <PageHeader title="Machines" description="Machine ID, type, cell, operational status, last telemetry update and associated tools." actions={<SimulatedTag />} />
      <div className="mb-4 flex flex-wrap gap-3">
        <input type="search" aria-label="Filter machines" placeholder="Filter by ID or type…" className="field max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Cell" className="field w-auto" value={cell} onChange={(e) => setCell(e.target.value)}>
          <option value="">All cells</option>
          {CELLS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select aria-label="Operational status" className="field w-auto" value={status} onChange={(e) => setStatus(e.target.value as MachineStatus | '')}>
          <option value="">Any status</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="setup">Setup</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((m) => {
          const t = telemetry[m.id]
          const tools = assessments.filter((a) => a.machine.id === m.id)
          return (
            <article key={m.id} id={m.id} className={`panel p-5 ${hash === `#${m.id}` ? 'ring-1 ring-steel-500' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-lg text-white">{m.id}</h2>
                  <p className="text-sm text-ink-300">{m.type}</p>
                  <p className="text-xs text-ink-500">{CELLS.find((c) => c.id === m.cellId)?.name} · {m.controller}</p>
                </div>
                <MachineStatusBadge status={m.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label">Last telemetry</dt>
                  <dd className="mt-1 font-mono text-ink-200">{t.lastReceived ? fmtDateTime(t.lastReceived) : '—'}</dd>
                </div>
                <div>
                  <dt className="label">Freshness</dt>
                  <dd className="mt-1">
                    <FreshnessBadge freshness={t.freshness} ageHours={t.ageHours} />
                  </dd>
                </div>
                <div>
                  <dt className="label">24 h completeness</dt>
                  <dd className={`mt-1 font-mono ${t.completeness24h < 70 ? 'text-stale' : 'text-ink-200'}`}>{t.completeness24h.toFixed(0)}%</dd>
                </div>
              </dl>
              <h3 className="label mt-5">Associated tools</h3>
              <ul className="mt-2 divide-y divide-ink-800 rounded-md border border-ink-700">
                {tools.map((a) => (
                  <li key={a.tool.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                    <Link to={`/monitoring/tools/${a.tool.id}`} className="text-ink-200 hover:text-white">
                      <span className="font-mono text-steel-400">{a.tool.id}</span> · P{a.tool.pocket} · {a.tool.description}
                    </Link>
                    <ToolStateBadge state={a.state} />
                  </li>
                ))}
              </ul>
            </article>
          )
        })}
        {list.length === 0 && <p className="text-sm text-ink-400">No machines match these filters.</p>}
      </div>
    </>
  )
}
