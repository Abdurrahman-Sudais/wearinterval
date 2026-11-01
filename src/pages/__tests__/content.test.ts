import { describe, expect, it } from 'vitest'
import { PROBLEM_STATS } from '../Home'
import { FAQS, FOUNDERS, ROADMAP } from '../HomeSections'

describe('home content', () => {
  it('links every published statistic to its source', () => {
    for (const s of PROBLEM_STATS) {
      expect(s.url).toMatch(/^https:\/\//)
      expect(s.source.length).toBeGreaterThan(5)
    }
  })

  it('credits both founders with their roles', () => {
    expect(FOUNDERS.map((f) => `${f.name} · ${f.role}`)).toEqual(['Seyi Bakare · Founder & CEO', 'Yusuf Abdulhamid · Co-founder & CTO'])
  })

  it('answers the failure-prediction question with a clear no', () => {
    expect(FAQS[0][0]).toMatch(/predict/i)
    expect(FAQS[0][1]).toMatch(/^No\./)
    expect(JSON.stringify(ROADMAP)).not.toMatch(/predict|remaining (useful )?life/i)
  })
})
