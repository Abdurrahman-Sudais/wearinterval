import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'
import { STEPS } from './Home'

const DETAIL = [
  ['Machines are grouped into cells. Tools are linked to a machine and pocket, with their grade, geometry and the operation they run.', 'Import from a tool-management export or CSV (planned), or enter records directly.'],
  ['Wearinterval works with telemetry you already have or plan to collect: vibration and acoustic features, plus controller data such as spindle speed, feed and engagement.', 'Each machine has an expected reporting interval, so missing and late data can be detected.'],
  ['A baseline is a window of observations, by default the tool’s early life on the same operation. Recent observations are compared with it only when operating conditions are within tolerance.', 'Excluded observations are listed. When conditions change, the comparison is withheld rather than forced.'],
  ['Alerts explain the evidence. An engineer reviews it and assigns a technician, who inspects the tool and records what they found.', 'Human-confirmed results are added to the tool’s history and shown on its trend chart.'],
]

export default function HowItWorks() {
  usePageMeta({ title: 'How It Works', description: 'Register machines and cutting tools, add telemetry and operating conditions, compare observations against suitable baselines, then review alerts and record inspection results.', path: '/how-it-works' })
  return (
    <>
      <PageHero eyebrow="How it works" title="From supplied data to a recorded inspection">
        Four steps that fit the way machining teams already work: the data you have, a clear comparison, and a person who confirms what’s happening at the machine.
      </PageHero>
      <Section title="The four steps">
        <ol className="space-y-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="panel grid gap-4 p-6 md:grid-cols-[80px_1fr_1fr]">
              <div className="flex items-start gap-3 md:block">
                <div className="font-mono text-3xl text-steel-500">0{i + 1}</div>
                <s.icon className="h-6 w-6 text-ink-400 md:mt-3" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-ink-300">{DETAIL[i][0]}</p>
              </div>
              <p className="text-sm text-ink-400 md:border-l md:border-ink-700 md:pl-6">{DETAIL[i][1]}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section light title="Data you can bring" intro="Wearinterval is software only. It doesn’t include or install sensors.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Condition features', 'Vibration RMS and band energy, acoustic levels and burst counts, computed per cut segment.'],
            ['Machining context', 'Spindle speed, feed, depth and width of cut, coolant mode, program and operation.'],
            ['Inspection records', 'Technician findings, flank-wear measurements, replacement events and notes.'],
          ].map(([t, b]) => (
            <div key={t} className="rounded-lg border border-ink-200 bg-white p-6">
              <h3 className="font-semibold text-ink-950">{t}</h3>
              <p className="mt-2 text-sm text-ink-600">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-600">
          Integrations with controllers, gateways and data historians are scoped per deployment. In this demo, all data is simulated and no external systems are connected.
        </p>
      </Section>
      <FinalCta />
    </>
  )
}
