import { Mail } from 'lucide-react'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'

export default function About() {
  usePageMeta({ title: 'About', description: 'Wearinterval was founded by Seyi Bakare to bring measurable context to cutting-tool inspection decisions in CNC machining.', path: '/about' })
  return (
    <>
      <PageHero eyebrow="About" title="Know when a tool needs attention">
        Wearinterval helps machining teams compare cutting-tool observations against appropriate baselines, investigate unusual changes in supplied telemetry, and prioritise inspections.
      </PageHero>
      <Section title="Why we started">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4 text-ink-300">
            <p>
              Tool changes in most machine shops come from a schedule, an operator’s experience, or a part that has already failed inspection. Each of these works up to a point. None of them makes it easy to see why a particular tool, on a particular job, is behaving differently today.
            </p>
            <p>
              Wearinterval is built around a simple idea: put the tool’s history, its operating conditions and the people who inspect it in one place, and be honest about what the data can and cannot tell you.
            </p>
          </div>
          <div className="panel p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full border border-ink-600 bg-ink-800 font-mono text-lg text-steel-400" aria-hidden>
                SB
              </div>
              <div>
                <div className="font-medium text-white">Seyi Bakare</div>
                <div className="text-sm text-ink-400">Founder</div>
              </div>
            </div>
            <a href="mailto:seyi@wearinterval.space" className="mt-5 inline-flex items-center gap-2 text-sm text-steel-400 hover:text-steel-300">
              <Mail className="h-4 w-4" /> seyi@wearinterval.space
            </a>
          </div>
        </div>
      </Section>
      <Section light title="Principles">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Measurable', 'Every alert states its baseline, its observations and its rule.'],
            ['Contextual', 'Observations are compared only under compatible operating conditions.'],
            ['Honest about data', 'Stale and incomplete data is flagged and never shown as current.'],
            ['People decide', 'Technicians confirm tool condition. The software records it.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-lg border border-ink-200 bg-white p-5">
              <h3 className="font-semibold text-ink-950">{t}</h3>
              <p className="mt-2 text-sm text-ink-600">{b}</p>
            </div>
          ))}
        </div>
      </Section>
      <FinalCta />
    </>
  )
}
