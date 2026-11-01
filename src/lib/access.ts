/**
 * Demo roles and permissions. The store checks `can()` before every change and records an audit
 * entry; the UI uses the same check to disable controls. A production system enforces the same
 * matrix on the server (see docs/architecture.md).
 */

export type DemoRole = 'manager' | 'engineer' | 'technician' | 'viewer'

export type Action =
  | 'assign'
  | 'note'
  | 'review'
  | 'resolve'
  | 'inspect'
  | 'settings'
  | 'audit'

export interface DemoUser {
  id: string
  name: string
  title: string
  role: DemoRole
  /** Links a user to the technician list, so their inspections are attributed correctly. */
  technicianId?: string
}

/** Fictional people for the demo. Amara Reid also appears in the technician list. */
export const DEMO_USERS: DemoUser[] = [
  { id: 'u-leah', name: 'Leah Park', title: 'Reliability engineer', role: 'engineer' },
  { id: 'u-grace', name: 'Grace Holm', title: 'Production manager', role: 'manager' },
  { id: 'u-amara', name: 'Amara Reid', title: 'Tooling technician', role: 'technician', technicianId: 'tech-ar' },
  { id: 'u-tom', name: 'Tom Baker', title: 'Production planner', role: 'viewer' },
]

export const ROLE_LABEL: Record<DemoRole, string> = {
  manager: 'Production manager',
  engineer: 'Reliability engineer',
  technician: 'Tooling technician',
  viewer: 'Viewer',
}

const MATRIX: Record<DemoRole, Action[]> = {
  manager: ['assign', 'note', 'review', 'resolve', 'inspect', 'settings', 'audit'],
  engineer: ['assign', 'note', 'review', 'resolve', 'inspect'],
  technician: ['note', 'inspect'],
  viewer: [],
}

export const ACTION_LABEL: Record<Action, string> = {
  assign: 'Assign alerts to technicians',
  note: 'Add notes to alerts',
  review: 'Mark alerts reviewed',
  resolve: 'Resolve alerts',
  inspect: 'Record inspection results',
  settings: 'Change analysis rules',
  audit: 'View the audit log',
}

export const ACTIONS = Object.keys(ACTION_LABEL) as Action[]

export function can(role: DemoRole, action: Action): boolean {
  return MATRIX[role].includes(action)
}

export interface AuditEntry {
  id: number
  at: string
  userId: string
  action: string
  detail: string
}

/** A few historical entries so the audit log is not empty on first load (fictional). */
export const SEED_AUDIT: AuditEntry[] = [
  { id: 1, at: '2026-10-18T08:12:00Z', userId: 'u-grace', action: 'Analysis rules changed', detail: 'Minimum completeness set to 70%' },
  { id: 2, at: '2026-10-20T07:30:00Z', userId: 'u-leah', action: 'Alert resolved', detail: 'T-3101 · cause traced to coolant concentration (INS-1008)' },
  { id: 3, at: '2026-10-21T07:05:00Z', userId: 'u-amara', action: 'Inspection recorded', detail: 'T-1101 · No visible issue (INS-1012)' },
]

export const userName = (id: string) => DEMO_USERS.find((u) => u.id === id)?.name ?? id
