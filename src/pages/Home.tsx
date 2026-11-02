import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Database,
  ExternalLink,
  Factory,
  GitCompareArrows,
  ListChecks,
  Minus,
  PauseCircle,
  Ruler,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { DashboardPreview } from '../components/DashboardPreview'
import { CellDrawing, EndMillDrawing } from '../components/Illustrations'
import { usePageMeta } from '../components/Seo'
import { FinalCta, Section } from '../components/SiteLayout'
import { useCountUp, useCycle } from '../lib/motion'
import { AiSection, EarlyAccessSection, FaqSection, PricingSection, RoadmapSection, SecuritySection, TeamSection, TechnologySection } from './HomeSections'

const d = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export const STEPS = [
  { icon: Factory, title: 'Register machines and cutting tools', body: 'Create records for each machine, cell and tool — type, grade, workpiece material and pocket.' },
  { icon: Database, title: 'Add available telemetry and operating conditions', body: 'Bring in the vibration, acoustic and controller data you already collect, with spindle speed, feed and depth of cut.' },
  { icon: GitCompareArrows, title: 'Compare observations against suitable baselines', body: 'Recent observations are compared with a baseline recorded under compatible operating conditions.' },
  { icon: ClipboardCheck, title: 'Review alerts and record inspection results', body: 'Engineers review the evidence, technicians inspect the tool, and the confirmed result becomes part of its history.' },
]

/** Published figures used in the problem section. Each one links to its source. */
export const PROBLEM_STATS = [
  {
    value: 20,
    prefix: '~',
    suffix: '%',
    label: 'of machining downtime is attributed to cutting-tool failure.',
    source: 'Ghosh et al., MATEC Web of Conferences (ICEAST 2018), art. 01017',
    url: 'https://www.matec-conferences.org/articles/matecconf/abs/2018/51/matecconf_iceast2018_01017/matecconf_iceast2018_01017.html',
  },
  {
    value: 60,
    prefix: '50–',
    suffix: '%',
    label: 'of potential edge life was used before indexable inserts were replaced, in an analysis of 676 cutting edges.',
    source: 'TU Wien, reposiTUm 20.500.12708/204110',
    url: 'https://repositum.tuwien.at/handle/20.500.12708/204110',
  },
  {
    value: 11,
    prefix: '',
    suffix: '%',
    label: 'of annual revenue is lost to unplanned downtime at the world’s 500 largest companies — about $1.4 trillion.',
    source: 'Siemens, The True Cost of Downtime 2024',
    url: 'https://assets.new.siemens.com/siemens/assets/api/uuid:1b43afb5-2d07-47f7-9eb7-893fe7d0bc59/TCOD-2024_original.pdf',
  },
]

const OUTCOME_WORDS = ['scrapped parts', 'rework', 'broken tools', 'unplanned downtime'] as const

const BUILT_FOR = [
  'CNC job shops',
  'Aerospace brackets',
  'Medical implants',
  'Automotive housings',
  'Mould & die',
  'Hydraulic manifolds',
  'Energy fittings',
  'Titanium Ti-6Al-4V',
  'Inconel 718',
  '304 / 316 stainless',
  '6061 aluminium',
  '5-axis milling',
  'Turning cells',
  'Lights-out shifts',
]

export default function Home() {
  usePageMeta({
    title: 'Wearinterval — Know when a tool needs attention',
    description:
      'Cutting-tool condition monitoring for CNC machining teams. Compare each tool with its own baseline under compatible conditions, flag stale data, and prioritise inspections — without guessing at failure.',
    path: '/',
  })

  return (
    <>
      <Hero />
      <BuiltForMarquee />
      <ProblemSection />
      <SolutionSection />
      <PlatformSection />
      <ContextSection />
      <WorkflowSection />
      <HowItWorksSection />
      <WhoSection />
      <CompareSection />
      <AiSection />
      <SecuritySection />
      <TechnologySection />
      <PricingSection />
      <RoadmapSection />
      <TeamSection />
      <FaqSection />
      <EarlyAccessSection />
      <FinalCta />
    </>
  )
}

/* ───────────── Hero ───────────── */

