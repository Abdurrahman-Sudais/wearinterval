import { ArrowRight, Building2, CalendarClock, ClipboardCheck, Cpu, Database, Factory, GitCompareArrows, Layers, ListChecks, Ruler, UserCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPreview } from '../components/DashboardPreview'
import { CellDrawing, EndMillDrawing } from '../components/Illustrations'
import { usePageMeta } from '../components/Seo'
import { FinalCta, Section } from '../components/SiteLayout'
import { AiSection, EarlyAccessSection, FaqSection, PricingSection, SecuritySection, TeamSection, TechnologySection } from './HomeSections'

export const STEPS = [
  { icon: Factory, title: 'Register machines and cutting tools', body: 'Create records for each machine, cell and tool — type, grade, workpiece material and pocket.' },
  { icon: Database, title: 'Add available telemetry and operating conditions', body: 'Bring in the vibration, acoustic and controller data you already collect, with spindle speed, feed and depth of cut.' },
  { icon: GitCompareArrows, title: 'Compare observations against suitable baselines', body: 'Recent observations are compared with a baseline recorded under compatible operating conditions.' },
  { icon: ClipboardCheck, title: 'Review alerts and record inspection results', body: 'Engineers review the evidence, technicians inspect the tool, and the confirmed result becomes part of its history.' },
]

