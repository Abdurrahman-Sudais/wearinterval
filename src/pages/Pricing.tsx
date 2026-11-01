import { Check, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'

export const PLANS = [
  {
    name: 'Single Cell',
    price: '$99',
    period: '/month',
    tagline: 'For small machining operations.',
    features: ['1 machining cell, up to 4 machines', 'Tool & machine registry', 'Baseline comparisons and condition trends', 'Inspection workflow', 'Telemetry quality monitoring', 'Email support'],
    cta: 'Start a conversation',
  },
  {
    name: 'Workshop',
    price: '$299',
    period: '/month',
    tagline: 'For teams monitoring multiple machines.',
    features: ['Up to 4 cells, 20 machines', 'Everything in Single Cell', 'Technician assignment and shift views', 'Evidence summaries', 'Reports and CSV export', 'Configurable baselines and tolerances'],
    cta: 'Start a conversation',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'For larger manufacturing operations and multi-site deployments.',
    features: ['Unlimited cells and sites', 'Everything in Workshop', 'Data-integration scoping', 'SSO and role-based access', 'Deployment and onboarding support', 'Custom reporting'],
    cta: 'Contact us',
  },
]

export default function Pricing() {
  usePageMeta({ title: 'Pricing', description: 'Illustrative Wearinterval plans: Single Cell $99/month, Workshop $299/month, and Enterprise custom pricing. Sensor hardware and installation not included.', path: '/pricing' })
  return (
    <>
      <PageHero eyebrow="Pricing" title="Simple plans that grow with your shop floor">
        Illustrative pricing for the Wearinterval software platform.
      </PageHero>
      <Section title="Plans">
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={`flex flex-col rounded-xl border p-6 ${p.featured ? 'border-steel-500 bg-ink-850 ring-1 ring-steel-500/40' : 'border-ink-700 bg-ink-900'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{p.name}</h3>
                {p.featured && <span className="rounded-full bg-steel-500/15 px-2 py-0.5 text-xs text-steel-300">Most common</span>}
              </div>
              <p className="mt-1 text-sm text-ink-400">{p.tagline}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-white">{p.price}</span>
                <span className="text-ink-400">{p.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-ink-200">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden /> {f}
                  </li>
                ))}
              </ul>
              <Link to={`/contact?plan=${encodeURIComponent(p.name)}`} className={`mt-8 ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 flex gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm text-ink-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden />
          <p>
            <strong className="text-white">Physical sensor hardware and installation are not included.</strong> Wearinterval analyses telemetry and condition data that you supply. Prices are illustrative and exclude applicable taxes.
          </p>
        </div>
      </Section>
      <Section light title="Common questions">
        <dl className="grid gap-6 md:grid-cols-2">
          {[
            ['Do we need new sensors?', 'Not necessarily. Many machines already produce useful controller data. Where vibration or acoustic sensing is needed, it is sourced and installed separately.'],
            ['Does Wearinterval predict tool failure?', 'No. It compares observations with suitable baselines and helps you decide which tools to inspect. People confirm the condition.'],
            ['Can we start with one cell?', 'Yes. Single Cell is designed for a pilot on one group of machines.'],
            ['Is the demo connected to real machines?', 'No. The demo dashboard runs entirely in your browser on simulated sample data.'],
          ].map(([q, a]) => (
            <div key={q} className="rounded-lg border border-ink-200 bg-white p-5">
              <dt className="font-semibold text-ink-950">{q}</dt>
              <dd className="mt-2 text-sm text-ink-600">{a}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <FinalCta />
    </>
  )
}
