// Pure calculation layer: baselines, condition comparability, telemetry quality,
// tool assessments and alert construction. No React or UI code lives here.
//
// These rules are deliberately simple, transparent statistics for demonstration.
// A deviation from baseline is a reason to look at a tool — not a validated
// prediction of tool failure or remaining useful life.

import { DEMO_NOW, HOUR, MACHINES, TOOLS } from '../data/facility'
import { FEATURE_BY_KEY, availableFeatures, getObservations, isOperatingHour } from '../data/simulate'
import type {
  AlertWorkflowState,
  CuttingConditions,
  CuttingTool,
  FeatureKey,
  Inspection,
  Machine,
  Observation,
} from '../data/types'

export interface AnalysisSettings {
  /** Standardised difference between recent and baseline means that triggers a review suggestion. */
  zThreshold: number
  /** Minimum relative change (%) required alongside the z threshold. */
  minPctChange: number
  /** Number of most recent comparable observations averaged for comparison. */
  recentCount: number
  rpmTolerancePct: number
  feedTolerancePct: number
  /** Telemetry older than this is treated as outdated. */
  staleAfterHours: number
  /** Minimum 24 h completeness (%) for an assessment to be presented as current. */
  minCompletenessPct: number
}

export const DEFAULT_SETTINGS: AnalysisSettings = {
  zThreshold: 3,
  minPctChange: 15,
  recentCount: 8,
  rpmTolerancePct: 5,
  feedTolerancePct: 10,
  staleAfterHours: 3,
  minCompletenessPct: 70,
}

export interface Stats {
  mean: number
  std: number
  n: number
}

