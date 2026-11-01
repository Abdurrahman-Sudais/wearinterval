import { ArrowRight, Bot, Check, Clock, Compass, Lock, Mail, Rocket, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { LeadForm } from '../components/LeadForm'
import { Section } from '../components/SiteLayout'
import { PLANS } from './Pricing'
import { SAFEGUARDS } from './Security'
import { PIPELINE } from './Technology'

/** Home-page sections shared with other pages: AI, safeguards, technology, pricing, roadmap, team, FAQ, early access. */

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export interface Person {
  name: string
  initials: string
  role: string
  email?: string
  bio: string
}

export const FOUNDERS: Person[] = [
  {
    name: 'Seyi Bakare',
    initials: 'SB',
    role: 'Founder & CEO',
    email: 'seyi@wearinterval.space',
    bio: 'Seyi founded Wearinterval to give machining teams evidence, not guesswork, about when a cutting tool needs attention — and leads product, customers and every pilot.',
  },
  {
    name: 'Yusuf Abdulhamid',
    initials: 'YA',
    role: 'Co-founder & CTO',
    bio: 'Yusuf co-founded Wearinterval and leads its technology — from machine-data ingestion and the baseline-comparison engine to the cloud platform it runs on.',
  },
]
export const FOUNDER = FOUNDERS[0]

export function AiSection() {
  return (
    <Section light eyebrow="AI, used carefully" title="Answers from your own records, not guesses" intro="Wearinterval’s assistant explains what the calculations found. The numbers come from deterministic comparisons; the wording only makes them easier to read.">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <ul className="space-y-3">
          {[
            [true, 'Summarise why a tool was flagged, with the baseline, observations and rule behind it'],
            [true, 'Answer “which tools need attention?” and “which feeds have data problems?” from current records'],
            [true, 'List the records it used, so every answer can be checked'],
            [true, 'Suggest questions for the technician to answer at the machine'],
            [false, 'Predict when a tool will fail or how much life is left'],
            [false, 'Change a tool’s status — only a recorded inspection does that'],
          ].map(([ok, t], i) => (
            <li key={t as string} className="reveal lift flex gap-3 rounded-lg border border-ink-200 bg-white p-4 text-sm text-ink-700" style={d(i * 60)}>
              {ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-700" aria-label="Does" /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-crit" aria-label="Never does" />}
              {t as string}
            </li>
          ))}
        </ul>
        <div className="reveal relative" style={d(120)}>
          <div className="pointer-events-none absolute -inset-4 rounded-2xl bg-steel-500/10 blur-2xl" aria-hidden />
          <div className="panel relative p-6 text-ink-200 shadow-2xl shadow-ink-900/30">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Bot className="h-4 w-4 text-steel-400" aria-hidden /> Ask about this facility
              <span className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">Sample data</span>
            </div>
            <p className="mt-5 ml-auto w-fit max-w-[85%] rounded-lg rounded-br-sm bg-steel-500/15 px-3 py-2 text-sm text-steel-100">Which tools need attention?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-ink-700 bg-ink-900 p-3 text-sm">
              <p>
                <span className="font-mono text-white">T-1204</span> on VMC-02: vibration band energy about 49% above its early-life baseline across comparable observations. The alert is open and unassigned.
              </p>
              <p className="mt-2">
                <span className="font-mono text-white">T-4102</span> on 5AX-04: acoustic peak count about 28% above baseline.
              </p>
              <p className="mt-3 font-mono text-[11px] text-ink-400">From records AL-1204, AL-4102</p>
            </div>
            <p className="mt-4 ml-auto w-fit rounded-lg rounded-br-sm bg-steel-500/15 px-3 py-2 text-sm text-steel-100">When will T-1204 fail?</p>
            <div className="mt-3 max-w-[92%] rounded-lg rounded-bl-sm border border-ink-700 bg-ink-900 p-3 text-sm text-ink-300">That needs a prediction the data can’t support. I can show how T-1204 differs from its baseline and what to check at the machine.</div>
            <Link to="/monitoring" className="btn-primary btn-sm mt-6">
              Try the assistant in the demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Section>
  )
}

export function SecuritySection() {
  return (
    <Section eyebrow="Safeguards" title="Data informs the decision. People make it.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SAFEGUARDS.map(([t, b], i) => (
          <div key={t} className="reveal lift spot rounded-xl border border-ink-700 bg-ink-850 p-6" style={d((i % 3) * 90)}>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-steel-500/10">
              <ShieldCheck className="h-5 w-5 text-steel-400" aria-hidden />
            </span>
            <h3 className="mt-4 font-medium text-white">{t}</h3>
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
    <Section light id="technology" eyebrow="Technology" title="How we use Amazon Web Services" intro="A proposed serverless architecture: capture at the machine, keep every number traceable, keep the analysis deterministic, and use Amazon Bedrock only to explain.">
      <ol className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="absolute left-0 right-0 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-steel-600/40 to-transparent xl:block" aria-hidden />
        {PIPELINE.map((p, i) => (
          <li key={p.step} className="reveal lift spot relative rounded-xl border border-ink-200 bg-white p-5" style={d(i * 90)}>
            <span className="font-mono text-xs text-steel-700">{p.step}</span>
            <h3 className="mt-2 font-semibold text-ink-950">{p.title}</h3>
            <p className="mt-1 font-mono text-[11px] text-steel-700">{p.services}</p>
            <p className="mt-3 text-sm text-ink-600">{p.body}</p>
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
    <Section id="pricing" eyebrow="Pricing" title="Simple plans that grow with your shop floor">
      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <div
            key={p.name}
            className={`reveal lift spot relative flex flex-col rounded-xl border p-6 ${p.featured ? 'border-steel-500 bg-gradient-to-b from-ink-850 to-navy-800 ring-1 ring-steel-500/40' : 'border-ink-700 bg-ink-900'}`}
            style={d(i * 100)}
          >
            {p.featured && <span className="absolute -top-3 left-6 rounded-full bg-steel-500 px-2.5 py-0.5 text-xs font-medium text-ink-950">Most popular</span>}
            <h3 className="text-lg font-medium text-white">{p.name}</h3>
            <p className="mt-1 text-sm text-ink-400">{p.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-semibold text-white">{p.price}</span>
              <span className="text-ink-400">{p.period}</span>
            </div>
            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
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
        Prices in USD, excluding taxes. Sensor hardware and installation are not included. Early-access teams are onboarded directly by the founders.{' '}
        <Link to="/pricing" className="text-steel-400 hover:text-steel-300">
          Compare plans
        </Link>
      </p>
    </Section>
  )
}

export const ROADMAP = [
  { icon: Sparkles, stage: 'Now', title: 'Live demo & early access', items: ['Interactive dashboard on simulated data', 'Baselines, condition gate and data-quality checks', 'Roles, audit log and grounded assistant', 'Early-access requests open'], current: true },
  { icon: Compass, stage: 'Next', title: 'Pilot on one cell', items: ['Connect one cell’s real data (MTConnect, OPC UA or CSV export)', 'Per-tool baselines on your own jobs', 'Alert and inspection workflow with email notifications'] },
  { icon: Rocket, stage: 'Then', title: 'General availability', items: ['Multiple cells and sites', 'Single sign-on with roles enforced on the server', 'Evidence summaries written with Amazon Bedrock', 'Scheduled reports'] },
  { icon: Clock, stage: 'Later', title: 'Exploring with pilot teams', items: ['Tool-management and ERP integrations', 'Mobile inspection capture with photos', 'Fleet-level comparisons across sites'] },
]

export function RoadmapSection() {
  return (
    <Section id="roadmap" light eyebrow="Roadmap" title="Where Wearinterval is going" intro="Built in the open with early-access teams. The order below is our plan and may change based on what pilots teach us.">
      <ol className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {ROADMAP.map((r, i) => (
          <li key={r.stage} className={`reveal lift relative rounded-xl border p-6 ${r.current ? 'border-steel-600 bg-white shadow-lg shadow-steel-700/10' : 'border-ink-200 bg-white'}`} style={d(i * 100)}>
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-lg ${r.current ? 'bg-steel-600 text-white' : 'bg-ink-100 text-ink-600'}`}>
                <r.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className={`flex items-center gap-2 font-mono text-xs uppercase tracking-wider ${r.current ? 'text-steel-700' : 'text-ink-500'}`}>
                {r.current && <span className="live-dot" aria-hidden />}
                {r.stage}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-ink-950">{r.title}</h3>
            <ul className="mt-3 space-y-2">
              {r.items.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-ink-600">
                  <Check className={`mt-0.5 h-4 w-4 shrink-0 ${r.current ? 'text-ok' : 'text-ink-300'}`} aria-hidden /> {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function PersonCard({ person, dark = false, delay = 0 }: { person: Person; dark?: boolean; delay?: number }) {
  return (
    <article className={`reveal lift spot relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${dark ? 'border-ink-700 bg-gradient-to-br from-ink-850 to-navy-800' : 'border-ink-200 bg-white'}`} style={d(delay)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center" aria-hidden>
          <div className="spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#4fb3d9,#226f8f,#9fd3e8,#4fb3d9)]" style={{ animationDelay: `-${delay / 10}s` }} />
          <div className={`absolute inset-[3px] grid place-items-center rounded-full font-mono text-2xl ${dark ? 'bg-ink-900 text-steel-300' : 'bg-white text-steel-700'}`}>{person.initials}</div>
        </div>
        <div>
          <p className={`label ${dark ? 'text-steel-400' : 'text-steel-700'}`}>{person.role}</p>
          <h3 className={`mt-1 text-2xl font-semibold ${dark ? 'text-white' : 'text-ink-950'}`}>{person.name}</h3>
          <p className={`mt-3 max-w-xl ${dark ? 'text-ink-300' : 'text-ink-600'}`}>{person.bio}</p>
          {person.email && (
            <a href={`mailto:${person.email}`} className={`mt-4 inline-flex items-center gap-1.5 text-sm ${dark ? 'text-steel-400 hover:text-steel-300' : 'text-steel-700 hover:text-steel-600'}`}>
              <Mail className="h-4 w-4" aria-hidden /> {person.email}
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/** The founding team, side by side. */
export function FoundersGrid({ dark = false }: { dark?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {FOUNDERS.map((p, i) => (
        <PersonCard key={p.name} person={p} dark={dark} delay={i * 120} />
      ))}
    </div>
  )
}

export function TeamSection() {
  return (
    <Section id="team" eyebrow="Team" title="The people building Wearinterval" intro="Founded by Seyi Bakare and Yusuf Abdulhamid, and built together with the machinists, tooling technicians and quality engineers who will use it.">
      <FoundersGrid dark />
      <div className="reveal mt-5 grid gap-6 rounded-2xl border border-ink-700 bg-ink-900 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <h3 className="text-lg font-medium text-white">Building with machinists</h3>
          <p className="mt-2 text-sm text-ink-400">Wearinterval is shaped by conversations on real shop floors. Early-access teams get a direct line to the founders and a say in what we build next.</p>
          <Link to="/about" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div>
          <p className="label">We’d like to hear from</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-300">
            {['Shops willing to pilot on one cell', 'Tooling and reliability engineers', 'Advisors who know CNC machining'].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

export const FAQS: [string, string][] = [
  ['Does Wearinterval predict when a tool will fail?', 'No. It compares recent observations with a baseline recorded under compatible conditions and tells you when a tool’s behaviour differs enough to be worth inspecting. A technician confirms the actual condition. We think honest evidence beats a confident guess.'],
  ['What problem does it actually solve?', 'Most shops change tools by part count, by the calendar, or after a bad part. That wastes good edges on some jobs and leaves worn ones in too long on others. Wearinterval shows which tools are behaving differently from their own history, so inspection time goes where it matters and every finding is recorded.'],
  ['Do we need new sensors?', 'Not necessarily. Many machines already produce useful controller data (spindle load, speed, feed). Where vibration or acoustic sensing is needed, it is sourced and installed separately; hardware is not included in the subscription.'],
  ['Which machines and controllers does it work with?', 'The pilot plan is to connect through MTConnect or OPC UA where available, or through CSV exports from an existing historian. We confirm what your machines can provide during the early-access conversation.'],
  ['What happens when the program or material changes?', 'Observations outside the speed, feed, engagement or coolant tolerances are excluded, and the comparison is withheld with the reason shown, rather than raising a false alert.'],
  ['What if a machine stops sending data?', 'The assessment is marked outdated or incomplete and is not shown as current. The telemetry page shows exactly which intervals are missing.'],
  ['Who can change what?', 'Managers, reliability engineers, technicians and viewers each get only the actions they need, and every change is written to an audit log. Try “Demo as” in the dashboard to see each role.'],
  ['What does the AI do?', 'It explains calculated results in plain language and answers questions from your own records, listing the records it used. It never supplies the numbers and never predicts failure.'],
  ['Where would our data be stored?', 'In the proposed design, on AWS with encryption at rest and in transit and per-customer isolation. Region options are discussed during a pilot.'],
  ['How much does it cost?', 'Single Cell is $99/month and Workshop is $299/month; Enterprise is priced per deployment. Prices exclude taxes, sensor hardware and installation.'],
  ['Is it available today?', 'Wearinterval is in early access. The demo dashboard runs in your browser on simulated data; a pilot connects one cell’s real data. Request early access and one of the founders will reply personally.'],
]

export function FaqSection() {
  return (
    <Section id="faq" light eyebrow="FAQ" title="Questions machining teams ask">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div className="reveal">
          <p className="text-ink-600">Can’t find your answer?</p>
          <a href="mailto:seyi@wearinterval.space" className="mt-2 inline-flex items-center gap-2 font-medium text-steel-700 hover:text-steel-600">
            <Mail className="h-4 w-4" aria-hidden /> Email the founders
          </a>
        </div>
        <div className="divide-y divide-ink-200 rounded-xl border border-ink-200 bg-white">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink-950">
                {q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink-200 text-steel-700 transition-transform duration-300 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}

export function EarlyAccessSection() {
  return (
    <Section id="early-access" eyebrow="Early access" title="Request early access" intro="Early-access teams get guided setup on one machining cell and a direct say in what we build next.">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <LeadForm compact />
        </div>
        <div className="space-y-5">
          <ul className="space-y-3 text-sm text-ink-200">
            {['Guided setup on one cell with the data you already have', 'Direct line to the founders', 'Launch pricing on Single Cell, Workshop or Enterprise', 'No commitment — a request is not a subscription'].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden /> {t}
              </li>
            ))}
            <li className="flex gap-2 text-ink-400">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Please don’t include confidential drawings or customer data.
            </li>
          </ul>
          <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
            <p className="label">What happens next</p>
            <ol className="mt-3 space-y-2 text-sm text-ink-300">
              <li>1. A founder replies to arrange a short call.</li>
              <li>2. We look at your machines, tools and the data you have.</li>
              <li>3. If it’s a fit, we scope a pilot on one cell.</li>
            </ol>
          </div>
        </div>
      </div>
    </Section>
  )
}
