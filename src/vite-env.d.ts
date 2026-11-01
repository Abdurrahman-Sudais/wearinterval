/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional HubSpot form target for the early-access form. Public identifiers, not secrets. */
  readonly VITE_HUBSPOT_PORTAL_ID?: string
  readonly VITE_HUBSPOT_FORM_GUID?: string
  readonly VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID?: string
}
