import { Activity, ArrowLeft, ClipboardList, Cpu, FileText, FlaskConical, LayoutDashboard, LineChart, Radio, Search, Settings, Wrench } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { usePageMeta } from '../components/Seo'
import { FACILITY, MACHINES } from '../data/facility'
import { fmtDateTime } from '../lib/analysis'
import { useDemo } from '../lib/store'

const NAV = [
  { to: '/monitoring', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/monitoring/machines', label: 'Machines', icon: Cpu },
  { to: '/monitoring/tools', label: 'Cutting Tools', icon: Wrench },
  { to: '/monitoring/trends', label: 'Condition Trends', icon: LineChart },
  { to: '/monitoring/inspections', label: 'Inspection Queue', icon: ClipboardList, badge: true },
  { to: '/monitoring/telemetry', label: 'Telemetry', icon: Radio },
  { to: '/monitoring/reports', label: 'Reports', icon: FileText },
  { to: '/monitoring/settings', label: 'Settings', icon: Settings },
]

function GlobalSearch() {
  const { assessments } = useDemo()
  const [q, setQ] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    const tools = assessments
      .filter((a) => [a.tool.id, a.tool.type, a.tool.description, a.tool.workpieceMaterial, a.machine.id].some((x) => x.toLowerCase().includes(s)))
      .map((a) => ({ to: `/monitoring/tools/${a.tool.id}`, label: a.tool.id, sub: `${a.tool.type} · ${a.machine.id}` }))
    const machines = MACHINES.filter((m) => [m.id, m.type, m.name].some((x) => x.toLowerCase().includes(s))).map((m) => ({ to: `/monitoring/machines#${m.id}`, label: m.id, sub: m.type }))
    return [...tools, ...machines].slice(0, 8)
  }, [q, assessments])

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden />
      <input
        type="search"
        aria-label="Search tools and machines"
        placeholder="Search tools, machines, materials…"
        className="field h-9 pl-9"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            navigate(results[0].to)
            setQ('')
          }
        }}
      />
      {focused && results.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-ink-600 bg-ink-850 shadow-xl" role="listbox">
          {results.map((r) => (
            <li key={r.to}>
              <Link to={r.to} onClick={() => setQ('')} className="block px-3 py-2 hover:bg-ink-750">
                <span className="font-mono text-sm text-white">{r.label}</span>
                <span className="ml-2 text-xs text-ink-400">{r.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MonitoringLayout() {
  usePageMeta({ title: 'Monitoring dashboard (demo)', description: 'Interactive Wearinterval monitoring dashboard with simulated machining cells, cutting tools, condition trends and inspection workflow.', path: '/monitoring' })
  const { alerts, alertState, now } = useDemo()
  const openCount = alerts.filter((a) => alertState(a.id).status !== 'resolved').length

  return (
    <div className="min-h-screen bg-ink-950 lg:grid lg:grid-cols-[232px_1fr]">
      <a href="#dash-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-steel-500 focus:px-3 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <aside className="border-b border-ink-800 bg-ink-900 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-14 items-center justify-between px-4 lg:h-16">
          <Link to="/" aria-label="Wearinterval home">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'bg-ink-800 text-white' : 'text-ink-300 hover:bg-ink-850 hover:text-white'}`
              }
            >
              <n.icon className="h-4 w-4" aria-hidden />
              {n.label}
              {n.badge && openCount > 0 && (
                <span className="ml-auto rounded-full bg-warn/15 px-1.5 font-mono text-[11px] text-warn" aria-label={`${openCount} open alerts`}>
                  {openCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-4 lg:absolute lg:bottom-4 lg:block lg:w-[232px]">
          <div className="rounded-md border border-ink-700 bg-ink-850 p-3 text-xs text-ink-400">
            <div className="flex items-center gap-1.5 font-medium text-ink-200">
              <FlaskConical className="h-3.5 w-3.5 text-steel-400" aria-hidden /> Demonstration
            </div>
            <p className="mt-1">All machines, tools, readings and people are fictional. No sensors are connected.</p>
          </div>
          <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="border-b border-warn/25 bg-warn/[0.07] px-4 py-1.5 text-center text-xs text-warn sm:px-6">
          Simulated data · {FACILITY.name}. Readings are generated in your browser and are not from physical sensors.
        </div>
        <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-ink-800 bg-ink-950/90 px-4 py-3 backdrop-blur sm:px-6">
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2 font-mono text-xs text-ink-400" title="The demo uses a fixed clock so the scenario is reproducible.">
            <Activity className="h-3.5 w-3.5 text-steel-400" aria-hidden />
            Demo clock {fmtDateTime(new Date(now).toISOString())} UTC
          </div>
        </header>
        <main id="dash-main" className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
