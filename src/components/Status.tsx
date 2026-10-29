import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Eye, FlaskConical, RefreshCw, WifiOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { TOOL_STATE_META, fmtAge, type Freshness, type ToolState } from '../lib/analysis'
import type { AlertStatus, MachineStatus } from '../data/types'

const TONE: Record<string, string> = {
  ok: 'border-ok/40 bg-ok/10 text-ok',
  warn: 'border-warn/45 bg-warn/10 text-warn',
  crit: 'border-crit/45 bg-crit/10 text-crit',
  info: 'border-steel-500/45 bg-steel-500/10 text-steel-300',
  stale: 'border-stale/45 bg-stale/10 text-stale',
  muted: 'border-ink-500 bg-ink-800 text-ink-300',
}

export function Pill({ tone, icon, children, title }: { tone: keyof typeof TONE; icon?: ReactNode; children: ReactNode; title?: string }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${TONE[tone]}`}>
      {icon}
      {children}
    </span>
  )
}

const STATE_ICON: Record<ToolState, ReactNode> = {
  'within-baseline': <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  'review-suggested': <AlertTriangle className="h-3.5 w-3.5" aria-hidden />,
  monitoring: <Eye className="h-3.5 w-3.5" aria-hidden />,
  acknowledged: <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />,
  'not-comparable': <CircleDashed className="h-3.5 w-3.5" aria-hidden />,
  'data-stale': <WifiOff className="h-3.5 w-3.5" aria-hidden />,
  incomplete: <CircleDashed className="h-3.5 w-3.5" aria-hidden />,
  'baseline-pending': <RefreshCw className="h-3.5 w-3.5" aria-hidden />,
}

export function ToolStateBadge({ state }: { state: ToolState }) {
  const m = TOOL_STATE_META[state]
  return (
    <Pill tone={m.tone} icon={STATE_ICON[state]} title={m.help}>
      {m.label}
    </Pill>
  )
}

const FRESH: Record<Freshness, { tone: keyof typeof TONE; label: string }> = {
  current: { tone: 'ok', label: 'Current' },
  delayed: { tone: 'warn', label: 'Delayed' },
  stale: { tone: 'stale', label: 'Outdated' },
  none: { tone: 'muted', label: 'No data' },
}

export function FreshnessBadge({ freshness, ageHours, compact }: { freshness: Freshness; ageHours: number; compact?: boolean }) {
  const f = FRESH[freshness]
  return (
    <Pill tone={f.tone} icon={freshness === 'stale' ? <WifiOff className="h-3.5 w-3.5" aria-hidden /> : <Clock className="h-3.5 w-3.5" aria-hidden />}>
      {f.label}
      {!compact && <span className="font-mono font-normal opacity-80">· {fmtAge(ageHours)}</span>}
    </Pill>
  )
}

const MACHINE: Record<MachineStatus, { tone: keyof typeof TONE; label: string }> = {
  running: { tone: 'ok', label: 'Running' },
  idle: { tone: 'muted', label: 'Idle' },
  setup: { tone: 'info', label: 'Setup' },
  offline: { tone: 'stale', label: 'Offline' },
}

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  const m = MACHINE[status]
  return (
    <Pill tone={m.tone} icon={<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}>
      {m.label}
    </Pill>
  )
}

const ALERT: Record<AlertStatus, { tone: keyof typeof TONE; label: string }> = {
  open: { tone: 'warn', label: 'Open' },
  assigned: { tone: 'info', label: 'Assigned' },
  reviewed: { tone: 'info', label: 'Reviewed' },
  resolved: { tone: 'ok', label: 'Resolved' },
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const a = ALERT[status]
  return <Pill tone={a.tone}>{a.label}</Pill>
}

export function SimulatedTag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border border-ink-600 bg-ink-800/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-300 ${className}`}>
      <FlaskConical className="h-3 w-3" aria-hidden /> Simulated data
    </span>
  )
}
