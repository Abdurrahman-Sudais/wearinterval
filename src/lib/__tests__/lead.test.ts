import { describe, expect, it } from 'vitest'
import { emptyLead, hubspotConfig, leadPayload, validateLead } from '../lead'

const valid = { ...emptyLead('Workshop'), name: 'Ada Lovelace', email: 'ada@example.com', company: 'Acme', companyType: 'CNC job shop', message: 'Two VMCs', consent: true }

describe('early-access lead', () => {
  it('accepts a complete lead and requires consent', () => {
    expect(validateLead(valid)).toBe('')
    expect(validateLead({ ...valid, consent: false })).not.toBe('')
    expect(validateLead({ ...valid, email: 'not-an-email' })).not.toBe('')
  })

  it('is only configured when portal and form ids are set', () => {
    expect(hubspotConfig({})).toBeNull()
    expect(hubspotConfig({ VITE_HUBSPOT_PORTAL_ID: '123', VITE_HUBSPOT_FORM_GUID: 'abc' })).not.toBeNull()
  })

  it('maps fields to HubSpot and never sends the honeypot', () => {
    const p = leadPayload({ ...valid, website: 'spam' }, { pageUri: 'https://wearinterval.space/contact', pageName: 'Contact' })
    const names = p.fields.map((f: { name: string }) => f.name)
    expect(names).toEqual(expect.arrayContaining(['firstname', 'lastname', 'email', 'company', 'plan_of_interest']))
    expect(JSON.stringify(p)).not.toContain('spam')
    expect(p.fields.find((f: { name: string }) => f.name === 'lastname')?.value).toBe('Lovelace')
  })
})
