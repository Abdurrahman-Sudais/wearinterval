/**
 * Early-access lead handling. HubSpot portal and form IDs are public identifiers (they appear in any
 * HubSpot embed), not secrets, so they can live in VITE_ variables. Leave them unset to keep the
 * current behaviour: the enquiry is saved in this browser and offered as a pre-filled email.
 * Field names match docs/crm-plan.md.
 */

export interface Lead {
  name: string
  email: string
  company: string
  companyType: string
  machines: string
  useCase: string
  plan: string
  message: string
  consent: boolean
  marketing: boolean
  /** Honeypot: hidden from people, filled by bots. */
  website: string
}

export const emptyLead = (plan = ''): Lead => ({ name: '', email: '', company: '', companyType: '', machines: '', useCase: '', plan, message: '', consent: false, marketing: false, website: '' })

export interface HubspotConfig {
  portalId: string
  formGuid: string
  marketingSubscriptionTypeId: string
}

export function hubspotConfig(env: Record<string, string | undefined> = import.meta.env ?? {}): HubspotConfig | null {
  const portalId = env.VITE_HUBSPOT_PORTAL_ID
  const formGuid = env.VITE_HUBSPOT_FORM_GUID
  if (!portalId || !formGuid) return null
  return { portalId, formGuid, marketingSubscriptionTypeId: env.VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID ?? '' }
}

/** Returns an error message, or '' when the lead can be sent. */
export function validateLead(l: Lead): string {
  if (!l.name.trim() || !l.company.trim()) return 'Please complete your name and company.'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(l.email.trim())) return 'Please enter a valid work email.'
  if (!l.companyType) return 'Please choose the type of operation.'
  if (!l.message.trim()) return 'Please tell us briefly what you would like to monitor.'
  if (!l.consent) return 'Please agree that we may use your details to reply.'
  return ''
}

/** HubSpot Forms API v3 payload. */
export function leadPayload(l: Lead, context: { pageUri: string; pageName: string }, config: Partial<HubspotConfig> = {}) {
  const [first, ...rest] = l.name.trim().split(/\s+/)
  const fields = (
    [
      ['firstname', first],
      ['lastname', rest.join(' ')],
      ['email', l.email.trim()],
      ['company', l.company.trim()],
      ['operation_type', l.companyType],
      ['cnc_machine_count', l.machines],
      ['primary_use_case', l.useCase],
      ['plan_of_interest', l.plan],
      ['monitoring_message', l.message.trim()],
    ] as const
  )
    .filter(([, v]) => v)
    .map(([name, value]) => ({ objectTypeId: '0-1', name, value }))
  return {
    fields,
    context,
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: 'I agree that Wearinterval may use these details to reply to this request.',
        communications:
          l.marketing && config.marketingSubscriptionTypeId
            ? [{ value: true, subscriptionTypeId: Number(config.marketingSubscriptionTypeId), text: 'Send me occasional product updates.' }]
            : [],
      },
    },
  }
}
