/**
 * Demo assistant. It answers a small set of question types from the same calculations the dashboard
 * shows, cites the records it used, and refuses questions that would need a prediction the data
 * cannot support (failure timing, remaining useful life). No model or external API is called.
 * In production the wording would come from Amazon Bedrock, but the numbers and the records cited
 * would still come from these queries (see docs/architecture.md).
 */
import { MACHINES, TECHNICIANS } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import type { AlertWorkflowState, Inspection } from '../data/types'
import { INSPECTION_RESULT_LABEL, TOOL_STATE_META, fmtDateTime, fmtPct, type AnalysisSettings, type ConditionAlert, type TelemetryQuality, type ToolAssessment } from './analysis'

export interface AssistantContext {
  assessments: ToolAssessment[]
  alerts: ConditionAlert[]
  alertState: (id: string) => AlertWorkflowState
  telemetry: Record<string, TelemetryQuality>
  inspections: Inspection[]
  settings: AnalysisSettings
}

export interface AssistantAnswer {
  kind: 'answer' | 'refusal' | 'help'
  title: string
  lines: string[]
  /** Record ids the answer is built from, shown to the user as sources. */
  sources: string[]
  links: { to: string; label: string }[]
}

export const EXAMPLE_QUESTIONS = [
  'Which tools need attention?',
  'Which machines have data problems?',
  'What happened to T-1204?',
  'Show recent inspections',
  'When will T-1204 fail?',
]

const techName = (id: string) => TECHNICIANS.find((t) => t.id === id)?.name ?? id

function attention(c: AssistantContext): AssistantAnswer {
  const open = c.alerts.filter((a) => c.alertState(a.id).status !== 'resolved').sort((a, b) => b.deviation.z - a.deviation.z)
  const notCurrent = c.assessments.filter((a) => a.notCurrent)
  const lines = open.map((a) => {
    const st = c.alertState(a.id)
    return `${a.toolId} on ${a.machineId}: ${FEATURE_BY_KEY[a.feature].shortLabel} ${fmtPct(a.deviation.pctChange)} vs baseline (${a.deviation.z.toFixed(1)}σ, ${a.compared.length} comparable observations). Alert ${a.id} is ${st.status}${st.assigneeId ? `, assigned to ${techName(st.assigneeId)}` : ', unassigned'}.`
  })
  if (notCurrent.length) lines.push(`${notCurrent.length} tool${notCurrent.length > 1 ? 's have' : ' has'} no current assessment because of data problems: ${notCurrent.map((a) => a.tool.id).join(', ')}. Ask “which machines have data problems?” for details.`)
  if (!open.length) lines.unshift('No open alerts: no tool’s comparable observations currently meet the review rule.')
  return {
    kind: 'answer',
    title: open.length ? `${open.length} tool${open.length > 1 ? 's' : ''} with an open review alert` : 'Nothing needs review right now',
    lines,
    sources: [...open.map((a) => a.id), ...notCurrent.map((a) => a.tool.id)],
    links: open.map((a) => ({ to: `/monitoring/inspections/${a.id}`, label: `Open ${a.id}` })),
  }
}

function dataProblems(c: AssistantContext): AssistantAnswer {
  const bad = MACHINES.map((m) => ({ m, t: c.telemetry[m.id] })).filter(({ t }) => t.freshness !== 'current' || t.completeness24h < c.settings.minCompletenessPct)
  return {
    kind: 'answer',
    title: bad.length ? `${bad.length} machine feed${bad.length > 1 ? 's need' : ' needs'} attention` : 'All machine feeds are current and complete',
    lines: bad.map(({ m, t }) => `${m.id} (${m.status}): ${t.freshness === 'current' ? 'current' : t.freshness} data, ${t.completeness24h.toFixed(0)}% of expected readings in 24 h${t.lastReceived ? `, last received ${fmtDateTime(t.lastReceived)} UTC` : ''}. Assessments for ${m.id} tools are not shown as current.`),
    sources: bad.map(({ m }) => m.id),
    links: [{ to: '/monitoring/telemetry', label: 'Telemetry quality' }],
  }
}

