import { describe, expect, it } from 'vitest'
import { MACHINES, SEED_INSPECTIONS, TOOLS } from '../../data/facility'
import type { AlertWorkflowState } from '../../data/types'
import { DEFAULT_SETTINGS, assessTool, buildAlerts, telemetryQuality } from '../analysis'
import { EXAMPLE_QUESTIONS, answer, type AssistantContext } from '../assistant'

function context(): AssistantContext {
  const telemetry = Object.fromEntries(MACHINES.map((m) => [m.id, telemetryQuality(m, DEFAULT_SETTINGS)]))
  const assessments = TOOLS.map((t) => assessTool(t, DEFAULT_SETTINGS, SEED_INSPECTIONS, {}, telemetry))
  const open: AlertWorkflowState = { status: 'open', activity: [] }
  return { assessments, alerts: buildAlerts(assessments), alertState: () => open, telemetry, inspections: SEED_INSPECTIONS, settings: DEFAULT_SETTINGS }
}

describe('grounded assistant', () => {
  const c = context()

  it('answers every example question', () => {
    for (const q of EXAMPLE_QUESTIONS) expect(answer(q, c).lines.length).toBeGreaterThan(0)
  })

  it('refuses failure and remaining-life predictions', () => {
    for (const q of ['When will T-1204 fail?', 'How much life is left on T-4102?', 'Predict the RUL of T-1204']) {
      expect(answer(q, c).kind).toBe('refusal')
    }
  })

  it('cites the records it used', () => {
    const a = answer('Which tools need attention?', c)
    expect(a.kind).toBe('answer')
    expect(a.sources.length).toBeGreaterThan(0)
    for (const s of a.sources) expect(a.lines.join(' ')).toContain(s)
  })

  it('summarises a named tool from its own records', () => {
    const a = answer('What happened to T-1204?', c)
    expect(a.title).toContain('T-1204')
    expect(a.sources).toContain('T-1204')
  })

  it('falls back to help for unrelated questions', () => {
    expect(answer('What is the weather?', c).kind).toBe('help')
  })
})

describe('machine questions', () => {
  it('summarises a named machine', () => {
    const a = answer('What about VMC-02?', context())
    expect(a.kind).toBe('answer')
    expect(a.title).toContain('VMC-02')
  })
})