export default function Home() {
  usePageMeta({
    title: 'Wearinterval — Know when a tool needs attention',
    description: 'Catch tool-condition changes before they become bigger problems. Bring tool histories, machining conditions and inspection results together to prioritise cutting-tool inspections.',
    path: '/',
  })

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800 bg-navy-900">
        <div className="tech-grid-fine absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Cutting-tool condition monitoring · CNC machining</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Catch tool-condition changes before they become bigger problems.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-300">
              Bring tool histories, machining conditions, and inspection results together to help your team prioritise cutting-tool inspections.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/monitoring" className="btn-primary">
                Explore the Monitoring Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/#early-access" className="btn-secondary">
                Request early access
              </Link>
            </div>
          </div>
          <div className="mt-14">
            <DashboardPreview />
            <p className="mt-3 text-center text-xs text-ink-500">Live preview of the demo dashboard. All machines, tools and readings are simulated.</p>
          </div>
        </div>
      </section>

      {/* A */}
      <Section light eyebrow="A · The problem" title="The problem with fixed replacement intervals" intro="A fixed schedule assumes every tool wears the same way. On the shop floor, conditions vary from job to job.">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Different materials', 'The same end mill behaves differently in 6061 aluminium and 304 stainless.'],
              ['Changing programs', 'Speed, feed and step-over edits change load on the cutting edge.'],
              ['Batch variation', 'Hardness, stock condition and fixturing differ between batches.'],
              ['Two kinds of cost', 'Replace too early and good edges are wasted. Too late, and you risk scrap, rework and spindle stress.'],
            ].map(([t, b]) => (
              <div key={t} className="rounded-lg border border-ink-200 bg-white p-5">
                <h3 className="font-semibold text-ink-950">{t}</h3>
                <p className="mt-2 text-sm text-ink-600">{b}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-ink-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
              <CalendarClock className="h-4 w-4 text-steel-700" /> Fixed interval vs. observed condition (illustrative)
            </div>
            <IntervalIllustration />
            <p className="mt-3 text-sm text-ink-600">
              Interval-based replacement can happen before or after the tool’s condition actually changes. Wearinterval doesn’t replace your schedule. It adds evidence so the team can decide when to inspect.
            </p>
          </div>
        </div>
      </Section>

      {/* B */}
      <Section eyebrow="B · Tool records" title="A connected history for every tool" intro="Each cutting tool has one record. It links the machine, the operation, the conditions it ran under, what was observed, and what technicians found.">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="panel tech-grid p-6">
            <EndMillDrawing className="w-full" />
          </div>
          <ul className="grid gap-3">
            {[
              [Wrench, 'Tool record', 'Type, diameter, flutes, tool material and grade, pocket, install date.'],
              [Cpu, 'Machine association', 'Which machine and cell the tool runs in, and that machine’s telemetry status.'],
              [Ruler, 'Operating conditions', 'Spindle speed, feed rate, axial and radial engagement, coolant.'],
              [Layers, 'Observations', 'Vibration and acoustic features from the data you supply, each with a timestamp.'],
              [UserCheck, 'Inspection results', 'Human-confirmed findings, measured flank wear and notes.'],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof Wrench
              return (
                <li key={t as string} className="flex gap-4 rounded-lg border border-ink-700 bg-ink-850 p-4">
                  <I className="mt-0.5 h-5 w-5 shrink-0 text-steel-400" aria-hidden />
                  <div>
                    <h3 className="font-medium text-white">{t as string}</h3>
                    <p className="mt-1 text-sm text-ink-400">{b as string}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </Section>

      {/* C */}
      <Section light eyebrow="C · Context" title="Understand changes in context" intro="A number on its own doesn’t tell you much. Wearinterval compares recent observations with a baseline recorded under compatible operating conditions, and says so when the two can’t be compared.">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Select an appropriate baseline', 'By default, the early life of the same tool on the same operation. Each comparison names the baseline it used.'],
            ['Check condition compatibility', 'Spindle speed, feed, engagement and coolant must be within tolerance. Observations outside tolerance are excluded and listed, not hidden.'],
            ['Describe the difference plainly', 'For example: “+49% vs. a 16-observation baseline, 12.5 baseline standard deviations.” No black-box scores.'],
          ].map(([t, b], i) => (
            <div key={t} className="rounded-lg border border-ink-200 bg-white p-6">
              <div className="font-mono text-xs text-steel-700">0{i + 1}</div>
              <h3 className="mt-2 font-semibold text-ink-950">{t}</h3>
              <p className="mt-2 text-sm text-ink-600">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-ink-600">
          A difference from baseline is a reason to look at the tool. It is not a prediction that the tool will fail, and Wearinterval doesn’t estimate remaining useful life.
        </p>
      </Section>

      {/* D */}
      <Section eyebrow="D · Workflow" title="From alert to inspection" intro="Alerts are the start of a review, not the end of one. Every step is recorded against the tool.">
        <ol className="grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 md:grid-cols-4">
          {[
            ['Alert opened', 'The system shows what changed, which observations were compared, the conditions, and when the data was recorded.'],
            ['Engineer reviews', 'Checks the evidence and data freshness, then assigns a technician.'],
            ['Technician inspects', 'Examines the tool at the machine and records a result: no visible issue, wear observed, replaced, and so on.'],
            ['History updated', 'The confirmed result is added to the tool’s history and shown on its trend chart.'],
          ].map(([t, b], i) => (
            <li key={t} className="bg-ink-900 p-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-steel-600 font-mono text-sm text-steel-400">{i + 1}</div>
              <h3 className="mt-4 font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm text-ink-400">{b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link to="/monitoring/inspections" className="btn-secondary">
            <ListChecks className="h-4 w-4" /> Try the inspection workflow
          </Link>
        </div>
      </Section>

      {/* E */}
      <Section light eyebrow="E · How it works" title="Four steps, using the data you already have">
        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-lg border border-ink-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-steel-700" aria-hidden />
                <span className="font-mono text-xs text-ink-400">STEP {i + 1}</span>
              </div>
              <h3 className="mt-4 font-semibold text-ink-950">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{s.body}</p>
            </li>
          ))}
        </ol>
        <Link to="/how-it-works" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-700 hover:text-steel-600">
          Read the full walkthrough <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>

      {/* F */}
      <Section eyebrow="F · Who it’s for" title="Designed for machining operations">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div className="grid gap-4">
            {[
              [Wrench, 'CNC job shops', 'Short runs and frequent changeovers, where tool behaviour varies with every job.'],
              [Ruler, 'Precision-component manufacturers', 'Tight tolerances and expensive materials such as titanium and stainless, where traceable inspection records matter.'],
              [Building2, 'Multi-cell machining operations', 'Several cells and shifts, with one consistent view of tool condition and data quality.'],
            ].map(([Icon, t, b]) => {
              const I = Icon as typeof Wrench
              return (
                <div key={t as string} className="flex gap-4 rounded-lg border border-ink-700 bg-ink-850 p-5">
                  <I className="mt-0.5 h-5 w-5 shrink-0 text-steel-400" aria-hidden />
                  <div>
                    <h3 className="font-medium text-white">{t as string}</h3>
                    <p className="mt-1 text-sm text-ink-400">{b as string}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="panel tech-grid p-6">
            <CellDrawing className="w-full" />
          </div>
        </div>
      </Section>

      <AiSection />
      <SecuritySection />
      <TechnologySection />
      <PricingSection />
      <TeamSection />
      <FaqSection />
      <EarlyAccessSection />
      <FinalCta />
    </>
  )
}

function IntervalIllustration() {
  // Schematic only — not data.
  const w = 520
  return (
    <svg viewBox={`0 0 ${w} 180`} className="mt-4 w-full" role="img" aria-label="Schematic: fixed replacement points compared with three tools whose condition changes at different times">
      <g className="stroke-ink-200" strokeWidth="1">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="20" x2={w - 10} y1={y} y2={y} />
        ))}
      </g>
      {[150, 300, 450].map((x) => (
        <g key={x}>
          <line x1={x} x2={x} y1="20" y2="165" className="stroke-ink-400" strokeDasharray="4 4" />
          <text x={x} y="178" textAnchor="middle" className="fill-ink-500 font-mono" fontSize="10">
            scheduled change
          </text>
        </g>
      ))}
      <path d="M20 150 C 80 148, 110 140, 130 120 S 145 60, 150 40" fill="none" className="stroke-steel-600" strokeWidth="2" />
      <path d="M150 150 C 230 148, 270 140, 290 132" fill="none" className="stroke-steel-600" strokeWidth="2" />
      <path d="M300 150 C 340 148, 360 120, 380 50" fill="none" className="stroke-steel-600" strokeWidth="2" />
      <circle cx="290" cy="132" r="4" className="fill-ok" />
      <text x="232" y="122" className="fill-ink-600" fontSize="10">replaced with life left</text>
      <circle cx="380" cy="50" r="4" className="fill-crit" />
      <text x="388" y="48" className="fill-ink-600" fontSize="10">changed before schedule</text>
      <text x="24" y="34" className="fill-ink-500 font-mono" fontSize="10">tool condition ↑</text>
    </svg>
  )
}
