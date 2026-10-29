# Wearinterval

**Know when a tool needs attention.**

Marketing website and interactive demo dashboard for Wearinterval, a cutting-tool condition-monitoring platform for CNC machining teams. Wearinterval helps teams compare cutting-tool observations against appropriate baselines, investigate unusual changes in supplied telemetry, and prioritise inspections.

- Domain: wearinterval.space
- Founder: Seyi Bakare · seyi@wearinterval.space

> All dashboard data is **simulated**. No sensors, telemetry APIs or AI services are connected.

## Stack

Vite 6 · React 18 · TypeScript (strict) · Tailwind CSS 4 · React Router 6 · Recharts 2 · Lucide React

## Getting started

Requires Node.js 18+ (tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

The app is a single-page application. When deploying, configure the host to serve `index.html` for unknown paths (SPA fallback) so deep links such as `/monitoring/tools/T-1204` work.

## Routes

| Path | Page |
|---|---|
| `/` | Home: hero, live dashboard preview, sections A–G |
| `/product`, `/tool-monitoring`, `/analytics`, `/how-it-works`, `/pricing`, `/about`, `/contact` | Marketing pages |
| `/monitoring` | Dashboard overview |
| `/monitoring/machines` | Machines with status, last telemetry and associated tools |
| `/monitoring/tools`, `/monitoring/tools/:toolId` | Tool list (search and filters in the URL) and tool detail |
| `/monitoring/trends` | Condition trends across tools (feature, date range, cell filters) |
| `/monitoring/inspections`, `/monitoring/inspections/:alertId` | Inspection queue and alert workflow |
| `/monitoring/telemetry` | Telemetry quality: freshness, completeness, missing intervals |
| `/monitoring/reports` | Summaries with CSV export |
| `/monitoring/settings` | Analysis rules and demo reset |

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
    store.tsx      React context + localStorage persistence of workflow state
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

## What is simulated

| Area | Status in this build |
|---|---|
| Telemetry, sensors, controller data | Simulated in the browser (`src/data/simulate.ts`). No hardware or gateways are connected |
| "AI" evidence summary | Deterministic templates over the calculations (`explainAssessment`). It is not a trained or validated ML model, and no LLM or API is called |
| Persistence | Browser `localStorage` only. There is no backend, authentication or multi-user sync |
| Contact form | Saved in `localStorage`, with a pre-filled `mailto:` link. There is no form backend |
| Reports | CSV is generated client-side |
| Imagery | Engineering-style SVG drawings stand in for machining photography. Add real photos under `public/images/` |

Integrations still to build for a production system: telemetry ingestion (OPC UA / MTConnect / historian), a backend API and database, authentication and roles, tool-management import, notifications, and a validated analytics pipeline.

## SEO

Per-route `<title>`, description, canonical and Open Graph tags (`usePageMeta`); Organization JSON-LD in `index.html`; `public/robots.txt` and `public/sitemap.xml`. The dashboard is a client-rendered SPA. Consider prerendering the marketing routes for production.

## Accessibility

Semantic landmarks and a skip link, labelled form controls, keyboard-reachable controls with visible focus, status shown with an icon and text (not colour alone), `role="alert"` on stale-data warnings, and tables alongside charts.
