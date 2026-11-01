import { describe, expect, it } from 'vitest'
import { ACTIONS, DEMO_USERS, SEED_AUDIT, can, userName } from '../access'
import { SEED_INSPECTIONS, TOOLS } from '../../data/facility'

describe('demo roles', () => {
  it('gives managers every action and viewers none', () => {
    for (const a of ACTIONS) {
      expect(can('manager', a)).toBe(true)
      expect(can('viewer', a)).toBe(false)
    }
  })

  it('limits technicians to notes and inspections', () => {
    expect(ACTIONS.filter((a) => can('technician', a)).sort()).toEqual(['inspect', 'note'])
  })

  it('keeps settings and the audit log with managers', () => {
    expect(can('engineer', 'settings')).toBe(false)
    expect(can('engineer', 'audit')).toBe(false)
    expect(can('engineer', 'resolve')).toBe(true)
  })

  it('seeds audit entries that point at real users, tools and inspections', () => {
    const toolIds = new Set(TOOLS.map((t) => t.id))
    const insIds = new Set(SEED_INSPECTIONS.map((i) => i.id))
    for (const e of SEED_AUDIT) {
      expect(DEMO_USERS.some((u) => u.id === e.userId)).toBe(true)
      for (const id of e.detail.match(/T-\d{4}/g) ?? []) expect(toolIds.has(id)).toBe(true)
      for (const id of e.detail.match(/INS-\d+/g) ?? []) expect(insIds.has(id)).toBe(true)
    }
    expect(userName('u-grace')).toBe('Grace Holm')
  })
})
