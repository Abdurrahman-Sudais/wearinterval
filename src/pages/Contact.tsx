import { CheckCircle2, Mail } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'
import { PageHero, Section } from '../components/SiteLayout'

const EMAIL = 'seyi@wearinterval.space'

export default function Contact() {
  usePageMeta({ title: 'Contact', description: 'Contact Wearinterval about a pilot on your machining cell. Email seyi@wearinterval.space.', path: '/contact' })
  const [params] = useSearchParams()
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', machines: '', plan: params.get('plan') ?? '', message: '' })
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    // No backend: keep the enquiry locally and offer a pre-filled email.
    try {
      const prev = JSON.parse(localStorage.getItem('wearinterval.enquiries') ?? '[]')
      localStorage.setItem('wearinterval.enquiries', JSON.stringify([...prev, { ...form, at: new Date().toISOString() }]))
    } catch {
      /* ignore */
    }
    setSent(true)
  }

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(`Wearinterval enquiry${form.company ? ` — ${form.company}` : ''}`)}&body=${encodeURIComponent(
    `${form.message}\n\nName: ${form.name}\nCompany: ${form.company}\nMachines: ${form.machines}\nPlan: ${form.plan}`,
  )}`

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us about your machining cells">
        Tell us about your machines, materials and the data you already collect. We’ll tell you honestly whether Wearinterval is a good fit.
      </PageHero>
      <Section title="Send an enquiry">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {sent ? (
            <div className="panel p-8" role="status">
              <CheckCircle2 className="h-8 w-8 text-ok" aria-hidden />
              <h3 className="mt-4 text-xl font-medium text-white">Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}.</h3>
              <p className="mt-2 text-ink-300">This demo site has no form backend, so your enquiry has been saved in this browser only. To send it, open it as an email:</p>
              <a href={mailto} className="btn-primary mt-6">
                <Mail className="h-4 w-4" /> Email {EMAIL}
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="panel grid gap-4 p-6 sm:grid-cols-2" noValidate={false}>
              <Field label="Name" id="name">
                <input id="name" required className="field" value={form.name} onChange={set('name')} autoComplete="name" />
              </Field>
              <Field label="Company" id="company">
                <input id="company" required className="field" value={form.company} onChange={set('company')} autoComplete="organization" />
              </Field>
              <Field label="Work email" id="email">
                <input id="email" type="email" required className="field" value={form.email} onChange={set('email')} autoComplete="email" />
              </Field>
              <Field label="Number of CNC machines" id="machines">
                <select id="machines" className="field" value={form.machines} onChange={set('machines')}>
                  <option value="">Select…</option>
                  <option>1–4</option>
                  <option>5–20</option>
                  <option>21–100</option>
                  <option>100+</option>
                </select>
              </Field>
              <Field label="Plan of interest" id="plan" wide>
                <select id="plan" className="field" value={form.plan} onChange={set('plan')}>
                  <option value="">Not sure yet</option>
                  <option>Single Cell</option>
                  <option>Workshop</option>
                  <option>Enterprise</option>
                </select>
              </Field>
              <Field label="What would you like to monitor?" id="message" wide>
                <textarea id="message" rows={5} required className="field" value={form.message} onChange={set('message')} placeholder="Machines, materials, tools, and any telemetry you already collect." />
              </Field>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-primary">
                  Send enquiry
                </button>
              </div>
            </form>
          )}
          <aside className="space-y-6">
            <div>
              <h3 className="label">Email</h3>
              <a href={`mailto:${EMAIL}`} className="mt-2 inline-block font-mono text-steel-400 hover:text-steel-300">
                {EMAIL}
              </a>
            </div>
            <div>
              <h3 className="label">Founder</h3>
              <p className="mt-2 text-ink-200">Seyi Bakare</p>
            </div>
            <div>
              <h3 className="label">Web</h3>
              <p className="mt-2 font-mono text-ink-200">wearinterval.space</p>
            </div>
            <p className="text-sm text-ink-400">Wearinterval is software only. Sensor hardware and installation are not included.</p>
          </aside>
        </div>
      </Section>
    </>
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
