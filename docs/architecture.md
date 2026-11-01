# Architecture

Two layers: what this repository runs today, and the proposed production service shown on `/technology`.

## Today: browser-only demo

- Vite + React SPA. All data is generated in the browser from a seeded simulation (`src/data/simulate.ts`), with the clock fixed at 27 Oct 2026 09:00 UTC.
- Calculations (`src/lib/analysis.ts`) are deterministic: baselines, condition comparability, telemetry freshness/completeness, alerts.
- Workflow state, the selected demo user and audit entries are stored in `localStorage` (`wearinterval.demo.v1`).
- No backend, no LLM, no AWS services are connected.

## Proposed production service (AWS)

| Stage | Services | Responsibility |
|---|---|---|
| 1. Shop-floor capture | AWS IoT Greengrass, AWS IoT Core | Edge gateway reads MTConnect / OPC UA and sensors, buffers through outages, publishes over MQTT with per-device X.509 certificates |
| 2. Ingest and store | Amazon Kinesis Data Streams, Amazon Timestream, Amazon S3 | Time-series observations with cutting conditions; raw segments archived for traceability |
| 3. Compare and assess | AWS Lambda, Amazon EventBridge | Scheduled deterministic jobs: baselines, comparability, freshness, alert creation (the same rules as `analysis.ts`) |
| 4. Explain | Amazon Bedrock | Phrases evidence summaries and assistant answers from calculated results. Never supplies numbers; never predicts failure |
| 5. Review and record | Amazon RDS for PostgreSQL, Amazon Cognito, Amazon SES | Tools, alerts, inspections, users and the audit log; sign-in and role groups; email notifications |
| Operations | Amazon CloudWatch, AWS KMS | Ingestion lag, job failures, gateway health; encryption at rest |

### Design rules

1. **Rules decide status.** The same input always yields the same status. AI is not in that path.
2. **AI only explains.** Bedrock receives numbers and record IDs, not raw personal data, and must cite the records it used.
3. **Every number traceable** to raw segments and the rule version that produced it.
4. **Isolated by customer.** Every row carries a customer ID; every query filters on it.

## Roles and permissions

Defined once in `src/lib/access.ts` and enforced in the demo store (`src/lib/store.tsx`). Every mutation calls `can(action)` first and returns `false`/`null` when refused; the UI disables the matching controls.

| Action | Manager | Engineer | Technician | Viewer |
|---|---|---|---|---|
| Assign alerts | ✓ | ✓ | | |
| Add notes | ✓ | ✓ | ✓ | |
| Mark reviewed | ✓ | ✓ | | |
| Resolve / reopen | ✓ | ✓ | | |
| Record inspections | ✓ | ✓ | ✓ | |
| Change analysis rules | ✓ | | | |
| Read and export audit log | ✓ | | | |

Resetting demo data is allowed for everyone, because it only clears the visitor's own browser.

In production these become Cognito groups, checked again in the API on every request. The client checks only shape the UI.

## Audit log

Append-only list of `{ id, at, userId, action, detail }`. Written for assignments, notes, status changes, inspections and rule changes. Consecutive changes to one rule by the same person are merged into one entry so slider drags do not flood the log. Managers can filter and export it as CSV. In production: an insert-only PostgreSQL table (no UPDATE/DELETE grants), with periodic export to S3 with Object Lock.

## Assistant grounding

`src/lib/assistant.ts` routes a question to one of a few intents and answers only from the current records:

| Intent | Example | Records cited |
|---|---|---|
| Refusal | "When will T-1204 fail?", "How much life is left?" | none: explains why the data cannot support it |
| Tool summary | "What happened to T-1204?" | the tool, its alert, its inspections |
| Machine summary | "What about VMC-02?" | the machine and its tools |
| Data problems | "Which machines have data problems?" | telemetry quality per machine |
| Recent inspections | "Show recent inspections" | inspection IDs |
| Attention | "Which tools need attention?" | open alerts and tools without a current assessment |
| Help | anything else | none: lists what it can answer |

The production assistant keeps the same routing and record retrieval, and gives Bedrock only the retrieved records to phrase. Answers that cite records not in the retrieved set are rejected.
