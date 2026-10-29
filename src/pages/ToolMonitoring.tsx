import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InsertDrawing } from '../components/Illustrations'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'
import { FreshnessBadge, SimulatedTag, ToolStateBadge } from '../components/Status'
import { useDemo } from '../lib/store'

export default function ToolMonitoring() {
  usePageMeta({ title: 'Tool Monitoring', description: 'Track every cutting tool with its machine, operating conditions, baseline reference, latest observation, inspection history and condition status.', path: '/tool-monitoring' })
  const { assessments } = useDemo()
  return (
    <>
      <PageHero
        eyebrow="Tool monitoring"
        title="Every cutting tool, with its full context"
        actions={
          <Link to="/monitoring/tools" className="btn-primary">
            Browse sample tools <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        Condition status means little without the conditions behind it. Each Wearinterval tool record shows the machine, the workpiece, the cutting parameters and the inspection history next to its trend.
      </PageHero>

      <Section title="What a tool record holds">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-start">
          <dl className="grid gap-px overflow-hidden rounded-xl border border-ink-700 bg-ink-700 sm:grid-cols-2">
            {[
              ['Tool ID & type', 'Unique ID, tool type, diameter, flutes, pocket.'],
              ['Machine association', 'Machine, cell, controller and current machine status.'],
              ['Workpiece material', 'Material and condition, e.g. 304 stainless or Ti-6Al-4V.'],
              ['Tool material & grade', 'Substrate, grade and coating.'],
              ['Operating conditions', 'Spindle speed, feed, axial/radial engagement and coolant for the operation.'],
              ['Baseline reference', 'The observation window used for comparison and its conditions.'],
              ['Latest observation', 'Most recent feature values, with timestamp and data freshness.'],
              ['Inspection history', 'Every human-confirmed result, with notes and measured wear.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-ink-900 p-5">
                <dt className="font-medium text-white">{t}</dt>
                <dd className="mt-1 text-sm text-ink-400">{d}</dd>
              </div>
            ))}
          </dl>
          <div className="panel tech-grid p-6">
            <InsertDrawing className="mx-auto w-48" />
            <p className="mt-3 text-center text-xs text-ink-400">Inspection results include measured flank wear (VB) where recorded.</p>
          </div>
        </div>
      </Section>

      <Section light title="Condition status, stated carefully" intro="Status labels describe the relationship between data and baseline. They don’t predict anything.">
        <div className="overflow-x-auto rounded-lg border border-ink-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink-50 text-ink-600">
              <tr>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 text-ink-700">
              {[
                ['Within baseline', 'Recent comparable observations are close to the selected baseline.'],
                ['Review suggested', 'Recent comparable observations differ from the baseline beyond the configured rule. An inspection may be appropriate.'],
                ['Monitoring', 'A technician observed wear or asked for additional monitoring.'],
                ['Conditions changed', 'Recent operating conditions are outside tolerance of the baseline. No comparison is made.'],
                ['Data outdated / incomplete', 'Telemetry is late or missing, so the assessment is not presented as current.'],
                ['New tool — baseline pending', 'A replacement was recorded. A new baseline is needed before comparisons resume.'],
              ].map(([s, m]) => (
                <tr key={s}>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-ink-950">{s}</td>
                  <td className="px-4 py-3">{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Sample tools in the demo facility">
        <div className="mb-4">
          <SimulatedTag />
        </div>
        <div className="overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-ink-850 text-ink-400">
              <tr>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Machine</th>
                <th className="px-4 py-3 font-medium">Workpiece</th>
                <th className="px-4 py-3 font-medium">Telemetry</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800 bg-ink-900">
              {assessments.map((a) => (
                <tr key={a.tool.id}>
                  <td className="px-4 py-3">
                    <Link to={`/monitoring/tools/${a.tool.id}`} className="font-mono text-steel-400 hover:text-steel-300">
                      {a.tool.id}
                    </Link>
                    <div className="text-xs text-ink-400">{a.tool.type}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-ink-200">{a.machine.id}</td>
                  <td className="px-4 py-3 text-ink-300">{a.tool.workpieceMaterial}</td>
                  <td className="px-4 py-3">
                    <FreshnessBadge freshness={a.telemetry.freshness} ageHours={a.telemetry.ageHours} />
                  </td>
                  <td className="px-4 py-3">
                    <ToolStateBadge state={a.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <FinalCta />
    </>
  )
}
