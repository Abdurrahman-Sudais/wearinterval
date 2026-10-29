import { ArrowRight, BarChart3, BellRing, Bot, ClipboardList, FileText, Gauge, Library, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPreview } from '../components/DashboardPreview'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'

const MODULES = [
  { icon: Library, title: 'Tool & machine registry', body: 'Records for machines, cells and cutting tools, with grade, geometry, workpiece material and the operation each tool runs.', to: '/tool-monitoring' },
  { icon: BarChart3, title: 'Condition trends', body: 'Time-series charts of vibration and acoustic features against the selected baseline, with excluded observations shown.', to: '/analytics' },
  { icon: BellRing, title: 'Inspection alerts', body: 'Explains what changed, which observations were compared, under which conditions, and when they were recorded.', to: '/monitoring/inspections' },
  { icon: ClipboardList, title: 'Inspection workflow', body: 'Assign technicians, add notes, record results and resolve alerts. Every confirmed result is added to the tool’s history.', to: '/monitoring/inspections' },
  { icon: Gauge, title: 'Telemetry quality', body: 'Last received, completeness, missing intervals and outdated readings for each machine, so stale data isn’t mistaken for current data.', to: '/monitoring/telemetry' },
  { icon: Bot, title: 'Evidence summaries', body: 'Plain-language summaries of the available evidence, with suggested inspection questions. They describe the data and leave the judgement to your team.', to: '/analytics' },
  { icon: FileText, title: 'Reports', body: 'Exportable summaries of alerts, inspection outcomes and data quality by cell and period.', to: '/monitoring/reports' },
  { icon: ShieldCheck, title: 'Transparent rules', body: 'Thresholds, tolerances and baseline windows are visible and configurable. No hidden scoring.', to: '/monitoring/settings' },
]

export default function Product() {
  usePageMeta({ title: 'Product', description: 'The Wearinterval platform: tool records, baseline comparisons, inspection alerts, inspection workflow, telemetry quality and reports for CNC machining teams.', path: '/product' })
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="One place for tool condition, context and inspection evidence"
        actions={
          <Link to="/monitoring" className="btn-primary">
            Explore the Monitoring Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        Wearinterval sits between the data your machines already supply and the decisions your machining team makes about tools. It organises the evidence and keeps people responsible for the decisions.
      </PageHero>
      <Section title="Platform modules">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link key={m.title} to={m.to} className="group panel p-5 transition-colors hover:border-ink-500">
              <m.icon className="h-5 w-5 text-steel-400" aria-hidden />
              <h3 className="mt-4 font-medium text-white">{m.title}</h3>
              <p className="mt-2 text-sm text-ink-400">{m.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-steel-400 opacity-0 transition-opacity group-hover:opacity-100">
                View <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
      <Section light title="What Wearinterval is — and isn’t">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-ink-200 bg-white p-6">
            <h3 className="font-semibold text-ink-950">It is</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-700">
              <li>Software that analyses telemetry and condition data you supply.</li>
              <li>A way to compare observations with baselines under compatible conditions.</li>
              <li>A workflow that records human-confirmed inspection results.</li>
              <li>Clear about data quality, including stale and incomplete feeds.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-ink-200 bg-white p-6">
            <h3 className="font-semibold text-ink-950">It isn’t</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink-700">
              <li>Sensor hardware. Sensors and installation are not included.</li>
              <li>A validated failure-prediction model.</li>
              <li>A remaining-useful-life estimator.</li>
              <li>A replacement for your tooling engineers’ judgement.</li>
            </ul>
          </div>
        </div>
      </Section>
      <Section title="See it with sample data">
        <DashboardPreview />
      </Section>
      <FinalCta />
    </>
  )
}