export function stats(values: number[]): Stats {
  const v = values.filter((x) => Number.isFinite(x))
  const n = v.length
  if (n === 0) return { mean: NaN, std: NaN, n: 0 }
  const mean = v.reduce((a, b) => a + b, 0) / n
  const variance = n > 1 ? v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0
  return { mean, std: Math.sqrt(variance), n }
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(xs.length, 1)

export function meanConditions(obs: Observation[], fallback: CuttingConditions): CuttingConditions {
  if (!obs.length) return fallback
  return {
    spindleRpm: Math.round(avg(obs.map((o) => o.conditions.spindleRpm))),
    feedMmMin: Math.round(avg(obs.map((o) => o.conditions.feedMmMin))),
    axialDocMm: +avg(obs.map((o) => o.conditions.axialDocMm)).toFixed(2),
    radialWocMm: +avg(obs.map((o) => o.conditions.radialWocMm)).toFixed(2),
    coolant: obs[obs.length - 1].conditions.coolant,
  }
}

/* ------------------------------------------------------------------ */
/* Operating-condition comparability                                   */
/* ------------------------------------------------------------------ */

export interface ConditionDifference {
  param: 'spindleRpm' | 'feedMmMin' | 'axialDocMm' | 'radialWocMm' | 'coolant'
  label: string
  baseline: number | string
  observed: number | string
  pctDiff: number | null
  tolerancePct: number | null
  within: boolean
}

export function compareConditions(base: CuttingConditions, obs: CuttingConditions, s: AnalysisSettings): ConditionDifference[] {
  const pct = (a: number, b: number) => ((b - a) / a) * 100
  const num = (param: ConditionDifference['param'], label: string, tol: number): ConditionDifference => {
    const b = base[param] as number
    const o = obs[param] as number
    const d = pct(b, o)
    return { param, label, baseline: b, observed: o, pctDiff: d, tolerancePct: tol, within: Math.abs(d) <= tol }
  }
  return [
    num('spindleRpm', 'Spindle speed (rpm)', s.rpmTolerancePct),
    num('feedMmMin', 'Feed rate (mm/min)', s.feedTolerancePct),
    num('axialDocMm', 'Axial depth of cut (mm)', 10),
    num('radialWocMm', 'Radial width of cut (mm)', 10),
    { param: 'coolant', label: 'Coolant', baseline: base.coolant, observed: obs.coolant, pctDiff: null, tolerancePct: null, within: base.coolant === obs.coolant },
  ]
}

export const isComparable = (base: CuttingConditions, obs: CuttingConditions, s: AnalysisSettings) =>
  compareConditions(base, obs, s).every((d) => d.within)

/* ------------------------------------------------------------------ */
/* Baselines                                                           */
/* ------------------------------------------------------------------ */

export interface Baseline {
  id: string
  toolId: string
  label: string
  windowStart: string
  windowEnd: string
  observationCount: number
  conditions: CuttingConditions
  features: Partial<Record<FeatureKey, Stats>>
}

export function computeBaseline(tool: CuttingTool, obs: Observation[]): Baseline {
  const start = Date.parse(tool.installedAt)
  const end = start + tool.baselineHours * HOUR
  // Baseline uses the early life of the tool under its nominal programmed conditions.
  const window = obs.filter((o) => {
    const t = Date.parse(o.recordedAt)
    return t >= start && t <= end && o.conditions.spindleRpm === tool.conditions.spindleRpm
  })
  const features: Baseline['features'] = {}
  for (const key of availableFeatures(tool.id)) features[key] = stats(window.map((o) => o.features[key]))
  return {
    id: `BL-${tool.id}-01`,
    toolId: tool.id,
    label: `Early-life baseline (first ${tool.baselineHours} h after install)`,
    windowStart: window[0]?.recordedAt ?? tool.installedAt,
    windowEnd: window[window.length - 1]?.recordedAt ?? new Date(end).toISOString(),
    observationCount: window.length,
    conditions: meanConditions(window, tool.conditions),
    features,
  }
}

/* ------------------------------------------------------------------ */
/* Telemetry quality                                                   */
/* ------------------------------------------------------------------ */

export type Freshness = 'current' | 'delayed' | 'stale' | 'none'

export interface MissingInterval {
  start: string
  end: string
  slots: number
}

export interface TelemetryQuality {
  machineId: string
  lastReceived: string | null
  ageHours: number
  freshness: Freshness
  expected24h: number
  received24h: number
  completeness24h: number
  completeness7d: number
  missingIntervals: MissingInterval[]
  outdatedToolIds: string[]
}

export function freshnessOf(ageHours: number, expectedIntervalMin: number, s: AnalysisSettings): Freshness {
  if (!Number.isFinite(ageHours)) return 'none'
  if (ageHours > s.staleAfterHours) return 'stale'
  if (ageHours > (expectedIntervalMin / 60) * 1.5) return 'delayed'
  return 'current'
}

function expectedSlots(fromTs: number, toTs: number, stepMs: number): number[] {
  const slots: number[] = []
  for (let t = Math.ceil(fromTs / stepMs) * stepMs; t <= toTs; t += stepMs) if (isOperatingHour(t)) slots.push(t)
  return slots
}

export function telemetryQuality(machine: Machine, s: AnalysisSettings, now = DEMO_NOW): TelemetryQuality {
  const obsByTool = getObservations()
  const tools = TOOLS.filter((t) => t.machineId === machine.id)
  const received = new Set<number>()
  let last = -Infinity
  for (const t of tools) {
    for (const o of obsByTool[t.id]) {
      const ts = Date.parse(o.recordedAt)
      received.add(ts)
      if (ts > last) last = ts
    }
  }
  const step = machine.expectedIntervalMin * 60_000
  const slots24 = expectedSlots(now - 24 * HOUR, now, step)
  const slots7d = expectedSlots(now - 7 * 24 * HOUR, now, step)
  const got24 = slots24.filter((t) => received.has(t)).length
  const got7d = slots7d.filter((t) => received.has(t)).length

  // Group consecutive missing operating slots over the last 7 days.
  const missingIntervals: MissingInterval[] = []
  let run: number[] = []
  const flush = () => {
    if (run.length) missingIntervals.push({ start: new Date(run[0]).toISOString(), end: new Date(run[run.length - 1] + step).toISOString(), slots: run.length })
    run = []
  }
  for (const t of slots7d) {
    if (!received.has(t)) {
      if (run.length && t - run[run.length - 1] > step) flush()
      run.push(t)
    } else flush()
  }
  flush()

  const ageHours = Number.isFinite(last) ? (now - last) / HOUR : Infinity
  const freshness = freshnessOf(ageHours, machine.expectedIntervalMin, s)
  return {
    machineId: machine.id,
    lastReceived: Number.isFinite(last) ? new Date(last).toISOString() : null,
    ageHours,
    freshness,
    expected24h: slots24.length,
    received24h: got24,
    completeness24h: slots24.length ? (got24 / slots24.length) * 100 : 0,
    completeness7d: slots7d.length ? (got7d / slots7d.length) * 100 : 0,
    missingIntervals: missingIntervals.reverse(),
    outdatedToolIds: freshness === 'stale' ? tools.map((t) => t.id) : [],
  }
}

/** Hourly slots over the last `hours`, marking whether a reading was received. */
export function slotTimeline(machine: Machine, hours: number, now = DEMO_NOW): { t: number; state: 'received' | 'missing' | 'off-shift' }[] {
  const obsByTool = getObservations()
  const received = new Set<number>()
  for (const t of TOOLS.filter((x) => x.machineId === machine.id)) for (const o of obsByTool[t.id]) received.add(Date.parse(o.recordedAt))
  const step = machine.expectedIntervalMin * 60_000
  const out: { t: number; state: 'received' | 'missing' | 'off-shift' }[] = []
  for (let t = Math.ceil((now - hours * HOUR) / step) * step; t <= now; t += step) {
    out.push({ t, state: !isOperatingHour(t) ? 'off-shift' : received.has(t) ? 'received' : 'missing' })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Tool assessment                                                     */
/* ------------------------------------------------------------------ */

export interface FeatureDeviation {
  key: FeatureKey
  baseline: Stats
  recent: Stats
  pctChange: number
  z: number
  flagged: boolean
}

export interface RawAssessment {
  toolId: string
  baseline: Baseline
  comparableRecent: Observation[]
  excludedRecent: Observation[]
  recentConditions: CuttingConditions
  conditionDiffs: ConditionDifference[]
  comparable: boolean
  deviations: FeatureDeviation[]
  primary: FeatureDeviation | null
  /** First timestamp from which the rolling comparison stayed beyond the threshold. */
  flaggedSince: string | null
  latestObservation: Observation | null
}

function rollingFlagStart(obs: Observation[], key: FeatureKey, base: Stats, s: AnalysisSettings): string | null {
  if (obs.length < s.recentCount) return null
  let since: string | null = null
  for (let i = s.recentCount - 1; i < obs.length; i++) {
    const w = obs.slice(i - s.recentCount + 1, i + 1)
    const m = avg(w.map((o) => o.features[key]))
    const flagged = (m - base.mean) / base.std >= s.zThreshold && ((m - base.mean) / base.mean) * 100 >= s.minPctChange
    if (flagged && !since) since = w[w.length - 1].recordedAt
    if (!flagged) since = null
  }
  return since
}

export function rawAssessment(tool: CuttingTool, s: AnalysisSettings): RawAssessment {
  const obs = getObservations()[tool.id]
  const baseline = computeBaseline(tool, obs)
  const baselineEnd = Date.parse(baseline.windowEnd)
  const after = obs.filter((o) => Date.parse(o.recordedAt) > baselineEnd)
  const recentWindow = after.slice(-s.recentCount * 2)
  const comparableAll = after.filter((o) => isComparable(baseline.conditions, o.conditions, s))
  const comparableRecent = recentWindow.filter((o) => isComparable(baseline.conditions, o.conditions, s)).slice(-s.recentCount)
  const excludedRecent = recentWindow.filter((o) => !isComparable(baseline.conditions, o.conditions, s))
  const latestSlice = after.slice(-s.recentCount)
  const recentConditions = meanConditions(latestSlice, tool.conditions)
  const comparable = comparableRecent.length >= Math.ceil(s.recentCount / 2) && isComparable(baseline.conditions, recentConditions, s)

  const deviations: FeatureDeviation[] = availableFeatures(tool.id).map((key) => {
    const b = baseline.features[key]!
    const r = stats(comparableRecent.map((o) => o.features[key]))
    const z = b.std > 0 ? (r.mean - b.mean) / b.std : 0
    const pctChange = ((r.mean - b.mean) / b.mean) * 100
    return { key, baseline: b, recent: r, pctChange, z, flagged: comparable && z >= s.zThreshold && pctChange >= s.minPctChange }
  })
  const flagged = deviations.filter((d) => d.flagged).sort((a, b) => b.z - a.z)
  const primary = flagged[0] ?? null
  return {
    toolId: tool.id,
    baseline,
    comparableRecent,
    excludedRecent,
    recentConditions,
    conditionDiffs: compareConditions(baseline.conditions, recentConditions, s),
    comparable,
    deviations,
    primary,
    flaggedSince: primary ? rollingFlagStart(comparableAll, primary.key, primary.baseline, s) : null,
    latestObservation: obs[obs.length - 1] ?? null,
  }
}

export type ToolState =
  | 'within-baseline'
  | 'review-suggested'
  | 'monitoring'
  | 'acknowledged'
  | 'not-comparable'
  | 'data-stale'
  | 'incomplete'
  | 'baseline-pending'

export const TOOL_STATE_META: Record<ToolState, { label: string; tone: 'ok' | 'warn' | 'crit' | 'info' | 'stale' | 'muted'; help: string }> = {
  'within-baseline': { label: 'Within baseline', tone: 'ok', help: 'Recent comparable observations are close to the selected baseline.' },
  'review-suggested': { label: 'Review suggested', tone: 'warn', help: 'Recent comparable observations differ from the baseline. An inspection may be appropriate.' },
  monitoring: { label: 'Monitoring', tone: 'info', help: 'A recent inspection asked for additional monitoring or observed wear.' },
  acknowledged: { label: 'Inspected — no visible issue', tone: 'ok', help: 'A deviation was inspected and no visible issue was found. Data continues to be compared.' },
  'not-comparable': { label: 'Conditions changed', tone: 'muted', help: 'Recent operating conditions differ from the baseline, so the comparison is withheld.' },
  'data-stale': { label: 'Data outdated', tone: 'stale', help: 'Telemetry has not been received recently. The last assessment is not current.' },
  incomplete: { label: 'Data incomplete', tone: 'stale', help: 'Too many expected readings are missing to present a current assessment.' },
  'baseline-pending': { label: 'New tool — baseline pending', tone: 'muted', help: 'A replacement was recorded. A new baseline is needed before comparisons resume.' },
}

export interface ToolAssessment {
  tool: CuttingTool
  machine: Machine
  raw: RawAssessment
  telemetry: TelemetryQuality
  inspections: Inspection[]
  lastInspection: Inspection | null
  state: ToolState
  /** True when the assessment should not be presented as current. */
  notCurrent: boolean
}

export function assessTool(
  tool: CuttingTool,
  s: AnalysisSettings,
  inspections: Inspection[],
  alertStates: Record<string, AlertWorkflowState>,
  telemetryByMachine: Record<string, TelemetryQuality>,
): ToolAssessment {
  const machine = MACHINES.find((m) => m.id === tool.machineId)!
  const raw = rawAssessment(tool, s)
  const telemetry = telemetryByMachine[machine.id]
  const toolInspections = inspections.filter((i) => i.toolId === tool.id).sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))
  const lastInspection = toolInspections[0] ?? null
  const alert = alertStates[alertIdFor(tool.id)]

  let state: ToolState = 'within-baseline'
  if (lastInspection?.result === 'tool-replaced') state = 'baseline-pending'
  else if (telemetry.freshness === 'stale' || telemetry.freshness === 'none') state = 'data-stale'
  else if (telemetry.completeness24h < s.minCompletenessPct) state = 'incomplete'
  else if (!raw.comparable) state = 'not-comparable'
  else if (raw.primary) {
    const linked = alert?.inspectionId ? toolInspections.find((i) => i.id === alert.inspectionId) : undefined
    if (alert?.status === 'resolved' && linked) {
      state = linked.result === 'no-visible-issue' ? 'acknowledged' : linked.result === 'unable-to-determine' ? 'review-suggested' : 'monitoring'
    } else if (alert?.status === 'resolved') state = 'acknowledged'
    else state = 'review-suggested'
  } else if (lastInspection && ['wear-observed', 'additional-monitoring'].includes(lastInspection.result) && DEMO_NOW - Date.parse(lastInspection.inspectedAt) < 7 * 24 * HOUR) {
    state = 'monitoring'
  }
  return { tool, machine, raw, telemetry, inspections: toolInspections, lastInspection, state, notCurrent: state === 'data-stale' || state === 'incomplete' }
}

/* ------------------------------------------------------------------ */
/* Alerts                                                              */
/* ------------------------------------------------------------------ */

export const alertIdFor = (toolId: string) => `AL-${toolId.replace('T-', '')}`

export interface ConditionAlert {
  id: string
  toolId: string
  machineId: string
  cellId: string
  feature: FeatureKey
  createdAt: string
  latestAt: string
  deviation: FeatureDeviation
  otherChanged: FeatureDeviation[]
  baseline: Baseline
  compared: Observation[]
  conditionDiffs: ConditionDifference[]
  notCurrent: boolean
  title: string
  summary: string
  historical?: boolean
}

export function buildAlerts(assessments: ToolAssessment[]): ConditionAlert[] {
  return assessments
    .filter((a) => a.raw.primary)
    .map((a) => {
      const d = a.raw.primary!
      const f = FEATURE_BY_KEY[d.key]
      const compared = a.raw.comparableRecent
      return {
        id: alertIdFor(a.tool.id),
        toolId: a.tool.id,
        machineId: a.machine.id,
        cellId: a.machine.cellId,
        feature: d.key,
        createdAt: a.raw.flaggedSince ?? compared[compared.length - 1].recordedAt,
        latestAt: compared[compared.length - 1].recordedAt,
        deviation: d,
        otherChanged: a.raw.deviations.filter((x) => x.key !== d.key && Math.abs(x.pctChange) >= 5),
        baseline: a.raw.baseline,
        compared,
        conditionDiffs: a.raw.conditionDiffs,
        notCurrent: a.notCurrent,
        title: `${f.shortLabel} differs from baseline on ${a.tool.id}`,
        summary: `Mean of the last ${compared.length} comparable observations is ${fmtPct(d.pctChange)} relative to the ${a.raw.baseline.observationCount}-observation baseline (${d.z.toFixed(1)} baseline standard deviations).`,
      }
    })
}

export const fmtPct = (p: number) => `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`

/* ------------------------------------------------------------------ */
/* Simulated explanation ("AI panel")                                  */
/* ------------------------------------------------------------------ */

export interface Explanation {
  summary: string
  evidence: string[]
  questions: string[]
  limitations: string[]
}

/**
 * Template-based narrative assembled from the calculations above.
 * It is NOT produced by a trained or validated machine-learning model.
 */
export function explainAssessment(a: ToolAssessment): Explanation {
  const { raw, tool, telemetry } = a
  const f = raw.primary ? FEATURE_BY_KEY[raw.primary.key] : null
  const condOk = raw.conditionDiffs.every((d) => d.within)
  const evidence: string[] = []
  const questions: string[] = []
  const limitations = [
    'Generated from the simulated sample dataset using fixed rules and templates; this is not a validated industrial machine-learning model.',
    'A difference from baseline does not establish tool wear or predict failure. No remaining-useful-life estimate is made.',
  ]
  let summary: string

  if (a.state === 'data-stale' || a.state === 'incomplete') {
    summary =
      a.state === 'data-stale'
        ? `Telemetry for ${a.machine.id} was last received ${telemetry.ageHours.toFixed(1)} h ago. The comparison below reflects the last available data and should not be treated as the tool's current condition.`
        : `Only ${telemetry.completeness24h.toFixed(0)}% of expected readings for ${a.machine.id} arrived in the last 24 h. There is not enough recent data to present a current assessment of ${tool.id}.`
    questions.push(`Is ${a.machine.id} running, and is the data feed from its controller or gateway being delivered?`, 'Has the tool been inspected manually since the last complete set of readings?')
  } else if (a.state === 'baseline-pending') {
    summary = `A replacement of ${tool.id} was recorded. Earlier observations describe the previous tool, so a new baseline should be established from the replacement tool's early observations before comparisons resume.`
    questions.push('Were the cutting conditions kept the same for the replacement tool?', 'Was the replacement tool measured on a presetter (length, runout)?')
  } else if (!raw.comparable) {
    const changed = raw.conditionDiffs.filter((d) => !d.within)
    summary = `Recent observations for ${tool.id} were recorded under different operating conditions from the baseline (${changed.map((c) => c.label.toLowerCase()).join(', ')}). Feature values are not compared across these conditions, so no review suggestion is made.`
    questions.push('Was the NC program or override changed intentionally?', 'Should a new baseline be established for the revised conditions?')
  } else if (raw.primary && f) {
    summary = `The latest ${f.label.toLowerCase()} differs from the selected baseline (${fmtPct(raw.primary.pctChange)}). The observations were recorded under similar cutting conditions. Review the tool and confirm its physical condition before changing the replacement schedule.`
    questions.push(
      `Is there visible flank wear, chipping or built-up edge on ${tool.id}?`,
      'Has the workpiece batch, fixture, or clamping changed since the baseline period?',
      'Is coolant delivery and concentration as expected?',
      'Does surface finish or a dimensional check on recent parts agree with the change?',
    )
  } else {
    summary = `Recent comparable observations for ${tool.id} are close to the selected baseline. No review is suggested from the supplied data.`
    questions.push('Is the next scheduled inspection still appropriate for the current job mix?')
  }

  if (raw.baseline.observationCount) {
    evidence.push(`Baseline: ${raw.baseline.observationCount} observations from ${fmtDateTime(raw.baseline.windowStart)} to ${fmtDateTime(raw.baseline.windowEnd)}.`)
  }
  if (raw.comparableRecent.length) {
    evidence.push(
      `Compared: ${raw.comparableRecent.length} recent comparable observations, ${fmtDateTime(raw.comparableRecent[0].recordedAt)} – ${fmtDateTime(raw.comparableRecent[raw.comparableRecent.length - 1].recordedAt)}.`,
    )
  }
  if (raw.excludedRecent.length) evidence.push(`${raw.excludedRecent.length} recent observations were excluded because their conditions were outside tolerance.`)
  for (const d of raw.deviations) {
    const fd = FEATURE_BY_KEY[d.key]
    evidence.push(`${fd.shortLabel}: ${d.baseline.mean.toFixed(3)} → ${Number.isFinite(d.recent.mean) ? d.recent.mean.toFixed(3) : '—'} ${fd.unit} (${Number.isFinite(d.pctChange) ? fmtPct(d.pctChange) : 'n/a'}).`)
  }
  evidence.push(condOk ? 'Operating conditions in the compared window are within tolerance of the baseline.' : 'Operating conditions in the compared window are outside tolerance of the baseline.')
  if (a.lastInspection) evidence.push(`Last inspection ${fmtDateTime(a.lastInspection.inspectedAt)}: ${INSPECTION_RESULT_LABEL[a.lastInspection.result]}.`)
  return { summary, evidence, questions, limitations }
}

/* ------------------------------------------------------------------ */
/* Formatting helpers shared by UI                                     */
/* ------------------------------------------------------------------ */

export const INSPECTION_RESULT_LABEL: Record<Inspection['result'], string> = {
  'no-visible-issue': 'No visible issue',
  'wear-observed': 'Wear observed',
  'tool-replaced': 'Tool replaced',
  'additional-monitoring': 'Additional monitoring required',
  'unable-to-determine': 'Unable to determine',
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}`
}

export function fmtAge(hours: number) {
  if (!Number.isFinite(hours)) return 'never'
  if (hours * 60 < 1) return 'just now'
  if (hours < 1) return `${Math.round(hours * 60)} min ago`
  if (hours < 48) return `${hours.toFixed(hours < 10 ? 1 : 0)} h ago`
  return `${Math.round(hours / 24)} d ago`
}
