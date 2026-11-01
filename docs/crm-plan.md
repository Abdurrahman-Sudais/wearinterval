# CRM plan: early-access leads

Status: **proposed**. The form works without a CRM: it saves in the browser and offers a pre-filled email.

## Where leads come from

| Source | Component | Notes |
|---|---|---|
| `/contact` | `LeadForm` | `?plan=` preselects a plan (pricing buttons link here) |
| Home `#early-access` | `LeadForm compact` | Same fields, without the plan selector |

## HubSpot set-up

1. Create a HubSpot form with the fields below. Create custom contact properties where marked *custom*.
2. Set `VITE_HUBSPOT_PORTAL_ID` and `VITE_HUBSPOT_FORM_GUID` (see `.env.example`). Rebuild.
3. Optional: create a "Product updates" subscription type and set `VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID`.
4. Update the privacy notice (`src/pages/Legal.tsx`) with the confirmed processor and retention period **before** going live.

| Form field | HubSpot property | Type |
|---|---|---|
| Name (first word) | `firstname` | standard |
| Name (rest) | `lastname` | standard |
| Work email | `email` | standard |
| Company | `company` | standard |
| Type of operation | `operation_type` | custom, dropdown |
| Number of CNC machines | `cnc_machine_count` | custom, dropdown (1–4, 5–20, 21–100, 100+) |
| Primary use case | `primary_use_case` | custom, dropdown |
| Plan of interest | `plan_of_interest` | custom, dropdown (Single Cell, Workshop, Enterprise) |
| What would you like to monitor? | `monitoring_message` | custom, multi-line text |
| Consent (required) | `legalConsentOptions.consent.consentToProcess` | sent as consent |
| Product updates (optional) | `communications[subscriptionTypeId]` | only when ticked and configured |

The hidden `website` field is a honeypot: if it is filled, nothing is sent. It is never included in the payload or the saved enquiry.

## Pipeline (suggested)

New request → Qualified (fit: CNC operation, ≥1 cell) → Walkthrough booked → Pilot scoped → Pilot live → Customer.
Owner: Seyi Bakare (seyi@wearinterval.space). Reply target: two working days.