function Hero() {
  const word = useCycle(OUTCOME_WORDS, 2400)
  return (
    <section className="relative overflow-hidden border-b border-ink-800 bg-navy-900">
      <div className="tech-grid-fine absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" aria-hidden />
      <div className="hero-glow pointer-events-none absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-steel-500/15 blur-3xl" aria-hidden />
      <div className="hero-glow pointer-events-none absolute -right-40 top-64 h-[26rem] w-[26rem] rounded-full bg-steel-600/10 blur-3xl" style={{ animationDelay: '-4s' }} aria-hidden />
      <HeroSignal />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="max-w-4xl">
          <Link
            to="/contact"
            className="reveal group inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/70 px-3 py-1.5 text-xs text-ink-200 backdrop-blur transition-colors hover:border-steel-600"
          >
            <span className="live-dot" aria-hidden />
            Early access open · pilots on one machining cell
            <ArrowRight className="h-3.5 w-3.5 text-steel-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <h1 className="reveal mt-6 text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[4.25rem]" style={d(80)}>
            Catch tool-condition changes before they become{' '}
            <span className="sr-only">scrapped parts, rework, broken tools or unplanned downtime.</span>
            <span aria-hidden className="block min-h-[1.1em]">
              <span key={word} className="word-in">
                <span className="text-shimmer">{word}.</span>
              </span>
            </span>
          </h1>
          <p className="reveal mt-6 max-w-2xl text-lg text-ink-300 sm:text-xl" style={d(160)}>
            Wearinterval compares every cutting tool with its own baseline — under the same speeds, feeds and coolant — so your team inspects the tools that need it, keeps the ones that don’t, and records what they found.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3" style={d(240)}>
            <Link to="/contact" className="btn-primary px-5 py-3 text-base">
              Request early access <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/monitoring" className="btn-secondary px-5 py-3 text-base">
              Explore the live demo
            </Link>
          </div>
          <ul className="reveal mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300" style={d(320)}>
            {['Uses the data you already collect', 'Every alert explained', 'Stale data never shown as current', 'People confirm tool condition'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-steel-400" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal relative mt-16" style={d(400)}>
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-6 rounded-3xl bg-gradient-to-b from-steel-500/10 to-transparent blur-2xl" aria-hidden />
          <div className="scan relative overflow-hidden rounded-xl">
            <DashboardPreview />
          </div>
          <FloatCard className="float -left-6 -top-10 hidden lg:flex" tone="warn" icon={<AlertTriangle className="h-4 w-4" />} title="Review suggested · T-1204" body="Vibration band energy +49.4% vs its own baseline" />
          <FloatCard className="float-slow -right-6 -top-20 hidden lg:flex" tone="stale" icon={<PauseCircle className="h-4 w-4" />} title="Comparison withheld · T-3105" body="Spindle speed +18% — conditions changed" />
          <FloatCard className="float -bottom-12 right-10 hidden lg:flex" tone="ok" icon={<CheckCircle2 className="h-4 w-4" />} title="Inspection recorded" body="Technician confirmed: no visible issue" style={{ animationDelay: '-2s' }} />
          <p className="mt-4 text-center text-xs text-ink-500">Live preview of the demo dashboard. All machines, tools and readings are simulated.</p>
        </div>
      </div>
    </section>
  )
}

function FloatCard({ className, tone, icon, title, body, style }: { className: string; tone: 'warn' | 'stale' | 'ok'; icon: ReactNode; title: string; body: string; style?: CSSProperties }) {
  const color = { warn: 'text-warn border-warn/30', stale: 'text-stale border-stale/30', ok: 'text-ok border-ok/30' }[tone]
  return (
    <div className={`absolute z-10 max-w-[17rem] items-start gap-3 rounded-lg border bg-ink-900/90 p-3 shadow-2xl shadow-black/50 backdrop-blur ${color} ${className}`} style={style} aria-hidden>
      <span className="mt-0.5">{icon}</span>
      <span>
        <span className="block text-xs font-medium text-white">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-300">{body}</span>
      </span>
    </div>
  )
}

/** A faint vibration trace drawn across the hero background. Decorative. */
function HeroSignal() {
  const pts: string[] = []
  for (let x = 0; x <= 1440; x += 8) {
    const grow = x > 1000 ? (x - 1000) / 440 : 0
    const y = 300 + Math.sin(x / 23) * (10 + grow * 40) + Math.sin(x / 7.3) * (4 + grow * 18)
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return (
    <svg className="draw pointer-events-none absolute inset-x-0 top-24 h-[420px] w-full opacity-40" viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sig" x1="0" x2="1">
          <stop offset="0" stopColor="#4fb3d9" stopOpacity="0" />
          <stop offset="0.6" stopColor="#4fb3d9" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e0a640" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <path className="trace" d={`M${pts.join(' L')}`} fill="none" stroke="url(#sig)" strokeWidth="1.5" style={{ '--len': 4000 } as CSSProperties} />
    </svg>
  )
}

function BuiltForMarquee() {
  const row = [...BUILT_FOR, ...BUILT_FOR]
  return (
    <section aria-label="Built for" className="marquee relative overflow-hidden border-b border-ink-800 bg-ink-950 py-6">
      <p className="mb-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">Built for machining teams working with</p>
      <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="marquee-track flex w-max gap-10">
          {row.map((t, i) => (
            <li key={i} aria-hidden={i >= BUILT_FOR.length} className="flex items-center gap-10 whitespace-nowrap text-lg font-medium text-ink-400">
              {t}
              <span className="h-1 w-1 rounded-full bg-ink-600" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ───────────── Problem & solution ───────────── */

function ProblemSection() {
  return (
    <Section
      id="problem"
      light
      eyebrow="The problem"
      title="Cutting tools are still changed by the calendar, by gut feel, or after a scrapped part."
      intro="A fixed schedule assumes every tool wears the same way. On a real shop floor the material, the program, the batch and the shift all change — and the cost lands on both sides: good edges thrown away early, and worn ones left in too long."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {PROBLEM_STATS.map((s, i) => (
          <Stat key={s.source} {...s} delay={i * 120} />
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-500">Published figures from third-party studies, linked above. They describe the industry, not Wearinterval results.</p>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['Different materials', 'The same end mill behaves differently in 6061 aluminium and 304 stainless.'],
            ['Changing programs', 'Speed, feed and step-over edits change the load on the cutting edge.'],
            ['Batch variation', 'Hardness, stock condition and fixturing differ between batches.'],
            ['Two kinds of cost', 'Too early and good edges are wasted. Too late and you risk scrap, rework and spindle stress.'],
          ].map(([t, b], i) => (
            <div key={t} className="reveal lift rounded-lg border border-ink-200 bg-white p-5 hover:border-steel-600/40" style={d(i * 80)}>
              <h3 className="font-semibold text-ink-950">{t}</h3>
              <p className="mt-2 text-sm text-ink-600">{b}</p>
            </div>
          ))}
        </div>
        <div className="reveal rounded-xl border border-ink-200 bg-white p-6 shadow-xl shadow-ink-900/5">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-900">
            <CalendarClock className="h-4 w-4 text-steel-700" /> Fixed interval vs. observed condition (illustrative)
          </div>
          <IntervalIllustration />
          <p className="mt-3 text-sm text-ink-600">
            Interval-based replacement happens before or after the tool’s condition actually changes. Wearinterval doesn’t replace your schedule — it adds evidence so the team can decide when to inspect.
          </p>
        </div>
      </div>
    </Section>
  )
}

function Stat({ value, prefix, suffix, label, source, url, delay }: (typeof PROBLEM_STATS)[number] & { delay: number }) {
  const [ref, n] = useCountUp<HTMLDivElement>(value)
  return (
    <figure className="reveal lift spot rounded-xl border border-ink-200 bg-white p-6" style={d(delay)}>
      <div ref={ref} className="font-mono text-5xl font-medium tracking-tight text-ink-950 tabular-nums">
        {prefix}
        {Math.round(n)}
        <span className="text-steel-700">{suffix}</span>
      </div>
      <figcaption>
        <p className="mt-3 text-ink-700">{label}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-steel-700">
          Source: {source} <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </figcaption>
    </figure>
  )
}

function SolutionSection() {
  const today = [
    'Tools are changed on a part count or the calendar, whether the edge is worn or not.',
    'Problems show up as chatter marks, an out-of-tolerance part or a broken tool — after the damage.',
    'Vibration and controller data is collected, but nobody compares it like-for-like across programs and materials.',
    'When a feed drops out, screens keep showing the last numbers as if they were current.',
    'What the technician found at the machine lives in a notebook, a chat thread, or nowhere.',
  ]
  const withWi = [
    'Each tool is compared with its own baseline, recorded under compatible cutting conditions.',
    'Unusual changes open an alert with the evidence: baseline, observations, rule and data freshness.',
    'A program, material or coolant change pauses the comparison and says why, instead of raising a false alarm.',
    'Delayed or incomplete telemetry is flagged on screen and never shown as current.',
    'Inspection results are recorded against the tool, by role, with a complete audit trail.',
  ]
  return (
    <Section id="solution" eyebrow="What we solve" title="From guesswork to evidence — without pretending to predict the future." intro="Wearinterval sits between the data your machines already produce and the people who decide when to pull a tool.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="reveal rounded-xl border border-ink-700 bg-ink-900 p-6 sm:p-8">
          <p className="label flex items-center gap-2">
            <X className="h-3.5 w-3.5 text-crit" aria-hidden /> Today
          </p>
          <ul className="mt-5 space-y-4">
            {today.map((t) => (
              <li key={t} className="flex gap-3 text-ink-300">
                <Minus className="mt-1 h-4 w-4 shrink-0 text-ink-500" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal spot relative overflow-hidden rounded-xl border border-steel-600/40 bg-gradient-to-br from-ink-850 to-navy-800 p-6 sm:p-8" style={d(120)}>
          <p className="label flex items-center gap-2 text-steel-300">
            <Check className="h-3.5 w-3.5 text-steel-400" aria-hidden /> With Wearinterval
          </p>
          <ul className="mt-5 space-y-4">
            {withWi.map((t) => (
              <li key={t} className="flex gap-3 text-ink-100">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-steel-400" aria-hidden /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}

/* ───────────── Platform ───────────── */

function PlatformSection() {
  return (
    <Section
      id="platform"
      light
      eyebrow="Platform"
      title="Six modules that follow a tool from the spindle to a recorded inspection."
      intro="Each module writes to the same tool record, so an observation, an alert and an inspection result show up everywhere they matter."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Module icon={Wrench} title="Tool & machine registry" body="One record per tool: type, diameter, flutes, grade, pocket, machine, cell and install date." why="Find any tool’s full story in seconds." delay={0}>
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-3">
            <EndMillDrawing className="w-full" />
          </div>
        </Module>
        <Module icon={GitCompareArrows} title="Baseline comparison" body="Recent observations are compared with the tool’s own early-life baseline, with the difference stated plainly." why="No black-box scores — just numbers you can check." delay={80}>
          <MiniTrend />
        </Module>
        <Module icon={Ruler} title="Condition gate" body="Speed, feed, engagement and coolant must match within tolerance before anything is compared." why="Fewer false alarms after a program change." delay={160}>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {['Speed ±5% ✓', 'Feed ±10% ✓', 'DOC ±10% ✓', 'Coolant ✓'].map((c) => (
              <span key={c} className="rounded-full border border-ok/40 bg-ok/10 px-2.5 py-1 text-[#2f7d5b]">
                {c}
              </span>
            ))}
            <span className="rounded-full border border-stale/40 bg-stale/10 px-2.5 py-1 text-[#6b55b8]">Speed +18% → withheld</span>
          </div>
        </Module>
        <Module icon={Activity} title="Data-quality watch" body="Freshness and completeness for every machine feed, with the missing intervals shown." why="Never act on numbers that stopped updating." delay={0}>
          <ul className="mt-5 space-y-2 font-mono text-xs">
            {[
              ['VMC-02', 'Current', 'bg-ok'],
              ['LTH-05', 'Outdated · 12 h', 'bg-stale'],
              ['LTH-06', 'Incomplete · 40%', 'bg-warn'],
            ].map(([m, s, c]) => (
              <li key={m} className="flex items-center justify-between rounded border border-ink-200 bg-white px-3 py-2 text-ink-700">
                {m}
                <span className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${c}`} /> {s}
                </span>
              </li>
            ))}
          </ul>
        </Module>
        <Module icon={ClipboardCheck} title="Inspection workflow" body="Assign, inspect, record and resolve. Results go into the tool’s history and onto its trend chart." why="A traceable record for every decision." delay={80}>
          <ol className="mt-5 flex items-center gap-1 text-[11px] font-medium">
            {['Open', 'Assigned', 'Inspected', 'Resolved'].map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-1">
                <span className={`flex-1 rounded px-2 py-1.5 text-center ${i < 3 ? 'bg-steel-700 text-white' : 'border border-ink-300 text-ink-500'}`}>{s}</span>
              </li>
            ))}
          </ol>
        </Module>
        <Module icon={Bot} title="Assistant, reports & audit" body="Ask in plain English, export CSV reports, and see who changed what — with roles for every person." why="Answers from your records, never guesses." delay={160}>
          <div className="mt-5 rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs text-ink-700">
            <p className="text-ink-500">“Which tools need attention?”</p>
            <p className="mt-1">
              <span className="font-mono text-ink-950">T-1204</span> on VMC-02: +49% vs baseline. Alert open, unassigned.
            </p>
            <p className="mt-1 font-mono text-[10px] text-ink-500">From records AL-1204, T-1204</p>
          </div>
        </Module>
      </div>
      <Link to="/product" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-700 hover:text-steel-600">
        Explore the platform <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  )
}

function Module({ icon: Icon, title, body, why, delay, wide, children }: { icon: typeof Wrench; title: string; body: string; why: string; delay: number; wide?: boolean; children?: ReactNode }) {
  return (
    <article className={`reveal lift spot flex flex-col rounded-xl border border-ink-200 bg-white p-6 ${wide ? 'lg:row-span-2' : ''}`} style={d(delay)}>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-steel-500/10 text-steel-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink-950">{title}</h3>
      <p className="mt-2 text-sm text-ink-600">{body}</p>
      <div className="flex-1">{children}</div>
      <p className="mt-5 border-t border-ink-100 pt-4 text-sm font-medium text-steel-700">{why}</p>
    </article>
  )
}

function MiniTrend() {
  const pts: string[] = []
  for (let i = 0; i <= 40; i++) {
    const rise = i > 28 ? (i - 28) * 2.4 : 0
    pts.push(`${i * 7},${(60 - Math.sin(i * 1.7) * 5 - rise).toFixed(1)}`)
  }
  return (
    <svg viewBox="0 0 280 80" className="draw mt-5 w-full" aria-hidden>
      <rect x="0" y="48" width="280" height="22" className="fill-steel-500/10" />
      <line x1="0" x2="280" y1="59" y2="59" className="stroke-ink-400" strokeDasharray="4 4" />
      <rect x="196" y="0" width="84" height="80" className="fill-warn/10" />
      <path className="trace stroke-steel-600" d={`M${pts.join(' L')}`} fill="none" strokeWidth="2" style={{ '--len': 600 } as CSSProperties} />
      <text x="4" y="76" className="fill-ink-500 font-mono" fontSize="8">
        baseline ±2σ
      </text>
      <text x="200" y="10" className="fill-[#9a6a12] font-mono" fontSize="8">
        +49% vs baseline
      </text>
    </svg>
  )
}

/* ───────────── Context, workflow, how it works ───────────── */

function ContextSection() {
  return (
    <Section eyebrow="Context" title="Understand changes in context" intro="A number on its own doesn’t tell you much. Wearinterval compares recent observations with a baseline recorded under compatible operating conditions — and says so when the two can’t be compared.">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['Select an appropriate baseline', 'By default, the early life of the same tool on the same operation. Each comparison names the baseline it used.'],
          ['Check condition compatibility', 'Spindle speed, feed, engagement and coolant must be within tolerance. Observations outside tolerance are excluded and listed, not hidden.'],
          ['Describe the difference plainly', 'For example: “+49% vs. a 16-observation baseline, 12.5 baseline standard deviations.” No black-box scores.'],
        ].map(([t, b], i) => (
          <div key={t} className="reveal lift spot rounded-xl border border-ink-700 bg-ink-900 p-6" style={d(i * 100)}>
            <div className="font-mono text-xs text-steel-400">0{i + 1}</div>
            <h3 className="mt-3 text-lg font-medium text-white">{t}</h3>
            <p className="mt-2 text-sm text-ink-400">{b}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-3xl text-sm text-ink-400">
        A difference from baseline is a reason to look at the tool. It is not a prediction that the tool will fail, and Wearinterval doesn’t estimate remaining useful life.
      </p>
    </Section>
  )
}

function WorkflowSection() {
  return (
    <Section light eyebrow="Workflow" title="From alert to inspection — every step on the record" intro="Alerts are the start of a review, not the end of one.">
      <ol className="relative grid gap-5 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-5 hidden h-px bg-gradient-to-r from-steel-600/0 via-steel-600/50 to-steel-600/0 md:block" aria-hidden />
        {[
          ['Alert opened', 'Shows what changed, which observations were compared, the conditions, and when the data was recorded.'],
          ['Engineer reviews', 'Checks the evidence and data freshness, then assigns a technician.'],
          ['Technician inspects', 'Examines the tool at the machine and records a result: no visible issue, wear observed, replaced…'],
          ['History updated', 'The confirmed result is added to the tool’s history and shown on its trend chart.'],
        ].map(([t, b], i) => (
          <li key={t} className="reveal relative" style={d(i * 120)}>
            <div className="relative z-10 grid h-10 w-10 place-items-center rounded-full border border-steel-600 bg-ink-50 font-mono text-sm text-steel-700">{i + 1}</div>
            <h3 className="mt-4 font-semibold text-ink-950">{t}</h3>
            <p className="mt-2 text-sm text-ink-600">{b}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10">
        <Link to="/monitoring/inspections" className="btn-primary">
          <ListChecks className="h-4 w-4" /> Try the inspection workflow
        </Link>
      </div>
    </Section>
  )
}

function HowItWorksSection() {
  return (
    <Section id="how" eyebrow="How it works" title="Four steps, using the data you already have">
      <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="reveal lift spot rounded-xl border border-ink-700 bg-ink-900 p-6" style={d(i * 100)}>
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-steel-500/10 text-steel-400">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-mono text-xs text-ink-500">STEP 0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-medium text-white">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-400">{s.body}</p>
          </li>
        ))}
      </ol>
      <Link to="/how-it-works" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
        Read the full walkthrough <ArrowRight className="h-4 w-4" />
      </Link>
    </Section>
  )
}

/* ───────────── Who it's for & comparison ───────────── */

const AUDIENCES = [
  { icon: Wrench, who: 'CNC job shops', profile: 'Short runs and frequent changeovers, where tool behaviour varies with every job.', how: 'Register tools per job and compare only like-for-like runs.', benefit: 'Fewer surprise tool failures without over-replacing good edges.' },
  { icon: ShieldCheck, who: 'Precision & regulated components', profile: 'Aerospace, medical and energy parts in titanium, Inconel and stainless.', how: 'Keep a traceable inspection record for every tool and batch.', benefit: 'Evidence ready for quality reviews and customer questions.' },
  { icon: Building2, who: 'Multi-cell, multi-shift operations', profile: 'Several cells and shifts sharing machines and tooling.', how: 'One queue of alerts across cells, assigned by role.', benefit: 'Consistent decisions from one shift to the next.' },
  { icon: Users, who: 'Reliability & tooling teams', profile: 'Engineers and technicians responsible for tool life and quality.', how: 'Tune rules, review evidence and watch data quality.', benefit: 'Inspection time goes where the data says it matters.' },
]

function WhoSection() {
  return (
    <Section id="who" light eyebrow="Who it’s for" title="Designed around how machining teams actually work.">
      <div className="grid gap-5 md:grid-cols-2">
        {AUDIENCES.map((a, i) => (
          <article key={a.who} className="reveal lift spot rounded-xl border border-ink-200 bg-white p-6" style={d((i % 2) * 100)}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-steel-500/10 text-steel-700">
                <a.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold text-ink-950">{a.who}</h3>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              {[
                ['Who', a.profile],
                ['How they use it', a.how],
                ['Benefit', a.benefit],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-ink-500">{k}</dt>
                  <dd className={`mt-1 ${k === 'Benefit' ? 'font-medium text-steel-700' : 'text-ink-600'}`}>{v}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <div className="reveal mt-10 grid gap-6 rounded-xl border border-ink-200 bg-white p-6 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <h3 className="text-lg font-semibold text-ink-950">Everyone on the floor gets the right view</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            {[
              ['Production managers', 'set the rules and read the audit log'],
              ['Reliability engineers', 'review evidence and assign inspections'],
              ['Tooling technicians', 'record what they find at the machine'],
              ['Planners', 'see tool status without changing it'],
            ].map(([r, t]) => (
              <li key={r}>
                <span className="font-medium text-ink-900">{r}</span> {t}.
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-ink-900 p-4">
          <CellDrawing className="w-full" />
        </div>
      </div>
    </Section>
  )
}

type Cell = { v: 'yes' | 'no' | 'part'; t: string }
const COMPARE: { row: string; cols: [Cell, Cell, Cell, Cell] }[] = [
  { row: 'Responds to how the tool is actually behaving', cols: [{ v: 'no', t: 'Time or part count' }, { v: 'no', t: 'Counts cycles or minutes' }, { v: 'part', t: 'Sound, chips, finish' }, { v: 'yes', t: 'Observations vs its own baseline' }] },
  { row: 'Accounts for program, material and coolant changes', cols: [{ v: 'no', t: 'Same interval for every job' }, { v: 'no', t: 'Per tool, not per condition' }, { v: 'part', t: 'Depends on who is on shift' }, { v: 'yes', t: 'Comparison paused, reason shown' }] },
  { row: 'Tells you when the data itself is missing or stale', cols: [{ v: 'no', t: 'Not applicable' }, { v: 'no', t: 'Not applicable' }, { v: 'no', t: 'Not applicable' }, { v: 'yes', t: 'Freshness & completeness per feed' }] },
  { row: 'Explains why a tool was flagged', cols: [{ v: 'part', t: '“It was due”' }, { v: 'part', t: '“Limit reached”' }, { v: 'part', t: 'Hard to hand over' }, { v: 'yes', t: 'Baseline, observations, rule' }] },
  { row: 'Keeps a record of what was found', cols: [{ v: 'no', t: 'Rarely' }, { v: 'no', t: 'Counter resets' }, { v: 'no', t: 'Notebook or memory' }, { v: 'yes', t: 'Every inspection, with audit trail' }] },
  { row: 'Works with data you already collect', cols: [{ v: 'yes', t: 'No data needed' }, { v: 'yes', t: 'Built into the control' }, { v: 'yes', t: 'No data needed' }, { v: 'yes', t: 'Controller and existing sensors' }] },
]

function CompareSection() {
  const heads = ['Fixed intervals', 'Controller tool-life counters', 'Operator judgement', 'Wearinterval']
  const Icon = ({ v }: { v: Cell['v'] }) =>
    v === 'yes' ? <Check className="h-4 w-4 shrink-0 text-ok" aria-label="Yes" /> : v === 'no' ? <X className="h-4 w-4 shrink-0 text-crit" aria-label="No" /> : <Minus className="h-4 w-4 shrink-0 text-warn" aria-label="Partly" />
  return (
    <Section id="compare" eyebrow="Why Wearinterval" title="How it compares with the ways shops decide today" intro="Wearinterval works alongside your schedule, your controller counters and your operators’ experience — it gives all three better evidence.">
      <div className="reveal overflow-x-auto rounded-xl border border-ink-700">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-700 bg-ink-900">
              <th className="p-4 font-normal text-ink-400">
                <span className="sr-only">Capability</span>
              </th>
              {heads.map((h, i) => (
                <th key={h} className={`p-4 font-medium ${i === 3 ? 'bg-steel-500/10 text-steel-300' : 'text-ink-200'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr key={r.row} className="border-b border-ink-800 last:border-0">
                <th scope="row" className="p-4 font-normal text-white">
                  {r.row}
                </th>
                {r.cols.map((c, i) => (
                  <td key={i} className={`p-4 align-top ${i === 3 ? 'bg-steel-500/5' : ''}`}>
                    <span className={`flex gap-2 ${i === 3 ? 'text-ink-100' : 'text-ink-400'}`}>
                      <Icon v={c.v} /> {c.t}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

/* ───────────── Illustration ───────────── */

function IntervalIllustration() {
  // Schematic only — not data.
  const w = 520
  return (
    <svg viewBox={`0 0 ${w} 180`} className="draw mt-4 w-full" role="img" aria-label="Schematic: fixed replacement points compared with three tools whose condition changes at different times">
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
      <path className="trace stroke-steel-600" d="M20 150 C 80 148, 110 140, 130 120 S 145 60, 150 40" fill="none" strokeWidth="2" style={{ '--len': 220 } as CSSProperties} />
      <path className="trace stroke-steel-600" d="M150 150 C 230 148, 270 140, 290 132" fill="none" strokeWidth="2" style={{ '--len': 160, '--d': '500ms' } as CSSProperties} />
      <path className="trace stroke-steel-600" d="M300 150 C 340 148, 360 120, 380 50" fill="none" strokeWidth="2" style={{ '--len': 160, '--d': '900ms' } as CSSProperties} />
      <circle cx="290" cy="132" r="4" className="fill-ok" />
      <text x="232" y="122" className="fill-ink-600" fontSize="10">
        replaced with life left
      </text>
      <circle cx="380" cy="50" r="4" className="fill-crit" />
      <text x="388" y="48" className="fill-ink-600" fontSize="10">
        worn before schedule
      </text>
      <text x="24" y="34" className="fill-ink-500 font-mono" fontSize="10">
        wear ↑
      </text>
    </svg>
  )
}
