import { ArrowRight, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'

export const PIPELINE = [
  { step: '01', title: 'Shop-floor capture', services: 'AWS IoT Greengrass · AWS IoT Core', body: 'An edge gateway reads controller data (MTConnect / OPC UA) and any vibration or acoustic sensors you already have, buffers through network drops, and publishes over MQTT with per-device certificates.' },
  { step: '02', title: 'Ingest and store', services: 'Amazon Kinesis · Amazon Timestream · Amazon S3', body: 'Readings stream into a time-series store with the cutting conditions attached. Raw segments are archived to S3 so every derived number can be traced back.' },
  { step: '03', title: 'Compare and assess', services: 'AWS Lambda · Amazon EventBridge', body: 'Deterministic jobs compute baselines, check condition comparability, measure data freshness and completeness, and open alerts using the rules you can see in Settings.' },
  { step: '04', title: 'Explain', services: 'Amazon Bedrock', body: 'Evidence summaries and the assistant are written from the calculated results and the records a user may see. The model never supplies numbers, and it never predicts failure.' },
  { step: '05', title: 'Review and record', services: 'Amazon RDS for PostgreSQL · Amazon Cognito · Amazon SES', body: 'Tools, alerts, inspections and the audit log live in PostgreSQL with per-customer isolation. Users sign in with roles; assignees get email notifications.' },
]

const SERVICES: [string, string][] = [
  ['AWS IoT Greengrass', 'Runs the edge connector next to the machines: protocol adapters, local buffering and secure upload.'],
  ['AWS IoT Core', 'Authenticates each gateway with its own certificate and receives telemetry over MQTT.'],
  ['Amazon Kinesis Data Streams', 'Decouples ingestion from processing so bursts from many machines do not drop readings.'],
  ['Amazon Timestream', 'Stores observations and their cutting conditions for fast time-window queries.'],
  ['Amazon S3', 'Archives raw signal segments, exports and reports with encryption and lifecycle rules.'],
  ['AWS Lambda', 'Feature extraction, baseline comparison, freshness checks and alert creation.'],
  ['Amazon EventBridge', 'Schedules assessments and data-quality checks; routes alert events to notifications.'],
  ['Amazon RDS for PostgreSQL', 'Tool registry, alerts, inspections, users and the append-only audit log, isolated per customer.'],
  ['Amazon Bedrock', 'Writes plain-language evidence summaries and assistant answers grounded in calculated results.'],
  ['Amazon Cognito', 'Sign-in, single sign-on and role groups (manager, engineer, technician, viewer).'],
  ['Amazon SES', 'Assignment and review notifications by email.'],
  ['Amazon CloudWatch', 'Monitoring and alarms for ingestion lag, failed jobs and gateway health.'],
]

export default function Technology() {
  usePageMeta({ title: 'Technology', description: 'How Wearinterval proposes to use AWS: edge capture with IoT Greengrass, time-series storage, deterministic comparison jobs, and Amazon Bedrock for grounded explanations.', path: '/technology' })
  return (
    <>
      <PageHero eyebrow="Technology" title="How we use Amazon Web Services">
        A proposed architecture for moving from this browser demo to a production service: capture data at the machine, keep every number traceable, keep the analysis deterministic, and use AI only to explain.
      </PageHero>

      <Section title="From the spindle to a recorded inspection" intro="Five stages. The first three are rules and storage; AI appears only in the fourth, and people decide in the fifth.">
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {PIPELINE.map((p) => (
            <li key={p.step} className="panel flex flex-col p-5">
              <span className="font-mono text-xs text-steel-400">{p.step}</span>
              <h3 className="mt-3 font-medium text-white">{p.title}</h3>
              <p className="mt-1 font-mono text-[11px] text-steel-300">{p.services}</p>
              <p className="mt-3 text-sm text-ink-300">{p.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex gap-3 rounded-lg border border-ink-700 bg-ink-900 p-4 text-sm text-ink-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-steel-400" aria-hidden />
          <p>
            <strong className="text-white">Proposed, not deployed.</strong> None of these services are connected to this website or the demo dashboard, which run entirely in your browser on simulated data. Website hosting is a separate choice from the product infrastructure.
          </p>
        </div>
      </Section>

      <Section light title="Services and what each one does">
        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(([name, body]) => (
            <div key={name} className="rounded-lg border border-ink-200 bg-white p-5">
              <dt className="font-semibold text-ink-950">{name}</dt>
              <dd className="mt-2 text-sm text-ink-600">{body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Design rules we hold ourselves to">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ['Rules decide status', 'Baselines, comparability and alert thresholds are deterministic and configurable. The same input always gives the same status.'],
            ['AI only explains', 'Bedrock turns calculated results into readable summaries. It is given numbers, not asked for them.'],
            ['Every number traceable', 'Derived values link back to raw segments in S3 and the rule version that produced them.'],
            ['Isolated by customer', 'Each customer’s data sits in its own partition, with role checks on every request and an audit trail.'],
          ].map(([t, b]) => (
            <div key={t} className="panel p-5">
              <h3 className="font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm text-ink-400">{b}</p>
            </div>
          ))}
        </div>
        <Link to="/security" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
          Security and safeguards <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
      <FinalCta />
    </>
  )
}
