import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'
import { FOUNDERS, FoundersGrid, RoadmapSection } from './HomeSections'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export default function About() {
  usePageMeta({ title: 'About & team', description: `Wearinterval was founded by ${FOUNDERS.map((f) => f.name).join(' and ')} to bring measurable context to cutting-tool inspection decisions in CNC machining.`, path: '/about' })
  return (
    <>
      <PageHero eyebrow="About Wearinterval" title="Know when a tool needs attention">
        Wearinterval helps machining teams compare cutting-tool observations against appropriate baselines, investigate unusual changes in supplied telemetry, and prioritise inspections — with people, not software, confirming tool condition.
      </PageHero>

      <Section id="team" eyebrow="Founding team" title="The people behind Wearinterval">
        <FoundersGrid dark />
      </Section>

      <Section light eyebrow="Our story" title="Why we started">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="reveal space-y-4 text-lg text-ink-700">
            <p>
              Tool changes in most machine shops come from a schedule, an operator’s experience, or a part that has already failed inspection. Each of these works up to a point. None of them makes it easy to see why a particular tool, on a particular job, is behaving differently today.
            </p>
            <p>Meanwhile the data is often already there — spindle load, vibration, acoustic signals — sitting in controllers and historians without the context needed to compare one run with another.</p>
            <p>
              Wearinterval is built around a simple idea: put the tool’s history, its operating conditions and the people who inspect it in one place, and be honest about what the data can and cannot tell you.
            </p>
          </div>
          <blockquote className="reveal self-start rounded-2xl border border-ink-200 bg-white p-8" style={d(120)}>
            <p className="label text-steel-700">Our mission</p>
            <p className="mt-3 text-2xl font-semibold leading-snug text-ink-950">Give every machining team evidence, not guesswork, about when a cutting tool needs attention.</p>
          </blockquote>
        </div>
      </Section>

      <Section eyebrow="Principles" title="What we will and won’t do">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Measurable', 'Every alert states its baseline, its observations and its rule.'],
            ['Contextual', 'Observations are compared only under compatible operating conditions.'],
            ['Honest about data', 'Stale and incomplete data is flagged and never shown as current.'],
            ['People decide', 'Technicians confirm tool condition. The software records it.'],
          ].map(([t, b], i) => (
            <div key={t} className="reveal lift spot rounded-xl border border-ink-700 bg-ink-900 p-6" style={d(i * 90)}>
              <span className="font-mono text-xs text-steel-400">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm text-ink-400">{b}</p>
            </div>
          ))}
        </div>
        <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
          Our safeguards <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>

      <RoadmapSection />
      <FinalCta />
    </>
  )
}
