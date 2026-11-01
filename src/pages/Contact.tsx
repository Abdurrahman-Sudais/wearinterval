import { useSearchParams } from 'react-router-dom'
import { CONTACT_EMAIL, LeadForm } from '../components/LeadForm'
import { usePageMeta } from '../components/Seo'
import { PageHero, Section } from '../components/SiteLayout'

const EMAIL = CONTACT_EMAIL

export default function Contact() {
  usePageMeta({ title: 'Request early access', description: 'Request early access to Wearinterval or talk to us about a pilot on one machining cell. Email seyi@wearinterval.space.', path: '/contact' })
  const [params] = useSearchParams()

  return (
    <>
      <PageHero eyebrow="Early access" title="Talk to us about your machining cells">
        Tell us about your machines, materials and the data you already collect. Early-access teams get guided setup on one cell and a direct line to the people building Wearinterval. We’ll tell you honestly whether it’s a good fit.
      </PageHero>
      <Section title="Request early access">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <LeadForm initialPlan={params.get('plan') ?? ''} />
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
