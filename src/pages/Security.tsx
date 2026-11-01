import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'
import { FinalCta, PageHero, Section } from '../components/SiteLayout'

export const SAFEGUARDS: [string, string][] = [
  ['People confirm tool condition', 'An alert is a reason to inspect, never a verdict. Only a recorded inspection by a technician changes what the history says about a tool.'],
  ['No failure predictions', 'Wearinterval does not estimate remaining useful life or time to failure. The assistant refuses those questions and says why.'],
  ['Stale data is never “current”', 'Delayed or incomplete telemetry is flagged on screen and the assessment is withheld rather than shown with false confidence.'],
  ['Comparisons only like for like', 'Observations are compared only under compatible speed, feed, engagement and coolant. Changed conditions stop the comparison.'],
  ['Roles, enforced', 'Managers, engineers, technicians and viewers each get only the actions they need. The demo checks every action; production enforces it on the server.'],
  ['Everything audited', 'Assignments, notes, status changes, inspections and rule changes are written to an append-only audit log that managers can export.'],
]

const SECURITY: [string, string][] = [
  ['Encryption', 'TLS 1.2+ in transit; AWS KMS encryption at rest for databases, time-series data and archives.'],
  ['Device identity', 'Each shop-floor gateway authenticates with its own X.509 certificate; no shared passwords on the network.'],
  ['Customer isolation', 'Every record carries a customer identifier and is filtered on every query; cross-customer access is tested.'],
  ['Single sign-on', 'Sign in with your identity provider through Amazon Cognito, with multi-factor authentication for managers.'],
  ['Least privilege', 'Each service gets only the permissions it needs; no human uses root credentials.'],
  ['Data minimisation', 'Telemetry and tool records only. No personal data is sent to AI models; summaries reference tool and record IDs.'],
]

export default function Security() {
  usePageMeta({ title: 'Security & safeguards', description: 'How Wearinterval keeps people in charge of tool decisions: no failure predictions, stale data flagged, role-based access, an audit log, and the proposed security design.', path: '/security' })
  return (
    <>
      <PageHero eyebrow="Security & safeguards" title="Data informs the decision. People make it.">
        The demo already enforces the review safeguards below. The security controls describe the proposed production design.
      </PageHero>
      <Section title="Review safeguards" intro="Built into the demo you can try today.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAFEGUARDS.map(([t, b]) => (
            <div key={t} className="panel p-5">
              <Check className="h-5 w-5 text-steel-400" aria-hidden />
              <h3 className="mt-3 font-medium text-white">{t}</h3>
              <p className="mt-2 text-sm text-ink-400">{b}</p>
            </div>
          ))}
        </div>
        <Link to="/monitoring/audit" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-steel-400 hover:text-steel-300">
          See roles and the audit log in the demo <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
      <Section light title="Proposed security design">
        <dl className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map(([t, b]) => (
            <div key={t} className="rounded-lg border border-ink-200 bg-white p-5">
              <dt className="font-semibold text-ink-950">{t}</dt>
              <dd className="mt-2 text-sm text-ink-600">{b}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-3xl text-sm text-ink-600">
          These controls are part of the proposed architecture and are not yet independently audited or certified. Requirements for your industry and customers should be confirmed during a pilot.
        </p>
      </Section>
      <FinalCta />
    </>
  )
}
