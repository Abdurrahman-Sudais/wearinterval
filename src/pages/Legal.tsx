import { usePageMeta } from '../components/Seo'
import { PageHero, Section } from '../components/SiteLayout'

const EMAIL = 'seyi@wearinterval.space'

const PRIVACY: [string, string][] = [
  ['What this website is', 'This website describes Wearinterval and includes an interactive demo dashboard that runs entirely in your browser on simulated data. No sensors, machines or customer systems are connected.'],
  ['Demo data in your browser', 'Assignments, notes, inspection results, analysis settings, the chosen demo user and the demo audit log are saved in your browser’s local storage under the key wearinterval.demo.v1. That data never leaves your device. “Reset demo data” in Settings, or clearing site data in your browser, removes it.'],
  ['Early-access requests', `Until a form service is configured, the early-access form saves your enquiry in your browser (key wearinterval.enquiries) and offers a pre-filled email to ${EMAIL}; nothing is sent until you send that email. If the operator connects the form to a customer-relationship service (proposed: HubSpot), submitting it sends the fields you enter, your consent choices and the page address to that service so Wearinterval can reply. Product updates are sent only if you tick the optional box. This notice must be updated with the confirmed service and retention before that is switched on.`],
  ['Analytics and cookies', 'This website includes no analytics or advertising trackers and sets no cookies. A hosting provider may process routine request data (such as IP address and browser details) to serve and protect the site.'],
  ['Your requests', `Contact ${EMAIL} with questions about information you have sent to Wearinterval, or to ask for it to be corrected or deleted.`],
]

const TERMS: [string, string][] = [
  ['Demonstration only', 'The monitoring dashboard is a demonstration on simulated data. It is not a production monitoring service and must not be used to make decisions about real tools, machines or parts.'],
  ['No predictions or guarantees', 'Wearinterval compares observations with baselines to help prioritise inspections. It does not predict tool failure, estimate remaining life, or guarantee part quality. Tool condition is confirmed by people.'],
  ['Pricing and availability', 'Prices shown are illustrative and exclude taxes. Sensor hardware and installation are not included. Early-access requests do not create a subscription or any commitment.'],
  ['Use of the site', 'Use the site and demo lawfully. Do not enter confidential drawings, customer data or personal information into the demo or the enquiry form.'],
  ['Changes', 'These terms are a review draft. Operator details, governing law and production service terms will be set out separately before launch.'],
]

export default function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy'
  usePageMeta({
    title: privacy ? 'Privacy notice' : 'Terms of use',
    description: privacy ? 'How the Wearinterval website and demo dashboard handle information.' : 'Terms for using the Wearinterval website and demonstration dashboard.',
    path: privacy ? '/privacy' : '/terms',
  })
  return (
    <>
      <PageHero eyebrow="Review draft · operator details to be confirmed" title={privacy ? 'Privacy notice' : 'Terms of use'}>
        {privacy ? 'How this website and its demo dashboard handle information.' : 'Terms for using this website and its demonstration dashboard.'}
      </PageHero>
      <Section title={privacy ? 'In short' : 'The terms'}>
        <div className="max-w-3xl space-y-8">
          {(privacy ? PRIVACY : TERMS).map(([t, b]) => (
            <div key={t}>
              <h3 className="text-lg font-medium text-white">{t}</h3>
              <p className="mt-2 text-ink-300">{b}</p>
            </div>
          ))}
          <p className="text-sm text-ink-400">
            Contact:{' '}
            <a href={`mailto:${EMAIL}`} className="text-steel-400 hover:text-steel-300">
              {EMAIL}
            </a>
          </p>
        </div>
      </Section>
    </>
  )
}
