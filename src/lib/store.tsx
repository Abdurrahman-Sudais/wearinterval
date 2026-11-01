import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_NOW, MACHINES, SEED_INSPECTIONS, TECHNICIANS, TOOLS } from '../data/facility'
import type { AlertStatus, AlertWorkflowState, Inspection, InspectionResult } from '../data/types'
import {
  DEFAULT_SETTINGS,
  INSPECTION_RESULT_LABEL,
  assessTool,
  buildAlerts,
  telemetryQuality,
  type AnalysisSettings,
  type ConditionAlert,
  type TelemetryQuality,
  type ToolAssessment,
} from './analysis'
import { DEMO_USERS, SEED_AUDIT, can as roleCan, type Action, type AuditEntry, type DemoUser } from './access'

const STORAGE_KEY = 'wearinterval.demo.v1'

interface PersistedState {
  alertStates: Record<string, AlertWorkflowState>
  userInspections: Inspection[]
  settings: AnalysisSettings
  /** Minutes advanced on the demo clock by user actions, so new records sort after the seeded data. */
  clockMinutes: number
  /** Who the visitor is demoing as; every change is checked against this user's role. */
  userId: string
  /** Audit entries added in this browser (seed entries are prepended when read). */
  audit: AuditEntry[]
}

const initialState = (): PersistedState => ({ alertStates: {}, userInspections: [], settings: DEFAULT_SETTINGS, clockMinutes: 0, userId: DEMO_USERS[0].id, audit: [] })

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return { ...initialState(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } }
  } catch {
    return initialState()
  }
}

export interface RecordInspectionInput {
  toolId: string
  alertId?: string
  technicianId: string
  result: InspectionResult
  notes: string
  flankWearMm?: number
}

interface DemoStore {
  settings: AnalysisSettings
  assessments: ToolAssessment[]
  assessmentById: Record<string, ToolAssessment>
  telemetry: Record<string, TelemetryQuality>
  alerts: ConditionAlert[]
  alertState: (id: string) => AlertWorkflowState
  inspections: Inspection[]
  now: number
  user: DemoUser
  setUser: (userId: string) => void
  /** Whether the current demo user may perform an action. */
  can: (action: Action) => boolean
  auditLog: AuditEntry[]
  /** Each returns false (and changes nothing) when the current user lacks permission. */
  assign: (alertId: string, technicianId: string) => boolean
  addNote: (alertId: string, text: string) => boolean
  setStatus: (alertId: string, status: AlertStatus) => boolean
  recordInspection: (input: RecordInspectionInput) => Inspection | null
  updateSettings: (patch: Partial<AnalysisSettings>) => boolean
  resetDemo: () => boolean
}

const Ctx = createContext<DemoStore | null>(null)

