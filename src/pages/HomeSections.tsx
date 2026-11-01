import { ArrowRight, Bot, Check, Lock, Mail, ShieldCheck, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'
import { Section } from '../components/SiteLayout'
import { PLANS } from './Pricing'
import { SAFEGUARDS } from './Security'
import { PIPELINE } from './Technology'

/** Home-page sections added alongside the original A–F: AI, security, technology, pricing, team, FAQ, early access. */

export function AiSection() {
  return (
    <Section light eyebrow="G · AI, used carefully" title="Answers from your own records, not guesses" intro="Wearinterval’s assistant explains what the calculations found. The numbers come from deterministic comparisons; the wording only makes them easier to read.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <ul className="space-y-3">
          {[
            [true, 'Summarise why a tool was flagged, with the baseline, observations and rule behind it'],
            [true, 'Answer “which tools need attention?” and “which feeds have data problems?” from current records'],
            [true, 'List the records it used, so every answer can be checked'],
            [true, 'Suggest questions for the technician to answer at the machine'],
            [false, 'Predict when a tool will fail or how much life is left'],
            [false, 'Change a tool’s status — only a recorded inspection does that'],
          ].map(([ok, t]) => (
            <li key={t as string} className="flex gap-3 rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-700">
              {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-700" aria-label="Does" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-label="Never does" />}
              {t as string}
            </li>
          ))}
        </ul>
        <div className="panel p-6 text-ink-200">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Bot className="h-4 w-4 text-steel-400" aria-hidden /> Ask about this facility
            <span className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">Sample data</span>
          </div>
          <p className="mt-4 text-xs text-ink-400">“Which tools need attention?”</p>
          <p className="mt-2 text-sm">
            <span className="font-mono text-white">T-1204</span> on VMC-02: vibration band energy about 49% above its early-life baseline across comparable observations. The alert is open and unassigned.
          </p>
          <p className="mt-2 text-sm">
            <span className="font-mono text-white">T-4102</span> on 5AX-04: acoustic peak count about 28% above baseline.
          </p>
          <p className="mt-3 font-mono text-[11px] text-ink-400">From records AL-1204, AL-4102</p>
          <Link to="/monitoring" className="btn-primary btn-sm mt-5">
            Try the assistant in the demo <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Section>
  )
}

export function SecuritySection() {
  return (
    <Section eyebrow="H · Safeguards" title="Data informs the decision. People make it.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAFEGUARDS.map(([t, b]) => (
          <div key={t} className="rounded-lg border border-ink-700 bg-ink-850 p-5">
            <ShieldCheck className="h-5 w-5 text-steel-400" aria-hidden />
            <h3 className="mt-3 font-medium text-white">{t}</h3>
            <p className="mt-2 text-sm text-ink-400">{b}</p>
          </div>
        ))}
      </div>
      <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
        Security and safeguards in detail <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  )
}