function toolSummary(c: AssistantContext, id: string): AssistantAnswer {
  const a = c.assessments.find((x) => x.tool.id === id)
  if (!a) return { kind: 'answer', title: `No tool called ${id}`, lines: [`The demo facility has ${c.assessments.map((x) => x.tool.id).join(', ')}.`], sources: [], links: [] }
  const lines = [
    `${a.tool.id}: ${a.tool.description}, ${a.tool.operation} in ${a.tool.workpieceMaterial} on ${a.machine.id}.`,
    `Status: ${TOOL_STATE_META[a.state].label}. ${TOOL_STATE_META[a.state].help}`,
  ]
  if (a.raw.primary) lines.push(`${FEATURE_BY_KEY[a.raw.primary.key].label}: ${fmtPct(a.raw.primary.pctChange)} relative to a ${a.raw.baseline.observationCount}-observation baseline (${a.raw.primary.z.toFixed(1)}σ).`)
  else if (!a.raw.comparable) lines.push(`Recent operating conditions are outside tolerance of the baseline, so no comparison is made.`)
  const last = a.lastInspection
  if (last) lines.push(`Last inspection ${last.id} on ${fmtDateTime(last.inspectedAt)} UTC by ${techName(last.technicianId)}: ${INSPECTION_RESULT_LABEL[last.result]}${last.flankWearMm !== undefined ? `, VB ${last.flankWearMm} mm` : ''}.`)
  return { kind: 'answer', title: `${a.tool.id} · ${TOOL_STATE_META[a.state].label}`, lines, sources: [a.tool.id, ...(last ? [last.id] : [])], links: [{ to: `/monitoring/tools/${a.tool.id}`, label: `Open ${a.tool.id}` }] }
}

function machineSummary(c: AssistantContext, id: string): AssistantAnswer {
  const m = MACHINES.find((x) => x.id === id)!
  const t = c.telemetry[id]
  const tools = c.assessments.filter((a) => a.machine.id === id)
  return {
    kind: 'answer',
    title: `${m.id} · ${m.name}`,
    lines: [
      `${m.type}, ${m.status}. Data ${t.freshness}, ${t.completeness24h.toFixed(0)}% complete in 24 h.`,
      ...tools.map((a) => `${a.tool.id} (${a.tool.type}): ${TOOL_STATE_META[a.state].label}.`),
    ],
    sources: [m.id, ...tools.map((a) => a.tool.id)],
    links: [{ to: `/monitoring/machines#${m.id}`, label: `Open ${m.id}` }],
  }
}

function recentInspections(c: AssistantContext): AssistantAnswer {
  const recent = [...c.inspections].sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt)).slice(0, 5)
  return {
    kind: 'answer',
    title: 'Five most recent inspections',
    lines: recent.map((i) => `${i.id} · ${i.toolId} · ${fmtDateTime(i.inspectedAt)} UTC · ${techName(i.technicianId)}: ${INSPECTION_RESULT_LABEL[i.result]}${i.notes ? ` — “${i.notes}”` : ''}`),
    sources: recent.map((i) => i.id),
    links: [{ to: '/monitoring/inspections', label: 'Inspection queue' }],
  }
}

const REFUSAL: AssistantAnswer = {
  kind: 'refusal',
  title: 'That needs a prediction the data cannot support',
  lines: [
    'Wearinterval compares recent observations with a baseline recorded under compatible conditions. It does not estimate when a tool will fail or how much life is left, because the demo data (and most shop-floor data) cannot support a validated estimate.',
    'What it can tell you: whether a tool’s recent behaviour differs from its baseline, how strongly, under which conditions, and what the last inspection found. A technician confirms the actual condition.',
  ],
  sources: [],
  links: [],
}

export function answer(question: string, c: AssistantContext): AssistantAnswer {
  const q = question.toLowerCase()
  if (/\b(fail|fails|failing|failure|break|remaining|rul|life left|life is left|lifespan|tool life|wear out|how long|when will|predict|forecast)\b/.test(q)) return REFUSAL
  const tool = q.match(/\bt-?\s?(\d{4})\b/)
  if (tool) return toolSummary(c, `T-${tool[1]}`)
  const machine = MACHINES.find((m) => q.includes(m.id.toLowerCase()))
  if (machine) return machineSummary(c, machine.id)
  if (/(data|telemetry|stale|outdated|missing|incomplete|feed|offline)/.test(q)) return dataProblems(c)
  if (/(inspection|inspected|recent|history|latest)/.test(q)) return recentInspections(c)
  if (/(attention|review|alert|priorit|worst|inspect|which tools|check)/.test(q)) return attention(c)
  return {
    kind: 'help',
    title: 'Questions this demo assistant can answer',
    lines: ['It answers from the demo’s own records only. Try one of these:', ...EXAMPLE_QUESTIONS.slice(0, 4)],
    sources: [],
    links: [],
  }
}