const DEFAULT_ALERT_STATE: AlertWorkflowState = { status: 'open', activity: [] }

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: keep in-memory state */
    }
  }, [state])

  const inspections = useMemo(() => [...SEED_INSPECTIONS, ...state.userInspections], [state.userInspections])

  const telemetry = useMemo(
    () => Object.fromEntries(MACHINES.map((m) => [m.id, telemetryQuality(m, state.settings)])),
    [state.settings],
  )

  const assessments = useMemo(
    () => TOOLS.map((t) => assessTool(t, state.settings, inspections, state.alertStates, telemetry)),
    [state.settings, inspections, state.alertStates, telemetry],
  )
  const assessmentById = useMemo(() => Object.fromEntries(assessments.map((a) => [a.tool.id, a])), [assessments])
  const alerts = useMemo(() => buildAlerts(assessments), [assessments])

  const alertState = useCallback((id: string) => state.alertStates[id] ?? DEFAULT_ALERT_STATE, [state.alertStates])

  const user = DEMO_USERS.find((u) => u.id === state.userId) ?? DEMO_USERS[0]
  const can = useCallback((action: Action) => roleCan(user.role, action), [user.role])
  const auditLog = useMemo(() => [...SEED_AUDIT, ...state.audit], [state.audit])

  /** Append an audit entry at the current demo time (call inside setState updaters). */
  const withAudit = (prev: PersistedState, at: string, action: string, detail: string): AuditEntry[] => [
    ...prev.audit,
    { id: SEED_AUDIT.length + prev.audit.length + 1, at, userId: prev.userId, action, detail },
  ]
  const setUser = useCallback((userId: string) => setState((p) => ({ ...p, userId })), [])

  /** Apply a change to one alert, advance the demo clock by a minute and write an audit entry. */
  const mutateAlert = useCallback((alertId: string, action: string, detail: string, fn: (s: AlertWorkflowState, at: string) => AlertWorkflowState) => {
    setState((prev) => {
      const at = new Date(DEMO_NOW + (prev.clockMinutes + 1) * 60_000).toISOString()
      const current = prev.alertStates[alertId] ?? DEFAULT_ALERT_STATE
      return {
        ...prev,
        clockMinutes: prev.clockMinutes + 1,
        alertStates: { ...prev.alertStates, [alertId]: { ...fn(current, at), updatedAt: at } },
        audit: withAudit(prev, at, action, `${alertId} · ${detail}`),
      }
    })
  }, [])

  const assign = useCallback(
    (alertId: string, technicianId: string) => {
      if (!can('assign')) return false
      const tech = TECHNICIANS.find((t) => t.id === technicianId)
      mutateAlert(alertId, 'Alert assigned', tech?.name ?? technicianId, (s, at) => ({
        ...s,
        assigneeId: technicianId,
        status: s.status === 'open' ? 'assigned' : s.status,
        activity: [...s.activity, { at, kind: 'assigned', text: `Assigned to ${tech?.name ?? technicianId} by ${user.name}` }],
      }))
      return true
    },
    [mutateAlert, can, user.name],
  )

  const addNote = useCallback(
    (alertId: string, text: string) => {
      if (!can('note')) return false
      mutateAlert(alertId, 'Note added', text.slice(0, 80), (s, at) => ({ ...s, activity: [...s.activity, { at, kind: 'note', text: `${user.name}: ${text}` }] }))
      return true
    },
    [mutateAlert, can, user.name],
  )

  const setStatus = useCallback(
    (alertId: string, status: AlertStatus) => {
      if (!can(status === 'resolved' ? 'resolve' : 'review')) return false
      mutateAlert(alertId, status === 'resolved' ? 'Alert resolved' : `Alert marked ${status}`, `by ${user.name}`, (s, at) => ({
        ...s,
        status,
        activity: [...s.activity, { at, kind: 'status', text: `Marked as ${status} by ${user.name}` }],
      }))
      return true
    },
    [mutateAlert, can, user.name],
  )

  const recordInspection = useCallback((input: RecordInspectionInput) => {
    if (!can('inspect')) return null
    const clock = state.clockMinutes + 1
    const at = new Date(DEMO_NOW + clock * 60_000).toISOString()
    const inspection: Inspection = {
      id: `INS-U${String(state.userInspections.length + 1).padStart(3, '0')}`,
      toolId: input.toolId,
      alertId: input.alertId,
      inspectedAt: at,
      technicianId: input.technicianId,
      result: input.result,
      notes: input.notes,
      flankWearMm: input.flankWearMm,
      userRecorded: true,
    }
    setState((prev) => {
      const next: PersistedState = {
        ...prev,
        clockMinutes: clock,
        userInspections: [...prev.userInspections, inspection],
        audit: withAudit(prev, at, 'Inspection recorded', `${input.toolId} · ${INSPECTION_RESULT_LABEL[input.result]} (${inspection.id})`),
      }
      if (input.alertId) {
        const s = prev.alertStates[input.alertId] ?? DEFAULT_ALERT_STATE
        const tech = TECHNICIANS.find((t) => t.id === input.technicianId)
        next.alertStates = {
          ...prev.alertStates,
          [input.alertId]: {
            ...s,
            status: s.status === 'resolved' ? 'resolved' : 'reviewed',
            assigneeId: s.assigneeId ?? input.technicianId,
            inspectionId: inspection.id,
            updatedAt: at,
            activity: [...s.activity, { at, kind: 'inspection', text: `${tech?.name ?? 'Technician'} recorded: ${INSPECTION_RESULT_LABEL[input.result]}` }],
          },
        }
      }
      return next
    })
    return inspection
  }, [state.clockMinutes, state.userInspections.length, can])

  const updateSettings = useCallback(
    (patch: Partial<AnalysisSettings>) => {
      if (!can('settings')) return false
      setState((p) => {
        const at = new Date(DEMO_NOW + p.clockMinutes * 60_000).toISOString()
        const detail = Object.entries(patch).map(([k, v]) => `${k} = ${v}`).join(', ')
        // Dragging a slider fires many changes: keep one entry per rule and user, updated in place.
        const last = p.audit[p.audit.length - 1]
        const key = detail.split(' = ')[0]
        if (last && last.action === 'Analysis rules changed' && last.userId === p.userId && last.detail.split(' = ')[0] === key && !detail.includes(',')) {
          return { ...p, settings: { ...p.settings, ...patch }, audit: [...p.audit.slice(0, -1), { ...last, detail }] }
        }
        return { ...p, settings: { ...p.settings, ...patch }, audit: withAudit(p, at, 'Analysis rules changed', detail) }
      })
      return true
    },
    [can],
  )
  // Reset is demo housekeeping, available to every role; it keeps the current demo user.
  const resetDemo = useCallback(() => {
    setState((p) => ({ ...initialState(), userId: p.userId }))
    return true
  }, [])

  const value: DemoStore = {
    settings: state.settings,
    assessments,
    assessmentById,
    telemetry,
    alerts,
    alertState,
    inspections,
    now: DEMO_NOW + state.clockMinutes * 60_000,
    user,
    setUser,
    can,
    auditLog,
    assign,
    addNote,
    setStatus,
    recordInspection,
    updateSettings,
    resetDemo,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDemo() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDemo must be used within DemoStoreProvider')
  return v
}