export function TechnologySection() {
  return (
    <Section light eyebrow="I · Technology" title="How we use Amazon Web Services" intro="A proposed serverless architecture: capture at the machine, keep every number traceable, keep the analysis deterministic, and use Amazon Bedrock only to explain.">
      <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PIPELINE.map((p) => (
          <li key={p.step} className="rounded-lg border border-ink-200 bg-white p-5">
            <span className="font-mono text-xs text-steel-700">{p.step}</span>
            <h3 className="mt-2 font-semibold text-ink-950">{p.title}</h3>
            <p className="mt-1 font-mono text-[11px] text-steel-700">{p.services}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-ink-600">These services are proposed, not deployed. The demo runs in your browser on simulated data.</p>
      <Link to="/technology" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-steel-700 hover:text-steel-600">
        The full architecture <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  )
}

export function PricingSection() {
  return (
    <Section eyebrow="J · Pricing" title="Simple plans that grow with your shop floor">
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`flex flex-col rounded-xl border p-6 ${p.featured ? 'border-steel-500 bg-ink-850 ring-1 ring-steel-500/40' : 'border-ink-700 bg-ink-900'}`}>
            <h3 className="text-lg font-medium text-white">{p.name}</h3>
            <p className="mt-1 text-sm text-ink-400">{p.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold text-white">{p.price}</span>
              <span className="text-ink-400">{p.period}</span>
            </div>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2 text-sm text-ink-200">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden /> {f}
                </li>
              ))}
            </ul>
            <Link to={`/contact?plan=${encodeURIComponent(p.name)}`} className={`mt-6 ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>
              {p.cta}
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-400">
        Illustrative prices, excluding taxes. Sensor hardware and installation are not included.{' '}
        <Link to="/pricing" className="text-steel-400 hover:text-steel-300">
          Compare plans
        </Link>
      </p>
    </Section>
  )
}

export function TeamSection() {
  return (
    <Section light eyebrow="K · Team" title="The people building Wearinterval">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-lg border border-ink-200 bg-white p-6">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-ink-200 bg-ink-50 font-mono text-lg text-steel-700" aria-hidden>
            SB
          </div>
          <div>
            <h3 className="text-lg font-semibold text-ink-950">Seyi Bakare</h3>
            <p className="text-sm text-ink-600">Founder</p>
            <a href="mailto:seyi@wearinterval.space" className="mt-2 inline-flex items-center gap-1.5 text-sm text-steel-700 hover:text-steel-600">
              <Mail className="h-4 w-4" aria-hidden /> seyi@wearinterval.space
            </a>
          </div>
        </div>
        <div className="rounded-lg border border-ink-200 bg-white p-6">
          <h3 className="font-semibold text-ink-950">Building with machinists</h3>
          <p className="mt-2 text-sm text-ink-600">Wearinterval is shaped by conversations with CNC job shops, tooling technicians and quality engineers. Early-access teams get a direct line to the people building it.</p>
          <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-steel-700 hover:text-steel-600">
            Why we started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Section>
  )
}

export const FAQS: [string, string][] = [
  ['Does Wearinterval predict when a tool will fail?', 'No. It compares recent observations with a baseline recorded under compatible conditions and tells you when a tool’s behaviour differs enough to be worth inspecting. A technician confirms the actual condition.'],
  ['Do we need new sensors?', 'Not necessarily. Many machines already produce useful controller data. Where vibration or acoustic sensing is needed, it is sourced and installed separately; hardware is not included.'],
  ['What happens when the program or material changes?', 'Observations outside the speed, feed, engagement or coolant tolerances are excluded, and the comparison is withheld with the reason shown, rather than raising a false alert.'],
  ['What if a machine stops sending data?', 'The assessment is marked outdated or incomplete and is not shown as current. The telemetry page shows exactly which intervals are missing.'],
  ['Who can change what?', 'Managers, reliability engineers, technicians and viewers each get only the actions they need, and every change is written to an audit log. Try “Demo as” in the dashboard.'],
  ['What does the AI do?', 'It explains calculated results in plain language and answers questions from your own records, listing the records it used. It never supplies the numbers and never predicts failure.'],
  ['Where would our data be stored?', 'In the proposed design, on AWS with encryption at rest and in transit and per-customer isolation. Region options are discussed during a pilot.'],
  ['Is it available today?', 'Wearinterval is in early access. The demo dashboard runs in your browser on simulated data; a pilot connects one cell’s real data.'],
]

export function FaqSection() {
  return (
    <Section id="faq" eyebrow="L · FAQ" title="Questions machining teams ask">
      <div className="max-w-3xl divide-y divide-ink-800 border-y border-ink-800">
        {FAQS.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none font-medium text-white marker:hidden">
              <span className="mr-2 inline-block font-mono text-steel-400 transition-transform group-open:rotate-90">›</span>
              {q}
            </summary>
            <p className="mt-2 pl-5 text-sm text-ink-300">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}

export function EarlyAccessSection() {
  return (
    <Section light id="early-access" eyebrow="M · Early access" title="Request early access" intro="Early-access teams get guided setup on one machining cell and a direct say in what we build next.">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <LeadForm compact />
        </div>
        <ul className="space-y-3 text-sm text-ink-700">
          {['Guided setup on one cell with the data you already have', 'Direct line to the product team', 'Launch pricing on Single Cell, Workshop or Enterprise'].map((t) => (
            <li key={t} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-700" aria-hidden /> {t}
            </li>
          ))}
          <li className="flex gap-2 text-ink-500">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Please don’t include confidential drawings or customer data.
          </li>
        </ul>
      </div>
    </Section>
  )
}
