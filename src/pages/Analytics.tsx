import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AiPanel } from '../components/AiPanel'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'
import { SimulatedTag } from '../components/Status'
import { ChartLegend, TrendChart } from '../components/TrendChart'
import { DAY, DEMO_NOW } from '../data/facility'
import { FEATURE_BY_KEY } from '../data/simulate'
import { fmtPct } from '../lib/analysis'
import { useDemo } from '../lib/store'

export default function Analytics() {
  usePageMeta({ title: 'Analytics', description: 'Baseline comparisons under compatible operating conditions, condition-trend charts and evidence summaries for cutting-tool inspections.', path: '/analytics' })
  const { assessmentById, settings } = useDemo()
  const a = assessmentById['T-1204']
  const nc = assessmentById['T-3105']

  return (
    <>
      <PageHero eyebrow="Analytics" title="Baseline comparisons you can explain to the shop floor">
        Every comparison names its baseline, the observations it used, the operating conditions on both sides, and when the data was recorded.
      </PageHero>

      <Section title="A worked example: vibration band energy on T-1204" intro={<>Ø10 mm carbide end mill, side milling 304 stainless on VMC-02. <SimulatedTag className="ml-1 align-middle" /></>}>
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="panel p-5">
            <TrendChart assessment={a} feature="vibBand" settings={settings} from={DEMO_NOW - 9 * DAY} height={320} />
            <div className="mt-3">
              <ChartLegend />
            </div>
          </div>
          <div className="panel p-5">
            <h3 className="label">Comparison table</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Baseline versus recent comparable observation means for each feature</caption>
                <thead className="text-xs text-ink-400">
                  <tr>
                    <th className="py-2 pr-2 font-medium">Feature</th>
                    <th className="py-2 pr-2 text-right font-medium">Baseline</th>
                    <th className="py-2 pr-2 text-right font-medium">Recent</th>
                    <th className="py-2 text-right font-medium">Δ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800 font-mono text-ink-200">
                  {a.raw.deviations.map((d) => (
                    <tr key={d.key} className={d.flagged ? 'text-warn' : ''}>
                      <td className="py-2 pr-2 font-sans">{FEATURE_BY_KEY[d.key].shortLabel}</td>
                      <td className="py-2 pr-2 text-right">{d.baseline.mean.toFixed(3)}</td>
                      <td className="py-2 pr-2 text-right">{d.recent.mean.toFixed(3)}</td>
                      <td className="py-2 text-right">{fmtPct(d.pctChange)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Rule: recent mean ≥ {settings.zThreshold} baseline standard deviations and ≥ {settings.minPctChange}% above the baseline mean, with conditions within tolerance. You can change the rule in Settings.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <AiPanel assessment={a} autoGenerate />
        </div>
      </Section>

      <Section light title="When conditions change, the comparison stops" intro="Thread mill T-3105 shows higher vibration after a program revision raised spindle speed by about 18%. Because the conditions are outside tolerance, Wearinterval withholds the comparison and suggests establishing a new baseline.">
        <div className="rounded-xl border border-ink-700 bg-ink-900 p-5">
          <TrendChart assessment={nc} feature="vibRms" settings={settings} height={260} />
          <div className="mt-3">
            <ChartLegend />
          </div>
        </div>
      </Section>

      <Section title="What the analytics deliberately leave out">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            ['No failure predictions', 'A difference from baseline is presented as a reason to inspect, not a forecast.'],
            ['No remaining-useful-life numbers', 'RUL estimates need validated models for your tools, materials and machines. The demo doesn’t claim one.'],
            ['No hidden scores', 'Thresholds and tolerances are shown with every comparison and can be configured.'],
          ].map(([t, b]) => (
            <li key={t} className="panel p-5">
              <h3 className="font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm text-ink-400">{b}</p>
            </li>
          ))}
        </ul>
        <Link to="/monitoring/trends" className="btn-secondary mt-8">
          Open condition trends <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
      <FinalCta />
    </>
  )
}
