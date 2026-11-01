# Wearinterval

**Know when a tool needs attention.**

Marketing website and interactive demo dashboard for Wearinterval, a cutting-tool condition-monitoring platform for CNC machining teams. Wearinterval helps teams compare cutting-tool observations against appropriate baselines, investigate unusual changes in supplied telemetry, and prioritise inspections.

- Domain: wearinterval.space
- Founder & CEO: Seyi Bakare · seyi@wearinterval.space
- Co-founder & CTO: Yusuf Abdulhamid

> All dashboard data is **simulated**. No sensors, telemetry APIs or AI services are connected. The AWS architecture on `/technology` is a proposal, not a deployment.

## Stack

Vite 6 · React 18 · TypeScript (strict) · Tailwind CSS 4 · React Router 6 · Recharts 2 · Lucide React

## Getting started

Requires Node.js 18+ (tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm test           # unit tests (Vitest): roles, assistant grounding/refusals, lead form, home content
```

Copy `.env.example` to `.env.local` to connect the early-access form to HubSpot (optional, see below).

## Deploying

`npm run build` produces a static site in `dist/`. It is a single-page application, so the host must serve `index.html` for unknown paths (deep links such as `/monitoring/tools/T-1204`). Ready-made configs are included:

| Host | Config | What it sets |
|---|---|---|
| Netlify / Cloudflare Pages | `public/_redirects`, `public/_headers` | SPA fallback, security headers, long-lived caching for hashed assets |
| Vercel | `vercel.json` | The same rewrites and headers |

Before going live:

1. Point `wearinterval.space` at the host and enable HTTPS (HSTS is set by the configs).
2. Optional: set the `VITE_HUBSPOT_*` variables (see `.env.example`) so early-access requests reach a CRM instead of only the visitor's browser and email.
3. Review the copy marked for confirmation below.

### Content to confirm before launch

- **Founders:** Seyi Bakare (Founder & CEO) and Yusuf Abdulhamid (Co-founder & CTO). Their bios live in `FOUNDERS` (`src/pages/HomeSections.tsx`). Add photos or LinkedIn links there if wanted.
- **Industry statistics** on the home page (`PROBLEM_STATS` in `src/pages/Home.tsx`) cite Siemens (2024), Ghosh et al. (MATEC 2018) and a TU Wien study. Check each figure against its linked source.
- **Roadmap, pricing and FAQ** describe plans, not commitments; keep them in step with what you offer.
- **Privacy notice and terms** (`src/pages/Legal.tsx`) are review drafts that need the operator's legal details.

## Design and motion

- Sections fade and rise into view as they scroll in (`src/lib/motion.ts`: one shared IntersectionObserver plus a scroll fallback so nothing stays hidden).
- The hero rotates its outcome word, draws a vibration trace, and floats evidence cards over the live dashboard preview. The "Built for" strip scrolls as a marquee, the problem statistics count up, and illustrations draw themselves.
- Cards lift on hover and pick up a spotlight that follows the pointer.
- With `prefers-reduced-motion`, everything is shown immediately and nothing moves.
- Every route except the home page is lazy-loaded, so the demo dashboard code only loads when someone opens it.

## Routes

| Path | Page |
|---|---|
| `/` | Home: hero with live dashboard preview, “Built for” marquee, the problem with sourced statistics (`#problem`), what we solve (`#solution`), six platform modules (`#platform`), context, workflow, how it works (`#how`), who it’s for (`#who`), comparison (`#compare`), AI, safeguards, AWS technology, pricing (`#pricing`), roadmap (`#roadmap`), team (`#team`), FAQ (`#faq`) and early-access form (`#early-access`) |
| `/about` | Founding team, story, mission, principles and roadmap |
| `/product`, `/tool-monitoring`, `/analytics`, `/how-it-works`, `/pricing` | Marketing pages |
| `/contact` | Early-access form (`?plan=Workshop` preselects a plan) |
| `/technology` | Proposed AWS architecture: pipeline, services, design rules |
| `/security` | Review safeguards enforced in the demo, and the proposed security design |
| `/privacy`, `/terms` | Privacy notice and terms of use (review drafts) |
| `/monitoring` | Dashboard overview |
| `/monitoring/machines` | Machines with status, last telemetry and associated tools |
| `/monitoring/tools`, `/monitoring/tools/:toolId` | Tool list (search and filters in the URL) and tool detail |
| `/monitoring/trends` | Condition trends across tools (feature, date range, cell filters) |
| `/monitoring/inspections`, `/monitoring/inspections/:alertId` | Inspection queue and alert workflow |
| `/monitoring/telemetry` | Telemetry quality: freshness, completeness, missing intervals |
| `/monitoring/reports` | Summaries with CSV export |
| `/monitoring/audit` | Roles × permissions matrix, demo people, audit log (managers only) with CSV export |
| `/monitoring/settings` | Analysis rules (managers only) and demo reset (anyone) |

## Project structure

```
src/
  data/          Sample data and simulation (no UI)
    types.ts       Domain types
    facility.ts    Cells, machines, tools, technicians, seeded inspections, demo clock
    simulate.ts    Deterministic observation generator (seeded RNG)
  lib/           Calculations and state (no UI)
    analysis.ts    Baselines, condition comparability, telemetry quality,
                   tool assessment, alerts, template-based explanations
    store.tsx      React context + localStorage persistence of workflow state,
                   permission checks and audit entries on every change
    access.ts      Demo users, roles, permission matrix, seeded audit log
    assistant.ts   Deterministic, record-grounded assistant (intent routing + refusals)
    lead.ts        Early-access lead validation and HubSpot payload mapping
    __tests__/     Vitest unit tests
  components/    Shared UI (layout, logo, charts, status badges, AI panel)
  pages/         Marketing pages
  monitoring/    Dashboard pages
```

## The demo scenario

The fictional facility has 3 cells, 6 machines and 11 tools. The demo clock is fixed at **27 Oct 2026 09:00 UTC** so the scenario can be reproduced.

| Tool | Scenario |
|---|---|
| T-1204 (VMC-02) | Vibration band energy rises about 49% above its early-life baseline under unchanged cutting conditions, which opens an alert |
| T-4102 (5AX-04) | Acoustic peak count rises about 28%, which opens a second alert |
| T-3105 (HMC-03) | A program revision raised spindle speed by about 18%, so the comparison is withheld ("Conditions changed") |
| T-5101 (LTH-05) | Machine offline, last data 12 h ago, so the assessment is flagged as outdated |
| T-6102 / T-6104 (LTH-06) | Intermittent feed (about 40% complete in 24 h), so the assessment is withheld as incomplete |

### Analysis rules (configurable in Settings)

- **Baseline:** observations from the tool's first N hours at its nominal spindle speed.
- **Comparability:** speed ±5%, feed ±10%, depth/width of cut ±10%, same coolant. Observations outside tolerance are excluded and listed.
- **Review suggested:** the mean of the latest 8 comparable observations must be at least 3σ *and* at least 15% above the baseline mean.
- **Freshness:** data older than 3 h is outdated. Below 70% completeness in 24 h, the data is incomplete. In both cases the assessment is not shown as current.

These are transparent demonstration rules. A deviation is presented as a reason to inspect, not as a prediction of failure. No remaining-useful-life estimates are made.

### Inspection workflow

Open an alert, review the supporting observations, assign a technician, add notes, record a result (no visible issue / wear observed / tool replaced / additional monitoring required / unable to determine), then mark the alert reviewed or resolved. Recorded results are added to the tool's history, appear as markers on its trend chart, and change its status. For example, "Tool replaced" sets the status to *New tool, baseline pending*. Workflow state is saved in `localStorage` (`wearinterval.demo.v1`). Use **Settings → Reset demo data** to clear it.

### Roles and audit log

Use **Demo as** in the dashboard header to switch between four fictional people:

| Person | Role | Can |
|---|---|---|
| Grace Holm | Production manager | Everything, including analysis rules and reading the audit log |
| Leah Park (default) | Reliability engineer | Assign, add notes, mark reviewed, resolve, record inspections |
| Amara Reid | Tooling technician | Add notes and record inspections |
| Tom Baker | Production planner | Read only |

Every change is checked against the matrix in `src/lib/access.ts` (the store refuses it, and the controls are disabled with an explanation) and written to an append-only audit log. Repeated slider changes to one rule are merged into one entry. In production the same checks belong on the server (see `docs/architecture.md`).

### Assistant

The **Ask about this facility** panel on the overview answers questions such as "Which tools need attention?", "Which machines have data problems?", "What happened to T-1204?" and "Show recent inspections" from the current demo records, and lists the records it used. Questions about failure timing or remaining life are refused with an explanation. No language model is called; the production design uses Amazon Bedrock only to phrase answers from calculated results.

### Early-access form

`/contact` and the home page share `LeadForm` (name, work email, company, type of operation, machine count, use case, plan, message, consent, optional updates, honeypot).

- **No configuration (default):** the enquiry is kept in `localStorage` (`wearinterval.enquiries`) and offered as a pre-filled email to seyi@wearinterval.space.
- **HubSpot:** set `VITE_HUBSPOT_PORTAL_ID` and `VITE_HUBSPOT_FORM_GUID` (and optionally `VITE_HUBSPOT_MARKETING_SUBSCRIPTION_ID`) to submit to the HubSpot Forms API. Field names are listed in `docs/crm-plan.md`. Update `/privacy` before switching it on.

## What is simulated

| Area | Status in this build |
|---|---|
| Telemetry, sensors, controller data | Simulated in the browser (`src/data/simulate.ts`). No hardware or gateways are connected |
| "AI" evidence summary and assistant | Deterministic templates over the calculations (`explainAssessment`, `assistant.ts`). It is not a trained or validated ML model, and no LLM or API is called |
| Persistence, users and roles | Browser `localStorage` only. "Demo as" switches fictional users; there is no backend, real authentication or multi-user sync |
| Early-access form | Saved in `localStorage` with a `mailto:` link, or sent to HubSpot when configured |
| AWS infrastructure | Proposed only (`/technology`, `docs/architecture.md`) |
| Reports | CSV is generated client-side |
| Imagery | Engineering-style SVG drawings stand in for machining photography. Add real photos under `public/images/` |

Integrations still to build for a production system: telemetry ingestion (OPC UA / MTConnect / historian), a backend API and database, server-side authentication and role enforcement, tool-management import, notifications, and a validated analytics pipeline.

## SEO

Per-route `<title>`, description, canonical and Open Graph tags (`usePageMeta`); Organization JSON-LD in `index.html`; `public/robots.txt` and `public/sitemap.xml`. The dashboard is a client-rendered SPA. Consider prerendering the marketing routes for production.

## Accessibility

Semantic landmarks and a skip link, labelled form controls, keyboard-reachable controls with visible focus, status shown with an icon and text (not colour alone), `role="alert"` on stale-data warnings, and tables alongside charts.
