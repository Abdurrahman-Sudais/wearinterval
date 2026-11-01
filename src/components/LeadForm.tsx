import { CheckCircle2, Mail, Send } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { emptyLead, hubspotConfig, leadPayload, validateLead, type Lead } from '../lib/lead'

export const CONTACT_EMAIL = 'seyi@wearinterval.space'

const OPERATION_TYPES = ['CNC job shop', 'Precision-component manufacturer', 'Multi-cell / multi-site operation', 'OEM in-house machining', 'Other']
const MACHINE_BANDS = ['1–4', '5–20', '21–100', '100+']
const USE_CASES = ['Prioritising tool inspections', 'Reducing early tool changes', 'Catching tool problems before scrap', 'Telemetry data-quality visibility', 'Traceable inspection records', 'Not sure yet']
const PLANS = ['Single Cell', 'Workshop', 'Enterprise']

/**
 * Early-access form. With HubSpot configured it submits to the HubSpot Forms API; otherwise it keeps
 * the enquiry in this browser and offers a pre-filled email (the previous behaviour).
 */
export function LeadForm({ initialPlan = '', compact = false }: { initialPlan?: string; compact?: boolean }) {
  const hubspot = hubspotConfig()
  const [lead, setLead] = useState<Lead>(() => emptyLead(initialPlan))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<'hubspot' | 'local' | null>(null)
  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setLead((l) => ({ ...l, [k]: v }))

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Wearinterval early access${lead.company ? ` — ${lead.company}` : ''}`)}&body=${encodeURIComponent(
    `${lead.message}\n\nName: ${lead.name}\nCompany: ${lead.company}\nOperation: ${lead.companyType}\nCNC machines: ${lead.machines}\nUse case: ${lead.useCase}\nPlan: ${lead.plan}`,
  )}`

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (lead.website) return // honeypot: bots fill hidden fields
    const problem = validateLead(lead)
    if (problem) {
      setError(problem)
      return
    }
    if (!hubspot) {
      try {
        const prev = JSON.parse(localStorage.getItem('wearinterval.enquiries') ?? '[]')
        const { website: _hp, ...keep } = lead
        localStorage.setItem('wearinterval.enquiries', JSON.stringify([...prev, { ...keep, at: new Date().toISOString() }]))
      } catch {
        /* storage unavailable: the email link still works */
      }
      setSent('local')
      return
    }
    setBusy(true)
    try {
      const r = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(hubspot.portalId)}/${encodeURIComponent(hubspot.formGuid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload(lead, { pageUri: location.href.split('#')[0], pageName: document.title }, hubspot)),
      })
      if (!r.ok) throw new Error(String(r.status))
      setSent('hubspot')
    } catch {
      setError(`Sorry, that could not be sent. Please try again, or email ${CONTACT_EMAIL}.`)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="panel p-8" role="status">
        <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden />
        <h3 className="mt-4 text-xl font-medium text-white">Thanks{lead.name ? `, ${lead.name.split(' ')[0]}` : ''}.</h3>
        {sent === 'hubspot' ? (
          <p className="mt-2 text-ink-300">Your request has been received. We will reply by email to arrange a walkthrough on your own machines and data.</p>
        ) : (
          <>
            <p className="mt-2 text-ink-300">This site has no form backend configured yet, so your enquiry has been saved in this browser only. To send it, open it as an email:</p>
            <a href={mailto} className="btn-primary mt-6">
              <Mail className="h-4 w-4" /> Email {CONTACT_EMAIL}
            </a>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="panel grid gap-4 p-6 sm:grid-cols-2" noValidate aria-label="Request early access">
      <Field label="Name *" id="lead-name">
        <input id="lead-name" className="field" value={lead.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={100} />
      </Field>
      <Field label="Work email *" id="lead-email">
        <input id="lead-email" type="email" className="field" value={lead.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={200} />
      </Field>
      <Field label="Company *" id="lead-company">
        <input id="lead-company" className="field" value={lead.company} onChange={(e) => set('company', e.target.value)} autoComplete="organization" maxLength={150} />
      </Field>
      <Field label="Type of operation *" id="lead-type">
        <select id="lead-type" className="field" value={lead.companyType} onChange={(e) => set('companyType', e.target.value)}>
          <option value="">Select…</option>
          {OPERATION_TYPES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Number of CNC machines" id="lead-machines">
        <select id="lead-machines" className="field" value={lead.machines} onChange={(e) => set('machines', e.target.value)}>
          <option value="">Select…</option>
          {MACHINE_BANDS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Primary use case" id="lead-usecase">
        <select id="lead-usecase" className="field" value={lead.useCase} onChange={(e) => set('useCase', e.target.value)}>
          <option value="">Select…</option>
          {USE_CASES.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      {!compact && (
        <Field label="Plan of interest" id="lead-plan" wide>
          <select id="lead-plan" className="field" value={lead.plan} onChange={(e) => set('plan', e.target.value)}>
            <option value="">Not sure yet</option>
            {PLANS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </Field>
      )}
      <Field label="What would you like to monitor? *" id="lead-message" wide>
        <textarea id="lead-message" rows={compact ? 3 : 5} className="field" value={lead.message} onChange={(e) => set('message', e.target.value)} maxLength={2000} placeholder="Machines, materials, tools, and any telemetry you already collect. Please don’t include confidential drawings or customer data." />
      </Field>
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden>
        <label>
          Leave this field empty
          <input tabIndex={-1} autoComplete="off" value={lead.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>
      <div className="space-y-2 text-sm text-ink-300 sm:col-span-2">
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1 accent-[#4fb3d9]" checked={lead.consent} onChange={(e) => set('consent', e.target.checked)} />
          <span>I agree that Wearinterval may use these details to reply to this request. *</span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-1 accent-[#4fb3d9]" checked={lead.marketing} onChange={(e) => set('marketing', e.target.checked)} />
          <span>Also send me occasional product updates (optional).</span>
        </label>
      </div>
      {error && (
        <p role="alert" className="text-sm text-crit sm:col-span-2">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={busy}>
          <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Request early access'}
        </button>
        <p className="text-xs text-ink-400">
          {hubspot ? 'Submitting sends these details to Wearinterval’s customer-relationship system so we can reply.' : 'No form backend is configured: your enquiry is saved in this browser and offered as an email.'} See the{' '}
          <a href="/privacy" className="text-steel-400 hover:text-steel-300">
            privacy notice
          </a>
          .
        </p>
      </div>
    </form>
  )
}

function Field({ label, id, wide, children }: { label: string; id: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-ink-300">
        {label}
      </label>
      {children}
    </div>
  )
}
